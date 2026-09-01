<template>
    <el-drawer v-model="flowStore.drawerVisible" :show-close="false" title="节点设置" size="550" :destroy-on-close="true"
        :before-close="handleBeforeClose"
        :with-header="true" direction="rtl" class="node-settings-drawer">
        <!-- 自定义头部，包含节点名称编辑 -->
        <template #header>
            <div class="drawer-header">
                <div class="drawer-title-container">
                    <div class="node-name-edit">
                        <el-input v-if="isEditingName" v-model="localNodeName" size="medium" placeholder="请输入节点名称"
                            ref="nodeNameInput" @blur="finishEditName">
                        </el-input>
                        <div v-else class="current-node-name" @click="startEditName">
                            {{ localNodeName }}
                            <el-icon size="16">
                                <EditPen />
                            </el-icon>
                        </div>
                    </div>
                    <!-- 条件分支时显示优先级设置 -->
                    <div v-if="isConditionBranch" class="priority-setting">
                        <el-select v-model="localPriority" placeholder="请选择" size="small" class="priority-select">
                            <el-option 
                                v-for="option in priorityOptions" 
                                :key="option.value" 
                                :label="option.label" 
                                :value="option.value">
                            </el-option>
                        </el-select>
                    </div>
                </div>
                <el-icon class="drawer-close" @click="handleCancel">
                    <Close />
                </el-icon>
            </div>
        </template>

        <!-- 抽屉内容区域 -->
        <div class="drawer-content-container" v-if="flowStore.selectedNode">
            <!-- 滚动内容区域 -->
            <div class="drawer-content">
                <!-- 根据节点类型动态加载不同的设置组件，添加ref引用 -->
                <component :is="nodeComponent" v-if="nodeComponent"
                    v-model="flowStore.selectedNode.node.props"
                    :node-id="flowStore.selectedNode.node.id"
                    ref="nodeComponentRef" />
                <div v-else class="no-settings">
                    <p>未找到当前节点类型的设置项</p>
                </div>
            </div>

            <!-- 固定在底部的按钮区域 -->
            <div class="drawer-footer">
                <el-button @click="handleCancel">取消</el-button>
                <el-button type="primary" @click="handleSave">保存</el-button>
            </div>
        </div>
    </el-drawer>
</template>

<script setup>
import { ref, computed, watch, nextTick } from 'vue'
import { Edit, Close } from '@element-plus/icons-vue'
import { useFlowDesignStore } from '@/stores/flowDesignStore'
import { ElMessage } from 'element-plus'
import { FlowNodeType } from '@/enums'
import { validateApprover } from '@/validation/approverValidator'

// 导入各种节点设置组件
import InitiatorSettings from './settings/InitiatorSettings.vue'
import ApproverSettings from './settings/ApproverSettings.vue'
import CopyToSettings from './settings/CopyToSettings.vue'
import ProcessSettings from './settings/ProcessSettings.vue'
import ConditionSettings from './settings/ConditionSettings.vue'
import InclusiveSettings from './settings/InclusiveSettings.vue'

// 使用 Pinia store
const flowStore = useFlowDesignStore()

// 节点名称编辑状态
const isEditingName = ref(false)
const nodeNameInput = ref(null)
const localNodeName = ref('')
// 初始节点名称快照，用于判断是否有修改
const initialNodeName = ref('')

// 优先级设置
const localPriority = ref(0)
// 初始优先级快照，用于判断是否有修改
const initialPriority = ref(0)

// 添加对当前设置组件的ref引用
const nodeComponentRef = ref(null)

// 判断是否为条件节点中的分支
const isConditionBranch = computed(() => {
    return flowStore.selectedNode?.node?.type === FlowNodeType.CONDITION
})

// 获取非默认分支数量，动态生成优先级选项
const priorityOptions = computed(() => {
    if (!isConditionBranch.value) {
        return []
    }
    // 直接从 selectedNode.parentNode 获取父级条件节点
    const parentConditionNode = flowStore.selectedNode?.parentNode
    if (parentConditionNode && parentConditionNode.branches) {
        const nonDefaultBranches = parentConditionNode.branches.filter(branch => !branch.isDefault)
        const options = []
        for (let i = 1; i <= nonDefaultBranches.length; i++) {
            options.push({
                label: `优先级${i}`,
                value: i
            })
        }
        return options
    }
})

// 初始化表单数据
const initFormData = () => {
    if (flowStore.selectedNode?.node) {
        localNodeName.value = flowStore.selectedNode.node.name || ''
        initialNodeName.value = localNodeName.value
        // 初始化优先级数据 - 只对条件分支设置优先级
        if (isConditionBranch.value) {
            localPriority.value = flowStore.selectedNode.node.priority || 1
            initialPriority.value = localPriority.value
        }
    }
}

// 根据新的优先级调整分支位置
const adjustBranchPosition = (currentBranch, newPriority) => {
    const parentNode = flowStore.selectedNode?.parentNode
    if (!parentNode || !parentNode.branches) return

    const branches = parentNode.branches
    // 根据priority来计算当前分支在branches中的索引
    const currentIndex = currentBranch.priority - 1
    // 新的索引位置
    let insertIndex = newPriority - 1
    // 如果当前位置和目标位置一样，无需调整
    if (currentIndex === insertIndex) return

    // 先移除当前分支
    branches.splice(currentIndex, 1)
    // 再插入到新位置
    branches.splice(insertIndex, 0, currentBranch)

    // 重新为所有非默认分支赋优先级
    flowStore.updateBranchesPriority(branches)

    console.log('分支位置已调整，新的优先级顺序:', branches.filter(b => !b.isDefault).map(b => b.priority))
}

// 抽屉打开时初始化表单数据
watch(() => flowStore.drawerVisible, (visible) => {
    if (visible) {
        initFormData()
    }
})

// 根据当前选中节点类型，返回对应的设置组件
const nodeComponent = computed(() => {
    if (!flowStore.selectedNode) return null

    const nodeType = flowStore.selectedNode.node.type

    // 根据节点类型返回对应的组件
    switch (nodeType) {
        case FlowNodeType.INITIATE: return InitiatorSettings
        case FlowNodeType.APPROVE: return ApproverSettings
        case FlowNodeType.CC: return CopyToSettings
        case FlowNodeType.HANDLE: return ProcessSettings
        case FlowNodeType.CONDITION: return ConditionSettings
        case FlowNodeType.INCLUSIVE: return InclusiveSettings
        default: return null
    }
})

// 开始编辑节点名称
const startEditName = () => {
    isEditingName.value = true
    nextTick(() => {
        if (nodeNameInput.value) {
            nodeNameInput.value.focus()
        }
    })
}

// 完成编辑节点名称
const finishEditName = () => {
    isEditingName.value = false
    // 不再直接更新节点名称，而是等用户点击保存按钮时再更新
}

const validateCurrentNode = () => {
    const selectedNode = flowStore.selectedNode
    if (selectedNode?.node?.type !== FlowNodeType.APPROVE) return []

    return validateApprover(selectedNode.node.id, selectedNode.node.props || {})
}

// 统一判断设置组件是否有未保存修改，并等待用户确认
const confirmClose = async () => {
    const componentInstance = nodeComponentRef.value
    // 检查设置组件是否有未保存的修改
    const hasComponentChanges = componentInstance &&
        typeof componentInstance.isFormChanged === 'function' &&
        componentInstance.isFormChanged()

    // 检查节点名称和优先级是否有修改
    const hasNodeNameChanges = localNodeName.value !== initialNodeName.value
    const hasPriorityChanges = isConditionBranch.value && localPriority.value !== initialPriority.value

    if (hasComponentChanges || hasNodeNameChanges || hasPriorityChanges) {
        try {
            // 确认后丢弃组件内部草稿；取消则继续保留抽屉和编辑内容
            await ElMessageBox.confirm(
                '有未保存的修改，确定要放弃吗？',
                '提示',
                {
                    confirmButtonText: '放弃',
                    cancelButtonText: '继续修改',
                    type: 'warning'
                }
            )
        } catch {
            return false
        }
    }

    return true
}

// 处理取消按钮和自定义关闭按钮
const handleCancel = async () => {
    if (!await confirmClose()) return
    validateCurrentNode()
    flowStore.closeDrawer()
}

// 处理抽屉自身的关闭事件（遮罩、ESC 等），done 执行后才真正关闭抽屉
const handleBeforeClose = async (done) => {
    if (!await confirmClose()) return
    validateCurrentNode()
    done()
}

// 处理保存 - 使用ref获取组件实例
const handleSave = () => {
    if (!flowStore.selectedNode) return

    // 使用ref直接获取当前设置组件实例
    const componentInstance = nodeComponentRef.value

    if (componentInstance && typeof componentInstance.saveSettings === 'function') {
        // 调用组件的saveSettings方法
        const valid = componentInstance.saveSettings()

        // 保存节点设置后，由父组件统一校验当前节点
        if (valid) {
            // 将节点名称应用到原始节点
            if (flowStore.selectedNode?.node && localNodeName.value) {
                flowStore.selectedNode.node.name = localNodeName.value
            }
            // 保存优先级设置（仅条件分支）
            if (isConditionBranch.value) {
                const newPriority = localPriority.value
                const currentBranch = flowStore.selectedNode.node
                
                // 调整分支位置
                adjustBranchPosition(currentBranch, newPriority)
                
                console.log('已保存优先级:', localPriority.value)
            }
            validateCurrentNode()
            ElMessage.success('节点设置已保存')
            flowStore.closeDrawer()
        }
    } else {
        // 如果没有saveSettings方法，给出提示
        const nodeTypeName = flowStore.selectedNode?.node?.type || '未知'
        const nodeName = flowStore.selectedNode?.node?.name || '未命名节点'

        ElMessage.warning('无法保存设置')
        console.warn(`组件 ${nodeTypeName} 未实现 saveSettings 方法`)

        // 不关闭抽屉，让用户有机会查看提示
    }
}
</script>

<style scoped lang="scss">
.drawer-header {
    display: flex;
    align-items: center;
    justify-content: space-between;

    .drawer-title-container {
        display: flex;
        align-items: center;
        gap: 10px;

        .node-name-edit {
            display: flex;
            align-items: center;
            gap: 5px;

            .current-node-name {
                display: flex;
                align-items: center;
                gap: 5px;
                cursor: pointer;
                color: #303133;
                font-size: 16px;
                transition: color 0.3s;

                &:hover {
                    color: #409EFF;

                    .el-icon {
                        color: #409EFF;
                    }
                }

                .el-icon {
                    font-size: 14px;
                    color: #909399;
                    transition: color 0.3s;
                }
            }
        }

        .priority-setting {
            margin-left: 15px;

            .priority-select {
                width: 100px;
            }
        }
    }

    .drawer-close {
        font-size: 20px;
        color: #909399;
        cursor: pointer;
    }
}

.drawer-content-container {
    display: flex;
    flex-direction: column;
    height: 100%;
    // 不需要再使用负 margin 来抵消 el-drawer 的内边距
}

.drawer-content {
    flex: 1;
    padding: 20px; // 只保留这一层内边距
    overflow-y: auto;
}

.drawer-footer {
    background-color: #fff;
    padding: 10px 20px;
    text-align: right;
    box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.05);
    border-top: 1px solid #e4e7ed;
    z-index: 10;
    display: flex;
    align-items: center;
    justify-content: flex-end;
}

.no-settings {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 200px;
    color: #909399;
}
</style>

<!-- 添加全局样式以覆盖 Element Plus 抽屉组件的默认内边距 -->
<style>
.node-settings-drawer .el-drawer__body {
    padding: 0;
    overflow: hidden;
    /* 防止内容区域出现双重滚动条 */
}
</style>