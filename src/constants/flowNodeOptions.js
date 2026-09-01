import { FlowNodeType } from '@/enums'
import { Document, Edit, Grid, TurnOff, User } from '@element-plus/icons-vue'

// 流程节点可选项（常量配置）：
export const flowNodeOptions = [
  { type: FlowNodeType.APPROVE, label: '审批人', icon: User, color: '#67c23a', headerBg: '#f0f9eb' },
  { type: FlowNodeType.CC, label: '抄送人', icon: Document, color: '#409eff', headerBg: '#ecf5ff' },
  { type: FlowNodeType.HANDLE, label: '办理', icon: Edit, color: '#e6a23c', headerBg: '#fdf6ec' },
  {
    type: FlowNodeType.CONDITION,
    label: '条件分支',
    icon: TurnOff,
    color: '#f56c6c',
    headerBg: '#fef0f0',
  },
  {
    type: FlowNodeType.INCLUSIVE,
    label: '包容分支',
    icon: Grid,
    color: '#0ea5e9',
    headerBg: '#f0f9ff',
  },
]

// 根据节点类型获取节点选项配置
export const getFlowNodeOption = (nodeType) => {
  return flowNodeOptions.find((option) => option.type === nodeType) || null
}
