import fs from "node:fs";

function read(path) {
  return fs.readFileSync(path, "utf8");
}

function invariant(condition, message) {
  if (!condition) throw new Error(`Focus Panel UI contract failed: ${message}`);
}

const panel = read("src/FocusPanel.tsx");
const timerApi = read("src/timerSessionApi.ts");
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
  [panel, "connectLiveTimerSessionProjection", "authoritative live timer-session projection"],
  [panel, "applyTimerSessionProjection", "timer revision ordering"],
  [panel, 'data-focus-list-selector="true"', "list selector hierarchy"],
  [panel, ">Today<", "Today hierarchy title"],
  [panel, 'aria-label="Preferences"', "Preferences quick control"],
  [panel, 'aria-label="Home"', "Home quick control"],
  [panel, 'aria-label="Compact view"', "compact quick control"],
  [panel, "focus-panel__progress", "aggregate completion progress"],
  [panel, 'data-focus-live-card="true"', "active live card"],
  [panel, 'data-focus-live-timer="true"', "authoritative live timer readout"],
  [panel, 'data-timer-numerals="true"', "tabular live timer numeral marker"],
  [panel, 'timer.mode?.kind === "count_up"', "count-up display projection"],
  [panel, 'timer.mode?.kind === "pomodoro"', "Pomodoro display projection"],
  [panel, 'timer.state === "break"', "break countdown projection"],
  [panel, 'timer.state === "time_up"', "Time's Up display projection"],
  [panel, 'timer.state === "overtime_running"', "overtime display projection"],
  [panel, 'data-focus-group="remaining"', "remaining queue"],
  [panel, "+ ADD TASK", "Add Task hierarchy row"],
  [panel, 'data-focus-group="scheduled"', "scheduled group"],
  [panel, 'data-focus-group="done"', "done group"],
  [timerApi, "connectLiveTimerSessionProjection", "live projection connector"],
  [timerApi, 'invoke<TimerSessionPayload>("timer_session_snapshot")', "authoritative Rust snapshot sampling"],
  [timerApi, 'state === "running" || state === "break" || state === "overtime_running"', "sampling limited to ticking states"],
  [timerApi, "applyTimerSessionProjection(latest, incoming)", "sample/event revision ordering"],
  [focusEntry, "<FocusPanel />", "product Focus Panel default rendering"],
  [focusEntry, 'get("diagnostics") === "1"', "explicit diagnostic-mode preservation"],
  [css, "width: min(100%, 340px)", "compact source-evidenced panel width"],
  [css, ".focus-panel__live-timer { width: 10ch; flex: 0 0 10ch;", "fixed live timer geometry"],
  [css, "prefers-reduced-motion", "reduced-motion coverage"],
  [fixture, "fixtureBoard={board}", "deterministic production-component fixture"],
  [fixture, 'liveTimer: box(".focus-panel__live-timer")', "deterministic live timer geometry fixture"],
  [vite, 'focusPanelFixture: "focus-panel-fixture.html"', "Vite fixture entry"],
  [capture, "focus-panel-fixture.html", "Windows Edge Focus capture"],
  [validator, "hierarchy order differs from source evidence", "visual hierarchy validation"],
  [validator, "authoritative EST countdown value is missing", "visual live timer validation"],
]) {
  invariant(haystack.includes(needle), `${label} is missing`);
}

for (const forbidden of ["setInterval(", "Date.now(", "performance.now(", "window.open(", "openUrl(", "timer_start_task", "start_blitz"]) {
  invariant(!panel.includes(forbidden), `production Focus Panel must not contain ${forbidden}`);
}
for (const forbidden of ["setInterval(", "Date.now(", "performance.now("]) {
  invariant(!timerApi.includes(forbidden), `live timer projection must not derive authoritative elapsed time via ${forbidden}`);
}

invariant(timerApi.includes("window.setTimeout"), "live timer projection must schedule non-overlapping authoritative samples");
invariant(panel.includes("disabled aria-label=\"Add task in Focus Panel\""), "Add Task must remain explicitly non-mutating in hierarchy-only slice");
invariant(panel.includes("button type=\"button\" disabled aria-label=\"Preferences\""), "quick controls must remain explicitly non-mutating in hierarchy-only slice");
invariant(pkg.scripts["test:ui-focus-panel"] === "node scripts/test-ui-focus-panel.mjs", "test:ui-focus-panel script is not registered");
invariant(pkg.scripts["preflight:frontend"].includes("npm run test:ui-focus-panel"), "Focus Panel contract gate is not in frontend preflight");
invariant(pkg.scripts["test:visual-regression:windows"].includes("capture-focus-panel-fixtures.ps1"), "Focus Panel capture is not in Windows visual regression");
invariant(pkg.scripts["test:visual-regression:windows"].includes("validate-focus-panel-captures.mjs"), "Focus Panel visual validation is not in Windows visual regression");

console.log("Focus Panel hierarchy/live timer contract checks passed.");
