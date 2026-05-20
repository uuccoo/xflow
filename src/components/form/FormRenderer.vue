<template>
  <div class="form-renderer">
    <!-- 分栏容器组件 -->
    <div v-if="component.type === FormComponentType.COLUMNS" class="form-item column-container">
      <div class="form-item-control columns-grid"
        :style="{ gridTemplateColumns: getGridTemplateColumns(component.layoutValue) }">
        <!-- 子组件直接放入grid布局中 -->
        <div v-for="element in component.children" :key="element.id" class="form-item-wrapper nested-item">
          <form-renderer :component="element" :form-values="formValues" :validation-errors="validationErrors"
            @update:value="(id, value) => $emit('update:value', id, value)"
            @update:error="(id, error) => $emit('update:error', id, error)" />
        </div>
      </div>
    </div>

    <!-- 普通表单组件 -->
    <div v-else class="form-item">
      <div class="form-item-label">
        {{ component.label }}
        <span v-if="component.required" class="required">*</span>
      </div>
      <div class="form-item-control">
        <!-- 根据组件类型渲染不同的表单控件 -->
        <component :is="renderField()" />
        <div v-if="validationErrors[component.id]" class="validation-error">
          {{ validationErrors[component.id]?.message }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { Plus } from '@element-plus/icons-vue';
import { computed, defineAsyncComponent, h } from 'vue';
import IdCardField from './fields/IdCardField.vue'
import { FormComponentType } from '@/enums';
import PhoneField from './fields/PhoneField.vue'
import ImageField from './fields/ImageField.vue'
import UploadField from './fields/UploadField.vue'
import RadioField from './fields/RadioField.vue'
import CheckboxField from './fields/CheckboxField.vue'

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
  },
  validationErrors: {
    type: Object,
    default: () => ({})
  }
});

const emit = defineEmits(['update:value', 'update:error']);

// 根据布局值计算列数和列宽比例
const getGridTemplateColumns = (layoutValue) => {
  if (!layoutValue) return "1fr 1fr"; // 默认两等分

  const parts = layoutValue.split(':').map(Number);
  return parts.map(part => `${part}fr`).join(' ');
};

// 获取当前组件的值
const getValue = computed(() => {
  let componentId = props.component.id;
  let formValues = props.formValues;

  // 从 formValues 中获取当前组件的值，如果没有则使用组件的默认值
  if (componentId && formValues && formValues.hasOwnProperty(componentId)) {
    return formValues[componentId];
  }
  return props.component.defaultValue || '';
});

// 处理值变化
const handleValueChange = (value) => {
  if (props.component.id) {
    emit('update:value', props.component.id, value);
  }
};

const handleFieldErrorChange = (error) => {
  if (!props.component.id) return
  emit('update:error', props.component.id, error)
};

// 渲染表单控件
const renderField = () => {
  switch (props.component.type) {
    case FormComponentType.INPUT:
      return h(ElInput, {
        modelValue: getValue.value,
        placeholder: props.component.placeholder || '请输入' + props.component.label,
        'onUpdate:modelValue': handleValueChange
      });

    case FormComponentType.TEXTAREA:
      return h(ElInput, {
        modelValue: getValue.value,
        placeholder: props.component.placeholder || '请输入' + props.component.label,
        'onUpdate:modelValue': handleValueChange,
        type: 'textarea',
        rows: 3
      });

    case FormComponentType.RADIO:
      return h(RadioField, {
        component: props.component,
        modelValue: getValue.value,
        'onUpdate:modelValue': handleValueChange,
      })

    case FormComponentType.IDCARD:
      return h(IdCardField, {
        component: props.component,
        modelValue: getValue.value,
        'onUpdate:modelValue': handleValueChange,
        'onUpdate:error': handleFieldErrorChange
      })

    case FormComponentType.PHONE: {
      return h(PhoneField, {
        component: props.component,
        modelValue: getValue.value,
        'onUpdate:modelValue': handleValueChange,
        'onUpdate:error': handleFieldErrorChange,
      })
    }

    case FormComponentType.CHECKBOX:
      return h(CheckboxField, {
        component: props.component,
        modelValue: Array.isArray(getValue.value) ? getValue.value : [],
        'onUpdate:modelValue': handleValueChange,
      })

    case 'select':
      return h(ElSelect,
        {
          modelValue: getValue.value,
          placeholder: props.component.placeholder || '请选择' + props.component.label,
          style: { width: '100%' },
          'onUpdate:modelValue': handleValueChange
        },
        () => props.component.options?.map(option =>
          h(ElOption, { label: option.label, value: option.value })
        ) || []
      );

    case FormComponentType.DATE:
      return h(ElDatePicker, {
        type: 'date',
        placeholder: props.component.placeholder || '请选择日期',
        modelValue: getValue.value,
        style: { width: '100%' },
        'onUpdate:modelValue': handleValueChange
      });

    case FormComponentType.UPLOAD:
      return h(UploadField, {
        component: props.component,
        modelValue: Array.isArray(getValue.value) ? getValue.value : [],
        'onUpdate:modelValue': handleValueChange,
      })

    case FormComponentType.IMAGE:
      return h(ImageField, {
        component: props.component,
        modelValue: Array.isArray(getValue.value) ? getValue.value : [],
        'onUpdate:modelValue': handleValueChange,
      })

    case FormComponentType.NUMBER:
      return h(ElInputNumber, {
        modelValue: getValue.value,
        placeholder: props.component.placeholder || '请输入数字',
        min: props.component.min,
        max: props.component.max,
        precision: props.component.precision,
        style: { width: '100%', "max-width": '220px' },
        'onUpdate:modelValue': handleValueChange
      });

    case FormComponentType.DATERANGE:
      return h(ElDatePicker, {
        type: 'datetimerange',
        placeholder: props.component.placeholder || '请选择日期时间区间',
        rangeSeparator: props.component.rangeSeparator || '至',
        startPlaceholder: '开始日期',
        endPlaceholder: '结束日期',
        valueFormat: props.component.format || 'YYYY-MM-DD HH:mm:ss',
        modelValue: getValue.value,
        style: { width: '100%' },
        'onUpdate:modelValue': handleValueChange
      });

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

.validation-error {
  color: #f56c6c;
  font-size: 12px;
  margin-top: 6px;
}

.column-container {
  margin-bottom: 20px;
}

.columns-grid {
  display: grid;
  gap: 16px;
  width: 100%;
}

.form-item-wrapper {
  margin-bottom: 20px;
}

.nested-item {
  padding: 0;
}

::v-deep .avatar-uploader .el-upload,
.el-upload-list__item {
  width: 50px;
  height: 50px;
}

::v-deep .avatar-uploader .el-upload-list__item {
  width: 80px;
  height: 80px;
}
</style>