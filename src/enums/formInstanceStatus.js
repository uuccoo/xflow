// 表单实例状态枚举
export const FormInstanceStatus = {
  /**
   * 进行中 - 表单实例正在审批流程中
   */
  PROCESSING: 1,
  /**
   * 已完成 - 表单实例审批流程已完成
   */
  COMPLETED: 2,
  /**
   * 已取消 - 表单实例已被取消或撤销
   */
  CANCELED: 3,
  /**
   * 已拒绝 - 表单实例审批被拒绝
   */
  REJECTED: 4,
};
