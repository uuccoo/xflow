<template>
  <div class="home-container">
    <!-- 左侧菜单 -->
    <div class="sidebar">
      <div class="menu-title">xflow 工作流</div>

      <!-- 常规菜单项 -->
      <ul class="menu-list regular-menu">
        <li v-for="(item, index) in menuItems" :key="index" :class="{ active: activeMenu === item.route }"
          @click="navigateTo(item.route)">
          <el-icon class="menu-icon" :size="18">
            <component :is="item.icon" />
          </el-icon>
          <el-badge
            :value="getMenuBadgeValue(item.route)"
            :is-dot="menuBadgeIsDot()"
            :offset="[8, 0]"
            :max="99"
            :show-zero="false">
            <span>{{ item.name }}</span>
          </el-badge>
        </li>
      </ul>

      <!-- 管理相关菜单项 -->
      <ul class="menu-list admin-menu">
        <li v-for="(item, index) in adminMenuItems" :key="index" :class="{ active: activeMenu === item.route }"
          @click="navigateTo(item.route)">
          <el-icon class="menu-icon" :size="18">
            <component :is="item.icon" />
          </el-icon>
          <span>{{ item.name }}</span>
        </li>
      </ul>

      <!-- 弹性空间，将底部内容推到底部 -->
      <div class="flex-spacer"></div>

      <!-- 项目信息区域 -->
      <ProjectInfo />

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
import { EditPen, Stamp, Tickets } from '@element-plus/icons-vue';
import UserInfoPanel from '@/components/common/UserInfoPanel.vue';
import ProjectInfo from '@/components/common/ProjectInfo.vue';
import { useApprovalBadgeStore } from '@/stores/approvalBadgeStore';

const router = useRouter();
const route = useRoute();
const activeMenu = ref('');

// 审批徽章 store
const approvalBadgeStore = useApprovalBadgeStore();

const menuItems = [
  { name: '发起审批', route: '/home/initiate', icon: EditPen },
  { name: '审批中心', route: '/home/approvals', icon: Stamp },
];

// 管理相关的菜单项
const adminMenuItems = [
  { name: '表单管理', route: '/home/manage-forms', icon: Tickets }
];

// 获取菜单徽章值
const getMenuBadgeValue = (routePath) => {
  if (routePath === '/home/approvals') {
    return approvalBadgeStore.pendingApprovalCount;
  }
  return 0;
};

// 判断菜单徽章是否显示为小圆点
// 当待我审批为0且抄送我的不为0时，显示小圆点
const menuBadgeIsDot = () => {
  return approvalBadgeStore.pendingApprovalCount === 0 && approvalBadgeStore.ccToMeCount > 0;
};

onMounted(() => {
  // 根据当前路由设置活动菜单项
  const currentPath = route.path;
  // 检查普通菜单和管理菜单
  const allMenuItems = [...menuItems, ...adminMenuItems];
  activeMenu.value = allMenuItems.find(item => currentPath.startsWith(item.route))?.route || menuItems[0].route;

  // 加载徽章数量
  approvalBadgeStore.fetchBadgeCounts();
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
  background-color: var(--x-bg-color-page);
  border-right: var(--x-border-base);
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: visible; /* 允许内容溢出以显示右侧菜单 */
  /* 确保侧边栏占据整个高度 */
}

.menu-title {
  font-size: 18px;
  font-weight: bold;
  padding: 0 20px;
  height: 60px;
  display: flex;
  align-items: center;
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
  height: 48px;
  padding: 0 20px;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  gap: 8px;
}

.menu-list li .menu-icon {
  flex-shrink: 0;
}

.menu-list li:hover {
  background-color: #ececec;
}

.menu-list li.active {
  background-color: #dceeff;
  color: #1890ff;
  border-right: 3px solid #1890ff;
}

.content {
  flex: 1;
  background-color: var(--x-bg-color);
  overflow-y: auto;
}

/* 为常规菜单添加一个类 */
.regular-menu {
  overflow-y: auto;
  /* 如果菜单项太多，允许滚动 */
  max-height: 60vh;
  /* 限制最大高度 */
  margin-top: 20px;
}

/* 自定义Element UI的下拉菜单样式 */
:deep(.el-dropdown-menu__item) {
  display: flex;
  align-items: center;
}
</style>