import assert from "node:assert/strict";
import { boardTaskSubgroup, groupedBoardTasks, scheduledGroupHeading } from "../src/boardTaskGroups.ts";

const task = (id, recurrenceRuleId = null, scheduledLocalDate = null) =>
  ({ id, recurrenceRuleId, scheduledLocalDate });
const source = [
  task("rec-a", "rule-a"),
  task("scheduled-a", null, "2026-09-08"),
  task("ordinary-a"),
  task("scheduled-b", null, "2026-09-09"),
  task("ordinary-b"),
  task("rec-b", "rule-b"),
];
const grouped = groupedBoardTasks(source);
assert.deepEqual(grouped.map((item) => item.id), [
  "ordinary-a", "ordinary-b", "rec-a", "rec-b", "scheduled-a", "scheduled-b",
]);
assert.deepEqual(source.map((item) => item.id), [
  "rec-a", "scheduled-a", "ordinary-a", "scheduled-b", "ordinary-b", "rec-b",
], "source rank/order must not be mutated");
assert.deepEqual(grouped.map(boardTaskSubgroup), [
  "ordinary", "ordinary", "recurring", "recurring", "scheduled", "scheduled",
]);
assert.equal(boardTaskSubgroup(task("parent", "rule", "2026-09-08")), "recurring",
  "parent rule wins over stale schedule fields");
assert.equal(scheduledGroupHeading(1, "backlog"), "1 Scheduled task in backlog");
assert.equal(scheduledGroupHeading(4, "thisWeek"), "4 Scheduled tasks this week");
assert.equal(scheduledGroupHeading(2, "today"), "2 Scheduled tasks today");
assert.deepEqual(groupedBoardTasks([]), []);
console.log("Board recurring/scheduled subgroup order and headings: PASS");
