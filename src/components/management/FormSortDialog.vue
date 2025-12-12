<template>
  <el-dialog
    v-model="dialogVisible"
    title="表单排序"
    width="500px"
    align-center
  >
    <div class="sort-dialog-content">
      <draggable 
        v-model="sortableForms" 
        :animation="200" 
        ghost-class="ghost-form"
        chosen-class="chosen-form"
        drag-class="dragging-form"
      >
        <div v-for="element in sortableForms" :key="element.id" class="sort-form-item">
          <DragHandleIcon :size="18" color="#909399" class="sort-drag-handle" />
          <div class="form-item-icon" :style="{ backgroundColor: element.iconColor || '#1677ff' }">
            <el-icon color="#ffffff" size="20">
              <component :is="getIconComponent(element.icon)" />
            </el-icon>
          </div>
          <span class="sort-form-name">{{ element.name }}</span>
        </div>
      </draggable>
      <div v-if="sortableForms.length === 0" class="empty-tip">
        暂无可排序的表单
      </div>
    </div>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveSortOrder" :loading="saving">保存排序</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, watch } from 'vue';
import { VueDraggableNext as draggable } from 'vue-draggable-next';
import DragHandleIcon from '@/components/icon/DragHandleIcon.vue';
import * as ElementPlusIconsVue from '@element-plus/icons-vue';
import formApi from '@/api/modules/form';

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  forms: {
    type: Array,
    default: () => []
  }
});

const emit = defineEmits(['update:visible', 'save']);

const dialogVisible = ref(false);
const sortableForms = ref([]);
const saving = ref(false);

// 获取图标组件
const getIconComponent = (iconName) => {
  return ElementPlusIconsVue[iconName] || ElementPlusIconsVue.Document;
};

// 监听visible属性变化
watch(() => props.visible, (newVal) => {
  dialogVisible.value = newVal;
  if (newVal) {
    // 复制表单列表用于排序
    sortableForms.value = props.forms.map(form => ({ ...form }));
  }
});

// 监听对话框状态变化，同步到父组件
watch(dialogVisible, (newVal) => {
  emit('update:visible', newVal);
});

// 保存排序
const saveSortOrder = async () => {
  const sortedIds = sortableForms.value.map(form => form.id);
  if (sortedIds.length === 0) {
    ElMessage.warning('没有可排序的表单');
    return;
  }

  saving.value = true;
  try {
    await formApi.updateFormSortOrders(sortedIds);
    ElMessage.success('表单排序保存成功');
    dialogVisible.value = false;
    emit('save', sortedIds);
  } catch (error) {
    console.error('保存排序失败:', error);
    ElMessage.error('保存排序失败，请稍后重试');
  } finally {
    saving.value = false;
  }
};
</script>

<style scoped>
/* 表单排序对话框内容样式 */
.sort-dialog-content {
  max-height: 400px;
  overflow-y: auto;
}

/* 表单排序项样式 */
.sort-form-item {
  display: flex;
  align-items: center;
  padding: 16px 20px;
  margin-bottom: 12px;
  background-color: #ffffff;
  border: 1px solid #e8e8e8;
  border-radius: 8px;
  transition: all 0.2s;
  cursor: grab;
}

.sort-form-item:hover {
  border-color: #d0d0d0;
}

.sort-form-item:last-child {
  margin-bottom: 0;
}

/* 拖拽手柄样式 */
.sort-drag-handle {
  margin-right: 16px;
  flex-shrink: 0;
}

/* 表单图标样式 */
.form-item-icon {
  margin-right: 12px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 6px;
}

/* 表单名称样式 */
.sort-form-name {
  font-size: 14px;
  font-weight: 500;
  color: #262626;
}

/* 空提示样式 */
.empty-tip {
  text-align: center;
  color: #909399;
  padding: 40px 0;
}

/* 对话框页脚样式 */
.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 6px;
}

/* 拖拽动画样式 */
.ghost-form {
  opacity: 0.5;
  background: linear-gradient(135deg, #e6f7ff 0%, #bae7ff 100%) !important;
  border: 2px dashed #1890ff !important;
}

.chosen-form {
  background: #f0f6ff !important;
  border: 2px solid #1890ff !important;
  box-shadow: 0 0 10px rgba(24, 144, 255, 0.3) !important;
}

.dragging-form {
  background: #fff !important;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15) !important;
  transform: scale(1.02);
}
</style>
