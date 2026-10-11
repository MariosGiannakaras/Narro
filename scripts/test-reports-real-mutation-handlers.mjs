import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
import ts from "typescript";

// Execute *real ReportsSessions TypeScript handlers* with a single shared
// owner and delayed typed native commands, not an independently modeled gate.
const reports = fs.readFileSync("src/ReportsSessions.tsx", "utf8");
const fragment = (begin, end) => {
  const i = reports.indexOf(begin), j = reports.indexOf(end, i + begin.length);
  assert(i >= 0 && j > i, `Reports production handler missing: ${begin}`);
  return reports.slice(i, j).trim();
};
const source = [
  fragment("  const commitEndTime = async (", "  const deleteSession = async"),
  fragment("  const deleteSession = async", "  const openAddSession = ("),
  fragment("  const commitAddSession = async () => {", "  const exportSessions = async"),
].join("\n");
const code = ts.transpileModule(
  `(() => {\n${source}\nreturn {commitEndTime,deleteSession,commitAddSession};\n})()`,
  { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.None } },
).outputText;
const delayed = () => {
  let resolve, reject;
  const promise = new Promise((good, bad) => { resolve = good; reject = bad; });
  return {promise, resolve, reject};
};
const row = {id: "session-one"};
const session = {
  id: "session-one", taskId: "task-one",
  updatedAt: "2026-10-11T00:00:00Z",
  startedAt: "2026-10-11T12:00:00Z",
  endedAt: "2026-10-11T12:10:00Z",
};
function harness() {
  const calls = {edit:0, del:0, add:0, refresh:0, errors:[], pending:[], addOpen:[]};
  const context = {
    sessions: {rows: [{session}]}, detail: null,
    mutationPendingId: null, sessionMutationInFlightRef: {current:false},
    timeZone: "Europe/Athens",
    addDraft: {taskId:"task-one",dateKey:"2026-10-11",startTime:"12:00",endTime:"12:10"},
    reportTimestampInputParts: () => ({dateKey:"2026-10-11"}),
    zonedReportDateTimeIso: (_date,time) => `2026-10-11T${time}:00+03:00`,
    reportSessionDurationSeconds: () => 600,
    editReportSession: async () => {calls.edit++;},
    deleteReportSession: async () => {calls.del++;},
    createManualReportSession: async () => {calls.add++;},
    afterMutation: async () => {calls.refresh++;},
    setMutationPendingId: value => calls.pending.push(value),
    setMutationError: value => calls.errors.push(value),
    setAddOpen: value => calls.addOpen.push(value),
    formatInvokeError: value => String(value.message ?? value),
  };
  const handlers = vm.runInNewContext(code, context, {timeout:3000});
  assert.equal(typeof handlers.commitEndTime, "function");
  assert.equal(typeof handlers.deleteSession, "function");
  assert.equal(typeof handlers.commitAddSession, "function");
  return {calls, context, ...handlers};
}
// Edit exclusively owns Add and Delete until native write AND authoritative
// post-commit refresh both complete, with deliberately stale React pending.
{
  const h = harness(), write = delayed(), refresh = delayed();
  h.context.editReportSession = async () => {h.calls.edit++; return write.promise;};
  h.context.afterMutation = async () => {h.calls.refresh++; return refresh.promise;};
  const first = h.commitEndTime(row, "12:12");
  await h.commitAddSession();
  await h.deleteSession(row);
  assert.equal(h.calls.edit, 1);
  assert.equal(h.calls.add, 0);
  assert.equal(h.calls.del, 0);
  assert.equal(h.context.sessionMutationInFlightRef.current, true);
  write.resolve(); await Promise.resolve(); await Promise.resolve();
  await h.commitAddSession();
  assert.equal(h.calls.add, 0, "pending post-commit refresh must retain owner");
  refresh.resolve();
  assert.equal(await first, true);
  assert.equal(h.context.sessionMutationInFlightRef.current, false);
  await h.commitAddSession();
  assert.equal(h.calls.add, 1, "fresh deliberate Add must work after Edit settles");
}
// Delete excludes repeated Delete, Edit, and Add until its own write+refresh.
{
  const h = harness(), write = delayed(), refresh = delayed();
  h.context.deleteReportSession = async () => {h.calls.del++; return write.promise;};
  h.context.afterMutation = async () => {h.calls.refresh++; return refresh.promise;};
  const first = h.deleteSession(row);
  await h.deleteSession(row);
  assert.equal(await h.commitEndTime(row, "12:12"), false);
  await h.commitAddSession();
  assert.equal(h.calls.del, 1);
  assert.equal(h.calls.edit, 0);
  assert.equal(h.calls.add, 0);
  write.resolve(); await Promise.resolve(); await Promise.resolve();
  await h.deleteSession(row);
  assert.equal(h.calls.del, 1);
  refresh.resolve(); await first;
  assert.equal(h.context.sessionMutationInFlightRef.current, false);
}
// Add excludes competing actions and releases even on failed native write or
// after the success was committed but the follow-up read fails.
{
  const h = harness(), write = delayed();
  h.context.createManualReportSession = async () => {h.calls.add++; return write.promise;};
  const first = h.commitAddSession();
  await h.commitAddSession();
  await h.deleteSession(row);
  assert.equal(h.calls.add, 1);
  assert.equal(h.calls.del, 0);
  write.reject(new Error("storage unavailable"));
  await first;
  assert.equal(h.context.sessionMutationInFlightRef.current, false);
  assert.match(String(h.calls.errors.at(-1)), /storage unavailable/);
  h.context.createManualReportSession = async () => {h.calls.add++;};
  h.context.afterMutation = async () => {h.calls.refresh++; throw new Error("refresh unavailable");};
  await h.commitAddSession();
  assert.equal(h.calls.add, 2);
  assert(h.calls.addOpen.includes(false), "persisted Add closes modal before a fallible read");
  assert.match(String(h.calls.errors.at(-1)), /refresh unavailable/);
  assert.equal(h.context.sessionMutationInFlightRef.current, false);
}
// Invalid Edit duration never writes a bad session, releases the ref even on
// early return inside try/finally, and allows a later independent Add.
{
  const h = harness();
  h.context.reportSessionDurationSeconds = () => null;
  assert.equal(await h.commitEndTime(row, "bad-time"), false);
  assert.equal(h.calls.edit, 0);
  assert.match(String(h.calls.errors.at(-1)), /End time must be after/);
  assert.equal(h.context.sessionMutationInFlightRef.current, false);
  h.context.reportSessionDurationSeconds = () => 600;
  await h.commitAddSession();
  assert.equal(h.calls.add, 1);
}
console.log("Actual Reports Add/Edit/Delete handlers: cross-action immediate owner, retry and post-commit error recovery PASS.");
