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

// 从store获取节点选项和流程数据
const nodeOptions = computed(() => flowStore.nodeOptions);
const flowData = computed(() => flowStore.flowData);

// 简单的 popover 可见状态，由 el-popover 组件自动管理
const popoverVisible = ref(false);

const props = defineProps({
    position: {
        type: Number,
        required: true
    },
    // 添加新的props，用于标识当前节点的父节点信息
    parentNode: {
        type: Object,
        default: null
    },
    // 当前操作的分支对象（可选）
    branch: {
        type: Object,
        default: null
    }
});

// 创建新节点对象 - 原来在 store 中的方法
const createNodeByType = (type, nodeId) => {
    // 节点类型配置映射
    const nodeConfigs = {
        approver: {
            name: '审批人',
            props: {
                approvers: [],
                mode: 'anyone', // 任意一人通过即可，可选值：anyone, all
            },
        },
        copyTo: {
            name: '抄送人',
            props: {
                users: [],
            },
        },
        process: {
            name: '办理',
            props: {
                processors: [],
                mode: 'sequential', // 串行处理，可选值：sequential, parallel
            },
        },
        condition: {
            name: '条件分支',
            props: {
                conditions: [
                    {
                        name: '条件1',
                        expression: '',
                        priority: 1,
                        nodes: [],
                    },
                    {
                        name: '默认条件',
                        expression: '其他条件进入此流程',
                        priority: 2,
                        nodes: [],
                    },
                ],
            },
        },
        automation: {
            name: '自动化',
            props: {
                actions: [],
            },
        },
        connector: {
            name: '连接器',
            props: {
                connector: '',
                config: {},
            },
        },
        payment: {
            name: '付款人',
            props: {
                payers: [],
                amount: 0,
            },
        },
    };

    // 获取节点配置
    const config = nodeConfigs[type] || {};
    const option = nodeOptions.value.find((option) => option.type === type);
    const label = option?.label || '未知节点';

    // 创建并返回节点
    return {
        id: nodeId,
        type,
        name: config.name || label,
        props: { ...(config.props || {}) },
    };
};

// 向主流程中添加节点 - 原来在 store 中的方法
const addNodeToMainFlow = (node, position) => {
    // 添加到主流程中的指定位置
    flowData.value.nodes.splice(position, 0, node);
    console.log(`节点已添加到主流程位置 ${position}:`, node);
};

// 向分支中添加节点 - 原来在 store 中的方法
const addNodeToBranch = (node, branch) => {
    // 如果要添加的是条件分支节点，为其生成唯一标识符
    if (node.type === 'condition' && !node.isNested) {
        node.id = `nested-${Date.now()}`;
        node.isNested = true; // 标记为嵌套节点，方便特殊处理
    }

    // 将节点添加到分支的节点数组中
    branch.nodes.push(node);
    console.log(`在分支 ${branch.name} 内添加节点:`, node);
};

const handleNodeAdd = (type) => {
    // 创建新节点
    const newNode = createNodeByType(type, Date.now());

    // 根据不同情况处理节点添加
    if (props.branch) {
        // 向分支内添加节点
        addNodeToBranch(newNode, props.branch);
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