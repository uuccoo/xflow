<template>
    <div class="node-add-btn">
        <el-popover placement="right-start" :width="280" trigger="click" :hide-after="0" :show-arrow="true" :offset="12"
            popper-class="node-popover" v-model:visible="popoverVisible">
            <template #reference>
                <el-button circle class="add-btn">
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
import { useFlowDesignStore } from '../../stores/flowDesignStore';

// 使用 Pinia store
const flowStore = useFlowDesignStore();

// 从store获取节点选项
const nodeOptions = computed(() => flowStore.nodeOptions);

// 简单的 popover 可见状态，由 el-popover 组件自动管理
const popoverVisible = ref(false);

const props = defineProps({
    position: {
        type: Number,
        required: true
    },
    // 添加新的props，用于标识当前节点的父节点信息
    parentPath: {
        type: String,
        default: ''
    },
    // 当前操作的条件对象（可选）
    condition: {
        type: Object,
        default: null
    },
    // 条件索引
    conditionIndex: {
        type: Number,
        default: -1
    }
});

// 创建新节点对象
const createNewNode = (type) => {
    return flowStore.createNodeByType(type, Date.now());
};

const handleNodeAdd = (type) => {
    // 创建新节点
    const newNode = createNewNode(type);

    // 根据不同情况处理节点添加
    if (props.condition) {
        // 向条件分支内添加节点
        flowStore.handleAddNodeToCondition({
            type,
            position: props.conditionIndex,
            node: newNode,
            condition: props.condition,
            conditionIndex: props.conditionIndex
        }, null, props.condition);
    } else {
        // 向主流程添加节点
        flowStore.handleAddNodeEvent({
            type,
            position: props.position,
            node: newNode
        });
    }

    // 关闭悬浮框
    popoverVisible.value = false;
};
</script>

<style scoped lang="scss">
.node-add-btn {
    position: relative;
    margin: 15px 0;
    display: flex;
    justify-content: center;
    z-index: 1;

    &::before {
        content: '';
        position: absolute;
        top: -15px;
        left: 50%;
        height: 15px;
        border-left: 1px dashed #c0c4cc;
        z-index: -1;
    }

    .add-btn {
        background-color: #fff;
        border: 1px dashed #c0c4cc;
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

:deep(.node-popover) {
    .el-popover__title {
        display: none;
    }
}
</style>