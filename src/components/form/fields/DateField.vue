<template>
  <el-form-item
    :prop="component.id"
    :rules="rules"
    :label="component.label"
    :required="component.required"
  >
    <div v-if="isAmPmDateType" class="date-ampm">
      <el-date-picker
        v-model="component.defaultValue.date"
        :placeholder="component.placeholder || ''"
        type="date"
        format="YYYY-MM-DD"
        value-format="YYYY-MM-DD"
        style="flex: 1"
        :disabled="readonly"
      />
      <el-select
        class="date-ampm-select"
        v-model="component.defaultValue.meridiem"
        :disabled="readonly"
      >
        <el-option label="上午" value="am"></el-option>
        <el-option label="下午" value="pm"></el-option>
      </el-select>
    </div>
    <el-date-picker
      v-else
      v-model="component.defaultValue"
      :placeholder="component.placeholder || ''"
      :type="dateConfig.type"
      :format="dateConfig.format"
      :value-format="dateConfig.valueFormat"
      style="width: 100%"
      :disabled="readonly"
    />
  </el-form-item>
</template>

<script setup>
import { computed, onBeforeMount, watch } from 'vue'

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

const validateDateRequired = (value) => {
  if (!props.component.required) return { valid: true, message: null }

  const dateValue = isAmPmDateType.value ? value?.date : value
  return dateValue
    ? { valid: true, message: null }
    : { valid: false, message: `${props.component.label || '字段'} 为必填项` }
}

const rules = computed(() => [{
  trigger: ['blur', 'change'],
  validator(_, value, callback) {
    const result = validateDateRequired(value)
    callback(result.valid ? undefined : new Error(result.message))
  },
}])

const initDefaultValue = () => {
  if (!isAmPmDateType.value) return

  const defaultValue = props.component.defaultValue

  props.component.defaultValue = {
    date: defaultValue?.date || '',
    meridiem: defaultValue?.meridiem || 'am',
  }
}

watch(
  () => props.component.dateType,
  () => {
    // 当日期类型变化时，重置默认值并初始化
    props.component.defaultValue = undefined
    initDefaultValue()
  }
)

onBeforeMount(() => {
  initDefaultValue()
})
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
