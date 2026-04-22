import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const repoRoot = new URL("..", import.meta.url);

const packageJsonPath = fromRoot("package.json");
const tauriConfigPath = fromRoot("src-tauri/tauri.conf.json");
const buildScriptPath = fromRoot("src-tauri/build.rs");
const iconPath = fromRoot("src-tauri/icons/icon.png");
const capabilityPaths = [
  fromRoot("src-tauri/capabilities/main-window-core.json"),
  fromRoot("src-tauri/capabilities/main-window-state.json"),
  fromRoot("docs/lessons/05-capabilities-and-release.md"),
];

const packageJson = readJson(packageJsonPath);
const tauriConfig = readJson(tauriConfigPath);
const buildScript = readText(buildScriptPath);

assert(packageJson.version === tauriConfig.version, "package.json 与 tauri.conf.json 的版本号必须一致。");
assert(tauriConfig.bundle?.active === true, "tauri.conf.json 必须显式启用 bundle.active。");

const configuredCapabilities = tauriConfig.app?.security?.capabilities ?? [];
assert(
  Array.isArray(configuredCapabilities) &&
    configuredCapabilities.includes("desktop-main") &&
    configuredCapabilities.includes("desktop-window-state"),
  "tauri.conf.json 必须显式引用 desktop-main 和 desktop-window-state 两个 capability。"
);

for (const path of [iconPath, ...capabilityPaths]) {
  assert(existsSync(path), `缺少发布所需文件: ${path}`);
}

for (const command of ["get_todo_board", "add_todo", "toggle_todo", "delete_todo"]) {
  assert(
    buildScript.includes(`"${command}"`),
    `build.rs 缺少 ${command} 的构建期命令白名单配置。`
  );
}

console.log("Release check passed.");
console.log(`Version: ${packageJson.version}`);
console.log(`Capabilities: ${configuredCapabilities.join(", ")}`);

function fromRoot(relativePath) {
  return new URL(relativePath, repoRoot).pathname;
}

function readJson(path) {
  return JSON.parse(readText(path));
}

function readText(path) {
  return readFileSync(path, "utf8");
}

function assert(condition, message) {
  if (!condition) {
    console.error(`Release check failed: ${message}`);
    process.exit(1);
  }
}
