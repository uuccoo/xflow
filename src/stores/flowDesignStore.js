import { reactive, ref } from 'vue'
import { defineStore } from 'pinia'
import { ElMessage } from 'element-plus'
import { FlowNodeType } from '@/enums'
import { INITIATOR_NODE_ID } from '@/constants/flowConstants'

export const useFlowDesignStore = defineStore('flowDesign', () => {
  // 存储完整流程数据
  const flowData = reactive({
    id: 'flow_' + Date.now(),
    name: '未命名流程',
    version: '1.0',
    initiator: {
      id: INITIATOR_NODE_ID,
      type: FlowNodeType.INITIATOR,
      name: '发起人',
      props: {
        initiator: [],
      },
    },
    nodes: [],
  })

  // 节点选项
  const nodeOptions = [
    { type: FlowNodeType.APPROVER, label: '审批人', icon: 'User', color: '#67c23a', headerBg: '#f0f9eb' },
    { type: FlowNodeType.COPY_TO, label: '抄送人', icon: 'Document', color: '#409eff', headerBg: '#ecf5ff' },
    { type: FlowNodeType.PROCESS, label: '办理', icon: 'Edit', color: '#e6a23c', headerBg: '#fdf6ec' },
    {
      type: FlowNodeType.CONDITION,
      label: '条件分支',
      icon: 'TurnOff',
      color: '#f56c6c',
      headerBg: '#fef0f0',
    },
    { type: FlowNodeType.AUTOMATION, label: '自动化', icon: 'Setting', color: '#909399', headerBg: '#f4f4f5' },
    {
      type: FlowNodeType.CONNECTOR,
      label: '连接器',
      icon: 'Connection',
      color: '#9254de',
      headerBg: '#f3f0fa',
    },
    { type: FlowNodeType.PAYMENT, label: '付款人', icon: 'Money', color: '#52c41a', headerBg: '#f6ffed' },
  ]

  // 根据节点类型获取节点选项配置
  const getNodeOption = (nodeType) => {
    return nodeOptions.find((option) => option.type === nodeType) || null
  }

  // 当前选中的节点
  const selectedNode = ref(null)
  // 控制抽屉层显示
  const drawerVisible = ref(false)

  // 选择节点
  // 新增 parentNode 字段，支持传入父节点
  const selectNode = (node, index, branch = null, parentNode = null) => {
    selectedNode.value = {
      node, // 保存对原始节点的引用
      index,
      branch,
      parentNode, // 新增父节点字段
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
    if (!data) {
      throw new Error('流程数据无效')
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
    return true
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
    const branches = node.branches
    const sourceBranch = branches[condIndex]

    // 如果是默认条件，不允许复制
    if (sourceBranch.isDefault) {
      ElMessage.warning('默认条件不能复制')
      return
    }

    // 创建深拷贝
    const copiedBranch = JSON.parse(JSON.stringify(sourceBranch))

    // 生成新的唯一id
    copiedBranch.id = `branch_${Date.now()}`

    // 修改名称，避免重名
    const baseName = copiedBranch.name.replace(/\s*\(\d+\)$/, '') // 移除可能已有的 (数字) 后缀
    copiedBranch.name = `${baseName} (复制)`

    // 确保复制的分支不是默认条件
    copiedBranch.isDefault = false

    // 生成新的优先级（插入在原条件右侧，即索引+1的位置）
    const insertPosition = condIndex + 1

    // 更新优先级
    branches.splice(insertPosition, 0, copiedBranch)

    // 更新所有分支的优先级
    updateBranchesPriority(branches)

    ElMessage.success('复制条件分支成功')
    return copiedBranch
  }

  // 只更新分支的优先级属性
  const updateBranchesPriority = (branches) => {
    if (!branches) return
    // 只为非默认分支分配优先级，按当前顺序
    let priority = 1
    for (const branch of branches) {
      if (!branch.isDefault) {
        branch.priority = priority++
      }
    }
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
    deleteNode,
    editCondition,
    formatUserNames,
    copyConditionBranch,
    updateBranchesPriority,
    getNodeOption,
  }
})
