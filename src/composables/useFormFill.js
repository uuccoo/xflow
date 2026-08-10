import { reactive, provide } from 'vue'
import { ElMessage } from 'element-plus'
import { FormComponentType } from '@/enums'
import { buildDefaultFormValues, collectRequiredFormItems } from '@/utils/formItems'

/**
 * 表单填写 composable。
 *
 * 负责表单值的初始化、读写、校验错误的收集与校验，并通过 provide 向下注入，
 * 供 FormRenderer 等递归子组件直接使用。
 */
export function useFormFill() {
  // ---- 状态 ----
  const formValues = reactive({})
  const validationErrors = reactive({})

  // ---- 方法 ----

  /**
   * 根据 formItems 构建默认值并写入 formValues。
   * @param {Array} formItems - 表单项列表
   */
  const initFormValues = (formItems = []) => {
    const defaultValues = buildDefaultFormValues(formItems)
    Object.assign(formValues, defaultValues)
  }

  /**
   * 更新单个字段值。
   */
  const updateValue = (id, value) => {
    if (id) {
      formValues[id] = value
    }
  }

  /**
   * 更新或清除单个字段的校验错误。
   */
  const updateError = (id, error) => {
    if (!id) return
    if (error) {
      validationErrors[id] = error
    } else {
      if (validationErrors[id] !== undefined) {
        delete validationErrors[id]
      }
    }
  }

  /**
   * 判断必填字段是否为空（内部使用）。
   */
  const isRequiredValueEmpty = (item, value) => {
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
   * 校验表单：必填项检查 + 子组件上报的 validationErrors 检查。
   * @param {Array} formItems - 表单项列表
   * @returns {boolean} 校验是否通过
   */
  const validateForm = (formItems = []) => {
    const requiredItems = collectRequiredFormItems(formItems)

    // 1. 必填项校验
    for (const item of requiredItems) {
      if (!item.id) continue

      const value = formValues[item.id]
      if (isRequiredValueEmpty(item, value)) {
        ElMessage.error(`${item.label || '未命名字段'} 为必填项`)
        return false
      }
    }

    // 2. 检查子组件上报的 validationErrors
    for (const [id, err] of Object.entries(validationErrors)) {
      if (err?.message) {
        ElMessage.error(`${err.label || '字段'}: ${err.message}`)
        return false
      }
    }

    return true
  }

  // ---- provide 注入，供递归子组件使用 ----
  provide('formValues', formValues)
  provide('validationErrors', validationErrors)
  provide('updateValue', updateValue)
  provide('updateError', updateError)

  return {
    formValues,
    validationErrors,
    updateValue,
    updateError,
    initFormValues,
    validateForm,
  }
}
