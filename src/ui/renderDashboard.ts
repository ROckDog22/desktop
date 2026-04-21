import type { BootstrapPayload } from "../app/tauriClient";

function renderList(items: string[], accent: "gold" | "blue"): string {
  return items
    .map(
      (item) => `
        <li class="chip chip-${accent}">
          ${item}
        </li>
      `
    )
    .join("");
}

export function renderDashboard(
  payload: BootstrapPayload,
  currentName: string,
  isLoading: boolean
): string {
  return `
    <main class="shell">
      <section class="hero">
        <p class="eyebrow">Lesson 01 · 心智模型与骨架起步</p>
        <h1>${payload.productName}</h1>
        <p class="lead">
          先把 Tauri 想成一个有明确边界的桌面系统，而不是“给网页加个壳”。
        </p>

        <form class="welcome-form" data-role="welcome-form">
          <label for="name">调用 Rust Command</label>
          <div class="form-row">
            <input
              id="name"
              name="name"
              value="${currentName}"
              placeholder="输入一个称呼"
            />
            <button type="submit" ${isLoading ? "disabled" : ""}>
              ${isLoading ? "加载中..." : "重新调用"}
            </button>
          </div>
        </form>
      </section>

      <section class="panel">
        <p class="panel-tag">Rust Core 返回</p>
        <h2>${payload.greeting}</h2>
        <p class="panel-copy">${payload.processModel}</p>
        <p class="panel-copy">${payload.coreBoundary}</p>
      </section>

      <section class="grid">
        <article class="card">
          <p class="card-tag">Architecture Rules</p>
          <h3>从第一天就约束变化</h3>
          <ul class="chips">
            ${renderList(payload.architectureRules, "gold")}
          </ul>
        </article>

        <article class="card">
          <p class="card-tag">Next Lessons</p>
          <h3>后续只加能力，不推翻骨架</h3>
          <ul class="chips">
            ${renderList(payload.nextLessons, "blue")}
          </ul>
        </article>
      </section>
    </main>
  `;
}
