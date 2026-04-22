# Lesson 03: JSON 持久化与封闭修改

## 这节课的目标

在不推翻 Lesson 02 用例模型的前提下，把任务存储从内存版切换为 JSON 文件版。

关键链路现在变成：

`WebView UI -> Todo Commands -> TodoService -> JsonTodoRepository -> todo-board.json`

## 为什么这一课的重点不是“会写文件”

会写文件只是技术动作，不是架构结果。

真正重要的是下面这个事实：

- command 名称没变
- 前端数据契约没变
- `TodoService` 的业务语义几乎没变
- 变化主要集中在 `setup` 装配和 `JsonTodoRepository`

这才叫“对扩展开放，对修改封闭”。

## 这一课的关键文件

- `src-tauri/src/lib.rs`
  在 `setup` 阶段用 Tauri 的 `app.path().app_data_dir()` 解析应用数据目录，再组装 `AppState`。

- `src-tauri/src/state.rs`
  在这里决定当前仓储实现是 `JsonTodoRepository`，而不是内存版。

- `src-tauri/src/infrastructure/json_todo_repository.rs`
  负责：
  1. 首次启动时创建目录和 JSON 文件
  2. 已存在时读取并恢复任务
  3. 每次新增、切换、删除后写回文件

- `src-tauri/src/domain/task.rs`
  新增了 `Task::restore`，用于把持久化数据恢复成领域对象。

## 这节课最值得你作为架构师观察的点

1. 路径解析没有进 command，也没有进 service。
2. JSON 序列化细节没有污染 domain。
3. 仓储写文件失败时，错误会沿边界返回，而不是静默吞掉。
4. repository 在写文件前先构造下一份快照，避免内存状态和磁盘状态失配。

## 到这里为止，你已经拿到了什么

- 一个最小但完整的 Tauri 本地桌面应用
- 一套可以继续切到 SQLite、加搜索、加过滤的稳定骨架
- 一个清晰的演进路径：先稳住用例，再替换基础设施

## 下一课

Lesson 04 我建议做两件事：

1. 引入更明确的错误建模与用户提示
2. 增加窗口状态记忆和更像桌面应用的体验
