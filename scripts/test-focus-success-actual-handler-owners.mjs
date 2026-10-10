import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
import ts from "typescript";

const source = fs.readFileSync("src/FocusSurfaceCoordinator.tsx", "utf8");
assert(source.includes("const completionSuccessActionInFlightRef = useRef(false);"),
  "one persistent synchronous coordinator owner must span both success commands");

function between(begin, end) {
  const i = source.indexOf(begin), j = source.indexOf(end, i + begin.length);
  assert(i >= 0 && j > i, `Missing production success handler ${begin}`);
  return source.slice(i, j);
}
const next = between("  const startNextTaskFromSuccess = async () => {", "  const mode = focusSurfaceModeOf(presentation);");
const rest = between("  const takeRestBetweenTasks = async () => {", "  const sharedTimerProjection = ");
const close = between("  const closeCompletionSuccess = () => {", "  // A successful Done has already committed");
for (const [name, handler, call] of [
  ["Next Task", next, "await snapshotTimerSession();"],
  ["Take a Break", rest, "await snapshotTimerSession();"],
]) {
  const guard = handler.indexOf("completionSuccessActionInFlightRef.current) return;");
  const claim = handler.indexOf("completionSuccessActionInFlightRef.current = true;");
  const wait = handler.indexOf(call);
  const release = handler.lastIndexOf("completionSuccessActionInFlightRef.current = false;");
  assert(guard >= 0 && claim > guard && wait > claim && release > wait
    && handler.includes("} finally {"), `${name} must claim before IPC and release in finally`);
}
assert(close.includes("completionSuccessPending || completionSuccessActionInFlightRef.current"),
  "Close cannot dismiss an executing post-Done command before React publishes pending");
// Execute the extracted TypeScript *production* function bodies, not a
// separate imitation mutex, with one real shared closure/ref and delayed IPC.
const actualHandlers = ts.transpileModule(
  `${next}\n${close}\n${rest}\n({ startNextTaskFromSuccess, takeRestBetweenTasks, closeCompletionSuccess });`,
  { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.None } },
).outputText;
function deferred() {
  let resolve, reject;
  const promise = new Promise((done, fail) => { resolve = done; reject = fail; });
  return { promise, resolve, reject };
}
const idle = { runtime: { timer: { state: "idle", task_id: null } } };
function harness({ snapshot, start } = {}) {
  const calls = { snapshot: 0, start: 0, cleared: 0, pending: [], errors: [], statuses: [], focus: 0 };
  const ctx = {
    completionSuccess: { nextTask: { id: "task-next", mode: { kind: "count_up" } } },
    completionSuccessPending: false, // intentionally stale same-render React closure
    completionSuccessActionInFlightRef: { current: false },
    completionSuccessError: null,
    inlineSuccess: true,
    setCompletionSuccessPending: (value) => calls.pending.push(value),
    setCompletionSuccessError: (value) => calls.errors.push(value),
    snapshotTimerSession: async () => { calls.snapshot++; return snapshot ? await snapshot() : idle; },
    startTimerTask: async (id, mode) => {
      calls.start++;
      assert.equal(id, "task-next");
      assert.equal(mode.kind, "count_up");
      return start ? await start() : { runtime: { timer: { state: "running" } } };
    },
    applyTimerSessionProjection: (_previous, payload) => payload,
    timerProjectionRef: { current: null },
    setTimerProjection: (callback) => { callback(null); },
    setCompletionSuccess: (value) => { if (value === null) calls.cleared++; },
    setPanelRefreshKey: (callback) => callback(0),
    setTimerRefreshKey: (callback) => callback(0),
    setShortcutStatus: (value) => calls.statuses.push(value),
    formatInvokeError: (error) => String(error.message ?? error),
    window: { requestAnimationFrame: (callback) => callback() },
    document: { querySelector: () => ({ focus: () => calls.focus++ }) },
  };
  return { calls, ctx, handlers: vm.runInNewContext(actualHandlers, ctx) };
}
// Next Task excludes itself AND competing Break through committed timer
// startup/async write and releases for a later legitimate action.
{
  const read = deferred(), write = deferred();
  const { calls, ctx, handlers } = harness({ snapshot: () => read.promise, start: () => write.promise });
  const first = handlers.startNextTaskFromSuccess();
  assert.equal(calls.snapshot, 1);
  await handlers.startNextTaskFromSuccess();
  await handlers.takeRestBetweenTasks();
  handlers.closeCompletionSuccess();
  assert.equal(calls.snapshot, 1, "same-render Next+Break must share the same IPC owner");
  assert.equal(calls.cleared, 0, "Close cannot dismiss an in-flight Next");
  read.resolve(idle);
  await Promise.resolve(); await Promise.resolve();
  assert.equal(calls.start, 1);
  await handlers.takeRestBetweenTasks();
  assert.equal(calls.snapshot, 1, "owner must survive committed-but-incomplete task startup");
  write.resolve({ runtime: { timer: { state: "running" } } });
  await first;
  assert.equal(calls.cleared, 1);
  assert.equal(ctx.completionSuccessActionInFlightRef.current, false);
}
// Take a Break never starts a phantom native session, and it excludes Next
// even when both callbacks observe pending=false from the same React render.
{
  const read = deferred();
  const { calls, ctx, handlers } = harness({ snapshot: () => read.promise });
  const first = handlers.takeRestBetweenTasks();
  await handlers.startNextTaskFromSuccess();
  await handlers.takeRestBetweenTasks();
  assert.equal(calls.snapshot, 1);
  read.resolve(idle);
  await first;
  assert.equal(calls.start, 0, "untimed rest must create no timer/session");
  assert.equal(calls.cleared, 1);
  assert.match(calls.statuses[0], /Break time/);
  assert.equal(ctx.completionSuccessActionInFlightRef.current, false);
}
// Native startup rejection releases the owner and a deliberate retry is valid;
// a saved success cannot be turned into a second native request while pending.
{
  let attempts = 0;
  const { calls, ctx, handlers } = harness({ start: async () => {
    attempts++;
    if (attempts === 1) throw new Error("native unavailable");
    return { runtime: { timer: { state: "running" } } };
  } });
  await handlers.startNextTaskFromSuccess();
  assert.equal(calls.start, 1);
  assert.equal(calls.cleared, 0);
  assert.equal(ctx.completionSuccessActionInFlightRef.current, false);
  assert.match(calls.errors.at(-1), /native unavailable/);
  await handlers.startNextTaskFromSuccess();
  assert.equal(calls.start, 2);
  assert.equal(calls.cleared, 1);
  assert.equal(ctx.completionSuccessActionInFlightRef.current, false);
}
console.log("Actual Focus post-Done Next/Break/Close handlers: same-render shared owner, failure and retry passed.");
