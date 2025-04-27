import { defineStore } from 'pinia'
import { reactive, ref } from 'vue'

export const useBasicSettingsStore = defineStore('basicSettings', () => {
  // 表单图标和颜色
  const iconColor = ref('#FF8800') // 默认橙色
  const selectedIcon = ref('Promotion') // 默认选择的图标

  // 表单基础信息
  const formInfo = reactive({
    name: '', // 表单名称
    groupValue: '', // 所在分组
    description: '', // 表单说明
  })

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
    formInfo,

    // 发起人设置
    initiatorScope,
    selectedInitiators,

    // 管理员设置
    adminScope,
    selectedAdmins,
  }
})
