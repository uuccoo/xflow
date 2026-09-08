<template>
  <el-form-item
    :label="component.label"
    :required="component.required"
    :error="error?.message || ''"
  >
    <el-input
      :model-value="modelValue"
      :placeholder="component.placeholder"
      style="width: 100%"
      @update:model-value="onChange"
      @blur="onBlur"
      :disabled="readonly"
    />
  </el-form-item>
</template>

<script setup>

// 身份证校验
const validateIdCard = (val) => {
  if (!val) return ''
  const pattern = /^[1-9]\d{5}(?:19|20)?\d{2}(?:0[1-9]|1[0-2])(?:0[1-9]|[12]\d|3[01])\d{3}[\dXx]?$/
  return pattern.test(val) ? '' : '身份证号格式不正确'
}

const props = defineProps({
  component: {
    type: Object,
    required: true,
  },
  modelValue: {
    type: String,
    default: '',
  },
  error: {
    type: Object,
    default: null,
  },
  readonly: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['update:modelValue', 'update:error'])

const onChange = (value) => {
  if (props.readonly) return
  emit('update:modelValue', value)
}

const onBlur = () => {
  if (props.readonly) return
  const error = validateIdCard(props.modelValue)
  emit('update:error', error ? { message: error, label: props.component?.label } : null)
}
</script>
