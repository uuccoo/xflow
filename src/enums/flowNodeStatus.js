// 流程节点状态枚举
export const FlowNodeStatus = {
  /**
   * 等待中 - 节点尚未被触发，等待执行
   */
  WAITING: 'waiting',
  /**
   * 无状态 - 当流程尚未启动时，节点处于该状态
   */
  NONE: 'none',
  /**
   * 进行中 - 节点正在执行或处理中
   */
  ACTIVE: 'active',
  /**
   * 已完成 - 节点已处理完成
   */
  COMPLETED: 'completed',
};