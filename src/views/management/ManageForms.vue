<template>
  <div class="manage-forms">
    <div class="page-header">
      <div class="page-title">表单管理</div>
      <div class="action-area">
        <el-input 
          v-model="searchKeyword" 
          placeholder="搜索表单" 
          @input="debounceSearch"
          clearable
          class="search-input"
        />
        <el-button type="primary" @click="goToCreateForm">
          <span class="plus-icon">+</span> 创建表单
        </el-button>
        <el-dropdown trigger="hover" placement="bottom-end" @command="handleSettingsCommand">
          <el-button type="primary">更多</el-button>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="newGroup">
                <el-icon><plus /></el-icon>
                <span>新建分组</span>
              </el-dropdown-item>
              <el-dropdown-item command="sortGroup">
                <el-icon><sort /></el-icon>
                <span>分组排序</span>
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
        <GroupCreator v-model:visible="newGroupDialogVisible" @group-created="handleGroupCreated" :inline="false" />
      </div>
    </div>

    <!-- 批量操作区域 -->
    <div class="batch-actions-bar" v-if="selectedForms.length > 0">
      <span class="selected-count">已选择 {{ selectedForms.length }} 项</span>
      <div class="action-buttons">
        <el-button text type="danger" @click="selectedForms = []">取消</el-button>
        <el-button @click="showBatchMove = true">移动分组</el-button>
        <el-button @click="confirmBatchDisable">批量停用</el-button>
      </div>
    </div>

    <div class="forms-container">
      <!-- 表单组分类列表 -->
      <div v-for="(group, groupIndex) in formGroups" :key="groupIndex" class="form-group">
        <div class="group-header" @click="toggleGroup(group)">
          <span class="group-toggle-icon" :class="{ 'collapsed': group.collapsed }">
            <el-icon>
              <arrow-down />
            </el-icon>
          </span>
          <div class="group-header-left">
            <span class="group-title">{{ group.name }}</span>
            <span class="form-count">({{ group.forms.length }})</span>
          </div>
          <div class="group-actions">
            <!-- 只有当分组id不是'disabled'时才显示设置按钮 -->
            <el-dropdown v-if="group.id !== 'disabled'" trigger="hover" placement="bottom-end" 
              @command="(command) => handleGroupCommand(command, group)">
              <el-button text @click.stop>
                <el-icon>
                  <setting />
                </el-icon>
              </el-button>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="sortForms">
                    <el-icon><sort /></el-icon>
                    <span>表单排序</span>
                  </el-dropdown-item>
                  <el-dropdown-item command="rename" :disabled="group.system === true">
                    <el-icon><edit /></el-icon>
                    <span>重命名</span>
                  </el-dropdown-item>
                  <el-dropdown-item command="delete" :disabled="group.system === true">
                    <el-icon><delete /></el-icon>
                    <span>删除分组</span>
                  </el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>
        </div>

        <div v-if="!group.collapsed && group.forms.length > 0" class="form-list">
          <!-- 列名表头行 -->
          <div class="list-header">
            <span class="col col-checkbox"></span>
            <span class="col col-form">表单</span>
            <span class="col col-initiator">谁可以发起</span>
            <span class="col col-update">最后更新</span>
            <span class="col col-actions">操作</span>
          </div>
          <!-- 表单数据行 -->
          <div v-for="form in group.forms" :key="form.id" class="list-item">
            <span class="col col-checkbox">
              <el-checkbox 
                :model-value="selectedForms.includes(form.id)"
                :disabled="group.id === 'disabled'"
                @change="toggleFormSelection(form.id)"
              />
            </span>
            <span class="col col-form">
              <div class="form-info">
                <div class="form-item-icon" :style="{ backgroundColor: form.iconColor || '#1677ff' }">
                  <el-icon color="#ffffff" size="20">
                    <component :is="getIconComponent(form.icon)" />
                  </el-icon>
                </div>
                <span class="form-name">{{ form.name }}</span>
              </div>
            </span>
            <span class="col col-initiator" :title="formatInitiators(form.initiators)">
              {{ formatInitiators(form.initiators) }}
            </span>
            <span class="col col-update">
              {{ form.updatedByUser?.realName }} 更新于 {{ form.updatedAt }}
            </span>
            <span class="col col-actions">
              <el-button class="action-btn" link type="primary" @click.stop="editForm(form)">编辑</el-button>
              <el-dropdown class="action-dropdown" trigger="hover" placement="bottom-end" 
                @command="(command) => handleFormCommand(command, form, group)">
                <el-button class="action-btn" link type="primary" @click.stop>更多</el-button>
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item command="move" v-if="group.id !== 'disabled'">
                      移动到
                    </el-dropdown-item>
                    <el-dropdown-item command="enable" v-if="form.status === 2">
                      启用
                    </el-dropdown-item>
                    <el-dropdown-item command="disable" v-if="form.status === 1">
                      停用
                    </el-dropdown-item>
                    <el-dropdown-item command="delete" v-if="group.id === 'disabled'">
                      删除
                    </el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </span>
          </div>
        </div>
      </div>

      <!-- 空状态 -->
      <div v-if="formGroups.length === 0" class="empty-state">
        暂无表单数据
      </div>
    </div>

    <!-- 批量移动分组对话框 -->
    <el-dialog
      v-model="showBatchMove"
      title="批量移动分组"
      width="400px"
      align-center
    >
      <el-select v-model="targetGroupId" placeholder="请选择分组">
        <el-option
          v-for="group in formGroups.filter(g => g.id !== 'disabled')"
          :key="group.id"
          :label="group.name"
          :value="group.id"
        />
      </el-select>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showBatchMove = false">取消</el-button>
          <el-button type="primary" @click="batchMoveToGroup">确定</el-button>
        </span>
      </template>
    </el-dialog>

    <el-dialog
      v-model="showSingleMoveDialog"
      :title="`移动「${movingFormName}」到分组`"
      width="400px"
      align-center
      @closed="resetSingleMoveState"
    >
      <el-select v-model="singleMoveTargetGroupId" placeholder="请选择分组">
        <el-option
          v-for="group in formGroups.filter(g => g.id !== 'disabled')"
          :key="group.id"
          :label="group.name"
          :value="group.id"
        />
      </el-select>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showSingleMoveDialog = false">取消</el-button>
          <el-button type="primary" @click="moveFormToGroup">确定</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 重命名分组对话框 -->
    <el-dialog
      v-model="showRenameDialog"
      title="重命名分组"
      width="400px"
      align-center
    >
      <el-input
        v-model="editingGroupName"
        placeholder="请输入分组名称"
        clearable
        @keyup.enter="renameGroup"
      />
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showRenameDialog = false">取消</el-button>
          <el-button type="primary" @click="renameGroup" :loading="groupActionLoading">
            确定
          </el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 分组排序对话框 -->
    <GroupSortDialog 
      v-model:visible="showSortDialog" 
      :groups="formGroups" 
      @save="handleSortSave" 
    />

    <!-- 表单排序对话框 -->
    <FormSortDialog 
      v-model:visible="showFormSortDialog" 
      :forms="currentGroupForms" 
      @save="handleFormSortSave" 
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { updateFormGroup, deleteFormGroup } from '@/api/modules/formGroup';
import formApi from '@/api/modules/form';
import * as ElementPlusIconsVue from '@element-plus/icons-vue';
import { Setting, Plus, Sort,Delete } from '@element-plus/icons-vue';
import GroupCreator from '@/components/common/GroupCreator.vue';
import GroupSortDialog from '@/components/management/GroupSortDialog.vue';
import FormSortDialog from '@/components/management/FormSortDialog.vue';

const router = useRouter();
const formGroups = ref([]);
const selectedForms = ref([]);
const showBatchMove = ref(false);
const targetGroupId = ref('');
const searchKeyword = ref('');
let searchTimer = null;

// 单个表单移动分组相关变量
const showSingleMoveDialog = ref(false);
const singleMoveTargetGroupId = ref('');
const movingFormId = ref(null);
const movingFormName = ref('');

// 新建分组对话框相关
const newGroupDialogVisible = ref(false); // 新建分组对话框可见性

// 重命名分组相关变量
const showRenameDialog = ref(false); // 重命名分组对话框可见性
const editingGroupName = ref(''); // 编辑中的分组名称
const editingGroupId = ref(null); // 当前编辑的分组ID
const groupActionLoading = ref(false); // 分组操作按钮加载状态

// 分组排序对话框相关变量
const showSortDialog = ref(false); // 分组排序对话框可见性

// 表单排序对话框相关变量
const showFormSortDialog = ref(false); // 表单排序对话框可见性
const currentGroupForms = ref([]); // 当前分组的表单列表
const currentSortingGroupId = ref(null); // 当前正在排序的分组ID

// 获取图标组件
const getIconComponent = (iconName) => {
  // 直接返回图标组件，如果不存在则返回Document组件作为默认值
  return ElementPlusIconsVue[iconName] || ElementPlusIconsVue.Document;
};

// 格式化“谁可以发起”显示文案：空列表表示所有人可发起
const formatInitiators = (initiators) => {
  if (!Array.isArray(initiators) || initiators.length === 0) {
    return '全部可见';
  }

  const names = initiators
    .map(actor => {
      if (!actor) {
        return '';
      }

      const name = (actor.name || '').trim();
      if (name) {
        return name;
      }
    })
    .filter(Boolean);

  return names.length > 0 ? names.join('、') : '全部可见';
};

// 获取表单组和表单数据
const fetchFormGroupsWithForms = async (keyword = '') => {
  try {
    const groupList = await formApi.listForManage(keyword);
    if (groupList && Array.isArray(groupList)) {
      formGroups.value = groupList.map(group => ({
        ...group,
        collapsed: false
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

// 启用表单
const enableForm = async (form) => {
  try {
    await formApi.enableForm(form.id);
    ElMessage.success('表单启用成功！');
    fetchFormGroupsWithForms(searchKeyword.value);
  } catch (error) {
    console.error('表单启用失败:', error);
  }
};

// 停用表单
const disableForm = async (form) => {
  // 使用 Element UI 的确认框
  ElMessageBox.confirm('停用的表单会被移动到「已停用」分组中。', '确认停用表单吗？', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      await formApi.disableForm(form.id);
      ElMessage.success('表单已停用！');
      fetchFormGroupsWithForms(searchKeyword.value);
    } catch (error) {
      console.error('停用表单失败:', error);
    }
  }).catch(() => {
    // 用户取消操作，不做任何处理
  });
};

// 确认删除表单
const confirmDeleteForm = (form) => {
  ElMessageBox.confirm(`此操作将永久删除表单"${form.name}"，是否继续？`, '确认删除', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    deleteForm(form.id);
  }).catch(() => {
    // 用户取消操作，不做任何处理
  });
};

// 删除表单
const deleteForm = async (id) => {
  try {
    await formApi.deleteForm(id);
    ElMessage.success('表单删除成功！');
    fetchFormGroupsWithForms(searchKeyword.value);
    selectedForms.value = selectedForms.value.filter(formId => formId !== id);
  } catch (error) {
    console.error('删除表单失败:', error);
  }
};

// 确认批量停用
const confirmBatchDisable = () => {
  if (selectedForms.value.length === 0) return;

  ElMessageBox.confirm(`停用的表单会被移动到「已停用」分组中。`, `确认停用选中的${selectedForms.value.length}个表单吗？`, {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    batchDisableForms();
  }).catch(() => {
    // 用户取消操作，不做任何处理
  });
};

// 批量停用
const batchDisableForms = async () => {
  try {
    await formApi.batchDisableForms(selectedForms.value);
    ElMessage.success('批量停用成功！');
    fetchFormGroupsWithForms(searchKeyword.value); // 刷新列表
    selectedForms.value = []; // 清空选择
  } catch (error) {
    console.error('批量停用失败:', error);
    ElMessage.error('批量停用失败，请稍后重试');
  }
};

// 批量移动分组
const batchMoveToGroup = async () => {
  if (!targetGroupId.value) {
    ElMessage.warning('请选择目标分组');
    return;
  }

  try {
    await formApi.batchUpdateGroup({
      formIds: selectedForms.value,
      groupId: targetGroupId.value
    });
    ElMessage.success('批量移动分组成功！');
    showBatchMove.value = false;
    fetchFormGroupsWithForms(searchKeyword.value);
  } catch (error) {
    console.error('批量移动分组失败:', error);
  }
};

const openMoveFormDialog = (form, group) => {
  movingFormId.value = form.id;
  movingFormName.value = form.name;
  singleMoveTargetGroupId.value = (group?.id && group.id !== 'disabled') ? group.id : '';
  showSingleMoveDialog.value = true;
};

const moveFormToGroup = async () => {
  if (!singleMoveTargetGroupId.value) {
    ElMessage.warning('请选择目标分组');
    return;
  }

  if (!movingFormId.value) {
    return;
  }

  try {
    await formApi.updateFormGroup(movingFormId.value, singleMoveTargetGroupId.value);
    ElMessage.success('表单移动成功！');
    showSingleMoveDialog.value = false;
    fetchFormGroupsWithForms(searchKeyword.value);
  } catch (error) {
    console.error('移动表单失败:', error);
    ElMessage.error('移动表单失败，请稍后重试');
  }
};

const resetSingleMoveState = () => {
  movingFormId.value = null;
  movingFormName.value = '';
  singleMoveTargetGroupId.value = '';
};

// 跳转到创建表单页面
const goToCreateForm = () => {
  router.push('/design');
};

// 处理新分组创建成功的回调
const handleGroupCreated = () => {
  fetchFormGroupsWithForms(searchKeyword.value);
};

// 处理设置下拉菜单命令
const handleSettingsCommand = (command) => {
  if (command === 'newGroup') {
    newGroupDialogVisible.value = true;
  } else if (command === 'sortGroup') {
    showSortDialog.value = true;
  }
};

// 处理分组排序保存
const handleSortSave = () => {
  fetchFormGroupsWithForms(searchKeyword.value);
};

// 处理分组下拉菜单命令
const handleGroupCommand = (command, group) => {
  if (command === 'sortForms') {
    showFormSort(group);
  } else if (command === 'rename') {
    showRenameGroup(group);
  } else if (command === 'delete') {
    confirmDeleteGroup(group);
  }
};

// 处理表单操作下拉菜单命令
const handleFormCommand = (command, form, group) => {
  if (command === 'move') {
    openMoveFormDialog(form, group);
  } else if (command === 'enable') {
    enableForm(form);
  } else if (command === 'disable') {
    disableForm(form);
  } else if (command === 'delete') {
    confirmDeleteForm(form);
  }
};

// 显示表单排序对话框
const showFormSort = (group) => {
  currentSortingGroupId.value = group.id;
  currentGroupForms.value = group.forms || [];
  showFormSortDialog.value = true;
};

// 处理表单排序保存
const handleFormSortSave = () => {
  fetchFormGroupsWithForms(searchKeyword.value);
};

const showRenameGroup = (group) => {
  editingGroupId.value = group.id; // 保存当前编辑的分组ID
  editingGroupName.value = group.name;
  showRenameDialog.value = true;
};

const confirmDeleteGroup = (group) => {
  ElMessageBox.confirm(`删除分组后，该分组内表单将被移动到「其他」分组中。`, '确认删除分组吗？', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    deleteGroup(group.id);
  }).catch(() => {
    // 用户取消操作，不做任何处理
  });
};

// 删除分组
const deleteGroup = async (id) => {
  try {
    await deleteFormGroup(id);
    ElMessage.success('分组删除成功！');
    fetchFormGroupsWithForms(searchKeyword.value); // 刷新列表
  } catch (error) {
    console.error('删除分组失败:', error);
    ElMessage.error('删除分组失败，请稍后重试');
  }
};

// 重命名分组
const renameGroup = async () => {
  if (!editingGroupName.value.trim()) {
    ElMessage.warning('分组名称不能为空');
    return;
  }

  groupActionLoading.value = true;
  try {
    // 传递分组ID和包含名称的数据对象
    await updateFormGroup(editingGroupId.value, {
      name: editingGroupName.value.trim()
    });
    ElMessage.success('分组重命名成功！');
    showRenameDialog.value = false;
    fetchFormGroupsWithForms(searchKeyword.value); // 刷新列表
  } catch (error) {
    console.error('重命名分组失败:', error);
    ElMessage.error('重命名分组失败，请稍后重试');
  } finally {
    groupActionLoading.value = false;
  }
};

onMounted(() => {
  fetchFormGroupsWithForms();
});
</script>

<style scoped>
.manage-forms {
  padding: 0;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.page-header {
  height: 60px;
  padding: 0 20px;
  background-color: #ffffff;
  border-bottom: 1px solid #f0f0f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-shrink: 0;
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

.search-input {
  width: 240px;
}

.plus-icon {
  font-size: 16px;
  margin-right: 4px;
  font-weight: bold;
}

/* 批量操作栏 */
.batch-actions-bar {
  background-color: #f5f5f5;
  padding: 10px 20px;
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
}

/* 表单容器 */
.forms-container {
  flex: 1;
  overflow-y: auto;
}

/* 表单组 */
.form-group {
  margin: 16px 20px;
  border: 1px solid #e8e8e8;
  border-radius: 8px;
  background-color: #ffffff;
  overflow: hidden;
}

.group-header {
  padding: 12px 16px;
  display: flex;
  align-items: center;
  cursor: pointer;
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

.group-toggle-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 8px;
}

.group-toggle-icon svg {
  transition: transform 0.2s ease;
}

.group-toggle-icon.collapsed svg {
  transform: rotate(-90deg);
}

.group-actions {
  margin-left: auto;
}

/* 列名表头行 */
.list-header {
  display: flex;
  padding: 12px 15px;
  border-top: 1px solid #e0e0e0;
  background-color: #f5f5f5;
  font-weight: bold;
  font-size: 14px;
  color: #606266;
}

/* 数据行 */
.list-item {
  display: flex;
  padding: 15px;
  border-top: 1px solid #e0e0e0;
  transition: background 0.2s;
  font-size: 14px;
  align-items: center;
}

.list-item:hover {
  background-color: #f0f6ff;
}

/* 列样式 */
.col {
  overflow: hidden;
  text-overflow: ellipsis;
  text-align: left;
}

.col-checkbox {
  width: 40px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.col-form {
  flex: 1.5;
  min-width: 200px;
}

.col-initiator {
  flex: 1.5;
  min-width: 100px;
  white-space: nowrap;
}

.col-update {
  flex: 2.5;
  min-width: 200px;
}

.col-actions {
  flex: 1;
  min-width: 150px;
  max-width: 200px;
}

/* 表单信息区域 */
.form-info {
  display: flex;
  align-items: center;
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

/* 操作按钮和下拉菜单样式 */
.action-btn {
  padding: 0;
  vertical-align: middle;
  margin-right: 16px;
  cursor: pointer;
}

.action-dropdown {
  vertical-align: middle;
  cursor: pointer;
}

.empty-state {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 60px;
  color: #bfbfbf;
  font-size: 16px;
}

/* Element UI 对话框页脚样式 */
.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 6px;
}
</style>