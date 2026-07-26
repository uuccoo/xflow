<template>
  <div class="project-info">
    <div class="project-name">xflow 流程审批系统</div>
    <a class="project-link" href="https://xflow.uuccoo.com" target="_blank" rel="noopener">
      <el-icon :size="14"><Link /></el-icon>
      <div class="link-text">
        <span class="link-name">官方网站</span>
        <span class="link-url">xflow.uuccoo.com</span>
      </div>
    </a>
    <a class="project-link" href="https://xflow.uuccoo.com/open-source" target="_blank" rel="noopener">
      <el-icon :size="14"><Document /></el-icon>
      <div class="link-text">
        <span class="link-name">开发指南</span>
        <span class="link-url">xflow.uuccoo.com</span>
      </div>
    </a>
    <a class="project-link" href="https://gitee.com/uuccoo/xflow" target="_blank" rel="noopener">
      <el-icon :size="14"><FolderOpened /></el-icon>
      <div class="link-text">
        <span class="link-name">项目仓库</span>
        <span class="link-url">gitee.com/uuccoo/xflow</span>
      </div>
    </a>
  </div>
</template>

<script setup>
import { Link, Document, FolderOpened } from '@element-plus/icons-vue';
</script>

<style scoped>
.project-info {
  padding: 12px 20px;
  border-top: 1px solid var(--x-border-color-light, #e4e7ed);
  flex-shrink: 0;
}

.project-name {
  font-size: 12px;
  color: #909399;
  margin-bottom: 8px;
  font-weight: 500;
}

.project-link {
  display: flex;
  align-items: flex-start;
  gap: 6px;
  font-size: 12px;
  color: #909399;
  text-decoration: none;
  padding: 6px 0;
  transition: color 0.2s;
}

.project-link .el-icon {
  margin-top: 2px;
}

.link-text {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.link-name {
  font-size: 12px;
  color: #606266;
}

.link-url {
  font-size: 12px;
  color: #b0b3b8;
}

.project-link:hover .link-name {
  color: #1890ff;
}
</style>
