<template>
  <el-upload
    action="#"
    :auto-upload="false"
    multiple
    :file-list="props.modelValue"
    @update:file-list="onFileListChange"
    :disabled="props.readonly"
  >
    <template #default>
      <el-button :disabled="props.readonly">点击上传</el-button>
    </template>
  </el-upload>
</template>

<script setup>
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
  // 设计态/只读态不允许修改值
  if (props.readonly) return
  emit('update:modelValue', files)
}
</script>
