<template>
  <el-form-item
    :label="component.label"
    :required="component.required"
    :error="error?.message || ''"
  >
    <el-input
      v-model="component.defaultValue.number"
      :placeholder="component.placeholder"
      style="width: 100%"
      @blur="onNumberBlur"
      :disabled="readonly"
    >
      <template #prepend>
        <el-select
          v-model="component.defaultValue.areaCode"
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
import { onBeforeMount } from 'vue'
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
  error: {
    type: Object,
    default: null,
  },
  readonly: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['update:error'])

const initDefaultValue = () => {
  const defaultValue = props.component.defaultValue

  props.component.defaultValue = {
    number: defaultValue?.number || '',
    areaCode: defaultValue?.areaCode || '+86',
  }
}

onBeforeMount(() => {
  initDefaultValue()
})

const onNumberBlur = () => {
  const error = validatePhone(props.component, props.component.defaultValue)
  emit('update:error', error)
}
</script>
