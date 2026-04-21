import { loadBootstrap, type BootstrapPayload } from "./tauriClient";
import { renderDashboard } from "../ui/renderDashboard";

type State = {
  currentName: string;
  payload: BootstrapPayload | null;
  isLoading: boolean;
};

const state: State = {
  currentName: "架构师",
  payload: null,
  isLoading: true
};

export async function startCourseApp(root: HTMLDivElement): Promise<void> {
  await refresh(root, state.currentName);
}

async function refresh(root: HTMLDivElement, name: string): Promise<void> {
  state.currentName = name.trim() || "架构师";
  state.isLoading = true;
  paint(root);

  try {
    state.payload = await loadBootstrap(state.currentName);
  } catch (error) {
    state.payload = {
      productName: "Tauri Todo Course",
      greeting: "Rust Core 暂时不可用，请先检查 Tauri 运行环境。",
      processModel: `错误信息：${String(error)}`,
      coreBoundary: "Lesson 01 先保证边界清晰，再继续加功能。",
      architectureRules: ["Command 薄", "Service 厚", "Domain 不依赖 Tauri"],
      nextLessons: ["接入 Todo 用例", "引入 Repository", "加入本地持久化"]
    };
  } finally {
    state.isLoading = false;
    paint(root);
    bind(root);
  }
}

function paint(root: HTMLDivElement): void {
  root.innerHTML = renderDashboard(
    state.payload ?? {
      productName: "Tauri Todo Course",
      greeting: "正在从 Rust Core 获取启动信息...",
      processModel: "WebView 负责界面，Rust Core 负责系统能力。",
      coreBoundary: "Command 是边界，不是业务中心。",
      architectureRules: [],
      nextLessons: []
    },
    state.currentName,
    state.isLoading
  );
}

function bind(root: HTMLDivElement): void {
  const form = root.querySelector<HTMLFormElement>('[data-role="welcome-form"]');

  if (!form) {
    return;
  }

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const data = new FormData(form);
    const name = String(data.get("name") ?? "");
    await refresh(root, name);
  });
}
