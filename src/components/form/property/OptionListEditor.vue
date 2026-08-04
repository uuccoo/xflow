<template>
  <div class="options-container">
    <draggable v-model="options" handle=".drag-handle-option" :animation="200" ghost-class="ghost-option"
      chosen-class="chosen-option" drag-class="dragging-option">
      <div v-for="(option, optIndex) in options" :key="option.value" class="option-item">
        <el-icon class="drag-handle-option">
          <Operation />
        </el-icon>
        <el-input v-model="option.label" placeholder="选项名称" class="option-input-full"></el-input>
        <div class="option-actions">
          <el-button size="small" circle type="danger" @click="removeOption(optIndex)" title="删除">
            <el-icon>
              <Delete />
            </el-icon>
          </el-button>
        </div>
      </div>
    </draggable>
    <el-button type="primary" text class="add-option-btn" @click="addOption">
      <el-icon>
        <Plus />
      </el-icon> 添加选项
    </el-button>
  </div>
</template>

<script setup>
import { VueDraggableNext as draggable } from 'vue-draggable-next'
import { generateUniqueId } from '@/utils/idGenerator'
import { Delete, Plus, Operation } from '@element-plus/icons-vue'

/**
 * 选项列表编辑器 - 用于单选框/多选框的选项管理
 *
 * @prop v-model - 选项数组，每项结构为 { label: string, value: string }
 * @event remove - 删除选项时触发，参数为被删除的选项对象，父组件可借此清理默认值
 */
const options = defineModel({ type: Array, required: true })
const emit = defineEmits(['remove'])

const addOption = () => {
  options.value.push({
    label: `选项${options.value.length + 1}`,
    value: `option_${generateUniqueId()}`,
  })
}

const removeOption = (index) => {
  if (options.value.length <= 1) return
  const [removed] = options.value.splice(index, 1)
  emit('remove', removed)
}
</script>

<style scoped>
.options-container {
  border: 1px solid #ebeef5;
  border-radius: 4px;
  padding: 10px;
  background-color: #fafafa;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.option-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px;
  border-radius: 4px;
  background-color: #fff;
  border: 1px solid #dcdfe6;
}

.drag-handle-option {
  cursor: move;
  color: #909399;
  padding: 4px;
  margin-right: 4px;
  font-size: 18px;
}

.drag-handle-option:hover {
  color: #409EFF;
}

.option-input-full {
  flex: 1;
  width: 100%;
}

.option-actions {
  display: flex;
  gap: 4px;
}

.add-option-btn {
  margin-top: 8px;
  align-self: flex-start;
}

.ghost-option {
  opacity: 0.5;
  background: #f0f9ff !important;
  border: 1px dashed #409EFF !important;
}
</style>
