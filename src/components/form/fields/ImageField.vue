<template>
  <el-upload
    class="avatar-uploader"
    action="#"
    list-type="picture-card"
    :auto-upload="false"
    multiple
    accept="image/*"
    :file-list="props.modelValue"
    @update:file-list="onFileListChange"
    :disabled="props.readonly"
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
</template>

<script setup>
import { ref, computed } from 'vue'
import { Plus } from '@element-plus/icons-vue'

const previewVisible = ref(false)
const previewIndex = ref(0)

const previewUrlList = computed(() => {
  return props.modelValue.map(file => file.url)
})


const props = defineProps({
  component: {
    type: Object,
    required: true,
  },
  modelValue: {
    type: Array,
    default: () => [],
  },
  readonly: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['update:modelValue'])

const onFileListChange = (files) => {
  if (props.readonly) return
  emit('update:modelValue', files)
}

const handlePreview = (uploadFile) => {
  const index = props.modelValue.findIndex(file => file.uid === uploadFile.uid)
  previewIndex.value = index >= 0 ? index : 0
  previewVisible.value = true
}
</script>
