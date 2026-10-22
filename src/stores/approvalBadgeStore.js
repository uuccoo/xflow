import { defineStore } from 'pinia'
import { approvalCenterApi } from '@/api'

// 定义审批徽章存储
export const useApprovalBadgeStore = defineStore('approvalBadge', {
  state: () => ({
    // 待我审批的数量
    pendingApprovalCount: 0,
    // 抄送给我未读的数量
    ccToMeCount: 0,
  }),
  
  getters: {
    // 待我审批数量
    getPendingCount: (state) => state.pendingApprovalCount,
    // 抄送未读数量
    getCcCount: (state) => state.ccToMeCount,
  },
  
  actions: {
    // 获取徽章数量
    async fetchBadgeCounts() {
      try {
        const data = await approvalCenterApi.getBadgeCounts()
        if (data) {
          this.pendingApprovalCount = data.pendingApprovalCount || 0
          this.ccToMeCount = data.ccToMeCount || 0
        }
      } catch (error) {
        console.error('获取徽章数量失败', error)
      }
    },
    
    // 重置徽章数量
    resetBadgeCounts() {
      this.pendingApprovalCount = 0
      this.ccToMeCount = 0
    }
  }
})
