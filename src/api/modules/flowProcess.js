import request from '@/utils/request'

export default {
  /**
   * 提交表单并启动流程
   * @param {Object} data - 提交数据
   * @param {String} data.formId - 表单ID
   * @param {Object} data.formData - 表单数据（JSON对象）
   * @param {String} data.formPermissionId - 表单权限ID（可选）
   * @returns {Promise<Object>}
   */
  startFlow(data) {
    return request({
      url: '/flow/start',
      method: 'post',
      data,
    })
  },

  /**
   * 修改表单任务
   * @param {Object} data - 修改数据
   * @param {String} data.formInstanceId - 表单实例ID
   * @param {Object} data.formData - 修改后的表单数据
   * @param {String} data.formPermissionId - 表单权限ID（可选）
   * @returns {Promise<Object>}
   */
  modifyTask(data) {
    return request({
      url: '/flow/tasks/modify',
      method: 'post',
      data,
    })
  },

  /**
   * 审批任务
   * @param {Object} data - 审批数据
   * @param {String} data.taskId - 任务ID
   * @param {Boolean} data.approved - 是否通过：true-通过，false-拒绝
   * @param {String} data.comment - 审批意见（可选）
   * @returns {Promise<Object>}
   */
  approveTask(data) {
    return request({
      url: '/flow/tasks/approve',
      method: 'post',
      data,
    })
  },

  /**
   * 评论任务
   * @param {Object} data - 评论数据
   * @param {String} data.formInstanceId - 表单实例ID
   * @param {String} data.comment - 评论内容
   * @returns {Promise<Object>}
   */
  commentTask(data) {
    return request({
      url: '/flow/tasks/comment',
      method: 'post',
      data,
    })
  },

  /**
   * 转交任务
   * @param {Object} data - 转交数据
   * @param {String} data.taskId - 任务ID
   * @param {String} data.targetUserId - 目标用户ID
   * @param {String} data.comment - 转交说明（可选）
   * @returns {Promise<Object>}
   */
  transferTask(data) {
    return request({
      url: '/flow/tasks/transfer',
      method: 'post',
      data,
    })
  },

  /**
   * 回退任务
   * @param {Object} data - 回退数据
   * @param {String} data.taskId - 当前任务ID
   * @param {String} data.targetTaskId - 目标任务ID（回退到的任务）
   * @param {String} data.comment - 回退说明（可选）
   * @returns {Promise<Object>}
   */
  returnTask(data) {
    return request({
      url: '/flow/tasks/return',
      method: 'post',
      data,
    })
  },

  /**
   * 获取可回退的任务列表
   * @param {String} taskId - 当前任务ID
   * @returns {Promise<Object>}
   */
  getReturnableTasks(taskId) {
    return request({
      url: `/flow/tasks/${taskId}/returnable`,
      method: 'get',
    })
  },

  /**
   * 取消流程
   * @param {String} formInstanceId - 表单实例ID
   * @returns {Promise<Object>}
   */
  cancelFlow(formInstanceId) {
    return request({
      url: `/flow/${formInstanceId}/cancel`,
      method: 'delete',
    })
  },

  /**
   * 管理员转交任务
   * @param {Object} data - 转交数据
   * @param {String} data.processInstanceId - 流程实例ID
   * @param {String} data.originalUserId - 原用户ID
   * @param {String} data.targetUserId - 目标用户ID
   * @returns {Promise<Object>}
   */
  adminTransferTask(data) {
    return request({
      url: '/flow/tasks/admin-transfer',
      method: 'post',
      data,
    })
  },

  /**
   * 加签（动态增补当前节点多实例处理人）
   * @param {Object} data - 加签数据
   * @param {String} data.taskId - 任务ID
   * @param {String[]} data.userIds - 加签用户ID列表
   * @param {String} data.reason - 加签原因（可选）
   * @returns {Promise<Object>}
   */
  addSignTask(data) {
    return request({
      url: '/flow/tasks/add-sign',
      method: 'post',
      data,
    })
  },
}
