import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

// 默认演示用户
const DEFAULT_USER = {
  id: 'user01',
  username: '',
  realName: '张三',
}

// 持久化配置
const STORAGE_KEY = 'currentUser'
// 初始化用户信息
const persisted = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null') || DEFAULT_USER

// 用户信息存储（唯一数据源）
export const useUserStore = defineStore('user', () => {
  // state
  const user = ref(persisted)
  
  const orgId = ref('org01') // 固定组织

  // getters
  const displayName = computed(() => user.value.realName || user.value.username || '未登录')
  const isLoggedIn = computed(() => !!user.value.id)

  // actions
  function updateUser(userData) {
    if (!userData) return

    user.value = userData

    // write-through 持久化
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user.value))
  }

  return { user, orgId, displayName, isLoggedIn, updateUser }
})
