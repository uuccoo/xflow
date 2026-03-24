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