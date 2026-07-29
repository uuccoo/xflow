import { FlowNodeType } from '@/enums'
import { Connection, Document, Edit, Money, Setting, TurnOff, User } from '@element-plus/icons-vue'

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
  // TODO: 后端暂未实现，后续开放
  // { type: FlowNodeType.AUTOMATION, label: '自动化', icon: Setting, color: '#909399', headerBg: '#f4f4f5' },
  // {
  //   type: FlowNodeType.CONNECTOR,
  //   label: '连接器',
  //   icon: Connection,
  //   color: '#9254de',
  //   headerBg: '#f3f0fa',
  // },
  // { type: FlowNodeType.PAYMENT, label: '付款人', icon: Money, color: '#52c41a', headerBg: '#f6ffed' },
]

// 根据节点类型获取节点选项配置
export const getFlowNodeOption = (nodeType) => {
  return flowNodeOptions.find((option) => option.type === nodeType) || null
}
