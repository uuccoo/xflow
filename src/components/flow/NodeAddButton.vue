<template>
    <div class="node-add-btn" :class="{
        'has-next-node': hasNextNode,
        'has-end-node': hasEndNode
    }">
        <el-popover placement="right-start" :width="280" trigger="click" :hide-after="0" :show-arrow="true" :offset="12"
            popper-class="node-popover" v-model:visible="popoverVisible">
            <template #reference>
                <el-button type="primary" plain circle class="add-btn">
                    <el-icon>
                        <Plus />
                    </el-icon>
                </el-button>
            </template>
            <template #default>
                <div class="menu-title">添加流程节点</div>
                <el-scrollbar max-height="400px">
                    <div class="node-options">
                        <div class="node-option-item" v-for="option in nodeOptions" :key="option.type"
                            @click="handleNodeAdd(option.type)">
                            <div class="option-icon" :style="{ backgroundColor: option.color }">
                                <el-icon>
                                    <component :is="option.icon" />
                                </el-icon>
                            </div>
                            <span class="option-name">{{ option.label }}</span>
                        </div>
                    </div>
                </el-scrollbar>
            </template>
        </el-popover>
    </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { Plus } from '@element-plus/icons-vue';
import { useFlowDesignStore } from '@/stores/flowDesignStore';
import { FlowNodeType } from '@/enums'
import { flowNodeOptions } from '@/constants/flowNodeOptions'
import { getNodeByType } from '@/constants/nodeTypeConfig'

// 使用 Pinia store
const flowStore = useFlowDesignStore();

// 直接使用常量中的节点选项
const nodeOptions = computed(() => flowNodeOptions);
const flowData = computed(() => flowStore.flowData);

// 简单的 popover 可见状态，由 el-popover 组件自动管理
const popoverVisible = ref(false);

const props = defineProps({
    position: {
        type: Number,
        required: true
    },
    hasNextNode: {
        type: Boolean,
        default: false
    },
    hasEndNode: {
        type: Boolean,
        default: false
    },
    // 当前操作的分支对象（可选）
    branch: {
        type: Object,
        default: null
    }
});

// 向主流程中添加节点 - 原来在 store 中的方法
const addNodeToMainFlow = (node, position) => {
    // 添加到主流程中的指定位置
    flowData.value.nodes.splice(position, 0, node);
    console.log(`节点已添加到主流程位置 ${position}:`, node);
};

// 向分支中添加节点 - 修改后的方法，支持在指定位置添加节点
const addNodeToBranch = (node, branch, position) => {
    // 将节点添加到分支的节点数组中指定位置
    if (!branch.nodes) {
        branch.nodes = [];
    }

    branch.nodes.splice(position, 0, node);
    console.log(`在分支 ${branch.name} 内位置 ${position} 添加节点:`, node);
};

const handleNodeAdd = (type) => {
    // 创建新节点
    const newNode = getNodeByType(type);

    // 根据不同情况处理节点添加
    if (props.branch) {
        // 向分支内添加节点，传递位置参数
        addNodeToBranch(newNode, props.branch, props.position);
    } else {
        // 向主流程添加节点
        addNodeToMainFlow(newNode, props.position);
    }

    // 关闭悬浮框
    popoverVisible.value = false;
};
</script>

<style scoped lang="scss">
.node-add-btn {
    position: relative;
    margin: 0;
    padding: 20px 0 30px 0;
    /* 添加上下内边距 */
    display: flex;
    justify-content: center;
    z-index: 1;

    &.has-end-node {
        padding-bottom: 40px;
    }

    &::before {
        content: '';
        position: absolute;
        top: 0;
        /* 调整连接线顶部位置 */
        left: calc(50% - 1px);
        height: 100%;
        /* 让连接线贯穿整个按钮区域 */
        width: 2px;
        background-color: #c0c4cc;
        z-index: -1;
    }

    &.has-next-node::before {
        height: calc(100% - 5px);
    }

    &.has-next-node::after {
        content: '';
        position: absolute;
        left: calc(50% - 6px);
        bottom: 3px;
        width: 0;
        height: 0;
        border-left: 6px solid transparent;
        border-right: 6px solid transparent;
        border-top: 8px solid #c0c4cc;
        z-index: 0;
    }

    &.has-end-node::before {
        height: calc(100% - 8px);
    }

    &.has-end-node::after {
        content: '';
        position: absolute;
        left: calc(50% - 5px);
        bottom: 5px;
        width: 10px;
        height: 10px;
        border-radius: 50%;
        background-color: #c0c4cc;
        z-index: 0;
    }

    .add-btn {
        background-color: #fff;
        color: #409eff;
        transition: all 0.3s;

        &:hover {
            color: #fff;
            background-color: #409eff;
            border-color: #409eff;
        }
    }
}

/* 弹出菜单内容样式 */
.menu-title {
    padding: 12px;
    font-size: 14px;
    font-weight: 500;
    color: #000;
    border-bottom: 1px solid #e4e7ed;
}

.node-options {
    padding: 12px;
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px;

    .node-option-item {
        display: flex;
        align-items: center;
        padding: 8px;
        cursor: pointer;
        transition: all 0.3s;
        border-radius: 4px;

        &:hover {
            background-color: #f5f7fa;
        }

        .option-icon {
            width: 32px;
            height: 32px;
            border-radius: 50%;
            display: flex;
            justify-content: center;
            align-items: center;
            margin-right: 8px;

            .el-icon {
                font-size: 16px;
                color: #fff;
            }
        }

        .option-name {
            font-size: 12px;
            color: #606266;
        }
    }
}
</style>