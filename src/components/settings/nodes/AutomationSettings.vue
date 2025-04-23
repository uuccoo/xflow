<template>
    <div class="node-setting-form">
        <h3 class="setting-section-title">自动化设置</h3>
        <p class="setting-description">设置自动执行的系统动作</p>
        <el-form label-position="top">
            <el-form-item label="选择动作类型">
                <el-select v-model="actionType" placeholder="请选择动作类型" style="width: 100%">
                    <el-option label="系统通知" value="notification"></el-option>
                    <el-option label="自动更新数据" value="update"></el-option>
                    <el-option label="触发外部系统" value="external"></el-option>
                </el-select>
            </el-form-item>

            <!-- 根据不同动作类型显示不同配置项 -->
            <template v-if="actionType === 'notification'">
                <el-form-item label="通知类型">
                    <el-select v-model="notificationType" placeholder="请选择通知类型" style="width: 100%">
                        <el-option label="邮件通知" value="email"></el-option>
                        <el-option label="短信通知" value="sms"></el-option>
                        <el-option label="内部消息" value="internal"></el-option>
                    </el-select>
                </el-form-item>
                <el-form-item label="通知标题">
                    <el-input v-model="notificationTitle" placeholder="请输入通知标题"></el-input>
                </el-form-item>
                <el-form-item label="通知内容">
                    <el-input type="textarea" v-model="notificationContent" placeholder="请输入通知内容" :rows="4"></el-input>
                </el-form-item>
            </template>

            <template v-else-if="actionType === 'update'">
                <el-form-item label="数据操作">
                    <el-select v-model="dataOperation" placeholder="请选择数据操作" style="width: 100%">
                        <el-option label="新增数据" value="create"></el-option>
                        <el-option label="更新数据" value="update"></el-option>
                        <el-option label="删除数据" value="delete"></el-option>
                    </el-select>
                </el-form-item>
                <el-form-item label="数据源">
                    <el-input v-model="dataSource" placeholder="请输入数据源信息"></el-input>
                </el-form-item>
            </template>

            <template v-else-if="actionType === 'external'">
                <el-form-item label="外部系统 API">
                    <el-input v-model="externalApi" placeholder="请输入外部系统 API"></el-input>
                </el-form-item>
                <el-form-item label="触发方式">
                    <el-radio-group v-model="externalTriggerMethod">
                        <el-radio label="webhook">WebHook</el-radio>
                        <el-radio label="api_call">API 调用</el-radio>
                    </el-radio-group>
                </el-form-item>
            </template>
        </el-form>
    </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'
import { useFlowDesignStore } from '../../../stores/flowDesignStore'
import { ElMessage } from 'element-plus'

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
const actionType = ref('notification')
const notificationType = ref('email')
const notificationTitle = ref('')
const notificationContent = ref('')
const dataOperation = ref('update')
const dataSource = ref('')
const externalApi = ref('')
const externalTriggerMethod = ref('webhook')

// 初始化表单数据
const initFormData = () => {
    // 确保节点有 props 属性
    if (!props.node.props) {
        props.node.props = {}
    }

    // 初始化动作类型
    actionType.value = props.node.props.actionType || 'notification'

    // 初始化通知相关
    notificationType.value = props.node.props.notificationType || 'email'
    notificationTitle.value = props.node.props.notificationTitle || ''
    notificationContent.value = props.node.props.notificationContent || ''

    // 初始化数据操作相关
    dataOperation.value = props.node.props.dataOperation || 'update'
    dataSource.value = props.node.props.dataSource || ''

    // 初始化外部系统相关
    externalApi.value = props.node.props.externalApi || ''
    externalTriggerMethod.value = props.node.props.externalTriggerMethod || 'webhook'
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
    // 确保节点有 props 属性
    if (!props.node.props) {
        props.node.props = {}
    }

    // 保存动作类型
    props.node.props.actionType = actionType.value

    // 根据动作类型保存相关属性
    if (actionType.value === 'notification') {
        props.node.props.notificationType = notificationType.value
        props.node.props.notificationTitle = notificationTitle.value
        props.node.props.notificationContent = notificationContent.value

        // 验证必填项
        if (!notificationTitle.value) {
            ElMessage.warning('请填写通知标题')
            return false
        }
    }
    else if (actionType.value === 'update') {
        props.node.props.dataOperation = dataOperation.value
        props.node.props.dataSource = dataSource.value

        // 验证必填项
        if (!dataSource.value) {
            ElMessage.warning('请填写数据源信息')
            return false
        }
    }
    else if (actionType.value === 'external') {
        props.node.props.externalApi = externalApi.value
        props.node.props.externalTriggerMethod = externalTriggerMethod.value

        // 验证必填项
        if (!externalApi.value) {
            ElMessage.warning('请填写外部系统 API')
            return false
        }
    }

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

.setting-section-title {
    margin-top: 0;
    margin-bottom: 15px;
    font-size: 16px;
    font-weight: 500;
    color: #303133;
}

.setting-description {
    color: #909399;
    font-size: 14px;
    margin-bottom: 20px;
}
</style>