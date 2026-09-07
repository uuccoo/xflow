import { createError, getErrorMessage, saveError } from './error'

export const INITIATOR_FIELD = {
  INITIATORS: 'initiators',
}

export function validateInitiators(nodeId, value, scope) {
  if (scope !== 'specified') {
    return saveError(nodeId, INITIATOR_FIELD.INITIATORS, null)
  }

  return saveError(
    nodeId,
    INITIATOR_FIELD.INITIATORS,
    Array.isArray(value) && value.length > 0
      ? null
      : createError(nodeId, INITIATOR_FIELD.INITIATORS, 'INITIATOR_REQUIRED', '请至少选择一名发起人'),
  )
}

export function validateInitiator(nodeId, nodeProps) {
  return [validateInitiators(nodeId, nodeProps.initiators, nodeProps.initiatorScope)].filter(Boolean)
}

export { getErrorMessage }
