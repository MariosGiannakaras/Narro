import fs from "node:fs";

function read(path) {
  return fs.readFileSync(path, "utf8");
}

function invariant(condition, message) {
  if (!condition) throw new Error(`Focus Panel UI contract failed: ${message}`);
}

const panel = read("src/FocusPanel.tsx");
const focusEntry = read("src/focus.tsx");
const css = read("src/focusPanel.css");
const fixture = read("src/focusPanelVisualFixture.tsx");
const vite = read("vite.config.ts");
const capture = read("scripts/capture-focus-panel-fixtures.ps1");
const validator = read("scripts/validate-focus-panel-captures.mjs");
const pkg = JSON.parse(read("package.json"));

for (const [haystack, needle, label] of [
  [panel, "getListBoardSnapshot", "authoritative planning projection"],
  [panel, 'invoke<HomeSnapshot>("get_home_snapshot")', "authoritative active-list options"],
  [panel, "connectTimerSessionProjection", "authoritative timer-session subscription"],
  [panel, "applyTimerSessionProjection", "timer revision ordering"],
  [panel, 'data-focus-list-selector="true"', "list selector hierarchy"],
  [panel, ">Today<", "Today hierarchy title"],
  [panel, 'aria-label="Preferences"', "Preferences quick control"],
  [panel, 'aria-label="Home"', "Home quick control"],
  [panel, 'aria-label="Compact view"', "compact quick control"],
  [panel, "focus-panel__progress", "aggregate completion progress"],
  [panel, 'data-focus-live-card="true"', "active live card"],
  [panel, 'data-focus-group="remaining"', "remaining queue"],
  [panel, "+ ADD TASK", "Add Task hierarchy row"],
  [panel, 'data-focus-group="scheduled"', "scheduled group"],
  [panel, 'data-focus-group="done"', "done group"],
  [focusEntry, "<FocusPanel />", "product Focus Panel default rendering"],
  [focusEntry, 'get("diagnostics") === "1"', "explicit diagnostic-mode preservation"],
  [css, "width: min(100%, 340px)", "compact source-evidenced panel width"],
  [css, "prefers-reduced-motion", "reduced-motion coverage"],
  [fixture, "fixtureBoard={board}", "deterministic production-component fixture"],
  [vite, 'focusPanelFixture: "focus-panel-fixture.html"', "Vite fixture entry"],
  [capture, "focus-panel-fixture.html", "Windows Edge Focus capture"],
  [validator, "hierarchy order differs from source evidence", "visual hierarchy validation"],
]) {
  invariant(haystack.includes(needle), `${label} is missing`);
}

for (const forbidden of ["setInterval(", "window.open(", "openUrl(", "timer_start_task", "start_blitz"]) {
  invariant(!panel.includes(forbidden), `production Focus Panel must not contain ${forbidden}`);
}

invariant(panel.includes("disabled aria-label=\"Add task in Focus Panel\""), "Add Task must remain explicitly non-mutating in hierarchy-only slice");
invariant(panel.includes("button type=\"button\" disabled aria-label=\"Preferences\""), "quick controls must remain explicitly non-mutating in hierarchy-only slice");
invariant(pkg.scripts["test:ui-focus-panel"] === "node scripts/test-ui-focus-panel.mjs", "test:ui-focus-panel script is not registered");
invariant(pkg.scripts["preflight:frontend"].includes("npm run test:ui-focus-panel"), "Focus Panel contract gate is not in frontend preflight");
invariant(pkg.scripts["test:visual-regression:windows"].includes("capture-focus-panel-fixtures.ps1"), "Focus Panel capture is not in Windows visual regression");
invariant(pkg.scripts["test:visual-regression:windows"].includes("validate-focus-panel-captures.mjs"), "Focus Panel visual validation is not in Windows visual regression");

console.log("Focus Panel hierarchy contract checks passed.");
