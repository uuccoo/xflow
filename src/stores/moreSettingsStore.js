import { defineStore } from 'pinia'
import { reactive } from 'vue'

export const useMoreSettingsStore = defineStore('moreSettings', () => {
  // 创建默认更多设置（工厂函数，避免默认对象被复用导致引用串改）
  const createDefaultMoreSettings = () => {
    return {
      enabled: true,
      options: {},
    }
  }

  // 更多设置数据
  const settings = reactive(createDefaultMoreSettings())

  // 重置更多设置
  // 注意：这里用 Object.assign 保持 settings 的响应式引用不变
  const resetMoreSettings = () => {
    Object.assign(settings, createDefaultMoreSettings())
  }

  // 加载更多设置（全量覆盖，用于加载接口数据）
  // 注意：建议在外层切换表单时先 reset，再调用该方法
  const loadMoreSettings = (data) => {
    Object.assign(settings, data || {})
    return true
  }

  // 导出更多设置（用于预览/发布组装）
  const toPayload = () => ({
    ...settings,
  })

  return {
    settings,
    resetMoreSettings,
    loadMoreSettings,
    toPayload,
  }
})
