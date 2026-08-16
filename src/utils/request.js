import axios from 'axios'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/stores/userStore'

// 创建axios实例
const service = axios.create({
  baseURL: `${import.meta.env.VITE_SERVER_URL || ''}/api`,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json;charset=utf-8',
  },
})

// 请求拦截器
service.interceptors.request.use(
  (config) => {
    // 从 userStore 获取用户信息
    const userStore = useUserStore();

    // 添加用户ID和组织ID到请求头
    if (userStore.id) {
      config.headers['X-User-Id'] = userStore.id
    }
    if (userStore.orgId) {
      config.headers['X-Org-Id'] = userStore.orgId
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
    const { hideErrorMsg } = response.config || {}
    
    // 根据后端API的响应格式调整
    if (res.code && res.code !== 200) {
      // 如果未配置 hideErrorMsg，则显示错误提示
      if (!hideErrorMsg) {
        ElMessage.error(res.message || '请求失败')
      }

      // 处理特定错误码，如401未授权
      if (res.code === 401) {
        // 跳转到登录页或刷新token
        // 可以在这里添加登出或跳转到登录页的逻辑
      }

      return Promise.reject(new Error(res.message || '请求失败'))
    }
    
    // 直接返回 data 字段，如果没有 data 则返回整个 res
    return res.data !== undefined ? res.data : res
  },
  (error) => {
    const { hideErrorMsg } = error.config || {}
    if (!hideErrorMsg) {
      console.error('请求错误', error)
      ElMessage.error(error.message || '网络请求失败')
    }
    return Promise.reject(error)
  },
)

export default service
