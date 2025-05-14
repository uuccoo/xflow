<script setup>
import { ref, computed, onMounted } from 'vue'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import PersonSelector from '../common/PersonSelector.vue'
import DesignatedPersonSelector from '../common/DesignatedPersonSelector.vue'
import GroupCreator from '../common/GroupCreator.vue'
import { useBasicSettingsStore } from '../../stores/basicSettingsStore'
import { formGroupApi } from '../../api'
import { ElMessage } from 'element-plus'

// 使用 Pinia store
const basicStore = useBasicSettingsStore()

// 从ElementPlusIconsVue中获取所有图标
const iconList = computed(() => {
  const icons = []
  for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
    icons.push({ name: key, component })
  }
  return icons
})

// 图标选择器相关
const popoverVisible = ref(false) // 控制弹出框可见性

const selectIcon = (iconName) => {
  basicStore.selectedIcon = iconName
  popoverVisible.value = false // 选择后关闭弹窗
}

// 谁可以发起 设置
const initiatorScope = ref('all')
const selectedInitiators = ref([])

// 模板管理员设置
const adminScope = ref('all')
const selectedAdmins = ref([])

// 分组相关
const groupOptions = ref([]) // 分组选项
const newGroupDialogVisible = ref(false) // 新建分组对话框可见性

// 获取分组列表
const fetchGroupList = async () => {
  try {
    const res = await formGroupApi.getFormGroupList()
    if (res.code === 200) {
      groupOptions.value = res.data.map(group => ({
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
  basicStore.groupId = newGroup.id
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
            <div class="icon-box" :style="{ backgroundColor: basicStore.iconColor }">
              <el-icon size="32" color="#ffffff">
                <component :is="basicStore.selectedIcon" />
              </el-icon>
            </div>
            <div class="option-item">
              <span>选择背景色</span>
              <el-color-picker v-model="basicStore.iconColor" size="small"
                :predefine="['#FF8800', '#409EFF', '#67C23A', '#E6A23C', '#F56C6C']" />
            </div>
            <div class="option-item">
              <span>选择图标</span>
              <el-popover placement="bottom-start" :width="350" trigger="click" v-model:visible="popoverVisible">
                <template #reference>
                  <el-icon size="20">
                    <component :is="basicStore.selectedIcon" />
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
          <el-input v-model="basicStore.formName" placeholder="请输入"></el-input>
        </el-form-item>
        <el-form-item label="所在分组" required>
          <div class="group-selection-container">
            <el-select v-model="basicStore.groupId" placeholder="请选择分组" size="large" class="group-select">
              <el-option v-for="item in groupOptions" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
            <GroupCreator v-model:visible="newGroupDialogVisible" @group-created="handleGroupCreated" inline
              buttonText="新建分组" />
          </div>
        </el-form-item>
        <el-form-item label="表单说明">
          <el-input v-model="basicStore.description" maxlength="500" style="width: 100%" placeholder="请输入表单说明"
            show-word-limit type="textarea" />
        </el-form-item>

        <!-- 谁可以发起设置 -->
        <el-form-item label="谁可以发起">
          <el-select v-model="basicStore.initiatorScope" placeholder="请选择发起人范围" style="width: 100%">
            <el-option label="所有人" value="all"></el-option>
            <el-option label="指定人员" value="specified"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item v-if="basicStore.initiatorScope !== 'all'" label="指定人员" required>
          <designated-person-selector v-model="basicStore.selectedInitiators" title="选择发起人范围" button-text="添加"
            selector-type="initiator" :required="true" />
        </el-form-item>

        <!-- 模板管理员设置 -->
        <el-form-item label="模板管理员">
          <el-select v-model="basicStore.adminScope" placeholder="请选择模板管理员" style="width: 100%">
            <el-option label="所有管理员" value="all"></el-option>
            <el-option label="指定管理员" value="specified"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item v-if="basicStore.adminScope === 'specified'" label="指定管理员" required>
          <designated-person-selector v-model="basicStore.selectedAdmins" title="选择管理员" button-text="添加"
            selector-type="admin" :required="true" />
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
