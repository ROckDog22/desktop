import { readdirSync, rmSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const repoRoot = dirname(scriptDir);
const macosBundleDir = join(repoRoot, "src-tauri", "target", "release", "bundle", "macos");
const removableFilePattern = /^(rw\..+\.dmg|.+\.dmg)$/;

let removedCount = 0;

try {
  for (const entry of readdirSync(macosBundleDir, { withFileTypes: true })) {
    if (!entry.isFile()) {
      continue;
    }

    if (!removableFilePattern.test(entry.name)) {
      continue;
    }

    rmSync(join(macosBundleDir, entry.name), { force: true });
    removedCount += 1;
  }
} catch (error) {
  // The bundle directory does not exist on a fresh checkout yet, which is fine.
  if (error && error.code !== "ENOENT") {
    throw error;
  }
}

if (removedCount > 0) {
  console.log(`Removed ${removedCount} stale macOS DMG artifact(s) before bundling.`);
}
