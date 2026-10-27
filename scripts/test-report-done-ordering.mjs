import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { orderReportDoneTasks } from "../src/reportDoneOrdering.ts";
import { formatReportCompletionDate } from "../src/reportOverviewPresentation.ts";

const row = (taskId, completedAt) => Object.freeze({
  task: Object.freeze({ taskId, completedAt }),
  timing: null,
});
const original = Object.freeze([
  row("old", "2026-10-17T22:30:00Z"),
  row("same-time-b", "2026-10-20T09:00:00Z"),
  row("latest", "2026-10-20T10:00:00+00:00"),
  row("same-time-a", "2026-10-20T12:00:00+03:00"),
  row("middle", "2026-10-18T10:00:00Z"),
]);
const ordered = orderReportDoneTasks(original);
assert.deepEqual(ordered.map(({ task }) => task.taskId),
  ["latest", "same-time-a", "same-time-b", "middle", "old"],
  "Done rows must be newest-first by instant, with stable task-id tie order");
assert.deepEqual(original.map(({ task }) => task.taskId),
  ["old", "same-time-b", "latest", "same-time-a", "middle"],
  "Sorting may not mutate the shared history input");

const timezoneRows = orderReportDoneTasks([
  row("athens-next-day", "2026-03-29T01:30:00+02:00"),
  row("athens-previous-day", "2026-03-28T22:30:00+02:00"),
  row("later-utc", "2026-03-29T00:15:00Z"),
]);
assert.deepEqual(timezoneRows.map(({ task }) => task.taskId),
  ["later-utc", "athens-next-day", "athens-previous-day"],
  "The sort must use instants, not lexicographic timezone-offset strings");
const dates = timezoneRows.map(({ task }) =>
  formatReportCompletionDate(task.completedAt, "en-US", "Europe/Athens"));
assert.equal(dates[0], dates[1],
  "Local-date grouping must follow sorted instants, not raw UTC date boundaries");
assert.notEqual(dates[1], dates[2],
  "Rows on the preceding saved-timezone date must remain a distinct group");
assert.deepEqual(orderReportDoneTasks([]), [], "Empty filtered ranges remain valid");
assert.deepEqual(orderReportDoneTasks([
  row("missing", "not-a-date"), row("valid", "2026-10-20T09:00:00Z"),
  row("missing-b", "not-a-date"),
]).map(({ task }) => task.taskId), ["valid", "missing", "missing-b"],
"Malformed legacy data falls behind dated rows with deterministic ties");

const root = new URL("../", import.meta.url);
const overview = readFileSync(new URL("src/ReportsOverview.tsx", root), "utf8");
const view = readFileSync(new URL("src/ReportsOverviewView.tsx", root), "utf8");
const css = readFileSync(new URL("src/reportsOverview.css", root), "utf8");
assert.match(overview, /Number\.isFinite\(Date\.parse\(task\.completedAt\)\)/,
  "Legacy malformed completion timestamps must not throw during label rendering");
assert.match(overview, /"Completion date unavailable"/,
  "Invalid historical date rows remain visible under a safe explicit label");
assert.match(overview, /orderReportDoneTasks\(overview\.doneTasks\)\.map/,
  "The production Overview must order before formatting the localized date label");
assert.match(overview, /doneTaskPresentation\(overviewForCurrentRequest, locale, timeZone, listColors\)/,
  "Both interactive Overview and PDF must use the same request-keyed newest-first Done presentation");
assert.match(view, /new Map<string, ReportsDoneTask\[\]>\(\)/,
  "Done group order must be insertion-order-preserving after timestamp ordering");
assert.match(css, /data-report-pdf-export/,
  "PDF render must continue to use the same printable Overview surface");
console.log("Newest-first Done order, ties, immutability, timezone, filtered range and shared PDF contract: PASS");
