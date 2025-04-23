<template>
    <div class="flow-node" :class="[node.type]" :style="nodeStyle" @click="handleNodeClick">
        <!-- 节点头部 -->
        <div class="node-header" :style="nodeHeaderStyle">
            <span class="node-icon">
                <el-icon>
                    <component :is="nodeIcon" />
                </el-icon>
            </span>
            <span class="node-title">{{ node.name }}</span>
            <el-icon class="node-delete" @click.stop="deleteNode">
                <Delete />
            </el-icon>
        </div>

        <!-- 节点内容 - 根据节点类型渲染不同内容 -->
        <div class="node-content">
            <!-- 审批人节点 -->
            <div v-if="node.type === 'approver'" class="node-item">
                <span>{{ node.props.approvers?.length > 0 ? formatUserNames(node.props.approvers) : '请选择审批人' }}</span>
                <el-icon class="chevron-icon">
                    <ArrowRight />
                </el-icon>
            </div>

            <!-- 抄送人节点 -->
            <div v-else-if="node.type === 'copyTo'" class="node-item">
                <span>{{ node.props.users?.length > 0 ? formatUserNames(node.props.users) : '请选择抄送人' }}</span>
                <el-icon class="chevron-icon">
                    <ArrowRight />
                </el-icon>
            </div>

            <!-- 办理节点 -->
            <div v-else-if="node.type === 'process'" class="node-item">
                <span>{{ node.props.processors?.length > 0 ? formatUserNames(node.props.processors) : '请选择办理人' }}</span>
                <el-icon class="chevron-icon">
                    <ArrowRight />
                </el-icon>
            </div>

            <!-- 默认内容 -->
            <div v-else class="node-item">
                <span>点击配置</span>
                <el-icon class="chevron-icon">
                    <ArrowRight />
                </el-icon>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ArrowRight, Delete } from '@element-plus/icons-vue'
import { computed } from 'vue'
import { useFlowDesignStore } from '../../../stores/flowDesignStore'

// 使用 Pinia store
const flowStore = useFlowDesignStore()

// 从 store 获取 nodeOptions
const nodeOptions = computed(() => flowStore.nodeOptions)

const props = defineProps({
    node: {
        type: Object,
        required: true
    },
    index: {
        type: Number,
        required: true
    },
    parentNode: {
        type: Object,
        default: null
    },
    branch: {
        type: Object,
        default: null
    }
})

// 节点图标
const nodeIcon = computed(() => {
    const option = nodeOptions.value.find(option => option.type === props.node.type)
    return option ? option.icon : null
})

// 节点样式
const nodeStyle = computed(() => {
    const option = nodeOptions.value.find(option => option.type === props.node.type)
    return option ? { borderLeft: `3px solid ${option.color}` } : {}
})

// 节点头部样式
const nodeHeaderStyle = computed(() => {
    const option = nodeOptions.value.find(option => option.type === props.node.type)
    return option ? { backgroundColor: option.headerBg } : {}
})

// 点击节点，选中并显示抽屉层
const handleNodeClick = () => {
    // 调用store的selectNode方法
    flowStore.selectNode(props.node, props.index, props.branch);
}

// 删除当前节点
const deleteNode = () => {
    console.log('删除节点', props.node);
    // 使用分支对象进行节点删除
    flowStore.deleteNode(props.node, props.index, props.branch);
};

// 格式化人员名称列表显示
const formatUserNames = (users = []) => {
    if (!Array.isArray(users) || users.length === 0) {
        return '未设置';
    }
    return flowStore.formatUserNames(users);
};
</script>

<style scoped lang="scss">
.flow-node {
    width: 220px;
    background-color: #fff;
    border-radius: 4px;
    border: 1px solid #e4e7ed;
    margin-bottom: 0;
    /* 移除下边距 */
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
    margin-left: auto;
    margin-right: auto;
    cursor: pointer;
    /* 添加指针样式表示可点击 */
    transition: box-shadow 0.3s;
    /* 添加过渡效果 */

    &:hover {
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
        /* 鼠标悬停时增强阴影效果 */
    }
}

.node-header {
    position: relative;
    /* 添加相对定位 */
    display: flex;
    align-items: center;
    padding: 8px 12px;
    border-bottom: 1px solid #e4e7ed;
    background-color: #f5f7fa;
    border-radius: 4px 4px 0 0;

    .node-icon {
        margin-right: 5px;
        color: #606266;
    }

    .node-title {
        flex-grow: 1;
        font-size: 14px;
        color: #303133;
        font-weight: 500;
    }

    /* 删除图标样式 */
    .node-delete {
        position: absolute;
        /* 绝对定位 */
        top: 8px;
        /* 距离顶部距离 */
        right: 8px;
        /* 距离右侧距离 */
        color: #f56c6c;
        cursor: pointer;
        font-size: 16px;
        visibility: hidden;
        opacity: 0;
        transition: visibility 0s, opacity 0.2s ease-in-out;
        z-index: 2;
    }
}

.node-content {
    padding: 10px 12px;

    .node-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        color: #606266;
        font-size: 14px;
        cursor: pointer;

        .chevron-icon {
            color: #c0c4cc;
        }
    }
}

/* 删除图标样式 */
.flow-node:hover .node-delete {
    visibility: visible;
    opacity: 1;
}

.node-delete:hover {
    color: #ff4d4f;
}
</style>