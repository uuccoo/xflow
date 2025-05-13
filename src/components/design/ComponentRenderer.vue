<template>
  <!-- 包装器 - 包含组件内容和操作按钮 -->
  <div class="form-item-wrapper-outer">
    <!-- 分栏容器组件 -->
    <div v-if="component.type === 'columns'" class="form-item column-container">
      <div class="form-item-control columns-grid">
        <div class="column-item" v-for="(column, index) in component.columns" :key="index"
          :style="{ flexBasis: `${column.width}%`, maxWidth: `${column.width}%` }">
          <draggable :list="column.children" group="components" item-key="id" class="column-drop-area"
            handle=".drag-handle" :animation="300" ghost-class="ghost-item" chosen-class="chosen-item"
            drag-class="dragging-item">
            <div v-if="column.children.length === 0" class="empty-column-tip">
              拖拽组件到此处
            </div>
            <div class="drag-handle form-item-wrapper nested-item"
              :class="{ active: activeItem && activeItem.id === element.id }" v-for="(element, idx) in column.children"
              :key="element.id" @click.stop="formStore.handleSelectComponent(element)">
              <div class="form-item-content">
                <component-renderer :component="element" :showActions="showActions" :isNested="true"
                  :parentColumn="column" :index="idx" :isActive="activeItem && activeItem.id === element.id"
                  :activeItem="activeItem" />
              </div>
            </div>
          </draggable>
        </div>
      </div>
    </div>
    <!-- 普通表单组件 -->
    <div v-else class="form-item">
      <div class="form-item-label">
        {{ component.title }}
        <span v-if="component.required" class="required">*</span>
      </div>
      <div class="form-item-control">
        <component :is="renderField()" />
      </div>
    </div>

    <!-- 操作按钮区域 - 分栏容器和普通组件共用，只在组件被选中时显示 -->
    <div v-if="showActions && isActive" class="form-item-actions">
      <el-icon @click.stop="formStore.handleCopyComponent(component, index, parentColumn)">
        <CopyDocument />
      </el-icon>
      <el-icon @click.stop="formStore.handleDeleteComponent(component, index, parentColumn)" class="delete-button">
        <Delete class="delete-icon" />
      </el-icon>
    </div>
  </div>
</template>

<script setup>
import { h, defineAsyncComponent } from 'vue';
import { VueDraggableNext as draggable } from 'vue-draggable-next';
import { Plus, Delete, CopyDocument } from '@element-plus/icons-vue';
import { useFormDesignStore } from '../../stores/formDesignStore';

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
  parentColumn: {
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

const renderField = () => {
  switch (props.component.type) {
    case 'input':
      return h(ElInput, {
        placeholder: props.component.placeholder || '请输入' + props.component.title,
        modelValue: props.component.defaultValue,
        disabled: true
      });
    case 'textarea':
      return h(ElInput, {
        type: 'textarea',
        placeholder: props.component.placeholder || '请输入' + props.component.title,
        modelValue: props.component.defaultValue,
        disabled: true
      });
    case 'number':
      return h(ElInputNumber, {
        placeholder: props.component.placeholder || '请输入数字',
        modelValue: props.component.defaultValue,
        disabled: true,
        min: props.component.min,
        max: props.component.max,
        step: props.component.step,
        style: { width: '100%', "max-width": '220px' }
      });
    case 'radio':
      // 根据 asDropdown 属性决定渲染下拉框还是单选框组
      if (props.component.asDropdown) {
        return h(ElSelect, {
          modelValue: props.component.defaultValue,
          placeholder: props.component.placeholder || '请选择' + props.component.title,
          style: { width: '100%' },
          disabled: true
        }, {
          default: () => props.component.options.map(option =>
            h(ElOption, { label: option.label, value: option.value, key: option.value })
          )
        });
      } else {
        return h(ElRadioGroup, { modelValue: props.component.defaultValue, disabled: true },
          props.component.options.map(option =>
            h(ElRadio, { label: option.value, disabled: true }, { default: () => option.label })
          )
        );
      }
    case 'checkbox':
      return h(ElCheckboxGroup, { modelValue: props.component.defaultValue, disabled: true },
        props.component.options.map(option =>
          h(ElCheckbox, { label: option.value, disabled: true }, { default: () => option.label })
        )
      );
    case 'date':
      return h(ElDatePicker, {
        type: 'date',
        placeholder: props.component.placeholder || '请选择日期',
        modelValue: props.component.defaultValue,
        disabled: true
      });
    case 'daterange':
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
    case 'upload':
      return h(ElUpload, {
        action: '#',
        disabled: true,
        autoUpload: false,
        accept: 'image/*'
      }, {
        default: () => h(ElButton, { disabled: true }, { default: () => '点击上传' })
      });
    case 'image':
      return h(ElUpload, {
        class: 'avatar-uploader',
        action: '#',
        disabled: true,
        listType: 'picture-card',
        autoUpload: false,
        accept: 'image/*'
      }, {
        default: () => h(ElIcon, {}, { default: () => h(Plus) })
      });
    case 'text':
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

.columns-grid {
  display: flex;
  gap: 10px;
  min-height: 100px;
}

.column-item {
  flex: 1;
  border: 1px dashed #a0cfff;
  border-radius: 4px;
  padding: 5px;
  background-color: rgba(236, 245, 255, 0.4);
  min-height: 80px;
}

.column-drop-area {
  min-height: 70px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.empty-column-tip {
  color: #909399;
  font-size: 12px;
  text-align: center;
  padding: 10px;
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