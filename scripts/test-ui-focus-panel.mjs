import fs from "node:fs";

function read(path) {
  return fs.readFileSync(path, "utf8");
}

function invariant(condition, message) {
  if (!condition) throw new Error(`Focus Panel UI contract failed: ${message}`);
}

const panel = read("src/FocusPanel.tsx");
const actions = read("src/FocusLiveActions.tsx");
const timerApi = read("src/timerSessionApi.ts");
const notes = read("src/TaskNotes.tsx");
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
  [panel, "<FocusLiveActions", "live action composition"],
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
  [panel, 'const remainingCandidates = board.today.tasks.filter((task) => task.id !== liveTaskId);', "live task exclusion from queued sections"],
  [panel, 'task.scheduledLocalTime !== null && !task.isOverdue', "future-timed Today scheduled grouping"],
  [panel, 'const scheduledIds = new Set(scheduledTasks.map((task) => task.id));', "scheduled identity set"],
  [panel, 'const remainingTasks = remainingCandidates.filter((task) => !scheduledIds.has(task.id));', "remaining/scheduled identity partition"],
  [panel, 'const doneTasks = board.done.tasks;', "authoritative Done projection"],
  [panel, 'data-focus-group="remaining"', "remaining queue"],
  [panel, 'data-focus-task-row={done ? "done" : scheduled ? "scheduled" : "remaining"}', "section row identity markers"],
  [panel, "+ ADD TASK", "Add Task hierarchy row"],
  [panel, 'data-focus-group="scheduled"', "scheduled group"],
  [panel, 'data-focus-group="done"', "done group"],
  [panel, '{scheduledTasks.length} Scheduled {scheduledTasks.length === 1 ? "task" : "tasks"}', "scheduled count heading"],
  [panel, '{doneTasks.length} Done', "done count heading"],
  [actions, "getListBoardSnapshot(target)", "fresh authoritative board read before queue-changing actions"],
  [actions, "snapshotTimerSession()", "fresh authoritative timer read before queue-changing actions"],
  [actions, "assertExpectedLiveTask(authoritative, task.id)", "stale live-task guard"],
  [actions, 'task.scheduledLocalTime === null || task.isOverdue', "Focus eligibility projection for next task"],
  [actions, "switchTimerTask(next.id", "single authoritative Skip switch"],
  [actions, ": await skipTimerTask();", "Skip idle fallback when no next task exists"],
  [actions, "const completed = await completeTimerTask();", "authoritative Done completion boundary"],
  [actions, "const started = await startTimerTask(next.id, nextMode);", "best-effort start-next after committed Done"],
  [actions, "Completion has already committed", "committed completion retry safety"],
  [actions, "startManualBreakTimer(DEFAULT_MANUAL_BREAK_MS)", "authoritative manual Break boundary"],
  [actions, "skipBreakTimer", "Resume from break via authoritative break skip"],
  [actions, "pauseTimer", "authoritative Pause boundary"],
  [actions, "resumeTimer", "authoritative Resume boundary"],
  [actions, "<TaskNotes", "validated Notes component reuse"],
  [actions, 'data-focus-action="break"', "Break control"],
  [actions, 'data-focus-action="notes"', "Notes control"],
  [actions, 'data-focus-action="pause-resume"', "Pause/Resume control"],
  [actions, 'data-focus-action="skip"', "Skip control"],
  [actions, 'data-focus-action="done"', "Done control"],
  [timerApi, "connectLiveTimerSessionProjection", "live projection connector"],
  [timerApi, 'invoke<TimerSessionPayload>("timer_session_snapshot")', "authoritative Rust snapshot sampling"],
  [timerApi, 'invoke<TimerSessionPayload>("timer_start_task"', "typed task-start mutation"],
  [timerApi, 'invoke<TimerSessionPayload>("timer_pause")', "typed pause mutation"],
  [timerApi, 'invoke<TimerSessionPayload>("timer_resume")', "typed resume mutation"],
  [timerApi, 'invoke<TimerSessionPayload>("timer_start_manual_break"', "typed manual-break mutation"],
  [timerApi, 'invoke<TimerSessionPayload>("timer_skip_break")', "typed break-skip mutation"],
  [timerApi, 'invoke<TimerSessionPayload>("timer_complete_task")', "typed completion mutation"],
  [timerApi, 'invoke<TimerSessionPayload>("timer_skip_task")', "typed skip fallback mutation"],
  [timerApi, 'invoke<TimerSessionPayload>("timer_switch_task"', "typed task-switch mutation"],
  [timerApi, 'state === "running" || state === "break" || state === "overtime_running"', "sampling limited to ticking states"],
  [timerApi, "applyTimerSessionProjection(latest, incoming)", "sample/event revision ordering"],
  [notes, "openUrl(link)", "explicit Notes URL opener remains confined to validated Notes component"],
  [focusEntry, "<FocusPanel />", "product Focus Panel default rendering"],
  [focusEntry, 'get("diagnostics") === "1"', "explicit diagnostic-mode preservation"],
  [css, "width: min(100%, 340px)", "compact source-evidenced panel width"],
  [css, ".focus-panel__live-timer { width: 10ch; flex: 0 0 10ch;", "fixed live timer geometry"],
  [css, "grid-template-columns: repeat(5, minmax(0, 1fr))", "stable five-action strip geometry"],
  [css, ".focus-panel__notes .task-notes__trigger { display: none; }", "Focus Notes use action-strip trigger without duplicate control"],
  [css, "prefers-reduced-motion", "reduced-motion coverage"],
  [fixture, "fixtureBoard={board}", "deterministic production-component fixture"],
  [fixture, '"Review campaign notes"', "overdue remaining-row fixture"],
  [fixture, '"Plan weekend errands"', "ordinary remaining-row fixture"],
  [fixture, '"Client follow-up call"', "future-timed scheduled-row fixture"],
  [fixture, '"Confirm morning agenda"', "done-row fixture"],
  [fixture, 'liveTimer: box(".focus-panel__live-timer")', "deterministic live timer geometry fixture"],
  [fixture, 'actions: box(".focus-panel__live-actions")', "deterministic live action geometry fixture"],
  [vite, 'focusPanelFixture: "focus-panel-fixture.html"', "Vite fixture entry"],
  [capture, "focus-panel-fixture.html", "Windows Edge Focus capture"],
  [validator, "hierarchy order differs from source evidence", "visual hierarchy validation"],
  [validator, "authoritative EST countdown value is missing", "visual live timer validation"],
  [validator, "live action strip is missing", "visual live action validation"],
]) {
  invariant(haystack.includes(needle), `${label} is missing`);
}

for (const forbidden of ["setInterval(", "Date.now(", "performance.now(", "window.open(", "openUrl(", "timer_start_task", "start_blitz"]) {
  invariant(!panel.includes(forbidden), `production Focus Panel must not contain ${forbidden}`);
}
for (const forbidden of ["setInterval(", "Date.now(", "performance.now(", "window.open(", "openUrl("]) {
  invariant(!actions.includes(forbidden), `Focus actions must not contain ${forbidden}`);
}
for (const forbidden of ["setInterval(", "Date.now(", "performance.now("]) {
  invariant(!timerApi.includes(forbidden), `live timer projection must not derive authoritative elapsed time via ${forbidden}`);
}

invariant(timerApi.includes("window.setTimeout"), "live timer projection must schedule non-overlapping authoritative samples");
invariant(actions.includes("DEFAULT_MANUAL_BREAK_MS = 10 * 60 * 1_000"), "manual Break must use the established ten-minute default until M8 exposes its preference");
invariant(actions.indexOf('data-focus-action="break"') < actions.indexOf('data-focus-action="notes"'), "Break must precede Notes in action strip");
invariant(actions.indexOf('data-focus-action="notes"') < actions.indexOf('data-focus-action="pause-resume"'), "Notes must precede Pause/Resume in action strip");
invariant(actions.indexOf('data-focus-action="pause-resume"') < actions.indexOf('data-focus-action="skip"'), "Pause/Resume must precede Skip in action strip");
invariant(actions.indexOf('data-focus-action="skip"') < actions.indexOf('data-focus-action="done"'), "Skip must precede Done in action strip");
invariant(panel.includes("disabled aria-label=\"Add task in Focus Panel\""), "Add Task must remain explicitly non-mutating before its ordered slice");
invariant(panel.includes("button type=\"button\" disabled aria-label=\"Preferences\""), "quick controls must remain explicitly non-mutating before their ordered slices");
invariant(pkg.scripts["test:ui-focus-panel"] === "node scripts/test-ui-focus-panel.mjs", "test:ui-focus-panel script is not registered");
invariant(pkg.scripts["preflight:frontend"].includes("npm run test:ui-focus-panel"), "Focus Panel contract gate is not in frontend preflight");
invariant(pkg.scripts["test:visual-regression:windows"].includes("capture-focus-panel-fixtures.ps1"), "Focus Panel capture is not in Windows visual regression");
invariant(pkg.scripts["test:visual-regression:windows"].includes("validate-focus-panel-captures.mjs"), "Focus Panel visual validation is not in Windows visual regression");

console.log("Focus Panel hierarchy/live timer/workflow/actions contract checks passed.");
