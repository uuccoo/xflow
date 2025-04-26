<template>
    <div class="node-setting-form">
        <!-- 条件设置内容 -->
        <div class="condition-content">
            <!-- 条件组列表 -->
            <div v-for="(group, groupIndex) in conditionGroups" :key="'group-' + groupIndex"
                class="condition-group-wrapper">
                <!-- 在非第一个条件组前显示"或"字样 -->
                <div v-if="groupIndex > 0" class="or-divider">
                    <span class="or-text">或</span>
                </div>
                
                <!-- 当只有一个条件组时不显示条件组边框和标题 -->
                <div :class="{'condition-group': conditionGroups.length > 1, 'single-condition-group': conditionGroups.length === 1}">
                    <!-- 只有多个条件组时才显示条件组标题 -->
                    <div v-if="conditionGroups.length > 1" class="condition-group-header">
                        <span class="condition-group-title">条件组</span>
                        <el-button v-if="conditionGroups.length > 1" type="danger" link size="small"
                            @click="removeConditionGroup(groupIndex)">
                            删除
                        </el-button>
                    </div>

                    <!-- 条件项和添加条件按钮的父容器 -->
                    <div class="conditions-container">
                        <!-- 条件项列表 -->
                        <div v-for="(condition, index) in group.conditions"
                            :key="'condition-' + groupIndex + '-' + index" class="condition-item">
                            <span class="condition-type">{{ condition.type }}</span>
                            <!-- 发起人条件时显示人员选择器 -->
                            <designated-person-selector v-if="condition.type === '发起人'" v-model="condition.users"
                                @change="updateCondition" />
                            <el-button type="danger" link size="small" @click="removeCondition(groupIndex, index)">
                                <el-icon>
                                    <Delete />
                                </el-icon>
                            </el-button>
                        </div>

                        <!-- 添加条件按钮 -->
                        <div class="add-button-container">
                            <el-button class="add-condition-btn" @click="openAddConditionDialog(groupIndex)">
                                <el-icon>
                                    <Plus />
                                </el-icon>
                                添加条件
                            </el-button>
                        </div>
                    </div>
                </div>
            </div>

            <!-- 添加条件组按钮 - 修改为更窄并靠左 -->
            <div class="add-group-wrapper">
                <div class="add-button-container">
                    <el-button class="add-group-btn" @click="addConditionGroup">
                        <el-icon>
                            <Plus />
                        </el-icon>
                        添加条件组
                    </el-button>
                </div>
                <p class="group-tip">如果添加了多个条件组，只要满足任一条件组即可进入此流程</p>
            </div>
        </div>

        <!-- 条件选择对话框 -->
        <el-dialog v-model="conditionDialogVisible" title="选择条件" width="400px" center :close-on-click-modal="false"
            :show-close="true">
            <span>请选择用来区分审批流程的条件字段，已选{{ selectedConditionTypes.length }}个</span>
            <div class="condition-selection">
                <el-checkbox-group v-model="selectedConditionTypes">
                    <el-checkbox label="发起人">发起人</el-checkbox>
                    <!-- 后续可添加其他条件类型 -->
                </el-checkbox-group>
            </div>
            <template #footer>
                <span class="dialog-footer">
                    <el-button @click="cancelAddCondition">取消</el-button>
                    <el-button type="primary" @click="confirmAddCondition">确定</el-button>
                </span>
            </template>
        </el-dialog>
    </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'
import { useFlowDesignStore } from '../../../stores/flowDesignStore'
import { ElMessage } from 'element-plus'
import { Plus, Delete } from '@element-plus/icons-vue'
import DesignatedPersonSelector from '../../common/DesignatedPersonSelector.vue'

// 接收节点数据
const props = defineProps({
    node: {
        type: Object,
        required: true
    }
})

// 使用 store
const flowStore = useFlowDesignStore()

// 当前正在编辑的条件对象
const currentCondition = ref({
    name: '',
    conditionGroups: []
});

// 条件组列表
const conditionGroups = ref([]);

// 条件对话框相关
const conditionDialogVisible = ref(false);
const selectedConditionTypes = ref();
const currentGroupIndex = ref(0);

// 初始化表单数据
const initFormData = () => {
    // 初始化当前条件
    currentCondition.value = JSON.parse(JSON.stringify(props.node));

    // 如果节点中已有条件组数据，则使用；否则初始化一个默认条件组
    if (currentCondition.value.conditionGroups && currentCondition.value.conditionGroups.length) {
        conditionGroups.value = JSON.parse(JSON.stringify(currentCondition.value.conditionGroups));
    } else {
        conditionGroups.value = [
            {
                id: Date.now(),
                conditions: [
                    {
                        id: Date.now() + Math.random(),
                        type: '发起人',
                        users: [] // 初始化空的用户列表
                    }
                ]
            }
        ];
    }
}

// 添加条件组
const addConditionGroup = () => {
    conditionGroups.value.push({
        id: Date.now(),
        conditions: [
            {
                id: Date.now() + Math.random(),
                type: '发起人',
                users: [] // 初始化空的用户列表
            }
        ]
    });
    updateCondition();
}

// 删除条件组
const removeConditionGroup = (groupIndex) => {
    conditionGroups.value.splice(groupIndex, 1);
    updateCondition();
}

// 打开添加条件对话框
const openAddConditionDialog = (groupIndex) => {
    currentGroupIndex.value = groupIndex;
    // 根据当前条件组中已有的条件类型来初始化选择项
    selectedConditionTypes.value = conditionGroups.value[groupIndex].conditions.map(c => c.type);
    conditionDialogVisible.value = true;
}

// 取消添加条件
const cancelAddCondition = () => {
    conditionDialogVisible.value = false;
}

// 确认添加条件
const confirmAddCondition = () => {
    // 获取当前条件组中的条件
    const currentGroupConditions = conditionGroups.value[currentGroupIndex.value].conditions;

    // 保存现有条件类型，以便与选中的类型比较
    const existingTypes = currentGroupConditions.map(c => c.type);

    // 找出需要删除的条件（已存在但不在当前选择中的条件类型）
    const typesToRemove = existingTypes.filter(type => !selectedConditionTypes.value.includes(type));

    // 删除取消勾选的条件
    for (const type of typesToRemove) {
        const indexToRemove = currentGroupConditions.findIndex(c => c.type === type);
        if (indexToRemove !== -1) {
            currentGroupConditions.splice(indexToRemove, 1);
        }
    }

    // 添加新选中的条件类型
    for (const type of selectedConditionTypes.value) {
        // 检查该类型是否已存在于当前组
        const exists = currentGroupConditions.some(c => c.type === type);
        if (!exists) {
            currentGroupConditions.push({
                id: Date.now() + Math.random(),
                type: type,
                users: [] // 初始化空的用户列表
            });
        }
    }

    conditionDialogVisible.value = false;
    updateCondition();
}

// 删除条件
const removeCondition = (groupIndex, conditionIndex) => {
    conditionGroups.value[groupIndex].conditions.splice(conditionIndex, 1);
    updateCondition();
}

// 更新条件设置
const updateCondition = () => {
    // 更新当前节点的条件组数据
    currentCondition.value.conditionGroups = JSON.parse(JSON.stringify(conditionGroups.value));
}

// 监听节点变化
watch(() => props.node, () => {
    initFormData()
}, { immediate: true, deep: true })

// 组件挂载时初始化数据
onMounted(() => {
    initFormData()
})

// 向父组件暴露保存方法
const saveSettings = () => {
    // 保存条件组设置到节点
    props.node.conditionGroups = JSON.parse(JSON.stringify(conditionGroups.value));
    return true;
}

// 将方法暴露给父组件
defineExpose({
    saveSettings
})
</script>

<style scoped lang="scss">
.node-setting-form {
    margin-bottom: 40px;
}

.condition-content {
    padding: 20px 0;
}

.condition-group-wrapper {
    margin-bottom: 20px;
}

.or-divider {
    text-align: center;
    margin-bottom: 10px;

    .or-text {
        display: inline-block;
        background-color: #fff;
        padding: 0 10px;
        color: #909399;
    }
}

.condition-group {
    border: 1px solid #dcdfe6;
    border-radius: 4px;

    .condition-group-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 10px;
        background-color: #f5f7fa;

        .condition-group-title {
            font-weight: 500;
            color: #303133;
        }
    }

    .conditions-container {
        padding: 15px;
    }
}

.single-condition-group .conditions-container {
    padding: 0;
}

.condition-item {
    display: flex;
    align-items: center;
    margin-bottom: 20px;
    border-radius: 4px;

    .condition-type {
        font-weight: 500;
        margin-right: 10px;
        min-width: 60px;
    }

    .el-button {
        margin-left: auto;
    }
}

.add-condition-btn {
    width: auto;

    .el-icon {
        margin-right: 4px;
    }
}

.add-group-wrapper {
    text-align: left;
    position: relative;
    margin-top: 30px;
}

.add-button-container {
    display: flex;
    justify-content: flex-start;
}

.add-group-btn {
    width: auto;

    .el-icon {
        margin-right: 4px;
    }
}

.group-tip {
    color: #909399;
    font-size: 12px;
    margin-top: 10px;
}

.condition-selection {
    padding: 20px 0;
}

.dialog-footer {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
}
</style>