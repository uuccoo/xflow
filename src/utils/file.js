/**
 * 将后端返回的文件相对路径（如 /files/images/xxx.png）拼接为绝对地址。
 * 若已是完整 URL（http/https 开头）则原样返回。
 */
export const getFileUrl = (url) => {
  if (!url) return ''
  if (url.startsWith('http://') || url.startsWith('https://')) return url
  const base = import.meta.env.VITE_SERVER_URL || ''
  return `${base}${url}`
}

/**
 * 把文件字节大小格式化为易读文本
 */
export const formatFileSize = (size) => {
  if (typeof size !== 'number' || size <= 0) return ''
  if (size < 1024) return size + 'B'
  if (size < 1024 * 1024) return (size / 1024).toFixed(1) + 'KB'
  return (size / 1024 / 1024).toFixed(2) + 'MB'
}
