import { useFlowDesignStore } from '@/stores/flowDesignStore'

export const saveError = (nodeId, field, error) => {
  const flowStore = useFlowDesignStore()
  const errorKey = `${nodeId}:${field}`

  if (error) {
    flowStore.errors[errorKey] = error
  } else {
    delete flowStore.errors[errorKey]
  }

  return error
}

export const createError = (nodeId, field, code, message) => ({
  module: '流程设计',
  code,
  field,
  message,
  target: { tab: 'flowDesign', nodeId, field },
})

export const getErrorMessage = (nodeId, field) => {
  const flowStore = useFlowDesignStore()
  return flowStore.errors[`${nodeId}:${field}`]?.message || ''
}
