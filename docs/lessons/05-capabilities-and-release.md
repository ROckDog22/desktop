# Lesson 05: Capability 与发布边界

## 这节课的目标

把项目从“已经能运行的课程应用”收口成“更接近真实交付物”的工程。

这节课做三件事：

1. 删除已经过时的演示命令，缩小运行面
2. 用 `build.rs` 的 `AppManifest::commands(...)` 显式白名单化自定义 command
3. 拆分 Capability 文件，并补一个发布前静态检查脚本

## 为什么这一课先删东西，而不是继续加东西

第一性原理上，安全边界和交付边界的第一步通常不是“加能力”，而是“去掉不再需要的能力”。

如果课程第一课留下的演示命令还继续暴露在运行时：

- 它会扩大实际权限面
- 它会模糊当前系统真正需要维护的边界
- 它会让后续审查和发布时很难区分“核心能力”和“历史残留”

所以 Lesson 05 首先把 `greet` 这一类演示期遗留移除。

## 构建期白名单为什么重要

Capability 文件解决的是“窗口拥有什么权限”。

但如果自定义 command 本身没有在构建期白名单化：

- 权限面仍然可能随着新增 command 扩散
- 审查时很难快速确认哪些 command 是真正要开放给前端的

所以这一课把允许生成 ACL 的 command 显式写进 `build.rs`。

## 这一课的关键文件

- `src-tauri/build.rs`
  使用 `AppManifest::commands(...)` 显式声明允许开放的 Todo command。

- `src-tauri/capabilities/main-window-core.json`
  主窗口最小权限集，包含 Todo command 的 allow 权限。

- `src-tauri/capabilities/main-window-state.json`
  单独承载窗口状态插件权限。

- `scripts/release-check.mjs`
  发布前静态检查：版本、图标、Capability、构建期命令白名单。

- `src-tauri/src/lib.rs`
  不再注册第一课遗留的 `greet` command。

## 这节课最值得你观察的点

1. Capability 不再只是一个默认文件，而是按职责拆分。
2. 课程早期的演示代码被真的移除了，而不是“先留着以后再说”。
3. 发布前检查不是文档提醒，而是可执行脚本。
4. 业务层没有因为 Lesson 05 的安全和发布收口而被污染。

## 到这里为止，你已经得到什么

- 一个覆盖 Tauri 核心概念的最小完整项目
- 一套从心智模型到用例、持久化、错误协议、桌面体验、权限边界、发布边界的演进路径
- 一个更接近真实交付物的工程骨架，而不是只适合课堂展示的样板
