<template>
    <div class="node-setting-form">
        <h3 class="setting-section-title">{{ nodeTypeLabel }}设置</h3>
        <p class="setting-description">请配置节点参数</p>

        <!-- 通用设置选项 -->
        <el-form label-position="top">
            <el-form-item label="节点名称">
                <el-input v-model="localNodeName" placeholder="请输入节点名称"></el-input>
            </el-form-item>

            <!-- 针对特定节点类型可以在这里扩展特定的设置项 -->
            <el-empty v-if="!hasAdvancedSettings" description="暂无高级设置项"></el-empty>
        </el-form>
    </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useFlowDesignStore } from '@/stores/flowDesignStore'
import { getFlowNodeOption } from '@/constants/flowNodeOptions'

// 接收节点数据
const props = defineProps({
    node: {
        type: Object,
        required: true
    }
})

// 使用 store
const flowStore = useFlowDesignStore()

// 本地节点名称
const localNodeName = ref('')

// 是否有高级设置
const hasAdvancedSettings = ref(false)

// 获取节点类型标签
const nodeTypeLabel = computed(() => {
    if (!props.node) return '节点';

    const option = getFlowNodeOption(props.node.type);
    return option ? option.label : '节点';
});

// 初始化表单数据
const initFormData = () => {
    // 确保节点有 props 属性
    if (!props.node.props) {
        props.node.props = {}
    }

    // 初始化节点名称
    localNodeName.value = props.node.name || ''
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
    // 保存节点名称
    props.node.name = localNodeName.value
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
</style>