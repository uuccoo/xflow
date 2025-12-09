import request from '@/utils/request'

/**
 * 表单相关API
 */
export default {
  /**
   * 获取表单列表
   * @param {Object} params 查询参数
   * @returns {Promise<Object>}
   */
  getFormList(params) {
    return request({
      url: '/forms',
      method: 'get',
      params,
    })
  },

  /**
   * 获取表单详情
   * @param {String} id 表单ID
   * @returns {Promise<Object>}
   */
  getFormDetail(id) {
    return request({
      url: `/forms/${id}`,
      method: 'get',
    })
  },

  /**
   * 根据表单编码获取表单详情
   * @param {String} code 表单编码
   * @returns {Promise<Object>}
   */
  getFormByCode(code) {
    return request({
      url: `/forms/code/${code}`,
      method: 'get',
    })
  },

  /**
   * 创建新表单
   * @param {Object} data 表单数据
   * @returns {Promise<Object>}
   */
  saveForm(data) {
    return request({
      url: '/forms',
      method: 'post',
      data,
    })
  },

  /**
   * 更新表单
   * @param {String} id 表单ID
   * @param {Object} data 表单数据
   * @returns {Promise<Object>}
   */
  updateForm(id, data) {
    return request({
      url: `/forms/${id}`,
      method: 'put',
      data,
    })
  },

  /**
   * 删除表单
   * @param {String} id 表单ID
   * @returns {Promise<Object>}
   */
  deleteForm(id) {
    return request({
      url: `/forms/${id}`,
      method: 'delete',
    })
  },

  /**
   * 启用表单
   * @param {String} id 表单ID
   * @returns {Promise<Object>}
   */
  enableForm(id) {
    return request({
      url: `/forms/${id}/enable`,
      method: 'put',
    })
  },

  /**
   * 停用表单
   * @param {String} id 表单ID
   * @returns {Promise<Object>}
   */
  disableForm(id) {
    return request({
      url: `/forms/${id}/disable`,
      method: 'put',
    })
  },

  /**
   * 获取表单历史版本
   * @param {String} id 表单ID
   * @returns {Promise<Object>}
   */
  getFormVersions(id) {
    return request({
      url: `/forms/${id}/versions`,
      method: 'get',
    })
  },

  /**
   * 批量更新表单分组
   * @param {Object} data 包含formIds和groupId
   * @returns {Promise<Object>}
   */
  batchUpdateGroup(data) {
    return request({
      url: '/forms/batch-update-group',
      method: 'post',
      data,
    })
  },

  /**
   * 批量更新表单排序
   * @param {Array<String>} formIds 表单ID列表，按照列表顺序进行排序
   * @returns {Promise<Object>}
   */
  updateFormSortOrders(formIds) {
    return request({
      url: '/forms/sort-orders',
      method: 'put',
      data: formIds,
    })
  },

  /**
   * 批量停用表单
   * @param {Array<String>} formIds 表单ID列表
   * @returns {Promise<Object>}
   */
  batchDisableForms(formIds) {
    return request({
      url: '/forms/batch-disable',
      method: 'put',
      data: formIds,
    })
  },
}
