import { reactive, ref, provide } from 'vue'
import { buildDefaultFormValues, flattenFormItems } from '@/utils/formItems'
import { validateFormData } from '@/validation/formRuntimeValidator'

/**
 * 表单填写 composable。
 *
 * 负责表单值的初始化、读写、校验错误的收集与校验，并通过 provide 向下注入，
 * 供 FormRenderer 等递归子组件直接使用。
 */
export function useFormFill() {
  // ---- 状态 ----
  const formValues = reactive({})
  const validationErrors = ref({})

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
      validationErrors.value[id] = error
    } else {
      if (validationErrors.value[id] !== undefined) {
        delete validationErrors.value[id]
      }
    }
  }

  /**
   * 全量校验表单并刷新字段错误。
   * @param {Array} formItems - 表单项列表
   * @returns {boolean} 校验是否通过
   */
  const validateForm = (formItems = []) => {
    const errors = validateFormData(flattenFormItems(formItems), formValues)
    validationErrors.value = errors

    return Object.keys(errors).length === 0
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
