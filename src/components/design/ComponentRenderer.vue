<template>
  <div class="form-item">
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
import { h, defineComponent } from 'vue';

const props = defineProps({
  component: {
    type: Object,
    required: true
  }
});

const renderField = () => {
  switch (props.component.type) {
    case 'input':
      return h('el-input', {
        placeholder: '请输入' + props.component.title,
        modelValue: props.component.defaultValue,
        disabled: true
      });
    case 'textarea':
      return h('el-input', {
        type: 'textarea',
        placeholder: '请输入' + props.component.title,
        modelValue: props.component.defaultValue,
        disabled: true
      });
    case 'radio':
      return h('el-radio-group', { modelValue: props.component.defaultValue, disabled: true },
        props.component.options.map(option =>
          h('el-radio', { label: option.value, disabled: true }, { default: () => option.label })
        )
      );
    case 'checkbox':
      return h('el-checkbox-group', { modelValue: props.component.defaultValue, disabled: true },
        props.component.options.map(option =>
          h('el-checkbox', { label: option.value, disabled: true }, { default: () => option.label })
        )
      );
    case 'date':
      return h('el-date-picker', {
        type: 'date',
        placeholder: '请选择日期',
        modelValue: props.component.defaultValue,
        disabled: true
      });
    case 'upload':
      return h('el-upload', {
        action: '#',
        disabled: true,
        autoUpload: false,
        accept: 'image/*'
      }, {
        default: () => h('el-button', { disabled: true }, { default: () => '点击上传' })
      });
    case 'image':
      return h('el-upload', {
        action: '#',
        disabled: true,
        listType: 'picture-card',
        autoUpload: false,
        accept: 'image/*'
      }, {
        default: () => h('el-icon', {}, { default: () => h('Plus') })
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
</style>