<template>
  <div class="form-renderer">
    <!-- 分栏容器组件 -->
    <div v-if="component.type === 'columns'" class="form-item column-container">
      <div class="form-item-control columns-grid"
        :style="{ gridTemplateColumns: getGridTemplateColumns(component.layoutValue) }">
        <!-- 子组件直接放入grid布局中 -->
        <div v-for="element in component.children" :key="element.id" class="form-item-wrapper nested-item">
          <form-renderer :component="element" :form-values="formValues"
            @update:value="(id, value) => $emit('update:value', id, value)" />
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

// 根据布局值计算列数和列宽比例
const getGridTemplateColumns = (layoutValue) => {
  if (!layoutValue) return "1fr 1fr"; // 默认两等分

  const parts = layoutValue.split(':').map(Number);
  return parts.map(part => `${part}fr`).join(' ');
};

// 获取当前组件的值
const getValue = computed(() => {
  if (props.component.id && props.formValues) {
    return props.formValues[props.component.id];
  }
  return props.component.defaultValue || '';
});

// 处理值变化
const handleValueChange = (value) => {
  if (props.component.id) {
    emit('update:value', props.component.id, value);
  }
};

// 渲染表单控件
const renderField = () => {
  switch (props.component.type) {
    case 'input':
      return h(ElInput, {
        modelValue: getValue.value,
        placeholder: props.component.placeholder || '请输入' + props.component.label,
        'onUpdate:modelValue': handleValueChange
      });

    case 'textarea':
      return h(ElInput, {
        modelValue: getValue.value,
        placeholder: props.component.placeholder || '请输入' + props.component.label,
        'onUpdate:modelValue': handleValueChange,
        type: 'textarea',
        rows: 3
      });

    case 'radio':
      // 根据 asDropdown 属性决定渲染下拉框还是单选框组
      if (props.component.asDropdown) {
        return h(ElSelect,
          {
            modelValue: getValue.value,
            placeholder: props.component.placeholder || '请选择' + props.component.label,
            style: { width: '100%' },
            'onUpdate:modelValue': handleValueChange
          },
          () => props.component.options?.map(option =>
            h(ElOption, { label: option.label, value: option.value, key: option.value })
          ) || []
        );
      } else {
        return h(ElRadioGroup,
          {
            modelValue: getValue.value,
            'onUpdate:modelValue': handleValueChange
          },
          () => props.component.options?.map(option =>
            h(ElRadio, { label: option.value }, { default: () => option.label })
          ) || []
        );
      }

    case 'checkbox':
      // 根据 asDropdown 属性决定渲染下拉多选框还是多选框组
      if (props.component.asDropdown) {
        return h(ElSelect,
          {
            modelValue: getValue.value,
            multiple: true,
            placeholder: props.component.placeholder || '请选择' + props.component.label,
            style: { width: '100%' },
            'onUpdate:modelValue': handleValueChange
          },
          () => props.component.options?.map(option =>
            h(ElOption, { label: option.label, value: option.value, key: option.value })
          ) || []
        );
      } else {
        return h(ElCheckboxGroup,
          {
            modelValue: getValue.value,
            'onUpdate:modelValue': handleValueChange
          },
          () => props.component.options?.map(option =>
            h(ElCheckbox, { label: option.value }, { default: () => option.label })
          ) || []
        );
      }

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
        class: 'avatar-uploader',
        action: '#',
        listType: 'picture-card',
        autoUpload: false,
        accept: 'image/*',
        fileList: Array.isArray(getValue.value) ? getValue.value : [],
        'onUpdate:fileList': (files) => handleValueChange(files)
      }, {
        default: () => h(ElIcon, {}, { default: () => h(Plus) })
      });

    case 'number':
      return h(ElInputNumber, {
        modelValue: getValue.value,
        placeholder: props.component.placeholder || '请输入数字',
        min: props.component.min,
        max: props.component.max,
        step: props.component.step,
        style: { width: '100%', "max-width": '220px' },
        'onUpdate:modelValue': handleValueChange
      });

    case 'daterange':
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