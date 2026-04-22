use std::sync::Arc;

use crate::{
    application::todo_service::TodoService,
    infrastructure::in_memory_todo_repository::InMemoryTodoRepository,
};

pub struct AppState {
    pub todo_service: TodoService,
}

impl Default for AppState {
    fn default() -> Self {
        let repository = Arc::new(InMemoryTodoRepository::seeded([
            "理解 WebView 与 Rust Core 的职责边界",
            "把业务语义放进 TodoService",
            "为下一课的 JSON 持久化保留 Repository 抽象",
        ]));

        Self {
            todo_service: TodoService::new(repository),
        }
    }
}
