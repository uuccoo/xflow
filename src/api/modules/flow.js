import request from '@/utils/request'

/**
 * 获取流程列表
 * @param {Object} params - 查询参数
 * @returns {Promise}
 */
export function getFlowList(params) {
  return request({
    url: '/flows',
    method: 'get',
    params,
  })
}

/**
 * 获取流程详情
 * @param {string|number} id - 流程ID
 * @returns {Promise}
 */
export function getFlowDetail(id) {
  return request({
    url: `/flows/${id}`,
    method: 'get',
  })
}

/**
 * 保存流程
 * @param {Object} data - 流程数据
 * @returns {Promise}
 */
export function saveFlow(data) {
  return request({
    url: '/flows',
    method: 'post',
    data,
  })
}

/**
 * 更新流程
 * @param {string|number} id - 流程ID
 * @param {Object} data - 流程数据
 * @returns {Promise}
 */
export function updateFlow(id, data) {
  return request({
    url: `/flows/${id}`,
    method: 'put',
    data,
  })
}

/**
 * 删除流程
 * @param {string|number} id - 流程ID
 * @returns {Promise}
 */
export function deleteFlow(id) {
  return request({
    url: `/flows/${id}`,
    method: 'delete',
  })
}

/**
 * 发布流程
 * @param {string|number} id - 流程ID
 * @param {Object} data - 发布参数
 * @returns {Promise}
 */
export function publishFlow(id, data) {
  return request({
    url: `/flows/${id}/publish`,
    method: 'post',
    data,
  })
}

/**
 * 获取流程节点数据
 * @param {string|number} flowId - 流程ID
 * @returns {Promise}
 */
export function getFlowNodes(flowId) {
  return request({
    url: `/flows/${flowId}/nodes`,
    method: 'get',
  })
}

/**
 * 保存流程节点数据
 * @param {string|number} flowId - 流程ID
 * @param {Object} data - 节点数据
 * @returns {Promise}
 */
export function saveFlowNodes(flowId, data) {
  return request({
    url: `/flows/${flowId}/nodes`,
    method: 'post',
    data,
  })
}

// 默认导出所有方法
export default {
  getFlowList,
  getFlowDetail,
  saveFlow,
  updateFlow,
  deleteFlow,
  publishFlow,
  getFlowNodes,
  saveFlowNodes,
}
