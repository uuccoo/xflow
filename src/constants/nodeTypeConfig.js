import { FlowNodeType } from '@/enums'

// 节点配置模板集合，定义每种节点的默认结构、名称和 props
const getNodeConfigs = () => ({
  [FlowNodeType.INITIATE]: {
    id: `node_${Date.now()}`,
    type: FlowNodeType.INITIATE,
    name: '发起',
    props: {
      // 发起人范围类型
      initiatorScope: 'all',
      // 指定发起人列表
      initiators: [],
    },
  },
  [FlowNodeType.APPROVE]: {
    id: `node_${Date.now()}`,
    type: FlowNodeType.APPROVE,
    name: '审批人',
    props: {
      // 审批人类型
      handlerType: 'designated',
      // 多人审批方式
      approvalMode: 'anyone',
      // 发起人自选模式
      initiatorSelectMode: 'single',
      // 发起人自选范围类型
      initiatorSelectRangeType: 'all',
      // 主管级别
      managerType: 1,
      // 找不到主管时是否由上级主管代审批
      fallbackToHigherManager: false,
      // 审批人为空时的处理方式
      emptyApproverAction: 'auto_pass',
      // 连续多级主管的审批终点
      approvalEndPoint: 'top_manager',
      // 连续多级主管的具体级别
      specificLevel: 1,
      // 指定审批人列表
      handlers: [],
      // 发起人自选人员范围
      initiatorSelectRange: [],
      // 角色列表
      roles: [],
      // 审批人为空时的指定转交人员
      emptyApproverTransferUser: [],
    },
  },
  [FlowNodeType.CC]: {
    id: `node_${Date.now()}`,
    type: FlowNodeType.CC,
    name: '抄送人',
    props: {
      // 抄送人类型
      handlerType: 'designated',
      // 发起人自选模式
      initiatorSelectMode: 'single',
      // 发起人自选范围类型
      initiatorSelectRangeType: 'all',
      // 主管级别
      managerType: 1,
      // 找不到主管时是否由上级主管接收抄送
      fallbackToHigherManager: false,
      // 连续多级主管的审批终点
      approvalEndPoint: 'top_manager',
      // 连续多级主管的具体级别
      specificLevel: 1,
      // 指定抄送人列表
      handlers: [],
      // 发起人自选人员范围
      initiatorSelectRange: [],
      // 角色列表
      roles: [],
    },
  },
  [FlowNodeType.HANDLE]: {
    id: `node_${Date.now()}`,
    type: FlowNodeType.HANDLE,
    name: '办理',
    props: {
      // 办理人类型
      handlerType: 'designated',
      // 多人办理方式
      approvalMode: 'sequential',
      // 发起人自选模式
      initiatorSelectMode: 'single',
      // 发起人自选范围类型
      initiatorSelectRangeType: 'all',
      // 主管级别
      managerType: 1,
      // 找不到主管时是否由上级主管代办理
      fallbackToHigherManager: false,
      // 连续多级主管的审批终点
      approvalEndPoint: 'top_manager',
      // 连续多级主管的具体级别
      specificLevel: 1,
      // 指定办理人列表
      handlers: [],
      // 发起人自选人员范围
      initiatorSelectRange: [],
      // 角色列表
      roles: [],
    },
  },
  [FlowNodeType.CONDITION]: {
    id: `node_${Date.now()}`,
    type: FlowNodeType.CONDITION,
    name: '条件分支',
    props: {},
    branches: [
      getConditionBranch(1),
      getConditionBranch(2, true),
    ],
  },
  [FlowNodeType.INCLUSIVE]: {
    id: `node_${Date.now()}`,
    type: FlowNodeType.INCLUSIVE,
    name: '包容分支',
    props: {},
    branches: [
      getInclusiveBranch(1),
      getInclusiveBranch(2, true),
    ],
  },
})

// 根据序号和默认标识生成条件分支节点
export const getConditionBranch = (sequence, isDefault = false) => ({
  id: `branch_${Date.now()}`,
  type: FlowNodeType.CONDITION_BRANCH,
  name: isDefault ? '默认条件' : `条件${sequence}`,
  props: {
    conditionGroups: [
      {
        id: `group_${Date.now()}`,
        conditions: [],
      },
    ],
  },
  nodes: [],
  isDefault,
})

// 根据序号和默认标识生成包容分支节点
export const getInclusiveBranch = (sequence, isDefault = false) => ({
  id: `branch_${Date.now()}`,
  type: FlowNodeType.INCLUSIVE_BRANCH,
  name: isDefault ? '默认条件' : `包容条件${sequence}`,
  props: {
    conditionGroups: [],
  },
  nodes: [],
  isDefault,
})

// 根据节点类型返回节点的完整默认配置对象
export const getNodeByType = (type) => {
  const nodeConfigs = getNodeConfigs()

  return nodeConfigs[type] || {}
}

// 获取节点的默认 props 配置，用于初始化节点设置表单
export const getNodeProps = (type) => {
  const node = getNodeByType(type)

  return node?.props || {}
}
