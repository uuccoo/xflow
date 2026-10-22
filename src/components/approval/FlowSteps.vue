<template>
    <div class="task-flow-steps">
        <div class="flow-title">流程</div>
        <div class="flow-steps">
            <!-- 加载中提示 -->
            <div v-if="flowStepsLoading" class="flow-steps-loading">
                <el-icon class="is-loading"><loading /></el-icon>
                <span>加载中...</span>
            </div>

            <!-- 必填项未填写完成的提示 -->
            <div v-else-if="!allRequiredFieldsFilled" class="required-fields-tip">
                <el-icon :size="40" color="#909399">
                    <InfoFilled />
                </el-icon>
                <p>必填信息填写后，流程将自动显示</p>
            </div>

            <!-- 无审批流程的提示 -->
            <div v-else-if="!flowSteps || flowSteps.length === 0" class="no-flow-steps">
                <el-empty description="暂无流程节点" :image-size="80" />
            </div>

            <!-- 审批人节点 -->
            <div v-else class="flow-step" :class="{ 'last-step': index === flowSteps.length - 1 }" v-for="(step, index) in flowSteps" :key="index">
                <div class="step-dot" :class="{
                    'active': step.status === FlowNodeStatus.ACTIVE,
                    'completed': step.status === FlowNodeStatus.COMPLETED
                }"></div>
                <div class="step-content">
                    <div class="step-name-row">
                        <div class="step-name">{{ step.name }}</div>
                        <div class="step-completed-time" v-if="step.completedTime">{{ step.completedTime }}</div>
                        <div class="step-active-status" v-if="!step.completedTime && step.status === FlowNodeStatus.ACTIVE">
                            {{ step.nodeType === FlowNodeType.INITIATE ? '发起中' : '审批中' }}
                        </div>
                    </div>
                    <!-- 显示空处理人提示 -->
                    <div class="step-empty-approver-tip" v-if="step.emptyApprover">
                        {{ getEmptyApproverTip(step) }}
                    </div>
                    <!-- 显示操作信息或步骤描述 -->
                    <div class="step-desc">
                        {{ getStepDesc(step) }}
                    </div>
                    <!-- 显示审批意见 -->
                    <div class="step-opinion" v-if="step.content">
                        {{ step.content }}
                    </div>
                    <!-- 加签信息：显示添加的审批人/办理人（已完成步骤） -->
                    <div
                        class="step-add-sign-info"
                        v-if="shouldShowAddSignInfo(step)">
                        <span class="add-sign-label">{{ getAddSignLabel(step) }}</span>
                        <span class="add-sign-names">{{ getAddSignUserNames(step) }}</span>
                    </div>
                    <!-- 未完成且有多个审批人时显示审批人列表 -->
                    <div class="step-approver" v-if="!needUserSelect(step) && step.status !== FlowNodeStatus.COMPLETED && getApproversForStep(step).length > 1">
                        <!-- 显示审批人列表 -->
                        <div v-if="getApproversForStep(step).length > 0" class="approver-list">
                            <UserAvatar
                                v-for="(user, idx) in getApproversForStep(step).slice(0, 3)"
                                :key="user.id || idx"
                                :user="user"
                            />
                            <!-- 如果超过3个，显示额外数量 -->
                            <div v-if="getApproversForStep(step).length > 3" class="approver-more">
                                <div class="avatar-counter">+{{ getApproversForStep(step).length - 3 }}</div>
                                <span class="approver-name">更多</span>
                            </div>
                        </div>
                        <!-- 无审批人的提示 -->
                        <div v-else class="no-approvers">
                            未指定审批人
                        </div>
                    </div>
                    <!-- 已完成的抄送节点显示抄送人列表 -->
                    <div class="step-approver" v-if="step.nodeType === FlowNodeType.CC && step.status === FlowNodeStatus.COMPLETED">
                        <div v-if="getCcUsersForStep(step).length > 0" class="approver-list">
                            <UserAvatar
                                v-for="(user, idx) in getCcUsersForStep(step).slice(0, 3)"
                                :key="user.id || idx"
                                :user="user"
                            />
                            <div v-if="getCcUsersForStep(step).length > 3" class="approver-more">
                                <div class="avatar-counter">+{{ getCcUsersForStep(step).length - 3 }}</div>
                                <span class="approver-name">更多</span>
                            </div>
                        </div>
                        <div v-else class="no-approvers">
                            未指定抄送人
                        </div>
                    </div>
                    <!-- 需要用户选择审批人时显示 -->
                    <div v-if="needUserSelect(step)" class="step-approver">
                        <div v-if="getApproversForStep(step).length || needUserSelect(step)" class="approver-list-wrapper">
                            <div class="approver-list">
                                <!-- 显示已选择的审批人 -->
                                <div
                                    v-for="(user, idx) in getApproversForStep(step).slice(0, 3)"
                                    :key="user.id"
                                    class="approver-item">
                                    <div class="approver-wrapper">
                                        <UserAvatar :user="user" :size="30" />
                                        <!-- 删除审批人按钮 -->
                                        <button
                                            class="remove-btn"
                                            type="button"
                                            aria-label="删除审批人"
                                            @click="removeApprover(step, user.id)">
                                            ×
                                        </button>
                                    </div>
                                </div>
                                <!-- 如果超过3个，显示额外数量 -->
                                <div v-if="getApproversForStep(step).length > 3" class="approver-more">
                                    <div class="avatar-counter">+{{ getApproversForStep(step).length - 3 }}</div>
                                    <span class="approver-name">更多</span>
                                </div>
                                <!-- 添加审批人按钮 -->
                                <div class="add-approver-item">
                                    <button class="icon-only-btn add-btn" type="button" aria-label="添加审批人" @click="openPersonSelector(step)">
                                        <el-icon :size="20"><Plus /></el-icon>
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
import { ref, watch, onMounted, onBeforeUnmount, computed } from 'vue';
import { Plus, Loading, InfoFilled } from '@element-plus/icons-vue';
import { FlowNodeStatus } from '@/enums/flowNodeStatus';
import { FlowNodeType } from '@/enums/flowNodeType';
import { NodeOperationType } from '@/enums/flowNodeOperationType';
import { flowStepsApi } from '@/api';
import UserAvatar from '@/components/common/UserAvatar.vue';
import PersonSelector from '@/components/common/PersonSelector.vue';
import { collectRequiredConditionFields, isRequiredValueEmpty } from '@/utils/formItems';

// Props 定义
const props = defineProps({
    // 编辑模式
    edit: {
        type: Boolean,
        default: false
    },
    // 表单实例ID
    formInstanceId: {
        type: String,
        default: ''
    },
    // 表单数据
    formData: {
        type: Object,
        default: () => ({})
    },
    // 表单项配置
    formItems: {
        type: Array,
        default: () => []
    }
});

// 组件内部管理的流程步骤数据
const flowSteps = ref([]);

// Emits 定义
const emit = defineEmits([]);

// 人员选择器相关状态
const personSelectorVisible = ref(false);
const personSelectorTitle = ref('选择审批人');
const personSelectorFilter = ref([]);
const personSelectorSingleMode = ref(false);
const personSelectorSelectedIds = ref([]);
const currentSelectingStep = ref(null);

// 用户选择的审批人数据
const userSelectedApprovers = ref({});

// 流程加载状态
const flowStepsLoading = ref(false);

// 防抖定时器
let debounceTimer = null;

// 获取流程条件相关的必填项
const requiredFields = computed(() => {
    return collectRequiredConditionFields(props.formItems);
});

// 检查所有必填项是否已填写
const allRequiredFieldsFilled = computed(() => {
    // 非编辑模式时不进行必填项检查
    if (!props.edit) {
        return true;
    }
    
    if (requiredFields.value.length === 0) {
        return true;
    }
    
    return requiredFields.value.every(item => {
        const value = props.formData[item.id];
        return !isRequiredValueEmpty(item, value);
    });
});

// 加载流程步骤
const loadFlowSteps = async () => {
    if (!props.formInstanceId) {
        return;
    }

    // 编辑模式下,必填项未填写完成时不加载
    if (props.edit && !allRequiredFieldsFilled.value) {
        flowSteps.value = [];
        return;
    }

    flowStepsLoading.value = true;

    try {
        let responseData;
        // 根据是否编辑模式调用不同的接口获取流程步骤数据
        if (props.edit) {
            responseData = await flowStepsApi.getFlowStepsForEdit({
                formInstanceId: props.formInstanceId,
                formData: { ...props.formData },
            });
        } else {
            responseData = await flowStepsApi.getFlowStepsForView(props.formInstanceId);
        }

        if (responseData) {
            flowSteps.value = responseData.flowSteps || [];
            // 初始化接口返回的流程步骤选择数据
            initFlowStepSelections(responseData.flowStepSelections);
        }
    } catch (error) {
        console.error('获取流程步骤失败:', error);
    } finally {
        flowStepsLoading.value = false;
    }
};

// 防抖加载流程步骤
const debouncedLoadFlowSteps = () => {
    // 设置加载状态，防止提示内容闪烁
    flowStepsLoading.value = true;

    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
        loadFlowSteps();
    }, 500);
};

// 判断步骤是否需要选择审批人
const needUserSelect = (step) => {
    return props.edit && step.needUserSelect;
};

// 获取指定节点用户选择的审批人
const getSelectedApprovers = (nodeId) => {
    return userSelectedApprovers.value[nodeId] || [];
};

// 获取步骤的审批人数据
const getApproversForStep = (step) => {
    if (needUserSelect(step) && step.nodeId) {
        return getSelectedApprovers(step.nodeId);
    }
    return step.handlerUsers || [];
};

// 获取抄送节点的抄送人列表
const getCcUsersForStep = (step) => {
    if (!step || step.nodeType !== FlowNodeType.CC) {
        return [];
    }
    if (!Array.isArray(step.ccUsers)) {
        return [];
    }
    return step.ccUsers
        .map(item => item && item.user)
        .filter(Boolean);
};

// 获取用户真实姓名，带默认值
const getUserRealName = (user) => {
    return user?.name || user?.realName || '未知用户';
};

// 获取转交后缀
const getTransferSuffix = (step) => {
    if (step?.emptyApprover) {
        return '（自动转交）';
    }

    const firstApprover = getApproversForStep(step)?.[0];
    return firstApprover?.transferred === true ? '（转交）' : '';
};

// 获取步骤描述
const getStepDesc = (step) => {
    // 获取当前步骤的所有审批人列表
    const approvers = getApproversForStep(step);
    const ccUsers = getCcUsersForStep(step);
    
    // 根据步骤状态显示不同的描述信息
    if (step.status === FlowNodeStatus.COMPLETED) {
        if (step.nodeType === FlowNodeType.CC) {
            if (ccUsers.length === 1) {
                return getUserRealName(ccUsers[0]);
            }
            if (ccUsers.length > 1) {
                return `抄送${ccUsers.length}人`;
            }
            return '未指定抄送人';
        }
        // 已完成的步骤：显示操作人和操作信息
        // 审批人为空系统自动处理的类型，不显示操作人姓名
        const emptyOperationTypes = [
            NodeOperationType.EMPTY_AUTO_APPROVE,
            NodeOperationType.EMPTY_AUTO_REJECT,
            NodeOperationType.EMPTY_TRANSFER_MANAGER,
            NodeOperationType.EMPTY_TRANSFER_SPECIFIC
        ];
        if (emptyOperationTypes.includes(step.operationType)) {
            return '';
        }
        const operatorName = getUserRealName(step.completedBy); // 获取完成该步骤的操作人姓名
        const operationInfo = getOperationInfo(step); // 获取操作类型信息（如转交、退回等）
        return `${operatorName}${operationInfo}`; // 返回操作人姓名 + 操作信息
    } else if (step.status === FlowNodeStatus.ACTIVE) {
        // 进行中的步骤：显示审批中信息
        if (approvers.length === 1) {
            // 只有一个审批人时，直接显示审批人姓名，并在转交场景下补充后缀
            return `${getUserRealName(approvers[0])}${getTransferSuffix(step)}`;
        } else if (approvers.length > 1) {
            // 多个审批人时，显示人数统计
            return `${approvers.length}人审批`;
        } else {
            // 没有审批人时，显示未指定提示
            return '未指定审批人';
        }
    } else {
        // 未完成的步骤：显示待审批信息
        // 如果需要用户选择且还没选择
        if (needUserSelect(step)) {
            if (approvers.length === 0) {
                return '等待选择审批人';
            } else if (approvers.length === 1) {
                return `已选择${getUserRealName(approvers[0])}`;
            } else {
                return `已选择${approvers.length}人`;
            }
        }
        // 审批人为空系统自动处理的类型，不显示处理人姓名
        if (step.emptyApprover && (step.emptyApproverAction === 'auto_pass' || step.emptyApproverAction === 'auto_reject')) {
            return '';
        }
        // 已指定审批人的情况
        if (approvers.length === 1) {
            // 只有一个审批人时，直接显示审批人姓名
            return getUserRealName(approvers[0]);
        } else if (approvers.length > 1) {
            // 多个审批人时，显示人数统计
            return `${approvers.length}人审批`;
        } else {
            // 没有审批人时，显示未指定提示
            return '未指定审批人';
        }
    }
};

// 获取空处理人提示文案
const getEmptyApproverTip = (step) => {
    if (step?.status !== FlowNodeStatus.WAITING) {
        return '';
    }
    return getEmptyApproverActionText(step?.emptyApproverAction);
};

// 获取空审批人处理方式文本
const getEmptyApproverActionText = (action) => {
    const actionMap = {
        auto_pass: '审批人为空，将自动通过',
        auto_reject: '审批人为空，将自动拒绝',
        transfer_manager: '审批人为空，将自动转交给管理员',
        transfer_specific: '审批人为空，将自动转交给指定人员'
    };
    return actionMap[action] || '未指定处理方式';
};

// 获取操作信息
const getOperationInfo = (step) => {
    if (!step.operationType) {
        return '';
    }
    
    const { operationType, operationDetails } = step;

    // 加签操作：显示“(加签)”后缀（按产品要求，不在此处展示“加签给谁”）
    if (operationType === NodeOperationType.ADD_SIGN) {
        return '(加签)';
    }
    
    // 转交操作
    if (operationType === NodeOperationType.TRANSFER) {
        const targetUser = operationDetails?.targetUser;
        if (targetUser) {
            const userName = getUserRealName(targetUser);
            return `（已转交给 ${userName}）`;
        }
    }
    
    // 退回操作
    if (operationType === NodeOperationType.RETURN) {
        return `（已退回）`;
    }
    
    // 拒绝操作
    if (operationType === NodeOperationType.REJECT) {
        return `（已拒绝）`;
    }
    
    // 同意操作
    if (operationType === NodeOperationType.APPROVE) {
        return `（已同意）`;
    }
    
    return '';
};

// 是否展示加签信息行（仅已完成步骤）
const shouldShowAddSignInfo = (step) => {
    if (!step || step.status !== FlowNodeStatus.COMPLETED) {
        return false;
    }
    if (step.operationType !== NodeOperationType.ADD_SIGN) {
        return false;
    }
    const addedUsers = step?.operationDetails?.addedUsers;
    return Array.isArray(addedUsers) && addedUsers.length > 0;
};

// 加签信息行 label：审批人节点显示“添加审批人”，办理人节点显示“添加办理人”
const getAddSignLabel = (step) => {
    if (step?.nodeType === FlowNodeType.HANDLE) {
        return '添加办理人：';
    }
    // 默认按审批节点处理
    return '添加审批人：';
};

// 获取加签用户姓名列表
const getAddSignUserNames = (step) => {
    const addedUsers = step?.operationDetails?.addedUsers;
    if (!Array.isArray(addedUsers) || addedUsers.length === 0) {
        return '';
    }
    return addedUsers
        .map(user => getUserRealName(user))
        .filter(Boolean)
        .join('、');
};

// 删除审批人
const removeApprover = (step, userId) => {
    if (!step.nodeId || !userSelectedApprovers.value[step.nodeId]) return;

    userSelectedApprovers.value[step.nodeId] = userSelectedApprovers.value[step.nodeId].filter(
        user => user.id !== userId
    );

    ElMessage.success('已删除审批人');
};

// 打开人员选择器
const openPersonSelector = (step) => {
    currentSelectingStep.value = step;
    personSelectorTitle.value = `选择审批人 - ${step.name}`;

    // 设置选择模式
    personSelectorSingleMode.value = step.selectMode === 'single';

    // 设置过滤条件
    if (step.selectRangeType === 'specified' && step.selectRange) {
        personSelectorFilter.value = step.selectRange;
    } else {
        personSelectorFilter.value = [];
    }

    // 设置已选择的ID
    const currentSelectedApprovers = getSelectedApprovers(step.nodeId);
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

// 初始化接口返回的流程步骤选择数据
const initFlowStepSelections = (flowStepSelections) => {
    if (!flowStepSelections || flowStepSelections.length === 0) {
        return;
    }

    // 将接口返回的 flowStepSelections 转换为 userSelectedApprovers 格式
    flowStepSelections.forEach(selection => {
        if (selection.nodeId && selection.selectedApprovers && selection.selectedApprovers.length > 0) {
            userSelectedApprovers.value[selection.nodeId] = selection.selectedApprovers.map(approver => ({
                id: approver.id,
                name: approver.name || '未知用户',
                avatar: approver.avatar || ''
            }));
        }
    });
};

// 验证用户是否已选择所有需要选择的审批人
const validateApproverSelection = () => {
    const needSelectSteps = flowSteps.value.filter(step =>
        needUserSelect(step) && step.nodeId
    );

    for (const step of needSelectSteps) {
        const selectedApprovers = getSelectedApprovers(step.nodeId);
        if (selectedApprovers.length === 0) {
            const errorMessage = `请为"${step.name}"节点选择审批人`;
            ElMessage.error(errorMessage);
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
        if (needUserSelect(step) && step.nodeId) {
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

// 监听必填项值变化（只在必填项变化时触发）
watch(
    () => requiredFields.value.map(item => props.formData[item.id]),
    () => {
        if (!props.formInstanceId) {
            return;
        }

        // 编辑模式下必须所有必填项都填写后才加载
        if (props.edit && !allRequiredFieldsFilled.value) {
            flowSteps.value = [];
            return;
        }

        debouncedLoadFlowSteps();
    }
);

// 组件挂载时初始化
onMounted(() => {
    loadFlowSteps();
});

// 组件卸载前清理定时器
onBeforeUnmount(() => {
    if (debounceTimer) {
        clearTimeout(debounceTimer);
        debounceTimer = null;
    }
});

// 对外暴露的方法
defineExpose({
    validateApproverSelection,
    buildFlowStepSelections
});
</script>

<style scoped lang="scss">
/* 任务详情中的流程步骤样式 */
.task-flow-steps {
    margin: 0 0 20px 0;
}

.flow-title {
    font-size: 16px;
    font-weight: 500;
    margin: 0 0 15px 0;
    padding-left: 12px;
    border-left: 3px solid #409eff;
}

.flow-steps {
    position: relative;
    margin: 0 10px;
}

.flow-step {
    display: flex;
    position: relative;
    margin-bottom: 16px;
}

/* 每个步骤（除了最后一个）显示下方的连接线 */
.flow-step:not(.last-step)::after {
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

.step-dot.active {
    background-color: #409eff;
}

.step-dot.completed {
    background-color: #67c23a;
}

.step-dot.active::after,
.step-dot.completed::after {
    background-color: white;
}

.step-content {
    flex: 1;
}

.step-name-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 4px;
}

.step-completed-time {
    color: #909399;
    font-weight: normal;
}

.step-active-status {
    color: #409eff;
    font-weight: normal;
}

.step-name {
    font-weight: 500;
}

.step-desc {
    font-size: 13px;
    color: #909399;
    margin-top: 4px;
    line-height: 1.5;
}

.step-empty-approver-tip {
    font-size: 13px;
    color: #909399;
    margin-top: 4px;
    line-height: 1.5;
}

.step-opinion {
    font-size: 13px;
    color: #303133;
    margin-top: 8px;
    padding: 8px 12px;
    background-color: #f5f7fa;
    border-radius: 4px;
    line-height: 1.5;
}

.step-add-sign-info {
    margin-top: 8px;
    font-size: 13px;
    line-height: 1.5;
}

.add-sign-label {
    color: #909399;
}

.add-sign-names {
    color: #409EFF;
}

.step-info {
    font-size: 14px;
    color: #606266;
}

.step-approver {
    font-size: 14px;
    color: #409EFF;
    padding: 4px;
}

.approver-list {
    display: flex;
    align-items: flex-start;
    gap: 8px;
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

.no-approvers {
    color: #909399;
    font-size: 13px;
}

.approver-list-wrapper {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
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

.icon-only-btn {
    padding: 6px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border-radius: 8px;
    background: #ffffff;
    border: 1px solid #d0d4d9;
    color: #909399;
    box-shadow: none;
    cursor: pointer;
}

.icon-only-btn:hover {
    border-color: #66b1ff;
    color: #66b1ff;
}

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