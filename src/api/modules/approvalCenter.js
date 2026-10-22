import request from '@/utils/request'

export default {
  /**
   * 获取我发起的表单实例列表
   * @param {Object} params - 查询参数
   * @param {String} params.formId - 表单ID（可选）
   * @param {Number} params.status - 状态（可选）
   * @param {String} params.keyword - 关键字（可选）
   * @param {Number} params.page - 页码，从1开始（默认：1）
   * @param {Number} params.pageSize - 每页大小（默认：10）
   * @returns {Promise<Object>}
   */
  getMyInitiations(params) {
    return request({
      url: '/approval-center/my-initiations',
      method: 'post',
      data: params,
    })
  },

  /**
   * 获取待我审批任务列表
   * @param {Object} params - 查询参数
   * @param {String} params.formId - 表单ID（可选）
   * @param {String} params.keyword - 关键字（可选）
   * @param {Number} params.page - 页码，从1开始（默认：1）
   * @param {Number} params.pageSize - 每页大小（默认：10）
   * @returns {Promise<Object>}
   */
  getPendingTasks(params) {
    return request({
      url: '/approval-center/pending-tasks',
      method: 'post',
      data: params,
    })
  },

  /**
   * 获取我已审批任务列表
   * @param {Object} params - 查询参数
   * @param {String} params.formId - 表单ID（可选）
   * @param {String} params.keyword - 关键字（可选）
   * @param {Number} params.page - 页码，从1开始（默认：1）
   * @param {Number} params.pageSize - 每页大小（默认：10）
   * @returns {Promise<Object>}
   */
  getApprovedByMe(params) {
    return request({
      url: '/approval-center/approved-by-me',
      method: 'post',
      data: params,
    })
  },

  /**
   * 获取抄送给我的任务列表
   * @param {Object} params - 查询参数
   * @param {String} params.formId - 表单ID（可选）
   * @param {Number} params.status - 状态（可选）
   * @param {String} params.keyword - 关键字（可选）
   * @param {String} params.initiatorId - 发起人ID（可选）
   * @param {String} params.initiatedStartDate - 发起时间开始（可选）
   * @param {String} params.initiatedEndDate - 发起时间结束（可选）
   * @param {String} params.finishedStartDate - 完成时间开始（可选）
   * @param {String} params.finishedEndDate - 完成时间结束（可选）
   * @param {Number} params.page - 页码，从1开始（默认：1）
   * @param {Number} params.pageSize - 每页大小（默认：10）
   * @returns {Promise<Object>}
   */
  getCcToMe(params) {
    return request({
      url: '/approval-center/cc-to-me',
      method: 'post',
      data: params,
    })
  },

  /**
   * 标记抄送记录已读
   * @param {String} ccRecordId - 抄送记录ID
   * @returns {Promise<Object>}
   */
  markCcRead(ccRecordId) {
    return request({
      url: `/approval-center/mark-cc-read/${ccRecordId}`,
      method: 'post',
    })
  },

  /**
   * 全部标记抄送为已读
   * @returns {Promise<Object>}
   */
  markCcReadAll() {
    return request({
      url: '/approval-center/mark-cc-read-all',
      method: 'post',
    })
  },

  /**
   * 获取任务详情
   * @param {Object} data - 请求数据
   * @param {String} data.formInstanceId - 表单实例ID
   * @param {String} data.taskId - 任务ID（可选）
   * @param {String} data.tabType - 标签类型
   * @returns {Promise<Object>}
   */
  getTaskDetail(data) {
    return request({
      url: '/approval-center/task-detail',
      method: 'post',
      data,
    })
  },

  /**
   * 获取任务徽章数量
   * @returns {Promise<Object>} 返回待我审批和抄送我的未读数量
   */
  getBadgeCounts() {
    return request({
      url: '/approval-center/badge-counts',
      method: 'get',
    })
  },
}
