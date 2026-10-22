/**
 * 判断表单值是否“空”。
 * 约定：`null/undefined/空字符串/空数组` 视为空；其他值（含 0、false）不视为空。
 */
export const isEmptyValue = (value) => {
  if (value === null || value === undefined) return true
  if (typeof value === 'string' && value.trim() === '') return true
  if (Array.isArray(value) && value.length === 0) return true
  return false
}

/**
 * 将单选/多选的 value 映射为对应的 option.label。
 * 约定：不做类型兼容（严格 `===` 匹配）；未匹配到则回退返回原 value。
 */
const findOptionLabel = (component, value) => {
  const options = component?.options
  if (!Array.isArray(options) || options.length === 0) {
    return value
  }

  const matched = options.find((opt) => opt?.value === value)
  if (matched) {
    return matched?.label ?? value
  }

  return value
}

const formatMeridiem = (value) => {
  if (value === 'pm') return '下午'
  if (value === 'am') return '上午'
  return ''
}

const parseDateDisplayValue = (value) => {
  if (isEmptyValue(value)) return ''

  if (typeof value === 'object' && !Array.isArray(value)) {
    const date = value?.date
    if (isEmptyValue(date)) return ''

    const meridiem = formatMeridiem(value?.meridiem)
    return meridiem ? `${date} ${meridiem}` : parseToString(date)
  }

  return parseToString(value)
}

export const getDateRangeDisplayFields = (component, value) => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return []
  }

  const fields = [
    {
      key: 'start',
      label: component?.startLabel || '开始时间',
      display: parseDateDisplayValue(value?.startDate),
    },
    {
      key: 'end',
      label: component?.endLabel || '结束时间',
      display: parseDateDisplayValue(value?.endDate),
    },
  ]

  return fields.filter((field) => !isEmptyValue(field.display))
}

/**
 * 将值统一转换为字符串（通用处理方法）。
 * 约定：null/undefined 返回空字符串，其他值调用 String() 转换。
 */
export const parseToString = (value) => {
  if (value === null || value === undefined) return ''
  return String(value)
}

/**
 * 单选只读展示：value -> option.label（未命中回退 value）。
 */
export const parseRadioValue = (component, value) => {
  const label = findOptionLabel(component, value)
  return parseToString(label)
}

/**
 * 复选只读展示：数组 value -> 多个 option.label，用 `；` 拼接。
 * 约定：表单值应为数组（Element Plus 多选/checkbox-group 常见结构）。
 */
export const parseCheckboxValue = (component, value) => {
  const values = Array.isArray(value) ? value : [value]
  const labels = values
    .filter((v) => !isEmptyValue(v))
    .map((v) => findOptionLabel(component, v))
    .map(parseToString)

  return labels.join('；')
}

/**
 * 日期只读展示。
 * 约定：值为字符串或 `{ date, meridiem }` 结构。
 */
export const parseDateValue = (_component, value) => parseDateDisplayValue(value)

/**
 * 手机号只读展示：格式化手机号（如：+86 138****8888）。
 * 约定：值为 `{ areaCode, number }` 结构。
 */
export const parsePhoneValue = (_component, value) => {
  if (isEmptyValue(value)) return ''
  
  const areaCode = value.areaCode
  const number = value.number
  
  if (isEmptyValue(number)) return ''
  
  // 格式化11位手机号
  const formattedNumber = String(number).replace(/(\d{3})\d{4}(\d{4})/, '$1****$2')
  return `${areaCode} ${formattedNumber}`
}

/**
 * 身份证号只读展示：格式化身份证号。
 * 支持18位和15位身份证号的脱敏显示。
 */
export const parseIdCardValue = (_component, value) => {
  if (isEmptyValue(value)) return ''
  
  const idCard = String(value)
  
  // 18位身份证号：前6位 + ******** + 后4位
  if (idCard.length === 18) {
    return idCard.replace(/^(\d{6})\d{8}(\d{4})$/, '$1********$2')
  }
  
  // 15位身份证号：前6位 + ****** + 后3位
  if (idCard.length === 15) {
    return idCard.replace(/^(\d{6})\d{6}(\d{3})$/, '$1******$3')
  }
  
  return idCard
}

/**
 * 日期区间只读展示。
 * 约定：值为 `{ startDate, endDate }` 结构，区间内部也可能是 `{ date, meridiem }`。
 * 展示格式：`start ${rangeSeparator || '至'} end`
 */
export const parseDateRangeValue = (component, value) => {
  const separator = component?.rangeSeparator || '至'

  if (value && typeof value === 'object' && !Array.isArray(value)) {
    const fields = getDateRangeDisplayFields(component, value)

    return fields
      .map((field) => field.display)
      .join(` ${separator} `)
  }

  return parseDateDisplayValue(value)
}
