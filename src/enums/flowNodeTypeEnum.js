// 流程节点类型枚举
export const FlowNodeType = {
  /**
   * 发起
   */
  INITIATE: 'initiate',
  /**
   * 审批
   */
  APPROVE: 'approve',
  /**
   * 抄送
   */
  CC: 'cc',
  /**
   * 办理
   */
  HANDLE: 'handle',
  /**
   * 条件
   */
  CONDITION: 'condition',
  /**
   * 自动化
   */
  AUTOMATION: 'automation',
  /**
   * 连接器
   */
  CONNECTOR: 'connector',
  /**
   * 付款
   */
  PAYMENT: 'payment',
}
