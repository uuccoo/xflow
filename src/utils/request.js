import axios from 'axios'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/stores/userStore'

// 创建axios实例
const service = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json;charset=utf-8',
  },
})

// 请求拦截器
service.interceptors.request.use(
  (config) => {
    // 从本地存储获取token
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    
    // 从本地存储或 userStore 获取用户ID 和 组织ID（简化）
    const userStore = useUserStore();
    const userId = localStorage.getItem('userId') || userStore.id || '';
    const orgId = localStorage.getItem('orgId') || userStore.orgId || '';
    
    // 检查并同步 userStore 中的数据（localStorage 为主）
    // 检查是否需要更新userStore
    const needUpdate = (userId && userId !== userStore.id) || (orgId && orgId !== userStore.orgId);
    if (needUpdate) {
      console.log('本地存储与Pinia Store数据不一致，正在同步...');

      // 从 localStorage 获取完整的用户信息，fallback 到 userStore
      const username = localStorage.getItem('username') || userStore.username || '';
      const realName = localStorage.getItem('realName') || userStore.realName || '';

      // 更新 userStore
      userStore.updateUser({
        id: userId,
        username: username,
        realName: realName,
        orgId: orgId
      });
    }
    
    // 如果有用户ID，则设置到请求头中
    if (userId) {
      config.headers['X-User-Id'] = userId
    }
    
    // 如果有用户组织ID，则设置到请求头中
    if (orgId) {
      config.headers['X-Org-Id'] = orgId
    }
    
    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

// 响应拦截器
service.interceptors.response.use(
  (response) => {
    const res = response.data
    // 根据后端API的响应格式调整
    if (res.code && res.code !== 200) {
      ElMessage.error(res.message || '请求失败')

      // 处理特定错误码，如401未授权
      if (res.code === 401) {
        // 跳转到登录页或刷新token
        // 可以在这里添加登出或跳转到登录页的逻辑
      }

      return Promise.reject(new Error(res.message || '请求失败'))
    } else {
      return res
    }
  },
  (error) => {
    console.error('请求错误', error)
    ElMessage.error(error.message || '网络请求失败')
    return Promise.reject(error)
  },
)

export default service
