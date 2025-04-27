<template>
  <el-container class="form-design-container">
    <!-- 左侧组件面板 -->
    <el-aside width="280px" class="component-panel">
      <div class="component-header">
        <h3>表单组件</h3>
      </div>

      <!-- 动态渲染组件类别和内容 -->
      <div class="component-list">
        <div class="component-category" v-for="category in formStore.components" :key="category.category">
          <h4>{{ category.category }}</h4>
          <div class="component-grid">
            <draggable :list="category.items" :group="{ name: 'components', pull: 'clone', put: false }"
              :clone="formStore.cloneComponent" item-key="type" :sort="false" class="drag-area">
              <div class="component-item" v-for="element in category.items" :key="element.type"
                @click="formStore.addComponent(element)">
                <el-icon>
                  <component :is="element.icon" />
                </el-icon>
                <span>{{ element.label }}</span>
              </div>
            </draggable>
          </div>
        </div>
      </div>

    </el-aside>

    <!-- 中间设计区域 -->
    <el-main class="design-area">
      <div class="design-header">
        <h3>表单设计</h3>
      </div>
      <div class="design-canvas">
        <div class="phone-frame">
          <draggable :list="formStore.formItems" group="components" item-key="id" class="form-container"
            @start="dragStart" @end="dragEnd" handle=".drag-handle" :animation="300" ghost-class="ghost-item"
            chosen-class="chosen-item" drag-class="dragging-item">
            <div v-if="formStore.formItems.length === 0" class="empty-tip">
              拖拽左侧组件到此处进行表单设计
            </div>
            <div class="drag-handle form-item-wrapper"
              :class="{ active: formStore.activeItem && formStore.activeItem.id === element.id }"
              v-for="(element, index) in formStore.formItems" :key="element.id" @click="formStore.selectItem(element)">
              <!-- 动态组件渲染 - 组件本身已提供复制和删除按钮 -->
              <component-renderer :component="element" :showActions="true" :isNested="false" :parentInfo="{ index }"
                :isActive="formStore.activeItem && formStore.activeItem.id === element.id"
                :activeItem="formStore.activeItem" @selectComponent="handleSelectComponent"
                @copyComponent="handleCopyComponent" @deleteComponent="handleDeleteComponent" />
            </div>
          </draggable>
        </div>
      </div>
    </el-main>

    <!-- 右侧属性配置面板 -->
    <el-aside width="280px" class="property-panel">
      <div class="property-header">
        <h3>属性设置</h3>
      </div>

      <el-form v-if="formStore.activeItem" label-position="top" size="small" class="property-form">
        <!-- 分栏组件属性设置 -->
        <template v-if="formStore.activeItem.type === 'columns'">
          <el-form-item label="栏目布局">
            <el-select v-model="formStore.activeColumnsLayout" @change="formStore.updateColumnsLayout"
              style="width: 100%">
              <el-option label="两等分" value="1:1"></el-option>
              <el-option label="三等分" value="1:1:1"></el-option>
              <el-option label="左窄右宽" value="1:2"></el-option>
              <el-option label="左宽右窄" value="2:1"></el-option>
              <el-option label="左窄中宽右窄" value="1:2:1"></el-option>
            </el-select>
          </el-form-item>
        </template>
        <!-- 普通组件属性设置 -->
        <template v-else>
          <el-form-item label="标题">
            <el-input v-model="formStore.activeItem.title" placeholder="请输入标题"></el-input>
          </el-form-item>
          <el-form-item label="编码">
            <el-input v-model="formStore.activeItem.field" placeholder="请输入字段名"></el-input>
          </el-form-item>
          <el-form-item label="提示文字">
            <el-input v-model="formStore.activeItem.placeholder" placeholder="请输入提示文字"></el-input>
          </el-form-item>
          <el-form-item label="是否必填">
            <el-switch v-model="formStore.activeItem.required"></el-switch>
          </el-form-item>
          <el-form-item label="校验规则">
            <el-select v-model="formStore.activeItem.validator" placeholder="请选择校验规则" style="width: 100%">
              <el-option label="无" value="none"></el-option>
              <el-option label="邮箱" value="email"></el-option>
              <el-option label="手机号" value="phone"></el-option>
              <el-option label="身份证" value="id"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="默认值">
            <el-input v-model="formStore.activeItem.defaultValue" placeholder="请输入默认值"></el-input>
          </el-form-item>
        </template>
      </el-form>
      <div v-else class="empty-tip">
        请选择一个组件进行配置
      </div>
    </el-aside>
  </el-container>
</template>

<script setup>
import { ref } from 'vue'
import { VueDraggableNext as draggable } from 'vue-draggable-next'
import ComponentRenderer from './ComponentRenderer.vue'
import { Delete, CopyDocument } from '@element-plus/icons-vue'
import { useFormDesignStore } from '../../stores/formDesignStore'

// 使用 Pinia store
const formStore = useFormDesignStore()

// 拖拽开始
const dragStart = () => {
  formStore.activeItem = null
}

// 拖拽结束
const dragEnd = () => { }

// 处理组件选择事件
const handleSelectComponent = (component, parentInfo) => {
  if (parentInfo) {
    // 处理嵌套组件的选择
    if (parentInfo.parentColumn && parentInfo.columnIndex !== undefined && parentInfo.itemIndex !== undefined) {
      // 这是分栏内的嵌套组件
      formStore.activeItem = component;
    }
  } else {
    // 处理顶层组件的选择
    formStore.activeItem = component;
  }
}

// 处理组件复制事件
const handleCopyComponent = (component, parentInfo) => {
  if (parentInfo && parentInfo.index !== undefined) {
    formStore.copyItem(parentInfo.index);
  }
};

// 处理组件删除事件
const handleDeleteComponent = (component, parentInfo) => {
  if (parentInfo && parentInfo.index !== undefined) {
    formStore.deleteItem(parentInfo.index);
  }
};
</script>

<style scoped lang="scss">
.form-design-container {
  height: calc(100vh - 60px);
  overflow: hidden;
}

.component-panel {
  background-color: #ffffff;
  border-right: 1px solid #ebeef5;

  .component-header {
    display: flex;
    align-items: center;
    height: 50px;
    border-bottom: 1px solid #ebeef5;

    h3 {
      margin-left: 20px;
      color: #606266;
    }
  }

  .component-list {
    padding: 0 10px;

    .component-category {
      margin-bottom: 15px;

      h4 {
        margin: 10px 0;
        color: #909399;
        font-size: 14px;
        font-weight: normal;
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
          border: 1px solid #dcdfe6;
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
            font-size: 12px;
            color: #606266;
            font-weight: 500;
          }
        }
      }
    }
  }
}

.design-area {
  background-color: #f7f7f7;
  display: flex;
  flex-direction: column;
  padding: 0px;

  .design-header {
    background-color: #fff;
    height: 50px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid #ebeef5;

    h3 {
      margin-left: 20px;
      color: #606266;
    }
  }

  .design-canvas {
    flex: 1;
    padding: 20px;
    background-color: #fafafa;
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
    }
  }
}

.empty-tip {
  color: #909399;
  font-size: 14px;
  text-align: center;
  margin: auto;
}

.property-panel {
  background-color: #ffffff;
  border-left: 1px solid #ebeef5;

  .property-header {
    display: flex;
    align-items: center;
    height: 50px;
    border-bottom: 1px solid #ebeef5;

    h3 {
      margin-left: 15px;
      color: #606266;
    }
  }

  .property-form {
    margin-top: 15px;
    padding: 0 15px;
  }
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
  border: 1px solid #dcdfe6;
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
  font-size: 14px;
  color: #606266;
  margin-bottom: 8px;
  font-weight: 500;
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