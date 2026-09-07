import { v4 as uuidv4 } from 'uuid'

/**
 * ID生成工具类
 */

/**
 * 生成唯一ID（时间戳 + 随机字符）
 * 主要方法，推荐在所有需要生成ID的场景中使用
 * @returns {string} UUID字符串
 */
export const generateUniqueId = () => {
  return uuidv4()
}

/**
 * 生成带前缀的ID（可选，用于需要语义化标识的场景）
 * @param {string} prefix - ID前缀
 * @returns {string} 带前缀的唯一ID
 */
export const generatePrefixedId = (prefix = 'id') => {
  return `${prefix}_${generateUniqueId()}`
}
