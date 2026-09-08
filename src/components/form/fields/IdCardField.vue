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
import { validateIdCard } from '@/validation/formRuntimeValidator'

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

  const error = validateIdCard(props.component, props.modelValue)
  emit('update:error', error)
}

</script>
