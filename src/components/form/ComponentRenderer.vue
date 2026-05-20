<template>
  <!-- 包装器 - 包含组件内容和操作按钮 -->
  <div class="form-item-wrapper-outer">
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
          <template v-for="(element, idx) in component.children" :key="element.id">
            <div class="drag-handle form-item-wrapper nested-item"
              :class="{ active: activeItem && activeItem.id === element.id }"
              @click.stop="formStore.handleSelectComponent(element)">
              <div class="form-item-content">
                <component-renderer :component="element" :showActions="showActions" :isNested="true" :index="idx"
                  :parentComponent="component" :isActive="activeItem && activeItem.id === element.id"
                  :activeItem="activeItem" />
              </div>
            </div>
          </template>
        </draggable>
      </div>
    </div>

    <!-- 普通表单组件 -->
    <div v-else class="form-item">
      <div class="form-item-label">
        {{ component.label }}
        <span v-if="component.required" class="required">*</span>
      </div>
      <div class="form-item-control">
        <component :is="renderField()" />
      </div>
    </div>

    <!-- 操作按钮区域 - 分栏容器和普通组件共用，只在组件被选中时显示 -->
    <div v-if="showActions && isActive" class="form-item-actions">
      <el-icon @click.stop="formStore.handleCopyComponent(component, index, parentComponent)">
        <CopyDocument />
      </el-icon>
      <el-icon @click.stop="formStore.handleDeleteComponent(component, index, parentComponent)" class="delete-button">
        <Delete class="delete-icon" />
      </el-icon>
    </div>
  </div>
</template>

<script setup>
import { h, defineAsyncComponent } from 'vue';
import { VueDraggableNext as draggable } from 'vue-draggable-next';
import { Plus, Delete, CopyDocument } from '@element-plus/icons-vue';
import { useFormDesignStore } from '@/stores/formDesignStore';
import { FormComponentType } from '@/enums';
import PhoneField from './fields/PhoneField.vue'
import IdCardField from './fields/IdCardField.vue'
import ImageField from './fields/ImageField.vue'
import UploadField from './fields/UploadField.vue'
import RadioField from './fields/RadioField.vue'
import CheckboxField from './fields/CheckboxField.vue'

// 获取 formDesignStore
const formStore = useFormDesignStore();

// 自引用组件（递归组件）
const ComponentRenderer = defineAsyncComponent(() => import('./ComponentRenderer.vue'));

const props = defineProps({
  component: {
    type: Object,
    required: true
  },
  showActions: {
    type: Boolean,
    default: true
  },
  isNested: {
    type: Boolean,
    default: false
  },
  index: {
    type: Number,
    default: undefined
  },
  parentComponent: {
    type: Object,
    default: null
  },
  isActive: {
    type: Boolean,
    default: false
  },
  activeItem: {
    type: Object,
    default: null
  }
});

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

// 渲染表单控件
const renderField = () => {
  switch (props.component.type) {
    case FormComponentType.INPUT:
      return h(ElInput, {
        placeholder: props.component.placeholder || '请输入' + props.component.label,
        modelValue: props.component.defaultValue,
        disabled: true
      });
    case FormComponentType.TEXTAREA:
      return h(ElInput, {
        type: 'textarea',
        placeholder: props.component.placeholder || '请输入' + props.component.label,
        modelValue: props.component.defaultValue,
        disabled: true
      });
    case FormComponentType.NUMBER:
      return h(ElInputNumber, {
        placeholder: props.component.placeholder || '请输入数字',
        modelValue: props.component.defaultValue,
        disabled: true,
        min: props.component.min,
        max: props.component.max,
        precision: props.component.precision,
        style: { width: '100%', "max-width": '220px' }
      });
    case FormComponentType.RADIO:
      return h(RadioField, {
        component: props.component,
        modelValue: props.component.defaultValue,
        readonly: true,
      })
    case FormComponentType.IDCARD:
      return h(IdCardField, {
        component: props.component,
        modelValue: props.component.defaultValue || '',
        readonly: true,
      })
    case FormComponentType.PHONE:
      return h(PhoneField, {
        component: props.component,
        modelValue: props.component.defaultValue || {},
        readonly: true,
      })
    case FormComponentType.CHECKBOX:
      return h(CheckboxField, {
        component: props.component,
        modelValue: Array.isArray(props.component.defaultValue) ? props.component.defaultValue : [],
        readonly: true,
      })
    case FormComponentType.DATE:
      return h(ElDatePicker, {
        type: 'date',
        placeholder: props.component.placeholder || '请选择日期',
        modelValue: props.component.defaultValue,
        disabled: true
      });
    case FormComponentType.DATERANGE:
      return h(ElDatePicker, {
        type: 'datetimerange',
        placeholder: props.component.placeholder || '请选择日期时间区间',
        rangeSeparator: props.component.rangeSeparator || '至',
        startPlaceholder: '开始日期',
        endPlaceholder: '结束日期',
        valueFormat: props.component.format || 'YYYY-MM-DD HH:mm:ss',
        modelValue: props.component.defaultValue,
        style: { width: '100%' },
        disabled: true
      });
    case FormComponentType.UPLOAD:
      return h(UploadField, {
        component: props.component,
        modelValue: Array.isArray(props.component.defaultValue) ? props.component.defaultValue : [],
        readonly: true,
      })
    case FormComponentType.IMAGE:
        return h(ImageField, {
          component: props.component,
          modelValue: props.component.defaultValue || [],
          readonly: true,
        })
    case FormComponentType.TEXT:
      return h('div', {
        style: {
          fontSize: props.component.fontSize || '14px',
          color: props.component.color || '#606266',
          padding: '10px',
          backgroundColor: '#f8f8f8',
          borderRadius: '4px',
          border: '1px solid #ebeef5'
        }
      }, props.component.content || '');
    default:
      return h('div', {}, '未知组件类型');
  }
};
</script>

<style scoped lang="scss">
.form-item {
  width: 100%;
}

.form-item-wrapper-outer {
  display: flex;
  align-items: center;
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

/* 分栏容器单栏样式 */
.single-column-container {
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

.preview-column {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.empty-column-tip {
  position: absolute;
  top: calc(50% - 10.4px);
  left: calc(50% - 45.5px);
  color: #909399;
  font-size: 13px;
  pointer-events: none;
}

/* 修改嵌套项样式，添加边框和背景色 */
.nested-item {
  margin-bottom: 0;
  border: 1px solid #dcdfe6;
  border-radius: 6px;
  padding: 10px;
  background-color: #fff;
}

/* 选中样式 - 与主表单区域保持一致 */
.form-item-wrapper.active {
  border-color: #409eff;
  background-color: #f0faff;
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

.text-content {
  padding: 10px;
  background-color: #f8f8f8;
  border-radius: 4px;
  border: 1px solid #ebeef5;
}

::v-deep .avatar-uploader .el-upload {
  width: 50px;
  height: 50px;
}
</style>