<template>
    <el-drawer v-model="flowStore.drawerVisible" :show-close="false" title="节点设置" size="550" :destroy-on-close="false"
        :with-header="true" direction="rtl" :before-close="handleSave" class="node-settings-drawer">
        <!-- 自定义头部，包含节点名称编辑 -->
        <template #header>
            <div class="drawer-header">
                <div class="drawer-title-container">
                    <div class="node-name-edit">
                        <el-input v-if="isEditingName" v-model="tempNodeName" size="medium" placeholder="请输入节点名称"
                            ref="nodeNameInput" @blur="finishEditName">
                        </el-input>
                        <div v-else class="current-node-name" @click="startEditName">
                            {{ tempNodeName || '' }}
                            <el-icon>
                                <Edit />
                            </el-icon>
                        </div>
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
                <!-- 根据节点类型动态加载不同的设置组件 -->
                <component :is="currentSettingComponent" v-if="currentSettingComponent"
                    :node="flowStore.selectedNode.node" />
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
import { ref, computed, nextTick, watch } from 'vue'
import { Edit, Close } from '@element-plus/icons-vue'
import { useFlowDesignStore } from '../../stores/flowDesignStore'
import { ElMessage } from 'element-plus'

// 导入各种节点设置组件
import InitiatorSettings from './nodes/InitiatorSettings.vue'
import ApproverSettings from './nodes/ApproverSettings.vue'
import CopyToSettings from './nodes/CopyToSettings.vue'
import ProcessSettings from './nodes/ProcessSettings.vue'
import ConditionSettings from './nodes/ConditionSettings.vue'
import AutomationSettings from './nodes/AutomationSettings.vue'
import DefaultSettings from './nodes/DefaultSettings.vue'

// 使用 Pinia store
const flowStore = useFlowDesignStore()

// 节点名称编辑状态
const isEditingName = ref(false)
const tempNodeName = ref('')
const nodeNameInput = ref(null)

// 根据当前选中节点类型，返回对应的设置组件
const currentSettingComponent = computed(() => {
    if (!flowStore.selectedNode) return null

    const nodeType = flowStore.selectedNode.node.type

    // 根据节点类型返回对应的组件
    switch (nodeType) {
        case 'initiator': return InitiatorSettings
        case 'approver': return ApproverSettings
        case 'copyTo': return CopyToSettings
        case 'process': return ProcessSettings
        case 'condition': return ConditionSettings
        case 'automation': return AutomationSettings
        default: return DefaultSettings
    }
})

// 监听抽屉显示状态
watch(() => flowStore.drawerVisible, (visible) => {
    if (visible && flowStore.selectedNode) {
        // 初始化临时节点名称
        tempNodeName.value = flowStore.selectedNode.node.name || ''
        isEditingName.value = false
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
}

// 处理取消
const handleCancel = () => {
    flowStore.closeDrawer()
}

// 处理保存
const handleSave = () => {
    if (!flowStore.selectedNode) return

    // 更新节点名称
    if (tempNodeName.value) {
        flowStore.selectedNode.node.name = tempNodeName.value
    }

    // 这里我们通过事件通知当前活跃的子组件进行保存
    // 由于具体数据已经存储在 store 中，这里只需触发通知即可
    flowStore.saveNodeSettings()

    ElMessage.success('节点设置已保存')
    flowStore.closeDrawer()
}
</script>

<style scoped lang="scss">
.drawer-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 10px 15px;
    border-bottom: 1px solid #e4e7ed;

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
                padding: 4px 8px;
                border-radius: 4px;
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