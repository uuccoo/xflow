import { createError, getErrorMessage, saveError } from './error'
import { CONDITION_TYPE_INITIATOR } from '@/constants/flowConstants'
import { FormComponentType } from '@/enums'

export function getConditionField(condition) {
  return `condition:${condition.id}`
}

export function getConditionGroupField(group) {
  return `condition-group:${group.id}`
}

export function validateConditionGroup(nodeId, group) {
  const field = getConditionGroupField(group)
  const isValid = Array.isArray(group.conditions) && group.conditions.length > 0

  return saveError(
    nodeId,
    field,
    isValid ? null : createError(nodeId, field, 'CONDITION_GROUP_REQUIRED', '条件组中至少添加一个条件'),
  )
}

export function validateInitiatorCondition(nodeId, condition) {
  const field = getConditionField(condition)
  const isValid = Array.isArray(condition.users) && condition.users.length > 0

  return saveError(
    nodeId,
    field,
    isValid ? null : createError(nodeId, field, 'CONDITION_USERS_REQUIRED', '请至少选择一名发起人'),
  )
}

export function validateNumberCondition(nodeId, condition) {
  const field = getConditionField(condition)
  const isValid = typeof condition.value === 'number' && Number.isFinite(condition.value)

  return saveError(
    nodeId,
    field,
    isValid ? null : createError(nodeId, field, 'CONDITION_VALUE_REQUIRED', '请输入条件数值'),
  )
}

export function validateRadioCondition(nodeId, condition) {
  const field = getConditionField(condition)
  const isValid = Array.isArray(condition.selectedOptions) && condition.selectedOptions.length > 0

  return saveError(
    nodeId,
    field,
    isValid ? null : createError(nodeId, field, 'CONDITION_OPTIONS_REQUIRED', '请至少选择一个条件选项'),
  )
}

export function validateCheckboxCondition(nodeId, condition) {
  const field = getConditionField(condition)
  const isValid = Array.isArray(condition.selectedOptions) && condition.selectedOptions.length > 0

  return saveError(
    nodeId,
    field,
    isValid ? null : createError(nodeId, field, 'CONDITION_OPTIONS_REQUIRED', '请至少选择一个条件选项'),
  )
}

export function validateOtherCondition(nodeId, condition) {
  const field = getConditionField(condition)
  const value = condition.value
  const isValid = value !== null && value !== undefined && String(value).trim() !== ''

  return saveError(
    nodeId,
    field,
    isValid ? null : createError(nodeId, field, 'CONDITION_VALUE_REQUIRED', '请输入条件值'),
  )
}

export function validateCondition(nodeId, nodeProps = {}) {
  const groups = nodeProps.conditionGroups || []

  const errors = []
  groups.forEach((group) => {
    errors.push(validateConditionGroup(nodeId, group))

    const conditions = group.conditions || []
    conditions.forEach((condition) => {
      if (condition.type === CONDITION_TYPE_INITIATOR) {
        errors.push(validateInitiatorCondition(nodeId, condition))
      } else if (condition.type === FormComponentType.NUMBER) {
        errors.push(validateNumberCondition(nodeId, condition))
      } else if (condition.type === FormComponentType.RADIO) {
        errors.push(validateRadioCondition(nodeId, condition))
      } else if (condition.type === FormComponentType.CHECKBOX) {
        errors.push(validateCheckboxCondition(nodeId, condition))
      } else {
        errors.push(validateOtherCondition(nodeId, condition))
      }
    })
  })

  return errors.filter(Boolean)
}

export { getErrorMessage }
