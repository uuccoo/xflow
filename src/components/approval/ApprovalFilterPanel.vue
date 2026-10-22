<template>
  <!-- 审批中心筛选区域:包含类型、状态与高级筛选入口 -->
  <div class="approval-filter-panel">
    <div class="filter-main-row">
      <div class="search-box">
        <el-input
          v-model="localFilters.keyword"
          placeholder="搜索"
          clearable
          class="search-input"
          @keyup.enter="handleQuickChange"
        >
          <template #prefix>
            <el-icon class="el-input__icon">
              <Search />
            </el-icon>
          </template>
        </el-input>
        <el-button type="primary" @click="handleQuickChange">搜索</el-button>
      </div>

      <el-select
        v-model="localFilters.formId"
        placeholder="表单名称"
        clearable
        filterable
        class="filter-select form-select"
        @change="handleQuickChange"
      >
        <el-option
          v-for="form in formList"
          :key="form.id"
          :label="form.name"
          :value="form.id"
        />
      </el-select>

      <el-select
        v-model="localFilters.status"
        placeholder="审批状态"
        clearable
        class="filter-select"
        @change="handleQuickChange"
      >
        <el-option
          v-for="item in statusOptions"
          :key="item.value"
          :label="item.label"
          :value="item.value"
        />
      </el-select>

      <el-popover
        :visible="advancedVisible"
        placement="bottom-end"
        :width="480"
        hide-after="0"
      >
        <template #reference>
          <el-button icon="Filter" @click="advancedVisible = !advancedVisible">
            高级筛选
          </el-button>
        </template>

        <div class="advanced-content">
          <div class="advanced-row">
            <span class="advanced-label">发起人：</span>
            <el-input
              :model-value="localFilters.initiator?.name || ''"
              placeholder="选择发起人"
              class="advanced-input"
              clearable
              @click="showInitiatorSelector = true"
              @clear="handleInitiatorClear"
            />
          </div>

          <div class="advanced-row time-row">
            <span class="advanced-label">时间范围</span>
          </div>

          <div class="advanced-row time-input-row">
            <span class="time-label">发起时间：</span>
            <el-date-picker
              v-model="localFilters.initiatedRange"
              type="daterange"
              range-separator="→"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              format="YYYY-MM-DD"
              value-format="YYYY-MM-DD"
              class="time-picker"
            />
          </div>

          <div class="advanced-row time-input-row">
            <span class="time-label">完成时间：</span>
            <el-date-picker
              v-model="localFilters.finishedRange"
              type="daterange"
              range-separator="→"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              format="YYYY-MM-DD"
              value-format="YYYY-MM-DD"
              class="time-picker"
            />
          </div>

          <div class="advanced-footer">
            <div class="footer-left">
              <span class="clear-link" @click="handleClearAll">清空搜索条件</span>
            </div>
            <div class="footer-right">
              <el-button @click="advancedVisible = false">取消</el-button>
              <el-button type="primary" @click="handleAdvancedConfirm">确定</el-button>
            </div>
          </div>
        </div>
      </el-popover>
    </div>

    <div v-if="activeTab === ApprovalCenterTab.CC_TO_ME" class="cc-filter-row">
      <el-checkbox v-model="localFilters.onlyUnread" @change="handleQuickChange">仅未读</el-checkbox>
      <el-link type="primary" :underline="false" @click="emit('mark-all-read')">全部标记为已读</el-link>
    </div>

    <!-- 发起人选择对话框 -->
    <PersonSelector
      v-model="showInitiatorSelector"
      :single-mode="true"
      :only-select-users="true"
      :selected-ids="localFilters.initiator ? [localFilters.initiator.id] : []"
      @confirm="handlePersonSelect"
    />
  </div>
</template>

<script setup>
import { onMounted, reactive, ref, watch } from 'vue'
import { Search, Filter } from '@element-plus/icons-vue'
import PersonSelector from '@/components/common/PersonSelector.vue'
import { formApi } from '@/api'
import { ApprovalCenterTab } from '@/enums'

// 父组件可传入当前 Tab，用于后续按 Tab 定制状态选项
const props = defineProps({
  activeTab: {
    type: String,
    required: true,
  },
})

// 向父组件输出查询参数，保持与数据管理组件类似的语义
// search: 传出当前筛选条件，父组件只负责分页与列表加载
const emit = defineEmits(['search', 'mark-all-read'])

// 表单列表
const formList = ref([])

// 本地筛选条件
const localFilters = reactive({
  keyword: '',
  formId: null,
  status: null,
  initiator: null,
  initiatedRange: [],
  finishedRange: [],
  onlyUnread: false,
})

// 高级筛选弹窗与发起人选择
const advancedVisible = ref(false)
const showInitiatorSelector = ref(false)

// 状态选项，与数据管理保持一致
const statusOptions = [
  { label: '进行中', value: 1 },
  { label: '已完成', value: 2 },
  { label: '已取消', value: 3 },
]

// 构建查询参数,供父组件直接使用
const buildQueryParams = () => {
  const params = {}

  if (localFilters.keyword && localFilters.keyword.trim()) {
    params.keyword = localFilters.keyword.trim()
  }
  if (localFilters.formId) {
    params.formId = localFilters.formId
  }
  if (localFilters.status !== null && localFilters.status !== undefined) {
    params.status = localFilters.status
  }
  if (localFilters.initiator) {
    params.initiatorId = localFilters.initiator.id
  }
  if (localFilters.onlyUnread) {
    params.onlyUnread = true
  }

  if (Array.isArray(localFilters.initiatedRange) && localFilters.initiatedRange.length === 2) {
    const [start, end] = localFilters.initiatedRange
    if (start) params.initiatedStartDate = start
    if (end) params.initiatedEndDate = end
  }

  if (Array.isArray(localFilters.finishedRange) && localFilters.finishedRange.length === 2) {
    const [start, end] = localFilters.finishedRange
    if (start) params.finishedStartDate = start
    if (end) params.finishedEndDate = end
  }

  return params
}

// 快速筛选改变时直接触发 search
const handleQuickChange = () => {
  emit('search', buildQueryParams())
}

// 点击高级筛选确定
const handleAdvancedConfirm = () => {
  advancedVisible.value = false
  emit('search', buildQueryParams())
}

// 重置当前组件筛选,不自动关闭高级筛选弹层
const resetLocalFilters = () => {
  localFilters.keyword = ''
  localFilters.formId = null
  localFilters.status = null
  localFilters.initiator = null
  localFilters.initiatedRange = []
  localFilters.finishedRange = []
  localFilters.onlyUnread = false
}

const handleClearAll = () => {
  resetLocalFilters()
  emit('search', buildQueryParams())
}

// 处理发起人清除
const handleInitiatorClear = () => {
  localFilters.initiator = null
}

// 处理发起人选择
const handlePersonSelect = (data) => {
  if (data && data.selectedUsers && data.selectedUsers.length > 0) {
    localFilters.initiator = data.selectedUsers[0]
  }
  showInitiatorSelector.value = false
}

// 加载表单列表
const loadFormList = async () => {
  try {
    const forms = await formApi.getFormList()
    if (forms) {
      formList.value = forms.map(form => ({
        id: form.id,
        name: form.formName,
      }))
    }
  } catch (e) {
    console.error('加载表单列表失败', e)
  }
}

onMounted(() => {
  loadFormList()
})
</script>

<style scoped>
.filter-main-row {
  display: flex;
  align-items: center;
  gap: 12px;
  justify-content: flex-start;
}

.search-box {
  display: flex;
  align-items: center;
  gap: 8px;
}

.search-input {
  width: 200px;
}

.filter-select {
  width: 160px;
}

.cc-filter-row {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 8px;
}

.form-select {
  /* 左侧自动外边距，推送后续筛选控件到右侧 */
  margin-left: auto;
}

.advanced-content {
  padding: 12px 0 0;
}

.advanced-row {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
  padding: 0 4px;
}

.advanced-label {
  width: 110px;
  text-align: left;
  font-size: 14px;
  color: #262626;
  font-weight: 500;
}

.advanced-input {
  flex: 1;
}

.time-row {
  margin-bottom: 12px;
}

.time-row .advanced-label {
  margin-bottom: 0;
}

.time-input-row {
  margin-bottom: 16px;
  padding-left: 4px;
}

.time-label {
  width: 110px;
  text-align: left;
  font-size: 14px;
  color: #595959;
}

.time-picker {
  flex: 1;
}

.clear-link {
  color: #1890ff;
  font-size: 14px;
  cursor: pointer;
  text-decoration: none;
}

.clear-link:hover {
  color: #40a9ff;
}

.advanced-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
  padding: 12px 4px 0;
  border-top: var(--x-border-base);
}

.footer-left {
  flex: 1;
}

.footer-right {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}
</style>
