<template>
  <div class="manage-forms">
    <div class="search-container">
      <div class="page-title">表单管理</div>
      <div class="action-area">
        <div class="search-box">
          <input type="text" class="search-input" placeholder="搜索表单" v-model="searchKeyword" @input="debounceSearch" />
        </div>
        <button class="btn-create" @click="goToCreateForm">
          <span class="plus-icon">+</span> 创建表单
        </button>
        <button class="btn-create-group" @click="newGroupDialogVisible = true">
          <span class="plus-icon">+</span> 新建分组
        </button>
        <GroupCreator v-model:visible="newGroupDialogVisible" @group-created="handleGroupCreated" :inline="false" />
      </div>
    </div>

    <!-- 批量操作区域 -->
    <div class="batch-actions-bar" v-if="selectedForms.length > 0">
      <span class="selected-count">已选择 {{ selectedForms.length }} 项</span>
      <div class="action-buttons">
        <button class="btn-batch" @click="showBatchMove = true">移动分组</button>
        <button class="btn-batch btn-danger" @click="confirmBatchDelete">批量删除</button>
      </div>
    </div>

    <div class="forms-container">
      <!-- 表单组分类列表 -->
      <div v-for="(group, groupIndex) in formGroups" :key="groupIndex" class="form-group">
        <div class="group-header" @click="toggleGroup(group)">
          <div class="group-header-left">
            <span class="group-title">{{ group.name }}</span>
            <span class="form-count">({{ group.forms.length }})</span>
          </div>
          <div class="group-actions">
            <!-- 只有当分组id不是'disabled'时才显示设置按钮 -->
            <el-popover v-if="group.id !== 'disabled'" placement="bottom-end" :width="100" trigger="click"
              :hide-after="0" popper-class="group-settings-popover" @show="handlePopoverShow" @hide="handlePopoverHide">
              <template #reference>
                <span class="group-settings" @click.stop>
                  <el-icon>
                    <setting />
                  </el-icon>
                </span>
              </template>
              <div class="group-settings-menu">
                <div class="menu-item" @click="showRenameGroup(group)">
                  <el-icon>
                    <edit />
                  </el-icon>
                  <span>重命名</span>
                </div>
                <div class="menu-item" @click="confirmDeleteGroup(group)">
                  <el-icon>
                    <delete />
                  </el-icon>
                  <span>删除分组</span>
                </div>
              </div>
            </el-popover>
            <span class="group-toggle-icon" :class="{ 'collapsed': group.collapsed }">
              <el-icon>
                <arrow-down />
              </el-icon>
            </span>
          </div>
        </div>

        <div v-if="!group.collapsed" class="form-list">
          <div class="form-items">
            <div v-for="form in group.forms" :key="form.id" class="form-item">
              <div class="form-checkbox">
                <input type="checkbox" :checked="selectedForms.includes(form.id)"
                  @click.stop="toggleFormSelection(form.id)" />
              </div>
              <div class="form-content">
                <div class="form-item-icon" :style="{ backgroundColor: form.iconColor || '#1677ff' }">
                  <el-icon color="#ffffff" size="20">
                    <component :is="getIconComponent(form.icon)" />
                  </el-icon>
                </div>
                <div class="form-item-info">
                  <div class="form-item-name">{{ form.name }}</div>
                  <div class="form-item-details">
                    <span class="form-code">{{ form.code }}</span>
                    <span class="form-status" :class="getStatusClass(form.status)">
                      {{ getStatusText(form.status) }}
                    </span>
                    <span class="form-date">创建: {{ formatDate(form.createTime) }}</span>
                    <span class="form-date">更新: {{ formatDate(form.updatedAt) }}</span>
                  </div>
                </div>
                <div class="form-item-actions">
                  <button class="btn-action btn-edit" @click.stop="editForm(form)">编辑</button>
                  <button class="btn-action btn-publish" @click.stop="publishForm(form)"
                    v-if="form.status === 2">启用</button>
                  <button class="btn-action btn-disable" @click.stop="disableForm(form)"
                    v-if="form.status === 1">停用</button>
                  <!-- 只有在已停用表单组中才显示删除按钮 -->
                  <button class="btn-action btn-delete" @click.stop="confirmDeleteForm(form)"
                    v-if="group.id === 'disabled'">删除</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 空状态 -->
      <div v-if="formGroups.length === 0" class="empty-state">
        暂无表单数据
      </div>
    </div>

    <!-- 批量移动分组对话框 -->
    <div class="modal" v-if="showBatchMove">
      <div class="modal-content">
        <div class="modal-header">
          <h3>批量移动分组</h3>
          <span class="close-modal" @click="showBatchMove = false">&times;</span>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label>选择目标分组</label>
            <select v-model="targetGroupId">
              <option value="">请选择分组</option>
              <option v-for="group in formGroups" :key="group.id" :value="group.id">
                {{ group.name }}
              </option>
            </select>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn-cancel" @click="showBatchMove = false">取消</button>
          <button class="btn-confirm" @click="batchMoveToGroup">确定</button>
        </div>
      </div>
    </div>

    <!-- 重命名分组对话框 -->
    <div class="modal" v-if="showRenameDialog">
      <div class="modal-content">
        <div class="modal-header">
          <h3>重命名分组</h3>
          <span class="close-modal" @click="showRenameDialog = false">&times;</span>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label>分组名称</label>
            <input type="text" class="form-input" v-model="editingGroupName" placeholder="请输入分组名称" />
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn-cancel" @click="showRenameDialog = false">取消</button>
          <button class="btn-confirm" @click="renameGroup" :disabled="groupActionLoading">
            {{ groupActionLoading ? '处理中...' : '确定' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { getFormGroupsWithForms, updateFormGroup, deleteFormGroup } from '@/api/modules/formGroup';
import formApi from '@/api/modules/form';
import * as ElementPlusIconsVue from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';
import GroupCreator from '@/components/common/GroupCreator.vue';

const router = useRouter();
const formGroups = ref([]);
const selectedForms = ref([]);
const showBatchMove = ref(false);
const targetGroupId = ref('');
const searchKeyword = ref('');
let searchTimer = null;

// 新建分组对话框相关
const newGroupDialogVisible = ref(false); // 新建分组对话框可见性
const newGroupName = ref(''); // 新建分组名称
const groupNameLoading = ref(false); // 保存按钮加载状态

// 重命名分组相关变量
const showRenameDialog = ref(false); // 重命名分组对话框可见性
const editingGroupName = ref(''); // 编辑中的分组名称
const editingGroupId = ref(null); // 当前编辑的分组ID
const groupActionLoading = ref(false); // 分组操作按钮加载状态

// 获取图标组件
const getIconComponent = (iconName) => {
  // 直接返回图标组件，如果不存在则返回Document组件作为默认值
  return ElementPlusIconsVue[iconName] || ElementPlusIconsVue.Document;
};

// 获取表单组和表单数据
const fetchFormGroupsWithForms = async (keyword = '') => {
  try {
    const response = await getFormGroupsWithForms(keyword);
    if (response && response.data && Array.isArray(response.data)) {
      // 处理API返回的数据
      formGroups.value = response.data.map(group => ({
        ...group,
        collapsed: false // 默认展开所有表单组
      }));
    }
  } catch (error) {
    console.error('获取表单组数据失败:', error);
  }
};

// 防抖搜索
const debounceSearch = () => {
  clearTimeout(searchTimer);
  searchTimer = setTimeout(() => {
    fetchFormGroupsWithForms(searchKeyword.value);
  }, 300);
};

// 日期格式化
const formatDate = (dateStr) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
};

// 获取状态对应的CSS类
const getStatusClass = (status) => {
  switch (status) {
    case 0: return 'status-draft';
    case 1: return 'status-published';
    case 2: return 'status-disabled';
    default: return '';
  }
};

// 获取状态对应的文本
const getStatusText = (status) => {
  switch (status) {
    case 0: return '草稿';
    case 1: return '已发布';
    case 2: return '已停用';
    default: return '未知状态';
  }
};

// 切换表单组的展开/折叠状态
const toggleGroup = (group) => {
  group.collapsed = !group.collapsed;
};

// 切换表单选中状态
const toggleFormSelection = (formId) => {
  const index = selectedForms.value.indexOf(formId);
  if (index === -1) {
    selectedForms.value.push(formId);
  } else {
    selectedForms.value.splice(index, 1);
  }
};

// 编辑表单
const editForm = (form) => {
  router.push({
    path: '/design',
    query: { id: form.id }
  });
};

// 发布表单
const publishForm = async (form) => {
  try {
    await formApi.publishForm(form.id);
    alert('表单发布成功！');
    fetchFormGroupsWithForms(searchKeyword.value); // 刷新列表
  } catch (error) {
    console.error('发布表单失败:', error);
    alert('发布表单失败，请稍后重试');
  }
};

// 停用表单
const disableForm = async (form) => {
  try {
    await formApi.disableForm(form.id);
    alert('表单已停用！');
    fetchFormGroupsWithForms(searchKeyword.value); // 刷新列表
  } catch (error) {
    console.error('停用表单失败:', error);
    alert('停用表单失败，请稍后重试');
  }
};

// 确认删除表单
const confirmDeleteForm = (form) => {
  if (confirm(`确定要删除表单"${form.name}"吗？此操作不可恢复。`)) {
    deleteForm(form.id);
  }
};

// 删除表单
const deleteForm = async (id) => {
  try {
    await formApi.deleteForm(id);
    alert('表单删除成功！');
    fetchFormGroupsWithForms(searchKeyword.value); // 刷新列表
    // 如果删除的是已选中的表单，需要从selectedForms中移除
    selectedForms.value = selectedForms.value.filter(formId => formId !== id);
  } catch (error) {
    console.error('删除表单失败:', error);
    alert('删除表单失败，请稍后重试');
  }
};

// 确认批量删除
const confirmBatchDelete = () => {
  if (selectedForms.value.length === 0) return;

  if (confirm(`确定要删除选中的${selectedForms.value.length}个表单吗？此操作不可恢复。`)) {
    batchDeleteForms();
  }
};

// 批量删除
const batchDeleteForms = async () => {
  try {
    const deletePromises = selectedForms.value.map(id => formApi.deleteForm(id));
    await Promise.all(deletePromises);
    alert('批量删除成功！');
    fetchFormGroupsWithForms(searchKeyword.value); // 刷新列表
    selectedForms.value = []; // 清空选择
  } catch (error) {
    console.error('批量删除失败:', error);
    alert('批量删除失败，请稍后重试');
  }
};

// 批量移动分组
const batchMoveToGroup = async () => {
  if (!targetGroupId.value) {
    alert('请选择目标分组');
    return;
  }

  try {
    await formApi.batchUpdateGroup({
      formIds: selectedForms.value,
      groupId: targetGroupId.value
    });
    alert('批量移动分组成功！');
    showBatchMove.value = false;
    fetchFormGroupsWithForms(searchKeyword.value); // 刷新列表
  } catch (error) {
    console.error('批量移动分组失败:', error);
    alert('批量移动分组失败，请稍后重试');
  }
};

// 跳转到创建表单页面
const goToCreateForm = () => {
  router.push('/design/basicSettings');
};

// 处理新分组创建成功的回调
const handleGroupCreated = () => {
  fetchFormGroupsWithForms(searchKeyword.value);
};

const toggleGroupSettings = (group) => {
  group.showSettings = !group.showSettings;
};

const showRenameGroup = (group) => {
  editingGroupId.value = group.id; // 保存当前编辑的分组ID
  editingGroupName.value = group.name;
  showRenameDialog.value = true;
  group.showSettings = false; // 关闭设置下拉菜单
};

const confirmDeleteGroup = (group) => {
  if (confirm(`确定要删除分组"${group.name}"吗？此操作不可恢复。`)) {
    deleteGroup(group.id);
  }
};

// 删除分组
const deleteGroup = async (id) => {
  try {
    await deleteFormGroup(id);
    alert('分组删除成功！');
    fetchFormGroupsWithForms(searchKeyword.value); // 刷新列表
  } catch (error) {
    console.error('删除分组失败:', error);
    alert('删除分组失败，请稍后重试');
  }
};

// 重命名分组
const renameGroup = async () => {
  if (!editingGroupName.value.trim()) {
    alert('分组名称不能为空');
    return;
  }

  groupActionLoading.value = true;
  try {
    // 传递分组ID和包含名称的数据对象
    await updateFormGroup(editingGroupId.value, {
      name: editingGroupName.value.trim()
    });
    alert('分组重命名成功！');
    showRenameDialog.value = false;
    fetchFormGroupsWithForms(searchKeyword.value); // 刷新列表
  } catch (error) {
    console.error('重命名分组失败:', error);
    alert('重命名分组失败，请稍后重试');
  } finally {
    groupActionLoading.value = false;
  }
};

// 处理弹出框显示
const handlePopoverShow = () => {
  // 可以在这里添加弹出框显示时的逻辑
};

// 处理弹出框隐藏
const handlePopoverHide = () => {
  // 可以在这里添加弹出框隐藏时的逻辑
};

onMounted(() => {
  fetchFormGroupsWithForms();
});
</script>

<style scoped>
.manage-forms {
  padding: 0;
  height: 100%;
}

.search-container {
  padding: 16px;
  background-color: #ffffff;
  border-bottom: 1px solid #f0f0f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-left: 20px;
  padding-right: 20px;
}

.page-title {
  font-size: 18px;
  font-weight: 500;
  color: #262626;
}

.action-area {
  display: flex;
  align-items: center;
  gap: 12px;
}

.search-box {
  position: relative;
  width: 240px;
}

.search-input {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  font-size: 14px;
  outline: none;
}

.search-input:focus {
  border-color: #1677ff;
  box-shadow: 0 0 0 2px rgba(22, 119, 255, 0.1);
}

.search-input::placeholder {
  color: #bfbfbf;
}

.btn-create {
  background-color: #1677ff;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 8px 16px;
  display: flex;
  align-items: center;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.3s;
}

.btn-create:hover {
  background-color: #0958d9;
}

.plus-icon {
  font-size: 16px;
  margin-right: 4px;
  font-weight: bold;
}

.btn-create-group {
  background-color: #52c41a;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 8px 16px;
  display: flex;
  align-items: center;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.3s;
}

.btn-create-group:hover {
  background-color: #389e0d;
}

/* 批量操作栏 */
.batch-actions-bar {
  background-color: #f5f5f5;
  padding: 12px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #e0e0e0;
}

.selected-count {
  font-size: 14px;
  color: #595959;
}

.action-buttons {
  display: flex;
  gap: 12px;
}

.btn-batch {
  border: none;
  border-radius: 4px;
  padding: 6px 12px;
  font-size: 14px;
  cursor: pointer;
  background-color: white;
  color: #595959;
  border: 1px solid #d9d9d9;
  transition: all 0.3s;
}

.btn-batch:hover {
  color: #1677ff;
  border-color: #1677ff;
}

.btn-danger {
  background-color: #ff4d4f;
  color: white;
  border: 1px solid #ff4d4f;
}

.btn-danger:hover {
  background-color: #cf1322;
  border-color: #cf1322;
}

/* 表单容器 */
.forms-container {
  overflow-y: auto;
  height: calc(100vh - 110px);
}

/* 表单组 */
.form-group {
  border-bottom: 1px solid #f0f0f0;
}

.group-header {
  padding: 12px 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  background-color: #fafafa;
}

.group-header-left {
  display: flex;
  align-items: center;
}

.group-title {
  font-size: 14px;
  font-weight: 500;
  color: #262626;
}

.form-count {
  margin-left: 8px;
  font-size: 14px;
  color: #8c8c8c;
}

.group-toggle-icon svg {
  transition: transform 0.2s ease;
}

.group-toggle-icon.collapsed svg {
  transform: rotate(-90deg);
}

.form-list {
  background-color: white;
  padding: 16px;
}

.form-items {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.form-item {
  display: flex;
  align-items: center;
  border: 1px solid #f0f0f0;
  border-radius: 4px;
  transition: all 0.3s;
}

.form-item:hover {
  border-color: #d9d9d9;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.form-checkbox {
  padding: 0 12px;
}

.form-content {
  flex: 1;
  display: flex;
  align-items: center;
  padding: 12px;
}

.form-item-icon {
  margin-right: 12px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 6px;
}

.form-item-info {
  flex: 1;
}

.form-item-name {
  font-size: 14px;
  font-weight: 500;
  color: #262626;
  margin-bottom: 4px;
}

.form-item-details {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 12px;
  color: #8c8c8c;
}

.form-code {
  background-color: #f5f5f5;
  padding: 2px 6px;
  border-radius: 2px;
}

.form-status {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
}

.status-draft {
  background-color: #e6f4ff;
  color: #0958d9;
}

.status-published {
  background-color: #f6ffed;
  color: #389e0d;
}

.status-disabled {
  background-color: #fff2e8;
  color: #d4380d;
}

.form-item-actions {
  display: flex;
  gap: 8px;
  margin-left: 16px;
}

.btn-action {
  border: none;
  border-radius: 4px;
  padding: 4px 8px;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-edit {
  background-color: #e6f4ff;
  color: #0958d9;
}

.btn-edit:hover {
  background-color: #bae0ff;
}

.btn-publish {
  background-color: #f6ffed;
  color: #389e0d;
}

.btn-publish:hover {
  background-color: #d9f7be;
}

.btn-disable {
  background-color: #fff2e8;
  color: #d4380d;
}

.btn-disable:hover {
  background-color: #ffd8bf;
}

.btn-delete {
  background-color: #fff1f0;
  color: #cf1322;
}

.btn-delete:hover {
  background-color: #ffccc7;
}

.empty-state {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 60px;
  color: #bfbfbf;
  font-size: 16px;
}

/* 模态对话框 */
.modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background-color: white;
  border-radius: 4px;
  width: 400px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.modal-header {
  padding: 16px 24px;
  border-bottom: 1px solid #f0f0f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h3 {
  margin: 0;
  font-size: 16px;
  color: #262626;
}

.close-modal {
  cursor: pointer;
  font-size: 18px;
  color: #bfbfbf;
}

.close-modal:hover {
  color: #595959;
}

.modal-body {
  padding: 24px;
}

.modal-footer {
  padding: 16px 24px;
  border-top: 1px solid #f0f0f0;
  text-align: right;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.btn-cancel {
  background-color: white;
  border: 1px solid #d9d9d9;
  color: #595959;
  padding: 6px 16px;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-cancel:hover {
  border-color: #bfbfbf;
  color: #262626;
}

.btn-confirm {
  background-color: #1677ff;
  border: 1px solid #1677ff;
  color: white;
  padding: 6px 16px;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-confirm:hover {
  background-color: #0958d9;
  border-color: #0958d9;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #262626;
}

select {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  font-size: 14px;
  transition: all 0.3s;
}

select:focus {
  border-color: #1677ff;
  box-shadow: 0 0 0 2px rgba(22, 119, 255, 0.1);
  outline: none;
}

.group-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  position: relative;
}

.group-settings {
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.group-settings:hover {
  background-color: rgba(0, 0, 0, 0.06);
}

.form-input {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  font-size: 14px;
  outline: none;
}

.form-input:focus {
  border-color: #1677ff;
  box-shadow: 0 0 0 2px rgba(22, 119, 255, 0.1);
}

.group-settings-menu {
  padding: 4px 0;
}

.menu-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  font-size: 14px;
  color: #606266;
  cursor: pointer;
  transition: background-color 0.3s;
}

.menu-item:hover {
  background-color: #f5f7fa;
}

/* 为El-Popover添加自定义样式 */
:deep(.group-settings-popover) {
  padding: 0;
  min-width: 100px;
}
</style>