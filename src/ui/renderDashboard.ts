import type { AppError, TodoBoard } from "../app/tauriClient";

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
        现在还是空列表。第 5 课的重点不是功能数量，而是把权限面和发布边界真正收束起来。
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
  appError: AppError | null
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

          ${renderErrorBanner(appError)}

          <ul class="task-list">
            ${renderTasks(board, isSubmitting)}
          </ul>
        </article>

        <article class="panel">
          <p class="panel-tag">Persistence</p>
          <h2>数据边界继续稳定存在，发布收口不影响它</h2>
          <p class="panel-copy">${escapeHtml(board.persistenceSummary)}</p>
          <p class="path-chip">${escapeHtml(board.dataFilePath)}</p>
        </article>

        <article class="panel">
          <p class="panel-tag">Desktop Experience</p>
          <h2>窗口尺寸与位置会跟随桌面生命周期恢复</h2>
          <p class="panel-copy">${escapeHtml(board.desktopExperienceSummary)}</p>
        </article>

        <article class="panel">
          <p class="panel-tag">Security Boundary</p>
          <h2>主窗口只保留显式声明的 Capability</h2>
          <p class="panel-copy">${escapeHtml(board.securityBoundarySummary)}</p>
        </article>

        <article class="panel">
          <p class="panel-tag">Release Readiness</p>
          <h2>发布前先跑静态检查，而不是出包后补救</h2>
          <p class="panel-copy">${escapeHtml(board.releaseReadinessSummary)}</p>
        </article>

        <article class="panel">
          <p class="panel-tag">Command Contract</p>
          <h2>只保留真正还在使用的 Todo 命令</h2>
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
          <p class="card-tag">Capability Strategy</p>
          <h3>Capability 现在按职责拆分，而不是一把梭全部放进一个默认文件</h3>
          <p class="panel-copy">
            第 5 课把最小授权从原则变成工程做法：主窗口 Capability 显式列出 Todo command
            权限，窗口状态插件也独立放在自己的 Capability 里。
          </p>
        </article>
      </section>
    </main>
  `;
}

function renderErrorBanner(appError: AppError | null): string {
  if (!appError) {
    return "";
  }

  return `
    <div class="error-banner">
      <div class="error-header">
        <strong>${escapeHtml(appError.message)}</strong>
        <span class="error-code">${escapeHtml(appError.code)}</span>
      </div>
      <p class="error-meta">Operation: ${escapeHtml(appError.operation)}</p>
      <p class="error-meta">${escapeHtml(appError.suggestion)}</p>
      <p class="error-meta">
        ${appError.recoverable ? "这类错误通常可以恢复。" : "这类错误通常需要人工介入。"}
      </p>
    </div>
  `;
}
