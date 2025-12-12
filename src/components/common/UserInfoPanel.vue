<template>
  <div class="user-info-container">
    <el-dropdown trigger="click" @command="handleCommand" placement="top">
      <div class="user-info">
        <div class="avatar">{{ userStore.displayName.charAt(0) || 'U' }}</div>
        <div class="user-name">{{ userStore.displayName }}</div>
        <el-icon class="dropdown-icon"><ArrowDown /></el-icon>
      </div>
      
      <template #dropdown>
        <el-dropdown-menu>
          <el-dropdown-item command="switchUser">
            <el-icon><Switch /></el-icon>
            <span>切换账号</span>
          </el-dropdown-item>
        </el-dropdown-menu>
      </template>
    </el-dropdown>
  </div>
  
  <!-- 用户选择器组件 -->
  <PersonSelector
    v-model="userSelectorVisible"
    title="选择登录用户"
    :selectedIds="selectedUserIds"
    :singleMode="true"
    :onlySelectUsers="true"
    @confirm="handleUserSelectConfirm"
  />
</template>

<script setup>
import { ref } from 'vue';
import { Switch, ArrowDown } from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';
import { useRouter } from 'vue-router';
import { useUserStore } from '@/stores/userStore';
import PersonSelector from '@/components/common/PersonSelector.vue';

// 使用用户状态
const userStore = useUserStore();
const router = useRouter();

// 用户选择器显示状态
const userSelectorVisible = ref(false);
const selectedUserIds = ref([]);

// 显示用户选择器
const showUserSelector = () => {
  selectedUserIds.value = userStore.id ? [userStore.id] : [];
  userSelectorVisible.value = true;
};

// 处理下拉菜单命令
const handleCommand = (command) => {
  if (command === 'switchUser') {
    showUserSelector();
  }
};

// 处理用户选择确认
const handleUserSelectConfirm = (data) => {
  if (data.selectedUsers && data.selectedUsers.length > 0) {
    const selectedUser = data.selectedUsers[0];
    
    // 直接更新 Pinia Store
    userStore.updateUser({
      id: selectedUser.id,
      username: selectedUser.username || selectedUser.name,
      realName: selectedUser.realName || selectedUser.name
    });
    
    // 同步更新 localStorage
    localStorage.setItem('userId', selectedUser.id);
    localStorage.setItem('username', selectedUser.username || selectedUser.name || '');
    localStorage.setItem('realName', selectedUser.realName || selectedUser.name || '');
    
    ElMessage.success('切换账号成功');
    
    // 使用路由刷新页面
    router.go(0);
  }
};
</script>

<style scoped>
/* 用户信息区域样式 */
.user-info-container {
  border-top: 1px solid #e0e0e0;
  position: relative;
  /* 确保菜单可以溢出 */
  overflow: visible;
}

.user-info-container :deep(.el-dropdown) {
  display: block;
}

.user-info {
  height: 48px;
  display: flex;
  align-items: center;
  cursor: pointer;
  border-radius: 4px;
  transition: all 0.2s;
  padding: 0 20px;
}

.user-info:hover {
  background-color: #ececec;
}

.avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background-color: #1677ff;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 500;
  margin-right: 8px;
}

.user-name {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 14px;
}

.dropdown-icon {
  font-size: 15px;
  transition: transform 0.3s;
  color: #909399;
  margin-left: 5px;
}

.dropdown-icon.expanded {
  transform: rotate(180deg);
  color: #409EFF;
}

/* 自定义Element UI的下拉菜单样式 */
:deep(.el-dropdown-menu__item) {
  display: flex;
  align-items: center;
}

:deep(.el-dropdown-menu__item .el-icon) {
  margin-right: 8px;
  font-size: 16px;
}
</style>
