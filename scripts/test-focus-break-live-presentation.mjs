import assert from "node:assert/strict";
import fs from "node:fs";
import { focusBreakPresentation } from "../src/focusBreakPresentation.ts";
import { focusHeaderEstimateSeconds } from "../src/focusBreakEstimate.ts";

const currentTask = "task-17";
const active = focusBreakPresentation("running", currentTask, "Write summary");
assert.deepEqual(active, {
  showBreakCard: false,
  liveTitle: "Write summary",
  suspendedTaskId: null,
});
for (const state of ["paused", "time_up", "overtime_running", "overtime_paused"]) {
  const view = focusBreakPresentation(state, currentTask, "Write summary");
  assert.equal(view.showBreakCard, false);
  assert.equal(view.liveTitle, "Write summary");
  assert.equal(view.suspendedTaskId, null);
}
const manualBreak = focusBreakPresentation("break", currentTask, "Write summary");
assert.deepEqual(manualBreak, {
  showBreakCard: true,
  liveTitle: "Break",
  suspendedTaskId: currentTask,
}, "break only changes the Focus card and queued presentation; active timer identity is unchanged");
assert.deepEqual(focusBreakPresentation("break", null, null), {
  showBreakCard: false,
  liveTitle: "",
  suspendedTaskId: null,
}, "never synthesize a break task/card when no authoritative task exists");
assert.equal(focusBreakPresentation(null, currentTask, "Write summary").showBreakCard, false);

const panel = fs.readFileSync("src/FocusPanel.tsx", "utf8");
assert(panel.includes("focusBreakPresentation("));
assert(panel.includes("breakView.suspendedTaskId === task.id"),
  "during an authoritative break the work task must be shown in the queue");
assert(panel.includes("task.id !== breakView.suspendedTaskId"),
  "suspended work must be excluded from persisted reorder candidates");
assert(panel.includes("const suspendedWork = task.id === breakView.suspendedTaskId;"));
assert(panel.includes("notesExpanded={!suspendedWork && notesTaskId === task.id}")
  && panel.includes("subtasksExpanded={!suspendedWork && subtasksTaskId === task.id}"),
  "already-open editors must not remain mutable when a queued task becomes suspended");
assert(panel.includes("{moreOpen && !suspended ? ("),
  "already-open overflow menus must be hidden for suspended work");
assert(panel.includes("disabled={rowInteractionDisabled || mutationPendingTaskId === task.id || suspendedWork}"),
  "suspended work must not be editable/completable during the break");
assert(panel.includes("<FocusLiveTitle title={breakView.liveTitle}"),
  "render Break title without changing authoritative timer task id");
assert(panel.includes("key={liveTask.id}"),
  "preserve real active task owner for FocusLiveActions");
assert(panel.includes("const doneTasks = board.done.tasks;")
  && panel.includes("{board.done.count}/{totalCount} Done"),
  "completed task progress stays tied to the authoritative Board even if a real closed Break is shown as separate session history");
console.log("U21 Focus Break presentation is view-only and the suspended task stays noninteractive.");
// U23 planned duration belongs to the active Break, not cumulative/remaining ledger.
const breakTimer = {
  state: "break",
  break_planned_ms: 600_000,
  break_remaining_ms: 420_000,
  total_break_ms: 780_000,
};
const initialBreakTimer = { ...breakTimer };
assert.equal(focusHeaderEstimateSeconds(7_800, breakTimer, true), 8_400,
  "a ten-minute planned Break adds to the 2hr10 task EST only for the live selected task");
assert.deepEqual(breakTimer, initialBreakTimer, "read-only presentation never edits timer/session data");
assert.equal(focusHeaderEstimateSeconds(7_800, { ...breakTimer, break_remaining_ms: 1_000, total_break_ms: 1_200_000 }, true), 8_400,
  "header EST remains stable while elapsed and remaining timers tick, even with prior Break history");
assert.equal(focusHeaderEstimateSeconds(7_800, { ...breakTimer, break_planned_ms: 1_001 }, true), 7_802,
  "sub-second planned duration rounds upward only once");
assert.equal(focusHeaderEstimateSeconds(7_800, breakTimer, false), 7_800,
  "a Break in another list or missing Today task cannot change the selected board's estimate");
for (const state of ["idle", "running", "paused", "time_up", "overtime_running"]) {
  assert.equal(focusHeaderEstimateSeconds(7_800, { ...breakTimer, state }, true), 7_800,
    "no Break planned EST after work resumes, skip, natural completion, or other states");
}
for (const planned of [null, undefined, 0, -5, Number.POSITIVE_INFINITY, Number.MAX_VALUE, NaN]) {
  assert.equal(focusHeaderEstimateSeconds(7_800, { ...breakTimer, break_planned_ms: planned }, true), 7_800,
    "invalid or absent Break planned duration must fail closed");
}
assert.equal(focusHeaderEstimateSeconds(Number.MAX_SAFE_INTEGER - 1, breakTimer, true),
  Number.MAX_SAFE_INTEGER - 1, "a too-large addition must not lose seconds to overflow");
assert.equal(focusHeaderEstimateSeconds(-1, breakTimer, true), -1, "invalid board aggregates remain untouched");

assert(panel.includes("focusHeaderEstimateSeconds(")
  && panel.includes("liveTask !== null && (board.target.kind === \"all_lists\" || liveTask.listId === board.target.id)")
  && panel.includes("Est: {formatEstimate(headerEstimateSeconds)}"),
  "header must use pure scoped Break projection without changing saved task/board estimate");
const fixture = fs.readFileSync("src/focusPanelVisualFixture.tsx", "utf8");
assert(fixture.includes('break_planned_ms: state === "break" ? 600_000 : null'),
  "real dark/light Break visual fixture must project planned 10min independent of remaining 7min");
console.log("U23 Focus Break planned EST read-only projection, scope, transitions, and invalid durations passed.");

