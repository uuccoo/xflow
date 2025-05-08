<template>
  <div class="form-renderer">
    <!-- 分栏容器组件 -->
    <div v-if="component.type === 'columns'" class="form-item column-container">
      <div class="form-item-control columns-grid">
        <div class="column-item" v-for="(column, index) in component.columns" :key="index"
          :style="{ flexBasis: `${column.width}%`, maxWidth: `${column.width}%` }">
          <template v-for="(element, idx) in column.children" :key="element.id">
            <div class="form-item-wrapper nested-item">
              <form-renderer :component="element" :form-values="formValues"
                @update:value="(field, value) => $emit('update:value', field, value)" />
            </div>
          </template>
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
        <!-- 根据组件类型渲染不同的表单控件 -->
        <component :is="renderField()" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { Plus } from '@element-plus/icons-vue';
import { computed, defineAsyncComponent, h } from 'vue';

// 自引用组件（递归组件）
const FormRenderer = defineAsyncComponent(() => import('./FormRenderer.vue'));

const props = defineProps({
  component: {
    type: Object,
    required: true
  },
  formValues: {
    type: Object,
    default: () => ({})
  }
});

const emit = defineEmits(['update:value']);

// 获取当前组件的值
const getValue = computed(() => {
  if (props.component.field && props.formValues) {
    return props.formValues[props.component.field];
  }
  return props.component.defaultValue || '';
});

// 处理值变化
const handleValueChange = (value) => {
  if (props.component.field) {
    emit('update:value', props.component.field, value);
  }
};

// 渲染表单控件
const renderField = () => {
  switch (props.component.type) {
    case 'input':
      return h(ElInput, {
        modelValue: getValue.value,
        placeholder: props.component.placeholder || '请输入' + props.component.title,
        'onUpdate:modelValue': handleValueChange
      });

    case 'textarea':
      return h(ElInput, {
        modelValue: getValue.value,
        placeholder: props.component.placeholder || '请输入' + props.component.title,
        'onUpdate:modelValue': handleValueChange,
        type: 'textarea',
        rows: 3
      });

    case 'radio':
      return h(ElRadioGroup,
        {
          modelValue: getValue.value,
          'onUpdate:modelValue': handleValueChange
        },
        () => props.component.options?.map(option =>
          h(ElRadio, { label: option.value }, { default: () => option.label })
        ) || []
      );

    case 'checkbox':
      return h(ElCheckboxGroup,
        {
          modelValue: getValue.value,
          'onUpdate:modelValue': handleValueChange
        },
        () => props.component.options?.map(option =>
          h(ElCheckbox, { label: option.value }, { default: () => option.label })
        ) || []
      );

    case 'select':
      return h(ElSelect,
        {
          modelValue: getValue.value,
          placeholder: props.component.placeholder || '请选择' + props.component.title,
          style: { width: '100%' },
          'onUpdate:modelValue': handleValueChange
        },
        () => props.component.options?.map(option =>
          h(ElOption, { label: option.label, value: option.value })
        ) || []
      );

    case 'date':
      return h(ElDatePicker, {
        type: 'date',
        placeholder: props.component.placeholder || '请选择日期',
        modelValue: getValue.value,
        style: { width: '100%' },
        'onUpdate:modelValue': handleValueChange
      });

    case 'upload':
      return h(ElUpload, {
        action: '#',
        autoUpload: false,
        accept: 'image/*',
        fileList: Array.isArray(getValue.value) ? getValue.value : [],
        'onUpdate:fileList': (files) => handleValueChange(files)
      }, {
        default: () => h(ElButton, {}, { default: () => '点击上传' })
      });

    case 'image':
      return h(ElUpload, {
        action: '#',
        listType: 'picture-card',
        autoUpload: false,
        accept: 'image/*',
        fileList: Array.isArray(getValue.value) ? getValue.value : [],
        'onUpdate:fileList': (files) => handleValueChange(files)
      }, {
        default: () => h(ElIcon, {}, { default: () => h(Plus) })
      });

    default:
      return h('div', {}, '未知组件类型');
  }
};
</script>

<style scoped lang="scss">
.form-renderer {
  width: 100%;
}

.form-item {
  width: 100%;
  margin-bottom: 20px;
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

.column-container {
  margin-bottom: 20px;
}

.columns-grid {
  display: flex;
  gap: 16px;
}

.column-item {
  flex: 1;
}

.form-item-wrapper {
  margin-bottom: 20px;
}

.nested-item {
  padding: 0;
}
</style>