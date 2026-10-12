import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

/**
 * The Finding33 interactive keyboard test must actually run. One fresh Edge
 * retest is permissible only when the first browser never mounted React during
 * a Page.navigate CDP timeout. Real JS/network/keyboard errors are fatal.
 */
export function isRetryableFinding33NavigationFailure(value) {
  if (!value || value.reason !== "Error: Finding33 CDP command timed out: Page.navigate") return false;
  const page = value.pageState;
  return typeof value.pageUrl === "string"
    && value.pageUrl.startsWith("http://127.0.0.1:")
    && page?.url === value.pageUrl
    && page.readyState === "interactive"
    && page.rootChildren === 0
    && page.presentation === null
    && Array.isArray(page.entryScripts) && page.entryScripts.length > 0
    && Array.isArray(page.loadedResources) && page.loadedResources.length === 0
    && Array.isArray(page.keyTrace) && page.keyTrace.length === 0
    && Array.isArray(value.browserEvents) && value.browserEvents.length === 0;
}

export function runWithBoundedFinding33BootstrapRecovery({
  execute, loadFailure, preserveFailure, onRetry = () => {},
}) {
  for (let attempt = 1; attempt <= 2; attempt++) {
    const exitCode = execute(attempt);
    if (exitCode === 0) return 0;
    const failure = loadFailure();
    if (attempt !== 1 || !isRetryableFinding33NavigationFailure(failure)) {
      return exitCode || 1;
    }
    preserveFailure(failure, attempt);
    onRetry(attempt);
  }
  return 1;
}

function run(argv) {
  if (argv.length !== 2) {
    console.error("Usage: node scripts/run-finding33-large-notes-escape.mjs <preview-url> <edge-exe>");
    return 2;
  }
  const driverPath = fileURLToPath(new URL("./test-finding33-large-notes-escape.mjs", import.meta.url));
  const directory = path.resolve("artifacts/visual-regression");
  const failurePath = path.join(directory, "finding33-large-notes-escape-failure.json");
  const retainedPath = path.join(directory, "finding33-large-notes-escape-failure-attempt-1.json");
  fs.mkdirSync(directory, {recursive: true});
  const status = runWithBoundedFinding33BootstrapRecovery({
    execute: () => {
      // Never classify evidence from a previous attempt as this attempt.
      fs.rmSync(failurePath, {force: true});
      const child = spawnSync(process.execPath, [driverPath, ...argv], {
        cwd: process.cwd(),
        stdio: "inherit",
        windowsHide: true,
      });
      if (child.error) {
        console.error("Finding33 driver could not start:", child.error);
        return 2;
      }
      return child.status === 0 ? 0 : (child.status ?? 1);
    },
    loadFailure: () => {
      try {
        return JSON.parse(fs.readFileSync(failurePath, "utf8"));
      } catch {
        return null;
      }
    },
    preserveFailure: () => {
      // Preserve the first failure even if the fresh independent run succeeds.
      fs.copyFileSync(failurePath, retainedPath);
    },
    onRetry: () => {
      console.warn("Finding33 Edge Page.navigate stalled before module/React bootstrap; retrying once with a fresh isolated Edge process, preserving the first diagnostic.");
    },
  });
  return status;
}

if (process.argv[1] && import.meta.url === new URL("file://" + path.resolve(process.argv[1]).replaceAll("\\", "/")).href) {
  process.exitCode = run(process.argv.slice(2));
}
