// 流程节点操作类型枚举
export const NodeOperationType = {
  /**
   * 发起
   */
  INITIATE: 'initiate',
  /**
   * 同意
   */
  APPROVE: 'approve',
  /**
   * 拒绝
   */
  REJECT: 'reject',
  /**
   * 修改
   */
  MODIFY: 'modify',
  /**
   * 撤销
   */
  REVOKE: 'revoke',
  /**
   * 转交
   */
  TRANSFER: 'transfer',
  /**
   * 退回
   */
  RETURN: 'return',
  /**
   * 加签
   */
  ADD_SIGN: 'add_sign',
  /**
   * 评论
   */
  COMMENT: 'comment',
  /**
   * 审批人为空，系统自动通过
   */
  EMPTY_AUTO_APPROVE: 'empty_auto_approve',
  /**
   * 审批人为空，系统自动驳回
   */
  EMPTY_AUTO_REJECT: 'empty_auto_reject',
  /**
   * 审批人为空，转交给管理员
   */
  EMPTY_TRANSFER_MANAGER: 'empty_transfer_manager',
  /**
   * 审批人为空，转交给指定人员
   */
  EMPTY_TRANSFER_SPECIFIC: 'empty_transfer_specific',
};