<template>
    <div class="node-setting-form">
        <el-form label-position="top">
            <el-form-item label="谁可以提交该审批">
                <el-select v-model="initiatorScope" placeholder="请选择发起人范围" style="width: 100%">
                    <el-option label="所有人" value="all"></el-option>
                    <el-option label="指定人员" value="specified"></el-option>
                </el-select>
            </el-form-item>
            <el-form-item v-if="initiatorScope !== 'all'" label="指定人员" label-position="left" required>
                <designated-person-selector v-model="selectedInitiators" title="选择发起人范围" button-text="添加"
                    selector-type="initiator" :required="true" />
            </el-form-item>
        </el-form>
    </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'
import { useFlowDesignStore } from '@/stores/flowDesignStore'
import { ElMessage } from 'element-plus'
import DesignatedPersonSelector from '../../common/DesignatedPersonSelector.vue'

// 接收节点数据作为属性
const props = defineProps({
    node: {
        type: Object,
        required: true
    }
})

// 使用 store
const flowStore = useFlowDesignStore()

// 发起人范围
const initiatorScope = ref('all')
// 选中的发起人列表
const selectedInitiators = ref([])

// 初始化表单数据
const initFormData = () => {
    // 确保节点有 props 属性
    if (!props.node.props) {
        props.node.props = {}
    }

    // 初始化发起人范围
    initiatorScope.value = props.node.props.initiatorScope || 'all'
    // 初始化已选发起人
    selectedInitiators.value = props.node.props.initiators || []
}

// 监听节点变化
watch(() => props.node, () => {
    initFormData()
}, { immediate: true, deep: true })

// 组件挂载时初始化数据
onMounted(() => {
    initFormData()
})

// 向父组件暴露保存方法，由父组件在保存时调用
const saveSettings = () => {
    // 验证：如果选择了指定人员但没有选择人员
    if (initiatorScope.value === 'specified' && selectedInitiators.value.length === 0) {
        ElMessage.warning('请至少选择一名发起人')
        return false
    }

    // 保存发起人范围设置到节点
    props.node.props.initiatorScope = initiatorScope.value
    props.node.props.initiators = selectedInitiators.value
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