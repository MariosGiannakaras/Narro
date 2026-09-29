import fs from "node:fs";

const read = (path) => fs.readFileSync(path, "utf8");
const invariant = (condition, message) => {
  if (!condition) throw new Error(`Floating Timer collapsed contract failed: ${message}`);
};

const tauriConfig = JSON.parse(read("src-tauri/tauri.conf.json"));
const region = read("src-tauri/src/timer_region.rs");
const coordinator = read("src/FocusSurfaceCoordinator.tsx");
const foundation = read("src/FloatingTimerFoundation.tsx");
const presentationFrame = read("src/presentationFrame.ts");
const subtasks = read("src/FocusLiveSubtasks.tsx");
const css = read("src/floatingTimerFoundation.css");
const timerPresentation = read("src/focusTimerPresentation.ts");
const panel = read("src/FocusPanel.tsx");
const fixture = read("src/floatingTimerVisualFixture.tsx");
const fixtureHtml = read("floating-timer-fixture.html");
const vite = read("vite.config.ts");
const capture = read("scripts/capture-floating-timer-fixtures.ps1");
const validator = read("scripts/validate-floating-timer-captures.mjs");
const pkg = JSON.parse(read("package.json"));

const focusWindow = tauriConfig.app.windows.find((window) => window.label === "focusSurface");
invariant(
  focusWindow?.width === 340 && focusWindow?.height === 700 && focusWindow?.url === "focus.html",
  "collapsed Timer must live inside the fixed 340x700 focusSurface host",
);
invariant(
  region.includes("TIMER_COMPACT_HEIGHT_LOGICAL: f64 = 110.0"),
  "collapsed Timer native region must remain 340x110 logical px",
);
invariant(
  coordinator.includes('controlledExpanded={presentation === "timerExpanded"}')
    && coordinator.includes("onRequestExpanded={requestTimerExpanded}"),
  "coordinator must own committed compact/expanded presentation state",
);
invariant(
  foundation.includes('getListBoardSnapshot({ kind: "all" })'),
  "collapsed Timer must read the authoritative task/list projection",
);
invariant(
  foundation.includes("sharedTimerProjection !== undefined")
    && foundation.includes("applyTimerSessionProjection"),
  "production Timer must consume the coordinator-owned timer projection",
);
invariant(
  foundation.includes("const liveTaskId = timer?.runtime.timer.task_id ?? null"),
  "collapsed Timer must derive live task identity from authoritative timer state",
);
invariant(
  foundation.includes("focusTimerPresentation(timer.runtime.timer)")
    && panel.includes('from "./focusTimerPresentation"'),
  "Panel and Timer must share one timer-presentation formatter",
);

for (const needle of [
  'data-floating-task-title="true"',
  'data-floating-live-timer="true"',
  'data-timer-numerals="true"',
  'data-floating-expanded={expanded ? "true" : "false"}',
]) {
  invariant(foundation.includes(needle), `collapsed hierarchy marker ${needle} is missing`);
}
for (const needle of [
  'data-floating-subtask-progress="true"',
  'data-floating-subtask-count="true"',
  'data-floating-subtask-control="add"',
  'data-floating-subtask-control="expand"',
]) {
  invariant(subtasks.includes(needle), `collapsed subtask marker ${needle} is missing`);
}

invariant(
  foundation.includes('data-floating-actions-controller="true"')
    && foundation.includes('style={{ display: expanded ? "contents" : "none" }}')
    && foundation.includes("!regionExpanded || !liveTask || !timer")
    && foundation.includes('className="floating-timer-foundation__heading"'),
  "collapsed mode must keep title/timer visible while the expanded action controller remains mounted but hidden",
);
for (const forbidden of ["Date.now(", "performance.now(", "setInterval("]) {
  invariant(!foundation.includes(forbidden), `renderer must not create a duplicate timer clock through ${forbidden}`);
}
invariant(
  foundation.includes('import { waitForPresentedFrame } from "./presentationFrame";')
    && (presentationFrame.match(/requestAnimationFrame\(/g) ?? []).length === 2
    && !presentationFrame.includes("setInterval("),
  "presentation preparation may use only the shared finite frame barrier",
);

for (const needle of [
  'timer.state === "break"',
  'timer.state === "time_up"',
  'timer.state === "overtime_running"',
  'timer.mode?.kind === "count_up"',
  'timer.mode?.kind === "pomodoro"',
]) {
  invariant(timerPresentation.includes(needle), `shared timer presentation is missing ${needle}`);
}

invariant(css.includes("height: 110px"), "collapsed surface must retain 110px product height");
invariant(css.includes("border-radius: 12px"), "collapsed surface must retain rounded source hierarchy");
invariant(css.includes("grid-template-columns: minmax(0, 1fr) 8ch"), "collapsed title/timer geometry differs");
invariant(css.includes("grid-template-columns: 28px minmax(0, 1fr) 32px 32px"), "collapsed subtask row geometry differs");
invariant(css.includes("font-variant-numeric: tabular-nums"), "timer/progress numerals must remain stable");
invariant(
  !/animation\s*:\s*[^;]*infinite/.test(css)
    && css.includes("animation: floating-timer-attention 720ms ease-out 1;")
    && css.includes("@media (prefers-reduced-motion: reduce)"),
  "collapsed Timer may only use finite reduced-motion-safe attention animation",
);

invariant(fixtureHtml.includes("/src/floatingTimerVisualFixture.tsx"), "Floating Timer fixture entry module is missing");
invariant(vite.includes('floatingTimerFixture: "floating-timer-fixture.html"'), "Vite Floating Timer fixture input is missing");
invariant(fixture.includes('dataset.floatingTimerFixtureReady = "true"'), "Floating Timer fixture readiness marker is missing");
invariant(fixture.includes('fixtureState === "expanded"'), "fixture must retain distinct collapsed and expanded states");
invariant(capture.includes('foreach ($state in @("collapsed", "expanded"))'), "Windows capture must cover collapsed and expanded states");
invariant(validator.includes("collapsed timer must be exactly 340x110"), "collapsed geometry validation is missing");

invariant(
  pkg.scripts["preflight:frontend"].includes("npm run test:ui-floating-collapsed"),
  "frontend preflight must run collapsed Timer coverage",
);
invariant(
  pkg.scripts["test:visual-regression:windows"].includes("capture-floating-timer-fixtures.ps1")
    && pkg.scripts["test:visual-regression:windows"].includes("validate-floating-timer-captures.mjs"),
  "Windows visual regression must preserve Timer fixtures",
);

console.log("Floating Timer collapsed single-host product contracts passed.");
