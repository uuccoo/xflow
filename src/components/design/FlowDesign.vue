<template>
  <div class="flow-design-container">
    <div class="flow-canvas">
      <!-- 流程图主体 -->
      <div class="flow-chart">
        <!-- 发起人节点 -->
        <flow-node-renderer :node="flowData.initiator" :index="-1" :nodeOptions="nodeOptions"
          :getPopoverVisible="getPopoverVisible" :setPopoverVisible="setPopoverVisible"
          @select-initiator="showPersonSelector" />

        <!-- 发起人节点后的添加按钮 - 始终显示 -->
        <node-add-button :position="0" :nodeOptions="nodeOptions" :visible="getPopoverVisible(0)"
          @update:visible="val => setPopoverVisible(0, val)" @add="handleAddNodeEvent" @show="handlePopoverShow"
          @hide="handlePopoverHide" @select-approvers="selectApprovers" @select-users="selectUsers"
          @select-processors="selectProcessors" />

        <!-- 动态渲染主流程中的节点 -->
        <template v-for="(node, index) in flowData.nodes" :key="node.id">
          <!-- 使用通用节点组件渲染所有节点类型 -->
          <flow-node-renderer :node="node" :index="index" :nodeOptions="nodeOptions"
            :getPopoverVisible="getPopoverVisible" :setPopoverVisible="setPopoverVisible" @delete="deleteNode"
            @select-initiator="showPersonSelector" @select-approvers="selectApprovers" @select-users="selectUsers"
            @select-processors="selectProcessors" @edit-condition="editCondition" @edit-branch="editBranch"
            @add-node-to-condition="handleAddNodeToCondition" @add-node-to-parallel="handleAddNodeToParallel"
            @popover-show="handlePopoverShow" @popover-hide="handlePopoverHide" @configure="configureNode" />

          <!-- 每个节点后面都有一个添加按钮 -->
          <node-add-button :position="index + 1" :nodeOptions="nodeOptions" :visible="getPopoverVisible(index + 1)"
            @update:visible="val => setPopoverVisible(index + 1, val)" @add="handleAddNodeEvent"
            @show="handlePopoverShow" @hide="handlePopoverHide" @select-approvers="selectApprovers"
            @select-users="selectUsers" @select-processors="selectProcessors" />
        </template>

        <!-- 结束节点 -->
        <flow-node-renderer :node="{ type: 'end' }" :index="-2" :nodeOptions="nodeOptions" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, nextTick, computed } from 'vue'
import { ElMessage } from 'element-plus'
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
  Money,
  Delete
} from '@element-plus/icons-vue'
import NodeAddButton from './NodeAddButton.vue'
import FlowNodeRenderer from './flow/FlowNodeRenderer.vue'

// 发起人信息
const initiator = ref('zc企业')

// 存储完整流程数据（统一节点数据结构）
// 存储完整流程数据（统一节点数据结构）
const flowData = reactive({
  id: 'flow-' + Date.now(),
  name: '未命名流程',
  version: '1.0',
  initiator: {
    id: 1,
    type: 'initiator',
    name: '发起人',
    props: {
      initiator: 'zc企业'
    }
  },
  nodes: [] // 替代原来的 mainFlowNodes
})

// 使用 Map 来跟踪每个位置的 Popover 显示状态
const popoverVisibleMap = reactive(new Map());

// 保存当前活跃的 Popover 位置
const activePopoverPosition = ref(null);

// 获取 Popover 显示状态
const getPopoverVisible = (position) => {
  return popoverVisibleMap.get(String(position)) || false
}

// 设置 Popover 显示状态
const setPopoverVisible = (position, value) => {
  popoverVisibleMap.set(String(position), value)
}

// 条件分支的弹窗状态管理
const getConditionPopoverVisible = (nodeIndex, condIndex) => {
  const key = `${nodeIndex}-${condIndex}`;
  return getPopoverVisible(key)
}

const setConditionPopoverVisible = (nodeIndex, condIndex, value) => {
  const key = `${nodeIndex}-${condIndex}`;
  setPopoverVisible(key, value)
}

// 并行分支的弹窗状态管理
const getParallelPopoverVisible = (nodeIndex, branchIndex) => {
  const key = `${nodeIndex}-p${branchIndex}`;
  return getPopoverVisible(key)
}

const setParallelPopoverVisible = (nodeIndex, branchIndex, value) => {
  const key = `${nodeIndex}-p${branchIndex}`;
  setPopoverVisible(key, value)
}

// 处理 Popover 显示事件
const handlePopoverShow = (position) => {
  console.log('显示弹窗，位置:', position);
  // 记录当前活跃的位置
  activePopoverPosition.value = position;

  // 关闭其他所有 Popover
  popoverVisibleMap.forEach((value, key) => {
    if (key !== String(position)) {
      popoverVisibleMap.set(key, false);
    }
  });
}

// 处理 Popover 隐藏事件
const handlePopoverHide = (position) => {
  // 只在当前活跃的 Popover 被隐藏时重置活跃状态
  if (activePopoverPosition.value === position) {
    activePopoverPosition.value = null
  }
}

// 导出完整流程数据（用于保存或传输）
const exportFlowData = () => {
  return {
    ...flowData,
    updateTime: new Date().toISOString()
  }
}

// 导入流程数据
const importFlowData = (data) => {
  if (!data || !data.id) {
    ElMessage.error('导入的流程数据无效');
    return false;
  }

  // 验证数据结构
  if (!validateFlowData(data)) {
    return false;
  }

  // 重置当前数据
  flowData.id = data.id;
  flowData.name = data.name || '未命名流程';
  flowData.version = data.version || '1.0';

  // 导入发起人
  if (data.initiator) {
    flowData.initiator = data.initiator;
  }

  // 导入节点
  flowData.nodes = data.nodes || [];

  ElMessage.success('流程数据导入成功');
  return true;
}

// 验证流程数据完整性
const validateFlowData = (data) => {
  const errors = [];

  // 1. 基本信息验证
  if (!data.name) {
    errors.push('流程名称不能为空');
  }

  // 2. 验证发起人
  if (!data.initiator || !data.initiator.props || !data.initiator.props.initiator) {
    errors.push('流程发起人未配置');
  }

  // 3. 验证节点配置
  if (data.nodes && data.nodes.length > 0) {
    data.nodes.forEach((node, index) => {
      // 审批人节点
      if (node.type === 'approver' && (!node.props.approvers || node.props.approvers.length === 0)) {
        errors.push(`第${index + 1}个节点(${node.name})未配置审批人`);
      }

      // 办理节点
      if (node.type === 'process' && (!node.props.processors || node.props.processors.length === 0)) {
        errors.push(`第${index + 1}个节点(${node.name})未配置办理人`);
      }

      // 抄送人节点
      if (node.type === 'copyTo' && (!node.props.users || node.props.users.length === 0)) {
        errors.push(`第${index + 1}个节点(${node.name})未配置抄送人`);
      }

      // 条件节点
      if (node.type === 'condition') {
        const conditions = node.props.conditions || [];
        if (conditions.length < 2) {
          errors.push(`第${index + 1}个节点(条件分支)至少需要两个条件`);
        }

        // 检查非默认条件的表达式
        conditions.forEach((condition, condIndex) => {
          if (condition.name !== '默认条件' && !condition.expression) {
            errors.push(`第${index + 1}个节点的条件${condIndex + 1}未配置条件表达式`);
          }
        });
      }

      // 并行节点
      if (node.type === 'parallel') {
        const branches = node.props.branches || [];
        if (branches.length < 2) {
          errors.push(`第${index + 1}个节点(并行分支)至少需要两个分支`);
        }
      }
    });
  } else {
    errors.push('流程至少需要一个节点');
  }

  // 显示验证结果
  if (errors.length > 0) {
    ElMessage.error(`流程数据验证失败: ${errors[0]}`);
    console.error('流程验证错误', errors);
    return false;
  }

  return true;
}

// 预览流程
const previewFlow = () => {
  if (validateFlowData(flowData)) {
    ElMessage.success('流程验证通过，可以预览');
    console.log('预览流程数据', exportFlowData());
    // 此处可以打开预览弹窗或导航到预览页面
    return true;
  }
  return false;
}

// 发布流程
const publishFlow = () => {
  if (validateFlowData(flowData)) {
    ElMessage.success('流程验证通过，可以发布');
    const publishData = exportFlowData();
    console.log('发布流程数据', publishData);
    // 此处可以发送请求保存流程数据
    return true;
  }
  return false;
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

// 简化版的添加节点事件处理
const handleAddNodeEvent = (payload) => {
  const { type, position, node } = payload;

  // 如果NodeAddButton组件已经创建了节点对象
  if (node) {
    // 直接添加到主流程中的指定位置
    flowData.nodes.splice(position, 0, node);
  } else {
    // 兼容旧版本处理方式
    addNode(type, position);
  }

  // 关闭 Popover
  setPopoverVisible(position, false);
  activePopoverPosition.value = null;

  console.log(`节点已添加到位置 ${position}:`, node || type);
}

// 处理在条件分支内添加节点
const handleAddNodeToCondition = (payload, parentNode, condition) => {
  const { type, position } = payload;
  // 解析位置标识，可能包含多级嵌套路径
  const positionParts = position.split('-');

  // 创建新节点
  const nodeId = Date.now();
  let newNode = createNodeByType(type, nodeId);

  // 如果要添加的是条件分支节点，为其生成唯一标识符
  if (type === 'condition') {
    newNode.id = `nested-${nodeId}`;
    newNode.isNested = true;  // 标记为嵌套节点，方便特殊处理
  }

  // 将节点添加到条件分支的节点数组中
  condition.nodes.push(newNode);

  // 关闭弹窗
  const [nodeIndex, condIndex] = positionParts.map(Number);
  setConditionPopoverVisible(nodeIndex, condIndex, false);
  activePopoverPosition.value = null;

  console.log(`在条件分支 ${condition.name} 内添加节点:`, newNode);
}

// 处理在并行分支内添加节点
const handleAddNodeToParallel = (payload, parentNode, branch) => {
  const { type, position } = payload;
  const [nodeIndex, branchIndex] = position.split('-p').map(Number);

  // 创建新节点
  const nodeId = Date.now();
  let newNode = createNodeByType(type, nodeId);

  // 将节点添加到并行分支的节点数组中
  branch.nodes.push(newNode);

  // 关闭弹窗
  setParallelPopoverVisible(nodeIndex, branchIndex, false);
  activePopoverPosition.value = null;

  console.log(`在并行分支 ${branch.name} 内添加节点:`, newNode);
}

// 添加节点 - 使用统一的节点管理（保留用于兼容）
const addNode = (type, position) => {
  // 生成新节点ID，确保唯一
  const nodeId = Date.now();

  // 创建新节点
  const newNode = createNodeByType(type, nodeId);

  // 添加到主流程中的指定位置
  flowData.nodes.splice(position, 0, newNode);

  // 更新渲染
  nextTick(() => {
    console.log(`节点已添加: ${newNode.name}`, newNode);
  });
}

// 根据类型创建节点 (保留用于兼容)
const createNodeByType = (type, nodeId) => {
  // 节点类型配置映射
  const nodeConfigs = {
    approver: {
      name: '审批人',
      props: {
        approvers: [],
        mode: 'anyone' // 任意一人通过即可，可选值：anyone, all
      }
    },
    copyTo: {
      name: '抄送人',
      props: {
        users: []
      }
    },
    process: {
      name: '办理',
      props: {
        processors: [],
        mode: 'sequential' // 串行处理，可选值：sequential, parallel
      }
    },
    condition: {
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
            name: '默认条件',
            expression: '其他条件进入此流程',
            priority: 2,
            nodes: []
          }
        ]
      }
    },
    automation: {
      name: '自动化',
      props: {
        actions: []
      }
    },
    connector: {
      name: '连接器',
      props: {
        connector: '',
        config: {}
      }
    },
    parallel: {
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
    },
    payment: {
      name: '付款人',
      props: {
        payers: [],
        amount: 0
      }
    }
  }

  // 获取节点配置
  const config = nodeConfigs[type] || {}
  const option = nodeOptions.find(option => option.type === type)
  const label = option?.label || '未知节点'

  // 创建并返回节点
  return {
    id: nodeId,
    type,
    name: config.name || label,
    props: { ...(config.props || {}) }
  }
}

// 编辑节点
const editNode = (node) => {
  console.log('编辑节点', node)
}

// 删除节点 - 支持删除主流程和分支内的节点
const deleteNode = (node, index, parent = null) => {
  // 如果没有父节点，说明是从主流程中删除节点
  if (!parent) {
    flowData.nodes.splice(index, 1);
    console.log('从主流程中删除节点', node, index, parent);
    return;
  }

  // 根据父节点类型执行不同的删除操作
  if (parent.type === 'condition') {
    // 从条件分支中删除节点
    // index格式: {condIndex: 数字, itemIndex: 数字}
    const { condIndex, itemIndex } = index;
    parent.props.conditions[condIndex].nodes.splice(itemIndex, 1);
    console.log('从条件分支中删除节点', node);
  }
  else if (parent.type === 'parallel') {
    // 从并行分支中删除节点
    // index格式: {branchIndex: 数字, itemIndex: 数字}
    const { branchIndex, itemIndex } = index;
    parent.props.branches[branchIndex].nodes.splice(itemIndex, 1);
    console.log('从并行分支中删除节点', node);
  }
  else {
    console.error('未知的父节点类型:', parent.type);
  }
}

// 优化条件分支相关功能
const addCondition = (node) => {
  // 通知数据已更改，节点操作本身已由 FlowNodeCondition 组件实现
  console.log('接收到添加条件分支事件', node);
  // 可以在这里执行任何需要在顶层组件完成的额外操作
}

// 删除条件节点中的某个条件分支
const deleteCondition = (node, condIndex) => {
  // 通知数据已更改，节点操作本身已由 FlowNodeCondition 组件实现
  console.log('接收到删除条件分支事件', condIndex);
  // 可以在这里执行任何需要在顶层组件完成的额外操作
}

// 编辑条件表达式
const editCondition = (node, condIndex, condition) => {
  // 可以打开全局编辑弹窗
  ElMessage({
    message: '正在编辑条件表达式',
    type: 'info'
  })
  console.log('编辑条件表达式', node, condIndex, condition)
}

// 添加并行分支
const addBranch = (node) => {
  // 通知数据已更改，节点操作本身已由 FlowNodeParallel 组件实现
  console.log('接收到添加并行分支事件', node);
  // 可以在这里执行任何需要在顶层组件完成的额外操作
}

// 删除并行分支
const deleteBranch = (node, branchIndex) => {
  // 通知数据已更改，节点操作本身已由 FlowNodeParallel 组件实现
  console.log('接收到删除并行分支事件', branchIndex);
  // 可以在这里执行任何需要在顶层组件完成的额外操作
}

// 编辑并行分支信息
const editBranch = (node, branchIndex, branch) => {
  // 可以打开全局编辑弹窗
  ElMessage({
    message: '正在编辑分支信息',
    type: 'info'
  })
  console.log('编辑分支信息', node, branchIndex, branch)
  // 这里可以打开编辑分支的弹窗

  // 示例：直接修改分支名称
  // branch.name = '新分支名称' + branchIndex
}

// 更新并行分支汇合策略
const updateJoinStrategy = (node, strategy) => {
  // 可选策略：all(全部完成), any(任一完成), majority(多数完成)
  node.props.joinStrategy = strategy
  console.log('更新并行分支汇合策略', strategy)
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
  border-left: 3px solid #f56c6c;

  .node-header {
    background-color: #fef0f0;
  }
}

.condition-branch {
  width: 100%;
  margin-bottom: 10px;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
  background-color: white;

  .condition-content {
    padding: 14px 16px;
    display: flex;
    justify-content: center;
    align-items: center;
    color: #909399;
    font-size: 14px;
    cursor: pointer;

    &:hover {
      background-color: #f5f7fa;
    }
  }
}

/* 删除图标样式 */
.node-delete {
  color: #f56c6c;
  cursor: pointer;
  font-size: 16px;
  margin-left: 5px;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.2s ease-in-out, color 0.3s;
}

.flow-node:hover .node-delete {
  opacity: 1;
  pointer-events: auto;
}

.node-delete:hover {
  color: #ff4d4f;
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

/* 分支容器样式 */
.flow-branch-container {
  width: 100%;
  margin-bottom: 15px;
  position: relative;
}

/* 条件分支顶部按钮样式 */
.condition-add-btn {
  display: flex;
  justify-content: center;
  margin: 10px 0 20px;

  .el-button {
    background-color: white;
    font-size: 13px;
    padding: 8px 20px;
    height: auto;
  }
}

/* 分支样式 */
.flow-branch {
  width: 100%;
  display: flex;
  gap: 30px;
  position: relative;
  padding: 30px 0 0;
  margin-bottom: 15px;

  /* 分支上方连接线 */
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 50%;
    height: 15px;
    border-left: 1px dashed #c0c4cc;
    transform: translateX(-50%);
  }

  /* 分支顶部横线 */
  &::after {
    content: '';
    position: absolute;
    top: 15px;
    left: 20%;
    width: 60%;
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
      top: -15px;
      left: 50%;
      height: 15px;
      border-left: 1px dashed #c0c4cc;
    }
  }

  .branch-header {
    display: flex;
    align-items: center;
    padding: 4px 12px;
    border-radius: 15px;
    font-size: 13px;
    color: #333;
    margin-bottom: 15px;
    background-color: white;
    border: 1px solid #e4e7ed;
    z-index: 1;

    .priority-tag {
      margin-left: 5px;
      color: #909399;
      font-size: 12px;
      font-weight: normal;
    }
  }
}

/* 条件分支内容样式 */
.condition-content {
  padding: 10px 12px;
  display: flex;
  justify-content: center;
  align-items: center;
  color: #606266;
  font-size: 14px;
  cursor: pointer;
  border-top: 1px solid #ebeef5;

  &:hover {
    background-color: #f5f7fa;
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