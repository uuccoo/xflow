<template>
  <div class="flow-design-container">
    <div class="flow-canvas">
      <!-- 流程图主体 -->
      <div class="flow-chart">
        <!-- 发起人节点 -->
        <div class="flow-node initiator">
          <div class="node-header">
            <span class="node-icon"><el-icon>
                <User />
              </el-icon></span>
            <span class="node-title">发起人</span>
          </div>
          <div class="node-content">
            <div class="node-item" @click="showPersonSelector">
              <span>所有人</span>
              <el-icon class="chevron-icon">
                <ArrowRight />
              </el-icon>
            </div>
          </div>
        </div>

        <!-- 发起人节点后的添加按钮 - 始终显示 -->
        <div class="node-add-btn">
          <el-popover placement="right-start" :width="280" trigger="click" :hide-after="0" :show-arrow="true"
            :offset="12" popper-class="node-popover" v-model:visible="popoverVisibleMap[0]" @show="handlePopoverShow(0)"
            @hide="handlePopoverHide(0)">
            <template #reference>
              <el-button circle class="add-btn">
                <el-icon>
                  <Plus />
                </el-icon>
              </el-button>
            </template>
            <template #default>
              <div class="menu-title">添加流程节点</div>
              <div class="node-options">
                <div class="node-option-item" v-for="option in nodeOptions" :key="option.type"
                  @click="addNode(option.type, 0)">
                  <div class="option-icon" :style="{ backgroundColor: option.color }">
                    <el-icon>
                      <component :is="option.icon" />
                    </el-icon>
                  </div>
                  <span class="option-name">{{ option.label }}</span>
                </div>
              </div>
            </template>
          </el-popover>
        </div>

        <!-- 动态渲染主流程中的节点 -->
        <template v-for="(node, index) in mainFlowNodes" :key="node.id">
          <!-- 渲染审批人节点 -->
          <div v-if="node.type === 'approver'" class="flow-node approver" :style="getNodeStyle(node)">
            <div class="node-header" :style="getNodeHeaderStyle(node)">
              <span class="node-icon"><el-icon>
                  <User />
                </el-icon></span>
              <span class="node-title">{{ node.name }}</span>
              <el-dropdown trigger="click">
                <span class="el-dropdown-link">
                  <el-icon>
                    <More />
                  </el-icon>
                </span>
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item @click="editNode(node)">编辑节点</el-dropdown-item>
                    <el-dropdown-item @click="deleteNode(node, index)">删除节点</el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </div>
            <div class="node-content">
              <div class="node-item" @click="selectApprovers(node)">
                <span>{{ node.props.approvers.length > 0 ? formatUserNames(node.props.approvers) : '请选择审批人' }}</span>
                <el-icon class="chevron-icon">
                  <ArrowRight />
                </el-icon>
              </div>
            </div>
          </div>

          <!-- 渲染抄送人节点 -->
          <div v-else-if="node.type === 'copyTo'" class="flow-node copyto" :style="getNodeStyle(node)">
            <div class="node-header" :style="getNodeHeaderStyle(node)">
              <span class="node-icon"><el-icon>
                  <Document />
                </el-icon></span>
              <span class="node-title">{{ node.name }}</span>
              <el-dropdown trigger="click">
                <span class="el-dropdown-link">
                  <el-icon>
                    <More />
                  </el-icon>
                </span>
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item @click="editNode(node)">编辑节点</el-dropdown-item>
                    <el-dropdown-item @click="deleteNode(node, index)">删除节点</el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </div>
            <div class="node-content">
              <div class="node-item" @click="selectUsers(node)">
                <span>{{ node.props.users.length > 0 ? formatUserNames(node.props.users) : '请选择抄送人' }}</span>
                <el-icon class="chevron-icon">
                  <ArrowRight />
                </el-icon>
              </div>
            </div>
          </div>

          <!-- 渲染办理节点 -->
          <div v-else-if="node.type === 'process'" class="flow-node process" :style="getNodeStyle(node)">
            <div class="node-header" :style="getNodeHeaderStyle(node)">
              <span class="node-icon"><el-icon>
                  <Edit />
                </el-icon></span>
              <span class="node-title">{{ node.name }}</span>
              <el-dropdown trigger="click">
                <span class="el-dropdown-link">
                  <el-icon>
                    <More />
                  </el-icon>
                </span>
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item @click="editNode(node)">编辑节点</el-dropdown-item>
                    <el-dropdown-item @click="deleteNode(node, index)">删除节点</el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </div>
            <div class="node-content">
              <div class="node-item" @click="selectProcessors(node)">
                <span>{{ node.props.processors.length > 0 ? formatUserNames(node.props.processors) : '请选择办理人' }}</span>
                <el-icon class="chevron-icon">
                  <ArrowRight />
                </el-icon>
              </div>
            </div>
          </div>

          <!-- 其他类型的节点可以按需添加 -->
          <div v-else class="flow-node generic" :style="getNodeStyle(node)">
            <div class="node-header" :style="getNodeHeaderStyle(node)">
              <span class="node-icon"><el-icon>
                  <component :is="getNodeIcon(node.type)" />
                </el-icon></span>
              <span class="node-title">{{ node.name }}</span>
              <el-dropdown trigger="click">
                <span class="el-dropdown-link">
                  <el-icon>
                    <More />
                  </el-icon>
                </span>
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item @click="editNode(node)">编辑节点</el-dropdown-item>
                    <el-dropdown-item @click="deleteNode(node, index)">删除节点</el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </div>
            <div class="node-content">
              <div class="node-item" @click="configureNode(node)">
                <span>点击配置</span>
                <el-icon class="chevron-icon">
                  <ArrowRight />
                </el-icon>
              </div>
            </div>
          </div>

          <!-- 每个节点后面都有一个添加按钮 -->
          <div class="node-add-btn">
            <el-popover placement="right" :width="280" trigger="click" :hide-after="0" :show-arrow="true" :offset="12"
              popper-class="node-popover" v-model:visible="popoverVisibleMap[index + 1]"
              @show="handlePopoverShow(index + 1)" @hide="handlePopoverHide(index + 1)">
              <template #reference>
                <el-button circle class="add-btn">
                  <el-icon>
                    <Plus />
                  </el-icon>
                </el-button>
              </template>
              <template #default>
                <div class="menu-title">添加流程节点</div>
                <div class="node-options">
                  <div class="node-option-item" v-for="option in nodeOptions" :key="option.type"
                    @click="addNode(option.type, index + 1)">
                    <div class="option-icon" :style="{ backgroundColor: option.color }">
                      <el-icon>
                        <component :is="option.icon" />
                      </el-icon>
                    </div>
                    <span class="option-name">{{ option.label }}</span>
                  </div>
                </div>
              </template>
            </el-popover>
          </div>
        </template>

        <!-- 结束节点 -->
        <div class="flow-end">
          <div class="end-node">
            <span>流程结束</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, nextTick, computed } from 'vue'
import {
  User,
  ArrowRight,
  Plus,
  More,
  QuestionFilled,
  Document,
  Edit,
  Connection,
  Sort,
  TurnOff,
  Setting,
  Money
} from '@element-plus/icons-vue'

// 发起人信息
const initiator = ref('zc企业')

// 存储流程节点
const flowNodes = reactive([
  {
    id: 1,
    type: 'initiator',
    name: '发起人',
    props: {
      initiator: 'zc企业'
    }
  }
])

// 当前主要流程节点列表（不包括分支内的节点）
const mainFlowNodes = reactive([])

// 使用对象来跟踪每个位置的 Popover 显示状态
const popoverVisibleMap = reactive({})

// 保存当前活跃的 Popover 位置
const activePopoverPosition = ref(null)

// 处理 Popover 显示事件
const handlePopoverShow = (position) => {
  // 记录当前活跃的位置
  activePopoverPosition.value = position

  // 关闭其他所有 Popover
  Object.keys(popoverVisibleMap).forEach(key => {
    if (parseInt(key) !== position) {
      popoverVisibleMap[key] = false
    }
  })
}

// 处理 Popover 隐藏事件
const handlePopoverHide = (position) => {
  // 只在当前活跃的 Popover 被隐藏时重置活跃状态
  if (activePopoverPosition.value === position) {
    activePopoverPosition.value = null
  }
}

// 节点选项
const nodeOptions = [
  { type: 'approver', label: '审批人', icon: User, color: '#67c23a', headerBg: '#f0f9eb' },
  { type: 'copyTo', label: '抄送人', icon: Document, color: '#409eff', headerBg: '#ecf5ff' },
  { type: 'process', label: '办理', icon: Edit, color: '#e6a23c', headerBg: '#fdf6ec' },
  { type: 'condition', label: '条件分支', icon: TurnOff, color: '#f56c6c', headerBg: '#fef0f0' },
  { type: 'automation', label: '自动化', icon: Setting, color: '#909399', headerBg: '#f4f4f5' },
  { type: 'connector', label: '连接器', icon: Connection, color: '#9254de', headerBg: '#f3f0fa' },
  { type: 'parallel', label: '并行分支', icon: Sort, color: '#1890ff', headerBg: '#e6f7ff' },
  { type: 'payment', label: '付款人', icon: Money, color: '#52c41a', headerBg: '#f6ffed' }
]

// 获取节点样式
const getNodeStyle = (node) => {
  const option = nodeOptions.find(option => option.type === node.type)
  return option ? { borderLeft: `3px solid ${option.color}` } : {}
}

// 获取节点头部样式
const getNodeHeaderStyle = (node) => {
  const option = nodeOptions.find(option => option.type === node.type)
  return option ? { backgroundColor: option.headerBg } : {}
}

// 添加节点 - 使用 Popover 改造后的版本
const addNode = (type, position) => {
  // 生成新节点ID，确保唯一
  const nodeId = Date.now()

  // 根据类型创建不同的节点配置
  let newNode = {
    id: nodeId,
    type: type
  }

  // 根据节点类型设置不同的属性
  switch (type) {
    case 'approver':
      newNode = {
        ...newNode,
        name: '审批人',
        props: {
          approvers: [],
          mode: 'anyone' // 任意一人通过即可，可选值：anyone, all
        }
      }
      break
    case 'copyTo':
      newNode = {
        ...newNode,
        name: '抄送人',
        props: {
          users: []
        }
      }
      break
    case 'process':
      newNode = {
        ...newNode,
        name: '办理',
        props: {
          processors: [],
          mode: 'sequential' // 串行处理，可选值：sequential, parallel
        }
      }
      break
    case 'condition':
      newNode = {
        ...newNode,
        name: '条件分支',
        props: {
          conditions: [
            {
              name: '条件1',
              expression: '',
              priority: 1,
              nodes: []
            },
            {
              name: '条件2',
              expression: '其他条件进入此流程',
              priority: 2,
              nodes: []
            }
          ]
        }
      }
      break
    case 'automation':
      newNode = {
        ...newNode,
        name: '自动化',
        props: {
          actions: []
        }
      }
      break
    case 'connector':
      newNode = {
        ...newNode,
        name: '连接器',
        props: {
          connector: '',
          config: {}
        }
      }
      break
    case 'parallel':
      newNode = {
        ...newNode,
        name: '并行分支',
        props: {
          branches: [
            {
              name: '分支1',
              nodes: []
            },
            {
              name: '分支2',
              nodes: []
            }
          ]
        }
      }
      break
    case 'payment':
      newNode = {
        ...newNode,
        name: '付款人',
        props: {
          payers: [],
          amount: 0
        }
      }
      break
  }

  // 将节点添加到flowNodes数组
  flowNodes.push(newNode)

  // 添加到主流程中的指定位置
  mainFlowNodes.splice(position, 0, newNode)

  // 关闭 Popover
  popoverVisibleMap[position] = false
  activePopoverPosition.value = null

  // 渲染新节点到页面
  renderNewNode(newNode)
}

// 渲染新添加的节点到页面
const renderNewNode = (node) => {
  // 在下一个DOM更新周期后执行
  nextTick(() => {
    console.log(`节点已添加，正在渲染: ${node.name}`, node)
    // 这里实际项目可能需要触发状态更新或其他操作
  })
}

// 编辑节点
const editNode = (node) => {
  console.log('编辑节点', node)
}

// 删除节点
const deleteNode = (node, index) => {
  console.log('删除节点', node)
  mainFlowNodes.splice(index, 1)
}

// 显示人员选择器
const showPersonSelector = () => {
  console.log('显示人员选择器')
}

// 格式化用户名称
const formatUserNames = (users) => {
  return users.map(user => user.name).join(', ')
}

// 获取节点图标
const getNodeIcon = (type) => {
  const option = nodeOptions.find(option => option.type === type)
  return option ? option.icon : null
}

// 选择审批人
const selectApprovers = (node) => {
  console.log('选择审批人', node)
}

// 选择抄送人
const selectUsers = (node) => {
  console.log('选择抄送人', node)
}

// 选择办理人
const selectProcessors = (node) => {
  console.log('选择办理人', node)
}

// 配置节点
const configureNode = (node) => {
  console.log('配置节点', node)
}
</script>

<style scoped lang="scss">
.flow-design-container {
  display: flex;
  height: calc(100vh - 60px);
  overflow: hidden;
}

.flow-canvas {
  flex: 1;
  background-color: #f5f7fa;
  padding: 20px;
  overflow: auto;
  position: relative;
}

.flow-chart {
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-bottom: 50px;
}

/* 节点通用样式 */
.flow-node {
  width: 220px;
  background-color: #fff;
  border-radius: 4px;
  border: 1px solid #e4e7ed;
  margin-bottom: 15px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
  margin-left: auto;
  margin-right: auto;
}

.node-header {
  display: flex;
  align-items: center;
  padding: 8px 12px;
  border-bottom: 1px solid #e4e7ed;
  background-color: #f5f7fa;
  border-radius: 4px 4px 0 0;

  .node-icon {
    margin-right: 5px;
    color: #606266;
  }

  .node-title {
    flex-grow: 1;
    font-size: 14px;
    color: #303133;
    font-weight: 500;
  }

  .node-arrow {
    color: #909399;
  }
}

.node-content {
  padding: 10px 12px;

  .node-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    color: #606266;
    font-size: 14px;

    .chevron-icon {
      color: #c0c4cc;
    }
  }
}

/* 发起人节点样式调整 */
.initiator {
  border-left: 3px solid #409eff;

  .node-header {
    background-color: #ecf5ff;
    padding: 8px 12px;
    display: flex;
    align-items: center;

    .node-icon {
      margin-right: 5px;
      color: #409eff;
      display: flex;
      align-items: center;
    }

    .node-title {
      font-size: 14px;
      color: #303133;
      font-weight: 500;
    }
  }

  .node-content {
    padding: 0;

    .node-item {
      padding: 10px 12px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      color: #606266;
      font-size: 14px;
      cursor: pointer;
      border-top: 1px solid #ebeef5;

      &:hover {
        background-color: #f5f7fa;
      }

      .chevron-icon {
        color: #c0c4cc;
        font-size: 12px;
      }
    }
  }
}

.approver {
  border-left: 3px solid #67c23a;

  .node-header {
    background-color: #f0f9eb;
  }
}

.condition {
  border-left: 3px solid #e6a23c;

  .node-header {
    background-color: #fdf6ec;
  }
}

/* 添加节点按钮 */
.node-add-btn {
  position: relative;
  margin: 15px 0;
  display: flex;
  justify-content: center;
  z-index: 1;

  &::before {
    content: '';
    position: absolute;
    top: -15px;
    left: 50%;
    height: 15px;
    border-left: 1px dashed #c0c4cc;
    z-index: -1;
  }

  .add-btn {
    background-color: #fff;
    border: 1px dashed #c0c4cc;
    color: #409eff;
    transition: all 0.3s;

    &:hover {
      color: #fff;
      background-color: #409eff;
      border-color: #409eff;
    }
  }
}

/* Popover 内容样式 */
:deep(.node-popover) {
  .el-popover__title {
    display: none;
  }
}

/* 弹出菜单内容样式 */
.menu-title {
  padding: 12px;
  font-size: 14px;
  font-weight: 500;
  color: #000;
  border-bottom: 1px solid #e4e7ed;
}

.node-options {
  padding: 12px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;

  .node-option-item {
    display: flex;
    align-items: center;
    padding: 8px;
    cursor: pointer;
    transition: all 0.3s;
    border-radius: 4px;

    &:hover {
      background-color: #f5f7fa;
    }

    .option-icon {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      display: flex;
      justify-content: center;
      align-items: center;
      margin-right: 8px;

      .el-icon {
        font-size: 16px;
        color: #fff;
      }
    }

    .option-name {
      font-size: 12px;
      color: #606266;
    }
  }
}

/* 分支样式 */
.flow-branch {
  width: 100%;
  display: flex;
  gap: 15px;
  position: relative;
  padding-top: 30px;
  margin-bottom: 15px;

  /* 分支上方连接线 */
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 50%;
    height: 30px;
    border-left: 1px dashed #c0c4cc;
  }

  /* 分支顶部横线 */
  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    border-top: 1px dashed #c0c4cc;
  }

  .branch-item {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    position: relative;

    /* 分支顶部竖线 */
    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: 50%;
      height: 30px;
      border-left: 1px dashed #c0c4cc;
    }
  }

  .branch-header {
    background-color: #f5f7fa;
    padding: 3px 10px;
    border-radius: 12px;
    font-size: 12px;
    color: #909399;
    margin-bottom: 15px;
    border: 1px solid #e4e7ed;
    z-index: 1;
  }
}

/* 流程结束点 */
.flow-end {
  position: relative;
  padding-top: 15px;

  /* 连接线 */
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 50%;
    height: 15px;
    border-left: 1px dashed #c0c4cc;
  }

  .end-node {
    padding: 10px 20px;
    background-color: #f5f7fa;
    border-radius: 15px;
    font-size: 14px;
    color: #909399;
    border: 1px solid #e4e7ed;
    text-align: center;
  }
}
</style>