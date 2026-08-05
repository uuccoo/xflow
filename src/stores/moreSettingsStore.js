import { defineStore } from 'pinia'
import { reactive } from 'vue'

export const useMoreSettingsStore = defineStore('moreSettings', () => {
  // 更多设置数据
  const settings = reactive({
    enabled: true,
    options: {},
  })

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
    loadMoreSettings,
    toPayload,
  }
})
