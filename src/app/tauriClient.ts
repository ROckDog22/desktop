import { invoke } from "@tauri-apps/api/core";

export type TodoItem = {
  id: number;
  title: string;
  completed: boolean;
};

export type AppError = {
  code: string;
  message: string;
  operation: string;
  recoverable: boolean;
  suggestion: string;
};

export type TodoBoard = {
  productName: string;
  lessonTitle: string;
  lessonGoal: string;
  persistenceSummary: string;
  dataFilePath: string;
  desktopExperienceSummary: string;
  securityBoundarySummary: string;
  releaseReadinessSummary: string;
  architectureRules: string[];
  commandMap: string[];
  totalCount: number;
  completedCount: number;
  remainingCount: number;
  tasks: TodoItem[];
};

export async function getTodoBoard(): Promise<TodoBoard> {
  return invokeCommand<TodoBoard>("get_todo_board");
}

export async function addTodo(title: string): Promise<TodoBoard> {
  return invokeCommand<TodoBoard>("add_todo", { title });
}

export async function toggleTodo(id: number): Promise<TodoBoard> {
  return invokeCommand<TodoBoard>("toggle_todo", { id });
}

export async function deleteTodo(id: number): Promise<TodoBoard> {
  return invokeCommand<TodoBoard>("delete_todo", { id });
}

async function invokeCommand<T>(
  command: string,
  args?: Record<string, unknown>
): Promise<T> {
  try {
    return await invoke<T>(command, args);
  } catch (error) {
    throw normalizeAppError(error, command);
  }
}

function normalizeAppError(error: unknown, fallbackOperation: string): AppError {
  const maybeObject = parsePotentialJson(error);

  if (isAppError(maybeObject)) {
    return maybeObject;
  }

  if (typeof maybeObject === "string") {
    return {
      code: "UNKNOWN_ERROR",
      message: maybeObject,
      operation: fallbackOperation,
      recoverable: true,
      suggestion: "重试一次；如果问题持续存在，请检查本地运行环境。"
    };
  }

  return {
    code: "UNKNOWN_ERROR",
    message: "发生了未预期的错误。",
    operation: fallbackOperation,
    recoverable: true,
    suggestion: "重试一次；如果问题持续存在，请检查本地运行环境。"
  };
}

function parsePotentialJson(error: unknown): unknown {
  if (typeof error !== "string") {
    return error;
  }

  try {
    return JSON.parse(error);
  } catch {
    return error;
  }
}

function isAppError(value: unknown): value is AppError {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Partial<AppError>;
  return (
    typeof candidate.code === "string" &&
    typeof candidate.message === "string" &&
    typeof candidate.operation === "string" &&
    typeof candidate.recoverable === "boolean" &&
    typeof candidate.suggestion === "string"
  );
}
