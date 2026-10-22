<template>
  <template v-for="(summaryItem, idx) in displaySummary" :key="idx">
    <div class="summary-item">{{ summaryItem.label }}: {{ summaryItem.value }}</div>
  </template>
</template>

<script setup>
import { computed } from 'vue'
import { FormComponentType } from '@/enums'
import {
  isEmptyValue,
  getDateRangeDisplayFields,
  parseCheckboxValue,
  parseDateValue,
  parseIdCardValue,
  parsePhoneValue,
  parseRadioValue,
  parseToString,
} from '@/utils/formDisplay'
import { flattenFormItems } from '@/utils/formItems'

const props = defineProps({
  formItems: {
    type: Array,
    default: () => [],
  },
  formData: {
    type: Object,
    default: () => ({}),
  },
  maxItems: {
    type: Number,
    default: 3,
  },
})

const displaySummary = computed(() => {
  const items = flattenFormItems(props.formItems)
  const result = []

  for (const component of items) {
    if (result.length >= props.maxItems) break

    const id = component?.id
    if (!id) continue

    const value = props.formData?.[id]
    if (isEmptyValue(value)) continue

    if (
      component?.type === FormComponentType.IMAGE ||
      component?.type === FormComponentType.UPLOAD
    ) {
      continue
    }

    if (component?.type === FormComponentType.DATERANGE) {
      const rangeFields = getDateRangeDisplayFields(component, value)

      for (const rangeField of rangeFields) {
        if (result.length >= props.maxItems) break

        result.push({
          label: rangeField.label,
          value: String(rangeField.display),
        })
      }

      continue
    }

    let display = null
    switch (component?.type) {
      case FormComponentType.RADIO:
        display = parseRadioValue(component, value)
        break
      case FormComponentType.CHECKBOX:
        display = parseCheckboxValue(component, value)
        break
      case FormComponentType.DATE:
        display = parseDateValue(component, value)
        break
      case FormComponentType.PHONE:
        display = parsePhoneValue(component, value)
        break
      case FormComponentType.IDCARD:
        display = parseIdCardValue(component, value)
        break
      default:
        display = parseToString(value)
        break
    }

    result.push({
      label: component.label || '未命名字段',
      value: String(display),
    })
  }

  return result
})
</script>

<style scoped>
.summary-item {
  width: 100%;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
