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
  const id = ref(persisted.id)
  const username = ref(persisted.username)
  const realName = ref(persisted.realName)
  
  const orgId = ref('org01') // 固定组织

  // getters
  const displayName = computed(() => realName.value || username.value || '未登录')
  const isLoggedIn = computed(() => !!id.value)

  // actions
  function updateUser(userData) {
    if (!userData) return

    id.value = userData.id || ''
    username.value = userData.username || ''
    realName.value = userData.realName || ''

    // write-through 持久化
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      id: id.value,
      username: username.value,
      realName: realName.value,
    }))
  }

  return { id, username, realName, orgId, displayName, isLoggedIn, updateUser }
})
