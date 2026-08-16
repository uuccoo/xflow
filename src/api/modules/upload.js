import request from '@/utils/request'

/**
 * 文件/图片上传相关 API
 */
export default {
  /**
   * 上传图片（仅允许图片格式）
   * @param {File} file - 原生 File 对象
   * @returns {Promise<Object>} { id, name, url, size }
   */
  uploadImage(file) {
    const formData = new FormData()
    formData.append('file', file)
    return request({
      url: '/upload/image',
      method: 'post',
      data: formData,
      // 删除默认 application/json，让浏览器自动设置 multipart/form-data + boundary
      headers: {
        'Content-Type': null,
      },
      // 上传接口单独加大超时，应对慢网速大文件
      timeout: 60000,
    })
  },

  /**
   * 上传通用文件（除脚本外的普通文件）
   * @param {File} file - 原生 File 对象
   * @returns {Promise<Object>} { id, name, url, size }
   */
  uploadFile(file) {
    const formData = new FormData()
    formData.append('file', file)
    return request({
      url: '/upload/file',
      method: 'post',
      data: formData,
      headers: {
        'Content-Type': null,
      },
      timeout: 120000,
    })
  },
}
