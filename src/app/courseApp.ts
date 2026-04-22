import {
  type AppError,
  addTodo,
  deleteTodo,
  getTodoBoard,
  toggleTodo,
  type TodoBoard
} from "./tauriClient";
import { renderDashboard } from "../ui/renderDashboard";

type State = {
  board: TodoBoard | null;
  draftTitle: string;
  appError: AppError | null;
  isLoading: boolean;
  isSubmitting: boolean;
};

const state: State = {
  board: null,
  draftTitle: "",
  appError: null,
  isLoading: true,
  isSubmitting: false
};

export async function startCourseApp(root: HTMLDivElement): Promise<void> {
  bind(root);
  await refresh(root);
}

async function refresh(root: HTMLDivElement): Promise<void> {
  state.isLoading = true;
  state.appError = null;
  paint(root);

  try {
    state.board = await getTodoBoard();
  } catch (error) {
    state.appError = normalizeUiError(error);
    state.board = {
      productName: "Tauri Todo Course",
      lessonTitle: "Lesson 04 · 错误建模与窗口状态",
      lessonGoal: "Rust Core 暂时不可用，请先检查 Tauri 运行环境。",
      persistenceSummary: "当前未能连接 Rust Core，因此无法读取 JSON 持久化状态。",
      dataFilePath: "Unavailable",
      desktopExperienceSummary: "窗口状态插件尚未初始化。",
      architectureRules: ["错误是协议的一部分", "Service 厚", "桌面能力在 setup 装配"],
      commandMap: ["get_todo_board", "add_todo", "toggle_todo", "delete_todo"],
      totalCount: 0,
      completedCount: 0,
      remainingCount: 0,
      tasks: []
    };
  } finally {
    state.isLoading = false;
    paint(root);
  }
}

async function createTask(root: HTMLDivElement, title: string): Promise<void> {
  state.isSubmitting = true;
  state.appError = null;
  paint(root);

  try {
    state.board = await addTodo(title);
    state.draftTitle = "";
  } catch (error) {
    state.appError = normalizeUiError(error);
  } finally {
    state.isSubmitting = false;
    paint(root);
  }
}

async function toggleTask(root: HTMLDivElement, id: number): Promise<void> {
  state.isSubmitting = true;
  state.appError = null;
  paint(root);

  try {
    state.board = await toggleTodo(id);
  } catch (error) {
    state.appError = normalizeUiError(error);
  } finally {
    state.isSubmitting = false;
    paint(root);
  }
}

async function removeTask(root: HTMLDivElement, id: number): Promise<void> {
  state.isSubmitting = true;
  state.appError = null;
  paint(root);

  try {
    state.board = await deleteTodo(id);
  } catch (error) {
    state.appError = normalizeUiError(error);
  } finally {
    state.isSubmitting = false;
    paint(root);
  }
}

function paint(root: HTMLDivElement): void {
  root.innerHTML = renderDashboard(
    state.board ?? {
      productName: "Tauri Todo Course",
      lessonTitle: "Lesson 04 · 错误建模与窗口状态",
      lessonGoal: "正在从 Rust Core 拉取当前任务面板...",
      persistenceSummary: "正在解析应用数据目录并加载 JSON 文件...",
      dataFilePath: "Loading...",
      desktopExperienceSummary: "正在初始化桌面插件并恢复窗口状态...",
      architectureRules: [],
      commandMap: [],
      totalCount: 0,
      completedCount: 0,
      remainingCount: 0,
      tasks: []
    },
    state.draftTitle,
    state.isLoading,
    state.isSubmitting,
    state.appError
  );
}

function normalizeUiError(error: unknown): AppError {
  if (
    error &&
    typeof error === "object" &&
    "code" in error &&
    "message" in error &&
    "operation" in error &&
    "recoverable" in error &&
    "suggestion" in error
  ) {
    return error as AppError;
  }

  return {
    code: "UNKNOWN_ERROR",
    message: String(error),
    operation: "ui_fallback",
    recoverable: true,
    suggestion: "重试一次；如果问题持续存在，请检查本地运行环境。"
  };
}

function bind(root: HTMLDivElement): void {
  root.addEventListener("input", (event) => {
    const target = event.target;

    if (!(target instanceof HTMLInputElement)) {
      return;
    }

    if (target.dataset.role === "task-input") {
      state.draftTitle = target.value;
    }
  });

  root.addEventListener("submit", async (event) => {
    const form = event.target;
    if (!(form instanceof HTMLFormElement)) {
      return;
    }

    if (form.dataset.role !== "todo-form") {
      return;
    }

    event.preventDefault();
    if (state.isSubmitting) {
      return;
    }

    const data = new FormData(form);
    const title = String(data.get("title") ?? "");
    await createTask(root, title);
  });

  root.addEventListener("click", async (event) => {
    const target = event.target;

    if (!(target instanceof HTMLElement)) {
      return;
    }

    const actionElement = target.closest<HTMLElement>("[data-action]");
    if (!actionElement || state.isSubmitting) {
      return;
    }

    const { action, taskId } = actionElement.dataset;
    const id = Number(taskId);

    if (!Number.isFinite(id)) {
      return;
    }

    if (action === "toggle") {
      await toggleTask(root, id);
      return;
    }

    if (action === "delete") {
      await removeTask(root, id);
    }
  });
}
