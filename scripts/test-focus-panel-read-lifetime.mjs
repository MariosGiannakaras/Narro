import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { stripTypeScriptTypes } from "node:module";
import vm from "node:vm";

// Execute the actual production effect, not a parallel implementation model.
const source = readFileSync("src/FocusPanel.tsx", "utf8").replace(/\r\n/g, "\n");
const start = source.indexOf("  useEffect(() => {\n    if (fixtureMode) {\n      setTimer(fixtureTimer);");
const end = source.indexOf("\n  }, [\n    fixtureMode,\n    fixtureTimer,", start);
assert(start >= 0 && end > start);
const body = source.slice(start + "  useEffect(() => {".length, end);
const mountStart = source.indexOf("  useEffect(() => {\n    const lifetime = boardReadLifetimeRef.current;");
const mountEnd = source.indexOf("\n  }, []);", mountStart);
assert(mountStart >= 0 && mountEnd > mountStart);
const mountBody = source.slice(mountStart + "  useEffect(() => {".length, mountEnd);

function harness() {
  const reads = [], writes = [], errors = [];
  const context = vm.createContext({
    fixtureMode: false, fixtureTimer: null, setTimer() {}, setTimerSettled() {},
    sharedTimerProjection: null, latestSharedTimerProjectionRef: { current: null },
    target: { kind: "all" }, currentTargetKey: "all", currentTargetKeyRef: { current: "all" },
    currentRefreshKeyRef: { current: 0 }, boardReadRevisionRef: { current: 0 },
    boardReadLifetimeRef: { current: { mounted: true } }, sharedBoardRefreshOwnerRef: { current: null },
    setBoard: x => writes.push(x), setError: x => errors.push(x), formatInvokeError: String,
    setBoardReadyRefreshKey() {}, setBoardReadyTargetKey() {},
    getListBoardSnapshot() {
      return new Promise((resolve, reject) => reads.push({ resolve, reject }));
    },
  });
  vm.runInContext(stripTypeScriptTypes(`globalThis.effect = function(){${body}}; globalThis.mount = function(){${mountBody}};`), context);
  const unmount = context.mount();
  let cleanup;
  function tick({ revision = 4, task = "task", session = "session", change = null } = {}) {
    cleanup?.();
    const payload = { revision, runtime: { timer: { task_id: task }, open_session_id: session }, change };
    context.sharedTimerProjection = { payload, settled: true };
    context.latestSharedTimerProjectionRef.current = payload;
    cleanup = context.effect();
  }
  return { context, reads, writes, errors, tick, unmount };
}
const flush = async () => { await Promise.resolve(); await Promise.resolve(); };
{
  const h = harness(); h.tick({ change: { kind: "started" } });
  for (let n = 0; n < 20; n++) h.tick();
  assert.equal(h.reads.length, 1, "normal progress ticks must not query SQLite again");
  h.reads[0].resolve("fresh"); await flush();
  assert.deepEqual(h.writes, ["fresh"], "successful read survives irrelevant effect disposal");
}
for (const next of [{ revision: 5 }, { task: "other" }, { session: "other" }]) {
  const h = harness(); h.tick({ change: { kind: "started" } }); h.tick(next);
  assert.equal(h.reads.length, 2, "new semantic owner must refresh even without a change payload");
  h.reads[0].resolve("stale"); h.reads[1].resolve("new owner"); await flush();
  assert.deepEqual(h.writes, ["new owner"]);
}
for (const invalidate of [
  h => h.unmount(),
  h => h.context.boardReadRevisionRef.current++,
  h => { h.context.currentTargetKeyRef.current = "list:other"; },
  h => { h.context.currentRefreshKeyRef.current++; },
]) {
  const h = harness(); h.tick({ change: { kind: "started" } }); invalidate(h);
  h.reads[0].resolve("obsolete"); await flush(); assert.equal(h.writes.length, 0);
}
{
  const h = harness(); h.tick({ change: { kind: "started" } }); h.tick();
  h.reads[0].reject(Error("read failed")); await flush();
  assert.match(h.errors[0], /read failed/, "current-owner errors remain visible after a progress tick");
}
{
  const h = harness(); h.tick(); assert.equal(h.reads.length, 0, "initial board load has its own owner");
  h.tick({ revision: 5 }); assert.equal(h.reads.length, 1);
  h.unmount(); h.context.mount(); h.reads[0].resolve("before strict remount"); await flush();
  assert.equal(h.writes.length, 0, "strict remount cannot resurrect a previous lifetime's read");
}
console.log("Production Focus effect owner/tick/replacement/unmount/error interleavings: PASS (no app launched)");
