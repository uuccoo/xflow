<template>
    <div class="node-add-btn">
        <el-popover placement="right-start" :width="280" trigger="click" :hide-after="0" :show-arrow="true" :offset="12"
            popper-class="node-popover" v-model:visible="popoverVisible" @show="handlePopoverShow"
            @hide="handlePopoverHide">
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
import { ref, watch } from 'vue';
import { Plus } from '@element-plus/icons-vue';

const props = defineProps({
    position: {
        type: Number,
        required: true
    },
    nodeOptions: {
        type: Array,
        required: true
    },
    visible: {
        type: Boolean,
        default: false
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

const emit = defineEmits([
    'add',
    'show',
    'hide',
    'update:visible',
    'select-approvers',
    'select-users',
    'select-processors'
]);

// 使用本地状态跟踪弹出框的可见性
const popoverVisible = ref(false);

// 监听外部传入的visible变化
watch(() => props.visible, (newValue) => {
    popoverVisible.value = newValue;
}, { immediate: true });

// 监听内部popoverVisible变化，向外传递
watch(popoverVisible, (newValue) => {
    emit('update:visible', newValue);
});

const handlePopoverShow = () => {
    popoverVisible.value = true;
    emit('show', props.position);
};

const handlePopoverHide = () => {
    popoverVisible.value = false;
    emit('hide', props.position);
};

// 创建新节点对象
const createNewNode = (type) => {
    // 创建节点的基本结构
    const nodeId = Date.now();
    const newNode = {
        id: nodeId,
        type: type,
        name: props.nodeOptions.find(option => option.type === type)?.label || '未知节点',
        props: {}
    };

    // 根据节点类型设置初始属性
    if (type === 'condition') {
        newNode.isNested = true;
        newNode.props = {
            conditions: [
                {
                    name: '条件1',
                    expression: '',
                    priority: 1,
                    nodes: []
                },
                {
                    name: '默认条件',
                    expression: '其他条件进入此流程',
                    priority: 2,
                    nodes: []
                }
            ]
        };
    } else if (type === 'approver') {
        newNode.props = { approvers: [], mode: 'anyone' };
    } else if (type === 'copyTo') {
        newNode.props = { users: [] };
    } else if (type === 'process') {
        newNode.props = { processors: [], mode: 'sequential' };
    }

    return newNode;
};

const handleNodeAdd = (type) => {
    // 创建新节点
    const newNode = createNewNode(type);

    // 将新节点添加到条件分支中（如果有条件对象）
    if (props.condition) {
        // 确保condition.nodes是一个数组
        if (!props.condition.nodes) {
            props.condition.nodes = [];
        }

        // 添加新节点
        props.condition.nodes.push(newNode);

        // 构建节点路径
        const nodePath = props.parentPath ?
            `${props.parentPath}-${props.conditionIndex}-${props.condition.nodes.length - 1}` :
            `${props.conditionIndex}-${props.condition.nodes.length - 1}`;

        // 根据节点类型触发事件以打开配置对话框
        if (type === 'approver') {
            emit('select-approvers', { node: newNode, index: nodePath });
        } else if (type === 'copyTo') {
            emit('select-users', { node: newNode, index: nodePath });
        } else if (type === 'process') {
            emit('select-processors', { node: newNode, index: nodePath });
        }
    }

    // 发出添加事件，包含新节点和位置信息
    emit('add', {
        type,
        position: props.position,
        node: newNode,
        condition: props.condition,
        conditionIndex: props.conditionIndex
    });

    // 关闭弹出窗口
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