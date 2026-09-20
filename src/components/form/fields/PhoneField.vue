<template>
  <el-form-item
    :prop="component.id"
    :rules="rules"
    :label="component.label"
    :required="component.required"
  >
    <el-input
      v-model="componentValue.number"
      :placeholder="component.placeholder"
      style="width: 100%"
      :disabled="readonly"
    >
      <template #prepend>
        <el-select
          v-model="componentValue.areaCode"
          style="width: 100px"
          :disabled="readonly"
        >
          <el-option
            v-for="option in PHONE_AREA_CODES"
            :key="option.value"
            :label="option.label"
            :value="option.value"
          ></el-option>
        </el-select>
      </template>
    </el-input>
  </el-form-item>
</template>

<script setup>
import { computed, onBeforeMount } from 'vue'

const PHONE_AREA_CODES = [
  // 中国大陆
  { label: '+86', value: '+86' },
  // 中国香港
  { label: '+852', value: '+852' },
  // 中国澳门
  { label: '+853', value: '+853' },
  // 中国台湾
  { label: '+886', value: '+886' },
]

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
  if (!component.required || (value?.number && value.number.trim())) {
    return createValidationResult(true)
  }

  return createValidationResult(false, `${component.label || '字段'} 为必填项`)
}

const validatePhone = (value) => {
  if (!value?.number || value.areaCode !== '+86') {
    return createValidationResult(true)
  }

  return /^1[3-9]\d{9}$/.test(value.number)
    ? createValidationResult(true)
    : createValidationResult(false, '手机号格式不正确')
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
      const result = validatePhone(value)
      callback(result.valid ? undefined : new Error(result.message))
    },
  },
])

const initDefaultValue = () => {
  const defaultValue = componentValue.value

  componentValue.value = {
    number: defaultValue?.number || '',
    areaCode: defaultValue?.areaCode || '+86',
  }
}

onBeforeMount(() => {
  initDefaultValue()
})

</script>
