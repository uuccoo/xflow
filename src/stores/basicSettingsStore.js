import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useBasicSettingsStore = defineStore('basicSettings', () => {
  // 表单图标和颜色
  const iconColor = ref('#FF8800') // 默认橙色
  const selectedIcon = ref('Promotion') // 默认选择的图标

  // 表单基础信息
  const id = ref('') // 表单ID
  const formName = ref('') // 表单名称
  const formCode = ref('') // 表单编码
  const groupId = ref('') // 所在分组ID
  const description = ref('') // 表单说明
  const formVersion = ref('') // 表单版本

  // 发起人范围设置
  const initiatorScope = ref('all')
  const selectedInitiators = ref([])

  // 模板管理员设置
  const adminScope = ref('all')
  const selectedAdmins = ref([])

  return {
    // 表单样式相关
    iconColor,
    selectedIcon,

    // 表单基础信息
    id,
    formName,
    formCode,
    groupId,
    description,
    formVersion,

    // 发起人设置
    initiatorScope,
    selectedInitiators,

    // 管理员设置
    adminScope,
    selectedAdmins,
  }
})
