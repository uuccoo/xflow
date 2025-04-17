<template>
    <div class="flow-branch-container">
        <!-- 条件分支顶部按钮 -->
        <div class="condition-add-btn">
            <el-button size="small" type="primary" plain round @click="$emit('add-condition', node)">添加条件</el-button>
            <el-button v-if="showDeleteBtn" size="small" type="danger" plain round icon="Delete"
                @click="$emit('delete', node, index)" />
        </div>

        <!-- 条件分支内容 -->
        <div class="flow-branch">
            <div class="branch-item" v-for="(condition, condIndex) in node.props.conditions" :key="condIndex">
                <!-- 条件项头部 -->
                <div class="flow-node condition-branch">
                    <div class="branch-header">
                        {{ condition.name }}
                        <span class="priority-tag">优先级{{ condition.priority }}</span>
                        <!-- 删除条件按钮 -->
                        <el-icon v-if="node.props.conditions.length > 2" class="condition-delete"
                            @click="$emit('delete-condition', node, condIndex)">
                            <Delete />
                        </el-icon>
                    </div>

                    <!-- 条件内容 -->
                    <div class="node-content condition-content"
                        @click="$emit('edit-condition', node, condIndex, condition)">
                        <span v-if="condition.name === '默认条件'">其他条件进入此流程</span>
                        <span v-else>{{ condition.expression || '请设置条件' }}</span>
                        <el-icon class="chevron-icon">
                            <Edit />
                        </el-icon>
                    </div>
                </div>

                <!-- 条件分支内的节点列表 -->
                <div class="branch-nodes" v-if="condition.nodes && condition.nodes.length > 0">
                    <!-- 递归渲染嵌套的条件分支节点 -->
                    <template v-for="(branchNode, nodeIdx) in condition.nodes" :key="branchNode.id">
                        <!-- 嵌套的条件分支节点 -->
                        <flow-node-condition v-if="branchNode.type === 'condition'" :node="branchNode"
                            :index="`${index}-${condIndex}-${nodeIdx}`" :nodeOptions="nodeOptions" :showDeleteBtn="true"
                            @delete="$emit('delete', $event, nodeIdx, `${index}-${condIndex}-${nodeIdx}`)"
                            @delete-condition="$emit('delete-condition', $event, $event2)"
                            @add-condition="$emit('add-condition', $event)"
                            @edit-condition="$emit('edit-condition', $event, $event2, $event3)"
                            @select-approvers="$emit('select-approvers', $event)"
                            @select-users="$emit('select-users', $event)"
                            @select-processors="$emit('select-processors', $event)"
                            @configure="$emit('configure', $event)">
                            <!-- 传递嵌套条件分支的添加按钮 -->
                            <template v-slot="{ condition: nestedCondition, condIndex: nestedCondIndex }">
                                <node-add-button :position="`${index}-${condIndex}-${nodeIdx}-${nestedCondIndex}`"
                                    :nodeOptions="nodeOptions" :visible="false"
                                    @add="payload => handleNestedAdd(payload, branchNode, nestedCondition)" />
                            </template>
                        </flow-node-condition>

                        <!-- 普通节点 -->
                        <flow-node-basic v-else :node="branchNode" :index="nodeIdx" :node-options="nodeOptions"
                            @delete="handleDeleteBranchNode(node, condIndex, nodeIdx)"
                            @select-approvers="$emit('select-approvers', $event)"
                            @select-users="$emit('select-users', $event)"
                            @select-processors="$emit('select-processors', $event)"
                            @configure="$emit('configure', $event)" />
                    </template>
                </div>

                <!-- 为每个条件分支添加节点按钮 -->
                <slot :condition="condition" :cond-index="condIndex"></slot>
            </div>
        </div>
    </div>
</template>

<script setup>
import { Delete, Edit } from '@element-plus/icons-vue'
import FlowNodeBasic from './FlowNodeBasic.vue'
import NodeAddButton from '../NodeAddButton.vue'
import { getCurrentInstance } from 'vue'

// 递归引用当前组件
const props = defineProps({
    node: {
        type: Object,
        required: true
    },
    index: {
        type: [Number, String],
        required: true
    },
    nodeOptions: {
        type: Array,
        required: true
    },
    showDeleteBtn: {
        type: Boolean,
        default: true
    }
})

const emit = defineEmits([
    'delete',
    'delete-condition',
    'add-condition',
    'edit-condition',
    'select-approvers',
    'select-users',
    'select-processors',
    'configure'
])

// 处理删除分支内节点
const handleDeleteBranchNode = (parentNode, condIndex, nodeIdx) => {
    // 传递一个特殊的路径标识，表示这是条件分支内的节点
    const parentPath = `${props.index}-${condIndex}-${nodeIdx}`
    emit('delete', parentNode.props.conditions[condIndex].nodes[nodeIdx], nodeIdx, parentPath)
}

// 处理嵌套条件分支内的添加操作
const handleNestedAdd = (payload, parentNode, condition) => {
    const { type, position } = payload

    // 创建新节点
    const nodeId = Date.now()
    const newNode = {
        id: nodeId,
        type: type,
        name: props.nodeOptions.find(option => option.type === type)?.label || '未知节点',
        props: {}
    }

    // 根据节点类型设置初始属性
    if (type === 'condition') {
        newNode.isNested = true
        newNode.props = {
            conditions: [
                {
                    name: '条件1',
                    expression: '',
                    priority: 1,
                    nodes: []
                },
                {
                    name: '默认条件',
                    expression: '其他条件进入此流程',
                    priority: 2,
                    nodes: []
                }
            ]
        }
    } else if (type === 'approver') {
        newNode.props = { approvers: [], mode: 'anyone' }
    } else if (type === 'copyTo') {
        newNode.props = { users: [] }
    } else if (type === 'process') {
        newNode.props = { processors: [], mode: 'sequential' }
    }

    // 添加到嵌套条件分支的节点数组中
    condition.nodes.push(newNode)

    console.log('在嵌套条件分支中添加节点:', newNode)
}
</script>

<style scoped lang="scss">
/* 分支容器样式 */
.flow-branch-container {
    width: 100%;
    margin-bottom: 15px;
    position: relative;
}

/* 条件分支顶部按钮样式 */
.condition-add-btn {
    display: flex;
    justify-content: center;
    gap: 10px;
    margin: 10px 0 20px;

    .el-button {
        background-color: white;
        font-size: 13px;
        padding: 8px 20px;
        height: auto;
    }
}

/* 分支样式 */
.flow-branch {
    width: 100%;
    display: flex;
    gap: 30px;
    position: relative;
    padding: 30px 0 0;
    margin-bottom: 15px;

    /* 分支上方连接线 */
    &::before {
        content: '';
        position: absolute;
        top: 0;
        left: 50%;
        height: 15px;
        border-left: 1px dashed #c0c4cc;
        transform: translateX(-50%);
    }

    /* 分支顶部横线 */
    &::after {
        content: '';
        position: absolute;
        top: 15px;
        left: 20%;
        width: 60%;
        border-top: 1px dashed #c0c4cc;
    }

    .branch-item {
        flex: 1;
        display: flex;
        flex-direction: column;
        align-items: center;
        position: relative;

        /* 分支顶部竖线 */
        &::before {
            content: '';
            position: absolute;
            top: -15px;
            left: 50%;
            height: 15px;
            border-left: 1px dashed #c0c4cc;
        }
    }
}

.branch-header {
    display: flex;
    align-items: center;
    padding: 4px 12px;
    border-radius: 15px;
    font-size: 13px;
    color: #333;
    margin-bottom: 0;
    background-color: white;
    border: 1px solid #e4e7ed;
    z-index: 1;
    position: relative;

    .priority-tag {
        margin-left: 5px;
        color: #909399;
        font-size: 12px;
        font-weight: normal;
    }

    .condition-delete {
        margin-left: 8px;
        color: #f56c6c;
        cursor: pointer;
        font-size: 14px;
        opacity: 0;
        transition: opacity 0.3s;
    }

    &:hover .condition-delete {
        opacity: 1;
    }
}

.condition-branch {
    width: 100%;
    margin-bottom: 10px;
    border: 1px solid #e4e7ed;
    border-radius: 4px;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
    background-color: white;
    border-left: 3px solid #f56c6c;

    .condition-content {
        padding: 14px 16px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        color: #909399;
        font-size: 14px;
        cursor: pointer;

        &:hover {
            background-color: #f5f7fa;
        }

        .chevron-icon {
            color: #c0c4cc;
        }
    }
}

.branch-nodes {
    width: 100%;
    margin-top: 5px;
}
</style>