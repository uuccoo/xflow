<template>
  <!-- 分栏容器组件 -->
  <div v-if="component.type === 'columns'" class="form-item column-container">
    <div class="form-item-control columns-grid">
      <div class="column-item" v-for="(column, index) in component.columns" :key="index"
        :style="{ flexBasis: `${column.width}%`, maxWidth: `${column.width}%` }">
        <draggable :list="column.children" group="components" item-key="id" class="column-drop-area"
          handle=".drag-handle">
          <div v-if="column.children.length === 0" class="empty-column-tip">
            拖拽组件到此处
          </div>
          <div class="drag-handle form-item-wrapper nested-item" v-for="(element, idx) in column.children"
            :key="element.id" @click.stop="$emit('selectNestedItem', element, component, column, index, idx)">
            <div class="form-item-content">
              <component-renderer :component="element" @selectNestedItem="$emit('selectNestedItem', ...arguments)" />
            </div>
            <div class="form-item-actions">
              <el-icon @click.stop="$emit('deleteNestedItem', component, column, index, idx)">
                <Delete />
              </el-icon>
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
</template>

<script setup>
import { h, defineAsyncComponent } from 'vue';
import {
  ElInput,
  ElRadioGroup,
  ElRadio,
  ElCheckboxGroup,
  ElCheckbox,
  ElDatePicker,
  ElUpload,
  ElButton,
  ElIcon
} from 'element-plus';
import { Plus } from '@element-plus/icons-vue';
import { VueDraggableNext as draggable } from 'vue-draggable-next';
import { Delete } from '@element-plus/icons-vue';

// 自引用组件（递归组件）
const ComponentRenderer = defineAsyncComponent(() => import('./ComponentRenderer.vue'));

const props = defineProps({
  component: {
    type: Object,
    required: true
  }
});

// 定义事件
defineEmits(['selectNestedItem', 'deleteNestedItem']);

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
    case 'radio':
      return h(ElRadioGroup, { modelValue: props.component.defaultValue, disabled: true },
        props.component.options.map(option =>
          h(ElRadio, { label: option.value, disabled: true }, { default: () => option.label })
        )
      );
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
        action: '#',
        disabled: true,
        listType: 'picture-card',
        autoUpload: false,
        accept: 'image/*'
      }, {
        default: () => h(ElIcon, {}, { default: () => h(Plus) })
      });
    default:
      return h('div', {}, '未知组件类型');
  }
};
</script>

<style scoped>
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
}

.form-item-label .required {
  color: #f56c6c;
  margin-left: 4px;
}

.form-item-control {
  width: 100%;
}

/* 分栏容器样式 */
.column-container {
  border: 1px dashed #a0cfff;
  padding: 8px;
  background-color: rgba(236, 245, 255, 0.4);
  border-radius: 4px;
}

.columns-grid {
  display: flex;
  gap: 10px;
  min-height: 100px;
}

.column-item {
  flex: 1;
  border: 1px dashed #c0c4cc;
  border-radius: 4px;
  padding: 5px;
  background-color: rgba(245, 245, 245, 0.5);
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

.nested-item {
  margin-bottom: 0;
}
</style>