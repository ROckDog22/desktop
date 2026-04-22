import { invoke } from "@tauri-apps/api/core";

export type TodoItem = {
  id: number;
  title: string;
  completed: boolean;
};

export type TodoBoard = {
  productName: string;
  lessonTitle: string;
  lessonGoal: string;
  architectureRules: string[];
  commandMap: string[];
  totalCount: number;
  completedCount: number;
  remainingCount: number;
  tasks: TodoItem[];
};

export async function getTodoBoard(): Promise<TodoBoard> {
  return invoke<TodoBoard>("get_todo_board");
}

export async function addTodo(title: string): Promise<TodoBoard> {
  return invoke<TodoBoard>("add_todo", { title });
}

export async function toggleTodo(id: number): Promise<TodoBoard> {
  return invoke<TodoBoard>("toggle_todo", { id });
}

export async function deleteTodo(id: number): Promise<TodoBoard> {
  return invoke<TodoBoard>("delete_todo", { id });
}
