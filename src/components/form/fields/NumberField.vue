<template>
  <el-form-item
    :label="component.label"
    :required="component.required"
    :error="error?.message || ''"
  >
    <el-input-number
      v-model="component.defaultValue"
      :placeholder="component.placeholder || '请输入数字'"
      :min="component.min"
      :max="component.max"
      :precision="component.precision"
      :disabled="readonly"
      class="number-field"
      @blur="onBlur"
    />
  </el-form-item>
</template>

<script setup>
import { validateNumber } from '@/validation/formRuntimeValidator'

const props = defineProps({
  component: { type: Object, required: true },
  error: { type: Object, default: null },
  readonly: { type: Boolean, default: false },
})

const emit = defineEmits(['update:error'])

const onBlur = () => {
  if (props.readonly) return

  const error = validateNumber(props.component, props.component.defaultValue)
  emit('update:error', error)
}
</script>

<style scoped>
.number-field {
  width: 100%;
  max-width: 220px;
}
</style>
