<template>
  <el-input
    :model-value="props.modelValue.number"
    :placeholder="props.component?.placeholder"
    style="width: 100%"
    @update:model-value="onNumberChange"
    @blur="onNumberBlur"
    :disabled="props.readonly"
  >
    <template #prepend>
      <el-select
        :model-value="props.modelValue.areaCode || '+86'"
        style="width: 100px"
        @update:model-value="onAreaCodeChange"
        :disabled="props.readonly"
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
</template>

<script setup>
// 电话区号常量
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

// 手机号校验
const validatePhone = (value) => {
  const { areaCode, number } = value || {}

  if (!number) return ''

  if (areaCode === '+86') {
    return /^1[3-9]\d{9}$/.test(number) ? '' : '手机号格式不正确'
  }

  return ''
}

const props = defineProps({
  component: {
    type: Object,
    required: true,
  },
  modelValue: {
    type: Object,
    default: () => ({}),
  },
  readonly: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['update:modelValue', 'update:error'])

const updateField = (field, value) => {
  const nextValue = {
    ...props.modelValue,
    [field]: value,
  }
  nextValue.areaCode = nextValue.areaCode || '+86'

  emit('update:modelValue', nextValue)
  return nextValue
}

const emitValidation = (value) => {
  const error = validatePhone(value)

  emit(
    'update:error',
    error
      ? {
          message: error,
          label: props.component?.label,
          type: props.component?.type,
        }
      : null
  )
}

const onNumberChange = (value) => {
  updateField('number', value)
}

const onNumberBlur = () => {
  emitValidation(props.modelValue)
}

const onAreaCodeChange = (value) => {
  const nextValue = updateField('areaCode', value)
  emitValidation(nextValue)
}
</script>
