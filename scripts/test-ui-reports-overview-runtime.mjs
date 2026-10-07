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
  [runtime, "getReportOverview({", "typed Overview aggregation invoke"],
  [runtime, "listIds: [...selectedListIds].sort()", "stable multi-select list request identity"],
  [runtime, "displayTimezone: timeZone", "authoritative display timezone request"],
  [runtime, "reportRangeRequestBounds(appliedRange, timeZone)", "timezone-aware range boundary"],
  [runtime, "overviewRequestKey === reportRequestKey", "stale Overview request identity guard"],
  [runtime, "&& !reportPending", "in-flight Overview refresh export guard"],
  [runtime, "if (reportRequest === null || !overviewCurrent || exportPending) return;", "PDF export current-data guard"],
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

console.log("Production Reports Overview runtime contracts: PASS");
