<template>
  <el-form-item
    :label="component.label"
    :required="component.required"
    :error="error?.message || ''"
  >
    <el-input
      :model-value="modelValue"
      :placeholder="component.placeholder || `请输入${component.label}`"
      :disabled="readonly"
      @update:model-value="emit('update:modelValue', $event)"
    />
  </el-form-item>
</template>

<script setup>
defineProps({
  component: { type: Object, required: true },
  modelValue: { type: String, default: '' },
  error: { type: Object, default: null },
  readonly: { type: Boolean, default: false },
})

const emit = defineEmits(['update:modelValue'])
</script>
