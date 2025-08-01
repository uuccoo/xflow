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
    
    // 从本地存储获取用户ID
    let userId = localStorage.getItem('userId')
    console.log('当前用户ID:', userId)
    
    try {
      // 获取 Pinia Store 中的用户信息
      const userStore = useUserStore();
      
      if (userId) {
        // 如果localStorage中有userId，检查与userStore中的id是否一致
        if (userId !== userStore.id) {
          console.log('本地存储与Pinia Store用户ID不一致，正在同步...');
          // 从localStorage获取用户信息并更新userStore
          const username = localStorage.getItem('username') || '';
          const realName = localStorage.getItem('realName') || '';
          
          // 更新userStore
          userStore.updateUser({
            id: userId,
            username: username,
            realName: realName
          });
        }
      } else if (userStore.id) {
        // 如果localStorage没有userId但userStore有，则使用userStore的值
        userId = userStore.id;
        console.log('从Pinia获取到用户ID:', userId);
      }
    } catch (error) {
      console.error('用户信息处理失败', error)
    }
    
    // 如果有用户ID，则设置到请求头中
    if (userId) {
      config.headers['X-User-Id'] = userId
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
