import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
import ts from "typescript";

// Exercise actual production projection declarations. The existing Sessions
// view already hides rows when source/request keys differ; Overview must do
// the same for summary/chart/Done and corresponding pending/error states.
const path = "src/ReportsOverview.tsx";
const src = fs.readFileSync(path, "utf8").replace(/\r\n/g, "\n");
const file = ts.createSourceFile(path, src, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
const declarations = new Map();
function visit(node) {
  if (ts.isVariableDeclaration(node) && ts.isIdentifier(node.name) && node.initializer) {
    declarations.set(node.name.text, node.initializer.getText(file));
  }
  ts.forEachChild(node, visit);
}
visit(file);
const names = ["overviewForCurrentRequest", "overviewCurrent", "currentReportError", "blockingError"];
for (const name of names) assert.ok(declarations.has(name), "Missing real keyed Reports projection: " + name);
const js = ts.transpileModule(
  names.map(name => "const " + name + " = " + declarations.get(name) + ";").join("\n")
    + "\n({ overviewForCurrentRequest, overviewCurrent, currentReportError, blockingError });",
  { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.None } },
).outputText;
const key = (ids, zone = "Europe/Athens") => JSON.stringify({listIds: ids, displayTimezone: zone});
const a = key([]), b = key(["list-b"]), anotherZone = key(["list-b"], "UTC");
const prior = { summary: { totalTasksDone: "A" }, dailySeries: [{ localDate: "2026-10-21" }], doneTasks: [{taskId:"A"}] };
const fresh = { summary: { totalTasksDone: "B" }, dailySeries: [{ localDate: "2026-10-22" }], doneTasks: [{taskId:"B"}] };
function projection({selected = b, saved = a, overview = prior, pending = false,
  error = null, errorKey = null, preferencesError = null, homeError = null} = {}) {
  return vm.runInNewContext(js, {
    reportRequestKey: selected,
    overviewRequestKey: saved,
    overview,
    reportPending: pending,
    reportError: error,
    reportErrorKey: errorKey,
    preferences: {error: preferencesError},
    homeError,
  });
}
// A new selected list, date or timezone must never relabel old figures while
// the second IPC is still in flight, even during the first committed render.
for (const selected of [b, anotherZone]) {
  const waiting = projection({selected, pending: true});
  assert.equal(waiting.overviewForCurrentRequest, null, "stale source must be withheld");
  assert.equal(waiting.overviewCurrent, false);
  assert.equal(waiting.blockingError, null);
}
// Current source is rendered only when its own result arrives and is safe for
// export; during same-key refresh the last known matching data may remain.
const newest = projection({selected:b, saved:b, overview:fresh});
assert.equal(newest.overviewForCurrentRequest.summary.totalTasksDone, "B");
assert.equal(newest.overviewCurrent, true);
assert.equal(projection({selected:b,saved:b,overview:fresh,pending:true}).overviewCurrent, false);
// A stale failure from the previous range cannot conceal the new request.
assert.equal(projection({error:"old A failed",errorKey:a}).blockingError,null);
// New failed request must show truthful error and allow user retry, not remain
// forever on a loading skeleton with an invisible earlier report in state.
const failed = projection({error:"B failed",errorKey:b});
assert.equal(failed.overviewForCurrentRequest,null);
assert.equal(failed.currentReportError,"B failed");
assert.equal(failed.blockingError,"B failed");
assert.equal(projection({selected:null,error:"old",errorKey:null}).blockingError,null);
// Verify all user-visible consumers use the keyed payload after the source
// guard, not the retained raw overview that could belong to another filter.
for(const needle of [
  "overviewForCurrentRequest === null) {",
  "overviewForCurrentRequest.timeByList.map",
  "metrics={buildMetrics(overviewForCurrentRequest)}",
  "chartDays={overviewForCurrentRequest.dailySeries.map",
  "doneTasks={doneTaskPresentation(overviewForCurrentRequest, locale, timeZone, listColors)}",
  "formatProductiveHour(overviewForCurrentRequest.productive.localHourStart, locale)",
  "formatProductiveWeekday(overviewForCurrentRequest.productive.weekdayFromMonday, locale)",
  "formatProductiveMonth(overviewForCurrentRequest.productive.monthKey, locale)",
  "overviewForCurrentRequest.punctuality.earlyPercent",
  "overviewForCurrentRequest.punctuality.latePercent",
  "setReportErrorKey(reportRequestKey)",
  "setReportErrorKey(null)",
  "overviewForCurrentRequest === null && currentReportError",
  "setReportReadAttempt((attempt) => attempt + 1)",
  "exportDisabled={exportPending || !overviewCurrent}",
]) assert.ok(src.includes(needle), "Source keyed Reports render/retry missing: " + needle);
console.log("Real Reports keyed summary/chart/Done projection, pending, failure/retry and PDF admission PASS.");
