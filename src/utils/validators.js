// 身份证校验工具
export const validateIdCard = (val) => {
  if (!val) return ''
  const pattern = /^[1-9]\d{5}(?:19|20)?\d{2}(?:0[1-9]|1[0-2])(?:0[1-9]|[12]\d|3[01])\d{3}[\dXx]?$/
  return pattern.test(val) ? '' : '身份证号格式不正确'
}

export default {
  validateIdCard,
}
