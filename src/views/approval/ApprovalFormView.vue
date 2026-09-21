<template>
    <div class="approval-form-bg">
        <!-- 悬浮返回按钮（使用 el-tooltip 显示提示） -->
        <el-tooltip content="返回" placement="top">
            <el-button :icon="ArrowLeft" class="floating-back-button" size="large" circle @click="goToInitiateApproval" />
        </el-tooltip>

        <div v-if="loading" class="loading-container">
            <el-skeleton :rows="10" animated />
        </div>
        
        <div v-else-if="formFillData" class="approval-sections">
            <!-- 表单区域 -->
            <div class="form-section">
                <div class="form-header">
                    <h1 class="form-title">{{ formName }}</h1>
                </div>
                <el-divider></el-divider>

                <!-- 表单填写部分 -->
                <div class="form-content">
                    <el-form ref="formRef" :model="formValues" label-position="top" class="custom-form">
                        <form-renderer
                            v-for="item in formItems"
                            :key="item.id"
                            :component="item"
                            :form-values="formValues"
                        />
                    </el-form>
                </div>

                <!-- 提交按钮 -->
                <div class="form-actions">
                    <el-button @click="goToInitiateApproval">取消</el-button>
                    <el-button type="primary" @click="submitForm" :loading="submitting">提交</el-button>
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
import { computed, ref, onBeforeMount } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import { ArrowLeft } from '@element-plus/icons-vue';
import { formApi } from '@/api';
import FormRenderer from '@/components/form/FormRenderer.vue';
import { buildDefaultFormValues } from '@/utils/formItems';

const route = useRoute();
const router = useRouter();

// 填写页表单数据（后端 FormFillResp）
const formFillData = ref(null);
const formName = ref('表单填写');
const loading = ref(true);
const submitting = ref(false);
const formRef = ref(null);

// 表单项配置和运行时填写值
const formItems = computed(() => formFillData.value?.formItems || []);
const formValues = ref({});

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
        let fillData;

        if (formId) {
            fillData = await formApi.getFormFillById(formId);
        } else if (formCode) {
            fillData = await formApi.getFormFillByCode(formCode);
        }

        if (fillData) {
            formFillData.value = fillData;
            formName.value = fillData.formName || '表单填写';
            formValues.value = buildDefaultFormValues(formItems.value);
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

// 返回发起审批页面
const goToInitiateApproval = () => {
    router.push('/home/initiate');
};

// 提交表单
const submitForm = async () => {
    // 表单验证
    const valid = await formRef.value?.validate().catch(() => false);
    if (!valid) {
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
        // 假设API为 submitApproval(formFillData, formValues)

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
onBeforeMount(() => {
    loadForm();
});
</script>

<style scoped lang="scss">
.approval-form-bg {
    display: flex;
    flex-direction: column;
    align-items: center;
    background-color: var(--x-bg-color-page);
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
    border: var(--x-border-base);
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

.form-actions {
    display: flex;
    justify-content: center;
    margin: 30px 0;
    gap: 16px;
}

.loading-container,
.error-container {
    width: 800px;
    background-color: #fff;
    border: var(--x-border-base);
    border-radius: 8px;
    padding: 40px 20px;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
    text-align: center;
}

.error-container .el-button {
    margin-top: 20px;
}
</style>