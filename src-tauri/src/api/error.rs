use serde::Serialize;

use crate::application::todo_service::TodoServiceError;

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ApiError {
    code: &'static str,
    message: String,
    operation: &'static str,
    recoverable: bool,
    suggestion: &'static str,
}

impl ApiError {
    pub fn from_todo_error(operation: &'static str, error: TodoServiceError) -> Self {
        match error {
            TodoServiceError::Validation(source) => Self {
                code: "VALIDATION_ERROR",
                message: source.to_string(),
                operation,
                recoverable: true,
                suggestion: "调整输入内容后重试即可。",
            },
            TodoServiceError::TaskNotFound { id } => Self {
                code: "TASK_NOT_FOUND",
                message: format!("编号为 {} 的任务已经不存在了。", id),
                operation,
                recoverable: true,
                suggestion: "刷新当前面板，确认列表状态后再继续操作。",
            },
            TodoServiceError::Repository(message) => Self {
                code: "PERSISTENCE_ERROR",
                message,
                operation,
                recoverable: true,
                suggestion: "检查本地文件权限或磁盘状态，然后重试。",
            },
        }
    }
}
