<template>
    <div class="flow-branch-container">
        <!-- 分支顶部按钮 -->
        <div class="branch-add-btn">
            <el-button size="small" type="primary" plain round @click="addBranch">添加条件</el-button>
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
                <!-- 分支节点头部（通过分支自身类型控制差异） -->
                <div class="flow-node branch-node" :class="branch.type">
                    <div class="branch-header">
                        {{ branch.name }}

                        <!-- 优先级标签 - 仅条件分支且非默认条件时显示 -->
                        <div class="priority-tag" v-if="branch.type === FlowNodeType.CONDITION_BRANCH && !branch.isDefault">
                            优先级{{ branch.priority }}
                        </div>

                        <!-- 复制按钮 - 只在非默认条件下显示 -->
                        <el-icon class="node-copy" v-if="!branch.isDefault" @click.stop="copyBranch(branchIndex)">
                            <CopyDocument />
                        </el-icon>

                        <!-- 删除分支按钮 - 只在非默认条件下显示 -->
                        <el-icon class="node-delete" v-if="!branch.isDefault" @click.stop="deleteBranch(branchIndex)">
                            <Delete />
                        </el-icon>

                        <!-- 默认条件说明图标 -->
                        <el-tooltip v-if="branch.isDefault" content="当其他条件都不满足时，流程将进入默认条件" placement="top">
                            <el-icon class="node-info">
                                <QuestionFilled />
                            </el-icon>
                        </el-tooltip>
                    </div>

                    <!-- 分支内容 -->
                    <div class="node-content branch-content"
                        @click="!branch.isDefault ? editBranch(branchIndex, branch) : undefined"
                        :class="{ 'default-condition': branch.isDefault }">
                        <span class="condition-text" v-html="getConditionDescription(branch)"></span>
                        <el-icon class="chevron-icon" v-if="!branch.isDefault">
                            <Edit />
                        </el-icon>
                    </div>
                </div>

                <!-- 分支内的节点列表 -->
                <div class="branch-nodes-container">
                    <div class="branch-nodes">
                        <template v-for="(branchNode, nodeIdx) in (branch.nodes || [])" :key="branchNode.id">
                            <!-- 每个节点前面都有一个添加按钮 -->
                            <node-add-button :position="nodeIdx" :branch="branch" has-next-node />

                            <!-- 渲染节点 -->
                            <flow-node-renderer :node="branchNode" :index="nodeIdx" :showDeleteBtn="true" :branch="branch">
                            </flow-node-renderer>
                        </template>

                        <!-- 最后一个节点后的添加按钮（无节点时 position=0） -->
                        <node-add-button :position="branch.nodes?.length || 0" :branch="branch" />
                    </div>
                </div>

                <!-- 插槽 -->
                <slot :branch="branch" :branch-index="branchIndex"></slot>
            </div>
        </div>
    </div>
</template>

<script setup>
import { Delete, Edit, CopyDocument, QuestionFilled } from '@element-plus/icons-vue'
import { computed } from 'vue'
import { useFlowDesignStore } from '@/stores/flowDesignStore'
import NodeAddButton from '../NodeAddButton.vue'
import { FlowNodeType, FormComponentType } from '@/enums'
import { CONDITION_TYPE_INITIATOR } from '@/constants/flowConstants'
import { getConditionBranch, getInclusiveBranch } from '@/constants/nodeTypeConfig'

// 使用 Pinia store
const flowStore = useFlowDesignStore()

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
    branch: {
        type: Object,
        default: null
    }
})

// 由于已经直接使用store处理大部分操作
const emit = defineEmits([])

// 获取分支集合
const branches = computed(() => props.node.branches || [])

// ===== 通用分支操作逻辑 =====

// 添加分支
const addBranch = () => {
    const nonDefaultBranches = props.node.branches.filter(b => !b.isDefault);
    const conditionNumber = nonDefaultBranches.length + 1;
    let newBranch

    if (props.node.type === FlowNodeType.CONDITION) {
        newBranch = getConditionBranch(conditionNumber)
    } else if (props.node.type === FlowNodeType.INCLUSIVE) {
        newBranch = getInclusiveBranch(conditionNumber)
    } else {
        return
    }

    props.node.branches.splice(nonDefaultBranches.length, 0, newBranch);

    // 条件分支需要更新优先级（包容分支无优先级概念）
    if (props.node.type === FlowNodeType.CONDITION) {
        flowStore.updateBranchesPriority(props.node.branches);
    }
}

// 删除分支
const deleteBranch = (branchIndex) => {
    if (props.node.branches.length <= 2) {
        flowStore.deleteNode(props.node, props.index, props.branch);
        return;
    }

    // 收集被删除分支中的所有节点，转移到默认分支
    const orphanedNodes = props.node.branches[branchIndex].nodes;
    if (orphanedNodes.length > 0) {
        const defaultIndex = props.node.branches.findIndex(b => b.isDefault);
        if (defaultIndex !== -1) {
            props.node.branches[defaultIndex].nodes.push(...orphanedNodes);
            ElMessage.info('已将分支中的节点转移到默认条件');
        }
    }

    props.node.branches.splice(branchIndex, 1);

    // 条件分支需要更新优先级
    if (props.node.type === FlowNodeType.CONDITION) {
        flowStore.updateBranchesPriority(props.node.branches);
    }
}

// 编辑分支
const editBranch = (branchIndex, branch) => {
    flowStore.selectNode(branch, branchIndex, null, props.node);
}

// 复制分支
const copyBranch = (branchIndex) => {
    flowStore.copyBranch(props.node, branchIndex);
}

// 将条件设置转换为文本描述
const getConditionDescription = (branch) => {
    // 如果是默认条件，直接返回默认文本
    if (branch.isDefault) {
        return '其他条件进入此流程';
    }

    // 如果节点设置了自定义表达式，则优先使用
    if (branch.expression && branch.expression.trim()) {
        return branch.expression;
    }

    // 如果有条件组数据，则生成描述
    if (branch.props && branch.props.conditionGroups && branch.props.conditionGroups.length) {
        // 返回包含所有条件组的描述
        return formatConditionGroups(branch.props.conditionGroups);
    }

    return '请设置条件';
};

// 格式化条件组为文字描述
const formatConditionGroups = (conditionGroups) => {
    // 如果没有条件组，返回默认文本
    if (!conditionGroups || conditionGroups.length === 0) {
        return '请设置条件';
    }

    // 将每个条件组格式化，然后用<br>和"或"连接
    const groupTexts = conditionGroups.map(group => formatConditionGroup(group));

    // 过滤掉空的条件组描述
    const validGroupTexts = groupTexts.filter(text => text);

    if (validGroupTexts.length === 0) {
        return '请设置条件';
    }

    if (validGroupTexts.length === 1) {
        return validGroupTexts[0];
    }

    return validGroupTexts.join('<br>或 ');
};

// 格式化单个条件组为文字描述
const formatConditionGroup = (group) => {
    // 如果条件组内没有条件，返回空字符串
    if (!group.conditions || group.conditions.length === 0) {
        return '';
    }

    // 将每个条件格式化，然后用"且"连接
    const conditionTexts = group.conditions.map(condition => formatSingleCondition(condition));

    // 过滤掉空的条件描述
    const validConditionTexts = conditionTexts.filter(text => text);

    if (validConditionTexts.length === 0) {
        return '';
    }

    if (validConditionTexts.length === 1) {
        return validConditionTexts[0];
    }

    return validConditionTexts.join(' 且 ');
};

// 格式化单个条件为文字描述
const formatSingleCondition = (condition) => {
    if (!condition.type) {
        return '';
    }

    let description = '';

    // 根据条件类型生成描述
    if (condition.type === CONDITION_TYPE_INITIATOR) {
        if (condition.users && condition.users.length) {
            const userNames = condition.users.map(u => u.name).join('、');
            description = `发起人为：${userNames}`;
        } else {
            description = '发起人未指定';
        }
    }
    // 数字类型条件
    else if (condition.type === FormComponentType.NUMBER && condition.operator && typeof condition.value === 'number') {
        const operatorMap = {
            'lt': '小于',
            'lte': '小于等于',
            'eq': '等于',
            'gte': '大于等于',
            'gt': '大于'
        };
        const operatorText = operatorMap[condition.operator] || '';
        description = `${condition.label} ${operatorText} ${condition.value}`;
    }
    // 单选框条件
    else if (condition.type === FormComponentType.RADIO && condition.selectedOptions && Array.isArray(condition.selectedOptions)) {
        if (condition.selectedOptions.length === 0) {
            description = `${condition.label} 未选择`;
        } else {
            const options = condition.options || [];
            const selectedLabels = condition.selectedOptions.map(value => {
                const option = options.find(opt => opt.value === value);
                return option ? option.label : value;
            }).join('、');

            description = `${condition.label} 为 ${selectedLabels}`;
        }
    }
    // 多选框条件
    else if (condition.type === FormComponentType.CHECKBOX && condition.operator && condition.selectedOptions && Array.isArray(condition.selectedOptions)) {
        if (condition.selectedOptions.length === 0) {
            description = `${condition.label} 未选择`;
        } else {
            const options = condition.options || [];
            const selectedLabels = condition.selectedOptions.map(value => {
                const option = options.find(opt => opt.value === value);
                return option ? option.label : value;
            }).join('、');

            const operatorText = condition.operator === 'exact' ? '完全等于' : '包含';
            description = `${condition.label} ${operatorText} ${selectedLabels}`;
        }
    }
    // 默认情况
    else {
        description = `${condition.label} 未设置`;
    }

    return description;
};

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

    /* 默认条件说明图标样式 */
    .node-info {
        position: absolute;
        top: 8px;
        right: 8px;
        color: #909399;
        cursor: help;
        font-size: 16px;
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

    // 根据分支项类型添加不同的左边框颜色
    &.condition_branch {
        border-left: 3px solid #f56c6c;
    }

    &.inclusive_branch {
        border-left: 3px solid #0ea5e9;
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
            flex-shrink: 0;
            /* 防止图标被压缩 */
        }

        /* 添加条件文本容器的样式 */
        .condition-text {
            display: -webkit-box;
            -webkit-line-clamp: 5;
            line-clamp: 5; /* 标准属性 */
            -webkit-box-orient: vertical;
            overflow: hidden;
            text-overflow: ellipsis;
            line-height: 1.5;
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