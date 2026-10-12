import assert from "node:assert/strict";
import fs from "node:fs";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import {
  isRetryableFinding33NavigationFailure,
  runWithBoundedFinding33BootstrapRecovery,
} from "./run-finding33-large-notes-escape.mjs";

const target = "http://127.0.0.1:4173/task-notes-fixture.html?theme=dark&presentation=large";
const incomplete = {
  reason: "Error: Finding33 CDP command timed out: Page.navigate",
  pageUrl: target,
  pageState: {
    url: target, readyState: "interactive", rootChildren: 0,
    presentation: null,
    entryScripts: [{src: "http://127.0.0.1:4173/assets/taskNotes.js", type: "module"}],
    loadedResources: [], keyTrace: [],
  },
  browserEvents: [],
};
assert.equal(isRetryableFinding33NavigationFailure(incomplete), true);
for (const invalid of [
  {...incomplete, reason: "Error: Real Edge Escape failed"},
  {...incomplete, pageState: {...incomplete.pageState, rootChildren: 1}},
  {...incomplete, pageState: {...incomplete.pageState, readyState: "complete"}},
  {...incomplete, pageState: {...incomplete.pageState, url: "about:blank"}},
  {...incomplete, pageState: {...incomplete.pageState, entryScripts: []}},
  {...incomplete, pageState: {...incomplete.pageState, loadedResources: [{name: target}]}},
  {...incomplete, pageState: {...incomplete.pageState, keyTrace: [{key: "Escape"}]}},
  {...incomplete, browserEvents: [{method: "Network.loadingFailed", reason: "ERR_FAILED"}]},
  {...incomplete, browserEvents: [{method: "Runtime.exceptionThrown", message: "Error"}]},
  {...incomplete, pageState: null},
  null,
]) {
  assert.equal(isRetryableFinding33NavigationFailure(invalid), false,
    "only exact pre-bootstrap Page.navigate timeouts may retry");
}
function scenario(codes, diagnostics) {
  let count = 0;
  const preserved = [];
  const retries = [];
  const result = runWithBoundedFinding33BootstrapRecovery({
    execute: () => codes[count++] ?? 1,
    loadFailure: () => diagnostics[count - 1] ?? null,
    preserveFailure: (failure, attempt) => preserved.push({failure, attempt}),
    onRetry: attempt => retries.push(attempt),
  });
  return {count, preserved, retries, result};
}
let run = scenario([1,0], [incomplete]);
assert.equal(run.result, 0);
assert.equal(run.count, 2, "fresh second attempt must execute the real driver");
assert.equal(run.preserved[0].failure, incomplete);
assert.deepEqual(run.retries, [1]);
run = scenario([1,1], [incomplete, incomplete]);
assert.equal(run.result, 1);
assert.equal(run.count, 2, "a third attempt must never run");
assert.equal(run.preserved.length, 1);
run = scenario([1,0], [{...incomplete, browserEvents: [{method: "Runtime.exceptionThrown"}]}]);
assert.equal(run.result, 1);
assert.equal(run.count, 1, "true renderer errors must fail closed");
assert.equal(run.preserved.length, 0);
run = scenario([1,0], [null]);
assert.equal(run.count, 1, "missing diagnostics must never authorize retry");
run = scenario([0], [incomplete]);
assert.equal(run.result, 0);
assert.equal(run.count, 1);
assert.equal(run.preserved.length, 0);
const capture = fs.readFileSync("scripts/capture-visual-fixtures.ps1", "utf8");
const runner = fs.readFileSync("scripts/run-finding33-large-notes-escape.mjs", "utf8");
assert(capture.includes('run-finding33-large-notes-escape.mjs'));
assert(runner.includes('test-finding33-large-notes-escape.mjs'));
assert(!runner.includes('await key('), "never replace the original real keyboard test with a mock");
assert(runner.includes("pathToFileURL(path.resolve(process.argv[1]))"), "portable Windows and POSIX CLI entrypoint required");
const entry = new URL("./run-finding33-large-notes-escape.mjs", import.meta.url);
const wrongArgumentRun = spawnSync(process.execPath, [fileURLToPath(entry)], { encoding: "utf8" });
assert.equal(wrongArgumentRun.status, 2, "the real runner must execute as a CLI and reject missing arguments, never silently succeed");
console.log("Finding33 evidence-classified at-most-once fresh Edge bootstrap retry: PASS");
