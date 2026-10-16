import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
import ts from "typescript";

// Q10: execute actual FocusLiveSubtasks.runMutation and
// FocusLiveMetrics.save source bodies, not a separate "exclusive" model.
function extract(file, begin, end) {
  const source = fs.readFileSync(file, "utf8");
  const start = source.indexOf(begin), stop = source.indexOf(end, start + begin.length);
  assert(start >= 0 && stop > start, `Missing production owner handler in ${file}`);
  return source.slice(start, stop);
}
function actualJs(fragment, handlers) {
  return ts.transpileModule(
    `(() => {\n${fragment}\nreturn {${handlers.join(",")}};\n})()`,
    { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.None } },
  ).outputText;
}
function deferred() {
  let resolve, reject;
  const promise = new Promise((yes, no) => { resolve = yes; reject = no; });
  return { promise, resolve, reject };
}
async function until(promise, label) {
  return Promise.race([
    promise,
    new Promise((_, reject) => setTimeout(
      () => reject(new Error(`Production Focus owner did not advance: ${label}`)), 2_000,
    )),
  ]);
}

const subtaskBody = extract("src/FocusLiveSubtasks.tsx",
  "  const handleCommittedRefreshFailure = (", "  const model: TaskSubtasksModel = ");
assert(subtaskBody.includes("mutationInFlightRef.current = true;")
  && subtaskBody.includes("await mutation();")
  && subtaskBody.includes("await refreshSubtasksAndBoard();")
  && subtaskBody.includes("mutationInFlightRef.current = false;"));
const subtaskExecutable = actualJs(subtaskBody,
  ["handleCommittedRefreshFailure", "runMutation"]);
function subtasks({ refresh } = {}) {
  const calls = { pending: [], errors: [], blocked: [], refreshes: 0 };
  const ctx = {
    fixtureMode: false, interactionPending: false, pending: false,
    mutationInFlightRef: { current: false },
    committedRefreshBlockedRef: { current: false },
    refreshBlocked: false, snapshot: { mutable: true },
    mountedRef: { current: true },
    setPending: value => calls.pending.push(value),
    setError: value => calls.errors.push(value),
    setRefreshBlocked: value => calls.blocked.push(value),
    formatInvokeError: error => String(error?.message ?? error),
    refreshSubtasksAndBoard: async () => {
      calls.refreshes++;
      if (refresh) await refresh();
    },
  };
  const actual = vm.runInNewContext(subtaskExecutable, ctx, { timeout: 3000 });
  return { ...actual, ctx, calls };
}
// First committed subtask operation must own the entire separately awaited
// authoritative board/subtask refresh, not only its SQLite write phase.
{
  const write = deferred(), read = deferred(), readEntered = deferred();
  const h = subtasks({ refresh: async () => { readEntered.resolve(); await read.promise; } });
  let writes = 0, afterCommits = 0;
  const first = h.runMutation(async () => { writes++; await write.promise; },
    () => { afterCommits++; });
  await h.runMutation(async () => { writes++; });
  assert.equal(writes, 1);
  write.resolve();
  await until(readEntered.promise, "subtask committed authoritative refetch");
  assert.equal(afterCommits, 1);
  assert.equal(h.calls.refreshes, 1);
  assert.equal(h.ctx.mutationInFlightRef.current, true);
  await h.runMutation(async () => { writes++; });
  assert.equal(writes, 1, "Second subtask write must be excluded throughout refetch");
  read.resolve();
  await first;
  assert.equal(h.ctx.mutationInFlightRef.current, false);
  assert.deepEqual(h.calls.pending, [true, false]);
}
// A failed authoritative refresh must visibly differentiate an already
// committed native subtask write from a failed write and release the owner.
{
  const h = subtasks({ refresh: async () => { throw new Error("readback offline"); } });
  let written = 0;
  await h.runMutation(async () => { written++; });
  assert.equal(written, 1);
  assert.deepEqual(h.calls.blocked, [true]);
  assert.equal(h.ctx.committedRefreshBlockedRef.current, true);
  await h.runMutation(async () => { written++; });
  assert.equal(written, 1, "Committed refresh failure must reject retry before React renders blocked state");
  assert.match(String(h.calls.errors.at(-1)),
    /Subtask change was saved.*readback offline/);
  assert.equal(h.ctx.mutationInFlightRef.current, false);
}
{
  const h = subtasks();
  await h.runMutation(async () => { throw new Error("subtask storage rejected"); });
  assert.match(String(h.calls.errors.at(-1)), /subtask storage rejected/);
  assert.equal(h.calls.refreshes, 0);
  assert.equal(h.ctx.mutationInFlightRef.current, false);
}

// The Board uses the same synchronous blocked-admission rule even when its
// rendered interactionBoardEnabled value has not caught up with the failure.
{
  const begin = extract("src/ListBoard.tsx", "  const beginSubtaskMutation = (", "  const finishSubtaskCommit = async (");
  let pendingUpdates = 0;
  const panel = { loading: false, error: null, pending: false, snapshot: { mutable: true } };
  const ctx = { interactionBoardEnabled: true, subtaskPanel: panel,
    committedSubtaskRefreshBlockedRef: { current: true },
    setSubtaskPanel: () => { pendingUpdates++; }, setMutationError: () => {} };
  const h = vm.runInNewContext(actualJs(begin, ["beginSubtaskMutation"]), ctx);
  assert.equal(h.beginSubtaskMutation(), null);
  assert.equal(pendingUpdates, 0);
  ctx.committedSubtaskRefreshBlockedRef.current = false;
  assert.equal(h.beginSubtaskMutation(), panel);
  assert.equal(pendingUpdates, 1);
}

const metricBody = extract("src/FocusLiveMetrics.tsx",
  "  const save = async () => {", "\n  return (\n");
assert(metricBody.includes("metricMutationInFlightRef.current = true;")
  && metricBody.includes("await setPausedTimerEstimate(")
  && metricBody.includes("await setPausedTimerTimeTaken(")
  && metricBody.includes("onTimerPayload(payload);")
  && metricBody.includes("metricMutationInFlightRef.current = false;"));
const metricExecutable = actualJs(metricBody, ["save"]);
function metrics({ kind = "estimate", native, refresh, parse } = {}) {
  const calls = {
    estimates: [], taken: [], payloads: [], editors: [], pending: [],
    errors: [], statuses: [], blocked: [], refreshed: [],
  };
  const ctx = {
    fixtureMode: false, pending: false, // keep same-render pending stale
    metricMutationInFlightRef: { current: false },
    refreshBlocked: false, interactionBlocked: false, pausedEditable: true,
    task: { id: "task-live", listId: "list-own" },
    editor: { metric: kind, value: "1:10", expectedEstSeconds: 60,
      expectedTimeTakenSeconds: 60 },
    parseMetricDuration: () => parse ?? { ok: true, seconds: 70 },
    setPending: value => calls.pending.push(value),
    setStatus: value => calls.statuses.push(value),
    setError: value => calls.errors.push(value),
    setRefreshBlocked: value => calls.blocked.push(value),
    setEditor: value => calls.editors.push(value),
    onTimerPayload: value => calls.payloads.push(value),
    metricLabel: value => value === "estimate" ? "EST" : "Time Taken",
    formatInvokeError: error => String(error?.message ?? error),
    setPausedTimerEstimate: async value => {
      calls.estimates.push(value);
      return native ? await native() : { timer: { state: "paused" } };
    },
    setPausedTimerTimeTaken: async value => {
      calls.taken.push(value);
      return native ? await native() : { timer: { state: "paused" } };
    },
    refreshAfterCommittedMutation: async (...args) => {
      calls.refreshed.push(args);
      if (refresh) await refresh();
    },
  };
  const actual = vm.runInNewContext(metricExecutable, ctx, { timeout: 3000 });
  return { ...actual, ctx, calls };
}
// Paused EST blocks same-render repeat and alternate metric writes through
// committed timer payload and fallible independent board readback.
{
  const write = deferred(), read = deferred(), entered = deferred();
  const h = metrics({
    native: () => write.promise,
    refresh: async () => { entered.resolve(); await read.promise; },
  });
  const first = h.save();
  await h.save();
  assert.equal(h.calls.estimates.length, 1);
  assert.equal(h.calls.taken.length, 0);
  write.resolve({ timer: { state: "paused", task_id: "task-live" } });
  await until(entered.promise, "paused metric authoritative board read");
  assert.equal(h.calls.payloads.length, 1);
  assert.deepEqual(h.calls.editors, [null],
    "Committed timer mutation must close editor before fallible readback");
  assert.equal(h.ctx.metricMutationInFlightRef.current, true);
  await h.save();
  assert.equal(h.calls.estimates.length, 1);
  read.resolve();
  await first;
  assert.equal(h.ctx.metricMutationInFlightRef.current, false);
  assert.deepEqual(h.calls.pending, [true, false]);
}
// Alternate Time Taken route and post-commit read failure preserve timer
// payload, close the editor, and report saved state separately from failure.
{
  const h = metrics({ kind: "time_taken",
    refresh: async () => { throw new Error("authoritative board offline"); } });
  await h.save();
  assert.equal(h.calls.taken.length, 1);
  assert.equal(h.calls.estimates.length, 0);
  assert.equal(h.calls.payloads.length, 1);
  assert.deepEqual(h.calls.editors, [null]);
  assert.deepEqual(h.calls.blocked, [true]);
  assert.match(String(h.calls.errors.at(-1)), /Metric change was saved.*board offline/);
  assert.equal(h.ctx.metricMutationInFlightRef.current, false);
}
// Validation errors cannot acquire write ownership or invoke native IPC.
{
  const h = metrics({ parse: { ok: false, message: "Invalid metric" } });
  await h.save();
  assert.equal(h.calls.estimates.length+h.calls.taken.length, 0);
  assert.equal(h.ctx.metricMutationInFlightRef.current, false);
  assert.match(String(h.calls.errors.at(-1)), /Invalid metric/);
}
console.log("Actual Focus Subtasks and paused metric handlers: owners, commit/readback and errors passed.");
