<template>
    <div class="node-setting-form">
        <h3 class="setting-section-title">自动化设置</h3>
        <p class="setting-description">设置自动执行的系统动作</p>
        <el-form label-position="top">
            <el-form-item label="选择动作类型">
                <el-select v-model="form.actionType" placeholder="请选择动作类型" style="width: 100%">
                    <el-option label="系统通知" value="notification"></el-option>
                    <el-option label="自动更新数据" value="update"></el-option>
                    <el-option label="触发外部系统" value="external"></el-option>
                </el-select>
            </el-form-item>

            <!-- 根据不同动作类型显示不同配置项 -->
            <template v-if="form.actionType === 'notification'">
                <el-form-item label="通知类型">
                    <el-select v-model="form.notificationType" placeholder="请选择通知类型" style="width: 100%">
                        <el-option label="邮件通知" value="email"></el-option>
                        <el-option label="短信通知" value="sms"></el-option>
                        <el-option label="内部消息" value="internal"></el-option>
                    </el-select>
                </el-form-item>
                <el-form-item label="通知标题">
                    <el-input v-model="form.notificationTitle" placeholder="请输入通知标题"></el-input>
                </el-form-item>
                <el-form-item label="通知内容">
                    <el-input type="textarea" v-model="form.notificationContent" placeholder="请输入通知内容" :rows="4"></el-input>
                </el-form-item>
            </template>

            <template v-else-if="form.actionType === 'update'">
                <el-form-item label="数据操作">
                    <el-select v-model="form.dataOperation" placeholder="请选择数据操作" style="width: 100%">
                        <el-option label="新增数据" value="create"></el-option>
                        <el-option label="更新数据" value="update"></el-option>
                        <el-option label="删除数据" value="delete"></el-option>
                    </el-select>
                </el-form-item>
                <el-form-item label="数据源">
                    <el-input v-model="form.dataSource" placeholder="请输入数据源信息"></el-input>
                </el-form-item>
            </template>

            <template v-else-if="form.actionType === 'external'">
                <el-form-item label="外部系统 API">
                    <el-input v-model="form.externalApi" placeholder="请输入外部系统 API"></el-input>
                </el-form-item>
                <el-form-item label="触发方式">
                    <el-radio-group v-model="form.externalTriggerMethod">
                        <el-radio label="webhook">WebHook</el-radio>
                        <el-radio label="api_call">API 调用</el-radio>
                    </el-radio-group>
                </el-form-item>
            </template>
        </el-form>
    </div>
</template>

<script setup>
import { reactive, onMounted, toRaw, ref } from 'vue'
import { ElMessage } from 'element-plus'

const nodeProps = defineModel({
    type: Object,
    required: true
})

const defaultForm = {
    // 自动化动作类型
    actionType: 'notification',
    // 通知类型
    notificationType: 'email',
    // 通知标题
    notificationTitle: '',
    // 通知内容
    notificationContent: '',
    // 数据操作类型
    dataOperation: 'update',
    // 数据源信息
    dataSource: '',
    // 外部系统 API 地址
    externalApi: '',
    // 外部系统触发方式
    externalTriggerMethod: 'webhook'
}

const form = reactive(structuredClone(defaultForm))
const initialFormSnapshot = ref('')

const getFormSnapshot = () => JSON.stringify(toRaw(form))

// 初始化表单数据
const initFormData = () => {
    Object.assign(form, structuredClone(defaultForm), structuredClone(toRaw(nodeProps.value || {})))
    initialFormSnapshot.value = getFormSnapshot()
}

// 组件挂载时初始化数据
onMounted(() => {
    initFormData()
})

// 向父组件暴露保存方法
const saveSettings = () => {
    // 根据动作类型进行验证
    if (form.actionType === 'notification') {
        // 验证必填项
        if (!form.notificationTitle) {
            ElMessage.warning('请填写通知标题')
            return false
        }
    }
    else if (form.actionType === 'update') {
        // 验证必填项
        if (!form.dataSource) {
            ElMessage.warning('请填写数据源信息')
            return false
        }
    }
    else if (form.actionType === 'external') {
        // 验证必填项
        if (!form.externalApi) {
            ElMessage.warning('请填写外部系统 API')
            return false
        }
    }

    const newProps = {
        actionType: form.actionType
    }
    if (form.actionType === 'notification') {
        Object.assign(newProps, {
            notificationType: form.notificationType,
            notificationTitle: form.notificationTitle,
            notificationContent: form.notificationContent
        })
    }
    else if (form.actionType === 'update') {
        Object.assign(newProps, {
            dataOperation: form.dataOperation,
            dataSource: form.dataSource
        })
    }
    else if (form.actionType === 'external') {
        Object.assign(newProps, {
            externalApi: form.externalApi,
            externalTriggerMethod: form.externalTriggerMethod
        })
    }

    nodeProps.value = structuredClone(toRaw(newProps))

    return true
}

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