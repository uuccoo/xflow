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
                <div
                    :class="{ 'condition-group': conditionGroups.length > 1, 'single-condition-group': conditionGroups.length === 1 }">
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
                            <designated-person-selector v-if="condition.type === '发起人'" v-model="condition.users" />

                            <!-- 数字输入框条件 -->
                            <template v-else-if="isNumberField(condition.type)">
                                <!-- 条件类型选择 -->
                                <el-select v-model="condition.conditionType" class="condition-select">
                                    <el-option v-for="option in numberConditionOptions" :key="option.value"
                                        :label="option.label" :value="option.value" />
                                </el-select>

                                <!-- 单个数值 -->
                                <el-input-number v-model="condition.value" class="number-input"
                                    :placeholder="'请输入数值'" />
                            </template>

                            <!-- 单选框条件 -->
                            <template v-else-if="isRadioField(condition.type)">
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
                            <template v-else-if="isCheckboxField(condition.type)">
                                <!-- 条件类型选择 -->
                                <el-select v-model="condition.conditionType" class="condition-select">
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
                    <!-- 动态显示所有必填表单项 -->
                    <el-checkbox v-for="field in requiredFormFields" :key="field" :label="field">{{ field
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
import { ref, watch, onMounted } from 'vue'
import { useFlowDesignStore } from '@/stores/flowDesignStore'
import { useFormDesignStore } from '@/stores/formDesignStore'
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
const formDesignStore = useFormDesignStore()

// 存储表单中所有必填项的标题
const requiredFormFields = ref([]);

// 存储表单项标题和类型的映射，用于判断条件类型
const formFieldTypesMap = ref({});

// 条件组列表
const conditionGroups = ref([]);

// 条件对话框相关
const conditionDialogVisible = ref(false);
const selectedConditionTypes = ref([]);
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

// 判断表单字段是否是数字输入框类型
const isNumberField = (fieldTitle) => {
    return formFieldTypesMap.value[fieldTitle] === 'number';
};

// 判断表单字段是否是单选框类型
const isRadioField = (fieldTitle) => {
    return formFieldTypesMap.value[fieldTitle] === 'radio';
};

// 判断表单字段是否是多选框类型
const isCheckboxField = (fieldTitle) => {
    return formFieldTypesMap.value[fieldTitle] === 'checkbox';
};

// 获取表单字段的选项列表
const getFieldOptions = (fieldTitle) => {
    // 找到对应标题的表单项
    const formItem = formDesignStore.formItems.find(item => item.title === fieldTitle);
    if (formItem && formItem.options) {
        return formItem.options;
    }
    return [];
}

// 获取表单中的必填项
const getRequiredFormFields = () => {
    // 创建一个辅助函数，递归遍历所有表单项，包括分栏容器内的组件
    const collectRequiredFields = (items) => {
        let result = [];

        for (const item of items) {
            // 如果是分栏容器，递归处理其子组件
            if (item.type === 'columns' && item.children && item.children.length > 0) {
                result = result.concat(collectRequiredFields(item.children));
            }
            // 如果是必填的单选框、多选框或数字输入框，加入结果
            else if (item.required && item.title && ['radio', 'checkbox', 'number'].includes(item.type)) {
                result.push(item);
            }
        }

        return result;
    };

    // 收集所有表单项中符合条件的字段
    const requiredItems = collectRequiredFields(formDesignStore.formItems);

    // 提取必填项标题存储到数组
    requiredFormFields.value = requiredItems.map(item => item.title);

    // 构建表单项标题和类型的映射
    formFieldTypesMap.value = {};
    requiredItems.forEach(item => {
        formFieldTypesMap.value[item.title] = item.type;
    });
}

// 初始化表单数据
const initFormData = () => {
    console.log('初始化表单数据', props.node);
    // 获取必填表单项
    getRequiredFormFields();

    // 如果节点中已有条件组数据，则使用；否则初始化一个默认条件组
    if (props.node.props && props.node.props.conditionGroups && props.node.props.conditionGroups.length) {
        conditionGroups.value = JSON.parse(JSON.stringify(props.node.props.conditionGroups));
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
}

// 删除条件组
const removeConditionGroup = (groupIndex) => {
    conditionGroups.value.splice(groupIndex, 1);
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
            // 判断字段类型决定如何初始化条件
            if (isNumberField(type)) {
                // 数字输入框类型
                currentGroupConditions.push({
                    id: Date.now() + Math.random(),
                    type: type,
                    conditionType: 'lt', // 默认"小于"条件
                    value: null, // 单个数值
                });
            } else if (isRadioField(type)) {
                // 单选框类型
                const fieldOptions = getFieldOptions(type);
                currentGroupConditions.push({
                    id: Date.now() + Math.random(),
                    type: type,
                    selectedOptions: [], // 选中的选项列表
                    options: fieldOptions, // 可选选项列表
                });
            } else if (isCheckboxField(type)) {
                // 多选框类型
                const fieldOptions = getFieldOptions(type);
                currentGroupConditions.push({
                    id: Date.now() + Math.random(),
                    type: type,
                    conditionType: 'exact', // 默认"完全等于"条件
                    selectedOptions: [], // 选中的选项列表
                    options: fieldOptions, // 可选选项列表
                });
            } else if (type === '发起人') {
                // 发起人类型
                currentGroupConditions.push({
                    id: Date.now() + Math.random(),
                    type: type,
                    users: [] // 用户列表
                });
            } else {
                // 其他类型，通用处理
                currentGroupConditions.push({
                    id: Date.now() + Math.random(),
                    type: type,
                    value: null
                });
            }
        }
    }

    conditionDialogVisible.value = false;
}

// 删除条件
const removeCondition = (groupIndex, conditionIndex) => {
    conditionGroups.value[groupIndex].conditions.splice(conditionIndex, 1);
}

// 监听节点变化
watch(() => props.node, () => {
    initFormData()
}, { immediate: true })

// 组件挂载时初始化数据
onMounted(() => {
    initFormData()
})

// 向父组件暴露保存方法
const saveSettings = () => {
    // 确保节点有 props 属性和 branches 字段
    if (!props.node.props) {
        props.node.props = {};
    }

    // 根据条件组数据生成branches字段
    // 注意：这里将条件组数据转换为branches字段格式
    // 这里是简化实现，实际可能需要根据业务逻辑进行更复杂的转换

    // 首先确保节点的branches数组存在
    if (!props.node.branches) {
        props.node.branches = [];
    }

    // 保存条件组设置到节点的props对象中（用于内部处理）
    props.node.props.conditionGroups = JSON.parse(JSON.stringify(conditionGroups.value));

    console.log('保存的条件组数据:', props.node.props.conditionGroups);
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