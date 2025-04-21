<template>
    <div class="flow-node initiator" @click="handleNodeClick">
        <div class="node-header">
            <span class="node-icon">
                <el-icon>
                    <User />
                </el-icon>
            </span>
            <span class="node-title">{{ initiator.name }}</span>
        </div>
        <div class="node-content">
            <div class="node-item" @click.stop="selectInitiator">
                <span>{{ initiator.props.initiator || '所有人' }}</span>
                <el-icon class="chevron-icon">
                    <ArrowRight />
                </el-icon>
            </div>
        </div>
    </div>
</template>

<script setup>
import { User, ArrowRight } from '@element-plus/icons-vue'
import { computed } from 'vue'
import { useFlowDesignStore } from '../../../stores/flowDesignStore'

// 使用 Pinia store
const flowStore = useFlowDesignStore()

// 从 store 获取发起人节点数据
const initiator = computed(() => flowStore.flowData.initiator)

// 选择发起人
const selectInitiator = () => {
    flowStore.showPersonSelector()
    // 同时选中节点打开抽屉
    flowStore.selectNode(initiator.value, -1)
}

// 点击节点，选中并显示抽屉层
const handleNodeClick = () => {
    // 调用store的selectNode方法选中发起人节点
    flowStore.selectNode(initiator.value, -1)
}
</script>

<style scoped lang="scss">
.initiator {
    width: 220px;
    background-color: #fff;
    border-radius: 4px;
    border: 1px solid #e4e7ed;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
    margin-left: auto;
    margin-right: auto;
    border-left: 3px solid #409eff;
    cursor: pointer;
    /* 添加指针样式表示可点击 */
    transition: box-shadow 0.3s;
    /* 添加过渡效果 */

    &:hover {
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
        /* 鼠标悬停时增强阴影效果 */
    }

    .node-header {
        background-color: #ecf5ff;
        padding: 8px 12px;
        display: flex;
        align-items: center;
        border-bottom: 1px solid #e4e7ed;
        border-radius: 4px 4px 0 0;

        .node-icon {
            margin-right: 5px;
            color: #409eff;
            display: flex;
            align-items: center;
        }

        .node-title {
            flex-grow: 1;
            font-size: 14px;
            color: #303133;
            font-weight: 500;
        }
    }

    .node-content {
        padding: 0;

        .node-item {
            padding: 10px 12px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            color: #606266;
            font-size: 14px;
            cursor: pointer;

            &:hover {            background-color: #f5f7fa;
            }

            .chevron-icon {
                color: #c0c4cc;
                font-size: 12px;
            }
        }
    }
}
</style>