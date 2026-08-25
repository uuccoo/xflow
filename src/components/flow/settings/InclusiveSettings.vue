<template>
    <div class="node-setting-form">
        <!-- 包容分支条件设置内容 -->
        <div class="condition-content">
            <!-- 空状态提示 -->
            <div v-if="form.conditionGroups.length === 0" class="empty-state">
                <p class="empty-tip">默认所有表单可进入当前分支。添加条件组后，只有当满足以下条件时才会进入当前分支</p>
            </div>

            <!-- 条件组列表 -->
            <div v-for="(group, groupIndex) in form.conditionGroups" :key="'group-' + groupIndex"
                class="condition-group-wrapper">
                <!-- 在非第一个条件组前显示"或"字样 -->
                <div v-if="groupIndex > 0" class="or-divider">
                    <span class="or-text">或</span>
                </div>

                <!-- 当只有一个条件组时不显示条件组边框和标题 -->
                <div
                    :class="{ 'condition-group': form.conditionGroups.length > 1, 'single-condition-group': form.conditionGroups.length === 1 }">
                    <!-- 只有多个条件组时才显示条件组标题 -->
                    <div v-if="form.conditionGroups.length > 1" class="condition-group-header">
                        <span class="condition-group-title">条件组</span>
                        <el-button v-if="form.conditionGroups.length > 1" type="danger" link size="small"
                            @click="removeConditionGroup(groupIndex)">
                            删除
                        </el-button>
                    </div>

                    <!-- 条件项和添加条件按钮的父容器 -->
                    <div class="conditions-container">
                        <!-- 条件项列表 -->
                        <div v-for="(condition, index) in group.conditions"
                            :key="'condition-' + groupIndex + '-' + index" class="condition-item">
                            <span class="condition-type">{{ condition.label}}</span>

                            <!-- 发起人条件时显示人员选择器 -->
                            <designated-person-selector
                                v-if="condition.type === CONDITION_TYPE_INITIATOR"
                                v-model="condition.users"
                            />

                            <!-- 数字输入框条件 -->
                            <template v-else-if="condition.type === FormComponentType.NUMBER">
                                <!-- 操作符选择 -->
                                <el-select v-model="condition.operator" class="condition-select">
                                    <el-option v-for="option in numberConditionOptions" :key="option.value"
                                        :label="option.label" :value="option.value" />
                                </el-select>

                                <!-- 单个数值 -->
                                <el-input-number v-model="condition.value" class="number-input"
                                    :placeholder="'请输入数值'" />
                            </template>

                            <!-- 单选框条件 -->
                            <template v-else-if="condition.type === FormComponentType.RADIO">
                                <div class="checkbox-options-container">
                                    <el-checkbox-group v-model="condition.selectedOptions">
                                        <el-checkbox v-for="option in condition.options" :key="option.value"
                                            :label="option.value">
                                            {{ option.label }}
                                        </el-checkbox>
                                    </el-checkbox-group>
                                </div>
                            </template>

                            <!-- 多选框条件 -->
                            <template v-else-if="condition.type === FormComponentType.CHECKBOX">
                                <!-- 操作符选择 -->
                                <el-select v-model="condition.operator" class="condition-select">
                                    <el-option v-for="option in checkboxConditionOptions" :key="option.value"
                                        :label="option.label" :value="option.value" />
                                </el-select>

                                <!-- 多选框选项 -->
                                <div class="select-container">
                                    <el-select v-model="condition.selectedOptions" multiple collapse-tags
                                        :placeholder="'请选择'" style="width: 100%">
                                        <el-option v-for="option in condition.options" :key="option.value"
                                            :label="option.label" :value="option.value" />
                                    </el-select>
                                </div>
                            </template>

                            <el-button type="danger" link @click="removeCondition(groupIndex, index)">
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

            <!-- 添加条件组按钮 -->
            <div class="add-group-wrapper">
                <div class="add-button-container">
                    <el-button class="add-group-btn" @click="addConditionGroup">
                        <el-icon>
                            <Plus />
                        </el-icon>
                        添加条件组
                    </el-button>
                </div>
                <p class="group-tip" v-if="conditionGroups.length > 0">如果添加了多个条件组，只要满足任一条件组即可进入此流程</p>
            </div>
        </div>

        <!-- 条件选择对话框 -->
        <el-dialog v-model="conditionDialogVisible" title="选择条件" width="400px" center :close-on-click-modal="false"
            :show-close="true">
            <span>请选择用来区分审批流程的条件字段，已选{{ selectedFieldIds.length }}个</span>
            <div class="condition-selection">
                <el-checkbox-group v-model="selectedFieldIds">
                    <el-checkbox :label="CONDITION_FIELD_ID_INITIATOR">发起人</el-checkbox>
                    <!-- 动态显示所有必填表单项 -->
                    <el-checkbox v-for="item in requiredItems" :key="item.id" :label="item.id">{{ item.label
                    }}</el-checkbox>
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
import { reactive, ref, onMounted, toRaw } from 'vue'
import { useFormDesignStore } from '@/stores/formDesignStore'
import { ElMessage } from 'element-plus'
import { Plus, Delete } from '@element-plus/icons-vue'
import DesignatedPersonSelector from '../../common/DesignatedPersonSelector.vue'
import { generateUniqueId } from '@/utils/idGenerator'
import { FormComponentType } from '@/enums'
import { CONDITION_TYPE_INITIATOR, CONDITION_FIELD_ID_INITIATOR } from '@/constants/flowConstants'
import { collectRequiredConditionFields } from '@/utils/formItems'

const nodeProps = defineModel({
    type: Object,
    required: true
})

const formDesignStore = useFormDesignStore()

// 存储表单中所有必填项
const requiredItems = ref([]);

// 条件组列表
const defaultForm = {
    // 包容分支条件组列表
    conditionGroups: []
}

const form = reactive(structuredClone(defaultForm));
const initialFormSnapshot = ref('');

const getFormSnapshot = () => JSON.stringify(toRaw(form));

// 条件对话框相关
const conditionDialogVisible = ref(false);
// 选中的组件ID列表
const selectedFieldIds = ref([]);
const currentGroupIndex = ref(0);

// 数字输入框条件类型选项
const numberConditionOptions = [
    { label: '小于', value: 'lt' },
    { label: '小于等于', value: 'lte' },
    { label: '等于', value: 'eq' },
    { label: '大于等于', value: 'gte' },
    { label: '大于', value: 'gt' }
];

// 多选框条件类型选项
const checkboxConditionOptions = [
    { label: '完全等于', value: 'exact' },
    { label: '包含任意', value: 'contains' }
];

// 初始化表单数据
const initFormData = () => {
    requiredItems.value = collectRequiredConditionFields(formDesignStore.formItems);

    // 如果节点中已有条件组数据，则使用；否则初始化为空数组（不自动添加条件组）
    const nodeConditionGroups = toRaw(nodeProps.value?.conditionGroups)
    if (nodeConditionGroups && nodeConditionGroups.length) {
        form.conditionGroups = structuredClone(nodeConditionGroups);
    } else {
        // 包容分支初始状态为空，不自动添加条件组
        form.conditionGroups = [];
    }

    initialFormSnapshot.value = getFormSnapshot();
}

// 创建发起人条件对象
function createInitiatorCondition() {
    return {
        id: generateUniqueId(),
        type: CONDITION_TYPE_INITIATOR,
        label: '发起人',
        fieldId: CONDITION_FIELD_ID_INITIATOR,
        users: []
    }
}

// 添加条件组
const addConditionGroup = () => {
    form.conditionGroups.push({
        id: Date.now(),
        conditions: [
            createInitiatorCondition()
        ]
    });
}

// 删除条件组
const removeConditionGroup = (groupIndex) => {
    form.conditionGroups.splice(groupIndex, 1);
}

// 打开添加条件对话框
const openAddConditionDialog = (groupIndex) => {
    currentGroupIndex.value = groupIndex;
    // 根据当前条件组中已有的条件类型来初始化选择项
    selectedFieldIds.value = form.conditionGroups[groupIndex].conditions.map(c => c.fieldId);
    conditionDialogVisible.value = true;
}

// 取消添加条件
const cancelAddCondition = () => {
    conditionDialogVisible.value = false;
}

// 确认添加条件
const confirmAddCondition = () => {
    // 获取当前条件组中的条件
    const currentGroupConditions = form.conditionGroups[currentGroupIndex.value].conditions;

    // 保存现有条件的字段ID或类型，以便与选中的类型比较
    const existingFields = currentGroupConditions.map(c => c.fieldId);

    // 找出需要删除的条件（已存在但不在当前选择中的条件）
    const fieldsToRemove = existingFields.filter(field => !selectedFieldIds.value.includes(field));

    // 删除取消勾选的条件
    for (const field of fieldsToRemove) {
        const indexToRemove = currentGroupConditions.findIndex(c => (c.fieldId) === field);
        if (indexToRemove !== -1) {
            currentGroupConditions.splice(indexToRemove, 1);
        }
    }

    // 添加新选中的条件类型
    for (const selectedField of selectedFieldIds.value) {
        // 检查该字段是否已存在于当前组
        const exists = currentGroupConditions.some(c => (c.fieldId) === selectedField);
        if (!exists) {
            if (selectedField === CONDITION_FIELD_ID_INITIATOR) {
                // 发起人类型
                currentGroupConditions.push(createInitiatorCondition());
            } else {
                // 查找对应的表单项 - 通过组件ID查找
                const formItem = requiredItems.value.find(item => item.id === selectedField);
                
                if (formItem) {
                    // 公共字段提取
                    const commonFields = {
                        id: generateUniqueId(),
                        type: formItem.type, // 使用表单项的实际类型
                        label: formItem.label, // 存储表单项的标签
                        fieldId: formItem.id // 使用组件ID
                    };

                    // 根据字段类型决定如何初始化条件
                    if (formItem.type === FormComponentType.NUMBER) {
                        // 数字输入框类型
                        currentGroupConditions.push({
                            ...commonFields,
                            operator: 'lt', // 默认"小于"操作符
                            value: null, // 单个数值
                        });
                    } else if (formItem.type === FormComponentType.RADIO) {
                        // 单选框类型
                        const fieldOptions = formItem.options || [];
                        currentGroupConditions.push({
                            ...commonFields,
                            selectedOptions: [], // 选中的选项列表
                            options: fieldOptions, // 可选选项列表
                        });
                    } else if (formItem.type === FormComponentType.CHECKBOX) {
                        // 多选框类型
                        const fieldOptions = formItem.options || [];
                        currentGroupConditions.push({
                            ...commonFields,
                            operator: 'exact', // 默认"完全等于"操作符
                            selectedOptions: [], // 选中的选项列表
                            options: fieldOptions, // 可选选项列表
                        });
                    } else {
                        // 其他类型，通用处理
                        currentGroupConditions.push({
                            ...commonFields,
                            value: null,
                        });
                    }
                }
            }
        }
    }

    conditionDialogVisible.value = false;
}

// 删除条件
const removeCondition = (groupIndex, conditionIndex) => {
    form.conditionGroups[groupIndex].conditions.splice(conditionIndex, 1);
}

// 组件挂载时初始化数据
onMounted(() => {
    initFormData()
})

// 向父组件暴露保存方法
const saveSettings = () => {
    nodeProps.value = structuredClone(toRaw(form));
    return true;
}

const isFormChanged = () => getFormSnapshot() !== initialFormSnapshot.value;

// 将方法暴露给父组件
defineExpose({
    saveSettings,
    isFormChanged
})
</script>

<style scoped lang="scss">
.node-setting-form {
    margin-bottom: 40px;
}

.condition-content {
    padding: 20px 0;
}

.empty-state {
    margin-bottom: 20px;

    .empty-tip {
        color: #606266;
        font-size: 14px;
        line-height: 1.6;
        margin: 0;
        padding: 16px;
        background-color: #f5f7fa;
        border-radius: 4px;
        border-left: 3px solid #0ea5e9;
    }
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
    align-items: flex-start;
    margin-bottom: 20px;
    border-radius: 4px;

    .condition-type {
        font-weight: 500;
        margin-right: 10px;
        width: 100px;
        margin-top: 5px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }

    .condition-select {
        width: 120px;
        margin-right: 10px;
    }

    .number-input {
        width: 180px;
    }

    .checkbox-options-container {
        flex: 1;

        .el-checkbox-group {
            display: flex;
            flex-wrap: wrap;
            gap: 8px;
        }
    }

    .select-container {
        flex: 1;
    }

    .el-button {
        align-self: center;
        margin-left: auto;
        padding: 5px 10px;
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
