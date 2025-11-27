<template>
  <div class="home-container">
    <!-- 左侧菜单 -->
    <div class="sidebar">
      <div class="menu-title">审批系统</div>

      <!-- 常规菜单项 -->
      <ul class="menu-list regular-menu">
        <li v-for="(item, index) in menuItems" :key="index" :class="{ active: activeMenu === item.route }"
          @click="navigateTo(item.route)">
          {{ item.name }}
        </li>
      </ul>

      <!-- 管理菜单分隔线 -->
      <el-divider class="custom-divider"></el-divider>

      <!-- 管理相关菜单项 -->
      <ul class="menu-list admin-menu">
        <li v-for="(item, index) in adminMenuItems" :key="index" :class="{ active: activeMenu === item.route }"
          @click="navigateTo(item.route)">
          {{ item.name }}
        </li>
      </ul>

      <!-- 弹性空间，将管理菜单推到底部 -->
      <div class="flex-spacer"></div>

      <!-- 用户信息区域 -->
      <UserInfoPanel />
    </div>

    <!-- 右侧内容区域 -->
    <div class="content">
      <router-view></router-view>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import UserInfoPanel from '@/components/common/UserInfoPanel.vue';

const router = useRouter();
const route = useRoute();
const activeMenu = ref('');

const menuItems = [
  { name: '发起审批', route: '/home/initiate' },
];

// 管理相关的菜单项
const adminMenuItems = [
  { name: '表单管理', route: '/home/manage-forms' }
];

onMounted(() => {
  // 根据当前路由设置活动菜单项
  const currentPath = route.path;
  // 检查普通菜单和管理菜单
  const allMenuItems = [...menuItems, ...adminMenuItems];
  activeMenu.value = allMenuItems.find(item => currentPath.startsWith(item.route))?.route || menuItems[0].route;
});

const navigateTo = (route) => {
  router.push(route);
  activeMenu.value = route;
};
</script>

<style scoped>
.home-container {
  display: flex;
  height: 100vh;
  width: 100%;
}

.sidebar {
  width: 200px;
  background-color: #f5f5f5;
  border-right: 1px solid #e0e0e0;
  padding: 20px 0 0 0; /* 移除底部填充，为用户区域留出空间 */
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: visible; /* 允许内容溢出以显示右侧菜单 */
  /* 确保侧边栏占据整个高度 */
}

.menu-title {
  font-size: 18px;
  font-weight: bold;
  padding: 0 20px 20px;
  border-bottom: 1px solid #e0e0e0;
  margin-bottom: 20px;
  flex-shrink: 0;
  /* 防止标题被压缩 */
}

/* 弹性空间，将管理菜单推到底部 */
.flex-spacer {
  flex-grow: 1;
}

.menu-list {
  list-style: none;
  padding: 0;
  margin: 0;
  flex-shrink: 0;
  /* 防止菜单被压缩 */
}

.menu-list li {
  padding: 12px 20px;
  cursor: pointer;
  transition: all 0.3s;
}

.menu-list li:hover {
  background-color: #e6f7ff;
}

.menu-list li.active {
  background-color: #e6f7ff;
  color: #1890ff;
  border-right: 3px solid #1890ff;
}

.content {
  flex: 1;
  overflow-y: auto;
}

/* 为常规菜单添加一个类 */
.regular-menu {
  overflow-y: auto;
  /* 如果菜单项太多，允许滚动 */
  max-height: 60vh;
  /* 限制最大高度 */
}

/* 用户信息区域样式 */
.user-info-container {
  padding: 10px;
  border-top: 1px solid #e0e0e0;
  margin-top: auto; /* 确保用户信息区域在侧边栏的底部 */
  flex-shrink: 0; /* 防止用户区域被压缩 */
}

/* 自定义Element UI的下拉菜单样式 */
:deep(.el-dropdown-menu__item) {
  display: flex;
  align-items: center;
}
/* 自定义分割线上下间距 */
.custom-divider {
  margin-top: 20px;
  margin-bottom: 20px;
}
</style>