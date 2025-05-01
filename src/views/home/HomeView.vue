<template>
  <div class="home-container">
    <!-- 左侧菜单 -->
    <div class="sidebar">
      <div class="menu-title">审批系统</div>
      <ul class="menu-list">
        <li 
          v-for="(item, index) in menuItems" 
          :key="index" 
          :class="{ active: activeMenu === item.route }"
          @click="navigateTo(item.route)"
        >
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

onMounted(() => {
  // 根据当前路由设置活动菜单项
  const currentPath = route.path;
  activeMenu.value = menuItems.find(item => currentPath.startsWith(item.route))?.route || menuItems[0].route;
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
}

.menu-title {
  font-size: 18px;
  font-weight: bold;
  padding: 0 20px 20px;
  border-bottom: 1px solid #e0e0e0;
  margin-bottom: 20px;
}

.menu-list {
  list-style: none;
  padding: 0;
  margin: 0;
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
</style>