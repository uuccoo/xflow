<template>
  <div class="date-range-stack">
    <div class="date-range-item">
      <div class="date-range-label">
        {{ props.component?.startLabel || '开始时间' }}
        <span v-if="props.component?.required" class="required">*</span>
      </div>
      <div v-if="isAmPmDateType" class="date-range-ampm">
        <el-date-picker
          :model-value="props.modelValue?.startDate?.date || ''"
          :placeholder="props.component?.placeholder || '请选择'"
          type="date"
          format="YYYY-MM-DD"
          value-format="YYYY-MM-DD"
          style="flex: 1"
          :disabled="props.readonly"
          @update:model-value="(value) => onStartAmPmDateChange(value)"
        />
        <el-select
          class="date-range-ampm-select"
          :model-value="props.modelValue?.startDate?.meridiem || 'am'"
          :disabled="props.readonly"
          @update:model-value="(value) => onStartAmPmMeridiemChange(value)"
        >
          <el-option label="上午" value="am"></el-option>
          <el-option label="下午" value="pm"></el-option>
        </el-select>
      </div>
      <el-date-picker
        v-else
        :model-value="props.modelValue?.startDate || ''"
        :placeholder="props.component?.placeholder || '请选择'"
        :type="dateConfig.type"
        :format="dateConfig.format"
        :value-format="dateConfig.valueFormat"
        style="width: 100%"
        :disabled="props.readonly"
        @update:model-value="onStartDateChange"
      />
    </div>
    <div class="date-range-item">
      <div class="date-range-label">
        {{ props.component?.endLabel || '结束时间' }}
        <span v-if="props.component?.required" class="required">*</span>
      </div>
      <div v-if="isAmPmDateType" class="date-range-ampm">
        <el-date-picker
          :model-value="props.modelValue?.endDate?.date || ''"
          :placeholder="props.component?.placeholder || '请选择'"
          type="date"
          format="YYYY-MM-DD"
          value-format="YYYY-MM-DD"
          style="flex: 1"
          :disabled="props.readonly"
          @update:model-value="(value) => onEndAmPmDateChange(value)"
        />
        <el-select
          class="date-range-ampm-select"
          :model-value="props.modelValue?.endDate?.meridiem || 'am'"
          :disabled="props.readonly"
          @update:model-value="(value) => onEndAmPmMeridiemChange(value)"
        >
          <el-option label="上午" value="am"></el-option>
          <el-option label="下午" value="pm"></el-option>
        </el-select>
      </div>
      <el-date-picker
        v-else
        :model-value="props.modelValue?.endDate || ''"
        :placeholder="props.component?.placeholder || '请选择'"
        :type="dateConfig.type"
        :format="dateConfig.format"
        :value-format="dateConfig.valueFormat"
        style="width: 100%"
        :disabled="props.readonly"
        @update:model-value="onEndDateChange"
      />
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  component: {
    type: Object,
    required: true,
  },
  modelValue: {
    type: Object,
    default: () => ({ startDate: '', endDate: '' }),
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

const onStartDateChange = (value) => {
  const nextValue = {
    startDate: value || '',
    endDate: props.modelValue?.endDate || '',
  }
  emit('update:modelValue', nextValue)
}

const onEndDateChange = (value) => {
  const nextValue = {
    startDate: props.modelValue?.startDate || '',
    endDate: value || '',
  }
  emit('update:modelValue', nextValue)
}

const onStartAmPmDateChange = (value) => {
  const currentValue = props.modelValue?.startDate
  const meridiem = currentValue?.meridiem || 'am'
  const nextValue = {
    startDate: { date: value || '', meridiem },
    endDate: props.modelValue?.endDate || '',
  }
  emit('update:modelValue', nextValue)
}

const onStartAmPmMeridiemChange = (value) => {
  const currentValue = props.modelValue?.startDate
  const date = currentValue?.date || ''
  const nextValue = {
    startDate: { date, meridiem: value },
    endDate: props.modelValue?.endDate || '',
  }
  emit('update:modelValue', nextValue)
}

const onEndAmPmDateChange = (value) => {
  const currentValue = props.modelValue?.endDate
  const meridiem = currentValue?.meridiem || 'am'
  const nextValue = {
    startDate: props.modelValue?.startDate || '',
    endDate: { date: value || '', meridiem },
  }
  emit('update:modelValue', nextValue)
}

const onEndAmPmMeridiemChange = (value) => {
  const currentValue = props.modelValue?.endDate
  const date = currentValue?.date || ''
  const nextValue = {
    startDate: props.modelValue?.startDate || '',
    endDate: { date, meridiem: value },
  }
  emit('update:modelValue', nextValue)
}
</script>

<style scoped>
.date-range-stack {
  display: flex;
  flex-direction: column;
  gap: 10px;
  width: 100%;
}

.date-range-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.date-range-ampm {
  display: flex;
  gap: 10px;
  align-items: center;
}

.date-range-ampm-select {
  max-width: 100px;
}

.date-range-label {
  font-size: 14px;
  color: #606266;
  font-weight: 500;
}

.required {
  color: #f56c6c;
  margin-left: 4px;
}
</style>