<template>
  <div>
    <div v-for="field in displayFields" :key="field.id" class="detail-item">
      <div class="detail-label">{{ field.label }}</div>
      <div class="detail-value">
        <!-- 图片展示 -->
        <template v-if="field.type === FormComponentType.IMAGE && field.files && field.files.length">
          <div class="image-list">
            <el-image
              v-for="(file, index) in field.files"
              :key="file.id || file.uid || index"
              :src="getFileUrl(file.url)"
              :preview-src-list="field.files.map((item) => getFileUrl(item.url))"
              :initial-index="index"
              fit="cover"
              class="image-thumb"
              preview-teleported
            />
          </div>
        </template>

        <!-- 文件列表展示 -->
        <template v-else-if="field.type === FormComponentType.UPLOAD && field.files && field.files.length">
          <ul class="file-list">
            <li v-for="(file, index) in field.files" :key="file.id || file.uid || index" class="file-item">
              <el-icon class="file-icon"><Document /></el-icon>
              <a
                class="file-link"
                :href="getFileUrl(file.url)"
                target="_blank"
                rel="noopener"
                :title="file.name || '下载文件'"
              >
                {{ file.name || '文件' + (index + 1) }}
              </a>
              <span v-if="formatFileSize(file.size)" class="file-size">({{ formatFileSize(file.size) }})</span>
            </li>
          </ul>
        </template>

        <!-- 纯文本（默认） -->
        <template v-else>
          {{ field.display }}
        </template>
      </div>
    </div>

    <div v-if="displayFields.length === 0" class="empty-data">暂无表单数据</div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { Document } from '@element-plus/icons-vue'
import { FormComponentType } from '@/enums'
import {
  isEmptyValue,
  getDateRangeDisplayFields,
  parseCheckboxValue,
  parseDateValue,
  parseIdCardValue,
  parsePhoneValue,
  parseRadioValue,
  parseToString,
} from '@/utils/formDisplay'
import { flattenFormItems } from '@/utils/formItems'
import { getFileUrl, formatFileSize } from '@/utils/file'

const props = defineProps({
  formItems: {
    type: Array,
    default: () => [],
  },
  formData: {
    type: Object,
    default: () => ({}),
  },
})

const displayFields = computed(() => {
  const items = flattenFormItems(props.formItems)
  const result = []

  for (const component of items) {
    const id = component?.id
    if (!id) continue

    const value = props.formData?.[id]
    if (isEmptyValue(value)) continue

    // === 日期区间（原样保留） ===
    if (component?.type === FormComponentType.DATERANGE) {
      const rangeFields = getDateRangeDisplayFields(component, value)
      for (const rangeField of rangeFields) {
        result.push({
          id: `${id}-${rangeField.key}`,
          type: component.type,
          label: rangeField.label,
          display: rangeField.display,
        })
      }
      continue
    }

    // === 图片上传 ===
    if (component?.type === FormComponentType.IMAGE) {
      const files = value || []
      if (files.length > 0) {
        result.push({
          id,
          type: component.type,
          label: component.label || '未命名字段',
          files,
          display: '',
        })
        continue
      }
    }

    // === 文件上传 ===
    if (component?.type === FormComponentType.UPLOAD) {
      const files = value || []
      if (files.length > 0) {
        result.push({
          id,
          type: component.type,
          label: component.label || '未命名字段',
          files,
          display: '',
        })
        continue
      }
    }

    // === 其他组件：原样文本化 ===
    let display = null
    switch (component?.type) {
      case FormComponentType.RADIO:
        display = parseRadioValue(component, value)
        break
      case FormComponentType.CHECKBOX:
        display = parseCheckboxValue(component, value)
        break
      case FormComponentType.DATE:
        display = parseDateValue(component, value)
        break
      case FormComponentType.PHONE:
        display = parsePhoneValue(component, value)
        break
      case FormComponentType.IDCARD:
        display = parseIdCardValue(component, value)
        break
      default:
        display = parseToString(value)
        break
    }

    result.push({
      id,
      type: component.type,
      label: component.label || '未命名字段',
      display,
    })
  }

  return result
})
</script>

<style scoped>
.detail-item {
  margin-bottom: 10px;
}

.detail-label {
  margin-bottom: 4px;
}

.detail-value {
  padding: 10px;
  background-color: #fff;
  border: var(--x-border-base);
  border-radius: 4px;
  min-height: 18px;
  word-break: break-all;
}

.empty-data {
  text-align: center;
  padding: 20px;
}

/* ================= 图片展示 ================= */
.image-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.image-thumb {
  width: 56px;
  height: 56px;
  border-radius: 4px;
  border: 1px solid #e5e7eb;
  overflow: hidden;
  cursor: pointer;
}

/* ================= 文件列表展示 ================= */
.file-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.file-item {
  display: flex;
  align-items: center;
  gap: 6px;
  line-height: 1.4;
}

.file-icon {
  color: #2563eb;
  font-size: 16px;
  flex-shrink: 0;
}

.file-link {
  color: #2563eb;
  text-decoration: none;
  max-width: 260px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.file-link:hover {
  text-decoration: underline;
}

.file-size {
  color: #64748b;
  font-size: 12px;
}
</style>
