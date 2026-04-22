# Tauri Todo Course

这是一个面向“最快熟悉 Tauri + 保持架构可扩展”的教学型项目。

## 为什么先做这个项目

第一性原理上，Tauri 学习的核心不是 Todo 业务，而是下面 5 件事：

1. WebView 和 Rust Core 的职责边界
2. 前后端通过 `invoke` 进行 IPC
3. Rust 侧如何组织状态和用例
4. Tauri v2 的 Capability 与安全模型
5. 插件和打包如何接入而不破坏架构

Todo 只是一个最小载体，它足够简单，但能覆盖全部关键能力。

## 课程节奏

1. Lesson 01: 心智模型、项目骨架、第一条 Command
2. Lesson 02: Todo 用例、Command 适配层、前后端契约
3. Lesson 03: Repository 与 JSON 持久化
4. Lesson 04: 状态管理、错误建模、窗口体验
5. Lesson 05: Capability、插件、打包与演进策略

## 当前课程进度

当前代码已经进入 Lesson 02：

- 前端通过 `invoke` 调用 Todo 相关 command
- Rust Core 中已经有 `Task`、`TodoService`、`TodoRepository`
- 当前仓储实现为内存版，下一课替换为 JSON 持久化

## 当前骨架

前端：

- `src/app`: 前端应用编排层
- `src/ui`: 纯渲染层

Rust Core：

- `src-tauri/src/api`: Tauri command 边界层
- `src-tauri/src/application`: 用例与应用服务
- `src-tauri/src/domain`: 领域模型
- `src-tauri/src/infrastructure`: 技术实现细节
- `src-tauri/src/state.rs`: Tauri 全局状态装配

## 运行方式

```bash
npm install
npm run tauri:dev
```

## Lesson 02 你应该建立的认知

- 用例是系统的稳定中心，存储和界面都应该围绕它适配
- `TodoRepository` 的价值不是“为了抽象而抽象”，而是为了隔离下一课会变化的持久化方式
- 前端最小知道 command 名称和数据契约，不知道 Rust 内部如何实现
