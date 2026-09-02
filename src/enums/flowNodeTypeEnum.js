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
   * 条件分支容器
   */
  CONDITION: 'condition',
  /**
   * 条件分支项
   */
  CONDITION_BRANCH: 'condition_branch',
  /**
   * 包容分支容器（满足条件的分支同时执行，无满足时走默认分支）
   */
  INCLUSIVE: 'inclusive',
  /**
   * 包容分支项
   */
  INCLUSIVE_BRANCH: 'inclusive_branch',
}
