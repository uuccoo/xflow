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

      <!-- 弹性空间，将管理菜单推到底部 -->
      <div class="flex-spacer"></div>

      <!-- 管理菜单分隔线 -->
      <div class="menu-divider">
        <span>管理功能</span>
      </div>

      <!-- 管理相关菜单项 -->
      <ul class="menu-list admin-menu">
        <li v-for="(item, index) in adminMenuItems" :key="index" :class="{ active: activeMenu === item.route }"
          @click="navigateTo(item.route)">
          {{ item.name }}
        </li>
      </ul>
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

const router = useRouter();
const route = useRoute();
const activeMenu = ref('');

const menuItems = [
  { name: '发起审批', route: '/home/initiate' },
  { name: '审批中心', route: '/home/approvals' }
];

// 管理相关的菜单项
const adminMenuItems = [
  { name: '创建新表单', route: '/design/basicSettings' },
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
  padding: 20px 0;
  display: flex;
  flex-direction: column;
  height: 100%;
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
  padding: 20px;
  overflow-y: auto;
}

/* 管理菜单分隔线样式 */
.menu-divider {
  position: relative;
  margin: 8px 0;
  padding: 0 20px;
  color: #8c8c8c;
  font-size: 14px;
  text-align: left;
  flex-shrink: 0;
  /* 防止分隔线被压缩 */
}

.menu-divider:before {
  content: '';
  position: absolute;
  top: 50%;
  left: 20px;
  right: 20px;
  height: 1px;
  background-color: #e0e0e0;
  z-index: 1;
}

.menu-divider span {
  position: relative;
  padding: 0 8px 0 0;
  background: #f5f5f5;
  z-index: 2;
}

/* 管理菜单特殊样式 */
.admin-menu {
  margin-bottom: 20px;
  /* 底部留出一些空间 */
}

.admin-menu li {
  color: #555;
  font-size: 14px;
}

.admin-menu li:hover {
  background-color: #f0f5ff;
}

.admin-menu li.active {
  background-color: #f0f5ff;
  color: #1677ff;
  border-right: 3px solid #1677ff;
}

/* 为常规菜单添加一个类 */
.regular-menu {
  overflow-y: auto;
  /* 如果菜单项太多，允许滚动 */
  max-height: 60vh;
  /* 限制最大高度 */
}
</style>