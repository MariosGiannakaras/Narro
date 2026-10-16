import { canQuickRemoveSchedule, expectedQuickRemoveSchedule } from "../src/taskScheduleQuickRemove.ts";
import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
import ts from "typescript";

function invariant(condition, label) {
  if (!condition) throw new Error("Quick schedule removal contract: " + label);
}

const task = {
  id: "task-a",
  listId: "list-a",
  completedAt: null,
  scheduledLocalDate: "2025-06-18",
  scheduledLocalTime: null,
  recurrenceRuleId: null,
  recurrenceParentTaskId: "parent-rule-a",
};
const snapshot = {
  taskId: task.id,
  listId: task.listId,
  schedule: { kind: "date_only", local_date: "2025-06-18" },
  recurrenceParentTaskId: task.recurrenceParentTaskId,
  recurrence: null,
  deleteExistingEligibleCount: 0,
  protectedExistingCount: 0,
};
const valid = expectedQuickRemoveSchedule(task, snapshot);
invariant(canQuickRemoveSchedule(task), "scheduled generated child allowed");
invariant(valid === snapshot.schedule, "exact expected schedule object retained for authoritative compare-and-set");
invariant(!canQuickRemoveSchedule({ ...task, recurrenceRuleId: "parent-rule-a" }), "parent recurrence not exposed");
invariant(expectedQuickRemoveSchedule({ ...task, recurrenceRuleId: "parent-rule-a" }, snapshot) === null, "parent cannot quick unschedule");
invariant(expectedQuickRemoveSchedule({ ...task, completedAt: "2025-06-20T08:00:00Z" }, snapshot) === null, "completed task protected");
invariant(expectedQuickRemoveSchedule({ ...task, scheduledLocalDate: null }, snapshot) === null, "unscheduled task protected");
invariant(expectedQuickRemoveSchedule(task, { ...snapshot, taskId: "different" }) === null, "task identity stale");
invariant(expectedQuickRemoveSchedule(task, { ...snapshot, listId: "different" }) === null, "list identity stale");
invariant(expectedQuickRemoveSchedule(task, { ...snapshot, recurrenceParentTaskId: null }) === null, "generated-child link stale");
invariant(expectedQuickRemoveSchedule(task, { ...snapshot, recurrence: { id: "new-parent" } }) === null, "new parent rule blocks deletion");
invariant(expectedQuickRemoveSchedule(task, { ...snapshot, schedule: { kind: "none" } }) === null, "already-removed schedule blocks stale repeat");
invariant(expectedQuickRemoveSchedule(task, { ...snapshot, schedule: { kind: "date_only", local_date: "2025-06-19" } }) === null, "changed date cannot be silently removed");
invariant(expectedQuickRemoveSchedule({ ...task, scheduledLocalTime: "09:30" }, snapshot) === null, "date-to-timed mismatch blocked");

const timed = {
  ...task,
  scheduledLocalTime: "09:30",
};
const timedSnapshot = {
  ...snapshot,
  schedule: {
    kind: "local_datetime",
    local_date: "2025-06-18",
    local_time: "09:30",
    timezone: "Europe/Athens",
  },
};
invariant(expectedQuickRemoveSchedule(timed, timedSnapshot) === timedSnapshot.schedule, "timed snapshot preserves exact timezone for CAS");
invariant(expectedQuickRemoveSchedule(timed, { ...timedSnapshot, schedule: { ...timedSnapshot.schedule, local_time: "10:30" } }) === null, "changed time blocked");
invariant(expectedQuickRemoveSchedule(task, timedSnapshot) === null, "timed-to-date-only mismatch blocked");
invariant(expectedQuickRemoveSchedule({ ...task, recurrenceParentTaskId: null }, { ...snapshot, recurrenceParentTaskId: null }) === snapshot.schedule, "ordinary scheduled task allowed");
console.log("Quick schedule removal pure contracts passed.");

function actualFunction(source, start, end, name, context) {
  const first = source.indexOf(start), after = source.indexOf(end, first + start.length);
  assert(first >= 0 && after > first, `Production boundary missing: ${name}`);
  const declaration = source.slice(first, after).replace(/^export\s+/, "");
  const code = ts.transpileModule(`(() => { ${declaration}; return ${name}; })()`, {
    compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.None },
  }).outputText;
  return vm.runInNewContext(code, context, { timeout: 3000 });
}
const boardSource = fs.readFileSync("src/ListBoard.tsx", "utf8");
function handlerHarness() {
  const calls = { writes: [], refreshed: [], errors: [], statuses: [], blocked: [] };
  const context = {
    canStartScheduleEditor: true, canQuickRemoveSchedule, expectedQuickRemoveSchedule,
    timerPayload: {}, liveStateForTask: () => null, quickRemoveScheduleInFlightRef: { current: false },
    setMutationPendingTaskId() {}, setMutationError: x => calls.errors.push(x),
    setMutationStatus: x => calls.statuses.push(x), setDragState() {}, setDropTarget() {},
    setMutationRefreshBlocked: x => calls.blocked.push(x),
    getTaskScheduleEditor: async () => ({ ...snapshot, updatedAt: "fresh-version" }),
    quickClearTaskSchedule: async x => { calls.writes.push(x); },
    handleScheduleCommitted: async id => calls.refreshed.push(id), formatInvokeError: x => String(x),
  };
  return { calls, context, run: actualFunction(boardSource,
    "  const handleQuickRemoveSchedule = async", "  const handleRemoveRecurring = async",
    "handleQuickRemoveSchedule", context) };
}
{
  const h = handlerHarness();
  let release;
  h.context.getTaskScheduleEditor = () => new Promise(resolve => { release = resolve; });
  const pending = h.run(task); await h.run(task);
  assert.equal(h.context.quickRemoveScheduleInFlightRef.current, true);
  release({ ...snapshot, updatedAt: "fresh-version" }); await pending;
  assert.deepEqual(JSON.parse(JSON.stringify(h.calls.writes)), [{ taskId: task.id, listId: task.listId,
    expectedSchedule: snapshot.schedule, expectedUpdatedAt: "fresh-version",
    expectedRecurrenceParentTaskId: task.recurrenceParentTaskId }]);
  assert.deepEqual(h.calls.refreshed, [task.id]);
  assert.equal(h.context.quickRemoveScheduleInFlightRef.current, false);
}
for (const scenario of ["live", "stale-date", "missing-version", "read-error", "write-error", "refresh-error"]) {
  const h = handlerHarness();
  if (scenario === "live") h.context.liveStateForTask = () => ({ state: "paused" });
  if (scenario === "stale-date") h.context.getTaskScheduleEditor = async () => ({ ...snapshot, updatedAt: "new", schedule: { kind: "none" } });
  if (scenario === "missing-version") h.context.getTaskScheduleEditor = async () => snapshot;
  if (scenario === "read-error") h.context.getTaskScheduleEditor = async () => { throw Error("read failed"); };
  if (scenario === "write-error") h.context.quickClearTaskSchedule = async () => { throw Error("write uncertain"); };
  if (scenario === "refresh-error") h.context.handleScheduleCommitted = async () => { throw Error("event delivery failed"); };
  await h.run(task);
  assert.equal(h.context.quickRemoveScheduleInFlightRef.current, false, scenario);
  if (["live", "stale-date", "missing-version", "read-error"].includes(scenario)) assert.equal(h.calls.writes.length, 0, scenario);
  if (["write-error", "refresh-error"].includes(scenario)) assert.equal(h.calls.blocked.at(-1), true, scenario);
}
{
  const source = fs.readFileSync("src/taskScheduleApi.ts", "utf8");
  const context = { calls: [], invalidations: 0, systemDisplayTimezone: () => "Europe/Athens" };
  context.invoke = async (command, args) => { context.calls.push({ command, args }); };
  context.emitBoardInvalidated = async () => { context.invalidations++; };
  context.committedScheduleMutation = actualFunction(source, "async function committedScheduleMutation", "export function updateTaskSchedule", "committedScheduleMutation", context);
  const quickClear = actualFunction(source, "export function quickClearTaskSchedule", "export function saveTaskRecurrence", "quickClearTaskSchedule", context);
  const request = { taskId: task.id, listId: task.listId, expectedSchedule: snapshot.schedule,
    expectedUpdatedAt: "fresh", expectedRecurrenceParentTaskId: task.recurrenceParentTaskId };
  await quickClear(request);
  assert.deepEqual(JSON.parse(JSON.stringify(context.calls)), [{ command: "quick_clear_list_board_task_schedule",
    args: { request: { ...request, fallbackDisplayTimezone: "Europe/Athens" } } }]);
  assert.equal(context.invalidations, 1);
  context.invoke = async () => { throw Error("native stale"); };
  await assert.rejects(quickClear(request), /native stale/);
  assert.equal(context.invalidations, 1, "failed native write must not publish success");
}
console.log("Actual quick-clear handler/API: one writer, fresh version/link, native atomic command, invalidation/error ownership PASS.");
