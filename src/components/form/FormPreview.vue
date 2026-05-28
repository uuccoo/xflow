<template>
    <div class="approval-form-bg">
        <!-- 悬浮返回按钮（使用 el-tooltip 显示提示） -->
        <el-tooltip content="返回" placement="top">
            <el-button :icon="ArrowLeft" class="floating-back-button" size="large" circle @click="goBack" />
        </el-tooltip>

        <div class="approval-sections">
            <!-- 表单区域 -->
            <div class="form-section">
                <div class="form-header">
                    <h1 class="form-title">{{ formTitle }}</h1>
                    <div class="preview-badge">预览模式</div>
                </div>
                <el-divider></el-divider>

                <!-- 表单填写部分 -->
                <div class="form-content">
                    <el-form :model="formValues" label-position="top" class="custom-form">
                        <div v-for="item in formItems" :key="item.id" class="form-item-container">
                            <form-renderer :component="item" :form-values="formValues" :validation-errors="validationErrors"
                                @update:value="updateValue" @update:error="updateError" />
                        </div>
                    </el-form>
                </div>

                <!-- 提交按钮 -->
                <div class="form-actions">
                    <el-button @click="goBack">取消</el-button>
                    <el-button type="primary" @click="submitForm">提交</el-button>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { onBeforeMount, reactive, computed } from 'vue';
import { storeToRefs } from 'pinia';
import { ElMessage } from 'element-plus';
import { ArrowLeft } from '@element-plus/icons-vue';
import FormRenderer from '@/components/form/FormRenderer.vue';
import { useBasicSettingsStore } from '@/stores/basicSettingsStore';
import { useFormDesignStore } from '@/stores/formDesignStore';
import { FormComponentType } from '@/enums';
import { buildDefaultFormValues, collectRequiredFormItems } from '@/utils/formItems';

// 定义emits
const emit = defineEmits(['close-preview']);

// 引入 store
const basicSettingsStore = useBasicSettingsStore();
const formDesignStore = useFormDesignStore();
const { formItems } = storeToRefs(formDesignStore);

// 表单相关状态
const formValues = reactive({});
const validationErrors = reactive({});

// 从 store 读取表单标题
const formTitle = computed(() => basicSettingsStore.basicSettings.formName || '表单预览');

// 初始化表单字段和默认值
const initFormValues = () => {
    const defaultValues = buildDefaultFormValues(formItems.value);
    Object.assign(formValues, defaultValues);
};

// 返回上一页
const goBack = () => {
    emit('close-preview');
};

// 更新表单值
const updateValue = (id, value) => {
    if (id) {
        formValues[id] = value;
    }
};

// 更新校验错误
const updateError = (id, error) => {
    if (!id) return;
    if (error) {
        validationErrors[id] = error;
    } else {
        if (validationErrors[id] !== undefined) {
            delete validationErrors[id]
        }
    }
};

// 判断必填字段是否为空
const isRequiredValueEmpty = (item, value) => {
    if (item?.type === FormComponentType.TEXT) {
        return false;
    }

    if (item?.type === FormComponentType.PHONE) {
        return !value || typeof value !== 'object' || !value.number || value.number.trim() === '';
    }

    if (item?.type === FormComponentType.DATE && item?.dateType === 'datetimeAmPm') {
        return !value || typeof value !== 'object' || !value.date;
    }

    if (item?.type === FormComponentType.DATERANGE) {
        if (!value || typeof value !== 'object') {
            return true;
        }

        if (item?.dateType === 'datetimeAmPm') {
            return !value.startDate || typeof value.startDate !== 'object' || !value.startDate.date || !value.endDate || typeof value.endDate !== 'object' || !value.endDate.date;
        }

        return !value.startDate || !value.endDate;
    }

    const arrayRequiredTypes = [
        FormComponentType.CHECKBOX,
        FormComponentType.UPLOAD,
        FormComponentType.IMAGE
    ];

    if (arrayRequiredTypes.includes(item?.type)) {
        return !Array.isArray(value) || value.length === 0;
    }

    if (typeof value === 'string') {
        return value.trim() === '';
    }

    return value === undefined || value === null;
};

// 验证表单
const validateForm = () => {
    const requiredItems = collectRequiredFormItems(formItems.value);

    // 1. 必填项校验
    for (const item of requiredItems) {
        if (!item.id) continue;

        const value = formValues[item.id];
        if (isRequiredValueEmpty(item, value)) {
            ElMessage.error(`${item.label || '未命名字段'} 为必填项`);
            return false;
        }
    }

    // 2. 检查父组件维护的 validationErrors 是否存在错误
    for (const [id, err] of Object.entries(validationErrors)) {
        if (err?.message) {
            ElMessage.error(`${err.label || '字段'}: ${err.message}`)
            return false
        }
    }

    return true;
};

// 提交表单
const submitForm = async () => {
    // 表单验证
    if (!validateForm()) {
        return;
    }
    ElMessage({
        message: '预览模式下不能提交表单',
        type: 'warning'
    });
};

// 组件挂载时初始化表单默认值
onBeforeMount(() => {
    initFormValues();
});
</script>

<style scoped lang="scss">
.approval-form-bg {
    display: flex;
    flex-direction: column;
    align-items: center;
    background-color: #f5f6f6;
    width: 100%;
    min-height: 100vh;
    padding: 20px 0;
    position: relative; /* 为悬浮按钮提供定位上下文 */
}

/* 悬浮返回按钮样式 */
.floating-back-button {
    position: fixed;
    top: 25px;
    /* 计算位置：(页面宽度 - 表单宽度) / 2 - 按钮宽度 - 间距 */
    left: calc(50% - 400px - 80px);
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
    z-index: 999; /* 确保按钮在最上层 */
}

.approval-sections {
    width: 800px;
    display: flex;
    flex-direction: column;
    gap: 20px; /* 两个区域之间的间距 */
}

.form-section {
    background-color: #fff;
    border-radius: 8px;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
    padding: 0 20px;
}

.form-header {
    display: flex;
    align-items: center;
    position: relative;
    margin: 20px 0;
}

.form-title {
    flex: 1;
    text-align: center;
    font-size: 23px;
    font-weight: 500;
    margin: 0;
    color: #303133;
}

.preview-badge {
    position: absolute;
    right: 0;
    background-color: #E6A23C;
    color: white;
    padding: 2px 8px;
    border-radius: 4px;
    font-size: 12px;
}

.form-content {
    margin-top: 30px;
    padding-bottom: 20px;
}

.form-item-container {
    margin-bottom: 20px;
}

.form-actions {
    display: flex;
    justify-content: center;
    margin: 30px 0;
    gap: 16px;
}
</style>