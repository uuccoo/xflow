import flow from './modules/flow'
import form from './modules/form'
import user from './modules/user'
import formGroup from './modules/formGroup'
import upload from './modules/upload'

// 重命名导出
export const formApi = form
export const flowApi = flow
export const userApi = user
export const formGroupApi = formGroup
export const uploadApi = upload

// 导出默认API对象
export default {
  form,
  flow,
  user,
  formGroup,
  upload,
}
