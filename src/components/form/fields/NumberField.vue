<template>
  <el-form-item
    :label="component.label"
    :required="component.required"
    :error="error?.message || ''"
  >
    <el-input-number
      :model-value="modelValue"
      :placeholder="component.placeholder || '请输入数字'"
      :min="component.min"
      :max="component.max"
      :precision="component.precision"
      :disabled="readonly"
      class="number-field"
      @update:model-value="emit('update:modelValue', $event)"
    />
  </el-form-item>
</template>

<script setup>
defineProps({
  component: { type: Object, required: true },
  modelValue: { type: Number, default: undefined },
  error: { type: Object, default: null },
  readonly: { type: Boolean, default: false },
})

const emit = defineEmits(['update:modelValue'])
</script>

<style scoped>
.number-field {
  width: 100%;
  max-width: 220px;
}
</style>
