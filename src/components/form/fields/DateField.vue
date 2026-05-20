<template>
  <el-date-picker
    :model-value="props.modelValue"
    :placeholder="props.component?.placeholder || '请选择日期'"
    type="date"
    style="width: 100%"
    :disabled="props.readonly"
    @update:model-value="onModelValueChange"
  />
</template>

<script setup>
const props = defineProps({
  component: {
    type: Object,
    required: true,
  },
  modelValue: {
    type: [String, Date],
    default: '',
  },
  readonly: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['update:modelValue'])

const onModelValueChange = (value) => {
  if (props.readonly) return
  emit('update:modelValue', value)
}
</script>