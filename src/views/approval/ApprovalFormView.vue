<template>
    <div class="approval-form-bg">
        <!-- 悬浮返回按钮（使用 el-tooltip 显示提示） -->
        <el-tooltip content="返回" placement="top">
            <div class="floating-back-button" @click="goBack">
                <el-icon><arrow-left /></el-icon>
            </div>
        </el-tooltip>

        <div v-if="loading" class="loading-container">
            <el-skeleton :rows="10" animated />
        </div>
        
        <div v-else-if="formData" class="approval-sections">
            <!-- 表单区域 -->
            <div class="form-section">
                <div class="form-header">
                    <h1 class="form-title">{{ formTitle }}</h1>
                </div>
                <el-divider></el-divider>

                <!-- 表单填写部分 -->
                <div class="form-content">
                    <el-form ref="formRef" :model="formValues" label-position="top" class="custom-form">
                        <div v-for="item in formData.formDesign.formItems" :key="item.id" class="form-item-container">
                            <form-renderer :component="item" :form-values="formValues" @update:value="updateValue" />
                        </div>
                    </el-form>
                </div>

                <!-- 提交按钮 -->
                <div class="form-actions">
                    <el-button @click="goBack">取消</el-button>
                    <el-button type="primary" @click="submitForm" :loading="submitting">提交</el-button>
                    <el-button type="info" @click="debugFormData" v-if="isDevMode">调试</el-button>
                </div>
            </div>
        </div>

        <div v-else class="error-container">
            <el-empty description="加载表单失败" />
            <el-button type="primary" @click="reloadForm">重新加载</el-button>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, reactive, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import { ArrowLeft } from '@element-plus/icons-vue';
import { formApi } from '@/api';
import FormRenderer from '@/components/form/FormRenderer.vue';
import { isDevelopment } from '@/utils/env';

const route = useRoute();
const router = useRouter();

// 判断是否为开发环境（使用通用工具函数）
const isDevMode = computed(() => isDevelopment());

// 表单相关状态
const formData = ref(null);
const formTitle = ref('表单填写');
const loading = ref(true);
const submitting = ref(false);
const formValues = reactive({});
const formRef = ref(null);

// 获取表单详情
const loadForm = async () => {
    const formId = route.query.id;
    const formCode = route.query.code;

    if (!formId && !formCode) {
        ElMessage.error('表单参数错误');
        return;
    }

    loading.value = true;

    try {
        let result;

        if (formId) {
            result = await formApi.getFormDetail(formId);
        } else if (formCode) {
            result = await formApi.getFormByCode(formCode);
        }

        if (result) {
            formData.value = result;
            formTitle.value = result.basicSettings?.formName || '表单填写';

            // 初始化表单字段和默认值
            if (result.formDesign && result.formDesign.formItems) {
                result.formDesign.formItems.forEach(item => {
                    if (item.id) {
                        formValues[item.id] = item.defaultValue || '';
                    }
                });
            }
        } else {
            ElMessage.error('表单数据获取失败');
        }
    } catch (error) {
        console.error('加载表单失败:', error);
        ElMessage.error('加载表单失败: ' + (error.message || '未知错误'));
    } finally {
        loading.value = false;
    }
};

// 重新加载表单
const reloadForm = () => {
    loadForm();
};

// 返回上一页
const goBack = () => {
    router.back();
};

// 更新表单值
const updateValue = (id, value) => {
    if (id) {
        formValues[id] = value;
    }
};

// 验证表单
const validateForm = () => {
    if (!formData.value || !formData.value.formDesign) {
        return false;
    }

    const requiredItems = formData.value.formDesign.formItems.filter(item => item.required);
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

// 调试表单数据
const debugFormData = () => {
    console.group('表单调试信息');
    console.log('表单基础信息:', formData.value);
    console.log('用户填写的表单值:', formValues);
    
    // 创建要提交到后端的数据结构
    const submissionData = {
        formId: formData.value.id,
        formCode: formData.value.basicSettings?.formCode,
        formName: formData.value.basicSettings?.formName,
        formValues: { ...formValues },
        submitTime: new Date().toISOString()
    };
    
    console.log('要提交到后端的数据:', submissionData);
    console.groupEnd();
    
    ElMessage.success('表单数据已在控制台打印，请按 F12 查看');
};

// 提交表单
const submitForm = async () => {
    // 表单验证
    if (!validateForm()) {
        return;
    }

    submitting.value = true;

    try {
        // 确认提交
        await ElMessageBox.confirm('确定要提交此审批表单吗？', '提交确认', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'info'
        });

        // 提交表单数据
        // 这里需要添加调用提交审批API的代码
        // 假设API为 submitApproval(formData, formValues)

        ElMessage.success('表单已提交成功');

        // 提交成功后返回到发起审批
        router.push('/home/initiate');
    } catch (error) {
        if (error !== 'cancel') {
            console.error('提交表单失败:', error);
            ElMessage.error('提交表单失败: ' + (error.message || '未知错误'));
        }
    } finally {
        submitting.value = false;
    }
};

// 组件挂载时加载表单数据
onMounted(() => {
    loadForm();
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

.loading-container,
.error-container {
    width: 800px;
    margin-top: 20px;
    background-color: #fff;
    border-radius: 8px;
    padding: 40px 20px;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
    text-align: center;
}

.error-container .el-button {
    margin-top: 20px;
}
</style>