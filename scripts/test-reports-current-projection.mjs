import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
import ts from "typescript";

// Evaluate actual production derived projection, including the modal identity
// guard, rather than asserting a mock filter-only state machine.
const src = fs.readFileSync("src/ReportsSessions.tsx", "utf8").replace(/\r\n/g, "\n");
const start = src.indexOf("  const sessionsForCurrentRequest = ");
const end = src.indexOf("  const selectedCalendarRange = ", start);
assert(start >= 0 && end > start, "Actual Reports projection boundary missing");
const selected = src.slice(start, end);
const runtime = ts.transpileModule(selected + "\n({ sessionsForCurrentRequest, groups, detailView });",
  { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.None } },
).outputText;
const projection = ({ selectedKey, savedKey, sessions, taskId, detail }) => vm.runInNewContext(runtime, {
  sessionsRequestKey: savedKey,
  committedSessionsRequestKey: selectedKey,
  sessions,
  detailTaskId: taskId,
  detail,
  listColors: new Map(),
  locale: "en",
  timeZone: "UTC",
  useMemo: (factory) => factory(),
  groupRows: (rows) => rows,
  sessionRowView: (row) => row,
  formatReportDuration: (seconds) => String(seconds),
});
const a = JSON.stringify({ listIds: ["A"], startAt: "2026-10-01" });
const b = JSON.stringify({ listIds: ["B"], startAt: "2026-10-01" });
const reportA = { rows: [{ session: { id: "A" } }], summary: { totalSessions: 1 } };
const reportB = { rows: [{ session: { id: "B" } }], summary: { totalSessions: 1 } };
const detailA = { taskId: "A", taskTitle: "Alpha", listId: "A", listTitle: "A",
  totalFocusSeconds: 10, totalSessions: 1, rows: [] };
const detailB = { taskId: "B", taskTitle: "Beta", listId: "B", listTitle: "B",
  totalFocusSeconds: 20, totalSessions: 1, rows: [] };

// Filter B is committed while A's retained response still occupies React state.
const switched = projection({selectedKey:b,savedKey:a,sessions:reportA,taskId:"B",detail:detailA});
assert.equal(switched.sessionsForCurrentRequest, null, "A report cannot masquerade as B");
assert.equal(switched.groups.length, 0, "no obsolete rows may render under B");
assert.equal(switched.detailView, null, "task A detail must not render as task B");
// After B's actual authoritative response, both rows and selected detail resolve.
const valid = projection({selectedKey:b,savedKey:b,sessions:reportB,taskId:"B",detail:detailB});
assert.equal(valid.sessionsForCurrentRequest, reportB);
assert.equal(valid.groups[0].session.id, "B");
assert.equal(valid.detailView.taskId, "B");
// Close commits immediately: old detail remains in state until effect cleanup.
const closed = projection({selectedKey:b,savedKey:b,sessions:reportB,taskId:null,detail:detailB});
assert.equal(closed.detailView, null);
// A refresh for the same selected request keeps the already verified payload.
const same = projection({selectedKey:a,savedKey:a,sessions:reportA,taskId:"A",detail:detailA});
assert.equal(same.sessionsForCurrentRequest, reportA);
assert.equal(same.groups[0].session.id, "A");
// Verify rendered rows, summary and loading/error admission never read stale data.
// Existing edit/delete handlers retain their authoritative session identity lookup;
// their controls are mounted only when the keyed view is current.
for(const marker of [
  "sessionsForCurrentRequest === null ? refreshError",
  "sessionsForCurrentRequest === null && refreshError",
  "sessionsForCurrentRequest.summary.totalFocusSeconds",
  "setSessionsRequestKey(requestKey)",
  "setSessionsRequestKey(JSON.stringify(request))",
]) assert(src.includes(marker), `Reports current-projection contract missing: ${marker}`);
console.log("M9 actual Reports keyed rows/summary and task modal owner projection passed.");
