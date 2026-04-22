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

当前代码已经进入 Lesson 05：

- 旧的演示命令已经从运行面和构建面移除
- `build.rs` 显式白名单化了允许生成 ACL 的 Todo command
- Capability 已按职责拆分，发布前可运行 `npm run release:check`

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

## 发布前检查

```bash
npm run release:check
npm run tauri:build:checked
```

## Lesson 05 你应该建立的认知

- 最小授权不能只停留在口头上，必须落实到 Capability 和命令白名单
- 发布边界应该有可重复执行的静态检查，而不是依赖记忆
- 课程型项目收口到真实工程时，第一件事通常是删除历史演示能力，而不是继续叠加功能
