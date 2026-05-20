<template>
  <el-date-picker
    :model-value="props.modelValue"
    :placeholder="props.component?.placeholder || '请选择日期时间区间'"
    type="datetimerange"
    :range-separator="props.component?.rangeSeparator || '至'"
    start-placeholder="开始日期"
    end-placeholder="结束日期"
    :value-format="props.component?.format || 'YYYY-MM-DD HH:mm:ss'"
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
    type: Array,
    default: () => [],
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