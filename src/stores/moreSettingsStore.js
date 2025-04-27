import { defineStore } from 'pinia'
import { reactive } from 'vue'

export const useMoreSettingsStore = defineStore('moreSettings', () => {
  // 更多设置数据
  const settings = reactive({
    // 这里可以添加更多设置相关的数据
    // 当 MoreSettings.vue 组件扩展时，可以将相关数据放在这里
    // 例如：
    // notificationSettings: {
    //   sendEmail: false,
    //   sendSMS: false,
    // },
    // permissionSettings: {
    //   allowEdit: true,
    //   allowDelete: false,
    // }
  })

  return {
    settings,
  }
})
