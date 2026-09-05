<template>
    <flow-node-shell
        :node-type="initiator.type"
        :node-id="initiator.id"
        :title="initiator.name"
        :node-content-text="initiatorContentText"
        @click="handleNodeClick"
    />
</template>

<script setup>
import { computed } from 'vue'
import { useFlowDesignStore } from '@/stores/flowDesignStore'
import FlowNodeShell from './FlowNodeShell.vue'

// 使用 Pinia store
const flowStore = useFlowDesignStore()

// 从 store 获取发起人节点数据
const initiator = computed(() => flowStore.flowData.initiator)

// 计算发起人内容文本 - 简化为只有所有人和指定人员两种情况
const initiatorContentText = computed(() => {
    const initiatorProps = initiator.value.props;

    // 根据发起人类型处理不同内容
    if (initiatorProps.initiatorScope === 'specified') {
        return flowStore.formatNames(initiatorProps.initiators) || '未指定人员';
    }
    else {
        return '所有人';
    }
});

// 点击节点，选中并显示抽屉层
const handleNodeClick = () => {
    // 调用store的selectNode方法选中发起人节点
    flowStore.selectNode(initiator.value, -1)
}

</script>
