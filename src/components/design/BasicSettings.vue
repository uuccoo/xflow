<script setup>
import { ref } from 'vue'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import { Plus } from '@element-plus/icons-vue'

const value = ref('')
const value2 = ref([])
const value3 = ref([1, 2, 3])
const options = [
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

const textarea = ref('')
let handleSelect = (value) => {
  console.log("1111")
}
const options1 = []
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
</script>

<template>
  <div class="basic_container">
    <el-row>
      <el-col :span="6"></el-col>
      <el-col :span="12">
        <el-form class="form-container" label-position="top" label-width="100px">
          <el-form-item label="表单图标">
            <div class="icon-selection">
              <div class="icon-box" :style="{ backgroundColor: color }">
                <el-icon size="32" color="#ffffff">
                  <component :is="selectedIcon" />
                </el-icon>
              </div>
              <div class="icon-options">
                <div class="option-item">
                  <span>选择背景色</span>
                  <el-color-picker v-model="color" size="small"
                    :predefine="['#FF8800', '#409EFF', '#67C23A', '#E6A23C', '#F56C6C']" />
                </div>
                <div class="option-item">
                  <span>选择图标</span>
                  <el-popover placement="bottom-start" :width="350" trigger="click" v-model:visible="popoverVisible">
                    <template #reference>
                      <el-button plain size="small" class="icon-select-btn">
                        <el-icon>
                          <ArrowDown />
                        </el-icon>
                      </el-button>
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
            </div>
          </el-form-item>
          <el-form-item label="表单名称" required>
            <el-input placeholder="学生家庭调查"></el-input>
          </el-form-item>
          <el-form-item label="所在分组" required>
            <el-select v-model="value" placeholder="Select" size="large" style="width:80%">
              <el-option v-for="item in options" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
            <el-button type="primary" :icon="Plus" size="large" style="margin-left:15px">新建分组</el-button>
          </el-form-item>
          <el-form-item label="表单说明">
            <el-input v-model="textarea" maxlength="500" style="width: 100%" placeholder="请输入表单说明" show-word-limit
              type="textarea" />
          </el-form-item>
          <el-form-item label="消息通知方式" required>
            <el-select v-model="value2" multiple collapse-tags placeholder="Select" style="width: 30%" clearable>
              <el-option v-for="item in options" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
            <el-input style="width: 70%;padding:10px"></el-input>
          </el-form-item>
          <el-form-item label="谁可以管理此表单">
            <el-select v-model="value3" multiple placeholder="Select" style="width:100%" @click="handleSelect"
              clearable>
              <!-- <el-option v-for="item in options1" :key="item.value" :label="item.label"
                                :value="item.value" /> -->
            </el-select>
          </el-form-item>
        </el-form>
      </el-col>
      <el-col :span="6"></el-col>
    </el-row>
  </div>
</template>

<style lang="scss" scoped>
.basic_container {
  width: 100%;
  height: calc(100vh - 60px);
  background-color: rgb(245, 246, 246);

  .form-container {
    width: 100%;
    height: 100%;
    padding: 20px;
    box-sizing: border-box;
    background-color: rgb(255, 255, 255);
    margin-top:10px;
    .demonstration {
      margin-right: 10px;
    }
  }
}

.icon-selection {
  display: flex;
  align-items: center;
  gap: 20px;

  .icon-box {
    width: 60px;
    height: 60px;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  .icon-options {
    display: flex;
    flex-direction: column;
    gap: 10px;

    .option-item {
      display: flex;
      align-items: center;
      gap: 10px;

      span {
        white-space: nowrap;
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
