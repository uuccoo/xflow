<template>
    <div class="node-setting-form">
        <el-form label-position="top">
            <el-form-item label="请选择审批人">
                <el-radio-group v-model="handlerType" class="approver-type-selector">
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
            <el-form-item v-if="handlerType === 'designated'" label-position="left" required>
                <designated-person-selector
                    v-model="handlers"
                    title="选择审批人"
                    button-text="添加"
                    :required="true"
                    :selectable-types="['user']"
                />
            </el-form-item>

            <!-- 发起人自选的子选项 -->
            <el-form-item v-if="handlerType === 'initiator_select'" label="选择方式">
                <div class="initiator-select-options">
                    <el-button :class="{ 'active': initiatorSelectMode === 'single' }"
                        @click="initiatorSelectMode = 'single'">
                        自选一个人
                    </el-button>
                    <el-button :class="{ 'active': initiatorSelectMode === 'multiple' }"
                        @click="initiatorSelectMode = 'multiple'">
                        自选多个人
                    </el-button>
                </div>
            </el-form-item>

            <!-- 发起人自选范围类型选择 -->
            <el-form-item v-if="handlerType === 'initiator_select'" label="用户可选范围">
                <el-select v-model="initiatorSelectRangeType" placeholder="请选择范围" style="width: 100%">
                    <el-option label="所有人" value="all"></el-option>
                    <el-option label="指定人员" value="specified"></el-option>
                </el-select>
            </el-form-item>

            <!-- 发起人自选需要从哪些人中选择 -->
            <el-form-item v-if="handlerType === 'initiator_select' && initiatorSelectRangeType === 'specified'"
                label-position="left" required>
                <designated-person-selector
                    v-model="initiatorSelectRange"
                    title="选择发起人自选范围"
                    button-text="添加"
                    :required="true"
                    :single-mode="initiatorSelectMode === 'single'"
                    :selectable-types="['user']"
                />
            </el-form-item>

            <!-- 角色设置 -->
            <el-form-item v-if="handlerType === 'role'" label-position="left" required>
                <designated-person-selector
                    v-model="roles"
                    title="选择角色"
                    button-text="添加"
                    :required="true"
                    :selectable-types="['role']"
                />
            </el-form-item>

            <!-- 部门主管设置 -->
            <el-form-item v-if="handlerType === 'department_manager'" label="部门主管">
                <div style="display: flex; align-items: center; gap: 10px;">
                    <span>发起人的</span>
                    <el-select v-model="managerType" placeholder="请选择主管类型" style="width: 200px;">
                        <el-option v-for="i in 20" :key="i" :label="i === 1 ? '直接主管' : `第${i}级主管`"
                            :value="i"></el-option>
                    </el-select>
                </div>
                <el-checkbox v-model="fallbackToHigherManager">
                    找不到主管时，由上级主管代审批
                    <el-tooltip content="当无法找到指定主管时，自动转交给上级主管处理" placement="top">
                        <el-icon>
                            <QuestionFilled />
                        </el-icon>
                    </el-tooltip>
                </el-checkbox>
            </el-form-item>

            <!-- 连续多级主管设置 -->
            <el-form-item v-if="handlerType === 'multi_level_manager'" label="审批终点">
                <el-radio-group v-model="approvalEndPoint" class="approval-endpoint-group">
                    <div class="radio-item">
                        <el-radio label="top_manager">
                            <span class="radio-label">直到最上层主管</span>
                        </el-radio>
                    </div>
                    <div class="radio-item">
                        <el-radio label="specific_level">
                            <span class="radio-label">不超过发起人的</span>
                            <el-select v-model="specificLevel" placeholder="请选择级别"
                                style="width: 200px; margin-left: 8px;">
                                <el-option v-for="i in 20" :key="i" :label="i === 1 ? '直接主管' : `第${i}级主管`"
                                    :value="i"></el-option>
                            </el-select>
                        </el-radio>
                    </div>
                </el-radio-group>
            </el-form-item>

            <!-- 发起人自己 -->
            <el-form-item v-if="handlerType === 'initiator_self'" label="发起人自己">
                <span style="color: #909399;">发起人自己作为审批人进行审批</span>
            </el-form-item>

            <el-divider></el-divider>

            <!-- 多人审批方式 -->
            <el-form-item label="多人审批时的审批方式">
                <el-radio-group v-model="approvalMode" class="approval-mode-radio-group">
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
                        <el-radio-group v-model="emptyApproverAction">
                            <el-radio label="auto_pass">自动通过</el-radio>
                            <el-radio label="auto_reject">自动驳回</el-radio>
                            <el-radio label="transfer_manager">转交到管理员</el-radio>
                            <el-radio label="transfer_specific">转交到指定人员</el-radio>
                        </el-radio-group>
                    </div>
                </div>
                
                <!-- 转交到指定人员的选择器 -->
                <el-form-item v-if="emptyApproverAction === 'transfer_specific'" label-position="left" required style="margin-top: 15px;">
                    <designated-person-selector
                        v-model="emptyApproverTransferUser"
                        title="选择转交人员"
                        button-text="添加人员"
                        :required="true"
                        :single-mode="true"
                        :selectable-types="['user']"
                    />
                </el-form-item>
                <el-divider></el-divider>

                <!-- 如果审批被驳回 -->
                <div class="setting-item">
                    <div class="setting-label">
                        <span>如果审批被驳回</span>
                    </div>
                    <div class="setting-options">
                        <el-radio-group v-model="rejectAction">
                            <el-radio label="end_flow">直接结束流程</el-radio>
                            <el-radio label="back_previous">驳回到上一级审批节点</el-radio>
                            <el-radio label="back_specific">驳回到指定节点</el-radio>
                        </el-radio-group>
                    </div>
                </div>
                <el-divider></el-divider>

                <!-- 审批同意时是否需要签字 -->
                <div class="setting-item">
                    <div class="setting-label">
                        <span>审批同意时是否需要签字</span>
                    </div>
                    <div class="setting-options">
                        <el-switch v-model="requireSignature" active-text="需要" inactive-text="不用" :active-value="true"
                            :inactive-value="false">
                        </el-switch>
                    </div>
                </div>
                <el-divider></el-divider>

                <!-- 审批期限 -->
                <div class="setting-item">
                    <div class="setting-label">
                        <span>审批期限（为 0 则不生效）</span>
                    </div>
                    <div class="setting-options time-limit-input">
                        <el-input-number v-model="approvalTimeLimit" :min="0"
                            controls-position="right"></el-input-number>
                        <el-select v-model="approvalTimeUnit" style="width: 80px;">
                            <el-option label="小时" value="hour"></el-option>
                            <el-option label="天" value="day"></el-option>
                        </el-select>
                    </div>
                </div>
            </div>
        </el-form>
    </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'
import { QuestionFilled } from '@element-plus/icons-vue'
import { useFlowDesignStore } from '@/stores/flowDesignStore'
import { ElMessage } from 'element-plus'
import DesignatedPersonSelector from '../../common/DesignatedPersonSelector.vue'

// 接收节点数据
const props = defineProps({
    node: {
        type: Object,
        required: true
    }
})

// 使用 store
const flowStore = useFlowDesignStore()

// 表单数据
const handlerType = ref('designated') // 审批人类型
const approvalMode = ref('anyone') // 多人审批方式
const initiatorSelectMode = ref('single') // 发起人自选模式
const initiatorSelectRangeType = ref('all') // 自选范围类型
const managerType = ref(1) // 主管级别
const fallbackToHigherManager = ref(false) // 找不到主管时上级代审批
const emptyApproverAction = ref('auto_pass') // 审批人为空处理方式
const requireSignature = ref(false) // 是否需要签字
const approvalTimeLimit = ref(0) // 审批期限
const approvalTimeUnit = ref('hour') // 时间单位
const rejectAction = ref('end_flow') // 驳回处理方式
const approvalEndPoint = ref('top_manager') // 审批终点
const specificLevel = ref(1) // 具体级别

// 人员列表
const handlers = ref([]) // 审批人列表
const initiatorSelectRange = ref([]) // 发起人自选人员范围
const roles = ref([]) // 角色列表
const emptyApproverTransferUser = ref([]) // 审批人为空时转交的指定人员

// 初始化表单数据
const initFormData = () => {
    // 确保节点有 props 属性
    if (!props.node.props) {
        props.node.props = {}
    }

    // 初始化审批人类型
    handlerType.value = props.node.props.handlerType || 'designated'

    // 初始化审批方式
    approvalMode.value = props.node.props.mode || 'anyone'

    // 初始化发起人自选相关
    initiatorSelectMode.value = props.node.props.initiatorSelectMode || 'single'
    initiatorSelectRangeType.value = props.node.props.initiatorSelectRangeType || 'all'

    // 初始化部门主管相关
    managerType.value = props.node.props.managerType || 1
    fallbackToHigherManager.value = props.node.props.fallbackToHigherManager || false

    // 初始化高级设置
    emptyApproverAction.value = props.node.props.emptyApproverAction || 'auto_pass'
    requireSignature.value = props.node.props.requireSignature || false
    approvalTimeLimit.value = props.node.props.approvalTimeLimit || 0
    approvalTimeUnit.value = props.node.props.approvalTimeUnit || 'hour'
    rejectAction.value = props.node.props.rejectAction || 'end_flow'

    // 初始化审批终点
    approvalEndPoint.value = props.node.props.approvalEndPoint || 'top_manager'
    specificLevel.value = props.node.props.specificLevel || 1

    // 初始化人员列表
    handlers.value = props.node.props.handlers || []
    initiatorSelectRange.value = props.node.props.initiatorSelectRange || []
    roles.value = props.node.props.roles || []
    emptyApproverTransferUser.value = props.node.props.emptyApproverTransferUser || []
}

// 监听节点变化
watch(() => props.node, () => {
    initFormData()
}, { immediate: true, deep: true })

// 组件挂载时初始化数据
onMounted(() => {
    initFormData()
})

// 向父组件暴露保存方法
const saveSettings = () => {
    // 验证必填项
    if (handlerType.value === 'designated' && handlers.value.length === 0) {
        ElMessage.warning('请至少选择一名审批人')
        return false
    }

    if (handlerType.value === 'initiator_select' && initiatorSelectRangeType.value === 'specified' && initiatorSelectRange.value.length === 0) {
        ElMessage.warning('请至少选择一名发起人自选范围人员')
        return false
    }

    if (handlerType.value === 'role' && roles.value.length === 0) {
        ElMessage.warning('请至少选择一个角色')
        return false
    }
    
    // 验证转交到指定人员时必须选择人员
    if (emptyApproverAction.value === 'transfer_specific' && emptyApproverTransferUser.value.length === 0) {
        ElMessage.warning('请选择转交的指定人员')
        return false
    }

    // 构建新的 props 对象
    const newProps = {
        // 基础字段
        handlerType: handlerType.value,
        mode: approvalMode.value,
        
        // 高级设置（通用）
        emptyApproverAction: emptyApproverAction.value,
        requireSignature: requireSignature.value,
        approvalTimeLimit: approvalTimeLimit.value,
        approvalTimeUnit: approvalTimeUnit.value,
        rejectAction: rejectAction.value,
    }
    
    // 如果选择了转交到指定人员，保存转交人员信息
    if (emptyApproverAction.value === 'transfer_specific') {
        // 保存完整的用户对象数组
        newProps.emptyApproverTransferUser = emptyApproverTransferUser.value
    }

    // 根据处理人类型添加特定配置
    switch (handlerType.value) {
        case 'designated':
            newProps.handlers = handlers.value
            break
        case 'role':
            newProps.roles = roles.value
            break
        case 'initiator_select':
            newProps.initiatorSelectMode = initiatorSelectMode.value
            newProps.initiatorSelectRangeType = initiatorSelectRangeType.value
            newProps.initiatorSelectRange = initiatorSelectRange.value
            break
        case 'department_manager':
            newProps.managerType = managerType.value
            newProps.fallbackToHigherManager = fallbackToHigherManager.value
            break
        case 'multi_level_manager':
            newProps.approvalEndPoint = approvalEndPoint.value
            newProps.specificLevel = specificLevel.value
            break
        case 'position_manager':
            newProps.position = position.value
            break
    }

    // 直接替换 props
    props.node.props = newProps

    return true
}

// 将方法暴露给父组件
defineExpose({
    saveSettings
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