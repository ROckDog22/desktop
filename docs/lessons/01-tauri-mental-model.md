# Lesson 01: Tauri 心智模型与最小骨架

## 这节课的目标

用最少的代码跑通一条完整链路：

`WebView UI -> invoke -> Tauri command -> application service -> domain -> 返回前端`

只要这条链路建立起来，后续的 Todo、持久化、状态和插件都只是往既有骨架上加能力。

## 先想清楚三个边界

### 1. 进程边界

- WebView 负责渲染和交互
- Rust Core 负责系统能力和核心逻辑
- 两边通过 IPC 交互

### 2. 架构边界

- `api` 只做协议适配
- `application` 负责用例编排
- `domain` 负责核心规则
- `infrastructure` 放技术细节

### 3. 变化边界

最容易变化的是：

- UI 形态
- 存储方式
- 桌面能力接入方式

最不该频繁变化的是：

- 领域规则
- 用例语义

所以抽象要围绕“变化点”展开，而不是围绕名词堆叠展开。

## 为什么第一课不直接做 Todo

因为如果一开始就引入表单、列表、存储，你很容易把注意力放在业务流程上，反而错过 Tauri 真正关键的边界模型。

第一课只做一条 `greet` command，是为了把最基础的“桌面架构骨架”先钉牢。

## 你应该读哪些文件

- `package.json`: 前端开发与构建入口
- `src/app/courseApp.ts`: 前端编排层
- `src/ui/renderDashboard.ts`: 视图渲染层
- `src-tauri/src/api/greeting.rs`: Tauri 边界
- `src-tauri/src/application/greeting_service.rs`: 应用服务
- `src-tauri/src/domain/learner.rs`: 领域对象
- `src-tauri/src/lib.rs`: 应用组装入口

## 通过标准

如果你能清楚回答下面三个问题，这节课就过了：

1. 为什么 `command` 不应该直接写业务逻辑？
2. 为什么 `domain` 不应该依赖 Tauri？
3. 为什么学习 Tauri 时要先搞清楚进程边界，而不是先堆功能？
