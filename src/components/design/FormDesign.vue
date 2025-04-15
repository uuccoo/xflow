<template>
  <el-container class="form-design-container">
    <!-- 左侧组件面板 -->
    <el-aside width="280px" class="component-panel">
      <div class="component-header">
        <h3>表单组件</h3>
      </div>

      <!-- 动态渲染组件类别和内容 -->
      <div class="component-list">
        <div class="component-category" v-for="category in components" :key="category.category">
          <h4>{{ category.category }}</h4>
          <div class="component-grid">
            <draggable :list="category.items" :group="{ name: 'components', pull: 'clone', put: false }"
              :clone="cloneComponent" item-key="type" :sort="false" class="drag-area">
              <div class="component-item" v-for="element in category.items" :key="element.type"
                @click="addComponent(element)">
                <el-icon>
                  <component :is="element.icon" />
                </el-icon>
                <span>{{ element.label }}</span>
              </div>
            </draggable>
          </div>
        </div>
      </div>

    </el-aside>

    <!-- 中间设计区域 -->
    <el-main class="design-area">
      <div class="design-header">
        <h3>表单设计</h3>
      </div>
      <div class="design-canvas">
        <div class="phone-frame">
          <draggable :list="formItems" group="components" item-key="id" class="form-container" @start="dragStart"
            @end="dragEnd" handle=".drag-handle">
            <div v-if="formItems.length === 0" class="empty-tip">
              拖拽左侧组件到此处进行表单设计
            </div>
            <div class="drag-handle form-item-wrapper" :class="{ active: activeItem && activeItem.id === element.id }"
              v-for="(element, index) in formItems" :key="element.id" @click="selectItem(element, index)">
              <div class="form-item-content">
                <!-- 动态组件渲染 -->
                <component-renderer :component="element" @selectNestedItem="selectNestedItem"
                  @deleteNestedItem="deleteNestedItem" />
              </div>
              <div class="form-item-actions">
                <el-icon @click.stop="deleteItem(index)">
                  <Delete />
                </el-icon>
              </div>
            </div>
          </draggable>
        </div>
      </div>
    </el-main>

    <!-- 右侧属性配置面板 -->
    <el-aside width="280px" class="property-panel">
      <div class="property-header">
        <h3>属性设置</h3>
      </div>

      <el-form v-if="activeItem" label-position="top" size="small" class="property-form">
        <!-- 分栏组件属性设置 -->
        <template v-if="activeItem.type === 'columns'">
          <el-form-item label="栏目布局">
            <el-select v-model="activeColumnLayout" @change="updateColumnsLayout" style="width: 100%">
              <el-option label="两等分" value="1:1"></el-option>
              <el-option label="三等分" value="1:1:1"></el-option>
              <el-option label="左窄右宽" value="1:2"></el-option>
              <el-option label="左宽右窄" value="2:1"></el-option>
              <el-option label="左窄中宽右窄" value="1:2:1"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item v-for="(column, index) in activeItem.columns" :key="index" :label="`列 ${index + 1} 宽度`">
            <el-input-number v-model="column.width" :min="10" :max="90" @change="normalizeColumnsWidth"
              style="width: 100%" />
          </el-form-item>
        </template>
        <!-- 普通组件属性设置 -->
        <template v-else>
          <el-form-item label="标题">
            <el-input v-model="activeItem.title" placeholder="请输入标题"></el-input>
          </el-form-item>
          <el-form-item label="编码">
            <el-input v-model="activeItem.field" placeholder="请输入字段名"></el-input>
          </el-form-item>
          <el-form-item label="提示文字">
            <el-input v-model="activeItem.placeholder" placeholder="请输入提示文字"></el-input>
          </el-form-item>
          <el-form-item label="是否必填">
            <el-switch v-model="activeItem.required"></el-switch>
          </el-form-item>
          <el-form-item label="校验规则">
            <el-select v-model="activeItem.validator" placeholder="请选择校验规则" style="width: 100%">
              <el-option label="无" value="none"></el-option>
              <el-option label="邮箱" value="email"></el-option>
              <el-option label="手机号" value="phone"></el-option>
              <el-option label="身份证" value="id"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="默认值">
            <el-input v-model="activeItem.defaultValue" placeholder="请输入默认值"></el-input>
          </el-form-item>
        </template>
      </el-form>
      <div v-else class="empty-tip">
        请选择一个组件进行配置
      </div>
    </el-aside>
  </el-container>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { VueDraggableNext as draggable } from 'vue-draggable-next'
import ComponentRenderer from './ComponentRenderer.vue'
import { Delete } from '@element-plus/icons-vue'

// 合并基础组件、布局组件和高级组件为一个变量components，并将类别信息加入到变量中
const components = reactive([
  {
    category: '布局组件', items: [
      { type: 'columns', icon: 'Cellphone', label: '分栏容器', columns: [] }
    ]
  },
  {
    category: '基础组件', items: [
      { type: 'input', icon: 'Document', label: '单行文本', field: '', title: '', placeholder: '请输入', required: false, validator: '', defaultValue: '' },
      { type: 'textarea', icon: 'DocumentCopy', label: '多行文本', field: '', title: '', placeholder: '请输入', required: false, validator: '', defaultValue: '' },
      { type: 'radio', icon: 'Check', label: '单选框', field: '', title: '', placeholder: '请输入', required: false, options: [{ label: '选项1', value: '1' }, { label: '选项2', value: '2' }], defaultValue: '' },
      { type: 'checkbox', icon: 'Select', label: '多选框', field: '', title: '', placeholder: '请输入', required: false, options: [{ label: '选项1', value: '1' }, { label: '选项2', value: '2' }], defaultValue: [] }
    ]
  },
  {
    category: '高级组件', items: [
      { type: 'date', icon: 'Calendar', label: '日期选择', field: '', title: '', placeholder: '请输入', required: false, defaultValue: '' },
      { type: 'upload', icon: 'Upload', label: '文件上传', field: '', title: '', placeholder: '请输入', required: false, defaultValue: [] },
      { type: 'image', icon: 'Picture', label: '图片上传', field: '', title: '', placeholder: '请输入', required: false, defaultValue: [] }
    ]
  }
]);

// 设计区域的表单控件列表
const formItems = ref([])

// 当前选中的组件
const activeItem = ref(null)

// 当前选中的分栏布局
const activeColumnLayout = ref('1:1')

// 克隆组件
const cloneComponent = (component) => {
  if (component.type === 'columns') {
    // 创建分栏容器时，默认创建两个等宽的列
    return {
      ...component,
      id: Date.now(),
      columns: [
        { width: 50, children: [] },
        { width: 50, children: [] }
      ]
    }
  }
  return {
    ...component,
    id: Date.now(),
    title: component.label,
    field: component.type + Date.now(),
    placeholder: component.placeholder || ''
  }
}

// 添加组件
const addComponent = (component) => {
  formItems.value.push(cloneComponent(component))
}

// 选中组件
const selectItem = (item, index) => {
  activeItem.value = item

  // 如果选中的是分栏组件，根据当前列数设置activeColumnLayout
  if (item.type === 'columns') {
    if (item.columns.length === 2) {
      if (item.columns[0].width === 50 && item.columns[1].width === 50) {
        activeColumnLayout.value = '1:1'
      } else if (item.columns[0].width === 33 && item.columns[1].width === 67) {
        activeColumnLayout.value = '1:2'
      } else if (item.columns[0].width === 67 && item.columns[1].width === 33) {
        activeColumnLayout.value = '2:1'
      }
    } else if (item.columns.length === 3) {
      if (item.columns[0].width === 33 && item.columns[1].width === 34 && item.columns[2].width === 33) {
        activeColumnLayout.value = '1:1:1'
      } else if (item.columns[0].width === 25 && item.columns[1].width === 50 && item.columns[2].width === 25) {
        activeColumnLayout.value = '1:2:1'
      }
    }
  }
}

// 选中嵌套组件（分栏内的组件）
const selectNestedItem = (item, parentComponent, parentColumn, columnIndex, itemIndex) => {
  activeItem.value = item
}

// 删除嵌套组件
const deleteNestedItem = (parentComponent, parentColumn, columnIndex, itemIndex) => {
  parentColumn.children.splice(itemIndex, 1)
}

// 删除组件
const deleteItem = (index) => {
  formItems.value.splice(index, 1)
  if (activeItem.value && activeItem.value === formItems.value[index]) {
    activeItem.value = null
  }
}

// 更新分栏布局
const updateColumnsLayout = (layout) => {
  if (!activeItem.value || activeItem.value.type !== 'columns') return

  const columns = activeItem.value.columns
  const widths = layout.split(':').map(Number)
  const total = widths.reduce((sum, w) => sum + w, 0)

  // 计算每个分栏的宽度百分比
  const percentages = widths.map(w => Math.round((w / total) * 100))

  // 如果列数不一致，需要调整列数
  if (columns.length !== widths.length) {
    // 保留原有子元素
    const existingChildren = columns.flatMap(col => col.children || [])

    // 创建新的列结构
    activeItem.value.columns = widths.map((_, index) => {
      return {
        width: percentages[index],
        children: index === 0 ? existingChildren : [] // 所有子元素都放在第一列
      }
    })
  } else {
    // 只更新宽度
    columns.forEach((col, index) => {
      col.width = percentages[index]
    })
  }
}

// 归一化列宽，确保总和为100%
const normalizeColumnsWidth = () => {
  if (!activeItem.value || activeItem.value.type !== 'columns') return

  const columns = activeItem.value.columns
  const total = columns.reduce((sum, col) => sum + col.width, 0)

  if (total !== 100) {
    const factor = 100 / total
    columns.forEach(col => {
      col.width = Math.round(col.width * factor)
    })

    // 处理舍入误差，调整最后一列
    const newTotal = columns.reduce((sum, col) => sum + col.width, 0)
    if (newTotal !== 100) {
      columns[columns.length - 1].width += (100 - newTotal)
    }
  }
}

// 拖拽开始
const dragStart = () => {
  activeItem.value = null
}

// 拖拽结束
const dragEnd = () => { }
</script>

<style scoped>
.form-design-container {
  height: calc(100vh - 60px);
  overflow: hidden;
}

.component-panel {
  background-color: #ffffff;
  border-right: 1px solid #ebeef5;
}

.component-header {
  display: flex;
  align-items: center;
  height: 50px;
  border-bottom: 1px solid #ebeef5;
}

.component-header h3 {
  margin-left: 20px;
  color: #606266;
}

.component-list {
  padding: 0 10px;
}

.component-category {
  margin-bottom: 15px;
}

.component-category h4 {
  margin: 10px 0;
  color: #909399;
  font-size: 14px;
  font-weight: normal;
}

.component-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

.drag-area {
  display: contents;
}

.component-item {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: flex-start;
  border: 1px solid #dcdfe6;
  border-radius: 6px;
  padding: 6px 10px;
  background-color: #fff;
  cursor: pointer;
  transition: all 0.3s;
}

.component-item:hover {
  background-color: #f0f5ff;
  border-color: #a0cfff;
}

.component-item .el-icon {
  font-size: 16px;
  margin-right: 8px;
  color: #409eff;
}

.component-item span {
  font-size: 12px;
  color: #606266;
  font-weight: 500;
}

.design-area {
  background-color: #f7f7f7;
  display: flex;
  flex-direction: column;
  padding: 0px;
}

.design-header {
  background-color: #fff;
  height: 50px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #ebeef5;
}

.design-header h3 {
  margin-left: 20px;
  color: #606266;
}

.design-canvas {
  flex: 1;
  padding: 20px;
  background-color: #fafafa;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  overflow: auto;
}

.phone-frame {
  width: 375px;
  height: 667px;
  border: 10px solid #fff;
  border-radius: 20px;
  background-color: #eee;
  box-shadow: 0 8px 12px rgba(0, 0, 0, 0.2);
  position: relative;
  overflow: auto;
  display: flex;
  flex-direction: column;
  padding: 10px;
  color: #333;
}

.empty-tip {
  color: #909399;
  font-size: 14px;
  text-align: center;
  margin: auto;
}

.property-panel {
  background-color: #ffffff;
  border-left: 1px solid #ebeef5;
}

.property-header {
  display: flex;
  align-items: center;
  height: 50px;
  border-bottom: 1px solid #ebeef5;
}

.property-header h3 {
  margin-left: 15px;
  color: #606266;
}

.property-form {
  margin-top: 15px;
  padding: 0 15px;
}

.form-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 10px 0;
  min-height: 100%;
}

.form-item-wrapper {
  display: flex;
  align-items: center;
  border: 1px solid #dcdfe6;
  border-radius: 6px;
  padding: 10px;
  background-color: #fff;
  cursor: pointer;
  transition: all 0.3s;
}

.form-item-wrapper.active {
  border-color: #409eff;
  background-color: #f0faff;
}

.drag-handle {
  cursor: move;
}

.form-item-content {
  flex: 1;
}

.form-item-actions {
  margin-left: 10px;
  cursor: pointer;
  color: #909399;
}

.form-item-actions .el-icon:hover {
  color: #f56c6c;
}

.form-item {
  width: 100%;
}

.form-item-label {
  font-size: 14px;
  color: #606266;
  margin-bottom: 8px;
  font-weight: 500;
  display: flex;
  align-items: center;
}

.form-item-label .required {
  color: #f56c6c;
  margin-left: 4px;
}

.form-item-control {
  width: 100%;
}
</style>