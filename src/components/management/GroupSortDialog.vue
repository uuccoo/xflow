<template>
  <el-dialog
    v-model="dialogVisible"
    title="分组排序"
    width="500px"
    align-center
  >
    <div class="sort-dialog-content">
      <draggable 
        v-model="sortableGroups" 
        :animation="200" 
        ghost-class="ghost-group"
        chosen-class="chosen-group"
        drag-class="dragging-group"
      >
        <div v-for="element in sortableGroups" :key="element.id" class="sort-group-item">
          <DragHandleIcon :size="18" color="#909399" class="sort-drag-handle" />
          <span class="sort-group-name">{{ element.name }}</span>
          <span class="sort-group-count">({{ element.forms?.length || 0 }})</span>
        </div>
      </draggable>
      <div v-if="sortableGroups.length === 0" class="empty-tip">
        暂无可排序的分组
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
import { updateFormGroupSortOrders } from '@/api/modules/formGroup';
import DragHandleIcon from '@/components/icon/DragHandleIcon.vue';

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  groups: {
    type: Array,
    default: () => []
  }
});

const emit = defineEmits(['update:visible', 'save']);

const dialogVisible = ref(false);
const sortableGroups = ref([]);
const saving = ref(false);

// 监听visible属性变化
watch(() => props.visible, (newVal) => {
  dialogVisible.value = newVal;
  if (newVal) {
    // 复制分组列表用于排序（仅包含非 system 类型的分组，可排序）
    sortableGroups.value = props.groups
      .filter(group => group.system !== true)
      .map(group => ({ ...group }));
  }
});

// 监听对话框状态变化，同步到父组件
watch(dialogVisible, (newVal) => {
  emit('update:visible', newVal);
});

// 保存排序
const saveSortOrder = async () => {
  const sortedIds = sortableGroups.value.map(group => group.id);
  if (sortedIds.length === 0) {
    ElMessage.warning('没有可排序的分组');
    return;
  }

  saving.value = true;
  try {
    await updateFormGroupSortOrders(sortedIds);
    ElMessage.success('分组排序保存成功');
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
/* 分组排序对话框内容样式 */
.sort-dialog-content {
  max-height: 400px;
  overflow-y: auto;
}

/* 分组排序项样式 */
.sort-group-item {
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

.sort-group-item:hover {
  border-color: #d0d0d0;
}

.sort-group-item:last-child {
  margin-bottom: 0;
}

/* 拖拽手柄样式 */
.sort-drag-handle {
  margin-right: 16px;
  flex-shrink: 0;
}

/* 分组名称样式 */
.sort-group-name {
  font-size: 14px;
  font-weight: 500;
  color: #262626;
}

/* 分组数量样式 */
.sort-group-count {
  margin-left: 8px;
  font-size: 14px;
  color: #8c8c8c;
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
.ghost-group {
  opacity: 0.5;
  background: linear-gradient(135deg, #e6f7ff 0%, #bae7ff 100%) !important;
  border: 2px dashed #1890ff !important;
}

.chosen-group {
  background: #f0f6ff !important;
  border: 2px solid #1890ff !important;
  box-shadow: 0 0 10px rgba(24, 144, 255, 0.3) !important;
}

.dragging-group {
  background: #fff !important;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15) !important;
  transform: scale(1.02);
}
</style>
