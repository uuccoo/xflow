<template>
  <el-container class="form-design-container">
    <!-- 左侧组件面板 -->
    <el-aside width="280px" class="component-panel">
      <div class="component-header">
        表单组件
      </div>

      <!-- 动态渲染组件类别和内容 -->
      <div class="component-list">
        <div class="component-category" v-for="category in formStore.components" :key="category.category">
          <div class="category-title">{{ category.category }}</div>
          <div class="component-grid">
            <draggable :list="category.items" :group="{ name: 'components', pull: 'clone', put: false }"
              :clone="formStore.cloneComponent" item-key="type" :sort="false" class="drag-area">
              <div class="component-item" v-for="element in category.items" :key="element.type"
                @click="formStore.addComponent(element)">
                <el-icon>
                  <component :is="element.icon" />
                </el-icon>
                <span>{{ element.name }}</span>
              </div>
            </draggable>
          </div>
        </div>
      </div>

    </el-aside>

    <!-- 中间设计区域 -->
    <el-main class="design-area">
      <div class="design-header">
        表单设计
        <div class="view-controls">
          <el-tooltip content="手机视图" placement="top">
            <el-button
              class="view-button"
              :type="viewMode === 'mobile' ? 'primary' : 'default'"
              circle
              :icon="Iphone"
              @click="switchView('mobile')"
            />
          </el-tooltip>
          <el-tooltip content="电脑视图" placement="top">
            <el-button
              class="view-button"
              :type="viewMode === 'pc' ? 'primary' : 'default'"
              circle
              :icon="Monitor"
              @click="switchView('pc')"
            />
          </el-tooltip>
        </div>
      </div>
      <div class="design-canvas">
        <div class="phone-frame" :class="{ 'pc-view': viewMode === 'pc' }">
          <draggable :list="formStore.formItems" group="components" item-key="id" class="form-container"
            @start="dragStart" @end="dragEnd" handle=".drag-handle" :animation="300" ghost-class="ghost-item"
            chosen-class="chosen-item" drag-class="dragging-item">
            <div v-if="formStore.formItems.length === 0" class="empty-tip">
              拖拽左侧组件到此处进行表单设计
            </div>
            <div class="drag-handle form-item-wrapper"
              :class="{ active: formStore.activeItem && formStore.activeItem.id === element.id }"
              v-for="element in formStore.formItems" :key="element.id" @click="formStore.handleSelectComponent(element)">
              <!-- 动态组件渲染 - 不再传递事件处理程序 -->
              <component-renderer :component="element" :showActions="true" :isNested="false"
                :isActive="formStore.activeItem && formStore.activeItem.id === element.id"
                :activeItem="formStore.activeItem" />
            </div>
          </draggable>
        </div>
      </div>
    </el-main>

    <!-- 右侧属性配置面板 -->
    <el-aside width="280px" class="property-panel-container">
      <property-panel :component="formStore.activeItem" />
    </el-aside>
  </el-container>
</template>

<script setup>
import { ref, computed } from 'vue'
import { VueDraggableNext as draggable } from 'vue-draggable-next'
import ComponentRenderer from '@/components/form/ComponentRenderer.vue'
import PropertyPanel from '@/components/form/property/PropertyPanel.vue'
import { Delete, CopyDocument, Iphone, Monitor, ArrowUp, ArrowDown, Plus, Operation } from '@element-plus/icons-vue'
import { useFormDesignStore } from '@/stores/formDesignStore'

// 使用 Pinia store
const formStore = useFormDesignStore()

// 视图模式状态（mobile/pc）
const viewMode = computed(() => formStore.viewMode);

// 切换视图模式
const switchView = (mode) => {
  formStore.setViewMode(mode)
}

// 拖拽开始
const dragStart = () => {
  formStore.activeItem = null
}

// 拖拽结束
const dragEnd = () => { }
</script>

<style scoped lang="scss">
.form-design-container {
  height: 100%;
  overflow: hidden;
}

.component-panel {
  background-color: #ffffff;

  .component-header {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 48px;
    padding: 10px 16px;
    border-bottom: var(--x-border-base);
  }

  .component-list {
    padding: 0 10px;

    .component-category {
      margin-bottom: 15px;

      .category-title {
        margin: 10px 0;
        color: #909399;
      }

      .component-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 10px;

        .drag-area {
          display: contents;
        }

        .component-item {
          display: flex;
          flex-direction: row;
          align-items: center;
          justify-content: flex-start;
          border: var(--x-border-base);
          border-radius: 6px;
          padding: 6px 10px;
          background-color: #fff;
          cursor: pointer;
          transition: all 0.3s;

          &:hover {
            background-color: #f0f5ff;
            border-color: #a0cfff;
          }

          .el-icon {
            font-size: 16px;
            margin-right: 8px;
            color: #409eff;
          }

          span {
            font-size: 13px;
            color: #606266;
          }
        }
      }
    }
  }
}

.design-area {
  display: flex;
  flex-direction: column;
  padding: 0px;
  border-right: var(--x-border-base);
  border-left: var(--x-border-base);

  .design-header {
    position: relative;
    background-color: #fff;
    min-height: 48px;
    padding: 10px 16px;
    display: flex;
    justify-content: center;
    align-items: center;
    border-bottom: var(--x-border-base);

    .view-controls {
      position: absolute;
      right: 20px;
      display: flex;
      align-items: center;

      .view-button {
        width: 32px;
        height: 32px;
        padding: 0;
      }
    }
  }

  .design-canvas {
    flex: 1;
    padding: 20px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    overflow: auto;

    .phone-frame {
      width: 375px;
      height: 667px;
      border: 10px solid #fff;
      border-radius: 20px;
      background-color: #eee;
      box-shadow: 0 8px 12px rgba(0, 0, 0, 0.2);
      position: relative;
      overflow: auto;
      display: flex;
      flex-direction: column;
      padding: 10px;
      color: #333;
      transition: all 0.3s ease;

      // 根据视图模式调整样式
      &.pc-view {
        width: 100%;
        height: 100%;
        max-width: 900px;
        border-radius: 6px;
      }
    }
  }
}

.empty-tip {
  color: #909399;
  font-size: 14px;
  text-align: center;
  margin: auto;
}

// 移除 .property-panel 相关样式，只保留容器样式
.property-panel-container {
  background-color: #ffffff;
}

.form-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 10px 0;
  min-height: 100%;
}

.form-item-wrapper {
  display: flex;
  align-items: center;
  border: var(--x-border-base);
  border-radius: 6px;
  padding: 10px;
  background-color: #fff;
  cursor: pointer;
  transition: all 0.3s;

  &.active {
    border-color: #409eff;
    background-color: #f0faff;
  }
}

.drag-handle {
  cursor: move;
}

.form-item-content {
  flex: 1;
}

.form-item-actions {
  margin-left: 10px;
  display: flex;
  flex-direction: column;
  gap: 5px;
  cursor: pointer;
  color: #909399;

  .el-icon {
    &:first-child:hover {
      color: #409EFF;
    }

    &:last-child:hover {
      color: #F56C6C;
    }
  }
}

.form-item {
  width: 100%;
}

.form-item-label {
  color: #606266;
  margin-bottom: 8px;
  display: flex;
  align-items: center;

  .required {
    color: #f56c6c;
    margin-left: 4px;
  }
}

.form-item-control {
  width: 100%;
}

/* 拖动动画相关样式 */
.ghost-item {
  opacity: 0.5;
  background: linear-gradient(135deg, #c8ebfb 0%, #a0cfff 100%) !important;
  border: 2px dashed #409EFF !important;
  transform: scale(0.98);
  transition: all 0.3s ease;
}

.chosen-item {
  background: linear-gradient(135deg, #f0faff 0%, #d8f0ff 100%) !important;
  border: 2px solid #409EFF !important;
  box-shadow: 0 0 10px rgba(64, 158, 255, 0.3) !important;
  animation: pulse 1.5s infinite;
}

.dragging-item {
  background: #fff !important;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2) !important;
  transform: rotate(3deg) scale(1.03) !important;
  transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) !important;
  z-index: 100 !important;
}

@keyframes pulse {
  0% {
    box-shadow: 0 0 0 0 rgba(64, 158, 255, 0.4);
  }

  70% {
    box-shadow: 0 0 0 10px rgba(64, 158, 255, 0);
  }

  100% {
    box-shadow: 0 0 0 0 rgba(64, 158, 255, 0);
  }
}
</style>