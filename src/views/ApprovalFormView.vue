<template>
    <div class="approval-form-bg">
        <div class="approval-form-container">
            <div class="form-header">
                <div class="back-button" @click="goBack">
                    <el-icon><arrow-left /></el-icon>
                    <span>返回</span>
                </div>
                <h1 class="form-title">{{ formTitle }}</h1>
            </div>
            <el-divider></el-divider>

            <div v-if="loading" class="loading-container">
                <el-skeleton :rows="10" animated />
            </div>

            <div v-else-if="formData" class="form-content">
                <!-- 表单渲染 -->
                <el-form ref="formRef" :model="formValues" label-position="top" class="custom-form">
                    <div v-for="item in formData.formDesign.formItems" :key="item.id" class="form-item-container">
                        <form-renderer :component="item" :form-values="formValues" @update:value="updateValue" />
                    </div>
                </el-form>

                <!-- 提交按钮 -->
                <div class="form-actions">
                    <el-button @click="goBack">取消</el-button>
                    <el-button type="primary" @click="submitForm" :loading="submitting">提交</el-button>
                </div>
            </div>

            <div v-else class="error-container">
                <el-empty description="加载表单失败" />
                <el-button type="primary" @click="reloadForm">重新加载</el-button>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, reactive } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ElMessage, ElMessageBox } from 'element-plus';
import { ArrowLeft } from '@element-plus/icons-vue';
import { formApi } from '@/api';
import FormRenderer from '@/components/form/FormRenderer.vue';

const route = useRoute();
const router = useRouter();

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

        if (result && result.data) {
            formData.value = result.data;
            formTitle.value = result.data.basicSettings?.formName || '表单填写';

            // 初始化表单字段和默认值
            if (result.data.formDesign && result.data.formDesign.formItems) {
                result.data.formDesign.formItems.forEach(item => {
                    if (item.field) {
                        formValues[item.field] = item.defaultValue || '';
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
const updateValue = (field, value) => {
    if (field) {
        formValues[field] = value;
    }
};

// 验证表单
const validateForm = () => {
    if (!formData.value || !formData.value.formDesign) {
        return false;
    }

    const requiredItems = formData.value.formDesign.formItems.filter(item => item.required);
    for (const item of requiredItems) {
        if (!item.field) continue;

        const value = formValues[item.field];
        if (value === undefined || value === null || value === '') {
            ElMessage.error(`${item.title || '未命名字段'} 为必填项`);
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

        // 提交成功后返回到审批中心
        router.push('/approval-center');
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
    justify-content: center;
    align-items: flex-start;
    background-color: #f5f6f6;
    width: 100%;
    min-height: 100vh;
}

.approval-form-container {
    width: 800px;
    margin: 10px;
    padding: 0 20px;
    background-color: #fff;
    border-radius: 8px;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.form-header {
    display: flex;
    align-items: center;
    position: relative;
    margin: 20px 0;
}

.back-button {
    display: flex;
    align-items: center;
    cursor: pointer;
    position: absolute;
    left: 0;
    color: #606266;
}

.back-button:hover {
    color: #409EFF;
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