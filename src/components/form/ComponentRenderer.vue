<template>
  <!-- 包装器 - 包含组件内容和操作按钮 -->
  <div class="form-item-wrapper drag-handle" :class="{ active: isActive }" @click.stop="formStore.handleSelectComponent(component)">
    <!-- 分栏容器组件 -->
    <div v-if="component.type === FormComponentType.COLUMNS" class="form-item column-container">
      <div class="form-item-label" v-if="component.label">
        {{ component.label }}
      </div>

      <!-- 单一框栏容器 -->
      <div class="form-item-control single-column-container">
        <div v-if="!component.children || component.children.length === 0" class="empty-column-tip">
          拖动组件到此处
        </div>
        <!-- 单一拖拽区域 -->
        <draggable :list="component.children" group="components" item-key="id" class="column-drop-area"
          :style="{ gridTemplateColumns: getGridTemplateColumns(component.layoutValue) }" handle=".drag-handle"
          :animation="300" ghost-class="ghost-item" chosen-class="chosen-item" drag-class="dragging-item">

          <!-- 多列布局渲染区域 - 仅用于显示，不参与拖拽 -->
          <div v-for="element in component.children" :key="element.id">
            <!-- component-renderer 组件外面需要用div包裹 -->
            <component-renderer :component="element" />
          </div>
        </draggable>
      </div>
    </div>

    <!-- 普通表单组件 -->
    <div v-else class="form-item">
      <component
        :is="currentField"
        :component="component"
        :model-value="component.defaultValue"
        readonly
      />
    </div>

    <!-- 操作按钮区域 - 分栏容器和普通组件共用，只在组件被选中时显示 -->
    <div v-if="isActive" class="form-item-actions">
      <el-icon @click.stop="formStore.handleCopyComponent(component.id)">
        <CopyDocument />
      </el-icon>
      <el-icon @click.stop="formStore.handleDeleteComponent(component.id)" class="delete-button">
        <Delete class="delete-icon" />
      </el-icon>
    </div>
  </div>
</template>

<script setup>
import { defineAsyncComponent, computed } from 'vue';
import { VueDraggableNext as draggable } from 'vue-draggable-next';
import { Delete, CopyDocument } from '@element-plus/icons-vue';
import { useFormDesignStore } from '@/stores/formDesignStore';
import { FormComponentType } from '@/enums';
import PhoneField from './fields/PhoneField.vue'
import IdCardField from './fields/IdCardField.vue'
import DateField from './fields/DateField.vue'
import DateRangeField from './fields/DateRangeField.vue'
import ImageField from './fields/ImageField.vue'
import UploadField from './fields/UploadField.vue'
import RadioField from './fields/RadioField.vue'
import CheckboxField from './fields/CheckboxField.vue'
import InputField from './fields/InputField.vue'
import TextareaField from './fields/TextareaField.vue'
import NumberField from './fields/NumberField.vue'
import TextField from './fields/TextField.vue'

// 获取 formDesignStore
const formStore = useFormDesignStore();

// 自引用组件（递归组件）
const ComponentRenderer = defineAsyncComponent(() => import('./ComponentRenderer.vue'));

const props = defineProps({
  component: {
    type: Object,
    required: true
  }
});

// 当前组件是否被选中
const isActive = computed(() => formStore.activeItem?.id === props.component.id)

// 根据布局值计算列数和列宽比例
const getGridTemplateColumns = (layoutValue) => {
  // 如果是手机视图，则每行只显示一个组件
  if (formStore.viewMode === 'mobile') {
    return "1fr";
  }

  if (!layoutValue) return "1fr 1fr"; // 默认两等分

  const parts = layoutValue.split(':').map(Number);
  return parts.map(part => `${part}fr`).join(' ');
};

const fieldComponents = {
  [FormComponentType.INPUT]: InputField,
  [FormComponentType.TEXTAREA]: TextareaField,
  [FormComponentType.NUMBER]: NumberField,
  [FormComponentType.RADIO]: RadioField,
  [FormComponentType.IDCARD]: IdCardField,
  [FormComponentType.PHONE]: PhoneField,
  [FormComponentType.CHECKBOX]: CheckboxField,
  [FormComponentType.DATE]: DateField,
  [FormComponentType.DATERANGE]: DateRangeField,
  [FormComponentType.UPLOAD]: UploadField,
  [FormComponentType.IMAGE]: ImageField,
  [FormComponentType.TEXT]: TextField,
}

const currentField = computed(() => fieldComponents[props.component.type] || TextField)
</script>

<style scoped lang="scss">
.form-item {
  width: 100%;
}

.form-item-wrapper {
  display: flex;
  align-items: center;
  width: 100%;
  border: 1px solid #dcdfe6;
  border-radius: 6px;
  padding: 10px;
  background-color: #fff;
  cursor: move;
  transition: all 0.3s;

  &.active {
    border-color: #409eff;
    background-color: #f0faff;
  }
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
  pointer-events: none;
}

/* 分栏容器单栏样式 */
.single-column-container {
  pointer-events: auto;
  position: relative;
  border: 1px dashed #a0cfff;
  border-radius: 4px;
  padding: 10px;
  background-color: rgba(236, 245, 255, 0.2);
  min-height: 100px;
}

.column-drop-area {
  min-height: 70px;
  display: grid;
  gap: 8px;
  width: 100%;
}

.empty-column-tip {
  position: absolute;
  top: calc(50% - 10.4px);
  left: calc(50% - 45.5px);
  color: #909399;
  font-size: 13px;
  pointer-events: none;
}

.form-item-actions {
  margin-left: 10px;
  display: flex;
  flex-direction: column;
  gap: 12px;

  .el-icon {
    cursor: pointer;
    color: #606266;
    border-radius: 4px;
    transition: all 0.3s;
    font-size: 18px;

    &:hover {
      color: #409EFF;
      background-color: #ecf5ff;
    }

    &:has(.delete-icon) {
      &:hover {
        color: #F56C6C;
        background-color: #fef0f0;
      }
    }
  }
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

::v-deep .avatar-uploader .el-upload {
  width: 50px;
  height: 50px;
}
</style>