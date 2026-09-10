<template>
  <el-form-item
    :label="component.label"
    :required="component.required"
    :error="error?.message || ''"
  >
    <el-input
      type="textarea"
      :rows="3"
      v-model="component.defaultValue"
      :placeholder="component.placeholder || `请输入${component.label}`"
      :disabled="readonly"
    />
  </el-form-item>
</template>

<script setup>
defineProps({
  component: { type: Object, required: true },
  error: { type: Object, default: null },
  readonly: { type: Boolean, default: false },
})

</script>
