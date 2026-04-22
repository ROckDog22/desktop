# Lesson 02: Todo 用例与 Repository

## 这节课的目标

把 Lesson 01 的“问候语演示链路”升级为真正的业务闭环：

`WebView UI -> Todo Commands -> TodoService -> TodoRepository -> InMemory Store`

这节课故意不做持久化，因为真正要先吃透的是“语义在哪一层”。

## 为什么这一课先做 Repository，而不是先接文件

第一性原理上，系统里真正稳定的是用例，不是存储介质。

如果你在 command 或前端里直接写文件：

- 下一课改成 JSON、SQLite、云同步时，修改面会扩散
- 业务规则会和技术细节耦合
- Tauri command 很快会变成“又像 controller 又像 service”的混合层

所以第二课先把存储边界抽出来，但先给它一个最简单的内存实现。

## 这一课的核心文件

- `src-tauri/src/api/todo.rs`
  Tauri 命令边界，负责把 `TodoBoard` 转成前端 DTO。

- `src-tauri/src/application/todo_service.rs`
  真正的用例编排层。新增、切换完成、删除都在这里定义。

- `src-tauri/src/domain/task.rs`
  领域对象与最小规则。这里控制标题不能为空、长度不能失控。

- `src-tauri/src/infrastructure/in_memory_todo_repository.rs`
  当前具体的存储实现。它只知道“怎么存”，不知道“为什么这么改”。

- `src-tauri/src/state.rs`
  把 repository 和 service 组装进 Tauri 的全局状态。

## 你现在应该观察什么

1. `toggle_todo` command 本身几乎没有业务逻辑。
2. `TodoService` 才决定“先找任务，再切换状态，再保存”。
3. Repository 接口没有暴露 Tauri，也没有暴露前端概念。

## 到这里为止，架构上已经得到什么

- UI 可以继续重做，不影响 Rust Core 语义
- 仓储可以从内存版替换成 JSON 版，不影响 command 协议
- 用例可以继续加过滤、排序、批量操作，而不需要把业务散到多层

## 下一课

Lesson 03 只做一件关键事情：

把 `InMemoryTodoRepository` 替换成 `JsonTodoRepository`，让第二课的用例语义原封不动地复用下去。
