<template>
  <div class="initiate-approval">
    <div class="search-container">
      <div class="page-title">发起审批</div>
      <div class="search-box">
        <input type="text" placeholder="搜索表单" class="search-input" v-model="searchKeyword" @input="debounceSearch">
      </div>
    </div>

    <div class="approval-groups-container">
      <!-- 表单组分类列表 -->
      <div v-for="(group, groupIndex) in formGroups" :key="groupIndex" class="approval-group">
        <div class="group-header" @click="toggleGroup(group)">
          <div class="group-header-left">
            <span class="group-title">{{ group.name }}</span>
            <span class="form-count">({{ group.forms.length }})</span>
          </div>
          <span class="group-toggle-icon" :class="{ 'collapsed': group.collapsed }">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
          </span>
        </div>

        <div v-if="!group.collapsed" class="form-list">
          <div class="form-items">
            <div v-for="(form, formIndex) in group.forms" :key="formIndex" class="form-item"
              @click="startApproval(form)">
              <div class="form-item-icon">
                <!-- 根据表单icon字段渲染不同图标 -->
                <svg v-if="form.icon === 'file-text'" xmlns="http://www.w3.org/2000/svg" width="24" height="24"
                  viewBox="0 0 24 24" fill="none" stroke="#1677ff" stroke-width="2" stroke-linecap="round"
                  stroke-linejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                  <polyline points="14 2 14 8 20 8"></polyline>
                  <line x1="16" y1="13" x2="8" y2="13"></line>
                  <line x1="16" y1="17" x2="8" y2="17"></line>
                  <polyline points="10 9 9 9 8 9"></polyline>
                </svg>
                <!-- 默认图标 -->
                <svg v-else xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
                  stroke="#1677ff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                  <polyline points="14 2 14 8 20 8"></polyline>
                  <line x1="16" y1="13" x2="8" y2="13"></line>
                  <line x1="16" y1="17" x2="8" y2="17"></line>
                  <polyline points="10 9 9 9 8 9"></polyline>
                </svg>
              </div>
              <div class="form-item-name">{{ form.name }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { getFormGroupsWithForms } from '@/api/modules/formGroup';

const router = useRouter();
const formGroups = ref([]);
const searchKeyword = ref('');
let searchTimer = null;

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

// 切换表单组的展开/折叠状态
const toggleGroup = (group) => {
  group.collapsed = !group.collapsed;
};

// 开始审批流程
const startApproval = (form) => {
  // 跳转到审批表单填写页面
  router.push({
    path: '/approval-form',
    query: { id: form.id, code: form.code, name: form.name }
  });
};

// 组件挂载时获取数据
onMounted(() => {
  fetchFormGroupsWithForms();
});
</script>

<style scoped>
.initiate-approval {
  padding: 0;
  height: 100%;
}

.search-container {
  padding: 16px;
  background-color: #ffffff;
  border-bottom: 1px solid #f0f0f0;
  display: flex;
  justify-content: space-between;
  /* 将元素分布在两侧 */
  align-items: center;
  padding-left: 20px;
  padding-right: 20px;
}

.page-title {
  font-size: 18px;
  font-weight: 500;
  color: #262626;
}

.search-box {
  position: relative;
  width: 240px;
  /* 调整搜索框宽度 */
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

.approval-groups-container {
  overflow-y: auto;
  height: calc(100vh - 110px);
}

.approval-group {
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
}

.form-items {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 12px;
  padding: 16px;
}

.form-item {
  display: flex;
  flex-direction: row;
  align-items: center;
  /* 保持这个属性，确保垂直居中 */
  justify-content: flex-start;
  /* 确保内容从左开始 */
  padding: 12px;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
  height: 48px;
  /* 固定高度确保一致性 */
}

.form-item:hover {
  background-color: #f5f5f5;
}

.form-item-icon {
  margin-right: 12px;
  flex-shrink: 0;
  display: flex;
  /* 添加flex布局 */
  align-items: center;
  /* 垂直居中图标 */
}

.form-item-name {
  font-size: 14px;
  color: #595959;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  /* 防止文本换行 */
  display: flex;
  /* 添加flex布局 */
  align-items: center;
  /* 垂直居中文字 */
  height: 100%;
  /* 填充整个高度 */
}
</style>