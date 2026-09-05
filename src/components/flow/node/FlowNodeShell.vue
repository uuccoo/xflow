<template>
    <div
        class="flow-node-shell"
        :class="{ 'has-error': nodeErrors.length > 0 }"
        :style="nodeStyle"
        @click="$emit('click', $event)"
    >
        <el-tooltip v-if="nodeErrors.length > 0" placement="right">
            <template #content>
                <div v-for="(error, index) in nodeErrors" :key="index">{{ error.message }}</div>
            </template>
            <el-icon class="node-error-indicator" aria-label="节点存在错误" role="img">
                <WarningFilled />
            </el-icon>
        </el-tooltip>

        <div class="node-header" :style="headerStyle">
            <span v-if="icon" class="node-icon">
                <el-icon>
                    <component :is="icon" />
                </el-icon>
            </span>
            <span class="node-title">{{ title }}</span>
            <div class="node-header-suffix">
                <slot name="header-suffix" />
                <el-icon v-if="showCopy" class="node-copy" @click.stop="$emit('copy', $event)">
                    <CopyDocument />
                </el-icon>
                <el-icon v-if="showDelete" class="node-delete" @click.stop="$emit('delete', $event)">
                    <Delete />
                </el-icon>
            </div>
        </div>

        <div class="node-content">
            <div class="node-item">
                <div class="node-item-content">
                    <span>{{ nodeContentText }}</span>
                </div>
                <slot name="content-suffix">
                    <el-icon class="chevron-icon">
                        <ArrowRight />
                    </el-icon>
                </slot>
            </div>
        </div>
    </div>
</template>

<script setup>
import { CopyDocument, Delete, ArrowRight, WarningFilled } from '@element-plus/icons-vue'
import { computed } from 'vue'
import { getFlowNodeOption } from '@/constants/flowNodeOptions'
import { getNodeErrors } from '@/validation/flow/error'

const props = defineProps({
    nodeType: {
        type: String,
        required: true
    },
    nodeId: {
        type: String,
        required: true
    },
    title: {
        type: String,
        default: ''
    },
    nodeContentText: {
        type: String,
        default: ''
    },
    showDelete: {
        type: Boolean,
        default: false
    },
    showCopy: {
        type: Boolean,
        default: false
    }
})

const emit = defineEmits(['click', 'copy', 'delete'])

const nodeOption = computed(() => getFlowNodeOption(props.nodeType))

const nodeStyle = computed(() => {
    return nodeOption.value ? { borderLeft: `3px solid ${nodeOption.value.color}` } : {}
})

const headerStyle = computed(() => {
    return nodeOption.value ? { backgroundColor: nodeOption.value.headerBg } : {}
})

const icon = computed(() => nodeOption.value?.icon)

const nodeErrors = computed(() => getNodeErrors(props.nodeId))
</script>

<style scoped lang="scss">
.flow-node-shell {
    position: relative;
    width: 220px;
    background-color: #fff;
    border-radius: 4px;
    border: 1px solid #e4e7ed;
    margin-left: auto;
    margin-right: auto;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
    cursor: pointer;
    transition: box-shadow 0.3s;

    &:hover {
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
    }

    &.has-error {
        outline: 1px solid #f56c6c;
        outline-offset: 0;
    }
}

.node-error-indicator {
    position: absolute;
    top: 50%;
    right: -32px;
    z-index: 3;
    color: #f56c6c;
    font-size: 22px;
    transform: translateY(-50%);
    cursor: help;
}

.node-header {
    position: relative;
    display: flex;
    align-items: center;
    padding: 8px 12px;
    border-bottom: 1px solid #e4e7ed;
    background-color: #f5f7fa;
    border-radius: 4px 4px 0 0;

    .node-icon {
        display: flex;
        align-items: center;
        margin-right: 5px;
        color: #606266;
    }

    .node-title {
        flex-grow: 1;
        font-size: 14px;
        color: #303133;
        font-weight: 500;
    }

    .node-header-suffix {
        display: flex;
        align-items: center;
        gap: 8px;
        flex-shrink: 0;
    }

    .node-copy,
    .node-delete {
        cursor: pointer;
        font-size: 16px;
        display: none;
        visibility: hidden;
        opacity: 0;
        transition: visibility 0s, opacity 0.2s ease-in-out;
        z-index: 2;
    }

    .node-copy {
        color: #409eff;
    }

    .node-delete {
        color: #f56c6c;
    }
}

.node-content {
    padding: 10px 12px;

    .node-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        color: #606266;
        font-size: 14px;
        cursor: pointer;
        max-height: 60px;
    }

    .node-item-content {
        flex-grow: 1;
        overflow: hidden;
        display: -webkit-box;
        -webkit-box-orient: vertical;
        -webkit-line-clamp: 3;
        line-clamp: 3;
        text-overflow: ellipsis;
        white-space: pre-line;
        line-height: 1.5;
    }

    .chevron-icon {
        margin-left: 8px;
        flex-shrink: 0;
        align-self: center;
    }
}

.flow-node-shell:hover .node-copy,
.flow-node-shell:hover .node-delete {
    display: unset;
    visibility: visible;
    opacity: 1;
}

.node-copy:hover {
    color: #66b1ff;
}

.node-delete:hover {
    color: #ff4d4f;
}
</style>
