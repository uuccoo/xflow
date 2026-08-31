import { useFlowDesignStore } from '@/stores/flowDesignStore'

export const APPROVER_FIELD = {
  // 指定审批人
  HANDLERS: 'handlers',
  // 角色审批人
  ROLES: 'roles',
  // 发起人自选范围
  INITIATOR_SELECT_RANGE: 'initiatorSelectRange',
  // 审批人为空时的指定转交人
  EMPTY_APPROVER_TRANSFER_USER: 'emptyApproverTransferUser',
}

const saveError = (nodeId, field, error) => {
  const flowStore = useFlowDesignStore()
  const errorKey = `${nodeId}:${field}`

  if (error) {
    flowStore.errors[errorKey] = error
  } else {
    delete flowStore.errors[errorKey]
  }

  return error
}

const createError = (nodeId, field, code, message) => ({
  module: '流程设计',
  code,
  field,
  message,
  target: { tab: 'flowDesign', nodeId, field },
})

// 读取指定节点字段对应的校验错误消息，返回空字符串表示无错误。
export function getErrorMessage(nodeId, field) {
  const flowStore = useFlowDesignStore()
  return flowStore.errors[`${nodeId}:${field}`]?.message || ''
}

export function validateApproverHandlers(nodeId, value, handlerType) {
  if (handlerType !== 'designated') {
    return saveError(nodeId, APPROVER_FIELD.HANDLERS, null)
  }

  return saveError(
    nodeId,
    APPROVER_FIELD.HANDLERS,
    Array.isArray(value) && value.length > 0
      ? null
      : createError(nodeId, APPROVER_FIELD.HANDLERS, 'APPROVER_REQUIRED', '请至少选择一名审批人'),
  )
}

export function validateApproverRoles(nodeId, value, handlerType) {
  if (handlerType !== 'role') {
    return saveError(nodeId, APPROVER_FIELD.ROLES, null)
  }

  return saveError(
    nodeId,
    APPROVER_FIELD.ROLES,
    Array.isArray(value) && value.length > 0
      ? null
      : createError(nodeId, APPROVER_FIELD.ROLES, 'APPROVER_ROLE_REQUIRED', '请至少选择一个角色'),
  )
}

export function validateInitiatorSelectRange(nodeId, value, handlerType, rangeType) {
  if (handlerType !== 'initiator_select' || rangeType !== 'specified') {
    return saveError(nodeId, APPROVER_FIELD.INITIATOR_SELECT_RANGE, null)
  }

  return saveError(
    nodeId,
    APPROVER_FIELD.INITIATOR_SELECT_RANGE,
    Array.isArray(value) && value.length > 0
      ? null
      : createError(nodeId, APPROVER_FIELD.INITIATOR_SELECT_RANGE, 'INITIATOR_SELECT_RANGE_REQUIRED', '请至少选择一名发起人自选范围人员'),
  )
}

export function validateEmptyApproverTransferUser(nodeId, value, action) {
  if (action !== 'transfer_specific') {
    return saveError(nodeId, APPROVER_FIELD.EMPTY_APPROVER_TRANSFER_USER, null)
  }

  return saveError(
    nodeId,
    APPROVER_FIELD.EMPTY_APPROVER_TRANSFER_USER,
    Array.isArray(value) && value.length > 0
      ? null
      : createError(nodeId, APPROVER_FIELD.EMPTY_APPROVER_TRANSFER_USER, 'EMPTY_APPROVER_TRANSFER_REQUIRED', '请选择转交的指定人员'),
  )
}

export function validateApprover(nodeId, form) {
  return [
    validateApproverHandlers(nodeId, form.handlers, form.handlerType),
    validateApproverRoles(nodeId, form.roles, form.handlerType),
    validateInitiatorSelectRange(
      nodeId,
      form.initiatorSelectRange,
      form.handlerType,
      form.initiatorSelectRangeType,
    ),
    validateEmptyApproverTransferUser(
      nodeId,
      form.emptyApproverTransferUser,
      form.emptyApproverAction,
    ),
  ].filter(Boolean)
}

export function validateFlowDesign(flowData = {}) {
  const flowStore = useFlowDesignStore()
  flowStore.errors = {}

  const errors = []
  const validateNodes = (nodes = []) => {
    nodes.forEach((node) => {
      if (node.type === 'approve') {
        errors.push(...validateApprover(node.id, node.props || {}))
      }

      node.branches?.forEach((branch) => validateNodes(branch.nodes))
    })
  }

  validateNodes(flowData.nodes)
  return errors
}