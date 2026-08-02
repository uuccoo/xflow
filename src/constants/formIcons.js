/**
 * 表单图标白名单（按使用频率排序）
 * 仅保留适合作为表单/审批图标的 Element Plus 图标，
 * 过滤掉箭头、UI 控制、天气、运动、食物、品牌等不相关图标。
 */
export const FORM_ICON_WHITELIST = [
  // ===== 第一梯队：高频（覆盖 80% 审批场景） =====
  // 通用审批/文件
  'Document',
  'Tickets',
  'Stamp',
  'DocumentChecked',
  // 请假/加班/考勤
  'Calendar',
  'Clock',
  'Timer',
  'AlarmClock',
  // 报销/付款/借款
  'Money',
  'Wallet',
  'CreditCard',
  'Coin',
  // 出差/外出/用车
  'Van',
  'Location',
  'MapLocation',
  'Suitcase',
  // 人员相关
  'User',
  'UserFilled',
  'Avatar',
  // 采购/物品
  'ShoppingCart',
  'Goods',
  'Shop',

  // ===== 第二梯队：中频（特定业务场景） =====
  // 合同/用印/文档操作
  'DocumentCopy',
  'DocumentAdd',
  'Postcard',
  'Printer',
  'Paperclip',
  // 培训/学习
  'School',
  'Reading',
  'Notebook',
  'Memo',
  // 会议/沟通/通知
  'ChatRound',
  'ChatDotRound',
  'ChatLineRound',
  'Message',
  'Bell',
  'BellFilled',
  'Notification',
  'Phone',
  'Iphone',
  'Cellphone',
  // 办公/组织
  'OfficeBuilding',
  'Briefcase',
  'Management',
  'Position',
  'Guide',
  'Service',
  // 生活/行政
  'House',
  'HomeFilled',
  'Food',
  'Coffee',
  'Key',
  'Lock',
  'Unlock',
  'Flag',
  // 数据/报表
  'DataBoard',
  'DataAnalysis',
  'DataLine',
  'PieChart',
  'Histogram',
  'TrendCharts',

  // ===== 第三梯队：低频（偶尔使用） =====
  // 文件夹/集合
  'Files',
  'Folder',
  'FolderAdd',
  'FolderOpened',
  'FolderChecked',
  'Collection',
  'CollectionTag',
  'List',
  'Grid',
  // 商务/标签
  'PriceTag',
  'Discount',
  'Sell',
  'SoldOut',
  'Opportunity',
  // 媒体/设备
  'Picture',
  'Camera',
  'VideoCamera',
  'Microphone',
  'Headset',
  'Monitor',
  'Platform',
  'Film',
  // 工具/设置
  'Setting',
  'Tools',
  'SetUp',
  'Edit',
  'EditPen',
  'Brush',
  'Operation',
  // 其他
  'Star',
  'StarFilled',
  'Trophy',
  'Medal',
  'Present',
  'ShoppingBag',
  'FirstAidKit',
  'LocationFilled',
  'Place',
  'AddLocation',
  'Compass',
  'Ship',
  'Stopwatch',
  'Watch',
  'ChatSquare',
  'Comment',
  'Link',
  'Upload',
  'Download',
  'Refresh',
  'Search',
  'Promotion',
  'Share',
  'SuccessFilled',
  'CircleCheckFilled',
  'WarningFilled',
  'DocumentDelete',
  'DocumentRemove',
  'CopyDocument',
  'Ticket',
]
