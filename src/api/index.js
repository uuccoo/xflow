import flow from './modules/flow'
import form from './modules/form'
import user from './modules/user'

// 重命名导出
export const formApi = form
export const flowApi = flow
export const userApi = user

// 导出默认API对象
export default {
  form,
  flow,
  user,
}
