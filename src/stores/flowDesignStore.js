import { reactive, ref } from 'vue'
import { defineStore } from 'pinia'
import { ElMessage } from 'element-plus'
import { FlowNodeType } from '@/enums'
import { INITIATOR_NODE_ID } from '@/constants/flowConstants'

export const useFlowDesignStore = defineStore('flowDesign', () => {
  // 创建默认流程数据（工厂函数，避免默认对象被复用导致引用串改）
  const createDefaultFlowData = () => {
    return {
      id: 'flow_' + Date.now(),
      name: '未命名流程',
      version: '1.0',
      initiator: {
        id: INITIATOR_NODE_ID,
        type: FlowNodeType.INITIATE,
        name: '发起人',
        props: {
          initiator: [],
        },
      },
      nodes: [],
    }
  }

  // 存储完整流程数据
  const flowData = reactive(createDefaultFlowData())

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

  // 重置流程设计数据
  // 注意：这里用 Object.assign 保持 flowData 的响应式引用不变
  const resetFlowDesign = () => {
    Object.assign(flowData, createDefaultFlowData())
    // 其他状态也一并重置
    selectedNode.value = null
    drawerVisible.value = false
  }

  // 导出流程设计数据（用于预览/发布组装）
  const toPayload = () => {
    return {
      ...flowData,
    }
  }

  // 加载流程设计数据（全量覆盖，用于加载接口数据）
  // 注意：建议在外层切换表单时先 reset，再调用该方法
  const loadFlowDesign = (data) => {
    // 外层已先 resetFlowDesign，这里直接覆盖写入即可（不做深拷贝/默认值兜底）
    Object.assign(flowData, data || {})
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
    selectedNode,
    drawerVisible,
    selectNode,
    closeDrawer,
    cancelNodeEdit,
    clearSelectedNode,
    toPayload,
    loadFlowDesign,
    resetFlowDesign,
    deleteNode,
    editCondition,
    formatUserNames,
    copyConditionBranch,
    updateBranchesPriority,
  }
})
