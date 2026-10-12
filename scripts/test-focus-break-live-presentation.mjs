import assert from "node:assert/strict";
import fs from "node:fs";
import { focusBreakPresentation } from "../src/focusBreakPresentation.ts";

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
  "a Break must not count as a completed task or fabricate a Done row");
console.log("U21 Focus Break presentation is view-only and the suspended task stays noninteractive.");
