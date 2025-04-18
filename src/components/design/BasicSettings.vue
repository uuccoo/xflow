<script setup>
import { ref, computed } from 'vue'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'


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

// 人员选择弹窗相关
const dialogVisible = ref(false)
const searchText = ref('')

// 模拟公司部门结构数据 - 改为树形结构
const companyDepartments = ref({
  id: 'company-1',
  name: 'xx科技有限公司',
  checked: false,
  indeterminate: false,
  type: 'company',
  children: [
    {
      name: '生产管理部',
      id: 'dept-1',
      checked: false,
      indeterminate: false,
      type: 'department',
      children: [
        {
          name: '生产一组',
          id: 'dept-1-1',
          checked: false,
          indeterminate: false,
          type: 'department',
          children: []
        },
        {
          name: '生产二组',
          id: 'dept-1-2',
          checked: false,
          indeterminate: false,
          type: 'department',
          children: []
        },
        {
          name: '张经理',
          id: 'user-1-1',
          checked: false,
          type: 'user',
        }
      ]
    },
    {
      name: '行政人事部',
      id: 'dept-2',
      checked: false,
      indeterminate: false,
      type: 'department',
      children: [
        {
          name: '人事组',
          id: 'dept-2-1',
          checked: false,
          indeterminate: false,
          type: 'department',
          children: []
        },
        {
          name: '行政组',
          id: 'dept-2-2',
          checked: false,
          indeterminate: false,
          type: 'department',
          children: []
        },
        {
          name: '李主管',
          id: 'user-2-1',
          checked: false,
          type: 'user',
        }
      ]
    },
    {
      name: '营销服务部',
      id: 'dept-3',
      checked: false,
      indeterminate: false,
      type: 'department',
      children: []
    },
    {
      name: '研发部',
      id: 'dept-4',
      checked: false,
      indeterminate: false,
      type: 'department',
      children: [
        {
          name: '前端组',
          id: 'dept-4-1',
          checked: false,
          indeterminate: false,
          type: 'department',
          children: []
        },
        {
          name: '后端组',
          id: 'dept-4-2',
          checked: false,
          indeterminate: false,
          type: 'department',
          children: []
        }
      ]
    },
    {
      name: '旅人',
      id: 'user-1',
      checked: false,
      type: 'user',
    }
  ]
})

// 当前浏览的部门路径
const currentPath = ref([companyDepartments.value])

// 当前显示的部门内容
const currentDepartment = computed(() => {
  return currentPath.value[currentPath.value.length - 1]
})

// 已选择的用户和部门列表
const selectedUsers = ref([])

// 扁平化处理所有树形数据，找出所有节点
const getAllNodesFlat = (node) => {
  let result = [node]
  if (node.children && node.children.length > 0) {
    node.children.forEach(child => {
      result = result.concat(getAllNodesFlat(child))
    })
  }
  return result
}

// 更新已选列表
const updateSelectedList = () => {
  // 从树形结构中找出所有选中的节点
  const allNodes = getAllNodesFlat(companyDepartments.value)

  selectedUsers.value = allNodes
    .filter(item => item.checked && item.id !== 'company-1') // 排除根公司节点
    .map(item => ({
      id: item.id,
      name: item.name,
      type: item.type
    }))
}

// 更新父节点的状态
const updateParentStatus = (node) => {
  if (!node.children || node.children.length === 0) return

  const allChecked = node.children.every(child => {
    return child.type === 'user' ? child.checked : (child.checked && !child.indeterminate)
  })

  const someChecked = node.children.some(child => {
    return child.checked || child.indeterminate
  })

  node.checked = allChecked
  node.indeterminate = !allChecked && someChecked

  // 递归向上更新所有父节点的状态
  if (currentPath.value.length > 1) {
    for (let i = currentPath.value.length - 2; i >= 0; i--) {
      const parent = currentPath.value[i]
      const childrenStatus = parent.children.map(child => ({
        checked: child.checked,
        indeterminate: child.indeterminate
      }))

      parent.checked = childrenStatus.every(s => s.checked)
      parent.indeterminate = !parent.checked && childrenStatus.some(s => s.checked || s.indeterminate)
    }
  }
}

// 更新子节点的状态
const updateChildrenStatus = (node, checked) => {
  if (!node.children) return

  node.children.forEach(child => {
    child.checked = checked
    child.indeterminate = false

    if (child.children && child.children.length > 0) {
      updateChildrenStatus(child, checked)
    }
  })
}

// 全选/取消全选
const selectAll = ref(false)
const handleSelectAllChange = (val) => {
  selectAll.value = val
  companyDepartments.value.children.forEach(item => {
    item.checked = val
  })

  // 更新已选人员列表
  updateSelectedList()
}

// 单个部门/用户选择变更
const handleDepartmentChange = (item) => {
  // 不需要手动切换checked状态，因为v-model已经处理了状态变更
  // 只需根据最新状态更新右侧列表

  // 更新全选状态
  const allChecked = companyDepartments.value.children.every(item => item.checked)
  selectAll.value = allChecked

  // 更新已选人员列表
  updateSelectedList()
}

// 从已选列表中移除
const removeSelected = (itemToRemove) => {
  // 在整个树结构中查找并取消勾选对应节点
  const findAndUncheck = (node) => {
    if (node.id === itemToRemove.id) {
      node.checked = false
      if (node.type === 'department') {
        node.indeterminate = false
        // 如果是部门，则取消其下所有子节点的勾选
        updateChildrenStatus(node, false)
      }
      return true
    }

    if (node.children && node.children.length > 0) {
      for (const child of node.children) {
        if (findAndUncheck(child)) {
          // 更新父节点的状态
          updateParentStatus(node)
          return true
        }
      }
    }

    return false
  }

  findAndUncheck(companyDepartments.value)

  // 更新已选人员列表
  updateSelectedList()
}

// 清空所有已选
const clearSelected = () => {
  // 递归清空所有选中状态
  const clearCheckedStatus = (node) => {
    node.checked = false
    node.indeterminate = false

    if (node.children && node.children.length > 0) {
      node.children.forEach(clearCheckedStatus)
    }
  }

  clearCheckedStatus(companyDepartments.value)

  // 更新已选人员列表
  updateSelectedList()
}

// 确认选择
const confirmSelection = () => {
  // 将已选人员ID保存到value3中供表单使用
  value3.value = selectedUsers.value.map(item => item.id)
  dialogVisible.value = false
}

// 搜索过滤
const filteredNodesFlat = ref([]);
const isSearchMode = computed(() => searchText.value.trim().length > 0);

// 搜索过滤函数
const handleSearch = () => {
  if (!searchText.value.trim()) {
    filteredNodesFlat.value = [];
    return;
  }

  // 在整个树中搜索匹配的节点
  const keyword = searchText.value.toLowerCase().trim();
  const allNodes = getAllNodesFlat(companyDepartments.value);

  // 过滤匹配的节点，不包括根节点
  filteredNodesFlat.value = allNodes.filter(node =>
    node.id !== 'company-1' &&
    node.name.toLowerCase().includes(keyword)
  );
}

// 监听搜索文本变化
const debouncedSearch = ref(null);
const watchSearchText = () => {
  if (debouncedSearch.value) {
    clearTimeout(debouncedSearch.value);
  }
  debouncedSearch.value = setTimeout(() => {
    handleSearch();
  }, 300);
}

// 当前显示的节点列表（根据是否在搜索模式切换）
const displayNodes = computed(() => {
  if (isSearchMode.value) {
    return filteredNodesFlat.value;
  } else {
    return currentDepartment.value.children || [];
  }
});

// 获取节点的父路径
const getNodePath = (targetId, node = companyDepartments.value, path = []) => {
  // 如果当前节点匹配，返回路径
  if (node.id === targetId) {
    return [...path, node];
  }

  // 如果没有子节点，返回空
  if (!node.children || node.children.length === 0) {
    return null;
  }

  // 遍历所有子节点
  for (const child of node.children) {
    const result = getNodePath(targetId, child, [...path, node]);
    if (result) {
      return result;
    }
  }

  // 没有找到匹配的路径
  return null;
}

// 导航到特定节点所在的目录
const navigateToNode = (nodeId) => {
  const path = getNodePath(nodeId);
  if (path && path.length > 0) {
    // 导航到目标节点的父级
    currentPath.value = path.slice(0, path.length - (path[path.length-1].type === 'user' ? 1 : 0));
    // 清空搜索
    searchText.value = '';
    filteredNodesFlat.value = [];
  }
}

// 获取节点的路径文本表示
const getNodePathText = (nodeId) => {
  const path = getNodePath(nodeId);
  if (!path) return '';

  // 返回除了目标节点以外的路径名称
  return path.slice(0, -1).map(node => node.name).join(' / ');
}

// 初始化方法，在打开弹窗前调用
const initPersonSelector = () => {
  // 根据value3的值初始化选中状态
  const selectedIds = value3.value || [];

  // 递归设置所有节点的选中状态
  const setNodeCheckedState = (node) => {
    if (selectedIds.includes(node.id)) {
      node.checked = true;
    } else {
      node.checked = false;
      node.indeterminate = false;
    }

    if (node.children && node.children.length > 0) {
      node.children.forEach(setNodeCheckedState);

      // 更新父节点状态
      const allChecked = node.children.every(child => child.checked);
      const someChecked = node.children.some(child => child.checked || child.indeterminate);

      if (allChecked) {
        node.checked = true;
        node.indeterminate = false;
      } else if (someChecked) {
        node.checked = false;
        node.indeterminate = true;
      }
    }
  };

  setNodeCheckedState(companyDepartments.value);

  // 重置路径到根节点
  currentPath.value = [companyDepartments.value];

  // 清空搜索
  searchText.value = '';
  filteredNodesFlat.value = [];

  // 更新已选列表
  updateSelectedList();
}

// 重写handleSelect方法，在点击时初始化并显示弹窗
const handleSelect = () => {
  initPersonSelector()
  dialogVisible.value = true
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
            <el-input placeholder="学生家庭调查"></el-input>
          </el-form-item>
          <el-form-item label="所在分组" required>
            <el-select v-model="value" placeholder="Select" size="large" style="width:80%">
              <el-option v-for="item in options" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
            <el-button type="primary" :icon="ElementPlusIconsVue.Plus" size="large"
              style="margin-left:15px">新建分组</el-button>
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

    <!-- 人员选择弹窗 -->
    <el-dialog v-model="dialogVisible" title="请选择可以管理此表单的人员" width="70%" :close-on-click-modal="false" align-center>
      <div class="person-selector-container">
        <!-- 搜索框 -->
        <div class="search-box">
          <el-input
            v-model="searchText"
            placeholder="搜索人员，支持拼音、姓名"
            :prefix-icon="ElementPlusIconsVue.Search"
            clearable
            @input="watchSearchText"
            @clear="filteredNodesFlat = []"
          />
        </div>

        <div class="selector-main">
          <!-- 左侧部门列表 -->
          <div class="department-list">
            <div class="department-list-header">
              <el-checkbox
                v-model="currentDepartment.checked"
                :indeterminate="currentDepartment.indeterminate"
                @change="(val) => {
                  updateChildrenStatus(currentDepartment, val);
                  updateParentStatus(currentDepartment);
                  updateSelectedList();
                }"
              >全选</el-checkbox>
              <div class="level-nav">
                <a
                  href="javascript:;"
                  class="level-nav-item"
                  v-if="currentPath.length > 1"
                  @click="() => {
                    currentPath.pop();
                    updateSelectedList();
                  }"
                >上一级</a>
              </div>
            </div>

            <div class="department-list-content">
              <div class="department-company">
                <span>{{ currentDepartment.name }}</span>
              </div>

              <div
                v-for="item in displayNodes"
                :key="item.id"
                class="department-item"
              >
                <el-checkbox
                  v-model="item.checked"
                  :indeterminate="item.type === 'department' && item.indeterminate"
                  @change="(val) => {
                    if (item.children && item.children.length > 0) {
                      updateChildrenStatus(item, val);
                    }
                    updateParentStatus(currentDepartment);
                    updateSelectedList();
                  }"
                >
                  <span class="department-name">{{ item.name }}</span>
                </el-checkbox>
                <el-icon
                  v-if="item.type === 'department' && item.children && item.children.length > 0"
                  class="chevron-icon"
                  @click="() => {
                    currentPath.push(item);
                    updateSelectedList();
                  }"
                >
                  <ElementPlusIconsVue.ArrowRight />
                </el-icon>
                <span v-if="isSearchMode" class="node-path">{{ getNodePathText(item.id) }}</span>
              </div>
            </div>
          </div>

          <!-- 右侧已选列表 -->
          <div class="selected-list">
            <div class="selected-list-header">
              <span>已选 {{ selectedUsers.length }} 项</span>
              <a href="javascript:;" @click="clearSelected" class="clear-btn">清空</a>
            </div>

            <div class="selected-list-content">
              <div v-for="item in selectedUsers" :key="item.id" class="selected-item">
                <el-icon>
                  <component :is="item.type === 'user' ? ElementPlusIconsVue.User : ElementPlusIconsVue.Folder" />
                </el-icon>
                <span>{{ item.name }}</span>
                <el-icon class="remove-icon" @click="removeSelected(item)">
                  <ElementPlusIconsVue.Close />
                </el-icon>
              </div>
            </div>
          </div>
        </div>
      </div>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="dialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="confirmSelection">确 定</el-button>
        </div>
      </template>
    </el-dialog>
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

  .option-item {
    display: flex;
    align-items: center;
    gap: 10px;

    span {
      white-space: nowrap;
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

/* 人员选择弹窗样式 */
.person-selector-container {
  display: flex;
  flex-direction: column;
  height: 450px;

  .search-box {
    margin-bottom: 15px;
  }

  .selector-main {
    display: flex;
    flex: 1;
    gap: 20px;
    min-height: 380px;

    .department-list,
    .selected-list {
      flex: 1;
      border: 1px solid #e4e7ed;
      border-radius: 4px;
      display: flex;
      flex-direction: column;
      height: 100%;

      &-header {
        padding: 10px 15px;
        border-bottom: 1px solid #e4e7ed;
        display: flex;
        justify-content: space-between;
        align-items: center;

        .level-nav {
          font-size: 14px;

          .level-nav-item {
            color: #909399;
            text-decoration: none;

            &:hover {
              color: #409EFF;
            }
          }
        }

        .clear-btn {
          color: #F56C6C;
          font-size: 14px;
          text-decoration: none;

          &:hover {
            opacity: 0.8;
          }
        }
      }

      &-content {
        flex: 1;
        overflow-y: auto;
        padding: 8px 0;
      }
    }

    .department-company {
      padding: 5px 15px;
      font-weight: 500;
      color: #606266;
      font-size: 14px;
    }

    .department-item {
      padding: 7px 15px;
      display: flex;
      align-items: center;
      cursor: pointer;
      transition: background-color 0.2s;
      flex-wrap: wrap;

      &:hover {
        background-color: #f5f7fa;
      }

      .department-name {
        margin-left: 5px;
      }

      .chevron-icon {
        color: #c0c4cc;
        font-size: 14px;
        margin-left: auto;
      }

      .node-path {
        flex-basis: 100%;
        margin-left: 24px;
        font-size: 12px;
        color: #909399;
        margin-top: 4px;
      }
    }

    .selected-item {
      padding: 7px 15px;
      display: flex;
      align-items: center;
      background-color: #f0f9ff;
      margin: 0 8px 8px;
      border-radius: 3px;

      .el-icon {
        color: #67c23a;
        margin-right: 8px;
      }

      span {
        flex: 1;
        color: #606266;
      }

      .remove-icon {
        cursor: pointer;
        color: #909399;

        &:hover {
          color: #F56C6C;
        }
      }
    }
  }
}

/* 覆盖 Element Plus 弹窗样式 */
:deep(.el-dialog__header) {
  margin-right: 0;
  padding: 15px 20px;
  border-bottom: 1px solid #e4e7ed;
}

:deep(.el-dialog__headerbtn) {
  top: 15px;
  right: 15px;
}

:deep(.el-dialog__title) {
  font-weight: 500;
  font-size: 16px;
}

:deep(.el-dialog__body) {
  padding: 20px;
}

:deep(.el-dialog__footer) {
  border-top: 1px solid #e4e7ed;
  padding: 15px 20px;
}
</style>
