import fs from "node:fs";

function read(path) {
  return fs.readFileSync(path, "utf8");
}

function invariant(condition, message) {
  if (!condition) throw new Error(`Focus Panel UI contract failed: ${message}`);
}

const panel = read("src/FocusPanel.tsx");
const actions = read("src/FocusLiveActions.tsx");
const metrics = read("src/FocusLiveMetrics.tsx");
const metricsCss = read("src/focusLiveMetrics.css");
const subtasks = read("src/FocusLiveSubtasks.tsx");
const taskSubtasks = read("src/TaskSubtasks.tsx");
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
  [actions, "<FocusLiveMetrics", "live metric composition"],
  [actions, "fixtureEditor={fixtureMetricEditor}", "paused metric visual fixture wiring"],
  [actions, "interactionBlocked={busy}", "metric/action interaction guard"],
  [actions, "<FocusLiveSubtasks", "live subtask composition"],
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
  [metrics, 'timer.task_id === taskId', "exact live-task metric gate"],
  [metrics, 'timer.state === "paused" || timer.state === "overtime_paused"', "paused/overtime-paused metric gate"],
  [metrics, "setPausedTimerEstimate({", "authoritative paused EST mutation"],
  [metrics, "expectedEstSeconds: editor.expectedEstSeconds", "paused EST expected-value guard"],
  [metrics, "setPausedTimerTimeTaken({", "authoritative paused Time Taken mutation"],
  [metrics, "expectedTotalSeconds: editor.expectedTimeTakenSeconds", "paused Time Taken expected-total guard"],
  [metrics, "getListBoardSnapshot(target)", "authoritative Focus metric board refresh"],
  [metrics, "refreshed.listId !== task.listId", "metric task/list identity reconciliation"],
  [metrics, "Authoritative Focus EST did not reconcile after the saved change.", "saved EST reconciliation"],
  [metrics, "Authoritative Focus Time Taken did not reconcile after the saved change.", "saved Time Taken reconciliation"],
  [metrics, "Metric change was saved, but authoritative Focus details could not refresh.", "committed metric refresh-failure distinction"],
  [metrics, "setRefreshBlocked(true)", "unsafe metric retry blocker"],
  [metrics, "if (!pausedEditable && editor) setEditor(null);", "editor closes when authoritative timer leaves paused state"],
  [metrics, 'data-focus-live-metrics="true"', "Focus live metric surface marker"],
  [metrics, 'data-focus-metrics-editable={pausedEditable ? "true" : "false"}', "Focus live metric editability marker"],
  [metrics, 'data-focus-metric-control="display"', "running metric read-only marker"],
  [metrics, 'data-focus-metric-control="open"', "paused metric edit affordance"],
  [metrics, 'data-focus-metric-control="input"', "paused metric input"],
  [metrics, 'data-focus-metric-control="cancel"', "paused metric cancel control"],
  [metrics, 'data-focus-metric-control="save"', "paused metric save control"],
  [metrics, 'const DURATION_INPUT = /^(\\d+):([0-5]\\d):([0-5]\\d)$/;', "H:MM:SS duration parser"],
  [metrics, "MAX_EDITABLE_SECONDS = 4_294_967_295n", "Rust u32 metric range mirror"],
  [metricsCss, "grid-template-columns: 5rem minmax(0, 1fr) 4.75rem", "stable Focus metric row geometry"],
  [metricsCss, "grid-template-columns: repeat(2, 2.25rem)", "stable metric action geometry"],
  [subtasks, "getListBoardTaskSubtasks(task.id, task.listId)", "authoritative live-task subtask read"],
  [subtasks, "Promise.all([", "combined authoritative subtask/board refresh"],
  [subtasks, "getListBoardSnapshot(target)", "authoritative board progress refresh"],
  [subtasks, "projectedTotal !== subtasksPayload.subtasks.length || projectedCompleted !== actualCompleted", "subtask/list-board progress reconciliation"],
  [subtasks, "<TaskSubtasks", "validated TaskSubtasks component reuse"],
  [subtasks, "createListBoardSubtask({ taskId: task.id, listId: task.listId, title })", "persisted subtask create"],
  [subtasks, "updateListBoardSubtaskTitle({", "persisted subtask title edit"],
  [subtasks, "setListBoardSubtaskCompletion({", "persisted subtask completion toggle"],
  [subtasks, "reorderListBoardSubtasks({", "persisted subtask reorder"],
  [subtasks, "deleteListBoardSubtask({", "persisted subtask delete"],
  [subtasks, "expectedOrder: order.expectedOrder", "subtask reorder expected-order guard"],
  [subtasks, "Subtask change was saved, but authoritative Focus progress could not refresh.", "committed subtask refresh-failure distinction"],
  [subtasks, "setRefreshBlocked(true)", "unsafe subtask retry blocker"],
  [subtasks, 'data-focus-subtasks={expanded ? "expanded" : "collapsed"}', "Focus subtask expansion marker"],
  [subtasks, 'data-focus-subtask-progress="true"', "Focus subtask progress marker"],
  [subtasks, 'data-focus-subtask-control="toggle"', "Focus subtask toggle"],
  [subtasks, 'data-focus-subtask-control="add"', "Focus subtask add control"],
  [subtasks, 'data-focus-subtask-panel="true"', "Focus expanded subtask panel"],
  [taskSubtasks, "belongsToRenderedTask", "subtask parent-identity guard"],
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
  [timerApi, 'invoke<TimerSessionPayload>("timer_set_estimate"', "typed paused EST mutation"],
  [timerApi, 'invoke<TimerSessionPayload>("timer_set_time_taken"', "typed paused Time Taken mutation"],
  [timerApi, 'state === "running" || state === "break" || state === "overtime_running"', "sampling limited to ticking states"],
  [timerApi, "applyTimerSessionProjection(latest, incoming)", "sample/event revision ordering"],
  [notes, "openUrl(link)", "explicit Notes URL opener remains confined to validated Notes component"],
  [focusEntry, "<FocusPanel />", "product Focus Panel default rendering"],
  [focusEntry, 'get("diagnostics") === "1"', "explicit diagnostic-mode preservation"],
  [css, "width: min(100%, 340px)", "compact source-evidenced panel width"],
  [css, ".focus-panel__live-timer { width: 10ch; flex: 0 0 10ch;", "fixed live timer geometry"],
  [css, "grid-template-columns: repeat(5, minmax(0, 1fr))", "stable five-action strip geometry"],
  [css, ".focus-panel__notes .task-notes__trigger { display: none; }", "Focus Notes use action-strip trigger without duplicate control"],
  [css, ".focus-panel__live-meta > span:not([class]) { display: none; }", "legacy live subtask text hidden in favor of authoritative Focus progress surface"],
  [css, "conic-gradient(", "Focus subtask progress ring"],
  [css, "grid-template-columns: 2.25rem minmax(0, 1fr) 2rem", "stable Focus subtask toolbar geometry"],
  [css, ".focus-panel__subtasks .list-board-task__subtask-trigger { display: none; }", "single Focus subtask toggle without duplicate Main trigger"],
  [css, "prefers-reduced-motion", "reduced-motion coverage"],
  [fixture, "fixtureBoard={board}", "deterministic production-component fixture"],
  [fixture, 'scenario = params.get("scenario") === "paused-metrics" ? "paused-metrics" : "running"', "paused metric visual scenario"],
  [fixture, 'state: scenario === "paused-metrics" ? "paused" : "running"', "paused authoritative fixture timer"],
  [fixture, '"Review campaign notes"', "overdue remaining-row fixture"],
  [fixture, '"Plan weekend errands"', "ordinary remaining-row fixture"],
  [fixture, '"Client follow-up call"', "future-timed scheduled-row fixture"],
  [fixture, '"Confirm morning agenda"', "done-row fixture"],
  [fixture, 'liveTimer: box(".focus-panel__live-timer")', "deterministic live timer geometry fixture"],
  [fixture, 'metrics: box(".focus-panel__live-metrics")', "deterministic live metric geometry fixture"],
  [fixture, 'metricInput: scenario === "paused-metrics" ? box(".focus-panel__metric-input") : null', "deterministic paused metric input geometry fixture"],
  [fixture, 'subtasks: box(".focus-panel__subtasks")', "deterministic live subtask geometry fixture"],
  [fixture, 'subtaskRing: box(".focus-panel__subtask-ring")', "deterministic live subtask progress geometry fixture"],
  [fixture, 'actions: box(".focus-panel__live-actions")', "deterministic live action geometry fixture"],
  [vite, 'focusPanelFixture: "focus-panel-fixture.html"', "Vite fixture entry"],
  [capture, "focus-panel-fixture.html", "Windows Edge Focus capture"],
  [capture, 'Name = "paused-metrics"', "paused metric Windows Edge capture"],
  [validator, "hierarchy order differs from source evidence", "visual hierarchy validation"],
  [validator, "authoritative EST countdown value is missing", "visual live timer validation"],
  [validator, "live subtask progress ring is missing", "visual live subtask validation"],
  [validator, "live action group accessible name is missing", "visual live action validation"],
  [validator, "running metrics must remain read-only", "running metric visual restriction"],
  [validator, "paused metrics must be editable", "paused metric visual editability"],
  [validator, "paused EST editor input is missing", "paused metric visual editor"],
]) {
  invariant(haystack.includes(needle), `${label} is missing`);
}

for (const forbidden of ["setInterval(", "Date.now(", "performance.now(", "window.open(", "openUrl(", "timer_start_task", "start_blitz"]) {
  invariant(!panel.includes(forbidden), `production Focus Panel must not contain ${forbidden}`);
}
for (const forbidden of ["setInterval(", "Date.now(", "performance.now(", "window.open(", "openUrl("]) {
  invariant(!actions.includes(forbidden), `Focus actions must not contain ${forbidden}`);
}
for (const forbidden of ["setInterval(", "Date.now(", "performance.now(", "window.open(", "openUrl(", "updateListBoardTaskEstimate", "updateListBoardTaskTimeTaken", "invoke<"]) {
  invariant(!metrics.includes(forbidden), `Focus metrics must not contain ${forbidden}`);
}
for (const forbidden of ["setInterval(", "Date.now(", "performance.now(", "window.open(", "openUrl(", "timer_pause", "timer_resume", "timer_complete_task", "timer_switch_task"]) {
  invariant(!subtasks.includes(forbidden), `Focus subtasks must not contain ${forbidden}`);
}
for (const forbidden of ["setInterval(", "Date.now(", "performance.now("]) {
  invariant(!timerApi.includes(forbidden), `live timer projection must not derive authoritative elapsed time via ${forbidden}`);
}

invariant(timerApi.includes("window.setTimeout"), "live timer projection must schedule non-overlapping authoritative samples");
invariant(metrics.indexOf("onTimerPayload(payload);") < metrics.indexOf("await refreshAfterCommittedMutation(metric, parsed.seconds);"), "committed metric timer payload must publish before secondary board refresh");
invariant(actions.includes("DEFAULT_MANUAL_BREAK_MS = 10 * 60 * 1_000"), "manual Break must use the established ten-minute default until M8 exposes its preference");
invariant(actions.includes('const breakState = timer.state === "break";'), "action state must identify an active break explicitly");
invariant(actions.includes("breakEnabled: working"), "Break must remain available only for working states");
invariant(actions.includes("pauseResumeEnabled: working || breakState"), "Pause/Resume slot must remain available for work and break states");
invariant(actions.includes('pauseResumeLabel: paused || breakState ? "Resume" : "Pause"'), "Pause/Resume label must switch to Resume for paused work and active break");
invariant(actions.includes('skipEnabled: working || timer.state === "time_up"'), "Skip must remain unavailable during break but available for work and Time's Up");
invariant(actions.includes('doneEnabled: working || timer.state === "time_up"'), "Done must remain unavailable during break but available for work and Time's Up");
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

console.log("Focus Panel hierarchy/live timer/workflow/actions/metrics/subtasks contract checks passed.");
