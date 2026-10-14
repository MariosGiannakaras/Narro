import fs from "node:fs";

const root = new URL("../", import.meta.url);
const read = (relative) => fs.readFileSync(new URL(relative, root), "utf8").replace(/\r\n/g, "\n");

function requireText(haystack, needle, label) {
  if (!haystack.includes(needle)) throw new Error("Missing " + label + ": " + needle);
}

const view = read("src/ReportsOverviewView.tsx");
const css = read("src/reportsOverview.css");
const fixture = read("src/reportsVisualFixture.tsx");
const fixtureHtml = read("reports-fixture.html");
const vite = read("vite.config.ts");
const capture = read("scripts/capture-reports-fixtures.ps1");
const validator = read("scripts/validate-reports-captures.mjs");
const packageJson = read("package.json");

for (const [haystack, needle, label] of [
  [view, 'data-reports-overview="true"', "Reports Overview surface identity"],
  [view, 'role="tablist"', "Overview/Sessions tab semantics"],
  [view, "Export PDF", "Overview export evidence"],
  [view, 'aria-busy={exportPending || undefined}', "Overview export pending accessibility"],
  [css, 'html[data-report-pdf-export="true"] .app-shell__sidebar', "PDF hides app-shell navigation"],
  [css, 'html[data-report-pdf-export="true"] .reports-overview__done-list', "PDF expands scroll-limited done rows"],
  [css, "-webkit-print-color-adjust: exact", "PDF preserves report surface colors"],
  [view, 'data-report-list-filter="true"', "list filter control"],
  [view, '<ReportListBadges options={listOptions} selectedListIds={selectedListIds} />', "saved list-color filter trigger"],
  [read("src/ReportListBadges.tsx"), 'data-report-list-badges="true"', "stacked source list badges"],
  [read("src/ReportListBadges.tsx"), 'HEX_COLOR.test(option.color)', "safe persisted list accent"],
  [view, 'aria-haspopup="listbox"', "list filter accessibility"],
  [view, 'aria-multiselectable="true"', "source-evidenced multi-select list filter"],
  [view, "selectedListIds.includes(option.id)", "per-list multi-select state"],
  [view, 'aria-pressed={visibleSeries[series]}', "interactive chart series toggles"],
  [view, 'data-report-chart-options="available"', "functional chart menu source identity"],
  [view, 'Menu triggerLabel="Chart options"', "accessible chart options menu"],
  [view, 'MenuItem onSelect={() => onSelectPreset?.("all")}', "chart show-all action"],
  [view, 'MenuItem onSelect={() => onSelectPreset?.("tasks")}', "chart tasks-only action"],
  [view, 'MenuItem onSelect={() => onSelectPreset?.("breaks")}', "chart breaks-only action"],
  [view, 'MenuItem onSelect={() => onSelectPreset?.("total")}', "chart total-only action"],
  [view, 'data-report-list-donut="true"', "populated Time By List donut"],
  [view, 'data-report-done-group="true"', "Done Tasks date grouping"],
  [view, 'className="reports-overview__done-list-badge"', "per-task list-color dot"],
  [view, "className={`reports-overview__done-status is-${task.punctuality}`}", "Done status pill class"],
  [css, '.reports-overview__done-status.is-early', "positive done status pill"],
  [css, '.reports-overview__done-status.is-late', "late done status pill"],
  [css, 'var(--reports-done-list-color, var(--color-surface-interactive))', "unknown list accent remains neutral"],
  [view, "punctuality.earlyPercent", "punctuality percentage projection"],
  [view, 'data-report-date-picker="true"', "two-month date picker"],
  [view, 'aria-label="Choose report date range"', "date picker dialog label"],
  [view, 'aria-label={`Previous year from ${month.label}`}', "accessible previous-year calendar control"],
  [view, 'aria-label={`Next year from ${month.label}`}', "accessible next-year calendar control"],
  [view, "onPreviousYear={onPreviousCalendarYear}", "previous-year presentation callback"],
  [view, "onNextYear={onNextCalendarYear}", "next-year presentation callback"],
  [view, 'aria-label="Daily Tasks, Breaks and Total session time"', "accessible chart name"],
  [view, '"--report-chart-day-count": Math.max(1, days.length)', "adaptive day-count chart width"],
  [view, 'days.length <= 14 || index % 7 === 0', "long-range label density"],
  [view, "day.taskSeconds > 0", "zero activity draws no false task bar"],
  [css, ".reports-overview__chart-scroll", "scrollable 30/60/90-day chart surface"],
  [view, 'className="reports-overview__done-list" role="region" aria-label="Done Tasks" tabIndex={0}', "keyboard reachable Done Tasks scroll region"],
  [css, ".reports-overview__done-list:focus-visible", "visible focus for hidden-scrollbar Done Tasks region"],
  [css, "repeat(var(--report-chart-day-count, 8)", "dynamic date grid rather than fixed eight bins"],
  [css, 'html[data-report-pdf-export="true"] .reports-overview__chart-scroll', "PDF owns full date chart without clipped scroll"],
  [view, 'role="tooltip"', "keyboard-readable chart tooltip"],
  [view, "onMouseEnter={() => setHoveredDayId(day.id)}", "pointer chart tooltip activation"],
  [view, "onFocus={() => setFocusedDayId(day.id)}", "keyboard chart tooltip activation"],
  [view, 'data-report-chart-active={tooltipOpen ? "true" : "false"}', "same day identity for hover and keyboard band"],
  [css, '.reports-overview__chart-day[data-report-chart-active="true"]::before', "entire active date category wash"],
  [css, '.reports-overview__chart-day:focus-within::before', "keyboard active date category wash"],
  [css, '.reports-overview__chart-day[data-report-chart-active="true"] .reports-overview__chart-bar--total', "total bar source hover emphasis"],
  [css, 'html[data-report-pdf-export="true"] .reports-overview__chart-day::before', "PDF neutral hover state"],
  [css, 'transition-duration: 1ms;', "reduced-motion hover wash and bars"],
  [view, "onSelectPreset?.(preset)", "date preset interaction"],
  [view, "onSelectDay?.(day.dateKey)", "calendar day interaction"],
  [view, "onClick={onApply}", "date range Apply interaction"],
  [view, "onClick={onCancel}", "date range Cancel interaction"],
  [view, "Most Productive hour", "productive-hour card"],
  [view, "Time By List", "Time By List panel"],
  [view, "Done Tasks", "Done Tasks panel"],
  [view, "Time Taken", "done-row Time Taken"],
  [css, "@media (prefers-reduced-motion: reduce)", "reduced-motion chart handling"],
  [fixture, 'mode === "list-filter"', "list filter visual fixture mode"],
  [fixture, 'mode === "date-picker"', "date picker visual fixture mode"],
  [fixture, 'total: mode !== "series-toggle"', "chart series-toggle visual fixture mode"],
  [fixture, 'mode === "lower"', "lower-panels visual fixture mode"],
  [fixtureHtml, "/src/reportsVisualFixture.tsx", "Reports fixture entry module"],
  [vite, 'reportsFixture: "reports-fixture.html"', "Vite Reports fixture input"],
  [capture, '"sessions-empty", "sessions-populated", "sessions-detail", "sessions-add"', "Reports Edge capture includes Sessions modes"],
  [validator, "Reports Overview + Sessions captured visual contracts: PASS", "Reports captured-DOM validator"],
  [packageJson, '"test:ui-reports-overview": "node scripts/test-ui-reports-overview.mjs"', "Reports frontend preflight script"],
  [packageJson, "capture-reports-fixtures.ps1", "Windows Reports capture wiring"],
  [packageJson, "validate-reports-captures.mjs", "Windows Reports validation wiring"],
]) {
  requireText(haystack, needle, label);
}

for (const selector of [".reports-overview__chart-scroll", ".reports-overview__done-list"]) {
  const declaration = css.match(new RegExp(selector.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + String.raw`\s*\{([^}]*)\}`))?.[1];
  if (!declaration || !/overflow-[xy]:\s*auto/.test(declaration) || !/scrollbar-width:\s*none/.test(declaration)) {
    throw new Error(`${selector} must remain scrollable without native scrollbar chrome`);
  }
  requireText(css, `${selector}::-webkit-scrollbar { display: none; }`, `${selector} WebView2 scrollbar suppression`);
}

for (const forbidden of [
  'from "@tauri-apps/api',
  "invoke(",
  "fetch(",
  "axios",
  "http://",
  "https://",
]) {
  if (view.includes(forbidden)) {
    throw new Error("ReportsOverviewView must remain a pure presentational boundary until M9 data wiring: " + forbidden);
  }
}

if ((view.match(/className="reports-overview__metric"/g) ?? []).length !== 1) {
  throw new Error("Summary metric cards must stay data-driven rather than four duplicated component blocks.");
}

await import("./test-report-chart-tooltip-placement.mjs");
console.log("Reports Overview presentational/fixture contract checks passed.");
