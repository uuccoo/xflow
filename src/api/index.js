// 统一导出所有API模块
import * as formApi from './modules/form'
import * as flowApi from './modules/flow'
import * as userApi from './modules/user'

// 导出所有API模块
export { formApi, flowApi, userApi }

// 导出默认API对象
export default {
  form: formApi,
  flow: flowApi,
  user: userApi,
}
