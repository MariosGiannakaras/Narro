import assert from "node:assert/strict";
import { groupCompletedBoardTasks } from "../src/boardDoneGroups.ts";

const task = (id, completedAt) => ({ id, completedAt });
const tasks = [
  task("oct-morning", "2026-10-01T09:00:00Z"),
  task("sep-day", "2026-09-30T09:00:00Z"),
  task("oct-after-midnight", "2026-09-30T22:30:00Z"),
  task("previous-year", "2025-10-01T09:00:00Z"),
  task("oct-later", "2026-10-01T12:00:00Z"),
];
const athens = groupCompletedBoardTasks(tasks, "Europe/Athens");
assert.deepEqual(athens.map((group) => group.dayKey), [
  "2026-10-01", "2026-09-30", "2025-10-01",
], "group by the local date with most recent day first, even across year/month boundaries");
assert.deepEqual(athens.map((group) => group.tasks.map((row) => row.id)), [
  ["oct-morning", "oct-after-midnight", "oct-later"],
  ["sep-day"],
  ["previous-year"],
], "retain original row order and task identity within each date group");
assert.equal(athens[0].tasks.length, 3, "source per-date count uses authoritative grouped rows");
assert.equal(athens[0].label.length > 0, true);
assert.deepEqual(tasks.map((row) => row.id), [
  "oct-morning", "sep-day", "oct-after-midnight", "previous-year", "oct-later",
], "source snapshot must remain unchanged");
assert.equal(groupCompletedBoardTasks([], "Europe/Athens").length, 0);

const west = groupCompletedBoardTasks([
  task("west-evening", "2026-10-01T01:00:00Z"),
  task("west-day", "2026-10-01T18:00:00Z"),
], "America/Los_Angeles");
assert.deepEqual(west.map((group) => group.dayKey), ["2026-10-01", "2026-09-30"],
  "timezone must be the authoritative Board preference, not host local/UTC");

const fold = groupCompletedBoardTasks([
  task("dst-before", "2026-10-25T00:30:00Z"),
  task("dst-after", "2026-10-25T01:30:00Z"),
], "Europe/Athens");
assert.deepEqual(fold.map((group) => [group.dayKey, group.tasks.length]), [
  ["2026-10-25", 2],
], "DST-fold instants on the same local date share a header");

assert.throws(() => groupCompletedBoardTasks([task("missing", null)], "Europe/Athens"), RangeError);
assert.throws(() => groupCompletedBoardTasks([task("malformed", "not-a-timestamp")], "Europe/Athens"), RangeError);
assert.throws(() => groupCompletedBoardTasks([task("timezone", "2026-10-01T00:00:00Z")], "Bad/TimeZone"), RangeError);

console.log("Done per-date grouping, timezone, DST and stable-identity contracts: PASS");
