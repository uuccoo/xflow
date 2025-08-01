import { defineStore } from 'pinia'

// 定义用户信息存储
export const useUserStore = defineStore('user', {
  state: () => ({
    id: 'user01',
    username: '',
    realName: '张三'
  }),
  
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
    },

    // 从本地存储初始化用户信息
    initFromLocalStorage() {
      const userId = localStorage.getItem('userId');
      const username = localStorage.getItem('username');
      const realName = localStorage.getItem('realName');
      
      if (userId) {
        this.id = userId;
        this.username = username || '';
        this.realName = realName || '';
      }
    }
  }
})
