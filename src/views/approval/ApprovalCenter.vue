<template>
  <!-- 页面主容器：承载标题、列表及任务详情抽屉 -->
  <div class="approval-center">
    <div class="page-header">
      <div class="header-left">
        <div class="page-title">审批中心</div>
        <div class="header-divider"></div>
        <!-- 切换标签：展示待办、已办、我发起的审批类别 -->
        <div class="tabs">
          <div v-for="(tab, index) in tabs" :key="index" :class="['tab', { active: activeTab === tab.key }]"
            @click="activeTab = tab.key">
            <el-badge :value="getBadgeValue(tab.key)" :offset="[8, 0]" :max="99" :show-zero="false">
              {{ tab.name }}
            </el-badge>
          </div>
        </div>
      </div>
    </div>

    <div class="approval-content">
      <!-- 筛选区域：类型、审批状态与高级筛选条件 -->
      <ApprovalFilterPanel
        :active-tab="activeTab"
        @search="handleSearch"
        @mark-all-read="handleMarkAllRead"
      />

      <!-- 列表区域：包含表头、数据行与空状态提示 -->
      <div class="approval-list">
        <div class="list-header">
          <span class="col title">标题</span>
          <span class="col summary">摘要</span>
          <span class="col initiator">发起人</span>
          <span class="col start-time">发起时间</span>
          <span class="col finish-time">完成时间</span>
          <span class="col process-status">流程状态</span>
        </div>
        <div v-if="loading" class="empty-list">
          加载中...
        </div>
        <div v-else-if="listData.length === 0" class="empty-list">
          <!-- 根据当前标签展示对应的空文案 -->
          {{ emptyTexts[activeTab] || '暂无数据' }}
        </div>
        <template v-else>
          <!-- 单行审批数据：点击后打开任务详情 -->
          <div v-for="(item, index) in listData" :key="getItemKey(item, index)" class="list-item" @click="viewDetail(item)">
            <span class="col title">
              <span v-if="shouldShowUnread(item)" class="unread-dot"></span>
              {{ item.name }}
            </span>
            <span class="col summary">
              <FormSummary :form-items="item.formItems" :form-data="item.formData" />
            </span>
            <span class="col initiator">
              <UserAvatar
                :user="item.initiator || {}"
                :size="30"
                layout="horizontal"
              />
            </span>
            <span class="col start-time">{{ item.initiatedAt }}</span>
            <span class="col finish-time">{{ item.finishedAt || '-' }}</span>
            <span class="col process-status" :class="'status-' + item.processStatus">
              {{ item.processStatusDesc }}
            </span>
          </div>

          <!-- 分页控件：上一页 / 下一页 -->
          <div class="pagination" v-if="listData.length > 0">
            <button :disabled="!pagination.hasPrevious" @click="handlePageChange(pagination.page - 1)"
              class="pagination-btn">
              上一页
            </button>
            <span class="page-info">{{ pagination.page }} / {{ pagination.totalPages }}</span>
            <button :disabled="!pagination.hasNext" @click="handlePageChange(pagination.page + 1)"
              class="pagination-btn">
              下一页
            </button>
          </div>
        </template>
      </div>
    </div>

    <!-- 任务详情组件 -->
    <TaskDetailDrawer
      v-model="showTaskDetail"
      :form-instance-id="detailFormInstanceId"
      :task-id="detailTaskId"
      :tab-type="detailTabType"
      @refresh="handleTaskDetailRefresh"
    />
  </div>
</template>

<script setup>
import { ref, watch, onMounted, reactive } from 'vue';
import { approvalCenterApi } from '@/api';
import { ElMessage } from 'element-plus';
import TaskDetailDrawer from '@/components/approval/TaskDetailDrawer.vue';
import FormSummary from '@/components/approval/FormSummary.vue';
import UserAvatar from '@/components/common/UserAvatar.vue';
import ApprovalFilterPanel from '@/components/approval/ApprovalFilterPanel.vue';
import { ApprovalCenterTab } from '@/enums';
import { useApprovalBadgeStore } from '@/stores/approvalBadgeStore';

// 任务详情相关数据
const showTaskDetail = ref(false);
const detailFormInstanceId = ref('');
const detailTaskId = ref('');
const detailTabType = ref('');

// 审批徽章 store
const approvalBadgeStore = useApprovalBadgeStore();

// 标签页定义
const tabs = [
  { name: '待我审批', key: ApprovalCenterTab.PENDING_APPROVAL },
  { name: '我已审批', key: ApprovalCenterTab.APPROVED_BY_ME },
  { name: '我发起的', key: ApprovalCenterTab.MY_INITIATION },
  { name: '抄送我的', key: ApprovalCenterTab.CC_TO_ME }
];
const activeTab = ref(ApprovalCenterTab.PENDING_APPROVAL);

// 优先使用 taskId 或 formInstanceId 作为唯一键，保证渲染稳定
const getItemKey = (item, index) => item.taskId ?? item.formInstanceId ?? index;

// 初始化分页初始值，便于重置使用
const initPagination = () => ({
  page: 1,
  pageSize: 10,
  total: 0,
  totalPages: 0,
  hasPrevious: false,
  hasNext: false
});

// 当前列表数据
const listData = ref([]);
const loading = ref(false);
const pagination = ref(initPagination());

// 筛选条件，由筛选组件一次性传入，在构建接口参数时与分页信息合并
const filters = ref({});

// 获取指定tab的徽章值
const getBadgeValue = (tabKey) => {
  if (tabKey === ApprovalCenterTab.PENDING_APPROVAL) {
    return approvalBadgeStore.pendingApprovalCount;
  }
  if (tabKey === ApprovalCenterTab.CC_TO_ME) {
    return approvalBadgeStore.ccToMeCount;
  }
  return 0;
};

/**
 * 重置分页信息
 * @param page 指定页码
 * @param pageSize 指定每页显示数量
 */
const resetPagination = (page = 1, pageSize = pagination.value.pageSize) => {
  // 每次重新加载前重置分页状态，并允许传入指定页码
  pagination.value = {
    ...initPagination(),
    page,
    pageSize
  };
};

// 根据当前筛选条件构造接口查询参数
const buildQueryParams = () => {
  return {
    page: pagination.value.page,
    pageSize: pagination.value.pageSize,
    ...filters.value
  };
};

// 将接口返回的分页信息同步到本地状态
const applyPagination = (pageData) => {
  pagination.value = {
    page: pageData.page,
    pageSize: pageData.pageSize,
    total: pageData.total,
    totalPages: pageData.totalPages,
    hasPrevious: pageData.hasPrevious,
    hasNext: pageData.hasNext
  };
};

// 按当前标签决定调用的后端接口
const fetchList = async () => {
  const tab = activeTab.value;
  loading.value = true;
  listData.value = [];
  try {
    let pageData;
    if (tab === ApprovalCenterTab.PENDING_APPROVAL) {
      pageData = await approvalCenterApi.getPendingTasks(buildQueryParams());
    } else if (tab === ApprovalCenterTab.APPROVED_BY_ME) {
      pageData = await approvalCenterApi.getApprovedByMe(buildQueryParams());
    } else if (tab === ApprovalCenterTab.MY_INITIATION) {
      pageData = await approvalCenterApi.getMyInitiations(buildQueryParams());
    } else if (tab === ApprovalCenterTab.CC_TO_ME) {
      pageData = await approvalCenterApi.getCcToMe(buildQueryParams());
    } else {
      return;
    }
    console.log('获取审批列表:', pageData);
    if (pageData) {
      listData.value = pageData.list || [];
      applyPagination(pageData);
    }
  } catch (error) {
    console.error('获取审批列表失败', error);
  } finally {
    loading.value = false;
  }

  // 刷新徽章数量
  approvalBadgeStore.fetchBadgeCounts();
};

// 列表没有任何数据时，页面的文字提示
const emptyTexts = {
  [ApprovalCenterTab.PENDING_APPROVAL]: '暂无待办审批',
  [ApprovalCenterTab.APPROVED_BY_ME]: '暂无已办审批',
  [ApprovalCenterTab.MY_INITIATION]: '暂无我发起的审批',
  [ApprovalCenterTab.CC_TO_ME]: '暂无抄送给我的任务'
};

// 监听标签切换，如果切换到相应标签则加载数据
watch(activeTab, (newVal) => {
  // 重置分页并重新请求数据，避免旧页码影响新标签
  resetPagination();
  fetchList();
});

// 切换页码
const handlePageChange = (page) => {
  // 更新当前页码后立刻刷新数据列表
  pagination.value = { ...pagination.value, page };
  fetchList();
};

// 查询操作(来自筛选组件)，对齐数据管理页面的用法
const handleSearch = (params) => {
  // 将完整的查询参数对象存入本地，在构建接口参数时统一展开
  filters.value = params || {};
  resetPagination();
  fetchList();
};

// 抄送列表全部标记为已读
const handleMarkAllRead = async () => {
  if (activeTab.value !== ApprovalCenterTab.CC_TO_ME) {
    return
  }

  try {
    await approvalCenterApi.markCcReadAll()
    await fetchList()
    ElMessage.success('已全部标记为已读')
  } catch (error) {
    console.error('全部标记为已读失败', error)
    ElMessage.error('全部标记为已读失败')
  }
}

// 标记抄送任务为已读
const markCcTaskAsRead = async (item) => {
  if (activeTab.value === ApprovalCenterTab.CC_TO_ME && item?.ccRecordId && item?.unread) {
    try {
      await approvalCenterApi.markCcRead(item.ccRecordId)
      item.unread = false
    } catch (error) {
      console.error('标记抄送已读失败', error)
    }

    // 刷新徽章数量
    approvalBadgeStore.fetchBadgeCounts()
  }
};

// 显示任务详情
const viewDetail = async (item) => {
  detailFormInstanceId.value = item.formInstanceId || '';
  detailTaskId.value = item.taskId || '';
  detailTabType.value = activeTab.value || '';
  showTaskDetail.value = true;
  // 标记抄送任务为已读
  markCcTaskAsRead(item);
};

// 是否显示未读红点
const shouldShowUnread = (item) => {
  return activeTab.value === ApprovalCenterTab.CC_TO_ME && !!item?.unread
}

// 处理任务详情刷新事件
const handleTaskDetailRefresh = () => {
  // 根据当前标签页重新加载列表数据
  fetchList();
};

// 页面加载时，根据当前标签加载对应数据
onMounted(() => {
  // 加载列表数据
  fetchList();
});
</script>

<style scoped>
.approval-center {
  padding: 0;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.approval-content {
  flex: 1;
  overflow-y: auto;
  font-size: 14px;
  padding: 20px;
}

.page-header {
  height: 60px;
  padding: 0 20px;
  background-color: #ffffff;
  border-bottom: var(--x-border-base);
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-shrink: 0;
}

.header-left {
  display: flex;
  align-items: center;
  height: 100%;
}

.page-title {
  font-size: 18px;
  font-weight: 500;
  color: #262626;
  margin-right: 24px;
}

.header-divider {
  width: 1px;
  height: 16px;
  background-color: #e0e0e0;
  margin-right: 24px;
}

.tabs {
  display: flex;
  height: 100%;
}

.tab {
  padding: 0 16px;
  cursor: pointer;
  position: relative;
  display: flex;
  align-items: center;
  height: 100%;
  color: #595959;
  transition: all 0.3s;
}

.tab:hover {
  color: #262626;
}

.tab.active {
  color: #1890ff;
}

.tab.active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 2px;
  background-color: #1890ff;
}

.approval-list {
  margin-top: 20px;
  border: var(--x-border-base);
  border-radius: 4px;
  overflow: hidden;
}

.list-header {
  display: flex;
  padding: 12px 15px;
  background-color: var(--x-bg-color-page);
  font-weight: bold;
  color: #606266;
}

.list-item {
  display: flex;
  align-items: baseline;
  padding: 15px;
  border-top: var(--x-border-base);
  transition: background 0.2s;
}

.list-item:hover {
  background-color: #f0f6ff;
  cursor: pointer;
}

.col {
  overflow: hidden;
  text-overflow: ellipsis;
  text-align: left;
}

.list-item .col.initiator {
  display: flex;
  justify-content: flex-start;
}

.list-item .col.summary {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.col.title {
  flex: 1.5;
}

.col.summary {
  flex: 1.8;
}

.unread-dot {
  display: inline-block;
  width: 8px;
  height: 8px;
  margin-right: 6px;
  border-radius: 50%;
  background-color: #ff4d4f;
  transform: translateY(-2px);
}

.col.initiator {
  flex: 1;
}

.col.start-time {
  flex: 1;
}

.col.finish-time {
  flex: 1;
}

.col.process-status {
  flex: 1;
}

.col.applicant {
  flex: 1;
}

.col.date {
  flex: 1;
}

.col.status {
  flex: 1;
}

.col.action {
  flex: 1;
  text-align: center;
}

.status-1 {
  color: #409eff;
}

.status-2 {
  color: #67c23a;
}

.status-3 {
  color: #909399;
}

.status-4 {
  color: #f56c6c;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .col {
    font-size: 12px;
    padding: 0 5px;
  }

  .col.title {
    flex: 3;
  }

  .col.summary {
    display: none;
  }

  .col.initiator {
    flex: 1;
  }

  .col.start-time {
    flex: 2;
  }

  .col.finish-time {
    display: none;
  }

  .col.process-status {
    flex: 2;
  }
}

@media (max-width: 480px) {

  .list-header,
  .list-item {
    padding: 10px 8px;
  }

  .col.title {
    flex: 2;
  }

  .col.initiator {
    display: none;
  }

  .col.start-time {
    flex: 1;
  }
}

.empty-list {
  padding: 30px;
  text-align: center;
  color: #999;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 15px;
  border-top: var(--x-border-base);
}

.pagination-btn {
  padding: 5px 12px;
  margin: 0 5px;
  background-color: #f5f5f5;
  border: var(--x-border-base);
  border-radius: 4px;
  cursor: pointer;
}

.pagination-btn:disabled {
  color: #d9d9d9;
  cursor: not-allowed;
}

.page-info {
  margin: 0 10px;
  color: #666;
}
</style>