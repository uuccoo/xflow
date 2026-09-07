import { FlowNodeType } from '@/enums'
import { CircleCheck, EditPen, Promotion, Share, UserFilled, Connection } from '@element-plus/icons-vue'

// 流程节点可选项（常量配置）：
export const flowNodeOptions = [
  { type: FlowNodeType.INITIATE, label: '发起人', icon: UserFilled, color: '#409eff', headerBg: '#ecf5ff' },
  { type: FlowNodeType.APPROVE, label: '审批人', icon: CircleCheck, color: '#67c23a', headerBg: '#f0f9eb' },
  { type: FlowNodeType.CC, label: '抄送人', icon: Promotion, color: '#409eff', headerBg: '#ecf5ff' },
  { type: FlowNodeType.HANDLE, label: '办理', icon: EditPen, color: '#e6a23c', headerBg: '#fdf6ec' },
  {
    type: FlowNodeType.CONDITION,
    label: '条件分支',
    icon: Share,
    color: '#f56c6c',
    headerBg: '#fef0f0',
  },
  {
    type: FlowNodeType.INCLUSIVE,
    label: '包容分支',
    icon: Connection,
    color: '#0ea5e9',
    headerBg: '#f0f9ff',
  },
]

// 获取可在流程中新增的节点配置
export const getAddableNodeOptions = () =>
  flowNodeOptions.filter((option) => option.type !== FlowNodeType.INITIATE)

// 根据节点类型获取节点选项配置
export const getFlowNodeOption = (nodeType) => {
  let targetType = nodeType
  if (nodeType === FlowNodeType.CONDITION_BRANCH) {
    targetType = FlowNodeType.CONDITION
  } else if (nodeType === FlowNodeType.INCLUSIVE_BRANCH) {
    targetType = FlowNodeType.INCLUSIVE
  }
  return flowNodeOptions.find((option) => option.type === targetType) || null
}
