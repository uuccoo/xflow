<template>
    <div class="node-setting-form">
        <el-form label-position="top">
            <!-- 发起人自选需要从哪些人中选择 -->
            <el-form-item label="指定人员" label-position="left" required>
                <designated-person-selector
                    v-model="users"
                    title="选择抄送人"
                    button-text="添加"
                    selector-type="copyTo"
                    :required="true"
                    :only-select-users="true"
                />
            </el-form-item>
        </el-form>
    </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'
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

// 抄送人列表
const users = ref([])

// 初始化表单数据
const initFormData = () => {
    // 确保节点有 props 属性
    if (!props.node.props) {
        props.node.props = {}
    }

    // 初始化抄送人列表
    users.value = props.node.props.users || []
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
    // 验证是否选择了抄送人
    if (users.value.length === 0) {
        ElMessage.warning('请至少选择一名抄送人')
        return false
    }

    // 保存抄送人列表
    props.node.props.users = users.value
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
</style>