import fs from "node:fs";

function read(path) {
  return fs.readFileSync(path, "utf8");
}

function invariant(condition, message) {
  if (!condition) throw new Error(`Floating Timer collapsed contract failed: ${message}`);
}

function buttonSlice(source, marker) {
  const start = source.indexOf(marker);
  invariant(start >= 0, `${marker} is missing`);
  const end = source.indexOf("</button>", start);
  invariant(end > start, `${marker} button boundary is missing`);
  return source.slice(start, end);
}

const lib = read("src-tauri/src/lib.rs");
const foundation = read("src/FloatingTimerFoundation.tsx");
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
  "native Timer mode must use the screenshot/spec-backed 340x110 collapsed geometry while retaining topmost/taskbar flags",
);
invariant(
  foundation.includes('getListBoardSnapshot({ kind: "all" })'),
  "collapsed timer must read authoritative task/list projection rather than duplicate task state",
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
  'data-floating-subtask-progress="true"',
  'data-floating-subtask-count="true"',
  'data-floating-subtask-control="add"',
  'data-floating-subtask-control="expand"',
  'data-floating-return-to-panel="true"',
]) {
  invariant(foundation.includes(needle), `collapsed hierarchy marker ${needle} is missing`);
}

for (const marker of ['data-floating-subtask-control="add"', 'data-floating-subtask-control="expand"']) {
  const control = buttonSlice(foundation, marker);
  invariant(control.includes('aria-disabled="true"'), `${marker} must remain explicitly later-scope until expanded content lands`);
  invariant(!control.includes("onClick="), `${marker} must not open partial expanded UI in item 3`);
}

for (const forbidden of [
  "createListBoardSubtask",
  "setListBoardSubtaskCompletion",
  "reorderListBoardSubtasks",
  "deleteListBoardSubtask",
  "FocusLiveActions",
  "TaskSubtasks",
  "timer_start_task",
  "timer_pause",
  "timer_resume",
  "timer_complete_task",
  "timer_switch_task",
  "Date.now(",
  "performance.now(",
  "setInterval(",
  "requestAnimationFrame(",
]) {
  invariant(!foundation.includes(forbidden), `item 3 must not absorb later/authoritative behavior via ${forbidden}`);
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
  css.includes("grid-template-columns: minmax(0, 1fr) 7ch 32px"),
  "title/timer/return heading geometry differs",
);
invariant(
  css.includes("grid-template-columns: 28px minmax(0, 1fr) 32px 32px"),
  "subtask/add/expand row geometry differs",
);
invariant(css.includes("font-variant-numeric: tabular-nums"), "timer/progress numerals must remain stable");

for (const forbidden of ["animation:", "@keyframes", "transition:"]) {
  invariant(!css.includes(forbidden), `collapsed item 3 must not introduce transition/decorative motion via ${forbidden}`);
}

invariant(fixtureHtml.includes("/src/floatingTimerVisualFixture.tsx"), "Floating Timer fixture entry module is missing");
invariant(vite.includes('floatingTimerFixture: "floating-timer-fixture.html"'), "Vite Floating Timer fixture input is missing");
invariant(fixture.includes('dataset.floatingTimerFixtureReady = "true"'), "Floating Timer fixture readiness marker is missing");
invariant(capture.includes("floating-timer-$theme.png"), "Windows light/dark Floating Timer capture is missing");
invariant(validator.includes("collapsed timer must be exactly 340x110"), "Floating Timer geometry validation is missing");

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
  "Windows visual regression must capture and validate Floating Timer light/dark fixtures",
);

console.log("Floating Timer collapsed product contracts passed.");
