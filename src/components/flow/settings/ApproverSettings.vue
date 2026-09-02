<template>
    <div class="node-setting-form">
        <el-form label-position="top">
            <el-form-item label="请选择审批人">
                <el-radio-group v-model="form.handlerType" class="approver-type-selector">
                    <el-radio label="designated">
                        <div class="option-content">指定人员</div>
                    </el-radio>
                    <el-radio label="initiator_select">
                        <div class="option-content">发起人自选</div>
                    </el-radio>
                    <el-radio label="multi_level_manager">
                        <div class="option-content">连续多级主管</div>
                    </el-radio>
                    <el-radio label="department_manager">
                        <div class="option-content">部门主管</div>
                    </el-radio>
                    <el-radio label="role">
                        <div class="option-content">角色</div>
                    </el-radio>
                    <el-radio label="initiator_self">
                        <div class="option-content">发起人自己</div>
                    </el-radio>
                </el-radio-group>
            </el-form-item>

            <!-- 指定人员的设置 -->
            <el-form-item v-if="form.handlerType === 'designated'" label-position="left" required :error="getErrorMessage(nodeId, HANDLER_FIELD.HANDLERS)">
                <designated-person-selector
                    v-model="form.handlers"
                    title="选择审批人"
                    button-text="添加"
                    :required="true"
                    :selectable-types="['user']"
                    @update:modelValue="validateHandlers(nodeId, form.handlers, form.handlerType)"
                />
            </el-form-item>

            <!-- 发起人自选的子选项 -->
            <el-form-item v-if="form.handlerType === 'initiator_select'" label="选择方式">
                <div class="initiator-select-options">
                    <el-button :class="{ 'active': form.initiatorSelectMode === 'single' }"
                        @click="form.initiatorSelectMode = 'single'">
                        自选一个人
                    </el-button>
                    <el-button :class="{ 'active': form.initiatorSelectMode === 'multiple' }"
                        @click="form.initiatorSelectMode = 'multiple'">
                        自选多个人
                    </el-button>
                </div>
            </el-form-item>

            <!-- 发起人自选范围类型选择 -->
            <el-form-item v-if="form.handlerType === 'initiator_select'" label="用户可选范围">
                <el-select v-model="form.initiatorSelectRangeType" placeholder="请选择范围" style="width: 100%">
                    <el-option label="所有人" value="all"></el-option>
                    <el-option label="指定人员" value="specified"></el-option>
                </el-select>
            </el-form-item>

            <!-- 发起人自选需要从哪些人中选择 -->
            <el-form-item v-if="form.handlerType === 'initiator_select' && form.initiatorSelectRangeType === 'specified'"
                label-position="left" required :error="getErrorMessage(nodeId, HANDLER_FIELD.INITIATOR_SELECT_RANGE)">
                <designated-person-selector
                    v-model="form.initiatorSelectRange"
                    title="选择发起人自选范围"
                    button-text="添加"
                    :required="true"
                    :single-mode="form.initiatorSelectMode === 'single'"
                    :selectable-types="['user']"
                    @update:modelValue="validateInitiatorSelectRange(nodeId, form.initiatorSelectRange, form.handlerType, form.initiatorSelectRangeType)"
                />
            </el-form-item>

            <!-- 角色设置 -->
            <el-form-item v-if="form.handlerType === 'role'" label-position="left" required :error="getErrorMessage(nodeId, HANDLER_FIELD.ROLES)">
                <designated-person-selector
                    v-model="form.roles"
                    title="选择角色"
                    button-text="添加"
                    :required="true"
                    :selectable-types="['role']"
                    @update:modelValue="validateRoles(nodeId, form.roles, form.handlerType)"
                />
            </el-form-item>

            <!-- 部门主管设置 -->
            <el-form-item v-if="form.handlerType === 'department_manager'" label="部门主管">
                <div style="display: flex; align-items: center; gap: 10px;">
                    <span>发起人的</span>
                    <el-select v-model="form.managerType" placeholder="请选择主管类型" style="width: 200px;">
                        <el-option v-for="i in 20" :key="i" :label="i === 1 ? '直接主管' : `第${i}级主管`"
                            :value="i"></el-option>
                    </el-select>
                </div>
                <el-checkbox v-model="form.fallbackToHigherManager">
                    找不到主管时，由上级主管代审批
                    <el-tooltip content="当无法找到指定主管时，自动转交给上级主管处理" placement="top">
                        <el-icon>
                            <QuestionFilled />
                        </el-icon>
                    </el-tooltip>
                </el-checkbox>
            </el-form-item>

            <!-- 连续多级主管设置 -->
            <el-form-item v-if="form.handlerType === 'multi_level_manager'" label="审批终点">
                <el-radio-group v-model="form.approvalEndPoint" class="approval-endpoint-group">
                    <div class="radio-item">
                        <el-radio label="top_manager">
                            <span class="radio-label">直到最上层主管</span>
                        </el-radio>
                    </div>
                    <div class="radio-item">
                        <el-radio label="specific_level">
                            <span class="radio-label">不超过发起人的</span>
                            <el-select v-model="form.specificLevel" placeholder="请选择级别"
                                style="width: 200px; margin-left: 8px;">
                                <el-option v-for="i in 20" :key="i" :label="i === 1 ? '直接主管' : `第${i}级主管`"
                                    :value="i"></el-option>
                            </el-select>
                        </el-radio>
                    </div>
                </el-radio-group>
            </el-form-item>

            <!-- 发起人自己 -->
            <el-form-item v-if="form.handlerType === 'initiator_self'" label="发起人自己">
                <span style="color: #909399;">发起人自己作为审批人进行审批</span>
            </el-form-item>

            <el-divider></el-divider>

            <!-- 多人审批方式 -->
            <el-form-item label="多人审批时的审批方式">
                <el-radio-group v-model="form.approvalMode" class="approval-mode-radio-group">
                    <div class="radio-item">
                        <el-radio label="sequential">顺序会签 (按选择顺序审批，每个人必须同意)</el-radio>
                    </div>
                    <div class="radio-item">
                        <el-radio label="parallel">会签 (可同时审批，每个人必须同意)</el-radio>
                    </div>
                    <div class="radio-item">
                        <el-radio label="anyone">或签 (有一人同意即可)</el-radio>
                    </div>
                </el-radio-group>
            </el-form-item>

            <el-divider></el-divider>

            <!-- 高级设置部分 -->
            <div class="advanced-settings-section">
                <!-- <div class="section-title">高级设置</div> -->

                <!-- 审批人为空时 -->
                <div class="setting-item">
                    <div class="setting-label">
                        <span class="icon-user">审批人为空时</span>
                    </div>
                    <div class="setting-options">
                        <el-radio-group v-model="form.emptyApproverAction">
                            <el-radio label="auto_pass">自动通过</el-radio>
                            <el-radio label="auto_reject">自动驳回</el-radio>
                            <el-radio label="transfer_manager">转交到管理员</el-radio>
                            <el-radio label="transfer_specific">转交到指定人员</el-radio>
                        </el-radio-group>
                    </div>
                </div>
                
                <!-- 转交到指定人员的选择器 -->
                <el-form-item v-if="form.emptyApproverAction === 'transfer_specific'" label-position="left" required
                    :error="getErrorMessage(nodeId, HANDLER_FIELD.EMPTY_APPROVER_TRANSFER_USER)" style="margin-top: 15px;">
                    <designated-person-selector
                        v-model="form.emptyApproverTransferUser"
                        title="选择转交人员"
                        button-text="添加人员"
                        :required="true"
                        :single-mode="true"
                        :selectable-types="['user']"
                        @update:modelValue="validateEmptyApproverTransferUser(nodeId, form.emptyApproverTransferUser, form.emptyApproverAction)"
                    />
                </el-form-item>
            </div>
        </el-form>
    </div>
</template>

<script setup>
import { reactive, onMounted, ref } from 'vue'
import { QuestionFilled } from '@element-plus/icons-vue'
import DesignatedPersonSelector from '../../common/DesignatedPersonSelector.vue'
import { FlowNodeType } from '@/enums'
import { getNodeProps } from '@/constants/nodeTypeConfig'
import { getErrorMessage } from '@/validation/flow/error'
import {
    HANDLER_FIELD,
    validateHandlers,
    validateInitiatorSelectRange,
    validateRoles,
    validateEmptyApproverTransferUser,
} from '@/validation/flow/handlerValidator'

const props = defineProps({
    nodeId: {
        type: String,
        required: true,
    },
})

const nodeProps = defineModel({
    type: Object,
    required: true
})

const nodeId = props.nodeId

const createDefaultForm = () => getNodeProps(FlowNodeType.APPROVE)

// 表单草稿，编辑过程中不直接修改父组件的 nodeProps
const form = reactive(createDefaultForm())
// 保存打开时的表单快照，用于判断用户是否产生了未保存修改
const initialFormSnapshot = ref('')

// 获取表单字段的快照，用于判断表单是否有修改
const getFormSnapshot = () => JSON.stringify(form)

// 初始化表单数据
const initFormData = () => {
    Object.assign(form, createDefaultForm(), JSON.parse(JSON.stringify(nodeProps.value || {})))
    // 快照必须在数据装载完成后记录
    initialFormSnapshot.value = getFormSnapshot()
}

// 组件挂载时初始化数据
onMounted(() => {
    initFormData()
})

// 向父组件暴露保存方法
const saveSettings = () => {
    // 构建新的 props 对象
    const newProps = {
        // 基础字段
        handlerType: form.handlerType,
        approvalMode: form.approvalMode,
        
        // 高级设置（通用）
        emptyApproverAction: form.emptyApproverAction,
    }
    
    // 如果选择了转交到指定人员，保存转交人员信息
    if (form.emptyApproverAction === 'transfer_specific') {
        // 保存完整的用户对象数组
        newProps.emptyApproverTransferUser = form.emptyApproverTransferUser
    }

    // 根据处理人类型添加特定配置
    switch (form.handlerType) {
        case 'designated':
            newProps.handlers = form.handlers
            break
        case 'role':
            newProps.roles = form.roles
            break
        case 'initiator_select':
            newProps.initiatorSelectMode = form.initiatorSelectMode
            newProps.initiatorSelectRangeType = form.initiatorSelectRangeType
            newProps.initiatorSelectRange = form.initiatorSelectRange
            break
        case 'department_manager':
            newProps.managerType = form.managerType
            newProps.fallbackToHigherManager = form.fallbackToHigherManager
            break
        case 'multi_level_manager':
            newProps.approvalEndPoint = form.approvalEndPoint
            newProps.specificLevel = form.specificLevel
            break
        case 'position_manager':
            newProps.position = position.value
            break
    }

    // 只有保存成功时才将编辑草稿写回父组件
    nodeProps.value = JSON.parse(JSON.stringify(newProps))

    return true
}

// 判断表单是否有修改，关闭抽屉前由父组件调用
const isFormChanged = () => getFormSnapshot() !== initialFormSnapshot.value

// 将方法暴露给父组件
defineExpose({
    saveSettings,
    isFormChanged
})
</script>

<style scoped lang="scss">
.node-setting-form {
    margin-bottom: 40px;
}

.approver-type-selector {
    display: flex;
    flex-wrap: wrap;
    padding: 10px 0px;
    border: 1px solid #dcdfe6;
    border-radius: 4px;
    overflow: hidden;

    .el-radio {
        margin-right: 0;
        padding: 10px;
        width: 33.33%;
        height: 40px;
        display: flex;
        align-items: center;

        .option-content {
            margin-left: 5px;
        }
    }
}

.select-personnel.el-button {
    margin-right: 10px;

    .el-icon {
        margin-right: 4px;
        vertical-align: middle;
    }
}

.selected-users {
    margin-top: 10px;
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
}

.initiator-select-options {
    display: flex;
    gap: 10px;

    .el-button {
        padding: 8px 16px;
        border-radius: 4px;
        transition: background-color 0.3s, color 0.3s;

        &.active {
            background-color: #409EFF;
            color: #fff;
        }
    }
}

.approval-mode-radio-group {
    display: block;

    .radio-item {
        margin-bottom: 10px;
    }
}

.advanced-settings-section {
    padding-top: 20px;

    .section-title {
        font-size: 14px;
        font-weight: 500;
        color: #303133;
        margin-bottom: 15px;
    }

    .setting-item {
        margin-bottom: 20px;

        .setting-label {
            font-size: 14px;
            color: #606266;
            margin-bottom: 10px;
            display: flex;
            align-items: center;
            gap: 5px;
        }

        .setting-options {
            display: flex;
            align-items: center;
            gap: 10px;

            .time-limit-input {
                display: flex;
                align-items: center;
                gap: 5px;
            }
        }
    }
}

.approval-endpoint-group {
    display: block;

    .radio-item {
        margin-bottom: 10px;

        .radio-label {
            display: inline-block;
            vertical-align: middle;
            min-width: 100px;
        }

        .el-radio {
            display: flex;
            align-items: center;
        }
    }
}
</style>