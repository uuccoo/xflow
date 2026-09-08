<template>
  <el-form-item
    :label="component.label"
    :required="component.required"
    :error="error?.message || ''"
  >
    <el-upload
      class="upload-field-wrapper"
      :auto-upload="true"
      :multiple="true"
      :http-request="handleHttpUpload"
      :before-upload="handleBeforeUpload"
      :on-remove="handleFileRemove"
      :on-exceed="handleExceed"
      :on-success="handleUploadSuccess"
      :on-preview="handleFilePreview"
      :limit="maxCount"
      v-model:file-list="displayFileList"
      :disabled="readonly"
    >
      <el-button :disabled="readonly">
        <el-icon style="margin-right: 4px"><Upload /></el-icon>
        点击上传
      </el-button>
      <template #tip>
        <div v-if="!readonly" class="el-upload__tip">
          最多上传 {{ maxCount }} 个文件，单个不超过 {{ maxSizeMB }}MB
        </div>
      </template>
    </el-upload>
  </el-form-item>
</template>

<script setup>
import { ref } from 'vue'
import { Upload } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { uploadApi } from '@/api'
import { getFileUrl } from '@/utils/file'
import { generatePrefixedId } from '@/utils/idGenerator'

// ========== Props ==========
const props = defineProps({
  component: {
    type: Object,
    required: true,
  },
  error: {
    type: Object,
    default: null,
  },
  readonly: {
    type: Boolean,
    default: false,
  },
})

const fileList = defineModel({ type: Array, default: () => [] })

// ========== 配置 ==========
const maxCount = 10
const maxSizeMB = 10

// ========== UI 列表（独立维护，仅在初始化时使用 fileList 赋值） ==========

// 将数据映射为 el-upload 的 UploadFile 格式
const mapToUploadFile = (file) => {
  return {
    uid: file.uid || generatePrefixedId('file'),
    name: file.name || '',
    url: getFileUrl(file.url),
    size: file.size,
    status: 'success',
    // response 中保留原始数据，用于同步到 fileList
    response: file,
  }
}

const displayFileList = ref(fileList.value.map(mapToUploadFile))

// ========== 从 uploadFiles 反向同步到 fileList ==========
const syncFileList = (uploadFiles) => {
  const files = uploadFiles
    .filter((f) => f.status === 'success')
    .map((f) => f.response)
  fileList.value = files
}

// ========== 上传前校验 ==========
const handleBeforeUpload = (file) => {
  // 大小限制
  const sizeMB = file.size / 1024 / 1024
  if (sizeMB > maxSizeMB) {
    ElMessage.error(`文件大小不能超过 ${maxSizeMB}MB（当前 ${sizeMB.toFixed(2)}MB）`)
    return false
  }

  return true
}

const handleExceed = () => {
  ElMessage.warning(`最多只能上传 ${maxCount} 个文件`)
}

// ========== 预览 / 点击下载已上传文件 ==========
const handleFilePreview = (uploadFile) => {
  const url = uploadFile && uploadFile.url
  if (!url) return
  // 新标签页打开或直接触发下载
  window.open(url, '_blank', 'noopener')
}

// ========== 自定义上传 ==========
const handleHttpUpload = async (options) => {
  const { file } = options

  try {
    const result = await uploadApi.uploadFile(file)
    // result: { id, name, url, size }
    return result
  } catch (err) {
    return err
  }
}

// ========== 上传成功回调 ==========
const handleUploadSuccess = (response, uploadFile, uploadFiles) => {
  // 将后端返回的 url 转为完整地址，用于显示和预览
  uploadFile.url = getFileUrl(response.url)
  // 同步到 fileList
  syncFileList(uploadFiles)
}

// ========== 删除 ==========
const handleFileRemove = (uploadFile, uploadFiles) => {
  syncFileList(uploadFiles)
}
</script>

<style scoped>
.upload-field-wrapper {
  width: 100%;
}
.el-upload__tip {
  color: #909399;
  font-size: 12px;
  margin-top: 6px;
}
</style>
