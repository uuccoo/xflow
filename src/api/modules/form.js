import request from '@/utils/request'

/**
 * 获取表单列表
 * @param {Object} params - 查询参数
 * @returns {Promise}
 */
export function getFormList(params) {
  return request({
    url: '/forms',
    method: 'get',
    params,
  })
}

/**
 * 获取表单详情
 * @param {string|number} id - 表单ID
 * @returns {Promise}
 */
export function getFormDetail(id) {
  return request({
    url: `/forms/${id}`,
    method: 'get',
  })
}

/**
 * 保存表单
 * @param {Object} data - 表单数据
 * @returns {Promise}
 */
export function saveForm(data) {
  return request({
    url: '/forms',
    method: 'post',
    data,
  })
}

/**
 * 更新表单
 * @param {string|number} id - 表单ID
 * @param {Object} data - 表单数据
 * @returns {Promise}
 */
export function updateForm(id, data) {
  return request({
    url: `/forms/${id}`,
    method: 'put',
    data,
  })
}

/**
 * 删除表单
 * @param {string|number} id - 表单ID
 * @returns {Promise}
 */
export function deleteForm(id) {
  return request({
    url: `/forms/${id}`,
    method: 'delete',
  })
}

/**
 * 发布表单
 * @param {string|number} id - 表单ID
 * @param {Object} data - 发布参数
 * @returns {Promise}
 */
export function publishForm(id, data) {
  return request({
    url: `/forms/${id}/publish`,
    method: 'post',
    data,
  })
}
