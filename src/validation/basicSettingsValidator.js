import { useBasicSettingsStore } from '@/stores/basicSettingsStore'

export const BASIC_SETTINGS_FIELD = {
  // 表单名称
  FORM_NAME: 'formName',
  // 所属分组
  GROUP_ID: 'groupId',
  // 指定发起人范围
  SELECTED_INITIATORS: 'selectedInitiators',
  // 指定模板管理员
  SELECTED_ADMINS: 'selectedAdmins',
}

const saveError = (field, error) => {
  const basicStore = useBasicSettingsStore()

  if (error) {
    basicStore.errors[field] = error
  } else {
    delete basicStore.errors[field]
  }
  return error
}

const createError = (field, code, message) => ({
  module: '基础设置',
  code,
  field,
  message,
  target: { tab: 'basicSettings', field },
})

export function getErrorMessage(field) {
  const basicStore = useBasicSettingsStore()
  return basicStore.errors[field]?.message || ''
}

export function validateFormName(value) {
  if (!value || !String(value).trim()) {
    return saveError(BASIC_SETTINGS_FIELD.FORM_NAME, createError(BASIC_SETTINGS_FIELD.FORM_NAME, 'FORM_NAME_REQUIRED', '表单名称不能为空'))
  }

  return saveError(BASIC_SETTINGS_FIELD.FORM_NAME, null)
}

export function validateGroupId(value) {
  if (!value) {
    return saveError(BASIC_SETTINGS_FIELD.GROUP_ID, createError(BASIC_SETTINGS_FIELD.GROUP_ID, 'GROUP_REQUIRED', '请选择所属分组'))
  }

  return saveError(BASIC_SETTINGS_FIELD.GROUP_ID, null)
}

export function validateSelectedInitiators(value, scope) {
  if (scope !== 'specified') {
    return saveError(BASIC_SETTINGS_FIELD.SELECTED_INITIATORS, null)
  }

  if (!Array.isArray(value) || value.length === 0) {
    return saveError(BASIC_SETTINGS_FIELD.SELECTED_INITIATORS, createError(BASIC_SETTINGS_FIELD.SELECTED_INITIATORS, 'INITIATOR_REQUIRED', '请选择发起人范围'))
  }

  return saveError(BASIC_SETTINGS_FIELD.SELECTED_INITIATORS, null)
}

export function validateSelectedAdmins(value, scope) {
  if (scope !== 'specified') {
    return saveError(BASIC_SETTINGS_FIELD.SELECTED_ADMINS, null)
  }

  if (!Array.isArray(value) || value.length === 0) {
    return saveError(BASIC_SETTINGS_FIELD.SELECTED_ADMINS, createError(BASIC_SETTINGS_FIELD.SELECTED_ADMINS, 'ADMIN_REQUIRED', '请选择模板管理员'))
  }

  return saveError(BASIC_SETTINGS_FIELD.SELECTED_ADMINS, null)
}

export function validateBasicSettings(basicSettings = {}) {
  const checks = [
    validateFormName(basicSettings.formName),
    validateGroupId(basicSettings.groupId),
    validateSelectedInitiators(
      basicSettings.selectedInitiators,
      basicSettings.initiatorScope,
    ),
    validateSelectedAdmins(
      basicSettings.selectedAdmins,
      basicSettings.adminScope,
    ),
  ]

  return checks.filter(Boolean)
}
