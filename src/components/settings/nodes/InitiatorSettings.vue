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
                <el-button class="select-personnel" type="primary" @click="showPersonSelector">
                    <el-icon>
                        <Plus />
                    </el-icon>
                    添加
                </el-button>
                <div v-if="selectedInitiators.length" class="selected-users">
                    <el-tag v-for="(user, idx) in selectedInitiators" :key="user" closable @close="removeUser(idx)">
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
import { ElMessage } from 'element-plus'

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

// 显示人员选择器
const showPersonSelector = () => {
    const currentIds = selectedInitiators.value.map(user => user.id)
    // 使用 store 中的方法打开人员选择器
    flowStore.openPersonSelector({
        title: '选择发起人范围',
        type: 'initiator',
        selectedIds: currentIds,
        // 处理选择结果的回调
        onConfirm: (result) => {
            selectedInitiators.value = result.selectedUsers
            ElMessage.success('发起人范围已选择，请点击保存生效')
        }
    })
}

// 删除已选择的用户
const removeUser = (index) => {
    selectedInitiators.value.splice(index, 1)
}

// 向父组件暴露保存方法，由父组件在保存时调用
const saveSettings = () => {
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