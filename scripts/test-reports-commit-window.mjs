import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
import ts from "typescript";

// Actual production read-owner callbacks and effects; model only the React
// commit ordering so a microtask can land between layout and passive effects.
// This is a deterministic owner regression, NOT an interactive browser/PA.
const source = fs.readFileSync("src/ReportsSessions.tsx", "utf8");
const start = source.indexOf("  const refreshSessions = useCallback(async () => {");
const end = source.indexOf("  useEffect(() => {\n    if (!feedback) return;", start);
assert(start >= 0 && end > start, "real Reports read producer/effect source missing");
const actual = ts.transpileModule(
  source.slice(start, end) + "\n({ refreshSessions, refreshDetail });",
  { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.None } },
).outputText;

function barrier() {
  let resolve, reject;
  const promise = new Promise((yes, no) => { resolve = yes; reject = no; });
  return { promise, resolve, reject };
}
const flush = async () => { for (let i = 0; i < 15; i++) await Promise.resolve(); };

function mountedOwnerSequence() {
  const calls = { sessions: [], detail: [] };
  const state = { sessions: null, detail: null, errors: [], detailErrors: [] };
  const shared = {
    sessionsReadRevisionRef: { current: 0 },
    detailReadRevisionRef: { current: 0 },
    sessionsActiveRequestKeyRef: { current: null },
    detailActiveTaskIdRef: { current: null },
  };
  const render = (listId, taskId) => {
    const layouts = [], effects = [];
    const ctx = {
      ...shared,
      currentRequest: () => ({ listIds: [listId], showBreakSessions: true }),
      detailTaskId: taskId,
      preferences: { settled: true, error: null },
      sessionsReadAttempt: 0,
      useCallback: callback => callback,
      useLayoutEffect: callback => layouts.push(callback),
      useEffect: callback => effects.push(callback),
      getReportSessions: request => {
        const d = barrier(); calls.sessions.push({ request, ...d }); return d.promise;
      },
      getReportTaskSessions: request => {
        const d = barrier(); calls.detail.push({ request, ...d }); return d.promise;
      },
      setSessions: payload => { state.sessions = payload; },
      setDetail: payload => { state.detail = payload; },
      setRefreshError: error => { state.errors.push(error); },
      setDetailError: error => { state.detailErrors.push(error); },
      formatInvokeError: error => String(error.message ?? error),
    };
    const handlers = vm.runInNewContext(actual, ctx);
    assert.equal(layouts.length, 2, "both owner keys must publish at React layout commit");
    assert.equal(effects.length, 2, "both passive IPC producers must remain");
    return { handlers, layouts, effects, commit: () => layouts.forEach(callback => callback()) };
  };
  return { calls, state, shared, render };
}

// The old session/task mutation reads run under committed A. Render B and
// commit its layout effects, but DON'T run B passive effects yet. Old A
// resolves in precisely this interval: it must not win the B screen.
{
  const h = mountedOwnerSequence();
  const a = h.render("list-A", "task-A");
  a.commit();
  const cleanupSessionsA = a.effects[0]();
  const cleanupDetailA = a.effects[1]();
  const staleSessions = a.handlers.refreshSessions();
  const staleDetail = a.handlers.refreshDetail("task-A");
  assert.equal(h.calls.sessions.length, 2);
  assert.equal(h.calls.detail.length, 2);

  const b = h.render("list-B", "task-B");
  const beforeSessions = h.shared.sessionsReadRevisionRef.current;
  const beforeDetail = h.shared.detailReadRevisionRef.current;
  b.commit(); // React's post-DOM-commit synchronous layout effects
  assert(h.shared.sessionsReadRevisionRef.current > beforeSessions);
  assert(h.shared.detailReadRevisionRef.current > beforeDetail);
  assert.equal(h.shared.detailActiveTaskIdRef.current, "task-B");
  assert.equal(JSON.parse(h.shared.sessionsActiveRequestKeyRef.current).listIds[0], "list-B");

  h.calls.sessions[1].resolve({ rows: ["obsolete A mutation"] });
  h.calls.detail[1].resolve({ taskId: "task-A" });
  assert.equal(await staleSessions, null, "old A must not publish after B DOM commit");
  assert.equal(await staleDetail, null, "old task detail must not publish after B DOM commit");
  h.calls.sessions[0].resolve({ rows: ["obsolete A passive"] });
  h.calls.detail[0].resolve({ taskId: "task-A" });
  await flush();
  assert.equal(h.state.sessions, null, "no stale A sessions in B commit window");
  assert.equal(h.state.detail, null, "no stale task-A detail in B commit window");
  assert.equal(await a.handlers.refreshSessions(), null, "old A closure cannot start late IPC");
  assert.equal(await a.handlers.refreshDetail("task-A"), null, "old task closure cannot own late IPC");
  assert.equal(h.calls.sessions.length, 2);
  assert.equal(h.calls.detail.length, 2);

  cleanupSessionsA(); cleanupDetailA();
  const cleanupSessionsB = b.effects[0]();
  const cleanupDetailB = b.effects[1]();
  assert.equal(h.calls.sessions.length, 3);
  assert.equal(h.calls.detail.length, 3);
  h.calls.sessions[2].resolve({ rows: ["fresh B"] });
  h.calls.detail[2].resolve({ taskId: "task-B" });
  await flush();
  assert.equal(h.state.sessions.rows[0], "fresh B");
  assert.equal(h.state.detail.taskId, "task-B");
  assert(!h.state.errors.some(x => typeof x === "string" && x.includes("obsolete")));
  assert(!h.state.detailErrors.some(x => typeof x === "string" && x.includes("obsolete")));
  cleanupSessionsB(); cleanupDetailB();
}

// Concurrent React can render B and discard it without committing. Merely
// evaluating B's render MUST NOT invalidate the currently displayed A.
{
  const h = mountedOwnerSequence();
  const a = h.render("list-A", "task-A"); a.commit();
  const stopSessionsA = a.effects[0](), stopDetailA = a.effects[1]();
  const pendingSessions = a.handlers.refreshSessions();
  const pendingDetail = a.handlers.refreshDetail("task-A");
  const currentSessionsRevision = h.shared.sessionsReadRevisionRef.current;
  const currentDetailRevision = h.shared.detailReadRevisionRef.current;
  h.render("list-B", "task-B"); // aborted, no layout commit
  assert.equal(h.shared.sessionsReadRevisionRef.current, currentSessionsRevision);
  assert.equal(h.shared.detailReadRevisionRef.current, currentDetailRevision);
  h.calls.sessions[2 - 1].resolve({ rows: ["still A"] });
  h.calls.detail[2 - 1].resolve({ taskId: "task-A" });
  assert.equal((await pendingSessions).rows[0], "still A");
  assert.equal((await pendingDetail).taskId, "task-A");
  stopSessionsA(); stopDetailA();
}

// The same query/task identity on a committed rerender cannot needlessly
// invalidate an already in-flight actual authoritative read.
{
  const h = mountedOwnerSequence();
  const a = h.render("list-A", "task-A"); a.commit();
  const stopA = a.effects[0](); const stopDetailA = a.effects[1]();
  const pending = a.handlers.refreshSessions();
  const rev = h.shared.sessionsReadRevisionRef.current;
  const rerender = h.render("list-A", "task-A"); rerender.commit();
  assert.equal(h.shared.sessionsReadRevisionRef.current, rev);
  h.calls.sessions[1].resolve({ rows: ["fresh same selection"] });
  assert.equal((await pending).rows[0], "fresh same selection");
  stopA(); stopDetailA();
}

// Closing detail commits null identity before passive cleanup and must reject
// a late task-A mutation response, without inventing a new detail selection.
{
  const h = mountedOwnerSequence();
  const a = h.render("list-A", "task-A"); a.commit();
  const stopSessionA = a.effects[0](), stopDetailA = a.effects[1]();
  const oldDetail = a.handlers.refreshDetail("task-A");
  h.render("list-A", null).commit();
  h.calls.detail[1].resolve({ taskId: "task-A" });
  assert.equal(await oldDetail, null);
  assert.equal(h.state.detail, null);
  stopSessionA(); stopDetailA();
}
console.log("Q18 actual Reports read owners: post-commit/pre-passive, aborted render, same filter and closed detail: PASS");
