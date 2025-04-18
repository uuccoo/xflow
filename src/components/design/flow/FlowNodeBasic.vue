<template>
    <div class="flow-node" :class="[node.type]" :style="nodeStyle">
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
            <div v-if="node.type === 'approver'" class="node-item" @click="selectApprovers">
                <span>{{ node.props.approvers?.length > 0 ? formatUserNames(node.props.approvers) : '请选择审批人' }}</span>
                <el-icon class="chevron-icon">
                    <ArrowRight />
                </el-icon>
            </div>

            <!-- 抄送人节点 -->
            <div v-else-if="node.type === 'copyTo'" class="node-item" @click="selectUsers">
                <span>{{ node.props.users?.length > 0 ? formatUserNames(node.props.users) : '请选择抄送人' }}</span>
                <el-icon class="chevron-icon">
                    <ArrowRight />
                </el-icon>
            </div>

            <!-- 办理节点 -->
            <div v-else-if="node.type === 'process'" class="node-item" @click="selectProcessors">
                <span>{{ node.props.processors?.length > 0 ? formatUserNames(node.props.processors) : '请选择办理人' }}</span>
                <el-icon class="chevron-icon">
                    <ArrowRight />
                </el-icon>
            </div>

            <!-- 默认内容 -->
            <div v-else class="node-item" @click="configureNode">
                <span>点击配置</span>
                <el-icon class="chevron-icon">
                    <ArrowRight />
                </el-icon>
            </div>
        </div>
    </div>
</template>

<script setup>
import { computed } from 'vue'
import { ArrowRight, Delete } from '@element-plus/icons-vue'
import { User, Document, Edit, Connection, Sort, TurnOff, Setting, Money } from '@element-plus/icons-vue'

const props = defineProps({
    node: {
        type: Object,
        required: true
    },
    index: {
        type: Number,
        required: true
    },
    nodeOptions: {
        type: Array,
        required: true
    }
})

const emit = defineEmits([
    'delete',
    'select-approvers',
    'select-users',
    'select-processors',
    'configure'
])

// 节点图标
const nodeIcon = computed(() => {
    const option = props.nodeOptions.find(option => option.type === props.node.type)
    return option ? option.icon : null
})

// 节点样式
const nodeStyle = computed(() => {
    const option = props.nodeOptions.find(option => option.type === props.node.type)
    return option ? { borderLeft: `3px solid ${option.color}` } : {}
})

// 节点头部样式
const nodeHeaderStyle = computed(() => {
    const option = props.nodeOptions.find(option => option.type === props.node.type)
    return option ? { backgroundColor: option.headerBg } : {}
})

// 删除当前节点
const deleteNode = () => {
    console.log('删除节点', props.node);
    emit('delete', props.node, props.index);
};

// 配置当前节点
const configureNode = () => {
    console.log('配置节点', props.node);
    emit('configure', props.node);
};

// 选择审批人（适用于审批节点）
const selectApprovers = () => {
    if (props.node.type === 'approver') {
        console.log('选择审批人', props.node);
        emit('select-approvers', props.node);
    }
};

// 选择抄送人（适用于抄送节点）
const selectUsers = () => {
    if (props.node.type === 'copyTo') {
        console.log('选择抄送人', props.node);
        emit('select-users', props.node);
    }
};

// 选择办理人（适用于办理节点）
const selectProcessors = () => {
    if (props.node.type === 'process') {
        console.log('选择办理人', props.node);
        emit('select-processors', props.node);
    }
};

// 根据节点类型获取操作列表
const getNodeActions = () => {
    const actions = [];

    // 基础操作-删除
    actions.push({
        name: '删除',
        icon: 'Delete',
        action: deleteNode
    });

    // 根据节点类型添加特定操作
    if (props.node.type === 'approver') {
        actions.push({
            name: '选择审批人',
            icon: 'User',
            action: selectApprovers
        });
    } else if (props.node.type === 'copyTo') {
        actions.push({
            name: '选择抄送人',
            icon: 'Document',
            action: selectUsers
        });
    } else if (props.node.type === 'process') {
        actions.push({
            name: '选择办理人',
            icon: 'Edit',
            action: selectProcessors
        });
    } else if (props.node.type === 'payment') {
        actions.push({
            name: '设置付款人',
            icon: 'Money',
            action: () => emit('configure', props.node)
        });
    }

    // 高级配置选项
    actions.push({
        name: '高级设置',
        icon: 'Setting',
        action: configureNode
    });

    return actions;
};

// 格式化人员名称列表显示
const formatUserNames = (users = []) => {
    if (!Array.isArray(users) || users.length === 0) {
        return '未设置';
    }
    return users.map(user => user.name).join(', ');
};
</script>

<style scoped lang="scss">
.flow-node {
    width: 220px;
    background-color: #fff;
    border-radius: 4px;
    border: 1px solid #e4e7ed;
    margin-bottom: 15px;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
    margin-left: auto;
    margin-right: auto;
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