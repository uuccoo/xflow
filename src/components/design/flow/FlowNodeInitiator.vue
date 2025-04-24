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
            <div class="node-item">
                <div class="node-item-content">
                    <span>{{ initiatorContentText }}</span>
                </div>
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

// 计算发起人内容文本 - 简化为只有所有人和指定人员两种情况
const initiatorContentText = computed(() => {
    const initiatorProps = initiator.value.props;

    // 根据发起人类型处理不同内容
    if (initiatorProps.initiatorScope === 'specified') {
        if (Array.isArray(initiatorProps.initiators) && initiatorProps.initiators.length > 0) {
            return formatUserNames(initiatorProps.initiators);
        } else {
            return '未指定人员';
        }
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

const formatUserNames = (users = []) => {
    if (!Array.isArray(users) || users.length === 0) {
        return '未设置';
    }
    return flowStore.formatUserNames(users);
};
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
            align-items: flex-start;
            color: #606266;
            font-size: 14px;
            cursor: pointer;

            &:hover {
                background-color: #f5f7fa;
            }

            .node-item-content {
                flex-grow: 1;
                overflow: hidden;
                display: -webkit-box;
                -webkit-box-orient: vertical;
                -webkit-line-clamp: 3;
                /* 限制最多显示3行 */
                line-clamp: 3;
                /* 标准属性，限制最多显示3行 */
                text-overflow: ellipsis;
                line-height: 20px;
                /* 设定行高 */
            }

            .chevron-icon {
                margin-left: 8px;
                flex-shrink: 0;
                color: #c0c4cc;
                align-self: center;
                /* 使箭头垂直居中对齐 */
            }
        }
    }
}
</style>