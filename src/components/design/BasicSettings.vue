<script setup>
import { ref, computed } from 'vue'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import PersonSelector from '../common/PersonSelector.vue'
import DesignatedPersonSelector from '../common/DesignatedPersonSelector.vue'

// 将value更名为groupValue，更明确表示是表单分组的选择值
const groupValue = ref('')
// 将options更名为groupOptions，更明确表示是表单分组的选项
const groupOptions = [
  {
    value: 'Option1',
    label: 'Option1',
  },
  {
    value: 'Option2',
    label: 'Option2',
  },
  {
    value: 'Option3',
    label: 'Option3',
  },
  {
    value: 'Option4',
    label: 'Option4',
  },
  {
    value: 'Option5',
    label: 'Option5',
  },
]

// 将textarea更名为formDescription，更明确表示是表单说明文本
const formDescription = ref('')
// 移除未使用的options1变量

const color = ref('#FF8800')  // 默认橙色，与图中一致

// 图标选择器相关
const selectedIcon = ref('Promotion') // 默认选择的图标是"纸飞机"图标
const popoverVisible = ref(false) // 控制弹出框可见性

// 从ElementPlusIconsVue中获取所有图标
const iconList = ref([])
// 将所有图标添加到列表中
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  iconList.value.push({ name: key, component })
}

const selectIcon = (iconName) => {
  selectedIcon.value = iconName
  popoverVisible.value = false // 选择后关闭弹窗
}

// 谁可以发起 设置
const initiatorScope = ref('all')
const selectedInitiators = ref([])

// 模板管理员设置
const adminScope = ref('all')
const selectedAdmins = ref([])
</script>

<template>
  <div class="basic_container">
    <div class="content-wrapper">
      <el-form class="form-container" label-position="top" label-width="100px">
        <el-form-item label="表单图标">
          <div class="icon-selection">
            <div class="icon-box" :style="{ backgroundColor: color }">
              <el-icon size="32" color="#ffffff">
                <component :is="selectedIcon" />
              </el-icon>
            </div>
            <div class="option-item">
              <span>选择背景色</span>
              <el-color-picker v-model="color" size="small"
                :predefine="['#FF8800', '#409EFF', '#67C23A', '#E6A23C', '#F56C6C']" />
            </div>
            <div class="option-item">
              <span>选择图标</span>
              <el-popover placement="bottom-start" :width="350" trigger="click" v-model:visible="popoverVisible">
                <template #reference>
                  <el-icon size="20">
                    <component :is="selectedIcon" />
                  </el-icon>
                </template>
                <div class="icon-picker-container">
                  <div class="icon-picker">
                    <div class="icon-picker-item" v-for="icon in iconList" :key="icon.name"
                      @click="selectIcon(icon.name)">
                      <el-icon>
                        <component :is="icon.name" />
                      </el-icon>
                    </div>
                  </div>
                </div>
              </el-popover>
            </div>
          </div>
        </el-form-item>
        <el-form-item label="表单名称" required>
          <el-input placeholder="请输入"></el-input>
        </el-form-item>
        <el-form-item label="所在分组" required>
          <div class="group-selection-container">
            <el-select v-model="groupValue" placeholder="请选择" size="large" class="group-select">
              <el-option v-for="item in groupOptions" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
            <el-button type="primary" :icon="ElementPlusIconsVue.Plus" size="large"
              class="new-group-btn">新建分组</el-button>
          </div>
        </el-form-item>
        <el-form-item label="表单说明">
          <el-input v-model="formDescription" maxlength="500" style="width: 100%" placeholder="请输入表单说明" show-word-limit
            type="textarea" />
        </el-form-item>

        <!-- 谁可以发起设置 -->
        <el-form-item label="谁可以发起">
          <el-select v-model="initiatorScope" placeholder="请选择发起人范围" style="width: 100%">
            <el-option label="所有人" value="all"></el-option>
            <el-option label="指定人员" value="specified"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item v-if="initiatorScope !== 'all'" label="指定人员" required>
          <designated-person-selector v-model="selectedInitiators" title="选择发起人范围" button-text="添加"
            selector-type="initiator" :required="true" />
        </el-form-item>

        <!-- 模板管理员设置 -->
        <el-form-item label="模板管理员">
          <el-select v-model="adminScope" placeholder="请选择模板管理员" style="width: 100%">
            <el-option label="所有管理员" value="all"></el-option>
            <el-option label="指定管理员" value="specified"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item v-if="adminScope === 'specified'" label="指定管理员" required>
          <designated-person-selector v-model="selectedAdmins" title="选择管理员" button-text="添加" selector-type="admin"
            :required="true" />
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.basic_container {
  box-sizing: border-box;
  padding: 10px 0;
  width: 100%;
  height: calc(100vh - 60px);
  background-color: rgb(245, 246, 246);
  overflow: auto;

  .content-wrapper {
    min-height: 100%;
    margin: 0 auto;
    width: 660px; // 固定宽度
    background-color: rgb(255, 255, 255);
  }

  .form-container {
    width: 100%;
    height: 100%;
    padding: 20px;
    box-sizing: border-box;

    .demonstration {
      margin-right: 10px;
    }
  }
}

.group-selection-container {
  display: flex;
  align-items: center;
  gap: 15px;
  width: 100%;

  .group-select {
    flex: 1;
    min-width: 0; // 防止溢出
  }

  .new-group-btn {
    flex-shrink: 0;
    white-space: nowrap;
  }
}

.icon-selection {
  display: flex;
  align-items: center;
  gap: 20px;

  .icon-box {
    width: 50px;
    height: 50px;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  .option-item {
    display: flex;
    align-items: center;
    gap: 10px;
    align-self: flex-end;

    span {
      white-space: nowrap;
      cursor: pointer;
      transition: all 0.2s ease;

      &:hover {
        color: #409EFF;
      }
    }

    .el-color-picker,
    .el-icon {
      cursor: pointer;
      transition: all 0.2s ease;

      &:hover {
        transform: scale(1.1);
      }
    }
  }
}

.icon-picker-container {
  max-height: 300px;
  overflow-y: auto;
  overflow-x: hidden;
}

.icon-picker {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 8px;
  padding: 15px;
  width: 100%;

  .icon-picker-item {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 32px;
    width: 32px;
    border: 1px solid #dcdfe6;
    border-radius: 4px;
    cursor: pointer;
    transition: all 0.2s;

    &:hover {
      background-color: #f5f7fa;
      border-color: #409EFF;
      color: #409EFF;
    }
  }
}

.icon-select-btn {
  padding: 5px 10px;
}
</style>
