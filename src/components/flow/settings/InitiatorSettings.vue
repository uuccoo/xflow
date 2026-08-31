<template>
    <div class="node-setting-form">
        <el-form label-position="top">
            <el-form-item label="谁可以提交该审批">
                <el-select v-model="form.initiatorScope" placeholder="请选择发起人范围" style="width: 100%">
                    <el-option label="所有人" value="all"></el-option>
                    <el-option label="指定人员" value="specified"></el-option>
                </el-select>
            </el-form-item>
            <el-form-item v-if="form.initiatorScope !== 'all'" label-position="left" required>
                <designated-person-selector
                    v-model="form.initiators"
                    title="选择发起人范围"
                    button-text="添加"
                    :required="true"
                />
            </el-form-item>
        </el-form>
    </div>
</template>

<script setup>
import { reactive, onMounted, ref } from 'vue'
import { ElMessage } from 'element-plus'
import DesignatedPersonSelector from '../../common/DesignatedPersonSelector.vue'
import { FlowNodeType } from '@/enums'
import { getNodeProps } from '@/constants/nodeTypeConfig'

const nodeProps = defineModel({
    type: Object,
    required: true
})

const createDefaultForm = () => getNodeProps(FlowNodeType.INITIATE)

const form = reactive(createDefaultForm())
const initialFormSnapshot = ref('')

const getFormSnapshot = () => JSON.stringify(form)

// 初始化表单数据
const initFormData = () => {
    Object.assign(form, createDefaultForm(), JSON.parse(JSON.stringify(nodeProps.value || {})))
    initialFormSnapshot.value = getFormSnapshot()
}

// 组件挂载时初始化数据
onMounted(() => {
    initFormData()
})

// 向父组件暴露保存方法，由父组件在保存时调用
const saveSettings = () => {
    // 验证：如果选择了指定人员但没有选择人员
    if (form.initiatorScope === 'specified' && form.initiators.length === 0) {
        ElMessage.warning('请至少选择一名发起人')
        return false
    }

    nodeProps.value = JSON.parse(JSON.stringify(form))
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
</style>