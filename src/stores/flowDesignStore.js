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
        initiator: [],
      },
    },
    nodes: [],
  })

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
    { type: 'payment', label: '付款人', icon: 'Money', color: '#52c41a', headerBg: '#f6ffed' },
  ]

  // 当前选中的节点
  const selectedNode = ref(null)
  // 控制抽屉层显示
  const drawerVisible = ref(false)

  // 选择节点
  const selectNode = (node, index, branch = null) => {
    selectedNode.value = {
      node, // 保存对原始节点的引用
      index,
      branch,
    }

    drawerVisible.value = true
  }

  // 关闭抽屉层
  const closeDrawer = () => {
    drawerVisible.value = false
    // 选中状态保留，只是关闭抽屉
  }

  // 取消节点编辑
  const cancelNodeEdit = () => {
    drawerVisible.value = false
  }

  // 清除选中节点
  const clearSelectedNode = () => {
    selectedNode.value = null
    drawerVisible.value = false
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

  // 删除节点 - 支持删除主流程和分支内的节点
  const deleteNode = (node, index, branch = null) => {
    // 如果没有分支对象，说明是从主流程中删除节点
    if (!branch) {
      flowData.nodes.splice(index, 1)
      console.log('从主流程中删除节点', node, index)
      return
    }

    // 从分支对象中移除节点
    if (branch.nodes) {
      branch.nodes.splice(index, 1)
      console.log('从分支中删除节点', node, index)
    } else {
      console.error('无效的分支对象，缺少nodes数组:', branch)
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

  // 复制条件分支
  const copyConditionBranch = (node, condIndex) => {
    // 获取要复制的条件
    const conditions = node.props.conditions
    const sourceBranch = conditions[condIndex]

    // 如果是默认条件，不允许复制
    if (sourceBranch.name === '默认条件') {
      ElMessage.warning('默认条件不能复制')
      return
    }

    // 创建深拷贝
    const copiedBranch = JSON.parse(JSON.stringify(sourceBranch))

    // 修改名称，避免重名
    const baseName = copiedBranch.name.replace(/\s*\(\d+\)$/, '') // 移除可能已有的 (数字) 后缀
    copiedBranch.name = `${baseName} (复制)`

    // 生成新的优先级（插入在原条件右侧，即索引+1的位置）
    const insertPosition = condIndex + 1

    // 更新优先级
    conditions.splice(insertPosition, 0, copiedBranch)

    // 重新计算所有条件的优先级
    conditions.forEach((condition, idx) => {
      if (condition.name !== '默认条件') {
        condition.priority = idx + 1
      } else {
        condition.priority = conditions.length // 默认条件优先级最低
      }
    })

    ElMessage.success('复制条件分支成功')
    return copiedBranch
  }

  // 格式化用户名称
  const formatUserNames = (users) => {
    return users.map((user) => user.name).join(', ')
  }

  return {
    flowData,
    nodeOptions,
    selectedNode,
    drawerVisible,
    selectNode,
    closeDrawer,
    cancelNodeEdit,
    clearSelectedNode,
    exportFlowData,
    importFlowData,
    validateFlowData,
    previewFlow,
    publishFlow,
    getNodeStyle,
    getNodeHeaderStyle,
    deleteNode,
    editCondition,
    formatUserNames,
    copyConditionBranch,
  }
})
