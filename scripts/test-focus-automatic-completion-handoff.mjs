import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
import ts from "typescript";

const actionSource = fs.readFileSync("src/FocusLiveActions.tsx", "utf8");
const panelSource = fs.readFileSync("src/FocusPanel.tsx", "utf8");
const panelCss = fs.readFileSync("src/focusPanel.css", "utf8");
const start = actionSource.indexOf("  const handleDone = async () => {");
const end = actionSource.indexOf("\n  shortcutHandlerRef.current =", start);
assert(start >= 0 && end > start, "actual Focus completion handler unavailable");
const actual = ts.transpileModule(
  actionSource.slice(start, end) + "\nhandleDone;",
  { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.None } },
).outputText;
function deferred() {
  let resolve, reject;
  const promise = new Promise((a, b) => { resolve = a; reject = b; });
  return { promise, resolve, reject };
}
const flush = async () => { for (let i = 0; i < 12; i++) await Promise.resolve(); };

function harness({ next = true, successScreen = false } = {}) {
  const pending = [], payloads = [], status = [], errors = [], events = [];
  const completedCall = deferred(), startCall = deferred(), refresh = deferred();
  let completeCount = 0, startCount = 0, snapshotCount = 0, finished = 0;
  const task = { id: "finished-1", title: "Finish report", estSeconds: 180, timeTakenSeconds: "18", listId: "list1" };
  const nextTask = next ? { id: "next-2", title: "Next task", estSeconds: 120, listId: "list1" } : null;
  const authoritative = { runtime: { timer: { task_id: task.id, state: "paused", mode: { kind: "count_up" } } } };
  const completed = { runtime: { timer: { task_id: null, state: "idle", mode: null } } };
  const started = { runtime: { timer: { task_id: nextTask?.id ?? null, state: "running", mode: { kind: "count_up" } } } };
  const board = { today: { tasks: nextTask ? [task, nextTask] : [task] }, done: { tasks: [task] } };
  const handler = vm.runInNewContext(actual, {
    beginMutation: () => true,
    getListBoardSnapshot: async () => board,
    snapshotTimerSession: async () => {
      snapshotCount++;
      return snapshotCount === 1 ? authoritative : completed;
    },
    assertExpectedLiveTask: (payload, taskId) => {
      assert.equal(payload.runtime.timer.task_id, taskId);
      assert.notEqual(payload.runtime.timer.state, "idle");
    },
    nextEligibleTask: () => nextTask,
    focusModeForTask: () => ({ kind: "count_up" }),
    target: { kind: "list", id: "list1" },
    task,
    completeTimerTask: () => { completeCount++; events.push("complete-request"); return completedCall.promise; },
    startTimerTask: (taskId) => {
      assert.equal(taskId, "next-2");
      startCount++;
      events.push("start-request");
      return startCall.promise;
    },
    showSuccessScreen: successScreen,
    preferences: { snapshot: { celebration: { successSoundEnabled: false, funGif: false } } },
    DEFAULT_SUCCESS_SOUND: "none",
    playLocalSound: () => Promise.resolve(),
    onCompletionSuccess: () => events.push("success-screen"),
    onAutomaticAdvance: (state, feedback) => {
      pending.push({ state, feedback });
      events.push(state ? "handoff-" + state.phase : "handoff-settled");
    },
    applyPayload: payload => {
      payloads.push(payload.runtime.timer.state);
      events.push("timer-" + payload.runtime.timer.state);
    },
    setNotesExpanded: () => {},
    setStatus: value => status.push(value),
    onTaskMutationCommitted: () => {
      events.push("board-refresh-request");
      return refresh.promise;
    },
    formatInvokeError: e => String(e.message ?? e),
    fail: e => errors.push(String(e.message ?? e)),
    finishMutation: () => { finished++; },
    console,
  });
  return {
    handler, complete: completedCall, start: startCall, refresh,
    events, pending, payloads, status, errors,
    get completeCount() { return completeCount; }, get startCount() { return startCount; },
    get finished() { return finished; },
    completed, started,
  };
}

// OFF/next: the parent owns the screen BEFORE the completed/idle projection.
// It remains occupied while next-start IPC and then board refresh are pending.
{
  const h = harness();
  const running = h.handler();
  await flush();
  assert.equal(h.completeCount, 1);
  assert.deepEqual(h.pending, []);
  h.complete.resolve(h.completed);
  await flush();
  assert.equal(h.pending.length, 1);
  assert.equal(h.pending[0].state.nextTaskId, "next-2");
  assert.equal(h.pending[0].state.phase, "pending");
  assert(h.events.indexOf("handoff-pending") < h.events.indexOf("timer-idle"),
    "parent handoff must precede idle timer publication");
  assert.equal(h.startCount, 1);
  assert.equal(h.pending.length, 1, "next-start pending cannot show No live task");
  h.start.resolve(h.started);
  await flush();
  assert.equal(h.payloads.at(-1), "running");
  assert.equal(h.pending.length, 1, "next-start success is not enough without new queue");
  assert(h.events.includes("board-refresh-request"));
  h.refresh.resolve();
  await running;
  assert.equal(h.pending.length, 2);
  assert.equal(h.pending.at(-1).state, null, "authoritative new board releases pending");
  assert(h.events.indexOf("board-refresh-request") < h.events.indexOf("handoff-settled"));
  assert.match(h.pending.at(-1).feedback, /Next task is now live/);
  assert.equal(h.finished, 1);
  assert.equal(h.completeCount, 1);
  assert.equal(h.startCount, 1);
}

// OFF/no next: pending holds completed task out of old Today while its
// authoritative refreshed Done/queue state catches up, then empties honestly.
{
  const h = harness({ next: false });
  const running = h.handler();
  await flush();
  h.complete.resolve(h.completed);
  await flush();
  assert.equal(h.startCount, 0);
  assert.equal(h.pending[0].state.nextTaskId, null);
  assert.equal(h.pending[0].state.phase, "pending");
  assert(h.events.includes("board-refresh-request"));
  h.refresh.resolve();
  await running;
  assert.equal(h.pending.at(-1).state, null);
  assert.match(h.pending.at(-1).feedback, /No other eligible task/);
}

// Completion rejection: no intermediate pending owner and no next start,
// preserving the uncommitted task and normal error/retry semantics.
{
  const h = harness();
  const running = h.handler(); await flush();
  h.complete.reject(new Error("completion rejected by SQLite"));
  await running;
  assert.deepEqual(h.pending, []);
  assert.equal(h.startCount, 0);
  assert.match(h.errors[0], /completion rejected/);
  assert.equal(h.finished, 1);
}

// After a committed Done, a rejected next-start is NOT a rejected Done.
// Recover authoritative idle timer, then reconcile board before release.
{
  const h = harness();
  const running = h.handler(); await flush();
  h.complete.resolve(h.completed); await flush();
  h.start.reject(new Error("next timer unavailable")); await flush();
  assert.deepEqual(h.payloads, ["idle", "idle"], "recovered timer must not pretend Running");
  assert.equal(h.pending.length, 1);
  h.refresh.resolve(); await running;
  assert.equal(h.pending.at(-1).state, null);
  assert.match(h.pending.at(-1).feedback, /next task could not start automatically/);
  assert.equal(h.completeCount, 1);
  assert.equal(h.startCount, 1);
}

// Committed completion + board read failure: never show stale queue as
// refreshed, never offer a second Done, and clearly require Focus re-entry.
{
  const h = harness();
  const running = h.handler(); await flush();
  h.complete.resolve(h.completed); await flush();
  h.start.resolve(h.started); await flush();
  h.refresh.reject(new Error("board unavailable"));
  await running;
  assert.equal(h.pending.at(-1).state.phase, "refresh-blocked");
  assert.match(h.pending.at(-1).feedback, /Reopen Focus/);
  assert(!h.pending.some(x => x.state === null));
  assert.equal(h.finished, 1);
}

// Success Screen ON remains the existing explicit success card path;
// do not introduce auto advance or synthetic timed rest there.
{
  const h = harness({ successScreen: true });
  const running = h.handler(); await flush();
  h.complete.resolve(h.completed); await flush();
  assert(h.events.includes("success-screen"));
  assert.equal(h.pending.length, 0);
  assert.equal(h.startCount, 0);
  h.refresh.resolve(); await running;
  assert.equal(h.finished, 1);
}

// These checks guard the real parent composition, not a model with a simulated
// timer/queue. Source task IDs are never rewritten to fabricate live state.
for (const text of [
  'const [automaticAdvance, setAutomaticAdvance] = useState<FocusAutomaticAdvanceState | null>(null)',
  'data-focus-live-card="advancing"',
  'className="focus-panel__live-title">{automaticAdvance.phase',
  'data-focus-advance-phase={automaticAdvance.phase}',
  'task.id !== automaticAdvance?.completedTaskId',
  'task.id !== automaticAdvance?.nextTaskId',
  'const liveTask = !automaticAdvance && liveTaskId',
  'aria-busy={automaticAdvance?.phase === "pending"}',
  'onAutomaticAdvance={(state, feedback) => {',
  'if (currentTargetKeyRef.current !== currentTargetKey) return;',
  'automaticAdvance !== null',
  'fixtureMode || !presentationActive || automaticAdvance !== null || addTaskPending',
  'inert={Boolean(completionSuccessContent || automaticAdvance)}',
  'Focus list needs refresh',
]) {
  assert(panelSource.includes(text), "parent-owned Focus pending visual contract missing: " + text);
}
assert(!actionSource.includes("onAutomaticAdvance?.(advance);\n      setNotesExpanded(false);"),
  "completed timer publication must not precede the parent pending screen");
assert(panelCss.includes(".focus-panel__live-card--advancing { min-height: 210px; pointer-events: none; }")
  && panelCss.includes('.focus-panel__live-card[data-focus-live-card="true"]:hover .focus-panel__live-heading,'),
  "pending card must retain full height and not hide its status heading on hover");
console.log("RA02 real Focus Done handler: completion/next/refresh ordering and parent visual guard PASS");
