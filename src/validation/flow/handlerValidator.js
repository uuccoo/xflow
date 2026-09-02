import { createError, getErrorMessage, saveError } from './error'

export const HANDLER_FIELD = {
  // 处理人（指定人员）
  HANDLERS: 'handlers',
  // 处理人（角色）
  ROLES: 'roles',
  // 发起人自选范围
  INITIATOR_SELECT_RANGE: 'initiatorSelectRange',
  // 空审批人转交用户
  EMPTY_APPROVER_TRANSFER_USER: 'emptyApproverTransferUser',
}

export function validateHandlers(nodeId, value, handlerType) {
  if (handlerType !== 'designated') {
    return saveError(nodeId, HANDLER_FIELD.HANDLERS, null)
  }

  return saveError(
    nodeId,
    HANDLER_FIELD.HANDLERS,
    Array.isArray(value) && value.length > 0
      ? null
      : createError(nodeId, HANDLER_FIELD.HANDLERS, 'HANDLER_REQUIRED', '请至少选择一名人员'),
  )
}

export function validateRoles(nodeId, value, handlerType) {
  if (handlerType !== 'role') {
    return saveError(nodeId, HANDLER_FIELD.ROLES, null)
  }

  return saveError(
    nodeId,
    HANDLER_FIELD.ROLES,
    Array.isArray(value) && value.length > 0
      ? null
      : createError(nodeId, HANDLER_FIELD.ROLES, 'HANDLER_ROLE_REQUIRED', '请至少选择一个角色'),
  )
}

export function validateInitiatorSelectRange(nodeId, value, handlerType, rangeType) {
  if (handlerType !== 'initiator_select' || rangeType !== 'specified') {
    return saveError(nodeId, HANDLER_FIELD.INITIATOR_SELECT_RANGE, null)
  }

  return saveError(
    nodeId,
    HANDLER_FIELD.INITIATOR_SELECT_RANGE,
    Array.isArray(value) && value.length > 0
      ? null
      : createError(nodeId, HANDLER_FIELD.INITIATOR_SELECT_RANGE, 'INITIATOR_SELECT_RANGE_REQUIRED', '请至少选择一名发起人自选范围人员'),
  )
}

export function validateEmptyApproverTransferUser(nodeId, value, action) {
  if (action !== 'transfer_specific') {
    return saveError(nodeId, HANDLER_FIELD.EMPTY_APPROVER_TRANSFER_USER, null)
  }

  return saveError(
    nodeId,
    HANDLER_FIELD.EMPTY_APPROVER_TRANSFER_USER,
    Array.isArray(value) && value.length > 0
      ? null
      : createError(nodeId, HANDLER_FIELD.EMPTY_APPROVER_TRANSFER_USER, 'EMPTY_APPROVER_TRANSFER_REQUIRED', '请选择转交的指定人员'),
  )
}

export function validateApprover(nodeId, nodeProps) {
  return [
    validateHandlers(nodeId, nodeProps.handlers, nodeProps.handlerType),
    validateRoles(nodeId, nodeProps.roles, nodeProps.handlerType),
    validateInitiatorSelectRange(
      nodeId,
      nodeProps.initiatorSelectRange,
      nodeProps.handlerType,
      nodeProps.initiatorSelectRangeType,
    ),
    validateEmptyApproverTransferUser(
      nodeId,
      nodeProps.emptyApproverTransferUser,
      nodeProps.emptyApproverAction,
    ),
  ].filter(Boolean)
}

export function validateHandler(nodeId, nodeProps) {
  return [
    validateHandlers(nodeId, nodeProps.handlers, nodeProps.handlerType),
    validateRoles(nodeId, nodeProps.roles, nodeProps.handlerType),
    validateInitiatorSelectRange(
      nodeId,
      nodeProps.initiatorSelectRange,
      nodeProps.handlerType,
      nodeProps.initiatorSelectRangeType,
    ),
  ].filter(Boolean)
}

export function validateCopyTo(nodeId, nodeProps) {
  return [
    validateHandlers(nodeId, nodeProps.handlers, nodeProps.handlerType),
    validateRoles(nodeId, nodeProps.roles, nodeProps.handlerType),
    validateInitiatorSelectRange(
      nodeId,
      nodeProps.initiatorSelectRange,
      nodeProps.handlerType,
      nodeProps.initiatorSelectRangeType,
    ),
  ].filter(Boolean)
}

export { getErrorMessage }
