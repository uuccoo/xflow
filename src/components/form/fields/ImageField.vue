<template>
  <el-form-item
    :label="component.label"
    :required="component.required"
    :error="error?.message || ''"
  >
    <el-upload
      class="avatar-uploader"
      list-type="picture-card"
      :multiple="true"
      :auto-upload="true"
      :http-request="handleHttpUpload"
      :before-upload="handleBeforeUpload"
      :on-remove="handleFileRemove"
      :on-exceed="handleExceed"
      :on-success="handleUploadSuccess"
      :limit="maxCount"
      v-model:file-list="displayFileList"
      :disabled="readonly"
      accept="image/*"
      @preview="handlePreview"
    >
      <template #default>
        <el-icon>
          <Plus />
        </el-icon>
      </template>
    </el-upload>

    <el-image-viewer
      v-if="previewVisible"
      :url-list="previewUrlList"
      :initial-index="previewIndex"
      @close="previewVisible = false"
    />
  </el-form-item>
</template>

<script setup>
import { computed, ref } from 'vue'
import { Plus } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { uploadApi } from '@/api'
import { getFileUrl } from '@/utils/file'

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

const fileList = computed({
  get: () => props.component.defaultValue || [],
  set: (value) => {
    props.component.defaultValue = value
  },
})

const maxCount = 10
const maxSizeMB = 10

// ========== UI 列表（独立维护，仅在初始化时使用 fileList 赋值） ==========

// 将数据映射为 el-upload 的 UploadFile 格式
const mapToUploadFile = (file) => {
  return {
    ...file,
    url: getFileUrl(file.url),
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

// ========== 预览 ==========
const previewVisible = ref(false)
const previewIndex = ref(0)
const previewUrlList = ref([])

const handlePreview = (uploadFile) => {
  previewUrlList.value = displayFileList.value
    .filter((f) => f.status === 'success' && f.url)
    .map((f) => f.url)
  const index = displayFileList.value.findIndex((f) => f.uid === uploadFile.uid)
  previewIndex.value = index >= 0 ? index : 0
  if (previewUrlList.value.length > 0) {
    previewVisible.value = true
  }
}

// ========== 上传前校验 ==========
const handleBeforeUpload = (file) => {
  // 类型校验（兜底，accept + 后端也会校验）
  if (!file.type || !file.type.startsWith('image/')) {
    ElMessage.error('只能上传图片文件')
    return false
  }

  // 大小限制
  const sizeMB = file.size / 1024 / 1024
  if (sizeMB > maxSizeMB) {
    ElMessage.error(`图片大小不能超过 ${maxSizeMB}MB（当前 ${sizeMB.toFixed(2)}MB）`)
    return false
  }

  return true
}

// ========== 超限提示 ==========
const handleExceed = () => {
  ElMessage.warning(`最多只能上传 ${maxCount} 张图片`)
}

// ========== 自定义上传（调用后端接口） ==========
const handleHttpUpload = async (options) => {
  const { file } = options

  try {
    // 调后端上传
    const result = await uploadApi.uploadImage(file)
    // result: { id, name, url, size }
    return result
  } catch (err) {
    return err
  }
}

// ========== 上传成功回调 ==========
const handleUploadSuccess = (response, uploadFile, uploadFiles) => {
  // 同步到 fileList
  syncFileList(uploadFiles)
}

// ========== 用户手动删除列表中的图 ==========
const handleFileRemove = (uploadFile, uploadFiles) => {
  syncFileList(uploadFiles)
}
</script>
