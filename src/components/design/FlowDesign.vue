<template>
  <div class="flow-design-container">
    <div class="flow-canvas">
      <!-- 流程图缩放控制 -->
      <div class="zoom-control">
        <!-- 新增：重置到 100% 的按钮，只在缩放不为100%时显示，且位于放大按钮左边 -->
        <el-button v-if="zoom !== 1" circle @click="resetZoom" class="reset-btn">
          <el-icon>
            <Refresh />
          </el-icon>
        </el-button>
        <el-button circle @click="zoomIn">
          <el-icon>
            <Plus />
          </el-icon>
        </el-button>
        <span class="zoom-text">{{ Math.round(zoom * 100) }}%</span>
        <el-button circle @click="zoomOut">
          <el-icon>
            <Minus />
          </el-icon>
        </el-button>
      </div>

      <!-- 流程图主体 -->
      <div class="flow-chart" :style="zoomStyle">
        <!-- 发起人节点 -->
        <flow-node-renderer :node="{ type: 'initiator' }" :index="-1" />

        <!-- 发起人节点后的添加按钮 - 始终显示 -->
        <node-add-button :position="0" />

        <!-- 动态渲染主流程中的节点 -->
        <template v-for="(node, index) in flowStore.flowData.nodes" :key="node.id">
          <!-- 使用通用节点组件渲染所有节点类型 -->
          <flow-node-renderer :node="node" :index="index" :parentNode="null" />

          <!-- 每个节点后面都有一个添加按钮 -->
          <node-add-button :position="index + 1" />
        </template>

        <!-- 结束节点 -->
        <flow-node-renderer :node="{ type: 'end' }" :index="-2" />
      </div>
    </div>
  </div>
</template>

<script setup>
import {
  Connection,
  Document,
  Edit,
  Money,
  Setting,
  Sort,
  TurnOff,
  User,
  Plus,
  Minus,
  Refresh
} from '@element-plus/icons-vue'
import NodeAddButton from './NodeAddButton.vue'
import FlowNodeRenderer from './flow/FlowNodeRenderer.vue'
import { useFlowDesignStore } from '../../stores/flowDesignStore'
import { ref, computed } from 'vue'

// 使用 Pinia store
const flowStore = useFlowDesignStore()

// 将图标对象注入到 nodeOptions 中
// 注意：Pinia store 中我们保存的是图标名称字符串
// 这里进行转换，将图标组件对象赋值给 nodeOptions
flowStore.nodeOptions.forEach(option => {
  const iconMap = {
    'User': User,
    'Document': Document,
    'Edit': Edit,
    'TurnOff': TurnOff,
    'Setting': Setting,
    'Connection': Connection,
    'Sort': Sort,
    'Money': Money
  }
  option.icon = iconMap[option.icon] || null
})

// 缩放相关逻辑
const zoom = ref(1)
const zoomStyle = computed(() => ({
  transform: `scale(${zoom.value})`,
  transformOrigin: 'center top',
  margin: '0 auto'  // 保证水平居中
}))

const zoomIn = () => {
  zoom.value = Math.min(zoom.value + 0.1, 2)
}

const zoomOut = () => {
  zoom.value = Math.max(zoom.value - 0.1, 0.5)
}

const resetZoom = () => {
  zoom.value = 1
}
</script>

<style scoped lang="scss">
.flow-design-container {
  display: flex;
  height: calc(100vh - 60px);
  overflow: hidden;
}

.flow-canvas {
  flex: 1;
  background-color: #f5f7fa;
  padding: 20px;
  overflow: auto;
  position: relative;
}

.flow-chart {
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-bottom: 50px;
}

/* 流程图缩放控制样式 */
.zoom-control {
  position: fixed;
  top: 80px;
  right: 40px;
  /* 增加与页面右侧的距离 */
  display: flex;
  align-items: center;
  gap: 10px;
  z-index: 100;
  /* 移除了背景色和阴影 */

  .zoom-text {
    font-size: 14px;
    color: #606266;
    min-width: 40px;
    text-align: center;
  }
}

/* Popover 内容样式 */
:deep(.node-popover) {
  .el-popover__title {
    display: none;
  }
}

/* 弹出菜单内容样式 */
.menu-title {
  padding: 12px;
  font-size: 14px;
  font-weight: 500;
  color: #000;
  border-bottom: 1px solid #e4e7ed;
}

.node-options {
  padding: 12px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;

  .node-option-item {
    display: flex;
    align-items: center;
    padding: 8px;
    cursor: pointer;
    transition: all 0.3s;
    border-radius: 4px;

    &:hover {
      background-color: #f5f7fa;
    }

    .option-icon {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      display: flex;
      justify-content: center;
      align-items: center;
      margin-right: 8px;

      .el-icon {
        font-size: 16px;
        color: #fff;
      }
    }

    .option-name {
      font-size: 12px;
      color: #606266;
    }
  }
}

/* 流程结束点 */
.flow-end {
  position: relative;
  padding-top: 15px;

  /* 连接线 */
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 50%;
    height: 15px;
    border-left: 1px dashed #c0c4cc;
  }

  .end-node {
    padding: 10px 20px;
    background-color: #f5f7fa;
    border-radius: 15px;
    font-size: 14px;
    color: #909399;
    border: 1px solid #e4e7ed;
    text-align: center;
  }
}
</style>