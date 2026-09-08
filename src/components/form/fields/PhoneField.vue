<template>
  <el-form-item
    :label="component.label"
    :required="component.required"
    :error="error?.message || ''"
  >
    <el-input
      :model-value="modelValue.number"
      :placeholder="component.placeholder"
      style="width: 100%"
      @update:model-value="onNumberChange"
      @blur="onNumberBlur"
      :disabled="readonly"
    >
      <template #prepend>
        <el-select
          :model-value="modelValue.areaCode || '+86'"
          style="width: 100px"
          @update:model-value="onAreaCodeChange"
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
import { validatePhone } from '@/validation/formRuntimeValidator'

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
  modelValue: {
    type: Object,
    default: () => ({}),
  },
  error: {
    type: Object,
    default: null,
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

const onNumberChange = (value) => {
  updateField('number', value)
}

const onNumberBlur = () => {
  const error = validatePhone(props.component, props.modelValue)
  emit('update:error', error)
}

const onAreaCodeChange = (value) => {
  updateField('areaCode', value)
}
</script>
