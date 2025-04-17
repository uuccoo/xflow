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
            <el-icon class="node-delete" @click.stop="$emit('delete', node, index)">
                <Delete />
            </el-icon>
        </div>

        <!-- 节点内容 - 根据节点类型渲染不同内容 -->
        <div class="node-content">
            <!-- 审批人节点 -->
            <div v-if="node.type === 'approver'" class="node-item" @click="$emit('select-approvers', node)">
                <span>{{ node.props.approvers?.length > 0 ? formatUserNames(node.props.approvers) : '请选择审批人' }}</span>
                <el-icon class="chevron-icon">
                    <ArrowRight />
                </el-icon>
            </div>

            <!-- 抄送人节点 -->
            <div v-else-if="node.type === 'copyTo'" class="node-item" @click="$emit('select-users', node)">
                <span>{{ node.props.users?.length > 0 ? formatUserNames(node.props.users) : '请选择抄送人' }}</span>
                <el-icon class="chevron-icon">
                    <ArrowRight />
                </el-icon>
            </div>

            <!-- 办理节点 -->
            <div v-else-if="node.type === 'process'" class="node-item" @click="$emit('select-processors', node)">
                <span>{{ node.props.processors?.length > 0 ? formatUserNames(node.props.processors) : '请选择办理人' }}</span>
                <el-icon class="chevron-icon">
                    <ArrowRight />
                </el-icon>
            </div>

            <!-- 默认内容 -->
            <div v-else class="node-item" @click="$emit('configure', node)">
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

defineEmits([
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

// 格式化用户名称
const formatUserNames = (users) => {
    if (!users || users.length === 0) return ''
    return users.map(user => user.name).join(', ')
}
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
.node-delete {
    color: #f56c6c;
    cursor: pointer;
    font-size: 16px;
    margin-left: 5px;
    opacity: 0;
    pointer-events: none;
    transition: opacity 0.2s ease-in-out, color 0.3s;
}

.flow-node:hover .node-delete {
    opacity: 1;
    pointer-events: auto;
}

.node-delete:hover {
    color: #ff4d4f;
}
</style>