import request from '@/utils/request'

export default {
  /**
   * 预览流程步骤
   * @param {Object} data - 预览数据
   * @param {String} data.formId - 表单ID
   * @param {Object} data.formData - 表单数据（JSON对象）
   * @returns {Promise<Object>} 返回流程步骤预览数据
   */
  previewFlowSteps(data) {
    return request({
      url: '/flow-steps/preview',
      method: 'post',
      data,
    })
  },

  /**
   * 获取查看模式流程步骤（已完成 + 待完成）
   * @param {String} formInstanceId - 表单实例ID
   * @returns {Promise<Object>}
   */
  getFlowStepsForView(formInstanceId) {
    return request({
      url: '/flow-steps/view',
      method: 'get',
      params: { formInstanceId },
    })
  },

  /**
   * 获取编辑模式流程步骤（实时预览）
   * @param {Object} data - 请求数据
   * @param {String} data.formInstanceId - 表单实例ID
   * @param {Object} data.formData - 当前表单数据
   * @returns {Promise<Object>}
   */
  getFlowStepsForEdit(data) {
    return request({
      url: '/flow-steps/edit',
      method: 'post',
      data,
    })
  },
}
