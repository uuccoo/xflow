/**
 * 环境相关的工具函数
 */

/**
 * 判断当前是否为开发环境
 * @returns {boolean} 是否为开发环境
 */
export const isDevelopment = () => process.env.NODE_ENV === 'development';

/**
 * 判断当前是否为生产环境
 * @returns {boolean} 是否为生产环境
 */
export const isProduction = () => process.env.NODE_ENV === 'production';

/**
 * 判断当前是否为测试环境
 * @returns {boolean} 是否为测试环境
 */
export const isTest = () => process.env.NODE_ENV === 'test';
