<template>
    <div class="universal-flow-node">
        <!-- 发起人节点 -->
        <initiator-node v-if="node.type === FlowNodeType.INITIATE" />

        <!-- 普通节点（审批人、抄送人、办理） -->
        <flow-node v-else-if="isRegularNode" :node="node" :index="index" :branch="branch" />

        <!-- 分支节点（条件分支及其他类型的分支） -->
        <flow-node-branch v-else-if="isBranchNode" :node="node" :index="index" :branch="branch" />

        <!-- 结束节点 -->
        <flow-node-end v-else-if="node.type === 'end'" />
    </div>
</template>

<script setup>
import { computed } from 'vue';
import FlowNode from './FlowNodeBasic.vue';
import FlowNodeBranch from './FlowNodeBranch.vue';
import FlowNodeEnd from './FlowNodeEnd.vue';
import InitiatorNode from './FlowNodeInitiator.vue';
import { useFlowDesignStore } from '@/stores/flowDesignStore';
import { FlowNodeType } from '@/enums';

// 获取 flowDesignStore
const flowStore = useFlowDesignStore();

// 导入组件自身以进行递归引用
const props = defineProps({
    node: {
        type: Object,
        required: true
    },
    index: {
        type: [Number, String],
        required: true
    },
    branch: {
        type: Object,
        default: null
    }
});

const emit = defineEmits([
    // 所有事件都已直接使用 store 处理，不需要任何事件定义
]);

// 判断是否为普通节点（非分支类节点）
const isRegularNode = computed(() => {
    const regularTypes = [
        FlowNodeType.APPROVE,
        FlowNodeType.CC,
        FlowNodeType.HANDLE
    ];
    return regularTypes.includes(props.node.type);
});

// 判断是否为分支节点
const isBranchNode = computed(() => {
    // 当前支持的分支类型列表，未来可以扩展
    const branchTypes = [FlowNodeType.CONDITION, FlowNodeType.INCLUSIVE];
    return branchTypes.includes(props.node.type);
});

</script>

<style scoped lang="scss">
.universal-flow-node {
    // width: 100%;
}
</style>