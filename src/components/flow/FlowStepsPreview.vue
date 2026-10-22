<template>
    <div class="flow-process-container">
        <div class="process-title">流程</div>
        <div class="process-steps">
            <!-- 加载中提示 -->
            <div v-if="flowStepsLoading" class="flow-steps-loading">
                <el-icon class="is-loading"><Loading /></el-icon>
                <span>加载中...</span>
            </div>

            <!-- 必填项未填写完成的提示 -->
            <div v-else-if="!allRequiredFieldsFilled" class="required-fields-tip">
                <el-icon :size="40" color="#909399">
                    <info-filled />
                </el-icon>
                <p>必填信息填写后，流程将自动显示</p>
            </div>

            <!-- 无审批流程的提示（必填项填写完成后） -->
            <div v-else-if="!flowSteps || flowSteps.length === 0" class="no-flow-steps">
                <el-empty description="暂无流程节点" :image-size="80" />
            </div>

            <!-- 审批人节点（必填项填写完成后） -->
            <div v-else class="process-step" :class="{ 'last-step': index === flowSteps.length - 1 }" v-for="(step, index) in flowSteps" :key="index">
                <div class="step-dot"></div>
                <div class="step-content">
                    <div class="step-left">
                        <div class="step-name">{{ step.name }}</div>
                        <div class="step-info">{{ getStepInfo(step) }}</div>
                    </div>
                    <div class="step-right">
                        <!-- 审批人选择区域 -->
                        <!-- 如果有审批人数据或需要用户选择，显示审批人列表和添加按钮 -->
                        <div v-if="getApproversForStep(step).length || shouldShowAddButton(step)" class="approver-list-wrapper">
                            <div class="approver-list">
                                        <!-- 显示审批人列表 -->
                                        <div
                                            v-for="(user, idx) in getApproversForStep(step).slice(0, 3)"
                                            :key="user.id"
                                            class="approver-item">
                                            <!-- 审批人头像和删除按钮容器 -->
                                            <div class="approver-wrapper">
                                                <UserAvatar :user="user" :size="30" />
                                                <!-- 只有用户选择的审批人才显示删除按钮 -->
                                                <button
                                                    v-if="shouldShowAddButton(step)"
                                                    class="remove-btn"
                                                    type="button"
                                                    aria-label="删除审批人"
                                                    @click="removeApprover(step.nodeId, user.id)">
                                                    ×
                                                </button>
                                            </div>
                                        </div>
                                        <!-- 如果超过3个，显示额外数量 -->
                                        <div v-if="getApproversForStep(step).length > 3" class="approver-more">
                                            <div class="avatar-counter">+{{ getApproversForStep(step).length - 3 }}</div>
                                            <span class="approver-name">更多</span>
                                        </div>

                                        <!-- 如果需要用户选择，显示添加按钮 -->
                                        <div v-if="shouldShowAddButton(step)" class="add-approver-item">
                                            <button class="icon-only-btn add-btn" type="button" aria-label="添加审批人" @click="openPersonSelector(step)">
                                                <el-icon :size="20"><plus /></el-icon>
                                            </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- 人员选择器 -->
        <person-selector
            v-model="personSelectorVisible"
            :title="personSelectorTitle"
            :filter="personSelectorFilter"
            :single-mode="personSelectorSingleMode"
            :only-select-users="true"
            :selected-ids="personSelectorSelectedIds"
            @confirm="handlePersonSelectorConfirm"
            @cancel="handlePersonSelectorCancel"
        />
    </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import { Plus, InfoFilled, Loading } from '@element-plus/icons-vue';
import { flowStepsApi } from '@/api';
import PersonSelector from '@/components/common/PersonSelector.vue';
import UserAvatar from '@/components/common/UserAvatar.vue';
import { collectRequiredConditionFields, isRequiredValueEmpty } from '@/utils/formItems';

// Props 定义
const props = defineProps({
    // 表单ID
    formId: {
        type: String,
        required: true
    },
    // 表单版本
    formVersion: {
        type: Number,
        required: false,
        default: undefined
    },
    // 表单填写值
    formValues: {
        type: Object,
        default: () => ({})
    },
    // 表单项配置
    formItems: {
        type: Array,
        default: () => []
    }
});

// 流程步骤数据
const flowSteps = ref([]);

// 流程加载状态
const flowStepsLoading = ref(false);

// 人员选择器相关状态
const personSelectorVisible = ref(false);
const personSelectorTitle = ref('选择审批人');
const personSelectorFilter = ref([]);
const personSelectorSingleMode = ref(false);
const personSelectorSelectedIds = ref([]);
const currentSelectingStep = ref(null);

// 用户选择的审批人数据 - 以nodeId为key，存储选中的审批人列表
const userSelectedApprovers = ref({});

// 获取流程条件相关的必填项
const requiredFields = computed(() => {
    return collectRequiredConditionFields(props.formItems);
});

// 检查所有必填项是否已填写
const allRequiredFieldsFilled = computed(() => {
    if (requiredFields.value.length === 0) {
        return true;
    }
    // TODO：验证规则可能不对
    return requiredFields.value.every(item => {
        const value = props.formValues[item.id];
        return !isRequiredValueEmpty(item, value);
    });
});

// 加载流程步骤数据
const loadFlowSteps = async () => {
    if (!props.formId) {
        console.warn('formId不能为空，无法预览流程步骤');
        return;
    }

    flowStepsLoading.value = true;

    try {
        const previewData = {
            formId: props.formId,
            formVersion: props.formVersion,
            formData: { ...props.formValues }
        };

        const previewSteps = await flowStepsApi.previewFlowSteps(previewData);

        if (previewSteps) {
            flowSteps.value = previewSteps;
        } else {
            console.warn('获取流程步骤数据为空');
        }
    } catch (error) {
        console.error('加载流程步骤失败:', error);
        ElMessage.error('加载流程步骤失败: ' + (error.message || '未知错误'));
    } finally {
        flowStepsLoading.value = false;
    }
};

// 根据节点类型获取角色标签
const getNodeLabel = (nodeType) => {
    const labelMap = {
        approve: '审批',
        cc: '抄送',
        handle: '办理'
    };
    return labelMap[nodeType] || '处理';
};

// 获取步骤描述信息
const getStepInfo = (step) => {
    const approvers = getApproversForStep(step);
    const count = approvers.length;
    const label = getNodeLabel(step.nodeType);

    // 共同处理：发起人自选且未选人
    if (step.needUserSelect && count === 0) {
        return `请选择${label}人`;
    }

    // 抄送节点
    if (step.nodeType === 'cc') {
        if (count > 0) {
            return `抄送${count}人`;
        }
        return `未指定${label}人`;
    }

    // 审批和办理节点
    if (step.nodeType === 'approve' || step.nodeType === 'handle') {
        // 空处理人处理
        if (step.emptyApprover) {
            return getEmptyApproverActionText(step.emptyApproverAction, label);
        }
        if (count > 0) {
            return `${count}人${getModeText(step.approvalMode, count, label)}`;
        }
        return `未指定${label}人`;
    }

    // 其他类型节点
    if (count > 0) {
        return `${count}人`;
    }
    return `未指定${label}人`;
};

// 获取审批/办理方式文本
const getModeText = (mode, count, label) => {
    // 只有多个审批人时才显示审批方式
    if (count <= 1) {
        return label;
    }
    const modeMap = {
        sequential: '顺序会签',
        parallel: '会签',
        anyone: '或签'
    };
    return modeMap[mode] || label;
};

// 获取空审批人处理方式文本
const getEmptyApproverActionText = (action, label) => {
    const actionMap = {
        auto_pass: `${label}人为空，将自动通过`,
        auto_reject: `${label}人为空，将自动拒绝`,
        transfer_manager: `${label}人为空，将自动转交给管理员`,
        transfer_specific: `${label}人为空，将自动转交给指定人员`
    };
    return actionMap[action] || '未指定处理方式';
};

// 删除审批人
const removeApprover = (nodeId, userId) => {
    if (!userSelectedApprovers.value[nodeId]) return;

    userSelectedApprovers.value[nodeId] = userSelectedApprovers.value[nodeId].filter(
        user => user.id !== userId
    );

    ElMessage.success('已删除审批人');
};

// 获取指定节点用户选择的审批人
const getSelectedApprovers = (nodeId) => {
    return userSelectedApprovers.value[nodeId] || [];
};

// 获取步骤的审批人数据（统一处理用户选择和预设审批人）
const getApproversForStep = (step) => {
    if (step.needUserSelect) {
        return getSelectedApprovers(step.nodeId);
    } else {
        return step.handlerUsers || [];
    }
};

// 判断步骤是否需要显示添加按钮
const shouldShowAddButton = (step) => {
    return step.needUserSelect;
};

// 打开人员选择器
const openPersonSelector = (stepData) => {
    currentSelectingStep.value = stepData;
    personSelectorTitle.value = `选择审批人 - ${stepData.name}`;

    // 设置选择模式
    personSelectorSingleMode.value = stepData.selectMode === 'single';

    // 设置过滤条件
    if (stepData.selectRangeType === 'specified' && stepData.selectRange) {
        personSelectorFilter.value = stepData.selectRange;
    } else {
        personSelectorFilter.value = [];
    }

    // 设置已选择的ID
    const currentSelectedApprovers = getSelectedApprovers(stepData.nodeId);
    personSelectorSelectedIds.value = currentSelectedApprovers.map(user => user.id);

    personSelectorVisible.value = true;
};

// 处理人员选择确认
const handlePersonSelectorConfirm = (data) => {
    if (!currentSelectingStep.value) return;

    const nodeId = currentSelectingStep.value.nodeId;

    // 将选择的人员数据转换为审批人格式
    const selectedApprovers = data.selectedUsers.map(user => ({
        id: user.id,
        name: user.name,
        avatar: user.avatar || ''
    }));

    // 存储用户选择的审批人
    userSelectedApprovers.value[nodeId] = selectedApprovers;

    personSelectorVisible.value = false;
    personSelectorSelectedIds.value = [];
    currentSelectingStep.value = null;

    ElMessage.success(`已选择 ${selectedApprovers.length} 名审批人`);
};

// 处理人员选择取消
const handlePersonSelectorCancel = () => {
    personSelectorVisible.value = false;
    personSelectorSelectedIds.value = [];
    currentSelectingStep.value = null;
};

// 验证用户是否已选择所有需要选择的审批人
const validateApproverSelection = () => {
    const needSelectSteps = flowSteps.value.filter(step =>
        step.needUserSelect && step.nodeId
    );

    for (const step of needSelectSteps) {
        const selectedApprovers = getSelectedApprovers(step.nodeId);
        if (selectedApprovers.length === 0) {
            const errorMessage = `请为"${step.name}"节点选择审批人`;
            ElMessage.error(errorMessage);
            // 移除了 validation-failed 事件
            // emit('validation-failed', { nodeId: step.nodeId, message: errorMessage });
            return false;
        }
    }

    return true;
};

// 构建流程步骤选择数据
const buildFlowStepSelections = () => {
    const selections = [];

    // 遍历所有需要用户选择审批人的步骤
    flowSteps.value.forEach(step => {
        if (step.needUserSelect && step.nodeId) {
            const selectedApprovers = getSelectedApprovers(step.nodeId);
            if (selectedApprovers.length > 0) {
                selections.push({
                    nodeId: step.nodeId,
                    selectedApprovers: selectedApprovers.map(user => ({
                        name: user.name || '未知用户',
                        id: user.id,
                        type: 'user'
                    }))
                });
            }
        }
    });

    return selections;
};

// 防抖函数
let debounceTimer = null;
const debouncedLoadFlowSteps = () => {
    // 设置加载状态，防止提示内容闪烁
    flowStepsLoading.value = true;

    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
        loadFlowSteps();
    }, 500); // 500ms 延迟
};

// 监听必填项值变化（只在必填项变化时触发）
watch(
    () => requiredFields.value.map(item => props.formValues[item.id]),
    () => {
        // 必须所有必填项都填写后才加载
        if (!allRequiredFieldsFilled.value) {
            // 清空流程步骤数据
            flowSteps.value = [];
            return;
        }

        // 必填项填写完成后，才进行防抖加载
        if (props.formId) {
            debouncedLoadFlowSteps();
        }
    }
);

// 对外暴露的方法
defineExpose({
    validateApproverSelection,
    buildFlowStepSelections
});

// 组件挂载时初始化加载流程步骤
onMounted(() => {
    if (props.formId && allRequiredFieldsFilled.value) {
        loadFlowSteps();
    }
});
</script>

<style scoped lang="scss">
/* 流程步骤样式 */
.flow-process-container {
    margin: 0 0 20px 0;
}

.process-title {
    font-size: 18px;
    font-weight: 500;
    color: #303133;
    margin-top: 10px;
    margin-bottom: 20px;
}

.process-steps {
    position: relative;
    margin: 0 10px;
}

.process-step {
    display: flex;
    position: relative;
    margin-bottom: 16px;
}

/* 每个步骤（除了最后一个）显示下方的连接线 */
.process-step:not(.last-step)::after {
    content: '';
    position: absolute;
    left: 13px;
    top: 0;
    height: calc(100% + 16px);
    width: 2px;
    background-color: #dcdfe6;
    z-index: 1;
}

.step-dot {
    width: 28px;
    height: 28px;
    border-radius: 50%;
    background-color: #dcdfe6;
    margin-right: 15px;
    z-index: 2;
    display: flex;
    justify-content: center;
    align-items: center;
    position: relative;
}

.step-dot::after {
    content: '';
    position: absolute;
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background-color: white;
}

.step-content {
    flex: 1;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.step-left {
    flex: 1;
}

.step-right {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    min-width: 170px;
    margin-left: 10px;
}

.step-name {
    font-weight: 500;
    color: #303133;
    margin-bottom: 4px;
}

.step-info {
    font-size: 14px;
    color: #606266;
}

.approver-list-wrapper {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 4px;
}

.approver-list {
    display: flex;
    align-items: flex-start;
    gap: 8px;
}

.approver-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    border-radius: 4px;
    min-width: 50px;
    position: relative;
}

.approver-wrapper {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
}

.remove-btn {
    position: absolute;
    top: -5px;
    right: -5px;
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background-color: #f56c6c;
    color: white;
    border: none;
    cursor: pointer;
    font-size: 12px;
    line-height: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10;
}

.remove-btn:hover {
    background-color: #f78989;
}

.add-approver-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-width: 50px;
}

.add-btn {
    width: 30px;
    height: 30px;
    border-radius: 50%;
    background: #ffffff;
    border: 1px dashed #d0d4d9;
    color: #909399;
    font-size: 16px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
}

.add-btn:hover {
    border-color: #66b1ff;
    color: #66b1ff;
}

.approver-more {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
}

.avatar-counter {
    height: 30px;
    width: 30px;
    border-radius: 50%;
    background-color: #f2f6fc;
    color: #909399;
    font-size: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 1px solid #d9ecff;
}

.approver-name {
    font-size: 13px;
    margin-top: 4px;
    text-align: center;
    color: #606266;
    max-width: 50px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.no-flow-steps {
    padding: 20px 0;
    display: flex;
    justify-content: center;
    align-items: center;
}

.required-fields-tip {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 40px 20px;
    color: #909399;
    
    p {
        margin-top: 16px;
        font-size: 14px;
    }
}

.icon-only-btn {
    padding: 6px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    border-radius: 8px;
    /* 默认样式：白底 + 更深的边框，图标颜色加深 */
    background: #ffffff;
    border: 1px solid #d0d4d9; /* 加深边框 */
    color: #909399; /* 默认图标颜色（加深） */
    box-shadow: none;
    cursor: pointer;
}

.icon-only-btn:hover {
    border-color: #66b1ff; /* 边框变浅蓝 */
    color: #66b1ff; /* 浅蓝色 */
}

/* 加载提示样式 */
.flow-steps-loading {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 12px;
    background-color: #f0f9ff;
    border-radius: 4px;
    color: #409eff;
    font-size: 13px;
    margin-bottom: 12px;
}
</style>