<template>
    <div class="approval-form-bg">
        <!-- 悬浮返回按钮（使用 el-tooltip 显示提示） -->
        <el-tooltip content="返回" placement="top">
            <div class="floating-back-button" @click="goBack">
                <el-icon><arrow-left /></el-icon>
            </div>
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
                            <form-renderer :component="item" :form-values="formValues" @update:value="updateValue" />
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
import { ref, onMounted, reactive, computed } from 'vue';
import { storeToRefs } from 'pinia';
import { ElMessage } from 'element-plus';
import { ArrowLeft } from '@element-plus/icons-vue';
import FormRenderer from '@/components/form/FormRenderer.vue';
import { useBasicSettingsStore } from '@/stores/basicSettingsStore';
import { useFormDesignStore } from '@/stores/formDesignStore';

// 定义emits
const emit = defineEmits(['close-preview']);

// 引入 store
const basicSettingsStore = useBasicSettingsStore();
const formDesignStore = useFormDesignStore();
const { formItems } = storeToRefs(formDesignStore);

// 表单相关状态
const formValues = reactive({});

// 从 store 读取表单标题
const formTitle = computed(() => basicSettingsStore.basicSettings.formName || '表单预览');

// 初始化表单字段和默认值
const initFormValues = () => {
    formItems.value.forEach(item => {
        if (item.id) {
            formValues[item.id] = item.defaultValue || '';
        }
    });
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

// 验证表单
const validateForm = () => {
    const requiredItems = formItems.value.filter(item => item.required);
    for (const item of requiredItems) {
        if (!item.id) continue;

        const value = formValues[item.id];
        if (value === undefined || value === null || value === '') {
            ElMessage.error(`${item.label || '未命名字段'} 为必填项`);
            return false;
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
onMounted(() => {
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
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    background-color: #fff;
    border-radius: 50%; /* 圆形按钮 */
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
    cursor: pointer;
    z-index: 999; /* 确保按钮在最上层 */
    color: #606266;
    transition: all 0.3s ease;
}

.floating-back-button:hover {
    color: #409EFF;
    background-color: #f5f7fa;
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