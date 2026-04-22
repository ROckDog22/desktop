import type { TodoBoard } from "../app/tauriClient";

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function renderList(items: string[], accent: "gold" | "blue"): string {
  return items
    .map(
      (item) => `
        <li class="chip chip-${accent}">
          ${escapeHtml(item)}
        </li>
      `
    )
    .join("");
}

function renderTasks(board: TodoBoard, isSubmitting: boolean): string {
  if (board.tasks.length === 0) {
    return `
      <li class="empty-state">
        现在还是空列表。第 3 课的重点不是任务数量，而是验证 JSON 持久化替换没有破坏上层语义。
      </li>
    `;
  }

  return board.tasks
    .map(
      (task) => `
        <li class="task-row">
          <button
            class="toggle ${task.completed ? "is-complete" : ""}"
            data-action="toggle"
            data-task-id="${task.id}"
            ${isSubmitting ? "disabled" : ""}
          >
            ${task.completed ? "已完成" : "进行中"}
          </button>

          <div class="task-copy">
            <p class="task-title ${task.completed ? "task-title-complete" : ""}">
              ${escapeHtml(task.title)}
            </p>
            <p class="task-meta">Task #${task.id}</p>
          </div>

          <button
            class="ghost-button"
            data-action="delete"
            data-task-id="${task.id}"
            ${isSubmitting ? "disabled" : ""}
          >
            删除
          </button>
        </li>
      `
    )
    .join("");
}

export function renderDashboard(
  board: TodoBoard,
  draftTitle: string,
  isLoading: boolean,
  isSubmitting: boolean,
  errorMessage: string | null
): string {
  return `
    <main class="shell">
      <section class="hero">
        <p class="eyebrow">${escapeHtml(board.lessonTitle)}</p>
        <h1>${escapeHtml(board.productName)}</h1>
        <p class="lead">
          ${escapeHtml(board.lessonGoal)}
        </p>

        <div class="stats-row">
          <article class="stat-card">
            <span>总任务</span>
            <strong>${board.totalCount}</strong>
          </article>
          <article class="stat-card">
            <span>已完成</span>
            <strong>${board.completedCount}</strong>
          </article>
          <article class="stat-card">
            <span>剩余</span>
            <strong>${board.remainingCount}</strong>
          </article>
        </div>
      </section>

      <section class="workspace">
        <article class="panel panel-primary">
          <div class="panel-header">
            <div>
              <p class="panel-tag">Todo Use Case</p>
              <h2>前端触发交互，Rust Core 维护状态</h2>
            </div>
            <span class="status-pill ${isLoading ? "status-pill-loading" : ""}">
              ${isLoading ? "加载中" : isSubmitting ? "处理中" : "已就绪"}
            </span>
          </div>

          <form class="todo-form" data-role="todo-form">
            <label for="title">新增任务</label>
            <div class="form-row">
              <input
                id="title"
                name="title"
                data-role="task-input"
                value="${escapeHtml(draftTitle)}"
                placeholder="例如：把切换完成状态的语义放进 service"
              />
              <button type="submit" ${isSubmitting ? "disabled" : ""}>
                ${isSubmitting ? "处理中..." : "新增任务"}
              </button>
            </div>
          </form>

          ${
            errorMessage
              ? `<p class="error-banner">${escapeHtml(errorMessage)}</p>`
              : ""
          }

          <ul class="task-list">
            ${renderTasks(board, isSubmitting)}
          </ul>
        </article>

        <article class="panel">
          <p class="panel-tag">Persistence</p>
          <h2>第三课只替换仓储，不推翻上层契约</h2>
          <p class="panel-copy">${escapeHtml(board.persistenceSummary)}</p>
          <p class="path-chip">${escapeHtml(board.dataFilePath)}</p>
        </article>

        <article class="panel">
          <p class="panel-tag">Command Contract</p>
          <h2>命令名和返回结构继续保持稳定</h2>
          <ul class="chips">
            ${renderList(board.commandMap, "blue")}
          </ul>
        </article>
      </section>

      <section class="grid">
        <article class="card">
          <p class="card-tag">Architecture Rules</p>
          <h3>把会变化的部分隔离在边界层</h3>
          <ul class="chips">
            ${renderList(board.architectureRules, "gold")}
          </ul>
        </article>

        <article class="card">
          <p class="card-tag">Why Repository</p>
          <h3>现在重启应用，任务仍然会从 JSON 文件恢复</h3>
          <p class="panel-copy">
            这就是第三课最重要的架构信号：Lesson 02 里定义好的 command、service、domain
            语义没有推翻，只是把具体存储从内存改成了 JSON 文件。
          </p>
        </article>
      </section>
    </main>
  `;
}
