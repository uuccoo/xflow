<template>
  <div class="initiate-approval">
    <div class="page-header">
      <div class="page-title">发起审批</div>
      <el-input 
        v-model="searchKeyword" 
        placeholder="搜索表单" 
        @input="debounceSearch"
        clearable
        class="search-input"
      />
    </div>

    <div class="approval-groups-container">
      <!-- 表单组分类列表 -->
      <div v-for="(group, groupIndex) in formGroups" :key="groupIndex" class="approval-group">
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
        </div>

        <div v-if="!group.collapsed" class="form-list">
          <div class="form-items">
            <div v-for="(form, formIndex) in group.forms" :key="formIndex" class="form-item"
              @click="startApproval(form)">
              <div class="form-item-icon" :style="{ backgroundColor: form.iconColor || '#1677ff' }">
                <el-icon color="#ffffff" size="20">
                  <component :is="getIconComponent(form.icon)" />
                </el-icon>
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
import formApi from '@/api/modules/form';
import * as ElementPlusIconsVue from '@element-plus/icons-vue';

const router = useRouter();
const formGroups = ref([]);
const searchKeyword = ref('');
let searchTimer = null;

// 获取图标组件
const getIconComponent = (iconName) => {
  // 直接返回图标组件，如果不存在则返回Document组件作为默认值
  return ElementPlusIconsVue[iconName] || ElementPlusIconsVue.Document;
};

// 获取表单组和表单数据
const fetchFormGroupsWithForms = async (keyword = '') => {
  try {
    const groupList = await formApi.listForInitiate(keyword);
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

// 开始审批流程
const startApproval = (form) => {
  // 跳转到审批表单填写页面，传递表单ID、编码和名称
  router.push({
    path: '/approval-form',
    query: {
      id: form.id,
      code: form.code,
      name: form.name
    }
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
  display: flex;
  flex-direction: column;
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

.page-title {
  font-size: 18px;
  font-weight: 500;
  color: #262626;
}

.search-input {
  width: 240px;
}

.approval-groups-container {
  flex: 1;
  overflow-y: auto;
}

.approval-group {
  border-bottom: var(--x-border-base);
}

.group-header {
  padding: 12px 16px;
  display: flex;
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

.form-list {
  background-color: white;
}

.form-items {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 12px;
  padding: 16px;
  border-top: var(--x-border-base);
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
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 6px;
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