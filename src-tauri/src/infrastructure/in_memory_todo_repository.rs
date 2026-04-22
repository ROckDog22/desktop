use std::sync::Mutex;

use crate::{
    application::todo_service::{TodoRepository, TodoServiceError},
    domain::task::{Task, TaskTitle},
};

pub struct InMemoryTodoRepository {
    inner: Mutex<Store>,
}

impl InMemoryTodoRepository {
    pub fn seeded<const N: usize>(titles: [&str; N]) -> Self {
        let mut next_id = 1_u64;
        let tasks = titles
            .into_iter()
            .filter_map(|title| {
                let title = TaskTitle::new(title).ok()?;
                let task = Task::new(next_id, title);
                next_id += 1;
                Some(task)
            })
            .collect::<Vec<_>>();

        Self {
            inner: Mutex::new(Store { next_id, tasks }),
        }
    }
}

impl TodoRepository for InMemoryTodoRepository {
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
        let task = Task::new(store.next_id, title);
        store.next_id += 1;
        store.tasks.push(task.clone());
        Ok(task)
    }

    fn save(&self, task: Task) -> Result<(), TodoServiceError> {
        let mut store = self.inner.lock().expect("todo repository lock poisoned");
        let Some(position) = store.tasks.iter().position(|current| current.id() == task.id()) else {
            return Err(TodoServiceError::TaskNotFound { id: task.id() });
        };

        store.tasks[position] = task;
        Ok(())
    }

    fn delete(&self, id: u64) -> Result<(), TodoServiceError> {
        let mut store = self.inner.lock().expect("todo repository lock poisoned");
        let before = store.tasks.len();
        store.tasks.retain(|task| task.id() != id);

        if before == store.tasks.len() {
            return Err(TodoServiceError::TaskNotFound { id });
        }

        Ok(())
    }
}

struct Store {
    next_id: u64,
    tasks: Vec<Task>,
}

#[cfg(test)]
mod tests {
    use crate::{
        application::todo_service::TodoRepository,
        domain::task::TaskTitle,
    };

    use super::InMemoryTodoRepository;

    #[test]
    fn creates_tasks_with_incrementing_ids() {
        let repository = InMemoryTodoRepository::seeded(["a"]);
        let first = repository
            .create(TaskTitle::new("b").expect("valid title"))
            .expect("task should be created");
        let second = repository
            .create(TaskTitle::new("c").expect("valid title"))
            .expect("task should be created");

        assert_eq!(first.id(), 2);
        assert_eq!(second.id(), 3);
    }
}
