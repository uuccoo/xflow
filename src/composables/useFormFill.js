import { computed, ref, provide } from 'vue'
import { flattenFormItems } from '@/utils/formItems'
import { validateFormData } from '@/validation/formRuntimeValidator'

/**
 * 表单填写 composable。
 *
 * 负责表单值的初始化、读写、校验错误的收集与校验，并通过 provide 向下注入，
 * 供 FormRenderer 等递归子组件直接使用。
 */
export function useFormFill(formItems) {
  // ---- 状态 ----
  const validationErrors = ref({})

  const formValues = computed(() => {
    const values = {}

    for (const item of flattenFormItems(formItems.value)) {
      if (item?.id) {
        values[item.id] = item.defaultValue
      }
    }

    return values
  })

  // ---- 方法 ----

  /**
   * 更新或清除单个字段的校验错误。
   */
  const updateError = (id, error) => {
    if (!id) return

    if (!error?.valid) {
      validationErrors.value[id] = error
      return
    }

    const currentError = validationErrors.value[id]
    if (currentError?.code === error.code) {
      delete validationErrors.value[id]
    }
  }

  /**
   * 全量校验表单并刷新字段错误。
   * @returns {boolean} 校验是否通过
   */
  const validateForm = () => {
    const errors = validateFormData(flattenFormItems(formItems.value), formValues.value)
    validationErrors.value = errors

    return Object.keys(errors).length === 0
  }

  // ---- provide 注入，供递归子组件使用 ----
  provide('validationErrors', validationErrors)
  provide('updateError', updateError)

  return {
    formValues,
    validationErrors,
    updateError,
    validateForm,
  }
}
