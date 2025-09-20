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
                            <span class="condition-type">{{ condition.label}}</span>

                            <!-- 发起人条件时显示人员选择器 -->
                            <designated-person-selector
                                v-if="condition.type === 'initiator'"
                                v-model="condition.users"
                            />

                            <!-- 数字输入框条件 -->
                            <template v-else-if="condition.type === FormComponentType.NUMBER">
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
            <span>请选择用来区分审批流程的条件字段，已选{{ selectedFieldIds.length }}个</span>
            <div class="condition-selection">
                <el-checkbox-group v-model="selectedFieldIds">
                    <el-checkbox label="initiator">发起人</el-checkbox>
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
import { ref, watch, onMounted } from 'vue'
import { useFlowDesignStore } from '@/stores/flowDesignStore'
import { useFormDesignStore } from '@/stores/formDesignStore'
import { ElMessage } from 'element-plus'
import { Plus, Delete } from '@element-plus/icons-vue'
import DesignatedPersonSelector from '../../common/DesignatedPersonSelector.vue'
import { generateUniqueId } from '@/utils/idGenerator'
import { FormComponentType } from '@/enums'

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

// 存储表单中所有必填项
const requiredItems = ref([]);

// 条件组列表
const conditionGroups = ref([]);

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

// 获取表单中的必填项
const getRequiredFormFields = () => {
    // 创建一个辅助函数，递归遍历所有表单项，包括分栏容器内的组件
    const collectRequiredFields = (items) => {
        let result = [];

        for (const item of items) {
            // 如果是分栏容器，递归处理其子组件
            if (item.type === FormComponentType.COLUMNS && item.children && item.children.length > 0) {
                result = result.concat(collectRequiredFields(item.children));
            }
            // 如果是必填的单选框、多选框或数字输入框，加入结果
            else if (item.required && item.label && [FormComponentType.RADIO, FormComponentType.CHECKBOX, FormComponentType.NUMBER].includes(item.type)) {
                result.push(item);
            }
        }

        return result;
    };

    // 收集所有表单项中符合条件的字段，直接存储到requiredItems中
    requiredItems.value = collectRequiredFields(formDesignStore.formItems);
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
        conditionGroups.value = [];
        addConditionGroup();
    }
}

// 创建发起人条件对象
function createInitiatorCondition() {
    return {
        id: generateUniqueId(),
        type: 'initiator',
        label: '发起人',
        fieldId: 'initiator',
        users: []
    }
}

// 添加条件组
const addConditionGroup = () => {
    conditionGroups.value.push({
        id: Date.now(),
        conditions: [
            createInitiatorCondition()
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
    selectedFieldIds.value = conditionGroups.value[groupIndex].conditions.map(c => c.fieldId);
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
            if (selectedField === 'initiator') {
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
                            conditionType: 'lt', // 默认"小于"条件
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
                            conditionType: 'exact', // 默认"完全等于"条件
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