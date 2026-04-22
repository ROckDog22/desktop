use serde::Serialize;
use tauri::State;

use crate::{application::todo_service::TodoBoard, state::AppState};

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct TodoBoardDto {
    product_name: String,
    lesson_title: String,
    lesson_goal: String,
    persistence_summary: String,
    data_file_path: String,
    architecture_rules: Vec<&'static str>,
    command_map: Vec<&'static str>,
    total_count: usize,
    completed_count: usize,
    remaining_count: usize,
    tasks: Vec<TodoItemDto>,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct TodoItemDto {
    id: u64,
    title: String,
    completed: bool,
}

#[tauri::command]
pub fn get_todo_board(state: State<'_, AppState>) -> TodoBoardDto {
    TodoBoardDto::from(state.todo_service.get_board())
}

#[tauri::command]
pub fn add_todo(state: State<'_, AppState>, title: String) -> Result<TodoBoardDto, String> {
    state
        .todo_service
        .add_task(&title)
        .map(TodoBoardDto::from)
        .map_err(|error| error.to_string())
}

#[tauri::command]
pub fn toggle_todo(state: State<'_, AppState>, id: u64) -> Result<TodoBoardDto, String> {
    state
        .todo_service
        .toggle_task(id)
        .map(TodoBoardDto::from)
        .map_err(|error| error.to_string())
}

#[tauri::command]
pub fn delete_todo(state: State<'_, AppState>, id: u64) -> Result<TodoBoardDto, String> {
    state
        .todo_service
        .delete_task(id)
        .map(TodoBoardDto::from)
        .map_err(|error| error.to_string())
}

impl From<TodoBoard> for TodoBoardDto {
    fn from(value: TodoBoard) -> Self {
        Self {
            product_name: value.product_name,
            lesson_title: value.lesson_title,
            lesson_goal: value.lesson_goal,
            persistence_summary: value.persistence_summary,
            data_file_path: value.data_file_path,
            architecture_rules: value.architecture_rules,
            command_map: value.command_map,
            total_count: value.total_count,
            completed_count: value.completed_count,
            remaining_count: value.remaining_count,
            tasks: value
                .tasks
                .into_iter()
                .map(|task| TodoItemDto {
                    id: task.id,
                    title: task.title,
                    completed: task.completed,
                })
                .collect(),
        }
    }
}
