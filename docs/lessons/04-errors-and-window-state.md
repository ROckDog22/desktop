# Lesson 04: 错误建模与窗口状态

## 这节课的目标

把项目从“能运行的 Tauri 应用”推进到“更像桌面应用”的状态。

这节课只做两件事：

1. 把 command 错误从裸字符串提升为结构化协议
2. 接入 `window-state` 插件，让窗口尺寸和位置自动恢复

## 为什么错误建模值得单独一课

第一性原理上，错误不是边角料。

错误路径和成功路径一样，都是系统对外暴露的行为。

如果错误只是 `String`：

- 前端很难稳定识别错误类型
- UI 无法给出一致的恢复建议
- 后续埋点、监控、国际化都会变得混乱

所以这一课把错误提升成稳定的边界对象：`code`、`message`、`operation`、`recoverable`、`suggestion`。

## 为什么窗口状态要放在 setup 里

窗口状态恢复是桌面生命周期能力，不是 Todo 用例能力。

所以它应该：

- 在 Tauri `setup` 阶段装配
- 通过插件接入
- 不进入 `TodoService`
- 不污染 `domain`

这就是“系统能力”和“业务语义”分层的具体体现。

## 这一课的关键文件

- `src-tauri/src/api/error.rs`
  结构化错误协议定义与映射。

- `src-tauri/src/api/todo.rs`
  command 现在返回 `Result<T, ApiError>`，而不是 `Result<T, String>`。

- `src-tauri/src/lib.rs`
  在 `setup` 阶段装配 `window-state` 插件。

- `src/app/tauriClient.ts`
  统一解析 Tauri invoke 错误，转换成前端可消费的 `AppError`。

- `src/ui/renderDashboard.ts`
  错误不再是一段裸文本，而是可读、可恢复的面板。

## 到这里为止，你拿到了什么

- 一个真正有错误协议的前后端边界
- 一个能记住窗口状态的桌面应用
- 一条更清晰的扩展路径：后面接通知、托盘、自动更新时，仍然沿用同样的装配思路

## 下一课

Lesson 05 我建议收束到两个方向：

1. 能力边界：Capabilities 与最小授权
2. 发布边界：打包、签名、分发前的工程整理
