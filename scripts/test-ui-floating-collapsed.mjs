import fs from "node:fs";

function read(path) {
  return fs.readFileSync(path, "utf8");
}

function invariant(condition, message) {
  if (!condition) throw new Error(`Floating Timer collapsed contract failed: ${message}`);
}

const lib = read("src-tauri/src/lib.rs");
const foundation = read("src/FloatingTimerFoundation.tsx");
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

invariant(
  lib.includes("FocusSurfaceMode::Timer => (340.0, 110.0, true, true)"),
  "native Timer mode must enter at the screenshot/spec-backed 340x110 collapsed geometry",
);
invariant(
  foundation.includes('getListBoardSnapshot({ kind: "all" })'),
  "collapsed timer must read the authoritative task/list projection",
);
invariant(
  foundation.includes("connectLiveTimerSessionProjection")
    && foundation.includes("applyTimerSessionProjection"),
  "collapsed timer must reuse the validated authoritative live timer projection with revision ordering",
);
invariant(
  foundation.includes("const liveTaskId = timer?.runtime.timer.task_id ?? null"),
  "collapsed timer must derive the live task identity from authoritative timer state",
);
invariant(
  foundation.includes("focusTimerPresentation(timer.runtime.timer)")
    && panel.includes('from "./focusTimerPresentation"'),
  "Focus Panel and Floating Timer must share one timer presentation contract",
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
  foundation.includes("expanded && liveTask && timer")
    && foundation.includes('className="floating-timer-foundation__heading"'),
  "collapsed mode must retain the title/timer heading while expanded mode swaps in actions",
);
for (const forbidden of ["Date.now(", "performance.now(", "setInterval(", "requestAnimationFrame("]) {
  invariant(!foundation.includes(forbidden), `renderer must not create a duplicate timer clock through ${forbidden}`);
}

for (const needle of [
  'timer.state === "break"',
  'timer.state === "time_up"',
  'timer.state === "overtime_running"',
  'timer.mode?.kind === "count_up"',
  'timer.mode?.kind === "pomodoro"',
]) {
  invariant(timerPresentation.includes(needle), `shared timer presentation is missing ${needle}`);
}

invariant(css.includes("border-radius: 12px"), "collapsed surface must retain the rounded screenshot hierarchy");
invariant(
  css.includes("grid-template-columns: minmax(0, 1fr) 8ch"),
  "collapsed title/timer heading geometry differs",
);
invariant(
  css.includes("grid-template-columns: 28px minmax(0, 1fr) 32px 32px"),
  "subtask/add/expand row geometry differs",
);
invariant(css.includes("font-variant-numeric: tabular-nums"), "timer/progress numerals must remain stable");

for (const forbidden of ["animation:", "@keyframes", "transition:"]) {
  invariant(!css.includes(forbidden), `collapsed state must not introduce unvalidated motion via ${forbidden}`);
}

invariant(fixtureHtml.includes("/src/floatingTimerVisualFixture.tsx"), "Floating Timer fixture entry module is missing");
invariant(vite.includes('floatingTimerFixture: "floating-timer-fixture.html"'), "Vite Floating Timer fixture input is missing");
invariant(fixture.includes('dataset.floatingTimerFixtureReady = "true"'), "Floating Timer fixture readiness marker is missing");
invariant(fixture.includes('fixtureState === "expanded"'), "fixture must preserve an explicit collapsed state alongside expanded state");
invariant(capture.includes('foreach ($state in @("collapsed", "expanded"))'), "Windows capture must cover collapsed and expanded states");
invariant(capture.includes('"floating-timer-$theme"'), "collapsed light/dark capture naming differs");
invariant(validator.includes("collapsed timer must be exactly 340x110"), "collapsed geometry validation is missing");

invariant(
  pkg.scripts["test:ui-floating-collapsed"] === "node scripts/test-ui-floating-collapsed.mjs",
  "package collapsed contract registration differs",
);
invariant(
  pkg.scripts["preflight:frontend"].includes("npm run test:ui-floating-collapsed"),
  "frontend preflight must run the collapsed Floating Timer contract",
);
invariant(
  pkg.scripts["test:visual-regression:windows"].includes("capture-floating-timer-fixtures.ps1")
    && pkg.scripts["test:visual-regression:windows"].includes("validate-floating-timer-captures.mjs"),
  "Windows visual regression must capture and validate Floating Timer fixtures",
);

console.log("Floating Timer collapsed product contracts passed.");
