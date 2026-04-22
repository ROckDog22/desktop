use std::sync::Arc;

use crate::domain::task::{Task, TaskError, TaskTitle};

#[derive(Debug, Clone)]
pub struct TodoBoard {
    pub product_name: String,
    pub lesson_title: String,
    pub lesson_goal: String,
    pub persistence_summary: String,
    pub data_file_path: String,
    pub desktop_experience_summary: String,
    pub architecture_rules: Vec<&'static str>,
    pub command_map: Vec<&'static str>,
    pub tasks: Vec<TodoItem>,
    pub total_count: usize,
    pub completed_count: usize,
    pub remaining_count: usize,
}

#[derive(Debug, Clone)]
pub struct TodoItem {
    pub id: u64,
    pub title: String,
    pub completed: bool,
}

pub trait TodoRepository: Send + Sync {
    fn list(&self) -> Vec<Task>;
    fn find(&self, id: u64) -> Option<Task>;
    fn create(&self, title: TaskTitle) -> Result<Task, TodoServiceError>;
    fn save(&self, task: Task) -> Result<(), TodoServiceError>;
    fn delete(&self, id: u64) -> Result<(), TodoServiceError>;
}

#[derive(Clone)]
pub struct TodoService {
    repository: Arc<dyn TodoRepository>,
    persistence_summary: String,
    data_file_path: String,
    desktop_experience_summary: String,
}

impl TodoService {
    pub fn new(
        repository: Arc<dyn TodoRepository>,
        persistence_summary: impl Into<String>,
        data_file_path: impl Into<String>,
        desktop_experience_summary: impl Into<String>,
    ) -> Self {
        Self {
            repository,
            persistence_summary: persistence_summary.into(),
            data_file_path: data_file_path.into(),
            desktop_experience_summary: desktop_experience_summary.into(),
        }
    }

    pub fn get_board(&self) -> TodoBoard {
        self.build_board()
    }

    pub fn add_task(&self, title: &str) -> Result<TodoBoard, TodoServiceError> {
        let title = TaskTitle::new(title)?;
        self.repository.create(title)?;
        Ok(self.build_board())
    }

    pub fn toggle_task(&self, id: u64) -> Result<TodoBoard, TodoServiceError> {
        let existing = self
            .repository
            .find(id)
            .ok_or(TodoServiceError::TaskNotFound { id })?;

        self.repository.save(existing.toggle())?;
        Ok(self.build_board())
    }

    pub fn delete_task(&self, id: u64) -> Result<TodoBoard, TodoServiceError> {
        self.repository.delete(id)?;
        Ok(self.build_board())
    }

    fn build_board(&self) -> TodoBoard {
        let tasks = self
            .repository
            .list()
            .into_iter()
            .map(|task| TodoItem {
                id: task.id(),
                title: task.title().to_string(),
                completed: task.completed(),
            })
            .collect::<Vec<_>>();

        let total_count = tasks.len();
        let completed_count = tasks.iter().filter(|task| task.completed).count();
        let remaining_count = total_count.saturating_sub(completed_count);

        TodoBoard {
            product_name: "Tauri Todo Course".to_string(),
            lesson_title: "Lesson 04 · 错误建模与窗口状态".to_string(),
            lesson_goal:
                "这一课补两件桌面应用该有的能力：结构化错误协议，以及窗口位置与尺寸的自动记忆。"
                    .to_string(),
            persistence_summary: self.persistence_summary.clone(),
            data_file_path: self.data_file_path.clone(),
            desktop_experience_summary: self.desktop_experience_summary.clone(),
            architecture_rules: vec![
                "错误也是边界协议的一部分",
                "Service 承载用例语义与规则编排",
                "桌面能力在 setup 阶段装配，不污染业务层",
            ],
            command_map: vec![
                "get_todo_board -> 查询当前任务面板",
                "add_todo -> 新增任务",
                "toggle_todo -> 切换完成状态",
                "delete_todo -> 删除任务",
            ],
            tasks,
            total_count,
            completed_count,
            remaining_count,
        }
    }
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub enum TodoServiceError {
    Validation(TaskError),
    TaskNotFound { id: u64 },
    Repository(String),
}

impl std::fmt::Display for TodoServiceError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            Self::Validation(error) => write!(f, "{error}"),
            Self::TaskNotFound { id } => write!(f, "编号为 {} 的任务不存在。", id),
            Self::Repository(message) => write!(f, "{message}"),
        }
    }
}

impl std::error::Error for TodoServiceError {}

impl From<TaskError> for TodoServiceError {
    fn from(value: TaskError) -> Self {
        Self::Validation(value)
    }
}

#[cfg(test)]
mod tests {
    use std::sync::Arc;

    use crate::infrastructure::in_memory_todo_repository::InMemoryTodoRepository;

    use super::TodoService;

    fn service() -> TodoService {
        TodoService::new(Arc::new(InMemoryTodoRepository::seeded([
            "拆出 domain 与 application",
            "把 command 保持为薄边界",
        ])), "内存仓储，仅用于单元测试。", "/tmp/todo-course-test.json", "测试环境不接入窗口状态插件。")
    }

    #[test]
    fn adds_task_and_updates_counts() {
        let board = service()
            .add_task("给持久化预留 repository 接口")
            .expect("task should be created");

        assert_eq!(board.total_count, 3);
        assert_eq!(board.remaining_count, 3);
        assert_eq!(
            board.tasks.last().map(|task| task.title.as_str()),
            Some("给持久化预留 repository 接口")
        );
    }

    #[test]
    fn toggles_existing_task() {
        let service = service();
        let board = service.toggle_task(1).expect("task should exist");

        assert_eq!(board.completed_count, 1);
        assert!(board.tasks.iter().any(|task| task.id == 1 && task.completed));
    }
}
