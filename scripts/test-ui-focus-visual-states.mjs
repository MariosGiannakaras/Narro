import fs from "node:fs";

function read(path) {
  return fs.readFileSync(path, "utf8");
}

function invariant(condition, message) {
  if (!condition) throw new Error(`Focus visual-state contract failed: ${message}`);
}

const panel = read("src/FocusPanel.tsx");
const actions = read("src/FocusLiveActions.tsx");
const styles = read("src/focusVisualStates.css");
const actionSlots = read("src/focusActionSlots.css");
const fixture = read("src/focusPanelVisualFixture.tsx");
const capture = read("scripts/capture-focus-panel-fixtures.ps1");
const pkg = JSON.parse(read("package.json"));

invariant(
  panel.includes('data-focus-live-state={timer?.runtime.timer.state ?? "idle"}'),
  "live-card visual state must project the authoritative timer state directly",
);
invariant(
  panel.includes('data-focus-overdue={task.isOverdue ? "true" : "false"}'),
  "ordinary Focus rows must project authoritative overdue state",
);
invariant(
  panel.includes('const noEligibleVisualState = liveTask === null && remainingTasks.length === 0 && scheduledTasks.length > 0;'),
  "no-eligible presentation must derive only from the existing Focus queue partition",
);
invariant(
  panel.includes('data-focus-live-state={noEligibleVisualState ? "no-eligible" : "idle"}'),
  "empty live-card presentation must distinguish no-eligible from generic idle without changing behavior",
);
invariant(
  panel.includes('<span className="type-metadata">No live task in this view</span>'),
  "item 15 must preserve existing empty-card copy and leave empty/no-eligible behavior to item 16",
);
for (const forbidden of [
  "startTimerTask(",
  "pauseTimer(",
  "resumeTimer(",
  "startManualBreakTimer(",
  "completeTimerTask(",
  "switchTimerTask(",
]) {
  invariant(!panel.includes(forbidden), `FocusPanel presentation must not become timer authority via ${forbidden}`);
}

for (const state of ["running", "paused", "break", "time_up", "overtime_running", "overtime_paused"]) {
  invariant(
    styles.includes(`[data-focus-live-state="${state}"]`),
    `${state} must have an explicit Focus visual-state selector`,
  );
}
invariant(styles.includes('var(--color-accent-solid)'), "running state must reuse the accent token family");
invariant(styles.includes('var(--color-warning)'), "paused/overtime states must reuse warning tokens");
invariant(styles.includes('var(--color-success)'), "break state must reuse success tokens");
invariant(styles.includes('var(--color-destructive)'), "Time's Up and overdue states must reuse destructive tokens");
invariant(
  styles.includes('.focus-panel__live-card.focus-panel__live-card--no-eligible[data-focus-live-state="no-eligible"]'),
  "no-eligible styling must outrank the base live-card border shorthand regardless of stylesheet import order",
);
invariant(styles.includes('.focus-panel__task-row[data-focus-overdue="true"]'), "overdue rows need explicit visual treatment");
invariant(styles.includes('.focus-panel__notes:not([hidden])'), "expanded Focus Notes need an explicit visual surface");
for (const forbidden of ["transform:", "animation:", "transition:", "position: absolute", "margin-left:", "margin-right:"]) {
  invariant(!styles.includes(forbidden), `visual-state styling must not move controls or introduce animation via ${forbidden}`);
}
invariant(
  actionSlots.startsWith('@import "./focusVisualStates.css";'),
  "Focus visual-state stylesheet must load through the existing Focus-scoped style entry",
);

invariant(actions.includes('aria-expanded={notesExpanded}'), "Notes control must expose its existing expanded state");
invariant(actions.includes('className="focus-panel__notes" hidden={!notesExpanded}'), "Notes visual state must reuse existing expansion behavior");
invariant(actions.includes('<TaskNotes'), "expanded Notes must keep the established TaskNotes editor path");

for (const scenario of ["running", "paused-metrics", "break", "time-up", "overtime", "notes-expanded", "no-eligible"]) {
  invariant(fixture.includes(`"${scenario}"`), `visual fixture is missing ${scenario} scenario`);
  if (scenario !== "running") {
    invariant(capture.includes(`scenario=${scenario}`), `Windows capture harness is missing ${scenario} scenario`);
  }
}
invariant(
  capture.includes('Name = "notes-expanded"; Suffix = "-notes-expanded"; Query = "&scenario=notes-expanded"; VirtualTimeBudgetMs = 500'),
  "Notes-expanded Windows capture must reserve virtual time for the asynchronous production Notes read/toggle path",
);
invariant(
  capture.includes('$edgeArguments = @("--virtual-time-budget=$($scenario.VirtualTimeBudgetMs)") + $edgeArguments'),
  "Focus capture harness must apply scenario-specific virtual time without changing synchronous scenarios",
);
invariant(fixture.includes('command === "get_list_board_task_note"'), "Notes-expanded fixture must mock only the authoritative Notes read boundary");
invariant(fixture.includes("notesButton.click();"), "Notes-expanded fixture must exercise the production Notes toggle");
invariant(fixture.includes('scenario === "no-eligible" ? [scheduledTask] : normalTodayTasks'), "no-eligible fixture must retain scheduled work while removing eligible/live work");
invariant(fixture.includes('scenario === "no-eligible" ? null : {'), "no-eligible fixture must not fabricate a live timer");

invariant(
  pkg.scripts["test:ui-focus-visual-states"] === "node scripts/test-ui-focus-visual-states.mjs",
  "package script registration differs",
);
invariant(
  pkg.scripts["preflight:frontend"].includes("npm run test:ui-focus-visual-states"),
  "frontend preflight must run the Focus visual-state contract",
);
invariant(
  pkg.scripts["test:visual-regression:windows"].includes("validate-focus-visual-state-captures.mjs"),
  "Windows visual regression must validate Focus visual states",
);

console.log("Focus visual-state projection, scope, and fixture contracts passed.");