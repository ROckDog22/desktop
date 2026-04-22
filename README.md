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

当前代码已经进入 Lesson 03：

- Tauri 在 `setup` 阶段解析应用数据目录
- `JsonTodoRepository` 负责 JSON 文件的加载与写回
- 第二课的 command 契约保持不变，只替换了具体存储实现

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

## Lesson 03 你应该建立的认知

- 真正发生变化的是基础设施层，而不是 command 契约和用例层
- Tauri 的路径解析属于框架装配问题，适合放在 `setup` 阶段处理
- 只要 Repository 边界设计得对，持久化从内存切到 JSON 不需要推翻上层代码
