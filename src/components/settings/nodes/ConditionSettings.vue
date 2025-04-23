<template>
    <div class="node-setting-form">
        <h3 class="setting-section-title">条件设置</h3>
        <p class="setting-description">设置条件分支的判断条件</p>

        <div v-if="selectedBranchItem">
            <el-form label-position="top">
                <el-form-item label="条件名称">
                    <el-input v-model="selectedBranchItem.name" placeholder="请输入条件名称"></el-input>
                </el-form-item>
                <el-form-item label="条件表达式" v-if="selectedBranchItem.name !== '默认条件'">
                    <el-input type="textarea" v-model="selectedBranchItem.expression" placeholder="请输入条件表达式" :rows="3">
                    </el-input>
                </el-form-item>
                <el-form-item>
                    <el-button @click="backToList">返回条件列表</el-button>
                    <el-button type="primary" @click="saveBranchItem">保存条件</el-button>
                </el-form-item>
            </el-form>
        </div>
        <div v-else class="branch-list">
            <h4>选择要编辑的条件分支：</h4>
            <el-menu :default-active="activeConditionIndex.toString()">
                <el-menu-item v-for="(condition, idx) in conditions" :key="idx" :index="idx.toString()"
                    @click="selectBranch(condition)">
                    {{ condition.name || `条件${idx + 1}` }}
                </el-menu-item>
            </el-menu>
            <div class="action-buttons">
                <el-button type="primary" @click="addCondition">
                    <el-icon>
                        <Plus />
                    </el-icon>
                    添加条件
                </el-button>
            </div>
        </div>
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

// 条件列表
const conditions = ref([])
// 当前选中的条件项
const selectedBranchItem = ref(null)
// 激活的条件索引
const activeConditionIndex = ref('0')

// 初始化表单数据
const initFormData = () => {
    // 确保节点有 props 属性
    if (!props.node.props) {
        props.node.props = {}
    }

    // 确保有条件列表
    if (!props.node.props.conditions) {
        props.node.props.conditions = []
    }

    // 初始化条件列表
    conditions.value = [...props.node.props.conditions]
}

// 监听节点变化
watch(() => props.node, () => {
    initFormData()
    selectedBranchItem.value = null
}, { immediate: true, deep: true })

// 组件挂载时初始化数据
onMounted(() => {
    initFormData()
})

// 选择分支条件
const selectBranch = (branch) => {
    selectedBranchItem.value = { ...branch }
}

// 返回条件列表
const backToList = () => {
    selectedBranchItem.value = null
}

// 添加条件
const addCondition = () => {
    const newCondition = {
        name: `条件${conditions.value.length + 1}`,
        expression: ''
    }
    selectedBranchItem.value = newCondition
}

// 保存条件项
const saveBranchItem = () => {
    if (!selectedBranchItem.value.name) {
        ElMessage.warning('条件名称不能为空')
        return
    }

    // 查找当前编辑的是否已存在的条件
    const index = conditions.value.findIndex(
        item => item === selectedBranchItem.value ||
            (item.name === selectedBranchItem.value.name && !item.id)
    )

    if (index >= 0) {
        // 更新现有条件
        conditions.value[index] = { ...selectedBranchItem.value }
    } else {
        // 添加新条件
        conditions.value.push({ ...selectedBranchItem.value })
    }

    // 同步到节点数据
    props.node.props.conditions = [...conditions.value]

    ElMessage.success('条件保存成功')
    selectedBranchItem.value = null
}

// 向父组件暴露保存方法
const saveSettings = () => {
    // 保存条件列表
    props.node.props.conditions = [...conditions.value]
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

.branch-list {
    margin: 15px 0;

    h4 {
        margin-bottom: 10px;
        font-size: 14px;
        font-weight: normal;
        color: #606266;
    }

    .action-buttons {
        margin-top: 20px;
    }
}
</style>