<template>
  <div class="flow-design-container">
    <div class="flow-canvas">
      <!-- 流程图主体 -->
      <div class="flow-chart">
        <!-- 发起人节点 -->
        <flow-node-renderer :node="flowStore.flowData.initiator" :index="-1" />

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
  User
} from '@element-plus/icons-vue'
import NodeAddButton from './NodeAddButton.vue'
import FlowNodeRenderer from './flow/FlowNodeRenderer.vue'
import { useFlowDesignStore } from '../../stores/flowDesignStore'

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