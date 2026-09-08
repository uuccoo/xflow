<template>
  <div class="form-renderer">
    <div v-if="component.type === FormComponentType.COLUMNS" class="column-container">
      <div
        class="columns-grid"
        :style="{ gridTemplateColumns: getGridTemplateColumns(component.layoutValue) }"
      >
        <FormRenderer
          v-for="element in component.children || []"
          :key="element.id"
          :component="element"
        />
      </div>
    </div>
    <component
      :is="currentField"
      v-else
      :component="component"
      :model-value="getValue"
      :error="validationErrors[component.id]"
      @update:model-value="handleValueChange"
      @update:error="handleFieldErrorChange"
    />
  </div>
</template>

<script setup>
import { computed, defineAsyncComponent, inject } from 'vue';
import { FormComponentType } from '@/enums';
import InputField from './fields/InputField.vue'
import TextareaField from './fields/TextareaField.vue'
import NumberField from './fields/NumberField.vue'
import TextField from './fields/TextField.vue'
import IdCardField from './fields/IdCardField.vue'
import PhoneField from './fields/PhoneField.vue'
import DateField from './fields/DateField.vue'
import DateRangeField from './fields/DateRangeField.vue'
import ImageField from './fields/ImageField.vue'
import UploadField from './fields/UploadField.vue'
import RadioField from './fields/RadioField.vue'
import CheckboxField from './fields/CheckboxField.vue'
import { validateRequired } from '@/validation/formRuntimeValidator'

const fieldComponents = {
  [FormComponentType.INPUT]: InputField,
  [FormComponentType.TEXTAREA]: TextareaField,
  [FormComponentType.NUMBER]: NumberField,
  [FormComponentType.RADIO]: RadioField,
  [FormComponentType.IDCARD]: IdCardField,
  [FormComponentType.PHONE]: PhoneField,
  [FormComponentType.CHECKBOX]: CheckboxField,
  [FormComponentType.DATE]: DateField,
  [FormComponentType.UPLOAD]: UploadField,
  [FormComponentType.IMAGE]: ImageField,
  [FormComponentType.DATERANGE]: DateRangeField,
  [FormComponentType.TEXT]: TextField,
}

// 自引用组件（递归组件）
const FormRenderer = defineAsyncComponent(() => import('./FormRenderer.vue'));

// 通过 inject 从祖先组件（FormPreview）获取共享数据和事件处理函数
const formValues = inject('formValues', {});
const validationErrors = inject('validationErrors', {});
const viewMode = inject('viewMode', 'pc');
const updateValue = inject('updateValue');
const updateError = inject('updateError');

const props = defineProps({
  component: {
    type: Object,
    required: true
  }
});

const currentField = computed(() => fieldComponents[props.component.type] || TextField)

// 处理值变化
const handleValueChange = (value) => {
  if (props.component.id) {
    updateValue(props.component.id, value);

    const error = validateRequired(props.component, value)
    updateError(props.component.id, error)
  }
};

const handleFieldErrorChange = (error) => {
  if (!props.component.id) return
  updateError(props.component.id, error)
};

// 根据布局值计算列数和列宽比例
const getGridTemplateColumns = (layoutValue) => {
  // 如果是手机视图,则每行只显示一个组件
  if (viewMode === 'mobile') {
    return "1fr";
  }
  
  if (!layoutValue) return "1fr 1fr"; // 默认两等分

  const parts = layoutValue.split(':').map(Number);
  return parts.map(part => `${part}fr`).join(' ');
};

// 获取当前组件的值
const getValue = computed(() => {
  const componentId = props.component.id;
  return componentId && formValues
    ? formValues[componentId]
    : undefined;
});

</script>

<style scoped lang="scss">
.form-renderer {
  width: 100%;
}

.columns-grid {
  display: grid;
  grid-column-gap: 16px;
  width: 100%;
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