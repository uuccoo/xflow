<template>
    <div class="node-setting-form">
        <el-form label-position="top">
            <el-form-item label="请选择办理人">
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
                    title="选择办理人"
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
                    找不到主管时，由上级主管代办理
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
                <span style="color: #909399;">发起人自己作为办理人进行办理</span>
            </el-form-item>

            <el-divider></el-divider>
            <!-- 处理方式 -->
            <el-form-item label="多人办理时的办理方式">
                <el-radio-group v-model="approvalMode" class="approval-mode-radio-group">
                    <div class="radio-item">
                        <el-radio label="sequential">顺序会签 (按顺序依次办理)</el-radio>
                    </div>
                    <div class="radio-item">
                        <el-radio label="parallel">会签 (可同时办理)</el-radio>
                    </div>
                    <div class="radio-item">
                        <el-radio label="anyone">或签 (有一人办理即可)</el-radio>
                    </div>
                </el-radio-group>
            </el-form-item>
        </el-form>
    </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'
import { QuestionFilled } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import DesignatedPersonSelector from '../../common/DesignatedPersonSelector.vue'

// 接收节点数据
const props = defineProps({
    node: {
        type: Object,
        required: true
    }
})

// 办理人类型
const handlerType = ref('designated')
// 办理人列表
const handlers = ref([])
// 处理方式
const approvalMode = ref('sequential')
// 发起人自选模式
const initiatorSelectMode = ref('single')
// 自选范围类型
const initiatorSelectRangeType = ref('all')
// 自选人员范围
const initiatorSelectRange = ref([])
// 角色列表
const roles = ref([])
// 主管级别
const managerType = ref(1)
// 找不到主管时上级代办理
const fallbackToHigherManager = ref(false)
// 审批终点
const approvalEndPoint = ref('top_manager')
// 具体级别
const specificLevel = ref(1)

// 初始化表单数据
const initFormData = () => {
    // 确保节点有 props 属性
    if (!props.node.props) {
        props.node.props = {}
    }

    // 初始化办理人类型
    handlerType.value = props.node.props.handlerType || 'designated'

    // 初始化办理人列表
    handlers.value = props.node.props.handlers || []

    // 初始化处理方式
    approvalMode.value = props.node.props.mode || 'sequential'

    // 初始化发起人自选相关
    initiatorSelectMode.value = props.node.props.initiatorSelectMode || 'single'
    initiatorSelectRangeType.value = props.node.props.initiatorSelectRangeType || 'all'
    initiatorSelectRange.value = props.node.props.initiatorSelectRange || []

    // 初始化部门主管相关
    managerType.value = props.node.props.managerType || 1
    fallbackToHigherManager.value = props.node.props.fallbackToHigherManager || false

    // 初始化审批终点
    approvalEndPoint.value = props.node.props.approvalEndPoint || 'top_manager'
    specificLevel.value = props.node.props.specificLevel || 1

    // 初始化角色列表
    roles.value = props.node.props.roles || []
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
        ElMessage.warning('请至少选择一名办理人')
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

    // 构建新的 props 对象
    const newProps = {
        handlerType: handlerType.value,
        mode: approvalMode.value
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