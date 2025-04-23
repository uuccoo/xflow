<template>
    <div class="node-setting-form">
        <h3 class="setting-section-title">办理人设置</h3>
        <el-form label-position="top">
            <el-form-item label="办理人">
                <el-button type="primary" @click="showPersonSelector">
                    <el-icon>
                        <Plus />
                    </el-icon>
                    选择办理人
                </el-button>
                <div v-if="processors.length" class="selected-users">
                    <el-tag v-for="(user, idx) in processors" :key="idx" closable @close="removeUser(idx)">
                        {{ user.name }}
                    </el-tag>
                </div>
            </el-form-item>
            <el-form-item label="处理方式">
                <el-radio-group v-model="processMode">
                    <el-radio label="sequential">串行处理</el-radio>
                    <el-radio label="parallel">并行处理</el-radio>
                </el-radio-group>
            </el-form-item>
        </el-form>
    </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'
import { Plus } from '@element-plus/icons-vue'
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

// 办理人列表
const processors = ref([])
// 处理方式
const processMode = ref('sequential')

// 初始化表单数据
const initFormData = () => {
    // 确保节点有 props 属性
    if (!props.node.props) {
        props.node.props = {}
    }

    // 初始化办理人列表
    processors.value = props.node.props.processors || []
    // 初始化处理方式
    processMode.value = props.node.props.mode || 'sequential'
}

// 监听节点变化
watch(() => props.node, () => {
    initFormData()
}, { immediate: true, deep: true })

// 组件挂载时初始化数据
onMounted(() => {
    initFormData()
})

// 显示人员选择器
const showPersonSelector = () => {
    const selectedIds = processors.value.map(user => user.id)

    // 使用 store 中的方法打开人员选择器
    flowStore.openPersonSelector({
        title: '选择办理人',
        type: 'process',
        selectedIds,
        // 处理选择结果的回调
        onConfirm: (result) => {
            processors.value = result.selectedUsers
            props.node.props.processors = result.selectedUsers
            ElMessage.success('办理人设置成功')
        }
    })
}

// 删除办理人
const removeUser = (index) => {
    processors.value.splice(index, 1)
    props.node.props.processors = [...processors.value]
}

// 向父组件暴露保存方法
const saveSettings = () => {
    // 保存办理人列表和处理方式
    props.node.props.processors = processors.value
    props.node.props.mode = processMode.value

    // 验证必填项
    if (processors.value.length === 0) {
        ElMessage.warning('请至少选择一名办理人')
        return false
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

.selected-users {
    margin-top: 10px;
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
}
</style>