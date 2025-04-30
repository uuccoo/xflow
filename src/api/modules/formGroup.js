import request from '@/utils/request'

/**
 * 获取表单分组列表
 */
export function getFormGroupList() {
  return request({
    url: '/form-groups',
    method: 'get'
  })
}

/**
 * 创建表单分组
 * @param {Object} data 分组数据 {name, sortOrder}
 */
export function createFormGroup(data) {
  return request({
    url: '/form-groups',
    method: 'post',
    data
  })
}

/**
 * 更新表单分组
 * @param {String} id 分组ID
 * @param {Object} data 分组数据 {name, sortOrder}
 */
export function updateFormGroup(id, data) {
  return request({
    url: `/form-groups/${id}`,
    method: 'put',
    data
  })
}

/**
 * 删除表单分组
 * @param {String} id 分组ID
 */
export function deleteFormGroup(id) {
  return request({
    url: `/form-groups/${id}`,
    method: 'delete'
  })
}

export default {
  getFormGroupList,
  createFormGroup,
  updateFormGroup,
  deleteFormGroup
}
