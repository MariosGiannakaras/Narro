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
  [view, 'data-report-list-filter="true"', "list filter control"],
  [view, 'aria-haspopup="listbox"', "list filter accessibility"],
  [view, 'data-report-date-picker="true"', "two-month date picker"],
  [view, 'aria-label="Choose report date range"', "date picker dialog label"],
  [view, 'aria-label="Daily Tasks, Breaks and Total session time"', "accessible chart name"],
  [view, 'role="tooltip"', "keyboard-readable chart tooltip"],
  [view, "Most Productive hour", "productive-hour card"],
  [view, "Time By List", "Time By List panel"],
  [view, "Done Tasks", "Done Tasks panel"],
  [view, "Time Taken", "done-row Time Taken"],
  [css, "@media (prefers-reduced-motion: reduce)", "reduced-motion chart handling"],
  [fixture, 'mode === "list-filter"', "list filter visual fixture mode"],
  [fixture, 'mode === "date-picker"', "date picker visual fixture mode"],
  [fixture, 'mode === "lower"', "lower-panels visual fixture mode"],
  [fixtureHtml, "/src/reportsVisualFixture.tsx", "Reports fixture entry module"],
  [vite, 'reportsFixture: "reports-fixture.html"', "Vite Reports fixture input"],
  [capture, 'foreach ($reportsMode in @("overview", "list-filter", "date-picker", "lower"))', "Reports Edge capture mode loop"],
  [validator, "Reports Overview captured visual contracts: PASS", "Reports captured-DOM validator"],
  [packageJson, '"test:ui-reports-overview": "node scripts/test-ui-reports-overview.mjs"', "Reports frontend preflight script"],
  [packageJson, "capture-reports-fixtures.ps1", "Windows Reports capture wiring"],
  [packageJson, "validate-reports-captures.mjs", "Windows Reports validation wiring"],
]) {
  requireText(haystack, needle, label);
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

console.log("Reports Overview presentational/fixture contract checks passed.");
