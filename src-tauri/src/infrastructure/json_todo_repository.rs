use std::{
    fs,
    path::{Path, PathBuf},
    sync::Mutex,
};

use serde::{Deserialize, Serialize};

use crate::{
    application::todo_service::{TodoRepository, TodoServiceError},
    domain::task::{Task, TaskTitle},
};

pub struct JsonTodoRepository {
    file_path: PathBuf,
    inner: Mutex<Store>,
}

impl JsonTodoRepository {
    pub fn new<const N: usize>(
        file_path: PathBuf,
        seed_titles: [&str; N],
    ) -> Result<Self, TodoServiceError> {
        let store = if file_path.exists() {
            Self::load_store(&file_path)?
        } else {
            let seeded = Store::seeded(seed_titles)?;
            Self::write_store(&file_path, &seeded)?;
            seeded
        };

        Ok(Self {
            file_path,
            inner: Mutex::new(store),
        })
    }

    fn load_store(path: &Path) -> Result<Store, TodoServiceError> {
        let raw = fs::read_to_string(path)
            .map_err(|error| repository_error(format!("读取任务文件失败: {error}")))?;

        let record: StoreRecord = serde_json::from_str(&raw)
            .map_err(|error| repository_error(format!("解析任务文件失败: {error}")))?;

        Store::try_from(record)
    }

    fn write_store(path: &Path, store: &Store) -> Result<(), TodoServiceError> {
        let Some(parent) = path.parent() else {
            return Err(repository_error("任务文件路径无效，缺少父目录。"));
        };

        fs::create_dir_all(parent)
            .map_err(|error| repository_error(format!("创建任务目录失败: {error}")))?;

        let json = serde_json::to_string_pretty(&StoreRecord::from(store))
            .map_err(|error| repository_error(format!("序列化任务数据失败: {error}")))?;

        fs::write(path, json)
            .map_err(|error| repository_error(format!("写入任务文件失败: {error}")))?;

        Ok(())
    }
}

impl TodoRepository for JsonTodoRepository {
    fn list(&self) -> Vec<Task> {
        self.inner
            .lock()
            .expect("todo repository lock poisoned")
            .tasks
            .clone()
    }

    fn find(&self, id: u64) -> Option<Task> {
        self.inner
            .lock()
            .expect("todo repository lock poisoned")
            .tasks
            .iter()
            .find(|task| task.id() == id)
            .cloned()
    }

    fn create(&self, title: TaskTitle) -> Result<Task, TodoServiceError> {
        let mut store = self.inner.lock().expect("todo repository lock poisoned");
        let mut next = store.clone();
        let task = Task::new(next.next_id, title);
        next.next_id += 1;
        next.tasks.push(task.clone());

        Self::write_store(&self.file_path, &next)?;
        *store = next;

        Ok(task)
    }

    fn save(&self, task: Task) -> Result<(), TodoServiceError> {
        let mut store = self.inner.lock().expect("todo repository lock poisoned");
        let mut next = store.clone();
        let Some(position) = next.tasks.iter().position(|current| current.id() == task.id()) else {
            return Err(TodoServiceError::TaskNotFound { id: task.id() });
        };

        next.tasks[position] = task;
        Self::write_store(&self.file_path, &next)?;
        *store = next;

        Ok(())
    }

    fn delete(&self, id: u64) -> Result<(), TodoServiceError> {
        let mut store = self.inner.lock().expect("todo repository lock poisoned");
        let mut next = store.clone();
        let before = next.tasks.len();
        next.tasks.retain(|task| task.id() != id);

        if before == next.tasks.len() {
            return Err(TodoServiceError::TaskNotFound { id });
        }

        Self::write_store(&self.file_path, &next)?;
        *store = next;

        Ok(())
    }
}

#[derive(Debug, Clone)]
struct Store {
    next_id: u64,
    tasks: Vec<Task>,
}

impl Store {
    fn seeded<const N: usize>(titles: [&str; N]) -> Result<Self, TodoServiceError> {
        let mut next_id = 1_u64;
        let mut tasks = Vec::new();

        for title in titles {
            let title = TaskTitle::new(title)?;
            tasks.push(Task::new(next_id, title));
            next_id += 1;
        }

        Ok(Self { next_id, tasks })
    }
}

#[derive(Debug, Serialize, Deserialize)]
struct StoreRecord {
    next_id: u64,
    tasks: Vec<TaskRecord>,
}

#[derive(Debug, Serialize, Deserialize)]
struct TaskRecord {
    id: u64,
    title: String,
    completed: bool,
}

impl From<&Store> for StoreRecord {
    fn from(value: &Store) -> Self {
        Self {
            next_id: value.next_id,
            tasks: value
                .tasks
                .iter()
                .map(|task| TaskRecord {
                    id: task.id(),
                    title: task.title().to_string(),
                    completed: task.completed(),
                })
                .collect(),
        }
    }
}

impl TryFrom<StoreRecord> for Store {
    type Error = TodoServiceError;

    fn try_from(value: StoreRecord) -> Result<Self, Self::Error> {
        let tasks = value
            .tasks
            .into_iter()
            .map(|task| {
                let title = TaskTitle::new(&task.title)?;
                Ok(Task::restore(task.id, title, task.completed))
            })
            .collect::<Result<Vec<_>, TodoServiceError>>()?;

        let max_id = tasks.iter().map(Task::id).max().unwrap_or(0);

        Ok(Self {
            next_id: value.next_id.max(max_id + 1),
            tasks,
        })
    }
}

fn repository_error(message: impl Into<String>) -> TodoServiceError {
    TodoServiceError::Repository(message.into())
}

#[cfg(test)]
mod tests {
    use std::{
        env,
        fs,
        path::PathBuf,
        time::{SystemTime, UNIX_EPOCH},
    };

    use crate::{
        application::todo_service::TodoRepository,
        domain::task::TaskTitle,
    };

    use super::JsonTodoRepository;

    #[test]
    fn persists_tasks_between_repository_instances() {
        let path = unique_test_path("persists_tasks");
        let repository = JsonTodoRepository::new(path.clone(), ["a"]).expect("repo should init");

        repository
            .create(TaskTitle::new("b").expect("valid title"))
            .expect("task should be created");

        let reloaded = JsonTodoRepository::new(path.clone(), ["seed should be ignored"])
            .expect("repo should reload existing file");

        let tasks = reloaded.list();
        assert_eq!(tasks.len(), 2);
        assert_eq!(tasks[0].title(), "a");
        assert_eq!(tasks[1].title(), "b");

        let _ = fs::remove_file(path);
    }

    #[test]
    fn preserves_completed_state_after_reload() {
        let path = unique_test_path("preserves_completed_state");
        let repository = JsonTodoRepository::new(path.clone(), ["a"]).expect("repo should init");
        let task = repository.find(1).expect("seeded task should exist").toggle();

        repository.save(task).expect("task should save");

        let reloaded = JsonTodoRepository::new(path.clone(), ["seed should be ignored"])
            .expect("repo should reload existing file");

        assert!(reloaded.find(1).expect("task should exist").completed());

        let _ = fs::remove_file(path);
    }

    fn unique_test_path(label: &str) -> PathBuf {
        let timestamp = SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .expect("system time should be after unix epoch")
            .as_nanos();

        env::temp_dir().join(format!("tauri_todo_course_{label}_{timestamp}.json"))
    }
}
