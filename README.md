<p align="center">
<img src="https://public.uuccoo.com/xflow/logo/xflow_logo.png" width="300" />
</p>

# xflow 流程审批系统

## 简介

该开源项目是专注于**流程审批**场景的前端项目，提供**表单设计**、**流程设计**、**表单填写**与**表单管理**等核心功能，帮助开发者快速搭建审批应用，灵活对接自主研发的流程引擎。

前端主要使用 `vue3`+ `vite` +`element plus` 

**项目演示地址：**<https://xflow-open.uuccoo.com>

**xflow 官网：**<https://xflow.uuccoo.com>

### 联系方式

作者邮箱：<uuccoo@hotmail.com>

<br>

## 快速开始

### 环境要求

- Node.js 18+

### 安装步骤

1. 克隆代码仓库

   ```bash
   git clone https://gitee.com/uuccoo/xflow.git
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

## 启动成功

启动开发服务器后，会在 `http://localhost:5173` 启动应用。以下是主要功能页面的截图示例：

### 发起审批页面

在这里用户可以查看所有可用的审批表单,按分组展示,点击即可发起审批流程。

![发起审批页面](https://public.uuccoo.com/xflow/screenshots/initiate-approval.jpeg)

### 表单管理页面

在表单管理页面,管理员可以创建、编辑、排序和管理所有表单及其分组。

![表单管理页面](https://public.uuccoo.com/xflow/screenshots/manage-forms.jpeg)

### 表单设计页面

在设计页面,可以配置表单的基础设置和表单字段设计。

![表单设计器](https://public.uuccoo.com/xflow/screenshots/form-designer.jpeg)

### 流程设计页面

在流程设计页面,可以配置审批流程的各个节点和流转规则。

![流程设计](https://public.uuccoo.com/xflow/screenshots/process-designer.jpeg)


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

## 路由结构

前端采用 Hash 路由模式（`createWebHashHistory`），路由配置如下：

| 路由路径 | 页面 | 说明 |
|----------|------|------|
| `/` | - | 重定向到 `/home` |
| `/home` | HomeView | 主布局（左侧菜单 + 右侧内容） |
| `/home/initiate` | InitiateApproval | 发起审批页 |
| `/home/manage-forms` | ManageForms | 表单管理页 |
| `/design` | Design | 表单/流程设计器（支持 `?id=` 和 `?code=` 参数加载已有表单） |
| `/approval-form` | ApprovalFormView | 审批表单填写页 |
