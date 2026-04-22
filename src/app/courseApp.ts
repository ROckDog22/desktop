import {
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
  errorMessage: string | null;
  isLoading: boolean;
  isSubmitting: boolean;
};

const state: State = {
  board: null,
  draftTitle: "",
  errorMessage: null,
  isLoading: true,
  isSubmitting: false
};

export async function startCourseApp(root: HTMLDivElement): Promise<void> {
  bind(root);
  await refresh(root);
}

async function refresh(root: HTMLDivElement): Promise<void> {
  state.isLoading = true;
  state.errorMessage = null;
  paint(root);

  try {
    state.board = await getTodoBoard();
  } catch (error) {
    state.errorMessage = String(error);
    state.board = {
      productName: "Tauri Todo Course",
      lessonTitle: "Lesson 03 · JSON 持久化与封闭修改",
      lessonGoal: "Rust Core 暂时不可用，请先检查 Tauri 运行环境。",
      persistenceSummary: "当前未能连接 Rust Core，因此无法读取 JSON 持久化状态。",
      dataFilePath: "Unavailable",
      architectureRules: ["Command 薄", "Service 厚", "Repository 可替换"],
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
  state.errorMessage = null;
  paint(root);

  try {
    state.board = await addTodo(title);
    state.draftTitle = "";
  } catch (error) {
    state.errorMessage = String(error);
  } finally {
    state.isSubmitting = false;
    paint(root);
  }
}

async function toggleTask(root: HTMLDivElement, id: number): Promise<void> {
  state.isSubmitting = true;
  state.errorMessage = null;
  paint(root);

  try {
    state.board = await toggleTodo(id);
  } catch (error) {
    state.errorMessage = String(error);
  } finally {
    state.isSubmitting = false;
    paint(root);
  }
}

async function removeTask(root: HTMLDivElement, id: number): Promise<void> {
  state.isSubmitting = true;
  state.errorMessage = null;
  paint(root);

  try {
    state.board = await deleteTodo(id);
  } catch (error) {
    state.errorMessage = String(error);
  } finally {
    state.isSubmitting = false;
    paint(root);
  }
}

function paint(root: HTMLDivElement): void {
  root.innerHTML = renderDashboard(
    state.board ?? {
      productName: "Tauri Todo Course",
      lessonTitle: "Lesson 03 · JSON 持久化与封闭修改",
      lessonGoal: "正在从 Rust Core 拉取当前任务面板...",
      persistenceSummary: "正在解析应用数据目录并加载 JSON 文件...",
      dataFilePath: "Loading...",
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
    state.errorMessage
  );
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
