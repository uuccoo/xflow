<template>
  <div class="user-info-container">
    <div class="user-info">
      <UserAvatar
        class="sidebar-avatar"
        :user="userStore.user"
        :size="32"
        :show-name="false"
        layout="horizontal"
      />
      <div class="user-name">{{ userStore.displayName }}</div>
      <el-tooltip content="切换用户" placement="top">
        <el-button text type="primary" @click="showUserSelector">切换</el-button>
      </el-tooltip>
    </div>
  </div>
  
  <UserSwitchDialog
    v-model="userSelectorVisible"
    :current-user-id="userStore.user.id"
    @confirm="handleUserSelectConfirm"
  />
</template>

<script setup>
import { ref } from 'vue';
import { ElMessage } from 'element-plus';
import { useRouter } from 'vue-router';
import { useUserStore } from '@/stores/userStore';
import UserAvatar from '@/components/common/UserAvatar.vue';
import UserSwitchDialog from '@/components/common/UserSwitchDialog.vue';

// 使用用户状态
const userStore = useUserStore();
const router = useRouter();

// 用户选择器显示状态
const userSelectorVisible = ref(false);

// 显示用户选择器
const showUserSelector = () => {
  userSelectorVisible.value = true;
};

// 处理用户选择确认
const handleUserSelectConfirm = (data) => {
  if (data.selectedUsers && data.selectedUsers.length > 0) {
    const selectedUser = data.selectedUsers[0];
    
    // 更新 userStore（内部自动持久化）
    userStore.updateUser({
      id: selectedUser.id,
      username: selectedUser.username || selectedUser.name,
      realName: selectedUser.realName || selectedUser.name
    });
    
    ElMessage.success('切换账号成功');
    
    // 刷新当前页面数据
    router.go(0);
  }
};
</script>

<style scoped>
/* 用户信息区域样式 */
.user-info-container {
  border-top: var(--x-border-base);
}

.user-info {
  height: 48px;
  display: flex;
  align-items: center;
  /* 右侧的按钮有15px的内边距 */
  padding: 0 5px 0 20px;
}

.sidebar-avatar {
  margin-right: 8px;
}

.user-name {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 14px;
}


</style>
