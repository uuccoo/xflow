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
          <flow-node-renderer :node="node" :index="index" />

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

/* 节点通用样式 */
.flow-node {
  width: 220px;
  background-color: #fff;
  border-radius: 4px;
  border: 1px solid #e4e7ed;
  margin-bottom: 15px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
  margin-left: auto;
  margin-right: auto;
}

.node-header {
  display: flex;
  align-items: center;
  padding: 8px 12px;
  border-bottom: 1px solid #e4e7ed;
  background-color: #f5f7fa;
  border-radius: 4px 4px 0 0;

  .node-icon {
    margin-right: 5px;
    color: #606266;
  }

  .node-title {
    flex-grow: 1;
    font-size: 14px;
    color: #303133;
    font-weight: 500;
  }

  .node-arrow {
    color: #909399;
  }
}

.node-content {
  padding: 10px 12px;

  .node-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    color: #606266;
    font-size: 14px;

    .chevron-icon {
      color: #c0c4cc;
    }
  }
}

/* 发起人节点样式调整 */
.initiator {
  border-left: 3px solid #409eff;

  .node-header {
    background-color: #ecf5ff;
    padding: 8px 12px;
    display: flex;
    align-items: center;

    .node-icon {
      margin-right: 5px;
      color: #409eff;
      display: flex;
      align-items: center;
    }

    .node-title {
      font-size: 14px;
      color: #303133;
      font-weight: 500;
    }
  }

  .node-content {
    padding: 0;

    .node-item {
      padding: 10px 12px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      color: #606266;
      font-size: 14px;
      cursor: pointer;
      border-top: 1px solid #ebeef5;

      &:hover {
        background-color: #f5f7fa;
      }

      .chevron-icon {
        color: #c0c4cc;
        font-size: 12px;
      }
    }
  }
}

.approver {
  border-left: 3px solid #67c23a;

  .node-header {
    background-color: #f0f9eb;
  }
}

.condition {
  border-left: 3px solid #f56c6c;

  .node-header {
    background-color: #fef0f0;
  }
}

.condition-branch {
  width: 100%;
  margin-bottom: 10px;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
  background-color: white;

  .condition-content {
    padding: 14px 16px;
    display: flex;
    justify-content: center;
    align-items: center;
    color: #909399;
    font-size: 14px;
    cursor: pointer;

    &:hover {
      background-color: #f5f7fa;
    }
  }
}

/* 删除图标样式 */
.node-delete {
  color: #f56c6c;
  cursor: pointer;
  font-size: 16px;
  margin-left: 5px;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.2s ease-in-out, color 0.3s;
}

.flow-node:hover .node-delete {
  opacity: 1;
  pointer-events: auto;
}

.node-delete:hover {
  color: #ff4d4f;
}

/* 添加节点按钮 */
.node-add-btn {
  position: relative;
  margin: 15px 0;
  display: flex;
  justify-content: center;
  z-index: 1;

  &::before {
    content: '';
    position: absolute;
    top: -15px;
    left: 50%;
    height: 15px;
    border-left: 1px dashed #c0c4cc;
    z-index: -1;
  }

  .add-btn {
    background-color: #fff;
    border: 1px dashed #c0c4cc;
    color: #409eff;
    transition: all 0.3s;

    &:hover {
      color: #fff;
      background-color: #409eff;
      border-color: #409eff;
    }
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

/* 分支容器样式 */
.flow-branch-container {
  width: 100%;
  margin-bottom: 15px;
  position: relative;
}

/* 条件分支顶部按钮样式 */
.condition-add-btn {
  display: flex;
  justify-content: center;
  margin: 10px 0 20px;

  .el-button {
    background-color: white;
    font-size: 13px;
    padding: 8px 20px;
    height: auto;
  }
}

/* 分支样式 */
.flow-branch {
  width: 100%;
  display: flex;
  gap: 30px;
  position: relative;
  padding: 30px 0 0;
  margin-bottom: 15px;

  /* 分支上方连接线 */
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 50%;
    height: 15px;
    border-left: 1px dashed #c0c4cc;
    transform: translateX(-50%);
  }

  /* 分支顶部横线 */
  &::after {
    content: '';
    position: absolute;
    top: 15px;
    left: 20%;
    width: 60%;
    border-top: 1px dashed #c0c4cc;
  }

  .branch-item {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    position: relative;

    /* 分支顶部竖线 */
    &::before {
      content: '';
      position: absolute;
      top: -15px;
      left: 50%;
      height: 15px;
      border-left: 1px dashed #c0c4cc;
    }
  }

  .branch-header {
    display: flex;
    align-items: center;
    padding: 4px 12px;
    border-radius: 15px;
    font-size: 13px;
    color: #333;
    margin-bottom: 15px;
    background-color: white;
    border: 1px solid #e4e7ed;
    z-index: 1;

    .priority-tag {
      margin-left: 5px;
      color: #909399;
      font-size: 12px;
      font-weight: normal;
    }
  }
}

/* 条件分支内容样式 */
.condition-content {
  padding: 10px 12px;
  display: flex;
  justify-content: center;
  align-items: center;
  color: #606266;
  font-size: 14px;
  cursor: pointer;
  border-top: 1px solid #ebeef5;

  &:hover {
    background-color: #f5f7fa;
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