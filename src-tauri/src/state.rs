use std::path::PathBuf;
use std::sync::Arc;

use crate::{
    application::todo_service::{TodoService, TodoServiceError},
    infrastructure::json_todo_repository::JsonTodoRepository,
};

pub struct AppState {
    pub todo_service: TodoService,
}

impl AppState {
    pub fn new(app_data_dir: PathBuf) -> Result<Self, TodoServiceError> {
        let repository_path = app_data_dir.join("todo-board.json");
        let repository = Arc::new(JsonTodoRepository::new(
            repository_path.clone(),
            [
                "理解 WebView 与 Rust Core 的职责边界",
                "保持 TodoService 语义不变，只替换 Repository 实现",
                "确认关闭重开后任务仍然保留",
            ],
        )?);

        Ok(Self {
            todo_service: TodoService::new(
                repository,
                "当前使用 JSON 文件仓储，应用重启后任务仍会保留。",
                repository_path.display().to_string(),
                "窗口尺寸与位置会在关闭时自动保存，并在下次启动时恢复。",
                "主窗口只拿到显式列出的 Todo command 与 window-state 权限，不再保留演示期多余命令。",
                "发布前可以运行 npm run release:check，静态检查版本、图标、Capability 和构建期命令白名单。",
            ),
        })
    }
}
