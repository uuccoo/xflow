import { reactive, ref } from 'vue'
import { defineStore } from 'pinia'
import { ElMessage } from 'element-plus'

export const useFlowDesignStore = defineStore('flowDesign', () => {
  // 存储完整流程数据
  const flowData = reactive({
    id: 'flow-' + Date.now(),
    name: '未命名流程',
    version: '1.0',
    initiator: {
      id: 1,
      type: 'initiator',
      name: '发起人',
      props: {
        initiator: 'zc企业',
      },
    },
    nodes: [],
  })

  // 使用 Map 来跟踪每个位置的 Popover 显示状态
  const popoverVisibleMap = reactive(new Map())

  // 保存当前活跃的 Popover 位置
  const activePopoverPosition = ref(null)

  // 节点选项
  const nodeOptions = [
    { type: 'approver', label: '审批人', icon: 'User', color: '#67c23a', headerBg: '#f0f9eb' },
    { type: 'copyTo', label: '抄送人', icon: 'Document', color: '#409eff', headerBg: '#ecf5ff' },
    { type: 'process', label: '办理', icon: 'Edit', color: '#e6a23c', headerBg: '#fdf6ec' },
    {
      type: 'condition',
      label: '条件分支',
      icon: 'TurnOff',
      color: '#f56c6c',
      headerBg: '#fef0f0',
    },
    { type: 'automation', label: '自动化', icon: 'Setting', color: '#909399', headerBg: '#f4f4f5' },
    {
      type: 'connector',
      label: '连接器',
      icon: 'Connection',
      color: '#9254de',
      headerBg: '#f3f0fa',
    },
    { type: 'parallel', label: '并行分支', icon: 'Sort', color: '#1890ff', headerBg: '#e6f7ff' },
    { type: 'payment', label: '付款人', icon: 'Money', color: '#52c41a', headerBg: '#f6ffed' },
  ]

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
    const key = `${nodeIndex}-${condIndex}`
    return getPopoverVisible(key)
  }

  const setConditionPopoverVisible = (nodeIndex, condIndex, value) => {
    const key = `${nodeIndex}-${condIndex}`
    setPopoverVisible(key, value)
  }

  // 并行分支的弹窗状态管理
  const getParallelPopoverVisible = (nodeIndex, branchIndex) => {
    const key = `${nodeIndex}-p${branchIndex}`
    return getPopoverVisible(key)
  }

  const setParallelPopoverVisible = (nodeIndex, branchIndex, value) => {
    const key = `${nodeIndex}-p${branchIndex}`
    setPopoverVisible(key, value)
  }

  // 处理 Popover 显示事件
  const handlePopoverShow = (position) => {
    console.log('显示弹窗，位置:', position)
    // 记录当前活跃的位置
    activePopoverPosition.value = position

    // 关闭其他所有 Popover
    popoverVisibleMap.forEach((value, key) => {
      if (key !== String(position)) {
        popoverVisibleMap.set(key, false)
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

  // 导出完整流程数据
  const exportFlowData = () => {
    return {
      ...flowData,
      updateTime: new Date().toISOString(),
    }
  }

  // 导入流程数据
  const importFlowData = (data) => {
    if (!data || !data.id) {
      ElMessage.error('导入的流程数据无效')
      return false
    }

    // 验证数据结构
    if (!validateFlowData(data)) {
      return false
    }

    // 重置当前数据
    flowData.id = data.id
    flowData.name = data.name || '未命名流程'
    flowData.version = data.version || '1.0'

    // 导入发起人
    if (data.initiator) {
      flowData.initiator = data.initiator
    }

    // 导入节点
    flowData.nodes = data.nodes || []

    ElMessage.success('流程数据导入成功')
    return true
  }

  // 验证流程数据完整性
  const validateFlowData = (data) => {
    const errors = []

    // 1. 基本信息验证
    if (!data.name) {
      errors.push('流程名称不能为空')
    }

    // 2. 验证发起人
    if (!data.initiator || !data.initiator.props || !data.initiator.props.initiator) {
      errors.push('流程发起人未配置')
    }

    // 3. 验证节点配置
    if (data.nodes && data.nodes.length > 0) {
      data.nodes.forEach((node, index) => {
        // 审批人节点
        if (
          node.type === 'approver' &&
          (!node.props.approvers || node.props.approvers.length === 0)
        ) {
          errors.push(`第${index + 1}个节点(${node.name})未配置审批人`)
        }

        // 办理节点
        if (
          node.type === 'process' &&
          (!node.props.processors || node.props.processors.length === 0)
        ) {
          errors.push(`第${index + 1}个节点(${node.name})未配置办理人`)
        }

        // 抄送人节点
        if (node.type === 'copyTo' && (!node.props.users || node.props.users.length === 0)) {
          errors.push(`第${index + 1}个节点(${node.name})未配置抄送人`)
        }

        // 条件节点
        if (node.type === 'condition') {
          const conditions = node.props.conditions || []
          if (conditions.length < 2) {
            errors.push(`第${index + 1}个节点(条件分支)至少需要两个条件`)
          }

          // 检查非默认条件的表达式
          conditions.forEach((condition, condIndex) => {
            if (condition.name !== '默认条件' && !condition.expression) {
              errors.push(`第${index + 1}个节点的条件${condIndex + 1}未配置条件表达式`)
            }
          })
        }

        // 并行节点
        if (node.type === 'parallel') {
          const branches = node.props.branches || []
          if (branches.length < 2) {
            errors.push(`第${index + 1}个节点(并行分支)至少需要两个分支`)
          }
        }
      })
    } else {
      errors.push('流程至少需要一个节点')
    }

    // 显示验证结果
    if (errors.length > 0) {
      ElMessage.error(`流程数据验证失败: ${errors[0]}`)
      console.error('流程验证错误', errors)
      return false
    }

    return true
  }

  // 预览流程
  const previewFlow = () => {
    if (validateFlowData(flowData)) {
      ElMessage.success('流程验证通过，可以预览')
      console.log('预览流程数据', exportFlowData())
      return true
    }
    return false
  }

  // 发布流程
  const publishFlow = () => {
    if (validateFlowData(flowData)) {
      ElMessage.success('流程验证通过，可以发布')
      const publishData = exportFlowData()
      console.log('发布流程数据', publishData)
      return true
    }
    return false
  }

  // 获取节点样式
  const getNodeStyle = (node) => {
    const option = nodeOptions.find((option) => option.type === node.type)
    return option ? { borderLeft: `3px solid ${option.color}` } : {}
  }

  // 获取节点头部样式
  const getNodeHeaderStyle = (node) => {
    const option = nodeOptions.find((option) => option.type === node.type)
    return option ? { backgroundColor: option.headerBg } : {}
  }

  // 添加节点
  const addNode = (type, position) => {
    // 生成新节点ID，确保唯一
    const nodeId = Date.now()

    // 创建新节点
    const newNode = createNodeByType(type, nodeId)

    // 添加到主流程中的指定位置
    flowData.nodes.splice(position, 0, newNode)

    console.log(`节点已添加: ${newNode.name}`, newNode)
    return newNode
  }

  // 简化版的添加节点事件处理
  const handleAddNodeEvent = (payload) => {
    const { type, position, node } = payload

    // 如果已经创建了节点对象
    if (node) {
      // 直接添加到主流程中的指定位置
      flowData.nodes.splice(position, 0, node)
    } else {
      // 创建并添加节点
      addNode(type, position)
    }

    // 关闭 Popover
    setPopoverVisible(position, false)
    activePopoverPosition.value = null

    console.log(`节点已添加到位置 ${position}:`, node || type)
  }

  // 处理在条件分支内添加节点
  const handleAddNodeToCondition = (payload, parentNode, condition) => {
    const { type, position } = payload
    // 解析位置标识，可能包含多级嵌套路径
    const positionParts = position.split('-')

    // 创建新节点
    const nodeId = Date.now()
    let newNode = createNodeByType(type, nodeId)

    // 如果要添加的是条件分支节点，为其生成唯一标识符
    if (type === 'condition') {
      newNode.id = `nested-${nodeId}`
      newNode.isNested = true // 标记为嵌套节点，方便特殊处理
    }

    // 将节点添加到条件分支的节点数组中
    condition.nodes.push(newNode)

    // 关闭弹窗
    const [nodeIndex, condIndex] = positionParts.map(Number)
    setConditionPopoverVisible(nodeIndex, condIndex, false)
    activePopoverPosition.value = null

    console.log(`在条件分支 ${condition.name} 内添加节点:`, newNode)
  }

  // 处理在并行分支内添加节点
  const handleAddNodeToParallel = (payload, parentNode, branch) => {
    const { type, position } = payload
    const [nodeIndex, branchIndex] = position.split('-p').map(Number)

    // 创建新节点
    const nodeId = Date.now()
    let newNode = createNodeByType(type, nodeId)

    // 将节点添加到并行分支的节点数组中
    branch.nodes.push(newNode)

    // 关闭弹窗
    setParallelPopoverVisible(nodeIndex, branchIndex, false)
    activePopoverPosition.value = null

    console.log(`在并行分支 ${branch.name} 内添加节点:`, newNode)
  }

  // 根据类型创建节点
  const createNodeByType = (type, nodeId) => {
    // 节点类型配置映射
    const nodeConfigs = {
      approver: {
        name: '审批人',
        props: {
          approvers: [],
          mode: 'anyone', // 任意一人通过即可，可选值：anyone, all
        },
      },
      copyTo: {
        name: '抄送人',
        props: {
          users: [],
        },
      },
      process: {
        name: '办理',
        props: {
          processors: [],
          mode: 'sequential', // 串行处理，可选值：sequential, parallel
        },
      },
      condition: {
        name: '条件分支',
        props: {
          conditions: [
            {
              name: '条件1',
              expression: '',
              priority: 1,
              nodes: [],
            },
            {
              name: '默认条件',
              expression: '其他条件进入此流程',
              priority: 2,
              nodes: [],
            },
          ],
        },
      },
      automation: {
        name: '自动化',
        props: {
          actions: [],
        },
      },
      connector: {
        name: '连接器',
        props: {
          connector: '',
          config: {},
        },
      },
      parallel: {
        name: '并行分支',
        props: {
          branches: [
            {
              name: '分支1',
              nodes: [],
            },
            {
              name: '分支2',
              nodes: [],
            },
          ],
        },
      },
      payment: {
        name: '付款人',
        props: {
          payers: [],
          amount: 0,
        },
      },
    }

    // 获取节点配置
    const config = nodeConfigs[type] || {}
    const option = nodeOptions.find((option) => option.type === type)
    const label = option?.label || '未知节点'

    // 创建并返回节点
    return {
      id: nodeId,
      type,
      name: config.name || label,
      props: { ...(config.props || {}) },
    }
  }

  // 删除节点 - 支持删除主流程和分支内的节点
  const deleteNode = (node, index, parent = null) => {
    // 如果没有父节点，说明是从主流程中删除节点
    if (!parent) {
      flowData.nodes.splice(index, 1)
      console.log('从主流程中删除节点', node, index)
      return
    }

    // 根据父节点类型执行不同的删除操作
    if (parent.type === 'condition') {
      // 从条件分支中删除节点
      // index格式: {condIndex: 数字, itemIndex: 数字}
      const { condIndex, itemIndex } = index
      parent.props.conditions[condIndex].nodes.splice(itemIndex, 1)
      console.log('从条件分支中删除节点', node)
    } else if (parent.type === 'parallel') {
      // 从并行分支中删除节点
      // index格式: {branchIndex: 数字, itemIndex: 数字}
      const { branchIndex, itemIndex } = index
      parent.props.branches[branchIndex].nodes.splice(itemIndex, 1)
      console.log('从并行分支中删除节点', node)
    } else {
      console.error('未知的父节点类型:', parent.type)
    }
  }

  // 编辑条件表达式
  const editCondition = (node, condIndex, condition) => {
    ElMessage({
      message: '正在编辑条件表达式',
      type: 'info',
    })
    console.log('编辑条件表达式', node, condIndex, condition)
  }

  // 编辑并行分支信息
  const editBranch = (node, branchIndex, branch) => {
    ElMessage({
      message: '正在编辑分支信息',
      type: 'info',
    })
    console.log('编辑分支信息', node, branchIndex, branch)
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
    return users.map((user) => user.name).join(', ')
  }

  // 配置节点
  const configureNode = (node) => {
    console.log('配置节点', node)
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

  return {
    flowData,
    nodeOptions,
    popoverVisibleMap,
    activePopoverPosition,
    getPopoverVisible,
    setPopoverVisible,
    getConditionPopoverVisible,
    setConditionPopoverVisible,
    getParallelPopoverVisible,
    setParallelPopoverVisible,
    handlePopoverShow,
    handlePopoverHide,
    exportFlowData,
    importFlowData,
    validateFlowData,
    previewFlow,
    publishFlow,
    getNodeStyle,
    getNodeHeaderStyle,
    addNode,
    handleAddNodeEvent,
    handleAddNodeToCondition,
    handleAddNodeToParallel,
    createNodeByType,
    deleteNode,
    editCondition,
    editBranch,
    updateJoinStrategy,
    showPersonSelector,
    formatUserNames,
    configureNode,
    selectApprovers,
    selectUsers,
    selectProcessors,
  }
})
