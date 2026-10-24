import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
import ts from "typescript";

// Execute production JSX callbacks rather than accepting button-label-only tests.
const read = (path) => fs.readFileSync(path, "utf8");
const parse = (path) => {
  const source = read(path);
  return { source, ast: ts.createSourceFile(path, source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX) };
};
function walk(node, visit) {
  visit(node);
  ts.forEachChild(node, (child) => walk(child, visit));
}
function arrowVariable(path, name) {
  const { ast } = parse(path);
  let expression = null;
  walk(ast, (node) => {
    if (ts.isVariableDeclaration(node) && node.name.getText(ast) === name
      && node.initializer && ts.isArrowFunction(node.initializer)) {
      expression = node.initializer.getText(ast);
    }
  });
  assert.ok(expression, "Missing production callback " + name + " in " + path);
  return expression;
}
function recorder() {
  const events = [];
  return {
    events,
    set(name) {
      return (value) => {
        events.push([name, typeof value === "function" ? value(3) : value]);
      };
    },
  };
}
function run(expression, context) {
  const callback = vm.runInNewContext("(" + expression + ")", context);
  assert.equal(typeof callback, "function");
  callback();
}
function has(source, needle, label) {
  assert.ok(source.includes(needle), label);
}

{
  const path = "src/SearchPalette.tsx", s = read(path);
  has(s, "[open, fixtureData, dataRetryKey]", "Search retry must actually re-run the read effect");
  has(s, "dataError ? null : queryToken ?", "Search failure must not display No matching tasks");
  assert.equal((s.match(/data-search-retry="true"/g) || []).length, 2,
    "Both Search and Quick Task error states must expose retry");
  const arrow = arrowVariable(path, "retryDataLoad");
  for (const [open, fixtureData, loading, dataError, shouldRetry] of [
    [true, null, false, "busy", true],
    [false, null, false, "busy", false],
    [true, {}, false, "busy", false],
    [true, null, true, "busy", false],
    [true, null, false, null, false],
  ]) {
    const r = recorder();
    run(arrow, { open, fixtureData, loading, dataError,
      setDataError: r.set("error"), setLoading: r.set("loading"), setDataRetryKey: r.set("attempt") });
    assert.deepEqual(r.events, shouldRetry
      ? [["error", null], ["loading", true], ["attempt", 4]] : [],
    "Search retry must only initiate a new read from a live failed state");
  }
}
{
  const s = read("src/TaskScheduleDialog.tsx");
  has(s, "[displayTimezone, listId, taskId, loadAttempt]", "Schedule retry must reload authoritative editor");
  has(s, "if (disposed) return;", "Schedule result must ignore unmounted/stale reads");
}

function retryHandlerByValue(path, marker, value) {
  const { ast } = parse(path);
  let expression = null;
  walk(ast, (node) => {
    if (!ts.isJsxOpeningElement(node) || node.tagName.getText(ast) !== "button") return;
    const attrs = node.attributes.properties.filter(ts.isJsxAttribute);
    const tag = attrs.find((a) => a.name.getText(ast) === marker);
    if (!tag || !tag.initializer || !ts.isStringLiteral(tag.initializer) || tag.initializer.text !== value) return;
    const click = attrs.find((a) => a.name.getText(ast) === "onClick");
    assert.ok(click && click.initializer && ts.isJsxExpression(click.initializer)
      && click.initializer.expression && ts.isArrowFunction(click.initializer.expression),
      "Missing actual retry callback for " + marker + "=" + value);
    expression = click.initializer.expression.getText(ast);
  });
  assert.ok(expression, "Retry affordance not rendered: " + marker + "=" + value);
  return expression;
}
{
  const r = recorder();
  run(retryHandlerByValue("src/TaskScheduleDialog.tsx", "data-task-schedule-control", "retry-load"), {
    setLoadError: r.set("error"), setSnapshot: r.set("snapshot"), setLoadAttempt: r.set("attempt"),
  });
  assert.deepEqual(r.events, [["error", null], ["snapshot", null], ["attempt", 4]]);
}
{
  const path = "src/ReportsOverview.tsx", s = read(path);
  has(s, "[homeReadAttempt]", "Overview home retry must reissue the native read");
  has(s, "[reportRequest, reportRequestKey, reportReadAttempt]", "Overview aggregation retry must reissue the same request");
  has(s, "if (disposed) return;", "Overview must discard stale reads");
  const click = retryHandlerByValue(path, "data-reports-overview-retry", "true");
  for (const [homeError, overview, reportError, expected] of [
    ["disk busy", null, null, [["homeError", null], ["home", null], ["homeAttempt", 4]]],
    [null, null, "report busy", [["reportError", null], ["reportPending", true], ["reportAttempt", 4]]],
  ]) {
    const r = recorder();
    run(click, { homeError, overview, reportError,
      setHomeError: r.set("homeError"), setHome: r.set("home"),
      setHomeReadAttempt: r.set("homeAttempt"), setReportError: r.set("reportError"),
      setReportPending: r.set("reportPending"), setReportReadAttempt: r.set("reportAttempt") });
    assert.deepEqual(r.events, expected);
  }
}
{
  const path = "src/ReportsSessions.tsx", s = read(path);
  has(s, "[initialReadAttempt]", "Sessions retry must reload lists and task picker");
  has(s, "[currentRequest, preferences.error, preferences.settled, sessionsReadAttempt]",
    "Sessions aggregation retry must reissue same filter request");
  has(s, "revision !== sessionsReadRevisionRef.current", "Sessions must reject stale reads");
  const click = retryHandlerByValue(path, "data-reports-sessions-retry", "true");
  has(s, "sessionsForCurrentRequest === null && refreshError",
    "Sessions retry must use the committed request's projection, not any retained previous filter");
  const obsolete = { rows: ["previous filter"] };
  for (const [readError, sessions, sessionsForCurrentRequest, refreshError, expected] of [
    ["database busy", null, null, null,
      [["readError", null], ["home", null], ["search", null], ["initialAttempt", 4]]],
    [null, null, null, "session read failed",
      [["refreshError", null], ["sessionsAttempt", 4]]],
    [null, obsolete, null, "new filter read failed",
      [["refreshError", null], ["sessionsAttempt", 4]]],
    [null, obsolete, obsolete, "old warning while current data is visible", []],
  ]) {
    const r = recorder();
    run(click, { readError, sessions, sessionsForCurrentRequest, refreshError,
      setReadError: r.set("readError"), setHome: r.set("home"),
      setSearchData: r.set("search"), setInitialReadAttempt: r.set("initialAttempt"),
      setRefreshError: r.set("refreshError"), setSessionsReadAttempt: r.set("sessionsAttempt") });
    assert.deepEqual(r.events, expected);
  }
}
console.log("Search, Schedule and Reports actual retry callbacks and stale-read guards PASS");
