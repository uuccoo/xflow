<p align="center">
<img src="https://public.uuccoo.com/xflow/logo/xflow_logo.png" width="300" />
</p>

<h1 align="center">xflow 工作流</h1>

## 简介

🚀 `钉钉`|`飞书`同款 OA 审批体验 🎨 设计器直观易用。🎉帮助开发者快速搭建OA审批应用，定制开发审批功能。

- **表单设计**：拖拽配置表单组件，快速搭建业务表单。
- **流程设计**：可视化配置审批节点与流转规则。
- **表单填写**：填写表单，并查看流程执行步骤。
- **校验保障**：覆盖表单设计、流程设计和表单填写，及时发现配置与填写问题。
- **审批中心**：统一查看待审批、已审批、我发起和抄送给我的事项。

前端主要使用 `vue3`+ `vite` +`element plus` 

**项目演示地址：**<https://xflow-web.uuccoo.com>

### 联系方式

提供无偿技术支持，微信联系：`uuccoo_`

<br>

## 界面截图

以下是主要功能页面的截图示例：

### 表单设计页面

![表单设计器](https://public.uuccoo.com/xflow/screenshots/form-designer.jpeg)

### 流程设计页面

![流程设计](https://public.uuccoo.com/xflow/screenshots/process-designer.jpeg)

### 发起审批页面

![发起审批页面](https://public.uuccoo.com/xflow/screenshots/initiate-approval.jpeg)

### 审批中心页面

![审批中心页面](https://public.uuccoo.com/xflow/screenshots/approval-center.jpeg)

## 快速开始

### 环境要求

- Node.js 18+

### 安装步骤

1. 克隆代码仓库

   ```bash
   git clone https://gitee.com/uuccoo/xflow2.git
   ```

2. 安装依赖

   ```bash
   npm install
   ```

3. 启动开发服务器

   ```bash
   npm run dev
   ```

4. 构建生产版本

   ```bash
   npm run build
   ```

## 项目目录结构

```
src/
├── api/            # API 接口模块
├── assets/         # 静态资源
├── components/     # 公共组件
│   ├── common/     # 通用组件（人员选择器、分组创建等）
│   ├── flow/       # 流程设计器组件（节点渲染、节点设置等）
│   ├── form/       # 表单设计器组件（字段、属性编辑器等）
│   ├── icon/       # 图标组件
│   └── management/ # 管理模块组件
├── constants/      # 常量定义
├── enums/          # 枚举定义
├── router/         # 路由配置
├── stores/         # Pinia 状态仓库
├── utils/          # 工具函数
└── views/          # 页面视图
    ├── approval/   # 审批相关页面
    ├── design/     # 设计器页面
    ├── home/       # 首页
    └── management/ # 管理页面
```
