import { FormComponentType } from '@/enums'
import { useFormDesignStore } from '@/stores/formDesignStore'
import { flattenFormItems } from '@/utils/formItems'

export const FORM_DESIGN_FIELD = {
  LABEL: 'label',
  START_LABEL: 'startLabel',
  END_LABEL: 'endLabel',
  OPTION_LABEL: 'optionLabel',
}

// 获取选项标签字段的唯一标识
export const getOptionLabelField = (optionValue) => `${FORM_DESIGN_FIELD.OPTION_LABEL}:${optionValue}`

const createError = (componentId, field, code, message) => ({
  module: '表单设计',
  code,
  field,
  message,
  target: { tab: 'formDesign', componentId, field },
})

const saveError = (componentId, field, error) => {
  const formStore = useFormDesignStore()
  const errorKey = `${componentId}:${field}`

  if (error) {
    formStore.errors[errorKey] = error
  } else {
    delete formStore.errors[errorKey]
  }

  return error
}

export const getErrorMessage = (componentId, field) => {
  const formStore = useFormDesignStore()
  return formStore.errors[`${componentId}:${field}`]?.message || ''
}

const isBlank = (value) => !value || !String(value).trim()

const validateOptionLabel = (component, option) => {
  const field = getOptionLabelField(option.value)
  const error = isBlank(option.label)
    ? createError(component.id, field, 'FORM_ITEM_OPTION_TITLE_REQUIRED', '选项名称不能为空')
    : null

  saveError(component.id, field, error)
}

const validateComponentLabel = (component) => {
  const field = FORM_DESIGN_FIELD.LABEL
  const error = isBlank(component.label)
    ? createError(component.id, field, 'FORM_ITEM_TITLE_REQUIRED', '组件标题不能为空')
    : null

  saveError(component.id, field, error)
}

const validateStartLabel = (component) => {
  const field = FORM_DESIGN_FIELD.START_LABEL
  const error = isBlank(component.startLabel)
    ? createError(component.id, field, 'FORM_ITEM_START_TITLE_REQUIRED', '开始时间标题不能为空')
    : null

  saveError(component.id, field, error)
}

const validateEndLabel = (component) => {
  const field = FORM_DESIGN_FIELD.END_LABEL
  const error = isBlank(component.endLabel)
    ? createError(component.id, field, 'FORM_ITEM_END_TITLE_REQUIRED', '结束时间标题不能为空')
    : null

  saveError(component.id, field, error)
}

const validateFormItemsRequired = (components) => {
  const error = components.length === 0
    ? createError('formItems', 'formItems', 'FORM_ITEM_REQUIRED', '请至少添加一个表单项')
    : null

  return saveError('formItems', 'formItems', error)
}

export const validateFormComponent = (component) => {
  if (!component?.id) {
    return
  }

  if (component.type === FormComponentType.COLUMNS) {
    return
  }

  if ([FormComponentType.RADIO, FormComponentType.CHECKBOX].includes(component.type)) {
    component.options?.forEach((option) => {
      validateOptionLabel(component, option)
    })
  }

  if (component.type === FormComponentType.DATERANGE) {
    validateStartLabel(component)
    validateEndLabel(component)
    return
  }

  validateComponentLabel(component)
}

export const validateFormDesign = (formItems = []) => {
  const formStore = useFormDesignStore()
  formStore.errors = {}

  const components = flattenFormItems(formItems)
  validateFormItemsRequired(components)

  components.forEach(validateFormComponent)
  return Object.values(formStore.errors)
}