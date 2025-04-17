// 从原UniversalFlowNode.vue复制内容
<template>
    <div class="universal-flow-node">
        <!-- 发起人节点 -->
        <initiator-node v-if="node.type === 'initiator'" :initiator="node" @select="$emit('select-initiator', node)" />

        <!-- 普通节点（审批人、抄送人、办理、付款人等） -->
        <flow-node v-else-if="isRegularNode" :node="node" :index="index" :nodeOptions="nodeOptions"
            @delete="$emit('delete', node, index, parentPath)" @select-approvers="$emit('select-approvers', $event)"
            @select-users="$emit('select-users', $event)" @select-processors="$emit('select-processors', $event)"
            @configure="$emit('configure', $event)" />

        <!-- 条件分支节点 -->
        <div v-else-if="node.type === 'condition'" class="flow-branch-container">
            <!-- 条件分支顶部按钮 -->
            <div class="condition-add-btn">
                <el-button size="small" type="primary" plain round
                    @click="$emit('add-condition', node)">添加条件</el-button>
                <el-button v-if="showDeleteBtn" size="small" type="danger" plain round icon="Delete"
                    @click="$emit('delete', node, index, parentPath)" />
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
                        <flow-node-renderer v-for="(branchNode, nodeIdx) in condition.nodes" :key="branchNode.id"
                            :node="branchNode" :index="nodeIdx" :nodeOptions="nodeOptions"
                            :parentPath="`${getFullPath(index)}-${condIndex}-${nodeIdx}`"
                            @delete="$emit('delete', $event, $event2, $event3)"
                            @select-initiator="$emit('select-initiator', $event)"
                            @select-approvers="$emit('select-approvers', $event)"
                            @select-users="$emit('select-users', $event)"
                            @select-processors="$emit('select-processors', $event)"
                            @add-condition="$emit('add-condition', $event)"
                            @delete-condition="$emit('delete-condition', $event, $event2)"
                            @edit-condition="$emit('edit-condition', $event, $event2, $event3)"
                            @add-branch="$emit('add-branch', $event)"
                            @delete-branch="$emit('delete-branch', $event, $event2)"
                            @edit-branch="$emit('edit-branch', $event, $event2, $event3)"
                            @configure="$emit('configure', $event)" />
                    </div>

                    <!-- 为每个条件分支添加节点按钮 -->
                    <node-add-button :position="`${getFullPath(index)}-${condIndex}`" :nodeOptions="nodeOptions"
                        :visible="getPopoverVisible(`${getFullPath(index)}-${condIndex}`)"
                        @update:visible="val => setPopoverVisible(`${getFullPath(index)}-${condIndex}`, val)"
                        @add="payload => $emit('add-node-to-condition', payload, node, condition)"
                        @show="$emit('popover-show', `${getFullPath(index)}-${condIndex}`)"
                        @hide="$emit('popover-hide', `${getFullPath(index)}-${condIndex}`)" />
                </div>
            </div>
        </div>

        <!-- 并行分支节点 -->
        <div v-else-if="node.type === 'parallel'" class="flow-branch-container parallel-container">
            <!-- 并行分支顶部按钮 -->
            <div class="branch-add-btn">
                <el-button size="small" type="primary" plain round @click="$emit('add-branch', node)">添加分支</el-button>
                <el-button v-if="showDeleteBtn" size="small" type="danger" plain round icon="Delete"
                    @click="$emit('delete', node, index, parentPath)" />
            </div>

            <!-- 并行分支内容 -->
            <div class="flow-branch">
                <div class="branch-item" v-for="(branch, branchIndex) in node.props.branches" :key="branchIndex">
                    <!-- 分支项头部 -->
                    <div class="flow-node parallel-branch">
                        <div class="branch-header">
                            {{ branch.name }}
                            <!-- 删除分支按钮 -->
                            <el-icon v-if="node.props.branches.length > 2" class="branch-delete"
                                @click="$emit('delete-branch', node, branchIndex)">
                                <Delete />
                            </el-icon>
                        </div>

                        <!-- 分支标题点击可编辑 -->
                        <div class="node-content branch-content"
                            @click="$emit('edit-branch', node, branchIndex, branch)">
                            <span>{{ branch.name }}</span>
                            <el-icon class="chevron-icon">
                                <Edit />
                            </el-icon>
                        </div>
                    </div>

                    <!-- 分支内的节点列表 -->
                    <div class="branch-nodes" v-if="branch.nodes && branch.nodes.length > 0">
                        <flow-node-renderer v-for="(branchNode, nodeIdx) in branch.nodes" :key="branchNode.id"
                            :node="branchNode" :index="nodeIdx" :nodeOptions="nodeOptions"
                            :parentPath="`${getFullPath(index)}-p${branchIndex}-${nodeIdx}`"
                            @delete="$emit('delete', $event, $event2, $event3)"
                            @select-initiator="$emit('select-initiator', $event)"
                            @select-approvers="$emit('select-approvers', $event)"
                            @select-users="$emit('select-users', $event)"
                            @select-processors="$emit('select-processors', $event)"
                            @add-condition="$emit('add-condition', $event)"
                            @delete-condition="$emit('delete-condition', $event, $event2)"
                            @edit-condition="$emit('edit-condition', $event, $event2, $event3)"
                            @add-branch="$emit('add-branch', $event)"
                            @delete-branch="$emit('delete-branch', $event, $event2)"
                            @edit-branch="$emit('edit-branch', $event, $event2, $event3)"
                            @configure="$emit('configure', $event)" />
                    </div>

                    <!-- 为每个并行分支添加节点按钮 -->
                    <node-add-button :position="`${getFullPath(index)}-p${branchIndex}`" :nodeOptions="nodeOptions"
                        :visible="getPopoverVisible(`${getFullPath(index)}-p${branchIndex}`)"
                        @update:visible="val => setPopoverVisible(`${getFullPath(index)}-p${branchIndex}`, val)"
                        @add="payload => $emit('add-node-to-parallel', payload, node, branch)"
                        @show="$emit('popover-show', `${getFullPath(index)}-p${branchIndex}`)"
                        @hide="$emit('popover-hide', `${getFullPath(index)}-p${branchIndex}`)" />
                </div>
            </div>

            <!-- 并行分支汇合点 -->
            <div class="branch-join">
                <div class="join-node">
                    <span>{{ getJoinStrategyText(node.props.joinStrategy) }}</span>
                </div>
            </div>
        </div>

        <!-- 结束节点 -->
        <flow-node-end v-else-if="node.type === 'end'" />
    </div>
</template>

<script setup>
import { computed } from 'vue';
import { Delete, Edit } from '@element-plus/icons-vue';
import InitiatorNode from './FlowNodeInitiator.vue';
import FlowNode from './FlowNodeBasic.vue';
import FlowNodeEnd from './FlowNodeEnd.vue';
import NodeAddButton from '../NodeAddButton.vue';

// 导入组件自身以进行递归引用
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
    parentPath: {
        type: String,
        default: ''
    },
    showDeleteBtn: {
        type: Boolean,
        default: true
    },
    // 函数props用于处理弹出状态和事件
    getPopoverVisible: {
        type: Function,
        default: () => false
    },
    setPopoverVisible: {
        type: Function,
        default: () => { }
    }
});

const emit = defineEmits([
    'delete',
    'select-initiator',
    'select-approvers',
    'select-users',
    'select-processors',
    'add-condition',
    'delete-condition',
    'edit-condition',
    'add-branch',
    'delete-branch',
    'edit-branch',
    'add-node-to-condition',
    'add-node-to-parallel',
    'popover-show',
    'popover-hide',
    'configure'
]);

// 判断是否为普通节点（非分支类节点）
const isRegularNode = computed(() => {
    const regularTypes = ['approver', 'copyTo', 'process', 'payment', 'automation', 'connector'];
    return regularTypes.includes(props.node.type);
});

// 获取完整路径，用于嵌套节点
const getFullPath = (index) => {
    return props.parentPath ? props.parentPath : String(index);
};

// 获取汇合策略文本
const getJoinStrategyText = (strategy) => {
    const strategies = {
        'all': '全部完成后继续',
        'any': '任一完成后继续',
        'majority': '多数完成后继续'
    };
    return strategies[strategy] || '全部完成后继续';
};
</script>

<style scoped lang="scss">
.universal-flow-node {
    width: 100%;
}

/* 以下样式沿用各个组件的样式，可根据需要调整 */
/* 分支容器样式 */
.flow-branch-container {
    width: 100%;
    margin-bottom: 15px;
    position: relative;
}

/* 条件分支顶部按钮样式 */
.condition-add-btn,
.branch-add-btn {
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

    .condition-delete,
    .branch-delete {
        margin-left: 8px;
        color: #f56c6c;
        cursor: pointer;
        font-size: 14px;
        opacity: 0;
        transition: opacity 0.3s;
    }

    &:hover .condition-delete,
    &:hover .branch-delete {
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
}

.parallel-branch {
    width: 100%;
    margin-bottom: 10px;
    border: 1px solid #e4e7ed;
    border-radius: 4px;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
    background-color: white;
    border-left: 3px solid #1890ff;
}

.condition-content,
.branch-content {
    padding: 14px 16px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    color: #606266;
    font-size: 14px;
    cursor: pointer;
    border-top: 1px solid #ebeef5;

    &:hover {
        background-color: #f5f7fa;
    }

    .chevron-icon {
        color: #c0c4cc;
    }
}

.branch-nodes {
    width: 100%;
    margin-top: 5px;
}

/* 并行分支汇合点样式 */
.branch-join {
    position: relative;
    padding-top: 15px;
    margin-bottom: 15px;

    /* 连接线 - 多条线汇合 */
    &::before {
        content: '';
        position: absolute;
        top: 0;
        left: 50%;
        height: 15px;
        border-left: 1px dashed #c0c4cc;
        transform: translateX(-50%);
    }

    /* 横线，连接所有分支 */
    &::after {
        content: '';
        position: absolute;
        top: 0;
        left: 20%;
        width: 60%;
        border-top: 1px dashed #c0c4cc;
    }

    .join-node {
        margin: 0 auto;
        padding: 8px 16px;
        background-color: #e6f7ff;
        border-radius: 15px;
        font-size: 13px;
        color: #1890ff;
        border: 1px solid #91d5ff;
        text-align: center;
        max-width: 180px;
    }
}
</style>