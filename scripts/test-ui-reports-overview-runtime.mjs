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
const api = read("src/reportsApi.ts");
const preferences = read("src/usePreferenceSettingsProjection.ts");
const pkg = JSON.parse(read("package.json"));

for (const [haystack, needle, label] of [
  [runtime, 'invoke<HomeSnapshot>("get_home_snapshot")', "authoritative active-list projection"],
  [runtime, "usePreferenceSettingsProjection()", "Preferences timezone projection"],
  [runtime, "getReportOverview({", "typed Overview aggregation invoke"],
  [runtime, "listIds: selectedListIds", "live multi-select list request"],
  [runtime, "displayTimezone: timeZone", "authoritative display timezone request"],
  [runtime, "reportRangeRequestBounds(appliedRange, timeZone)", "timezone-aware range boundary"],
  [runtime, "onToggleListSelection={toggleListSelection}", "live list-filter interaction"],
  [runtime, "onSelectDatePreset={selectDatePreset}", "date preset state wiring"],
  [runtime, "onSelectCalendarDay={selectCalendarDay}", "custom calendar range wiring"],
  [runtime, "onApplyDateRange={applyDateRange}", "date range Apply state commit"],
  [runtime, "exportDisabled", "unfinished Overview export is not falsely active"],
  [runtime, "sessionsDisabled", "unfinished Sessions UI is not falsely active"],
  [presentation, 'case "Last 30 days"', "source-evidenced date preset"],
  [presentation, "sundayBased === 0 ? 6 : sundayBased - 1", "Monday-starting week"],
  [view, "setInteractiveTooltipDayId(day.id)", "keyboard/pointer chart tooltip state"],
  [shell, '<ReportsOverview onBack={() => setActiveDestination("home")} />', "production Reports destination"],
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
