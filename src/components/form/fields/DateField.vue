<template>
  <div v-if="isAmPmDateType" class="date-ampm">
    <el-date-picker
      :model-value="props.modelValue?.date || ''"
      :placeholder="props.component?.placeholder || ''"
      type="date"
      format="YYYY-MM-DD"
      value-format="YYYY-MM-DD"
      style="flex: 1"
      :disabled="props.readonly"
      @update:model-value="onAmPmDateChange"
    />
    <el-select
      class="date-ampm-select"
      :model-value="props.modelValue?.meridiem || 'am'"
      :disabled="props.readonly"
      @update:model-value="onAmPmMeridiemChange"
    >
      <el-option label="上午" value="am"></el-option>
      <el-option label="下午" value="pm"></el-option>
    </el-select>
  </div>
  <el-date-picker
    v-else
    :model-value="props.modelValue"
    :placeholder="props.component?.placeholder || ''"
    :type="dateConfig.type"
    :format="dateConfig.format"
    :value-format="dateConfig.valueFormat"
    style="width: 100%"
    :disabled="props.readonly"
    @update:model-value="onModelValueChange"
  />
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  component: {
    type: Object,
    required: true,
  },
  modelValue: {
    type: [String, Date, Object],
    default: '',
  },
  readonly: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['update:modelValue'])

const dateTypeMap = {
  date: {
    type: 'date',
    format: 'YYYY-MM-DD',
    valueFormat: 'YYYY-MM-DD',
  },
  datetime: {
    type: 'datetime',
    format: 'YYYY-MM-DD HH:mm',
    valueFormat: 'YYYY-MM-DD HH:mm',
  },
  month: {
    type: 'month',
    format: 'YYYY-MM',
    valueFormat: 'YYYY-MM',
  },
}

const dateConfig = computed(() => {
  const key = props.component?.dateType || 'date'
  return dateTypeMap[key] || dateTypeMap.date
})

const isAmPmDateType = computed(() => props.component?.dateType === 'datetimeAmPm')

// 不再使用中间计算变量，直接使用 props.modelValue

const onAmPmDateChange = (value) => {
  const meridiem = props.modelValue?.meridiem || 'am'
  emit('update:modelValue', { date: value, meridiem })
}

const onAmPmMeridiemChange = (value) => {
  const date = props.modelValue?.date || ''
  emit('update:modelValue', { date, meridiem: value })
}

const onModelValueChange = (value) => {
  emit('update:modelValue', value)
}
</script>

<style scoped>
.date-ampm {
  display: flex;
  gap: 10px;
  align-items: center;
}

.date-ampm-select {
  max-width: 100px;
}
</style>