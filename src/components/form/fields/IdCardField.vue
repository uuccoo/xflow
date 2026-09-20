<template>
  <el-form-item
    :prop="component.id"
    :rules="rules"
    :label="component.label"
    :required="component.required"
  >
    <el-input
      v-model="componentValue"
      :placeholder="component.placeholder"
      style="width: 100%"
      :disabled="readonly"
    />
  </el-form-item>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  component: {
    type: Object,
    required: true,
  },
  readonly: {
    type: Boolean,
    default: false,
  },
})

const componentValue = defineModel()

const createValidationResult = (valid, message = null) => ({ valid, message })

const validateRequired = (component, value) => {
  if (!component.required || (typeof value === 'string' && value.trim())) {
    return createValidationResult(true)
  }

  return createValidationResult(false, `${component.label || '字段'} 为必填项`)
}

const validateIdCard = (value) => {
  if (!value) return createValidationResult(true)

  const pattern = /^[1-9]\d{5}(?:19|20)?\d{2}(?:0[1-9]|1[0-2])(?:0[1-9]|[12]\d|3[01])\d{3}[\dXx]?$/
  return pattern.test(value)
    ? createValidationResult(true)
    : createValidationResult(false, '身份证号格式不正确')
}

const rules = computed(() => [
  {
    trigger: ['blur', 'change'],
    validator(_, value, callback) {
      const result = validateRequired(props.component, value)
      callback(result.valid ? undefined : new Error(result.message))
    },
  },
  {
    trigger: 'blur',
    validator(_, value, callback) {
      const result = validateIdCard(value)
      callback(result.valid ? undefined : new Error(result.message))
    },
  },
])

</script>
