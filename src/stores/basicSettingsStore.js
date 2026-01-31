import { defineStore } from 'pinia'
import { reactive, ref } from 'vue'

export const useBasicSettingsStore = defineStore('basicSettings', () => {
  // 创建默认基础设置（工厂函数，避免数组等引用被复用导致串改）
  const createDefaultBasicSettings = () => {
    return {
      // 表单图标和颜色
      iconColor: '#FF8800', // 表单图标背景色
      selectedIcon: 'Promotion', // 当前选择的图标
      // 表单基础信息
      formName: '', // 表单名称
      groupId: '', // 所属分组ID
      description: '', // 表单说明
      // 发起人范围设置
      initiatorScope: 'all', // 发起人范围
      selectedInitiators: [], // 指定发起人列表
      // 模板管理员设置
      adminScope: 'all', // 模板管理员范围
      selectedAdmins: [], // 指定管理员列表
    }
  }

  // 表单ID（单独字段，避免混入基础设置对象）
  const id = ref('')
  // 表单编码（单独字段，避免混入基础设置对象）
  const formCode = ref('')
  // 表单版本（单独字段，避免混入基础设置对象）
  const formVersion = ref('')

  // 重置表单元信息（ID/编码/版本）
  const resetFormMeta = () => {
    id.value = ''
    formCode.value = ''
    formVersion.value = ''
  }

  // 加载表单元信息（不做历史兼容回退）
  // 入参直接接收多个字段，避免调用方再组装对象
  const loadFormMeta = (newId, newFormCode, newFormVersion) => {
    id.value = newId || ''
    formCode.value = newFormCode || ''
    formVersion.value = newFormVersion || ''
  }

  // 基础设置状态（统一放在一个对象中，便于重置/加载/导出）
  const basicSettings = reactive(createDefaultBasicSettings())

  // 重置基础设置
  const resetBasicSettings = () => {
    Object.assign(basicSettings, createDefaultBasicSettings())
  }

  // 加载基础设置（全量覆盖）
  // 入参只接收 basicSettings 对象，避免依赖接口详情整体结构
  // 注意：建议在外层切换表单时先 reset，再调用该方法
  const loadBasicSettings = (payload) => {
    Object.assign(basicSettings, payload || {})
  }

  // 导出基础设置数据（用于发布等场景的组装）
  const toPayload = () => ({
    ...basicSettings,
  })

  return {
    basicSettings,
    id,
    formCode,
    formVersion,

    // 方法
    resetBasicSettings,
    loadBasicSettings,
    toPayload,

    // 元信息方法
    resetFormMeta,
    loadFormMeta,
  }
})
