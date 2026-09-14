<template>
  <el-form-item
    :label="component.label"
    :required="component.required"
    :error="error?.message || ''"
  >
    <el-input-number
      v-model="component.defaultValue"
      :placeholder="component.placeholder || '请输入数字'"
      :precision="component.precision"
      :disabled="readonly"
      class="number-field"
    />
  </el-form-item>
</template>

<script setup>
const props = defineProps({
  component: { type: Object, required: true },
  error: { type: Object, default: null },
  readonly: { type: Boolean, default: false },
})

</script>

<style scoped>
.number-field {
  width: 100%;
  max-width: 220px;
}
</style>
