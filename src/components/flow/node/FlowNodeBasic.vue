<template>
    <flow-node-shell
        :node-type="node.type"
        :title="node.name"
        :node-content-text="nodeContentText"
        show-delete
        @click="handleNodeClick"
        @delete="deleteNode"
    />
</template>

<script setup>
import { computed } from 'vue'
import { useFlowDesignStore } from '@/stores/flowDesignStore'
import { FlowNodeType } from '@/enums'
import FlowNodeShell from './FlowNodeShell.vue'

// 使用 Pinia store
const flowStore = useFlowDesignStore()

const props = defineProps({
    node: {
        type: Object,
        required: true
    },
    index: {
        type: Number,
        required: true
    },
    branch: {
        type: Object,
        default: null
    }
})

// 计算节点内容文本
const nodeContentText = computed(() => {
    const { type, props: nodeProps } = props.node;

    // 根据节点类型处理不同内容
    switch (type) {
        case FlowNodeType.APPROVE:
        case FlowNodeType.CC:
        case FlowNodeType.HANDLE:
            return getHandlerContent(nodeProps, type);
        default:
            return '点击配置';
    }
});

// 获取处理人节点内容（通用函数）
const getHandlerContent = (nodeProps, nodeType) => {
    switch (nodeProps.handlerType) {
        case 'designated':
            return flowStore.formatNames(nodeProps.handlers) || '未指定人员';
        case 'initiator_select':
            return `发起人自选${nodeProps.initiatorSelectMode === 'single' ? '一个人' : '多人'}`;
        case 'multi_level_manager':
            let text = '连续多级主管';
            if (nodeProps.approvalEndPoint === 'specific_level') {
                text += nodeProps.specificLevel === 1
                    ? '(直接主管)'
                    : `(不超过第${nodeProps.specificLevel}级主管)`;
            }
            return text;
        case 'department_manager':
            return nodeProps.managerType === 1 ? '直接主管' : `第${nodeProps.managerType}级主管`;
        case 'role':
            return flowStore.formatNames(nodeProps.roles) || '请选择角色';
        case 'initiator_self':
            return '发起人自己';
        default:
            // 根据节点类型返回不同的默认提示语
            switch (nodeType) {
                case FlowNodeType.APPROVE:
                    return '请选择审批人';
                case FlowNodeType.CC:
                    return '请选择抄送人';
                case FlowNodeType.HANDLE:
                    return '请选择办理人';
                default:
                    return '请选择处理人';
            }
    }
};

// 点击节点，选中并显示抽屉层
const handleNodeClick = () => {
    // 调用store的selectNode方法
    flowStore.selectNode(props.node, props.index, props.branch);
}

// 删除当前节点
const deleteNode = () => {
    console.log('删除节点', props.node);
    // 使用分支对象进行节点删除
    flowStore.deleteNode(props.node, props.index, props.branch);
};
</script>
