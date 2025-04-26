<template>
    <div class="flow-branch-container">
        <!-- 分支顶部按钮 - 根据分支类型显示不同按钮 -->
        <div class="branch-add-btn">
            <el-button size="small" type="primary" plain round @click="addBranch"
                v-if="branchType === 'condition'">添加条件</el-button>
            <el-button size="small" type="primary" plain round @click="addBranch" v-else>添加分支</el-button>
        </div>

        <!-- 分支内容 -->
        <div class="flow-branch">
            <div class="branch-item" v-for="(branch, branchIndex) in branches" :key="branchIndex">
                <div v-if="branchIndex === 0 || branchIndex === branches.length - 1"
                    :class="{ 'hide-left-line': branchIndex === 0, 'hide-right-line': branchIndex === branches.length - 1 }">
                </div>
                <div v-if="branchIndex === 0 || branchIndex === branches.length - 1"
                    :class="{ 'hide-bottom-left-line': branchIndex === 0, 'hide-bottom-right-line': branchIndex === branches.length - 1 }">
                </div>
                <!-- 分支项头部 -->
                <div class="flow-node branch-node" :class="[branchType]">
                    <div class="branch-header">
                        {{ branch.name }}
                        <!-- 优先级标签 - 仅在条件分支类型时显示 -->
                        <div class="priority-tag" v-if="branchType === 'condition'">优先级{{ branch.priority }}</div>

                        <!-- 复制按钮 - 只在非默认条件下显示 -->
                        <el-icon class="node-copy" v-if="branch.name !== '默认条件'" @click.stop="copyBranch(branchIndex)">
                            <CopyDocument />
                        </el-icon>

                        <!-- 删除分支按钮 -->
                        <el-icon class="node-delete" @click.stop="deleteBranch(branchIndex)">
                            <Delete />
                        </el-icon>
                    </div>

                    <!-- 分支内容 - 根据分支类型显示不同内容 -->
                    <div class="node-content branch-content"
                        @click="branch.name !== '默认条件' ? editBranch(branchIndex, branch) : undefined"
                        :class="{ 'default-condition': branch.name === '默认条件' }">
                        <!-- 条件分支内容 -->
                        <template v-if="branchType === 'condition'">
                            <span v-if="branch.name === '默认条件'">其他条件进入此流程</span>
                            <span v-else>{{ branch.expression || '请设置条件' }}</span>
                        </template>
                        <!-- 其他类型分支内容可在此扩展 -->
                        <template v-else>
                            <span>{{ branch.description || '请配置分支' }}</span>
                        </template>
                        <el-icon class="chevron-icon" v-if="branch.name !== '默认条件'">
                            <Edit />
                        </el-icon>
                    </div>
                </div>

                <!-- 条件框下方紧跟的添加按钮 -->
                <node-add-button class="first-add-btn" :position="0" :branch="branch" :parentNode="props.node" />

                <!-- 分支内的节点列表 -->
                <div class="branch-nodes-container" v-if="branch.nodes && branch.nodes.length > 0">
                    <div class="branch-nodes">
                        <template v-for="(branchNode, nodeIdx) in branch.nodes" :key="branchNode.id">
                            <!-- 渲染节点 -->
                            <flow-node-renderer :node="branchNode" :index="nodeIdx" :showDeleteBtn="true"
                                :parentNode="props.node" :branch="branch">
                            </flow-node-renderer>

                            <!-- 每个节点后的添加按钮 -->
                            <node-add-button :position="nodeIdx + 1" :branch="branch" :parentNode="props.node" />
                        </template>
                    </div>
                </div>

                <!-- 插槽 -->
                <slot :branch="branch" :branch-index="branchIndex"></slot>
            </div>
        </div>
    </div>
</template>

<script setup>
import { Delete, Edit, CopyDocument } from '@element-plus/icons-vue'
import { computed } from 'vue'
import { useFlowDesignStore } from '../../../stores/flowDesignStore'
import NodeAddButton from '../NodeAddButton.vue'

// 使用 Pinia store
const flowStore = useFlowDesignStore()

// 从 store 获取 nodeOptions
const nodeOptions = computed(() => flowStore.nodeOptions)

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
    showDeleteBtn: {
        type: Boolean,
        default: true
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

// 由于已经直接使用store处理大部分操作，只保留必要的事件定义
const emit = defineEmits([])

// 分支类型 - 目前支持条件分支(condition)，未来可扩展更多类型
const branchType = computed(() => props.node.type)

// 根据分支类型获取分支集合
const branches = computed(() => {
    if (branchType.value === 'condition') {
        return props.node.props.conditions || [];
    }
    // 未来可以在这里添加其他类型的分支数据获取逻辑
    return [];
})

// ===== 通用分支操作逻辑 =====

// 添加分支
const addBranch = () => {
    if (branchType.value === 'condition') {
        addConditionBranch();
    } else {
        // 其他类型分支的添加逻辑可在此扩展
        ElMessage.info('尚未支持该类型分支的添加');
    }
}

// 删除分支
const deleteBranch = (branchIndex) => {
    if (branchType.value === 'condition') {
        deleteConditionBranch(branchIndex);
    } else {
        // 其他类型分支的删除逻辑可在此扩展
        ElMessage.info('尚未支持该类型分支的删除');
    }
}

// 编辑分支
const editBranch = (branchIndex, branch) => {
    if (branchType.value === 'condition') {
        editCondition(branchIndex, branch);
    } else {
        // 其他类型分支的编辑逻辑可在此扩展
        ElMessage.info('尚未支持该类型分支的编辑');
    }
}

// 复制分支
const copyBranch = (branchIndex) => {
    if (branchType.value === 'condition') {
        // 调用store中的复制方法
        flowStore.copyConditionBranch(props.node, branchIndex);
    } else {
        // 其他类型分支的复制逻辑可在此扩展
        ElMessage.info('尚未支持该类型分支的复制');
    }
}

// ===== 条件分支特定操作 =====

// 添加条件分支
const addConditionBranch = () => {
    // 获取现有条件数量
    const conditionsCount = props.node.props.conditions.length;
    const conditionNumber = conditionsCount; // 新条件的编号

    // 创建新条件
    const newCondition = {
        name: `条件${conditionNumber}`,
        expression: '',
        priority: conditionNumber,
        nodes: []
    };

    // 将默认条件的优先级设为最低
    const defaultConditionIndex = props.node.props.conditions.findIndex(c => c.name === '默认条件');
    if (defaultConditionIndex !== -1) {
        props.node.props.conditions[defaultConditionIndex].priority = conditionsCount + 1;
    }

    // 在数组中插入新条件（紧挨着第一个条件的右侧）
    // 确保至少插入在默认条件之前
    const insertIndex = Math.min(1, conditionsCount - 1);
    props.node.props.conditions.splice(insertIndex, 0, newCondition);

    // 重新计算所有条件的优先级
    props.node.props.conditions.forEach((condition, idx) => {
        if (condition.name !== '默认条件') {
            condition.priority = idx + 1;
        } else {
            condition.priority = props.node.props.conditions.length; // 默认条件优先级最低
        }
    });

    console.log('添加条件分支成功', newCondition);
    // 不再向上传递事件，只在本地处理即可
}

// 删除条件分支
const deleteConditionBranch = (condIndex) => {
    if (props.node.props.conditions.length <= 2) {
        // 当只有两个条件分支时，删除整个当前条件分支组件
        // 直接使用 store 中的方法删除，传递branch属性
        flowStore.deleteNode(props.node, props.index, props.branch);
        return;
    }

    // 收集被删除分支中的所有节点
    const orphanedNodes = props.node.props.conditions[condIndex].nodes;

    // 如果有孤立节点，可以选择将它们移到默认分支
    if (orphanedNodes.length > 0) {
        const defaultConditionIndex = props.node.props.conditions.findIndex(c => c.name === '默认条件');
        if (defaultConditionIndex !== -1) {
            props.node.props.conditions[defaultConditionIndex].nodes.push(...orphanedNodes);
            ElMessage.info('已将分支中的节点转移到默认条件');
        }
    }

    // 删除条件分支
    props.node.props.conditions.splice(condIndex, 1);

    // 更新剩余条件分支的优先级
    props.node.props.conditions.forEach((condition, idx) => {
        if (condition.name !== '默认条件') {
            condition.priority = idx + 1;
        } else {
            condition.priority = props.node.props.conditions.length;
        }
    });

    console.log('删除条件分支', condIndex);
}

// 编辑条件表达式
const editCondition = (condIndex, condition) => {
    condition = { ...condition, type: 'condition' }; // 确保条件对象包含类型信息
    // 直接将条件作为node传递给selectNode方法
    flowStore.selectNode(condition, condIndex, null);

    console.log('编辑条件', condIndex, condition);
}

</script>

<style scoped lang="scss">
/* 分支容器样式 */
.flow-branch-container {
    width: 100%;
    position: relative;
}

/* 分支顶部按钮样式 */
.branch-add-btn {
    display: flex;
    justify-content: center;
    gap: 10px;
    margin: 0;
    position: absolute;
    width: 100%;
    top: -15px;
    z-index: 1;

    .el-button {
        background-color: white;
        font-size: 13px;
        padding: 8px 20px;
        height: auto;
        transition: all 0.3s;

        &:hover {
            color: #fff;
            background-color: #409eff;
            border-color: #409eff;
        }
    }
}

/* 分支样式 */
.flow-branch {
    width: 100%;
    display: flex;
    justify-content: center;
    gap: 100px;
    position: relative;
    padding: 30px 0 0;

    /* 分支上方连接线 */
    &::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 2px;
        background-color: #c0c4cc;
    }

    /* 分支顶部横线 */
    &::after {
        content: '';
        position: absolute;
        bottom: 0px;
        left: 0;
        width: 100%;
        height: 2px;
        background-color: #c0c4cc;
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
            top: -30px;
            left: calc(50% - 1px);
            height: 30px;
            width: 2px;
            background-color: #c0c4cc;
        }

        &::after {
            content: '';
            flex: 1;
            width: 2px;
            background-color: #c0c4cc;
        }

        .hide-left-line,
        .hide-right-line,
        .hide-bottom-left-line,
        .hide-bottom-right-line {
            /* 分支顶部竖线 - 隐藏左侧或右侧的连接线 */
            position: absolute;
            height: 5px;
            width: calc(50% - 1px);
            background-color: #f5f7fa;
            z-index: 1;
        }

        .hide-left-line {
            // 隐藏左侧连接线
            top: -32px;
            left: 0;
        }

        .hide-right-line {
            // 隐藏右侧连接线
            top: -32px;
            right: 0;
        }

        .hide-bottom-left-line {
            // 隐藏下方左侧连接线
            bottom: -2px;
            left: 0;
        }

        .hide-bottom-right-line {
            // 隐藏下方右侧连接线
            bottom: -2px;
            right: 0;
        }
    }
}

.branch-header {
    position: relative;
    display: flex;
    align-items: center;
    padding: 8px 12px;
    font-size: 13px;
    color: #333;
    margin-bottom: 0;
    background-color: #f5f7fa;
    border-bottom: 1px solid #e4e7ed;
    border-radius: 4px 4px 0 0;

    .priority-tag {
        position: absolute;
        top: 8px;
        right: 16px;
        color: #909399;
        font-size: 12px;
        font-weight: normal;
        visibility: visible;
        opacity: 1;
        transition: visibility 0s, opacity 0.2s ease-in-out;
    }

    /* 复制图标样式 */
    .node-copy {
        position: absolute;
        top: 8px;
        right: 32px;
        /* 位于删除按钮左侧 */
        color: #409eff;
        cursor: pointer;
        font-size: 16px;
        visibility: hidden;
        opacity: 0;
        transition: visibility 0s, opacity 0.2s ease-in-out;
        z-index: 2;
    }

    /* 删除图标样式 */
    .node-delete {
        position: absolute;
        top: 8px;
        right: 8px;
        color: #f56c6c;
        cursor: pointer;
        font-size: 16px;
        visibility: hidden;
        opacity: 0;
        transition: visibility 0s, opacity 0.2s ease-in-out;
        z-index: 2;
    }
}

.branch-node {
    width: 220px;
    margin-bottom: 0;
    /* 移除下边距 */
    border: 1px solid #e4e7ed;
    border-radius: 4px;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
    background-color: white;

    // 根据分支类型添加不同的左边框颜色
    &.condition {
        border-left: 3px solid #f56c6c;
    }

    // 修改优先级标签的显示逻辑
    &:hover {
        .priority-tag {
            visibility: hidden;
            opacity: 0;
        }

        .node-copy,
        .node-delete {
            visibility: visible;
            opacity: 1;
        }
    }

    /* 复制图标悬停样式 */
    .node-copy:hover {
        color: #66b1ff;
    }

    /* 删除图标样式 */
    .node-delete:hover {
        color: #ff4d4f;
    }

    .branch-content {
        padding: 10px 12px;
        /* 修改padding与普通节点一致 */
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

/* 分支节点列表容器 */
.branch-nodes-container {
    width: 100%;
}

/* 添加按钮样式 */
.first-add-btn {
    margin-top: 0;
    margin-bottom: 0;
}

.branch-nodes {
    width: 100%;
    margin-top: 0;

    /* 每个节点后的添加按钮样式 */
    :deep(.node-add-btn) {
        margin: 0;
    }
}
</style>