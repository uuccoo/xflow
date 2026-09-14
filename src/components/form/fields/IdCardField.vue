<template>
  <el-form-item
    :label="component.label"
    :required="component.required"
    :error="error?.message || ''"
  >
    <el-input
      v-model="component.defaultValue"
      :placeholder="component.placeholder"
      style="width: 100%"
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
  error: {
    type: Object,
    default: null,
  },
  readonly: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['update:error'])

const onBlur = () => {
  if (props.readonly) return

  const error = validateIdCard(props.component, props.component.defaultValue)
  emit('update:error', error)
}

</script>
