import { useFlowDesignStore } from '@/stores/flowDesignStore'
import { FlowNodeType } from '@/enums'
import { validateApprover, validateCopyTo, validateHandler } from './handlerValidator'
import { validateInitiator } from './initiatorValidator'
import { validateCondition } from './conditionValidator'
import { createError, saveError } from './error'

// 验证单个流程节点
export function validateNode(node = {}) {
  const nodeId = node.id
  const nodeProps = node.props || {}

  switch (node.type) {
    case FlowNodeType.INITIATE:
      return validateInitiator(nodeId, nodeProps)
    case FlowNodeType.APPROVE:
      return validateApprover(nodeId, nodeProps)
    case FlowNodeType.HANDLE:
      return validateHandler(nodeId, nodeProps)
    case FlowNodeType.CC:
      return validateCopyTo(nodeId, nodeProps)
    case FlowNodeType.CONDITION_BRANCH:
    case FlowNodeType.INCLUSIVE_BRANCH:
      return validateCondition(nodeId, nodeProps)
    default:
      return []
  }
}

const validateFlowNodesRequired = (nodes = []) => {
  const error = nodes.length === 0
    ? createError('flowNodes', 'flowNodes', 'FLOW_NODE_REQUIRED', '请至少添加一个流程节点')
    : null

  return saveError('flowNodes', 'flowNodes', error)
}

// 验证整个流程设计
export function validateFlowDesign(flowData = {}) {
  const flowStore = useFlowDesignStore()
  flowStore.errors = {}

  const errors = []
  // 递归验证多层级节点
  const validateNodes = (nodes = []) => {
    nodes.forEach((node) => {
      errors.push(...validateNode(node))

      if (node.type === FlowNodeType.CONDITION || node.type === FlowNodeType.INCLUSIVE) {
        node.branches?.forEach((branch) => {
          if (!branch.isDefault) {
            errors.push(...validateNode(branch))
          }
          validateNodes(branch.nodes)
        })
      } else {
        node.branches?.forEach((branch) => validateNodes(branch.nodes))
      }
    })
  }

  const flowNodeError = validateFlowNodesRequired(flowData.nodes)
  if (flowNodeError) {
    errors.push(flowNodeError)
  }

  if (flowData.initiator) {
    errors.push(...validateNode(flowData.initiator))
  }
  validateNodes(flowData.nodes)
  return errors
}
