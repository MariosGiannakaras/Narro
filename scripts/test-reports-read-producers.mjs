import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
import ts from "typescript";

const src = fs.readFileSync("src/ReportsSessions.tsx", "utf8");
const start = src.indexOf("  const refreshSessions = useCallback(async () => {");
const end = src.indexOf("  useEffect(() => {\n    if (!feedback) return;", start);
assert(start >= 0 && end > start, "Reports actual filter/mutation read callbacks missing");
const actual = src.slice(start, end);
assert(actual.includes("++sessionsReadRevisionRef.current")
  && actual.includes("++detailReadRevisionRef.current"),
  "filter, mutation and detail reads must use the same per-projection generation");
assert(actual.includes("if (disposed || revision !== sessionsReadRevisionRef.current) return;")
  && actual.includes("if (!disposed && revision === detailReadRevisionRef.current)"),
  "effect commits must honor superseding mutation/selection reads");
const executable = ts.transpileModule(
  actual + "\n({ refreshSessions, refreshDetail });",
  { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.None } },
).outputText;
function deferred() {
  let resolve, reject;
  const promise = new Promise((ok, fail) => { resolve = ok; reject = fail; });
  return { promise, resolve, reject };
}
const settle = async () => {
  for (let tick = 0; tick < 18; tick++) await Promise.resolve();
};
function harness() {
  const effects = [], sessionCalls = [], detailCalls = [];
  const state = { sessions: null, detail: null, errors: [], detailErrors: [] };
  const ctx = {
    currentRequest: () => ({ listIds: ["old"] }),
    detailTaskId: "old-task",
    preferences: { settled: true, error: null },
    sessionsReadRevisionRef: { current: 0 },
    detailReadRevisionRef: { current: 0 },
    useCallback: (callback) => callback,
    useEffect: (callback) => effects.push(callback),
    getReportSessions: (request) => {
      const response = deferred();
      sessionCalls.push({ request, ...response });
      return response.promise;
    },
    getReportTaskSessions: (request) => {
      const response = deferred();
      detailCalls.push({ request, ...response });
      return response.promise;
    },
    setSessions: (value) => { state.sessions = value; },
    setRefreshError: (value) => { state.errors.push(value); },
    setDetail: (value) => { state.detail = value; },
    setDetailError: (value) => { state.detailErrors.push(value); },
    formatInvokeError: (failure) => String(failure.message ?? failure),
  };
  const handlers = vm.runInNewContext(executable, ctx);
  assert.equal(effects.length, 2, "actual Reports Sessions and Detail effects must be executed");
  return { ctx, state, effects, sessionCalls, detailCalls, handlers };
}

// Reproduce the actual source-admitted Q18 inversion: old mutation refresh
// finishes AFTER a new filter effect and must not replace its rows.
{
  const h = harness();
  const cleanupOld = h.effects[0]();
  assert.equal(h.sessionCalls.length, 1);
  const pendingMutationRefresh = h.handlers.refreshSessions();
  assert.equal(h.sessionCalls.length, 2);
  h.ctx.currentRequest = () => ({ listIds: ["new"] });
  cleanupOld();
  const cleanupNew = h.effects[0]();
  assert.equal(h.sessionCalls.length, 3);
  h.sessionCalls[2].resolve({ rows: ["new"] });
  await settle();
  assert.equal(h.state.sessions.rows[0], "new");
  h.sessionCalls[1].resolve({ rows: ["stale-mutation-refetch"] });
  assert.equal(await pendingMutationRefresh, null, "superseded mutation refresh must return no old rows");
  h.sessionCalls[0].resolve({ rows: ["stale-initial"] });
  await settle();
  assert.equal(h.state.sessions.rows[0], "new",
    "old initial/mutation refresh must not overwrite the newly filtered report");
  cleanupNew();
}

// A superseded *failed* post-write refresh must not present a misleading
// failure over a newly successful selection, or turn the saved write into error.
{
  const h = harness();
  const pendingMutation = h.handlers.refreshSessions();
  h.ctx.currentRequest = () => ({ listIds: ["new"] });
  const cleanup = h.effects[0]();
  h.sessionCalls[1].resolve({ rows: ["current"] });
  await settle();
  h.sessionCalls[0].reject(new Error("old filtered read failed"));
  assert.equal(await pendingMutation, null);
  await settle();
  assert.equal(h.state.sessions.rows[0], "current");
  assert(!h.state.errors.some(error => typeof error === "string" && error.includes("old filtered")));
  cleanup();
}

// A task-detail read begun by a mutation cannot replace another task's
// newer opened detail, including late errors or an already closed panel.
{
  const h = harness();
  const cleanupOld = h.effects[1]();
  const pendingDetailRefresh = h.handlers.refreshDetail("old-task");
  h.ctx.detailTaskId = "new-task";
  cleanupOld();
  const cleanupNew = h.effects[1]();
  h.detailCalls[2].resolve({ taskId: "new-task" });
  await settle();
  assert.equal(h.state.detail.taskId, "new-task");
  h.detailCalls[1].resolve({ taskId: "old-task" });
  assert.equal(await pendingDetailRefresh, null);
  h.detailCalls[0].reject(new Error("obsolete detail fetch failed"));
  await settle();
  assert.equal(h.state.detail.taskId, "new-task");
  assert(!h.state.detailErrors.some(error => typeof error === "string" && error.includes("obsolete")));
  cleanupNew();
}

console.log("Actual Reports session/detail read producers reject stale filtered and post-mutation results.");
