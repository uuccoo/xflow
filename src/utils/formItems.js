import { FormComponentType } from '@/enums'

/**
 * 深度遍历表单项，按顺序返回不包含分栏容器本身的控件列表。
 */
export const flattenFormItems = (items = []) => {
  if (!Array.isArray(items) || items.length === 0) return []

  const result = []

  for (const item of items) {
    if (!item) continue

    if (item.type === FormComponentType.COLUMNS) {
      result.push(...flattenFormItems(item.children))
      continue
    }

    result.push(item)
  }

  return result
}

/**
 * 收集可用于条件判断的必填字段
 */
export const collectRequiredConditionFields = (items = []) => {
  const result = []
  // 约定：仅以下类型的字段可用于条件判断，且必须是必填项。
  const validTypes = [FormComponentType.RADIO, FormComponentType.CHECKBOX, FormComponentType.NUMBER]
  const flatItems = flattenFormItems(items)

  for (const item of flatItems) {
    // 仅保留可用于条件判断的必填且有展示名称的字段。
    if (item.required && item.label && validTypes.includes(item.type)) {
      result.push(item)
    }
  }

  return result
}

/**
 * 收集所有必填字段（已拍平，分栏容器不参与）。
 */
export const collectRequiredFormItems = (items = []) => {
  const result = []
  const flatItems = flattenFormItems(items)

  for (const item of flatItems) {
    if (item?.required) {
      result.push(item)
    }
  }

  return result
}

/**
 * 判断必填字段值是否为空。
 */
export const isRequiredValueEmpty = (item, value) => {
  if (item?.type === FormComponentType.TEXT) {
    return false
  }

  if (item?.type === FormComponentType.PHONE) {
    return !value || typeof value !== 'object' || !value.number || value.number.trim() === ''
  }

  if (item?.type === FormComponentType.DATE && item?.dateType === 'datetimeAmPm') {
    return !value || typeof value !== 'object' || !value.date
  }

  if (item?.type === FormComponentType.DATERANGE) {
    if (!value || typeof value !== 'object') {
      return true
    }

    if (item?.dateType === 'datetimeAmPm') {
      return (
        !value.startDate ||
        typeof value.startDate !== 'object' ||
        !value.startDate.date ||
        !value.endDate ||
        typeof value.endDate !== 'object' ||
        !value.endDate.date
      )
    }

    return !value.startDate || !value.endDate
  }

  const arrayRequiredTypes = [
    FormComponentType.CHECKBOX,
    FormComponentType.UPLOAD,
    FormComponentType.IMAGE,
  ]

  if (arrayRequiredTypes.includes(item?.type)) {
    return !Array.isArray(value) || value.length === 0
  }

  if (typeof value === 'string') {
    return value.trim() === ''
  }

  return value === undefined || value === null
}

/**
 * 构建默认表单值（结构：{ [id]: defaultValue }）。
 */
export const buildDefaultFormValues = (items = []) => {
  const defaultValues = {}
  const flatItems = flattenFormItems(items)

  for (const item of flatItems) {
    if (item?.id && item.defaultValue !== undefined) {
      defaultValues[item.id] = item.defaultValue
    }
  }

  return defaultValues
}