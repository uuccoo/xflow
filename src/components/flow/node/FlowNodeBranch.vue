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
                        <el-icon class="node-copy" v-if="!branch.isDefault" @click.stop="copyBranch(branchIndex)">
                            <CopyDocument />
                        </el-icon>

                        <!-- 删除分支按钮 -->
                        <el-icon class="node-delete" @click.stop="deleteBranch(branchIndex)">
                            <Delete />
                        </el-icon>
                    </div>

                    <!-- 分支内容 - 根据分支类型显示不同内容 -->
                    <div class="node-content branch-content"
                        @click="!branch.isDefault ? editBranch(branchIndex, branch) : undefined"
                        :class="{ 'default-condition': branch.isDefault }">
                        <!-- 条件分支内容 -->
                        <template v-if="branchType === 'condition'">
                            <span class="condition-text" v-html="getConditionDescription(branch)"></span>
                        </template>
                        <!-- 其他类型分支内容可在此扩展 -->
                        <template v-else>
                            <span>{{ branch.description || '请配置分支' }}</span>
                        </template>
                        <el-icon class="chevron-icon" v-if="!branch.isDefault">
                            <Edit />
                        </el-icon>
                    </div>
                </div>

                <!-- 条件框下方紧跟的添加按钮 -->
                <node-add-button class="first-add-btn" :position="0" :branch="branch" />

                <!-- 分支内的节点列表 -->
                <div class="branch-nodes-container" v-if="branch.nodes && branch.nodes.length > 0">
                    <div class="branch-nodes">
                        <template v-for="(branchNode, nodeIdx) in branch.nodes" :key="branchNode.id">
                            <!-- 渲染节点 -->
                            <flow-node-renderer :node="branchNode" :index="nodeIdx" :showDeleteBtn="true"
                                :branch="branch">
                            </flow-node-renderer>

                            <!-- 每个节点后的添加按钮 -->
                            <node-add-button :position="nodeIdx + 1" :branch="branch" />
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
import { useFlowDesignStore } from '@/stores/flowDesignStore'
import NodeAddButton from '../NodeAddButton.vue'

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

// 分支类型 - 目前支持条件分支(condition)，未来可扩展更多类型
const branchType = computed(() => props.node.type)

// 根据分支类型获取分支集合
const branches = computed(() => {
    if (branchType.value === 'condition') {
        return props.node.branches || [];
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
    const conditionsCount = props.node.branches.length;
    const conditionNumber = conditionsCount; // 新条件的编号

    // 创建新条件
    const newCondition = {
        id: `branch_${Date.now()}`, // 添加唯一id，使用时间戳
        name: `条件${conditionNumber}`,
        expression: '',
        priority: conditionNumber,
        nodes: [],
        isDefault: false  // 普通条件，非默认
    };

    // 找到默认条件的索引
    const defaultConditionIndex = props.node.branches.findIndex(c => c.isDefault);

    // 计算插入位置：如果找到了默认条件，就插入到它前面；否则插入到末尾
    const insertIndex = defaultConditionIndex !== -1 ? defaultConditionIndex : conditionsCount;

    // 在数组中插入新条件
    props.node.branches.splice(insertIndex, 0, newCondition);

    // 重新计算所有条件的优先级
    props.node.branches.forEach((condition, idx) => {
        if (!condition.isDefault) {
            condition.priority = idx + 1;
        } else {
            condition.priority = props.node.branches.length; // 默认条件优先级最低
        }
    });

    console.log('添加条件分支成功', newCondition);
    // 不再向上传递事件，只在本地处理即可
}

// 删除条件分支
const deleteConditionBranch = (condIndex) => {
    if (props.node.branches.length <= 2) {
        // 当只有两个条件分支时，删除整个当前条件分支组件
        // 直接使用 store 中的方法删除，传递branch属性
        flowStore.deleteNode(props.node, props.index, props.branch);
        return;
    }

    // 收集被删除分支中的所有节点
    const orphanedNodes = props.node.branches[condIndex].nodes;

    // 如果有孤立节点，可以选择将它们移到默认分支
    if (orphanedNodes.length > 0) {
        const defaultConditionIndex = props.node.branches.findIndex(c => c.isDefault);
        if (defaultConditionIndex !== -1) {
            props.node.branches[defaultConditionIndex].nodes.push(...orphanedNodes);
            ElMessage.info('已将分支中的节点转移到默认条件');
        }
    }

    // 删除条件分支
    props.node.branches.splice(condIndex, 1);

    // 更新剩余条件分支的优先级
    props.node.branches.forEach((condition, idx) => {
        if (!condition.isDefault) {
            condition.priority = idx + 1;
        } else {
            condition.priority = props.node.branches.length;
        }
    });

    console.log('删除条件分支', condIndex);
}

// 编辑条件表达式
const editCondition = (condIndex, condition) => {
    condition.type = 'condition'; // 确保条件对象包含类型信息
    // 直接将条件作为node传递给selectNode方法
    flowStore.selectNode(condition, condIndex, null);

    console.log('编辑条件', condIndex, condition);
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
    if (condition.type === 'initiator') {
        if (condition.users && condition.users.length) {
            const userNames = condition.users.map(u => u.name).join('、');
            description = `发起人为：${userNames}`;
        } else {
            description = '发起人未指定';
        }
    }
    // 数字类型条件
    else if (condition.type === 'number' && condition.conditionType && typeof condition.value === 'number') {
        const typeMap = {
            'lt': '小于',
            'lte': '小于等于',
            'eq': '等于',
            'gte': '大于等于',
            'gt': '大于'
        };
        const typeText = typeMap[condition.conditionType] || '';
        description = `${condition.title} ${typeText} ${condition.value}`;
    }
    // 单选框条件
    else if (condition.type === 'radio' && condition.selectedOptions && Array.isArray(condition.selectedOptions)) {
        if (condition.selectedOptions.length === 0) {
            description = `${condition.title} 未选择`;
        } else {
            const options = condition.options || [];
            const selectedLabels = condition.selectedOptions.map(value => {
                const option = options.find(opt => opt.value === value);
                return option ? option.label : value;
            }).join('、');

            description = `${condition.title} 为 ${selectedLabels}`;
        }
    }
    // 多选框条件
    else if (condition.type === 'checkbox' && condition.conditionType && condition.selectedOptions && Array.isArray(condition.selectedOptions)) {
        if (condition.selectedOptions.length === 0) {
            description = `${condition.title} 未选择`;
        } else {
            const options = condition.options || [];
            const selectedLabels = condition.selectedOptions.map(value => {
                const option = options.find(opt => opt.value === value);
                return option ? option.label : value;
            }).join('、');

            const typeText = condition.conditionType === 'exact' ? '完全等于' : '包含';
            description = `${condition.title} ${typeText} ${selectedLabels}`;
        }
    }
    // 默认情况
    else {
        description = `${condition.title} 未设置`;
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
            flex-shrink: 0;
            /* 防止图标被压缩 */
        }

        /* 添加条件文本容器的样式 */
        .condition-text {
            display: -webkit-box;
            -webkit-line-clamp: 5;
            /* 限制显示5行 */
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