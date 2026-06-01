<template>
  <div>
    <el-form-item label="标题">
      <el-input v-model="component.label" placeholder="请输入标题" maxlength="50" show-word-limit></el-input>
    </el-form-item>
    <el-form-item label="提示文字">
      <el-input v-model="component.placeholder" placeholder="请输入提示文字" maxlength="50" show-word-limit></el-input>
    </el-form-item>
    <el-form-item label="选项设置">
      <div class="options-container">
        <draggable v-model="component.options" handle=".drag-handle-option" :animation="200" ghost-class="ghost-option"
          chosen-class="chosen-option" drag-class="dragging-option">
          <div v-for="(option, optIndex) in component.options" :key="option.value" class="option-item">
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
    </el-form-item>
    <el-form-item label="选项平铺">
      <el-switch v-model="component.optionTile"></el-switch>
    </el-form-item>
    <el-form-item label="是否必填">
      <el-switch v-model="component.required"></el-switch>
    </el-form-item>
    <el-form-item label="默认值">
      <el-select v-model="component.defaultValue" multiple placeholder="请选择默认值" style="width: 100%">
        <el-option v-for="option in component.options" :key="option.value" :label="option.label"
          :value="option.value"></el-option>
      </el-select>
    </el-form-item>
  </div>
</template>

<script setup>
import { VueDraggableNext as draggable } from 'vue-draggable-next'
import { useFormDesignStore } from '@/stores/formDesignStore'
import { Delete, Plus, Operation } from '@element-plus/icons-vue'

const props = defineProps({
  component: {
    type: Object,
    required: true
  }
});

const formStore = useFormDesignStore();

const addOption = () => {
  formStore.addOption();
};

const removeOption = (index) => {
  formStore.removeOption(index);
};
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
