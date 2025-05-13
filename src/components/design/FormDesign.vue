<template>
  <el-container class="form-design-container">
    <!-- 左侧组件面板 -->
    <el-aside width="280px" class="component-panel">
      <div class="component-header">
        <h3>表单组件</h3>
      </div>

      <!-- 动态渲染组件类别和内容 -->
      <div class="component-list">
        <div class="component-category" v-for="category in formStore.components" :key="category.category">
          <h4>{{ category.category }}</h4>
          <div class="component-grid">
            <draggable :list="category.items" :group="{ name: 'components', pull: 'clone', put: false }"
              :clone="formStore.cloneComponent" item-key="type" :sort="false" class="drag-area">
              <div class="component-item" v-for="element in category.items" :key="element.type"
                @click="formStore.addComponent(element)">
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
        <div class="view-controls">
          <el-tooltip content="手机视图" placement="top">
            <span class="view-icon" :class="{ active: viewMode === 'mobile' }" @click="switchView('mobile')">
              <el-icon>
                <Iphone />
              </el-icon>
            </span>
          </el-tooltip>
          <el-tooltip content="电脑视图" placement="top">
            <span class="view-icon" :class="{ active: viewMode === 'pc' }" @click="switchView('pc')">
              <el-icon>
                <Monitor />
              </el-icon>
            </span>
          </el-tooltip>
        </div>
      </div>
      <div class="design-canvas">
        <div class="phone-frame" :class="{ 'pc-view': viewMode === 'pc' }">
          <draggable :list="formStore.formItems" group="components" item-key="id" class="form-container"
            @start="dragStart" @end="dragEnd" handle=".drag-handle" :animation="300" ghost-class="ghost-item"
            chosen-class="chosen-item" drag-class="dragging-item">
            <div v-if="formStore.formItems.length === 0" class="empty-tip">
              拖拽左侧组件到此处进行表单设计
            </div>
            <div class="drag-handle form-item-wrapper"
              :class="{ active: formStore.activeItem && formStore.activeItem.id === element.id }"
              v-for="(element, index) in formStore.formItems" :key="element.id" @click="formStore.selectItem(element)">
              <!-- 动态组件渲染 - 不再传递事件处理程序 -->
              <component-renderer :component="element" :showActions="true" :isNested="false" :index="index"
                :isActive="formStore.activeItem && formStore.activeItem.id === element.id"
                :activeItem="formStore.activeItem" />
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

      <el-form v-if="formStore.activeItem" label-position="top" size="small" class="property-form">
        <!-- 分栏组件属性设置 -->
        <template v-if="formStore.activeItem.type === 'columns'">
          <el-form-item label="栏目布局">
            <el-select v-model="formStore.activeColumnsLayout" @change="formStore.updateColumnsLayout"
              style="width: 100%">
              <el-option label="两等分" value="1:1"></el-option>
              <el-option label="三等分" value="1:1:1"></el-option>
              <el-option label="左窄右宽" value="1:2"></el-option>
              <el-option label="左宽右窄" value="2:1"></el-option>
              <el-option label="左窄中宽右窄" value="1:2:1"></el-option>
            </el-select>
          </el-form-item>
        </template>

        <!-- 说明文字组件属性设置 -->
        <template v-else-if="formStore.activeItem.type === 'text'">
          <el-form-item label="标题">
            <el-input v-model="formStore.activeItem.title" placeholder="请输入标题"></el-input>
          </el-form-item>
          <el-form-item label="内容">
            <el-input type="textarea" v-model="formStore.activeItem.content" placeholder="请输入说明文字内容"
              :rows="4"></el-input>
          </el-form-item>
          <el-form-item label="字体大小">
            <el-select v-model="formStore.activeItem.fontSize" style="width: 100%">
              <el-option label="小" value="12px"></el-option>
              <el-option label="中" value="14px"></el-option>
              <el-option label="大" value="16px"></el-option>
              <el-option label="超大" value="18px"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="文字颜色">
            <el-color-picker v-model="formStore.activeItem.color"></el-color-picker>
          </el-form-item>
        </template>

        <!-- 数字输入框组件属性设置 -->
        <template v-else-if="formStore.activeItem.type === 'number'">
          <el-form-item label="标题">
            <el-input v-model="formStore.activeItem.title" placeholder="请输入标题"></el-input>
          </el-form-item>
          <el-form-item label="编码">
            <el-input v-model="formStore.activeItem.field" placeholder="请输入字段名"></el-input>
          </el-form-item>
          <el-form-item label="提示文字">
            <el-input v-model="formStore.activeItem.placeholder" placeholder="请输入提示文字"></el-input>
          </el-form-item>
          <el-form-item label="最小值">
            <el-input-number v-model="formStore.activeItem.min" :step="1" style="width: 100%"></el-input-number>
          </el-form-item>
          <el-form-item label="最大值">
            <el-input-number v-model="formStore.activeItem.max" :step="1" style="width: 100%"></el-input-number>
          </el-form-item>
          <el-form-item label="步长">
            <el-input-number v-model="formStore.activeItem.step" :step="0.1" :precision="1"
              style="width: 100%"></el-input-number>
          </el-form-item>
          <el-form-item label="是否必填">
            <el-switch v-model="formStore.activeItem.required"></el-switch>
          </el-form-item>
          <el-form-item label="默认值">
            <el-input-number v-model="formStore.activeItem.defaultValue" :step="1"
              style="width: 100%"></el-input-number>
          </el-form-item>
        </template>

        <!-- 单选框组件属性设置 -->
        <template v-else-if="formStore.activeItem.type === 'radio'">
          <el-form-item label="标题">
            <el-input v-model="formStore.activeItem.title" placeholder="请输入标题"></el-input>
          </el-form-item>
          <el-form-item label="编码">
            <el-input v-model="formStore.activeItem.field" placeholder="请输入字段名"></el-input>
          </el-form-item>
          <el-form-item label="选项设置">
            <div class="options-container">
              <draggable v-model="formStore.activeItem.options" handle=".drag-handle-option" :animation="200"
                ghost-class="ghost-option" chosen-class="chosen-option" drag-class="dragging-option">
                <div v-for="(option, optIndex) in formStore.activeItem.options" :key="option.value" class="option-item">
                  <el-icon class="drag-handle-option">
                    <Operation />
                  </el-icon>
                  <el-input v-model="option.label" placeholder="选项名称" class="option-input-full"></el-input>
                  <div class="option-actions">
                    <el-button size="small" circle type="danger" @click="formStore.removeOption(optIndex)" title="删除">
                      <el-icon>
                        <Delete />
                      </el-icon>
                    </el-button>
                  </div>
                </div>
              </draggable>
              <el-button type="primary" text class="add-option-btn" @click="formStore.addOption">
                <el-icon>
                  <Plus />
                </el-icon> 添加选项
              </el-button>
            </div>
          </el-form-item>
          <el-form-item label="显示方式">
            <el-radio-group v-model="formStore.activeItem.asDropdown">
              <el-radio :label="false">单选框组</el-radio>
              <el-radio :label="true">下拉选择器</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="是否必填">
            <el-switch v-model="formStore.activeItem.required"></el-switch>
          </el-form-item>
          <el-form-item label="默认值">
            <el-select v-if="formStore.activeItem.asDropdown" v-model="formStore.activeItem.defaultValue"
              placeholder="请选择默认值" style="width: 100%">
              <el-option v-for="option in formStore.activeItem.options" :key="option.value" :label="option.label"
                :value="option.value"></el-option>
            </el-select>
            <el-radio-group v-else v-model="formStore.activeItem.defaultValue">
              <el-radio v-for="option in formStore.activeItem.options" :key="option.value" :label="option.value">{{
                option.label }}</el-radio>
            </el-radio-group>
          </el-form-item>
        </template>

        <!-- 日期时间区间组件属性设置 -->
        <template v-else-if="formStore.activeItem.type === 'daterange'">
          <el-form-item label="标题">
            <el-input v-model="formStore.activeItem.title" placeholder="请输入标题"></el-input>
          </el-form-item>
          <el-form-item label="编码">
            <el-input v-model="formStore.activeItem.field" placeholder="请输入字段名"></el-input>
          </el-form-item>
          <el-form-item label="提示文字">
            <el-input v-model="formStore.activeItem.placeholder" placeholder="请输入提示文字"></el-input>
          </el-form-item>
          <el-form-item label="日期格式">
            <el-select v-model="formStore.activeItem.format" style="width: 100%">
              <el-option label="年-月-日 时:分:秒" value="YYYY-MM-DD HH:mm:ss"></el-option>
              <el-option label="年-月-日" value="YYYY-MM-DD"></el-option>
              <el-option label="年/月/日" value="YYYY/MM/DD"></el-option>
              <el-option label="年年年年-月月-日日" value="YYYY-MM-DD"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="分隔符">
            <el-input v-model="formStore.activeItem.rangeSeparator" placeholder="请输入日期区间分隔符"></el-input>
          </el-form-item>
          <el-form-item label="是否必填">
            <el-switch v-model="formStore.activeItem.required"></el-switch>
          </el-form-item>
        </template>

        <!-- 普通组件属性设置 -->
        <template v-else>
          <el-form-item label="标题">
            <el-input v-model="formStore.activeItem.title" placeholder="请输入标题"></el-input>
          </el-form-item>
          <el-form-item label="编码">
            <el-input v-model="formStore.activeItem.field" placeholder="请输入字段名"></el-input>
          </el-form-item>
          <el-form-item label="提示文字">
            <el-input v-model="formStore.activeItem.placeholder" placeholder="请输入提示文字"></el-input>
          </el-form-item>
          <el-form-item label="是否必填">
            <el-switch v-model="formStore.activeItem.required"></el-switch>
          </el-form-item>
          <el-form-item label="校验规则">
            <el-select v-model="formStore.activeItem.validator" placeholder="请选择校验规则" style="width: 100%">
              <el-option label="无" value="none"></el-option>
              <el-option label="邮箱" value="email"></el-option>
              <el-option label="手机号" value="phone"></el-option>
              <el-option label="身份证" value="id"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="默认值">
            <el-input v-model="formStore.activeItem.defaultValue" placeholder="请输入默认值"></el-input>
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
import { ref } from 'vue'
import { VueDraggableNext as draggable } from 'vue-draggable-next'
import ComponentRenderer from './ComponentRenderer.vue'
import { Delete, CopyDocument, Iphone, Monitor, ArrowUp, ArrowDown, Plus, Operation } from '@element-plus/icons-vue'
import { useFormDesignStore } from '../../stores/formDesignStore'

// 使用 Pinia store
const formStore = useFormDesignStore()

// 视图模式状态（mobile/pc）
const viewMode = ref('mobile')

// 切换视图模式
const switchView = (mode) => {
  viewMode.value = mode
}

// 拖拽开始
const dragStart = () => {
  formStore.activeItem = null
}

// 拖拽结束
const dragEnd = () => { }
</script>

<style scoped lang="scss">
.form-design-container {
  height: calc(100vh - 60px);
  overflow: hidden;
}

.component-panel {
  background-color: #ffffff;
  border-right: 1px solid #ebeef5;

  .component-header {
    display: flex;
    align-items: center;
    height: 50px;
    border-bottom: 1px solid #ebeef5;

    h3 {
      margin-left: 20px;
      color: #606266;
    }
  }

  .component-list {
    padding: 0 10px;

    .component-category {
      margin-bottom: 15px;

      h4 {
        margin: 10px 0;
        color: #909399;
        font-size: 14px;
        font-weight: normal;
      }

      .component-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 10px;

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

          &:hover {
            background-color: #f0f5ff;
            border-color: #a0cfff;
          }

          .el-icon {
            font-size: 16px;
            margin-right: 8px;
            color: #409eff;
          }

          span {
            font-size: 12px;
            color: #606266;
            font-weight: 500;
          }
        }
      }
    }
  }
}

.design-area {
  background-color: #f7f7f7;
  display: flex;
  flex-direction: column;
  padding: 0px;

  .design-header {
    background-color: #fff;
    height: 50px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid #ebeef5;

    h3 {
      margin-left: 20px;
      color: #606266;
    }

    .view-controls {
      display: flex;
      align-items: center;
      margin-right: 20px;

      .view-icon {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 30px;
        height: 30px;
        border-radius: 50%;
        cursor: pointer;
        transition: background-color 0.3s;

        &.active {
          background-color: #409eff;
          color: #fff;
        }

        &:hover {
          background-color: #e6f7ff;
        }

        .el-icon {
          font-size: 18px;
        }
      }
    }
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
      transition: all 0.3s ease;

      // 根据视图模式调整样式
      &.pc-view {
        width: 90%;
        height: 90%;
        max-width: 900px;
        border-radius: 6px;
        border-width: 1px;
      }
    }
  }
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

  .property-header {
    display: flex;
    align-items: center;
    height: 50px;
    border-bottom: 1px solid #ebeef5;

    h3 {
      margin-left: 15px;
      color: #606266;
    }
  }

  .property-form {
    margin-top: 15px;
    padding: 0 15px;
  }
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

  &.active {
    border-color: #409eff;
    background-color: #f0faff;
  }
}

.drag-handle {
  cursor: move;
}

.form-item-content {
  flex: 1;
}

.form-item-actions {
  margin-left: 10px;
  display: flex;
  flex-direction: column;
  gap: 5px;
  cursor: pointer;
  color: #909399;

  .el-icon {
    &:first-child:hover {
      color: #409EFF;
    }

    &:last-child:hover {
      color: #F56C6C;
    }
  }
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

  .required {
    color: #f56c6c;
    margin-left: 4px;
  }
}

.form-item-control {
  width: 100%;
}

/* 拖动动画相关样式 */
.ghost-item {
  opacity: 0.5;
  background: linear-gradient(135deg, #c8ebfb 0%, #a0cfff 100%) !important;
  border: 2px dashed #409EFF !important;
  transform: scale(0.98);
  transition: all 0.3s ease;
}

.chosen-item {
  background: linear-gradient(135deg, #f0faff 0%, #d8f0ff 100%) !important;
  border: 2px solid #409EFF !important;
  box-shadow: 0 0 10px rgba(64, 158, 255, 0.3) !important;
  animation: pulse 1.5s infinite;
}

.dragging-item {
  background: #fff !important;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2) !important;
  transform: rotate(3deg) scale(1.03) !important;
  transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) !important;
  z-index: 100 !important;
}

@keyframes pulse {
  0% {
    box-shadow: 0 0 0 0 rgba(64, 158, 255, 0.4);
  }

  70% {
    box-shadow: 0 0 0 10px rgba(64, 158, 255, 0);
  }

  100% {
    box-shadow: 0 0 0 0 rgba(64, 158, 255, 0);
  }
}

/* 选项管理样式 */
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

  .drag-handle-option {
    cursor: move;
    color: #909399;
    padding: 4px;
    margin-right: 4px;
    font-size: 18px;
    /* 增加图标尺寸 */

    &:hover {
      color: #409EFF;
    }
  }

  .option-input {
    flex: 2;
  }

  .option-input-full {
    flex: 1;
    width: 100%;
  }

  .option-value {
    flex: 1;
  }

  .option-actions {
    display: flex;
    gap: 4px;
  }
}

.add-option-btn {
  margin-top: 8px;
  align-self: flex-start;
}

/* 选项拖拽时的样式 */
.ghost-option {
  opacity: 0.5;
  background: #f0f9ff !important;
  border: 1px dashed #409EFF !important;
}
</style>