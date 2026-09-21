<template>
  <el-form-item
    :prop="startProp"
    :rules="rules.start"
    :label="component.startLabel || '开始时间'"
    :required="component.required"
  >
    <div v-if="isAmPmDateType" class="date-range-ampm">
      <el-date-picker
        v-model="componentValue.startDate.date"
        :placeholder="component.placeholder || '请选择'"
        type="date"
        format="YYYY-MM-DD"
        value-format="YYYY-MM-DD"
        style="flex: 1"
        :disabled="readonly"
      />
      <el-select
        class="date-range-ampm-select"
        v-model="componentValue.startDate.meridiem"
        :disabled="readonly"
      >
        <el-option label="上午" value="am"></el-option>
        <el-option label="下午" value="pm"></el-option>
      </el-select>
    </div>
    <el-date-picker
      v-else
      v-model="componentValue.startDate"
      :placeholder="component.placeholder || '请选择'"
      :type="dateConfig.type"
      :format="dateConfig.format"
      :value-format="dateConfig.valueFormat"
      style="width: 100%"
      :disabled="readonly"
    />
  </el-form-item>

  <el-form-item
    :prop="endProp"
    :rules="rules.end"
    :class="{ 'is-readonly-range-end': readonly }"
    :label="component.endLabel || '结束时间'"
    :required="component.required"
  >
    <div v-if="isAmPmDateType" class="date-range-ampm">
      <el-date-picker
        v-model="componentValue.endDate.date"
        :placeholder="component.placeholder || '请选择'"
        type="date"
        format="YYYY-MM-DD"
        value-format="YYYY-MM-DD"
        style="flex: 1"
        :disabled="readonly"
      />
      <el-select
        class="date-range-ampm-select"
        v-model="componentValue.endDate.meridiem"
        :disabled="readonly"
      >
        <el-option label="上午" value="am"></el-option>
        <el-option label="下午" value="pm"></el-option>
      </el-select>
    </div>
    <el-date-picker
      v-else
      v-model="componentValue.endDate"
      :placeholder="component.placeholder || '请选择'"
      :type="dateConfig.type"
      :format="dateConfig.format"
      :value-format="dateConfig.valueFormat"
      style="width: 100%"
      :disabled="readonly"
    />
  </el-form-item>
</template>

<script setup>
import { computed, watch, onBeforeMount } from 'vue'

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

const dateConfig = computed(() => dateTypeMap[props.component?.dateType] || dateTypeMap.date)
const isAmPmDateType = computed(() => props.component?.dateType === 'datetimeAmPm')
const startProp = computed(() => (
  isAmPmDateType.value
    ? `${props.component.id}.startDate.date`
    : `${props.component.id}.startDate`
))
const endProp = computed(() => (
  isAmPmDateType.value
    ? `${props.component.id}.endDate.date`
    : `${props.component.id}.endDate`
))

const validateDateRangePart = (component, value, label) => {
  if (!component.required || (typeof value === 'string' ? value.trim() : value)) {
    return { valid: true, message: null }
  }

  return { valid: false, message: `${label || '日期'} 为必填项` }
}

const rules = computed(() => ({
  start: [{
    trigger: ['blur', 'change'],
    validator(_, value, callback) {
      const result = validateDateRangePart(
        props.component,
        value,
        props.component.startLabel || '开始时间',
      )
      callback(result.valid ? undefined : new Error(result.message))
    },
  }],
  end: [{
    trigger: ['blur', 'change'],
    validator(_, value, callback) {
      const result = validateDateRangePart(
        props.component,
        value,
        props.component.endLabel || '结束时间',
      )
      callback(result.valid ? undefined : new Error(result.message))
    },
  }],
}))

const initDefaultValue = () => {
  const defaultValue = componentValue.value

  componentValue.value = isAmPmDateType.value
    ? {
        startDate: {
          date: defaultValue?.startDate?.date || '',
          meridiem: defaultValue?.startDate?.meridiem || 'am',
        },
        endDate: {
          date: defaultValue?.endDate?.date || '',
          meridiem: defaultValue?.endDate?.meridiem || 'am',
        },
      }
    : {
        startDate: defaultValue?.startDate || '',
        endDate: defaultValue?.endDate || '',
      }
}

watch(
  () => props.component.dateType,
  () => {
    // 当日期类型变化时，重置默认值并初始化
    componentValue.value = {}
    initDefaultValue()
  }
)

onBeforeMount(() => {
  initDefaultValue()
})
</script>

<style scoped>
.is-readonly-range-end {
  margin-top: 10px;
}

.date-range-ampm {
  display: flex;
  gap: 10px;
  align-items: center;
}

.date-range-ampm-select {
  max-width: 100px;
}

</style>