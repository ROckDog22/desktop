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

当前代码已经进入 Lesson 04：

- command 返回结构化错误对象，而不只是字符串
- Tauri 在 `setup` 阶段装配 `window-state` 插件
- 窗口尺寸和位置会在关闭后保存，并在下次启动恢复

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

## Lesson 04 你应该建立的认知

- 错误不只是日志文本，它本身就是前后端共享的协议
- 桌面插件接入应集中在 `setup` 阶段，而不是散进业务层
- “像桌面应用”往往不是多写功能，而是把生命周期和恢复体验做对
