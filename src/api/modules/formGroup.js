import request from '@/utils/request'

/**
 * 获取表单分组列表
 */
export function getFormGroupList() {
  return request({
    url: '/form-groups',
    method: 'get',
  })
}

/**
 * 获取带表单列表的表单分组
 * @param {String} keyword 可选的搜索关键字，根据表单名称进行筛选
 * @param {Boolean} manager 可选参数，是否只获取管理员相关的表单分组
 */
export function getFormGroupsWithForms(keyword, manager) {
  return request({
    url: '/form-groups/with-forms',
    method: 'get',
    params: {
      ...(keyword ? { keyword } : {}),
      ...(manager !== undefined ? { manager } : {}),
    },
  });
}

/**
 * 创建表单分组
 * @param {Object} data 分组数据 {name, sortOrder}
 */
export function createFormGroup(data) {
  return request({
    url: '/form-groups',
    method: 'post',
    data,
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
    data,
  })
}

/**
 * 删除表单分组
 * @param {String} id 分组ID
 */
export function deleteFormGroup(id) {
  return request({
    url: `/form-groups/${id}`,
    method: 'delete',
  })
}

export default {
  getFormGroupList,
  getFormGroupsWithForms,
  createFormGroup,
  updateFormGroup,
  deleteFormGroup,
}
