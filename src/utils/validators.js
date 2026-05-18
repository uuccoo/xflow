// 身份证校验工具
import { PHONE_AREA_CODES } from '@/constants/phoneAreaCodes'
export const validateIdCard = (val) => {
  if (!val) return ''
  const pattern = /^[1-9]\d{5}(?:19|20)?\d{2}(?:0[1-9]|1[0-2])(?:0[1-9]|[12]\d|3[01])\d{3}[\dXx]?$/
  return pattern.test(val) ? '' : '身份证号格式不正确'
}

// 手机号校验工具
export const validatePhone = (value) => {
  // 现在假定传入值已是标准对象 { areaCode, number }
  const { areaCode, number } = value || {}

  if (!number) return ''

  if (areaCode === '+86') {
    return /^1[3-9]\d{9}$/.test(number) ? '' : '手机号格式不正确'
  }

  return ''; // 对于其他国家/地区的号码暂不进行格式校验，直接返回 空字符串表示校验通过
}

export default {
  validateIdCard,
  validatePhone,
}
