<template>
  <el-form-item
    :prop="component.id"
    :rules="rules"
    :label="component.label"
    :required="component.required"
  >
    <el-input-number
      v-model="componentValue"
      :placeholder="component.placeholder || '请输入数字'"
      :precision="component.precision"
      :disabled="readonly"
      class="number-field"
    />
  </el-form-item>
</template>

<script setup>
import { computed } from 'vue'

const { component, readonly } = defineProps({
  component: { type: Object, required: true },
  readonly: { type: Boolean, default: false },
})

const componentValue = defineModel()

const rules = computed(() => [{
  required: component.required,
  message: `${component.label || '字段'} 为必填项`,
  trigger: ['blur', 'change'],
}])
</script>

<style scoped>
.number-field {
  width: 100%;
  max-width: 220px;
}
</style>
