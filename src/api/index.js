import flow from './modules/flow'
import form from './modules/form'
import user from './modules/user'
import formGroup from './modules/formGroup'
import upload from './modules/upload'
import flowProcess from './modules/flowProcess'
import flowSteps from './modules/flowSteps'
import approvalCenter from './modules/approvalCenter'

// 重命名导出
export const formApi = form
export const flowApi = flow
export const userApi = user
export const formGroupApi = formGroup
export const uploadApi = upload
export const flowProcessApi = flowProcess
export const flowStepsApi = flowSteps
export const approvalCenterApi = approvalCenter

// 导出默认API对象
export default {
  form,
  flow,
  user,
  formGroup,
  upload,
  flowProcess,
  flowSteps,
  approvalCenter,
}
