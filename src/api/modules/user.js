import request from '@/utils/request'

/**
 * 用户登录
 * @param {Object} data - 登录参数
 * @returns {Promise}
 */
export function login(data) {
  return request({
    url: '/auth/login',
    method: 'post',
    data,
  })
}

/**
 * 用户登出
 * @returns {Promise}
 */
export function logout() {
  return request({
    url: '/auth/logout',
    method: 'post',
  })
}

/**
 * 获取用户信息
 * @returns {Promise}
 */
export function getUserInfo() {
  return request({
    url: '/users/info',
    method: 'get',
  })
}

/**
 * 获取用户列表
 * @param {Object} params - 查询参数
 * @returns {Promise}
 */
export function getUserList(params) {
  return request({
    url: '/users',
    method: 'get',
    params,
  })
}

/**
 * 获取部门列表
 * @param {Object} params - 查询参数
 * @returns {Promise}
 */
export function getDepartmentList(params) {
  return request({
    url: '/departments',
    method: 'get',
    params,
  })
}

/**
 * 获取角色列表
 * @param {Object} params - 查询参数
 * @returns {Promise}
 */
export function getRoleList(params) {
  return request({
    url: '/roles',
    method: 'get',
    params,
  })
}

/**
 * 获取权限列表
 * @returns {Promise}
 */
export function getPermissions() {
  return request({
    url: '/permissions',
    method: 'get',
  })
}

/**
 * 获取组织架构树
 * @returns {Promise}
 */
export function getOrganizationTree() {
  return request({
    url: '/organizations/tree',
    method: 'get',
  })
}

// 默认导出所有方法
export default {
  login,
  logout,
  getUserInfo,
  getUserList,
  getDepartmentList,
  getRoleList,
  getPermissions,
  getOrganizationTree,
}
