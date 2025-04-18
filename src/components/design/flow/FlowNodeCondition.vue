<template>
    <div class="flow-branch-container">
        <!-- 条件分支顶部按钮 - 只保留添加条件按钮 -->
        <div class="condition-add-btn">
            <el-button size="small" type="primary" plain round @click="addCondition">添加条件</el-button>
        </div>

        <!-- 条件分支内容 -->
        <div class="flow-branch">
            <div class="branch-item" v-for="(condition, condIndex) in node.props.conditions" :key="condIndex">
                <!-- 条件项头部 -->
                <div class="flow-node condition-branch">
                    <div class="branch-header">
                        {{ condition.name }}
                        <!-- 将优先级标签移到绝对定位的右上角 -->
                        <div class="priority-tag">优先级{{ condition.priority }}</div>
                        <!-- 删除条件按钮 -->
                        <el-icon class="node-delete" @click.stop="deleteCondition(condIndex)">
                            <Delete />
                        </el-icon>
                    </div>

                    <!-- 条件内容 -->
                    <div class="node-content condition-content" @click="editCondition(condIndex, condition)">
                        <span v-if="condition.name === '默认条件'">其他条件进入此流程</span>
                        <span v-else>{{ condition.expression || '请设置条件' }}</span>
                        <el-icon class="chevron-icon">
                            <Edit />
                        </el-icon>
                    </div>
                </div>

                <!-- 条件分支内的节点列表 -->
                <div class="branch-nodes" v-if="condition.nodes && condition.nodes.length > 0">
                    <flow-node-renderer v-for="(branchNode, nodeIdx) in condition.nodes" :key="branchNode.id"
                        :node="branchNode" :index="`${index}-${condIndex}-${nodeIdx}`" :nodeOptions="nodeOptions"
                        :showDeleteBtn="true" :parentPath="`${index}-${condIndex}-${nodeIdx}`"
                        @delete="(...args) => $emit('delete', ...args)"
                        @delete-condition="(...args) => $emit('delete-condition', ...args)"
                        @add-condition="(event) => $emit('add-condition', event)"
                        @edit-condition="(...args) => $emit('edit-condition', ...args)"
                        @select-approvers="(event) => $emit('select-approvers', event)"
                        @select-users="(event) => $emit('select-users', event)"
                        @select-processors="(event) => $emit('select-processors', event)"
                        @configure="(event) => $emit('configure', event)">
                        <template #default>
                            <slot :condition="condition" :cond-index="condIndex"></slot>
                        </template>
                    </flow-node-renderer>
                </div>

                <!-- 为每个条件分支添加节点按钮 -->
                <node-add-button :position="condIndex" :nodeOptions="nodeOptions" :condition="condition"
                    :conditionIndex="condIndex" :parentPath="index" @add="handleAddNodeEvent"
                    @select-approvers="(event) => $emit('select-approvers', event)"
                    @select-users="(event) => $emit('select-users', event)"
                    @select-processors="(event) => $emit('select-processors', event)" />

                <!-- 原有的插槽 -->
                <slot :condition="condition" :cond-index="condIndex"></slot>
            </div>
        </div>
    </div>
</template>

<script setup>
import { Delete, Edit } from '@element-plus/icons-vue'
import FlowNodeBasic from './FlowNodeBasic.vue'
import NodeAddButton from '../NodeAddButton.vue'
import { getCurrentInstance } from 'vue'
import { ElMessage } from 'element-plus'

// 递归引用当前组件
const props = defineProps({
    node: {
        type: Object,
        required: true
    },
    index: {
        type: [Number, String],
        required: true
    },
    nodeOptions: {
        type: Array,
        required: true
    },
    showDeleteBtn: {
        type: Boolean,
        default: true
    }
})

const emit = defineEmits([
    'delete',
    'delete-condition',
    'add-condition',
    'edit-condition',
    'select-approvers',
    'select-users',
    'select-processors',
    'configure'
])

// ===== 将条件节点相关操作逻辑封装在组件内部 =====

// 添加条件分支
const addCondition = () => {
    // 获取现有条件数量
    const conditionsCount = props.node.props.conditions.length;
    const conditionNumber = conditionsCount; // 新条件的编号

    // 创建新条件
    const newCondition = {
        name: `条件${conditionNumber}`,
        expression: '',
        priority: conditionNumber,
        nodes: []
    };

    // 将默认条件的优先级设为最低
    const defaultConditionIndex = props.node.props.conditions.findIndex(c => c.name === '默认条件');
    if (defaultConditionIndex !== -1) {
        props.node.props.conditions[defaultConditionIndex].priority = conditionsCount + 1;
    }

    // 在倒数第二位(默认条件之前)插入新条件
    props.node.props.conditions.splice(conditionsCount - 1, 0, newCondition);

    console.log('添加条件分支成功', newCondition);
    // 不再向上传递事件，只在本地处理即可
}

// 删除条件分支
const deleteCondition = (condIndex) => {
    if (props.node.props.conditions.length <= 2) {
        // 当只有两个条件分支时，删除整个当前条件分支组件
        // 这里直接将条件分支节点自身删除，传递正确的参数
        console.log('删除条件分支', props.node, props.index, condIndex);
        emit('delete', props.node, props.index, null)
        return
    }

    // 收集被删除分支中的所有节点
    const orphanedNodes = props.node.props.conditions[condIndex].nodes;

    // 如果有孤立节点，可以选择将它们移到默认分支
    if (orphanedNodes.length > 0) {
        const defaultConditionIndex = props.node.props.conditions.findIndex(c => c.name === '默认条件');
        if (defaultConditionIndex !== -1) {
            props.node.props.conditions[defaultConditionIndex].nodes.push(...orphanedNodes);
            ElMessage.info('已将分支中的节点转移到默认条件');
        }
    }

    // 删除条件分支
    props.node.props.conditions.splice(condIndex, 1);

    // 更新剩余条件分支的优先级
    props.node.props.conditions.forEach((condition, idx) => {
        if (condition.name !== '默认条件') {
            condition.priority = idx + 1;
        } else {
            condition.priority = props.node.props.conditions.length;
        }
    });

    console.log('删除条件分支', condIndex);
    // 不再向上传递事件，只在本地处理即可
}

// 编辑条件表达式
const editCondition = (condIndex, condition) => {
    console.log('编辑条件表达式', props.node, condIndex, condition);
    // 此处可以打开条件编辑弹窗，然后在完成编辑后通知父组件
    emit('edit-condition', props.node, condIndex, condition);
}

// 简化的处理添加节点事件的方法
const handleAddNodeEvent = (payload) => {
    // 这里只需记录日志或执行简单的后处理逻辑
    console.log('节点已添加到条件分支:', payload.node, '条件索引:', payload.conditionIndex);
}
</script>

<style scoped lang="scss">
/* 分支容器样式 */
.flow-branch-container {
    width: 100%;
    margin-bottom: 15px;
    position: relative;
}

/* 条件分支顶部按钮样式 */
.condition-add-btn {
    display: flex;
    justify-content: center;
    gap: 10px;
    margin: 10px 0 20px;

    .el-button {
        background-color: white;
        font-size: 13px;
        padding: 8px 20px;
        height: auto;
    }
}

/* 分支样式 */
.flow-branch {
    width: 100%;
    display: flex;
    gap: 30px;
    position: relative;
    padding: 30px 0 0;
    margin-bottom: 15px;

    /* 分支上方连接线 */
    &::before {
        content: '';
        position: absolute;
        top: 0;
        left: 50%;
        height: 15px;
        border-left: 1px dashed #c0c4cc;
        transform: translateX(-50%);
    }

    /* 分支顶部横线 */
    &::after {
        content: '';
        position: absolute;
        top: 15px;
        left: 20%;
        width: 60%;
        border-top: 1px dashed #c0c4cc;
    }

    .branch-item {
        flex: 1;
        display: flex;
        flex-direction: column;
        align-items: center;
        position: relative;

        /* 分支顶部竖线 */
        &::before {
            content: '';
            position: absolute;
            top: -15px;
            left: 50%;
            height: 15px;
            border-left: 1px dashed #c0c4cc;
        }
    }
}

.branch-header {
    position: relative;
    display: flex;
    align-items: center;
    padding: 8px 12px;
    font-size: 13px;
    color: #333;
    margin-bottom: 0;
    background-color: #f5f7fa;
    border-bottom: 1px solid #e4e7ed;
    border-radius: 4px 4px 0 0;

    .priority-tag {
        position: absolute;
        top: 8px;
        right: 16px;
        color: #909399;
        font-size: 12px;
        font-weight: normal;
        visibility: visible;
        opacity: 1;
        transition: visibility 0s, opacity 0.2s ease-in-out;
    }

    /* 删除图标样式 */
    .node-delete {
        position: absolute;
        top: 8px;
        right: 8px;
        color: #f56c6c;
        cursor: pointer;
        font-size: 16px;
        visibility: hidden;
        opacity: 0;
        transition: visibility 0s, opacity 0.2s ease-in-out;
        z-index: 2;
    }
}

.condition-branch {
    width: 220px;
    margin-bottom: 10px;
    border: 1px solid #e4e7ed;
    border-radius: 4px;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
    background-color: white;
    border-left: 3px solid #f56c6c;

    // 修改优先级标签的显示逻辑
    &:hover {
        .priority-tag {
            visibility: hidden;
            opacity: 0;
        }

        .node-delete {
            visibility: visible;
            opacity: 1;
        }
    }

    /* 删除图标样式 */
    .node-delete:hover {
        color: #ff4d4f;
    }

    .condition-content {
        padding: 14px 16px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        color: #909399;
        font-size: 14px;
        cursor: pointer;

        &:hover {
            background-color: #f5f7fa;
        }

        .chevron-icon {
            color: #c0c4cc;
        }
    }
}

.branch-nodes {
    width: 100%;
    margin-top: 5px;
}
</style>