import { defineStore } from 'pinia'

// 默认演示用户
const DEFAULT_USER = {
  id: 'user01',
  username: '',
  realName: '张三',
  orgId: 'org01',
}

// 从 localStorage 恢复状态（仅用于页面刷新后恢复，外部不应直接读写 localStorage）
const STORAGE_KEY = 'currentUser'
const persisted = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null') || DEFAULT_USER

// 定义用户信息存储（唯一数据源）
export const useUserStore = defineStore('user', {
  state: () => ({ ...persisted }),

  getters: {
    // 用于显示的名称
    displayName: (state) => state.realName || state.username || '未登录',
    // 是否已登录
    isLoggedIn: (state) => !!state.id
  },

  actions: {
    // 更新用户信息
    updateUser(userData) {
      if (!userData) return;

      this.id = userData.id || '';
      this.username = userData.username || '';
      this.realName = userData.realName || '';
      this.orgId = userData.orgId || '';

      // write-through 持久化
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        id: this.id,
        username: this.username,
        realName: this.realName,
        orgId: this.orgId,
      }));
    }
  }
})
