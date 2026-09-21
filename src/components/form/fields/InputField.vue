<template>
  <el-form-item
    :prop="component.id"
    :rules="rules"
    :label="component.label"
    :required="component.required"
  >
    <el-input
      v-model="componentValue"
      :placeholder="component.placeholder || `请输入${component.label}`"
      :disabled="readonly"
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
