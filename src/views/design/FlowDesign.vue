<template>
  <div class="flow-design-container">
    <div class="flow-canvas">
      <!-- 流程图缩放控制 -->
      <div class="zoom-control">
        <!-- 重置到 100% 的按钮，只在缩放不为100%时显示 -->
        <el-button v-if="flowZoomScale !== 1" circle @click="resetZoom" class="reset-btn">
          <el-icon>
            <Refresh />
          </el-icon>
        </el-button>
        <el-button circle @click="zoomOut">
          <el-icon>
            <Minus />
          </el-icon>
        </el-button>
        <span class="zoom-text">{{ Math.round(flowZoomScale * 100) }}%</span>
        <el-button circle @click="zoomIn">
          <el-icon>
            <Plus />
          </el-icon>
        </el-button>
      </div>

      <!-- 流程图主体 -->
      <div class="flow-chart" :style="zoomStyle">
        <!-- 发起人节点 -->
        <flow-node-renderer :node="{ type: FlowNodeType.INITIATE }" :index="-1" />

        <!-- 动态渲染主流程中的节点 -->
        <template v-for="(node, index) in flowStore.flowData.nodes" :key="node.id">
          <!-- 每个节点前面都有一个添加按钮 -->
          <node-add-button :position="index" />

          <!-- 使用通用节点组件渲染所有节点类型 -->
          <flow-node-renderer :node="node" :index="index" />
        </template>

        <!-- 最后一个节点后的添加按钮（无节点时 position=0） -->
        <node-add-button :position="flowStore.flowData.nodes.length" />

        <!-- 结束节点 -->
        <flow-node-renderer :node="{ type: 'end' }" :index="-2" />
      </div>
    </div>

    <!-- 引入节点设置抽屉组件 -->
    <node-settings-drawer />
  </div>
</template>

<script setup>
import { Connection, Document, Edit, Money, Setting, Sort, TurnOff, User, Plus, Minus, Refresh } from '@element-plus/icons-vue'
import NodeAddButton from '@/components/flow/NodeAddButton.vue'
import FlowNodeRenderer from '@/components/flow/node/FlowNodeRenderer.vue'
import NodeSettingsDrawer from '@/components/flow/NodeSettingsDrawer.vue'
import { useFlowDesignStore } from '@/stores/flowDesignStore'
import { FlowNodeType } from '@/enums'
import { computed, ref } from 'vue'

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

// 计算缩放样式 - 使用CSS的zoom属性而非transform
const zoomStyle = computed(() => ({
  zoom: flowZoomScale.value
}))

// 添加缩放相关的变量和函数
const ZOOM_STEP = 0.1 // 缩放步长
const MIN_ZOOM = 0.5 // 最小缩放比例
const MAX_ZOOM = 2.0 // 最大缩放比例
const DEFAULT_ZOOM = 1.0 // 默认缩放比例

const flowZoomScale = ref(DEFAULT_ZOOM)

const zoomIn = () => {
  flowZoomScale.value = Math.min(flowZoomScale.value + ZOOM_STEP, MAX_ZOOM)
}

const zoomOut = () => {
  flowZoomScale.value = Math.max(flowZoomScale.value - ZOOM_STEP, MIN_ZOOM)
}

const resetZoom = () => {
  flowZoomScale.value = DEFAULT_ZOOM
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
  width: fit-content; // 改为内容自适应宽度
  min-width: 800px; // 设置最小宽度
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 60px;
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
</style>