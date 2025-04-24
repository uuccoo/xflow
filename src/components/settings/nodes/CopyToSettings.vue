<template>
    <div class="node-setting-form">
        <el-form label-position="top">
            <!-- 发起人自选需要从哪些人中选择 -->
            <el-form-item label="指定人员" label-position="left" required>
                <el-button class="select-personnel" type="primary" @click="showPersonSelector">
                    <el-icon>
                        <Plus />
                    </el-icon>
                    添加
                </el-button>
                <div v-if="users.length" class="selected-users">
                    <el-tag v-for="(user, idx) in users" :key="user" closable @close="removeUser(idx)">
                        {{ user.name }}
                    </el-tag>
                </div>
            </el-form-item>
        </el-form>
    </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'
import { Plus } from '@element-plus/icons-vue'
import { useFlowDesignStore } from '../../../stores/flowDesignStore'

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

// 显示人员选择器
const showPersonSelector = () => {
    const selectedIds = users.value.map(user => user.id)

    // 使用 store 中的方法打开人员选择器
    flowStore.openPersonSelector({
        title: '选择抄送人',
        type: 'copyTo',
        selectedIds,
        // 处理选择结果的回调
        onConfirm: (result) => {
            users.value = result.selectedUsers
            ElMessage.success('抄送人已选择，请点击保存生效')
        }
    })
}

// 删除抄送人
const removeUser = (index) => {
    users.value.splice(index, 1)
}

// 向父组件暴露保存方法
const saveSettings = () => {
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
</style>