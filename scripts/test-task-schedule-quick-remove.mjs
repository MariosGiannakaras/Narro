import { canQuickRemoveSchedule, expectedQuickRemoveSchedule } from "../src/taskScheduleQuickRemove.ts";

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
