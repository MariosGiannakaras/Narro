import assert from "node:assert/strict";
import vm from "node:vm";
import ts from "typescript";
import fs from "node:fs";

const root = new URL("../", import.meta.url);
const read = (relative) => fs.readFileSync(new URL(relative, root), "utf8").replace(/\r\n/g, "\n");

function requireText(haystack, needle, label) {
  if (!haystack.includes(needle)) throw new Error("Missing " + label + ": " + needle);
}

const runtime = read("src/ReportsOverview.tsx");
const presentation = read("src/reportOverviewPresentation.ts");
const view = read("src/ReportsOverviewView.tsx");
const shell = read("src/AppShell.tsx");
const workspace = read("src/ReportsWorkspace.tsx");
const api = read("src/reportsApi.ts");
const preferences = read("src/usePreferenceSettingsProjection.ts");
const pkg = JSON.parse(read("package.json"));

for (const [haystack, needle, label] of [
  [runtime, 'invoke<HomeSnapshot>("get_home_snapshot")', "authoritative active-list projection"],
  [runtime, "usePreferenceSettingsProjection()", "Preferences timezone projection"],
  [runtime, "reportListAccent(task.listId, listColors)", "stable-id Reports Done list accent projection"],
  [runtime, "doneTaskPresentation(overview, locale, timeZone, listColors)", "Done rows receive existing list colors"],
  [runtime, "getReportOverview(reportRequest)", "typed current-request Overview aggregation invoke"],
  [runtime, "listIds: [...selectedListIds].sort()", "stable multi-select list request identity"],
  [runtime, "displayTimezone: timeZone", "authoritative display timezone request"],
  [runtime, "reportRangeRequestBounds(appliedRange, timeZone)", "timezone-aware range boundary"],
  [runtime, "overviewRequestKey === reportRequestKey", "stale Overview request identity guard"],
  [runtime, "&& !reportPending", "in-flight Overview refresh export guard"],
  [runtime, "exportDisabled={exportPending || !overviewCurrent}", "PDF disabled while Overview is stale or loading"],
  [runtime, "interactionLocked={exportPending}", "PDF capture report-surface interaction lock wiring"],
  [runtime, "document.body.inert = true", "PDF capture whole-Main interaction freeze"],
  [runtime, "document.body.inert = bodyWasInert", "PDF capture interaction state restoration"],
  [runtime, "exportReportOverviewPdf({", "typed local Overview PDF invoke"],
  [runtime, 'document.documentElement.dataset.reportPdfExport = "true"', "print-only Overview isolation activation"],
  [runtime, "delete document.documentElement.dataset.reportPdfExport", "print-only Overview isolation cleanup"],
  [runtime, "setListFilterOpen(false)", "PDF closes list popover before capture"],
  [runtime, "setDatePickerOpen(false)", "PDF closes date popover before capture"],
  [runtime, "onExport={() => void exportOverviewPdf()}", "Overview PDF control wiring"],
  [runtime, "onToggleListSelection={toggleListSelection}", "live list-filter interaction"],
  [runtime, "onSelectDatePreset={selectDatePreset}", "date preset state wiring"],
  [runtime, "onSelectCalendarDay={selectCalendarDay}", "custom calendar range wiring"],
  [runtime, "onApplyDateRange={applyDateRange}", "date range Apply state commit"],
  [runtime, "sessionsDisabled", "Sessions availability follows workspace routing"],
  [presentation, 'case "Last 30 days"', "source-evidenced date preset"],
  [presentation, "sundayBased === 0 ? 6 : sundayBased - 1", "Monday-starting week"],
  [view, "setInteractiveTooltipDayId(day.id)", "keyboard/pointer chart tooltip state"],
  [view, "inert={interactionLocked ? true : undefined}", "PDF capture freezes Overview interaction"],
  [shell, '<ReportsWorkspace onBack={() => setActiveDestination("home")} />', "production Reports workspace destination"],
  [workspace, 'onOpenSessions={() => setTab("sessions")}', "production Overview-to-Sessions tab routing"],
  [api, "listIds: string[];", "typed multi-select API contract"],
  [preferences, "getPreferenceSettings()", "local Preferences source"],
]) {
  requireText(haystack, needle, label);
}

for (const forbidden of ["setInterval(", "setTimeout(", "fetch(", "axios", "http://", "https://"]) {
  if (runtime.includes(forbidden)) {
    throw new Error("Production Reports runtime must remain local/invoke-driven without polling or network dependency: " + forbidden);
  }
}

if (runtime.includes("report_overview") || runtime.includes("SELECT ") || runtime.includes("GROUP BY")) {
  throw new Error("Production Reports runtime must not recreate Rust aggregation authority.");
}

if (pkg.scripts["test:ui-reports-overview-runtime"] !== "node scripts/test-ui-reports-overview-runtime.mjs") {
  throw new Error("Reports runtime contract test registration differs.");
}
if (pkg.scripts["test:report-overview-presentation"] !== "node --experimental-strip-types scripts/test-report-overview-presentation.mjs") {
  throw new Error("Reports presentation semantic test registration differs.");
}
if (!pkg.scripts["preflight:frontend"].includes("npm run test:ui-reports-overview-runtime")) {
  throw new Error("frontend preflight must include production Reports runtime contracts");
}
if (!pkg.scripts["preflight:frontend"].includes("npm run test:report-overview-presentation")) {
  throw new Error("frontend preflight must include Reports date/presentation semantics");
}


// Exercise the actual production handlers instead of matching a fragile
// spelling of their guard or testing a second, independent lock model.
function productionHandler(relative, variableName, bindings) {
  const source = read(relative);
  const ast = ts.createSourceFile(relative, source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  let arrow = null;
  function visit(node) {
    if (ts.isVariableDeclaration(node)
      && node.name.getText(ast) === variableName
      && node.initializer && ts.isArrowFunction(node.initializer)) {
      arrow = node.initializer;
    }
    ts.forEachChild(node, visit);
  }
  visit(ast);
  assert.ok(arrow, "Production export handler missing: " + variableName);
  const compiled = ts.transpileModule(
    "globalThis.__testedHandler = " + arrow.getText(ast) + ";",
    {compilerOptions: {target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.None}},
  ).outputText;
  const sandbox = {...bindings};
  vm.runInNewContext(compiled, sandbox, {filename: relative});
  return sandbox.__testedHandler;
}

function deferred() {
  let resolve, reject;
  const promise = new Promise((yes, no) => { resolve = yes; reject = no; });
  return {promise, resolve, reject};
}

const csvRef = {current: false};
const csvPending = [];
const csvErrors = [];
const csvFeedback = [];
let csvWrites = 0;
const csvWait = deferred();
const csvRequest = {startAt: "2026-10-01", endAt: "2026-10-10", listIds: [], showBreakSessions: true};
const csvBindings = {
  exportPending: false, exportInFlightRef: csvRef,
  currentRequest: () => csvRequest,
  setExportPending: value => csvPending.push(value),
  setExportError: value => csvErrors.push(value),
  setFeedback: value => csvFeedback.push(value),
  formatInvokeError: failure => failure.message,
  exportReportSessionsCsv: () => { csvWrites++; return csvWait.promise; },
};
const csvInvalid = productionHandler("src/ReportsSessions.tsx", "exportSessions",
  {...csvBindings, currentRequest: () => null});
await csvInvalid();
assert.equal(csvRef.current, false, "Invalid CSV range cannot acquire the export owner");
assert.equal(csvWrites, 0);
const csvExport = productionHandler("src/ReportsSessions.tsx", "exportSessions", csvBindings);
const firstCsv = csvExport();
await csvExport();
assert.equal(csvWrites, 1, "Two same-render CSV submit events must invoke native export only once");
assert.equal(csvRef.current, true, "CSV owner must persist while filesystem export is pending");
csvWait.resolve({path: "Downloads/narro-sessions.csv"});
await firstCsv;
assert.equal(csvRef.current, false, "Successful CSV export must release its owner");
assert.deepEqual(csvPending, [true, false]);
assert.match(csvFeedback.at(-1), /narro-sessions\.csv/);

const csvFailure = productionHandler("src/ReportsSessions.tsx", "exportSessions",
  {...csvBindings, exportReportSessionsCsv: async () => { csvWrites++; throw Error("Downloads inaccessible"); }});
await csvFailure();
assert.equal(csvWrites, 2);
assert.equal(csvErrors.at(-1), "Downloads inaccessible");
assert.equal(csvRef.current, false, "Failed CSV export must allow retry");
const csvRetry = productionHandler("src/ReportsSessions.tsx", "exportSessions",
  {...csvBindings, exportReportSessionsCsv: async () => { csvWrites++; return {path: "Downloads/retry.csv"}; }});
await csvRetry();
assert.equal(csvWrites, 3, "CSV retry must execute exactly once");

const pdfRef = {current: false};
const pdfPending = [];
const pdfErrors = [];
const pdfStatuses = [];
const documentStub = {body: {inert: false}, documentElement: {dataset: {}}};
const pdfWait = deferred();
const pdfFile = deferred();
let pdfWrites = 0;
const pdfRequest = {startAt: "2026-10-01", endAt: "2026-10-10"};
const pdfBindings = {
  reportRequest: pdfRequest, overviewCurrent: true, exportPending: false,
  exportInFlightRef: pdfRef, document: documentStub,
  setExportPending: value => pdfPending.push(value),
  setExportStatus: value => pdfStatuses.push(value),
  setExportError: value => pdfErrors.push(value),
  setListFilterOpen: () => {}, setDatePickerOpen: () => {},
  waitForReportPrintLayout: () => pdfWait.promise,
  exportReportOverviewPdf: () => { pdfWrites++; return pdfFile.promise; },
  formatInvokeError: failure => failure.message,
};
for (const invalid of [
  {reportRequest: null}, {overviewCurrent: false}, {exportPending: true},
]) {
  const handler = productionHandler("src/ReportsOverview.tsx", "exportOverviewPdf",
    {...pdfBindings, ...invalid});
  await handler();
  assert.equal(pdfRef.current, false, "Invalid/stale/pending PDF cannot take export owner");
}
const pdfExport = productionHandler("src/ReportsOverview.tsx", "exportOverviewPdf", pdfBindings);
const firstPdf = pdfExport();
await pdfExport();
assert.equal(pdfRef.current, true, "PDF owner must lock before print-layout awaits");
assert.equal(documentStub.body.inert, true, "PDF capture must freeze interaction");
assert.equal(documentStub.documentElement.dataset.reportPdfExport, "true");
pdfWait.resolve();
await new Promise(resolve => setImmediate(resolve));
assert.equal(pdfWrites, 1, "Two same-render PDF clicks must invoke native export only once");
await pdfExport();
assert.equal(pdfWrites, 1, "PDF owner must remain locked during native export");
pdfFile.resolve({path: "Downloads/overview.pdf"});
await firstPdf;
assert.equal(pdfRef.current, false, "Successful PDF must release owner");
assert.equal(documentStub.body.inert, false, "Successful PDF must restore body inert");
assert.equal(documentStub.documentElement.dataset.reportPdfExport, undefined);
assert.deepEqual(pdfPending, [true, false]);
assert.match(pdfStatuses.at(-1), /overview\.pdf/);

documentStub.body.inert = true;
const pdfFailure = productionHandler("src/ReportsOverview.tsx", "exportOverviewPdf",
  {...pdfBindings, waitForReportPrintLayout: async () => {},
    exportReportOverviewPdf: async () => { pdfWrites++; throw Error("PDF native save failed"); }});
await pdfFailure();
assert.equal(pdfWrites, 2);
assert.equal(pdfErrors.at(-1), "PDF native save failed");
assert.equal(pdfRef.current, false, "Rejected PDF must release owner");
assert.equal(documentStub.body.inert, true, "PDF must restore preexisting inert state on failure");
assert.equal(documentStub.documentElement.dataset.reportPdfExport, undefined);
const pdfRetry = productionHandler("src/ReportsOverview.tsx", "exportOverviewPdf",
  {...pdfBindings, waitForReportPrintLayout: async () => {},
    exportReportOverviewPdf: async () => { pdfWrites++; return {path: "Downloads/retry.pdf"}; }});
await pdfRetry();
assert.equal(pdfWrites, 3, "Second deliberate PDF export must still work");
assert.equal(pdfRef.current, false);
assert.equal(documentStub.body.inert, true);

console.log("Production CSV/PDF handler guards, duplicate events, failure/retry and PDF interaction restoration: PASS");

console.log("Production Reports Overview runtime contracts: PASS");
