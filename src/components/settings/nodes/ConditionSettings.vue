<template>
    <div class="node-setting-form">
        <h3 class="setting-section-title">条件设置</h3>
        <p class="setting-description">设置条件分支参数</p>

        <!-- 条件设置内容 -->
        <div class="condition-content">
            <p class="no-settings-message">该条件节点无需额外设置</p>
            <div v-if="currentCondition.name === '默认条件'" class="default-condition-tip">
                <p>这是默认条件分支，当其他条件都不满足时将进入此流程</p>
            </div>
        </div>
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

// 当前正在编辑的条件对象
const currentCondition = ref({
    name: ''
});

// 初始化表单数据
const initFormData = () => {
    // 初始化当前条件
    currentCondition.value = JSON.parse(JSON.stringify(props.node));
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
    // 无需验证表达式
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

.condition-content {
    padding: 20px 0;
}

.no-settings-message {
    color: #606266;
    font-size: 14px;
    text-align: center;
    margin: 20px 0;
}

.default-condition-tip {
    background-color: #f5f7fa;
    border-radius: 4px;
    padding: 15px;
    color: #606266;
    font-size: 14px;
    margin-top: 10px;
    
    p {
        margin: 0;
    }
}
</style>