import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
import ts from "typescript";

// Execute the real production mutation callback under deferred native IPC.
// No imitation success/reorder state machine: the code between these anchors
// is taken directly from ListBoard.tsx on every test run.
const board = fs.readFileSync("src/ListBoard.tsx", "utf8");
const pointer = fs.readFileSync("src/boardTaskPointerDrag.ts", "utf8");
const start = board.indexOf("  const commitDrop = async (");
const end = board.indexOf("\n  const submitCreate = async", start);
assert(start >= 0 && end > start, "actual Board drop mutation handler missing");
const productionCommit = ts.transpileModule(
  board.slice(start, end) + "\ncommitDrop;",
  { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.None } },
).outputText;

const deferred = () => {
  let resolve, reject;
  const promise = new Promise((yes, no) => { resolve = yes; reject = no; });
  return { promise, resolve, reject };
};
const flush = async () => { for (let i = 0; i < 5; i++) await Promise.resolve(); };
function harness({ enabled = true } = {}) {
  const writes = [], reads = [], statuses = [], errors = [], pending = [], clears = [];
  const task = { id: "task-1", title: "Prioritize", listId: "list-1" };
  let blocked = false;
  const callback = vm.runInNewContext(productionCommit, {
    interactionReorderEnabled: enabled,
    target: { kind: "list", id: "list-1" },
    mutationPendingTaskId: null,
    mutationRefreshBlocked: false,
    findTask: id => id === task.id ? task : null,
    isManualReorderTask: () => true,
    setMutationPendingTaskId: value => pending.push(value),
    setMutationError: value => errors.push(value),
    setMutationStatus: value => statuses.push(value),
    setDragState: () => clears.push("source"),
    setDropTarget: () => clears.push("target"),
    reorderListBoardTask: request => {
      const write = deferred(); writes.push({ kind: "reorder", request, ...write });
      return write.promise;
    },
    moveListBoardTask: request => {
      const write = deferred(); writes.push({ kind: "move", request, ...write });
      return write.promise;
    },
    refreshAfterMutation: taskId => {
      const read = deferred(); reads.push({ taskId, ...read });
      return read.promise;
    },
    setMutationRefreshBlocked: value => { blocked = value; },
    handleCommittedRefreshFailure: error => { blocked = true; errors.push("committed: " + error.message); },
    formatInvokeError: error => error.message,
    LANES: [{ key: "backlog", title: "Backlog" }, { key: "thisWeek", title: "This Week" }],
    LANE_TOKEN: { backlog: "backlog", thisWeek: "this_week", today: "today" },
  });
  return { callback, writes, reads, statuses, errors, pending, clears, get blocked() { return blocked; } };
}

// Cross-lane: the actual callback must not expose the stale source lane
// during either the persistence write or the authoritative re-read.
{
  const h = harness();
  const completion = h.callback("task-1", "backlog", "thisWeek", "anchor-9");
  assert.equal(h.writes.length, 1);
  assert.equal(h.writes[0].kind, "move");
  assert.equal(h.writes[0].request.beforeTaskId, "anchor-9");
  assert.deepEqual(h.pending, ["task-1"]);
  assert.deepEqual(h.clears, [], "source/target must remain held before commit");
  assert.deepEqual(h.statuses, [], "no premature durable success");
  h.writes[0].resolve();
  await flush();
  assert.equal(h.reads.length, 1, "fresh authoritative board is required after commit");
  assert.deepEqual(h.clears, [], "source/target must stay held until fresh board resolves");
  h.reads[0].resolve();
  assert.equal(await completion, "settled");
  assert.deepEqual(h.pending, ["task-1", null]);
  assert.deepEqual(h.clears, [], "only pointer owner releases held visuals after settlement");
  assert.deepEqual(h.statuses, ["Moved Prioritize to This Week."]);
}

// Same-lane preserves exact insertion anchor and identical visual ownership.
{
  const h = harness();
  const completed = h.callback("task-1", "backlog", "backlog", null);
  assert.equal(h.writes[0].kind, "reorder");
  assert.equal(h.writes[0].request.beforeTaskId, null);
  h.writes[0].resolve(); await flush();
  h.reads[0].resolve();
  assert.equal(await completed, "settled");
  assert.deepEqual(h.statuses, ["Reordered Prioritize."]);
}

// A rejected write is not a committed move. Restore the original board,
// surface the error and allow ordinary future input.
{
  const h = harness();
  const completed = h.callback("task-1", "backlog", "thisWeek", null);
  h.writes[0].reject(new Error("expected source-lane mismatch"));
  assert.equal(await completed, "restored");
  assert.equal(h.reads.length, 0);
  assert(h.errors.some(error => String(error).includes("expected source-lane mismatch")));
  assert.deepEqual(h.pending, ["task-1", null]);
}

// If the write committed but the authoritative re-read fails, no old-lane
// repaint should be mistaken for a safe retry. Keep the inert placement state
// until board re-entry, under the pre-existing committed-refresh lock.
{
  const h = harness();
  const completed = h.callback("task-1", "backlog", "thisWeek", null);
  h.writes[0].resolve(); await flush();
  h.reads[0].reject(new Error("board read unavailable"));
  assert.equal(await completed, "needs_refresh");
  assert.equal(h.blocked, true);
  assert(h.errors.some(error => String(error).includes("committed:")));
  assert.deepEqual(h.statuses, [], "refresh failure is not a completed screen state");
  assert.deepEqual(h.clears, []);
}

// Stale task, aggregate board, scheduled/invalid task must never write.
{
  const h = harness({ enabled: false });
  assert.equal(await h.callback("task-1", "backlog", "today", null), "restored");
  assert.equal(h.writes.length, 0);
  const x = harness();
  assert.equal(await x.callback("task-missing", "backlog", "today", null), "restored");
  assert.equal(x.writes.length, 0);
}

// The React release handler is not a parallel success controller. It keeps
// lifted source/target state through the real commit promise and only drops
// them if the callback concluded with a fresh view or uncommitted rejection.
assert(board.includes('return commitDrop(task.id, lane, drop.lane, drop.beforeTaskId).then((result) => {'));
assert(board.includes('if (result !== "needs_refresh") {'));
assert(board.includes("setDragState(null);\n            setDropTarget(null);"));

// Execute the real pointer module with a synthetic DOM event loop. The
// document.body clone must persist after actual pointerup while the Board's
// completion promise is unresolved; all listeners/capture are released then.
const pointerScript = ts.transpileModule(
  pointer.replace("export function beginBoardTaskPointerDrag", "function beginBoardTaskPointerDrag")
    + "\nbeginBoardTaskPointerDrag;",
  { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.None } },
).outputText;

function pointerHarness() {
  const listeners = new Map();
  const clones = [], drops = [], lifted = [];
  const pending = deferred();
  const lane = {
    dataset: { boardDropLane: "thisWeek" },
    querySelector: () => null,
    querySelectorAll: () => [],
  };
  const boardElement = { contains: node => node === lane };
  class ElementMock {
    constructor() {
      this.style = {}; this.dataset = {};
      this.classList = { add: () => {} }; this.offsetWidth = 120;
      this.captured = false; this.removed = false; this.listeners = new Map();
    }
    closest(selector) { return selector === ".list-board" ? boardElement : null; }
    getBoundingClientRect() { return { left: 20, top: 20, width: 120, height: 70 }; }
    cloneNode() { const clone = new ElementMock(); clones.push(clone); return clone; }
    setAttribute() {}
    removeAttribute() {}
    querySelectorAll() { return []; }
    setPointerCapture() { this.captured = true; }
    hasPointerCapture() { return this.captured; }
    releasePointerCapture() { this.captured = false; }
    addEventListener(type, cb) { this.listeners.set(type, cb); }
    removeEventListener(type) { this.listeners.delete(type); }
    remove() { this.removed = true; }
  }
  class PointerEventMock {}
  const source = new ElementMock();
  const target = new ElementMock();
  const doc = { body: { appendChild: () => {} }, elementFromPoint: () => ({ closest: () => lane }) };
  const win = {
    addEventListener: (type, cb) => listeners.set(type, cb),
    removeEventListener: type => listeners.delete(type),
    requestAnimationFrame: () => 1,
    cancelAnimationFrame: () => {},
  };
  const begin = vm.runInNewContext(pointerScript, {
    Element: ElementMock, PointerEvent: PointerEventMock, document: doc, window: win,
  });
  const cancel = begin({
    source, target, pointerId: 41, x: 50, y: 50,
    taskId: "task-1", sourceLane: "backlog",
    onLift: value => lifted.push(value),
    onTarget: () => {},
    onFinish: drop => { drops.push(drop); return pending.promise; },
  });
  assert.equal(typeof cancel, "function");
  const move = () => listeners.get("pointermove")({
    pointerId: 41, clientX: 85, clientY: 90, preventDefault: () => {},
  });
  const up = () => listeners.get("pointerup")({ pointerId: 41, clientX: 85, clientY: 90 });
  return { listeners, clones, drops, lifted, pending, source, move, up, cancel };
}

{
  const h = pointerHarness();
  h.move();
  assert.deepEqual(h.lifted, [70]);
  assert.equal(h.clones.length, 1);
  assert.equal(h.clones[0].removed, false);
  h.up();
  assert.equal(h.drops.length, 1);
  assert.equal(h.drops[0].lane, "thisWeek");
  assert.equal(h.clones[0].dataset.boardDropPending, "true");
  assert.equal(h.clones[0].removed, false, "release does not remove the pending visual");
  assert.equal(h.source.captured, false);
  assert.equal(h.listeners.size, 0, "pointerup/scroll/keyboard listeners must end immediately");
  h.pending.resolve();
  await flush();
  assert.equal(h.clones[0].removed, true, "the transient clone ends at authoritative settlement");
}
{
  const h = pointerHarness();
  h.move();
  h.cancel();
  assert.deepEqual(h.drops, [null], "cancel/Escape does not invoke any write");
  assert.equal(h.clones[0].removed, true);
  assert.equal(h.listeners.size, 0);
}
{
  const h = pointerHarness();
  h.move(); h.up();
  h.cancel();
  assert.equal(h.clones[0].removed, true, "target unmount also releases a pending clone");
  h.pending.resolve();
  await flush();
}
console.log("RA01 actual Board drop + pointer preview pending/rejection/refresh-failure contracts: PASS");
