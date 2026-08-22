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
import { reactive, onMounted, toRaw } from 'vue'
import { ElMessage } from 'element-plus'
import DesignatedPersonSelector from '../../common/DesignatedPersonSelector.vue'

const nodeProps = defineModel({
    type: Object,
    required: true
})

const defaultForm = {
    // 发起人范围类型
    initiatorScope: 'all',
    // 指定的发起人列表
    initiators: []
}

const form = reactive(structuredClone(defaultForm))

// 初始化表单数据
const initFormData = () => {
    Object.assign(form, structuredClone(defaultForm), structuredClone(toRaw(nodeProps.value || {})))
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

    nodeProps.value = structuredClone(toRaw(form))
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
</style>