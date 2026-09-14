import { FormComponentType } from '@/enums'

const createError = (code, valid, message = null) => ({
  valid,  // 是否通过校验
  code, // 错误码
  message,
})

const isValueEmpty = (component, value) => {
  if (component?.type === FormComponentType.TEXT) {
    return false
  }

  if (component?.type === FormComponentType.PHONE) {
    return !value || typeof value !== 'object' || !value.number || value.number.trim() === ''
  }

  if (component?.type === FormComponentType.DATE && component?.dateType === 'datetimeAmPm') {
    return !value || typeof value !== 'object' || !value.date
  }

  if (component?.type === FormComponentType.DATERANGE) {
    if (!value || typeof value !== 'object') {
      return true
    }

    if (component?.dateType === 'datetimeAmPm') {
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

  if (arrayRequiredTypes.includes(component?.type)) {
    return !Array.isArray(value) || value.length === 0
  }

  if (typeof value === 'string') {
    return value.trim() === ''
  }

  return value === undefined || value === null
}

export const validatePhone = (component, value) => {
  const number = value?.number
  if (!number || value?.areaCode !== '+86') {
    return createError('PHONE_FORMAT_INVALID', true)
  }

  return /^1[3-9]\d{9}$/.test(number)
    ? createError('PHONE_FORMAT_INVALID', true)
    : createError('PHONE_FORMAT_INVALID', false, '手机号格式不正确')
}

export const validateIdCard = (component, value) => {
  if (!value) return createError('ID_CARD_FORMAT_INVALID', true)

  const pattern = /^[1-9]\d{5}(?:19|20)?\d{2}(?:0[1-9]|1[0-2])(?:0[1-9]|[12]\d|3[01])\d{3}[\dXx]?$/
  return pattern.test(value)
    ? createError('ID_CARD_FORMAT_INVALID', true)
    : createError('ID_CARD_FORMAT_INVALID', false, '身份证号格式不正确')
}

export const validateRequired = (component, value) => {
  if (!component?.required || !isValueEmpty(component, value)) {
    return createError('FIELD_REQUIRED', true)
  }

  return createError('FIELD_REQUIRED', false, `${component.label || '字段'} 为必填项`)
}

export const validateFormData = (formItems = [], formValues = {}) => {
  const errors = {}

  for (const component of formItems) {
    if (!component?.id || component.type === FormComponentType.TEXT) continue

    const value = formValues[component.id]
    const requiredResult = validateRequired(component, value)
    let result = requiredResult

    if (requiredResult.valid) {
      switch (component.type) {
        case FormComponentType.PHONE:
          result = validatePhone(component, value)
          break
        case FormComponentType.IDCARD:
          result = validateIdCard(component, value)
          break
        default:
          break
      }
    }

    if (!result.valid) errors[component.id] = result
  }

  return errors
}