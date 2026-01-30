<script setup>
import { ref, computed, onMounted } from 'vue'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import DesignatedPersonSelector from '@/components/common/DesignatedPersonSelector.vue'
import GroupCreator from '@/components/common/GroupCreator.vue'
import { useBasicSettingsStore } from '@/stores/basicSettingsStore'
import { formGroupApi } from '@/api'
import { ElMessage } from 'element-plus'

// 使用 Pinia store
const basicStore = useBasicSettingsStore()
// 直接使用 basicSettings 引用，简化访问（不要解构字段，避免丢失响应式）
const basicSettings = basicStore.basicSettings

// 从ElementPlusIconsVue中获取所有图标
const iconList = computed(() =>
  Object.entries(ElementPlusIconsVue).map(([name, component]) => ({ name, component }))
)

// 图标选择器相关
const popoverVisible = ref(false) // 控制弹出框可见性
const colorPickerVisible = ref(false) // 控制颜色选择器可见性

// 切换弹出框可见性
const togglePopover = () => {
  popoverVisible.value = !popoverVisible.value
}

// 切换颜色选择器可见性
const toggleColorPicker = () => {
  colorPickerVisible.value = !colorPickerVisible.value
}

const selectIcon = (iconName) => {
  basicSettings.selectedIcon = iconName
  popoverVisible.value = false // 选择后关闭弹窗
}

// 分组相关
const groupOptions = ref([]) // 分组选项
const newGroupDialogVisible = ref(false) // 新建分组对话框可见性

// 获取分组列表
const fetchGroupList = async () => {
  try {
    const groupList = await formGroupApi.getFormGroupList()
    if (groupList) {
      groupOptions.value = groupList.map(group => ({
        value: group.id,
        label: group.name
      }))
    }
  } catch (error) {
    console.error('获取分组列表失败:', error)
  }
}

// 处理新分组创建成功
const handleGroupCreated = (newGroup) => {
  // 添加新分组到选项列表
  groupOptions.value.push({
    value: newGroup.id,
    label: newGroup.name
  })
  // 设置当前选中的分组为新建的分组
  basicSettings.groupId = newGroup.id
}

// 组件挂载时获取分组列表
onMounted(() => {
  fetchGroupList()
})
</script>

<template>
  <div class="basic_container">
    <div class="content-wrapper">
      <el-form class="form-container" label-position="top" label-width="100px">
        <el-form-item label="表单图标">
          <div class="icon-selection">
            <div class="icon-box" :style="{ backgroundColor: basicSettings.iconColor }">
              <el-icon size="32" color="#ffffff">
                <component :is="basicSettings.selectedIcon" />
              </el-icon>
            </div>
            <div class="option-item">
              <span class="clickable-text" @click="toggleColorPicker">选择背景色</span>
              <el-color-picker v-model="basicSettings.iconColor" size="small" v-model:visible="colorPickerVisible"
                :predefine="['#FF8800', '#409EFF', '#67C23A', '#E6A23C', '#F56C6C']" />
            </div>
            <div class="option-item">
              <span class="clickable-text" @click="togglePopover">选择图标</span>
              <el-popover placement="bottom-start" :width="350" trigger="click" v-model:visible="popoverVisible">
                <template #reference>
                  <el-icon size="20">
                    <component :is="basicSettings.selectedIcon" />
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
          <el-input v-model="basicSettings.formName" placeholder="请输入" maxlength="50" show-word-limit></el-input>
        </el-form-item>
        <el-form-item label="所在分组" required>
          <div class="group-selection-container">
            <el-select v-model="basicSettings.groupId" placeholder="请选择" size="large" class="group-select">
              <el-option v-for="item in groupOptions" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
            <GroupCreator v-model:visible="newGroupDialogVisible" @group-created="handleGroupCreated" inline
              buttonText="新建分组" />
          </div>
        </el-form-item>
        <el-form-item label="表单说明">
          <el-input v-model="basicSettings.description" maxlength="100" style="width: 100%" placeholder="请输入"
            show-word-limit type="textarea" :rows="3" />
        </el-form-item>

        <!-- 谁可以发起设置 -->
        <el-form-item label="谁可以发起">
          <el-select v-model="basicSettings.initiatorScope" placeholder="请选择发起人范围" style="width: 100%">
            <el-option label="所有人" value="all"></el-option>
            <el-option label="指定人员" value="specified"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item v-if="basicSettings.initiatorScope !== 'all'" required>
          <designated-person-selector
            v-model="basicSettings.selectedInitiators"
            title="选择发起人范围"
            button-text="添加"
            :required="true"
          />
        </el-form-item>

        <!-- 模板管理员设置 -->
        <el-form-item label="模板管理员">
          <el-select v-model="basicSettings.adminScope" placeholder="请选择模板管理员" style="width: 100%">
            <el-option label="所有管理员" value="all"></el-option>
            <el-option label="指定管理员" value="specified"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item v-if="basicSettings.adminScope === 'specified'" required>
          <designated-person-selector
            v-model="basicSettings.selectedAdmins"
            title="选择管理员"
            button-text="添加"
            :required="true"
          />
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

.new-group-dialog {
  padding: 10px 0 20px;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
</style>
