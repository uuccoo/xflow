<template>
  <el-drawer
    v-model="drawerVisible"
    title="详情"
    :destroy-on-close="true"
    direction="rtl"
    size="480px"
    class="task-detail-drawer"
  >
    <div class="drawer-container">
      <div class="drawer-body">
        <div v-if="loading" class="loading-container">
          <div class="loading-spinner"></div>
          <p>加载中...</p>
        </div>
        <template v-else-if="taskDetail">
          <!-- 基本信息 -->
          <div class="basic-info-section">
            <div class="task-title-row">
              <span class="task-title">{{ taskDetail.name }}</span>
              <el-tag :type="getStatusType(taskDetail.processStatus)">
                {{ taskDetail.processStatusDesc || '未知' }}
              </el-tag>
            </div>
            <div class="basic-info-item">
              {{ taskDetail.initiator?.realName || '未知' }}
            </div>
            <div class="approval-number">
              审批编号: {{ taskDetail.code || '暂无' }}
            </div>
          </div>

          <!-- 表单数据 -->
          <div class="form-section">
            <div class="section-title">表单</div>
            
            <!-- 需要填写表单 -->
            <div v-if="canFillForm" class="form-fill-container">
              <el-form ref="formRef" :model="formValues" label-position="top" class="custom-form">
                <form-renderer
                  v-for="item in taskDetail.formItems"
                  :key="item.id"
                  :component="item"
                  :form-values="formValues"
                />
              </el-form>
            </div>
            
            <!-- 只读表单数据展示 -->
            <div v-else class="form-data-container">
              <FormDisplay :form-items="taskDetail.formItems" :form-data="formValues" />
            </div>
          </div>

          <!-- 流程步骤 -->
          <div class="flow-section">
            <flow-steps 
              ref="flowStepsRef"
              :edit="canFillForm"
              :form-instance-id="taskDetail.formInstanceId"
              :form-data="formValues"
              :form-items="taskDetail.formItems"
            />
          </div>
        </template>
      </div>

      <!-- 操作按钮 -->
      <TaskDetailActions
        v-if="!loading && taskDetail"
        :task-detail="taskDetail"
        :tab-type="tabType"
        @refresh="emit('refresh')"
        @refresh-detail="handleRefreshTaskDetail"
        @close="closeDrawer"
        @submit-form="handleSubmitForm"
      />
    </div>
  </el-drawer>
</template>

<script setup>
import { computed, ref, provide, watch } from 'vue';
import { flowProcessApi, approvalCenterApi } from '@/api';
import { ElMessage } from 'element-plus';
import TaskDetailActions from './TaskDetailActions.vue';
import FlowSteps from './FlowSteps.vue';
import FormRenderer from '@/components/form/FormRenderer.vue';
import FormDisplay from '@/components/approval/FormDisplay.vue';
import { ApprovalCenterTab, FormInstanceStatus } from '@/enums';

// Props
const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  // 表单实例ID（必传）
  formInstanceId: {
    type: String,
    default: ''
  },
  // 任务ID（可选，审批中心场景会传）
  taskId: {
    type: String,
    default: ''
  },
  // Tab类型（可选，用于区分操作面板显示）
  tabType: {
    type: String,
    default: ''
  }
});

// Emits
const emit = defineEmits(['update:modelValue', 'refresh']);

const drawerVisible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
});

// 任务详情相关数据
const loading = ref(false);
const taskDetail = ref(null);
const formValues = ref({});
const formRef = ref(null);
const flowStepsRef = ref(null);

// 移动端视图模式
provide('viewMode', 'mobile');

// 仅在“待我审批”且需要填写表单时，才进入可填写模式
const canFillForm = computed(() => props.tabType === ApprovalCenterTab.PENDING_APPROVAL && !!taskDetail.value?.fillForm);

// 获取状态标签类型
const getStatusType = (status) => {
  const statusMap = {
    [FormInstanceStatus.PROCESSING]: 'primary',
    [FormInstanceStatus.COMPLETED]: 'success',
    [FormInstanceStatus.CANCELED]: 'info',
    [FormInstanceStatus.REJECTED]: 'danger',
  };
  return statusMap[status] || 'info';
};

// 组装详情查询参数（供接口调用）
const detailQuery = computed(() => {
  const query = {
    formInstanceId: props.formInstanceId
  };
  if (props.taskId) {
    query.taskId = props.taskId;
  }
  return query;
});

// 仅在抽屉打开时请求详情，打开状态下不重复请求
watch(
  () => props.modelValue,
  async (newModelValue) => {
    if (newModelValue && props.formInstanceId) {
      await fetchTaskDetail(detailQuery.value);
      return;
    }
  },
  { immediate: true }
);

// 关闭抽屉
const closeDrawer = () => {
  drawerVisible.value = false;
};

// 获取任务详情
const fetchTaskDetail = async (query) => {
  loading.value = true;
  taskDetail.value = null;

  try {
    const taskDetailData = await approvalCenterApi.getTaskDetail(query);
    console.log('获取任务详情:', taskDetailData);

    if (taskDetailData) {
      // 尽量从入参补齐 taskId，方便后续操作
      if (query?.taskId) {
        taskDetailData.taskId = query.taskId;
      }
      formValues.value = taskDetailData.formData || {};
      taskDetail.value = taskDetailData;
    }
  } catch (error) {
    console.error('获取任务详情失败', error);
  } finally {
    loading.value = false;
  }
};

// 仅刷新当前任务详情（用于评论后局部刷新）
const handleRefreshTaskDetail = async () => {
  if (!props.formInstanceId) {
    return;
  }
  await fetchTaskDetail(detailQuery.value);
};

// 处理表单提交
const handleSubmitForm = async () => {
  // 表单验证
  const valid = await formRef.value?.validate().catch(() => false);
  if (!valid) {
    ElMessage.warning('请完善表单信息')
    return
  }

  // 验证用户是否已选择所有需要选择的审批人
  if (flowStepsRef.value && !flowStepsRef.value.validateApproverSelection()) {
    return
  }

  // 准备提交数据
  const submitData = {
    formInstanceId: taskDetail.value.formInstanceId,
    formData: formValues.value,
    flowStepSelections: flowStepsRef.value ? flowStepsRef.value.buildFlowStepSelections() : []
  }

  try {
    const loadingInstance = ElMessage({
      message: '提交中...',
      duration: 0,
      type: 'info'
    })

    await flowProcessApi.modifyTask(submitData)
    
    loadingInstance.close()
    ElMessage.success('提交成功')
    
    closeDrawer()
    emit('refresh')
  } catch (error) {
    console.error('提交表单失败:', error)
  }
};


</script>

<style scoped>
.drawer-container {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.drawer-body {
  flex: 1;
  overflow-y: auto;
  padding: 0 20px 20px;
}

.basic-info-section {
  line-height: 1.8;
}

.form-section {
  margin-top: 32px;
}

.flow-section {
  margin-top: 32px;
}

.section-title {
  font-size: 16px;
  font-weight: 500;
  margin: 0 0 15px 0;
  padding-left: 12px;
  border-left: 3px solid #409eff;
}

.detail-item {
  margin-bottom: 10px;
}

.approval-number {
  color: #888;
  font-size: 13px;
  text-align: right;
}

.detail-label {
  display: block;
  margin-bottom: 4px;
  font-weight: 500;
  color: #666;
  font-size: 13px;
}

.detail-value {
  display: block;
  padding: 5px 10px;
  background-color: #fff;
  border: 1px solid #e0e0e0;
  border-radius: 3px;
  min-height: 18px;
  word-break: break-all;
  color: #333;
  font-size: 13px;
}

/* 任务标题样式 */
.task-title-row {
  display: flex;
  align-items: center;
  gap: 12px;
}

.task-title {
  font-size: 20px;
  font-weight: 500;
}

.empty-data {
  text-align: center;
  padding: 20px;
  color: #999;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 200px;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 3px solid #f3f3f3;
  border-top: 3px solid #1890ff;
  animation: spin 1s linear infinite;
  margin-bottom: 10px;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
}

.form-data-container {
  background-color: var(--x-fill-color-lighter);
  padding: 10px 12px;
  border-radius: 4px;
  border: var(--x-border-base);
}

.form-fill-container {
  background-color: #f9f9f9;
  padding: 15px 12px;
  border-radius: 4px;
  border: 1px solid #e0e0e0;
}

.flow-steps-loading {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background-color: #f0f9ff;
  border-radius: 4px;
  color: #409eff;
  font-size: 13px;
  margin-bottom: 12px;
}
</style>

<!-- 添加全局样式以覆盖 Element Plus 抽屉组件的默认内边距 -->
<style>
.task-detail-drawer .el-drawer__body {
    padding: 0;
    overflow: hidden;
    /* 防止内容区域出现双重滚动条 */
}
</style>