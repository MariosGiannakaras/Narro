import fs from "node:fs";

const root = new URL("../", import.meta.url);
const read = (relative) => fs.readFileSync(new URL(relative, root), "utf8").replace(/\r\n/g, "\n");

function requireText(haystack, needle, label) {
  if (!haystack.includes(needle)) throw new Error(`Missing ${label}: ${needle}`);
}

const schedulePersistence = read("src-tauri/src/persistence/task_schedule_edit.rs");
const recurrencePersistence = read("src-tauri/src/persistence/recurrence.rs");
const replacePersistence = read("src-tauri/src/persistence/recurrence_replace.rs");
const boardSchedule = read("src-tauri/src/board_task_schedule.rs");
const scheduling = read("src-tauri/src/scheduling/mod.rs");
const persistenceMod = read("src-tauri/src/persistence/mod.rs");
const lib = read("src-tauri/src/lib.rs");
const api = read("src/taskScheduleApi.ts");
const dialog = read("src/TaskScheduleDialog.tsx");
const board = read("src/ListBoard.tsx");
const taskCard = read("src/TaskCard.tsx");
const boardCss = read("src/listBoard.css");
const dialogCss = read("src/taskScheduleDialog.css");
const fixture = read("src/taskScheduleVisualFixture.tsx");
const fixtureHtml = read("task-schedule-fixture.html");
const vite = read("vite.config.ts");
const capture = read("scripts/capture-visual-fixtures.ps1");
const validator = read("scripts/validate-task-schedule-captures.mjs");
const packageJson = read("package.json");

for (const [haystack, needle, label] of [
  [persistenceMod, "pub mod task_schedule_edit;", "schedule edit persistence registration"],
  [schedulePersistence, "TransactionBehavior::Immediate", "atomic expected-schedule transaction"],
  [schedulePersistence, "ExpectedListMismatch", "expected list guard"],
  [schedulePersistence, "ExpectedScheduleMismatch", "expected schedule stale guard"],
  [schedulePersistence, "resolve_local_datetime_strict", "strict DST/local-time validation"],
  [schedulePersistence, "date_only_schedule_preserves_identity_lane_and_non_schedule_metadata", "date-only preservation regression"],
  [schedulePersistence, "stale_schedule_cannot_overwrite_newer_schedule", "stale schedule regression"],
  [schedulePersistence, "ambiguous_or_nonexistent_local_time_is_rejected_before_write", "DST rejection regression"],
  [scheduling, "ScheduleShortcut::LaterToday", "authoritative Later today shortcut"],
  [scheduling, "Duration::hours(2)", "Later today +2h behavior"],
  [scheduling, "ScheduleShortcut::NextWeek", "authoritative Next week shortcut"],
  [scheduling, "checked_add_days(now_local.date(), 7)", "Next week +7d behavior"],
  [boardSchedule, "pub fn get_list_board_task_schedule_editor(", "schedule editor read command"],
  [boardSchedule, "resolve_schedule_shortcut(shortcut, now_local, &timezone)", "Rust-owned shortcut resolution"],
  [boardSchedule, "update_task_schedule_if_expected(", "stale-safe schedule mutation boundary"],
  [boardSchedule, "generated recurrence occurrences cannot become nested recurrence parents", "generated-child nested recurrence guard"],
  [boardSchedule, "expected_rule_updated_at", "recurrence version guard"],
  [boardSchedule, "replace_existing_tasks_if_expected(", "atomic special replace-existing path"],
  [boardSchedule, "update_recurrence_rule_if_expected(", "atomic non-replace recurrence update path"],
  [boardSchedule, "delete_recurrence_rule_if_expected(", "atomic recurrence removal path"],
  [boardSchedule, "materialize_after_commit", "post-commit recurrence materialization"],
  [recurrencePersistence, "ExpectedVersionMismatch", "recurrence expected-version error"],
  [recurrencePersistence, "update_recurrence_rule_if_expected(", "expected-version recurrence update persistence"],
  [recurrencePersistence, "delete_recurrence_rule_if_expected(", "expected-version recurrence delete persistence"],
  [recurrencePersistence, "transaction_with_behavior(TransactionBehavior::Immediate)", "atomic recurrence expected-version transaction"],
  [recurrencePersistence, "stale_expected_version_blocks_update_and_delete_before_write", "recurrence stale-version regression"],
  [replacePersistence, "TransactionBehavior::Immediate", "atomic replace-existing transaction"],
  [replacePersistence, "replace_existing_tasks_if_expected(", "expected-version replace-existing persistence"],
  [replacePersistence, "ExpectedVersionMismatch", "replace-existing stale-version guard"],
  [replacePersistence, "detached_modified_child_ids", "modified-child detachment preservation"],
  [replacePersistence, "Keep the occurrence row as the durable idempotency reservation", "detached-child duplicate prevention"],
  [recurrencePersistence, "recurrence_parent_task_id = NULL", "recurrence removal child detachment"],
  [lib, "pub mod board_task_schedule;", "board scheduling module registration"],
  [lib, "board_task_schedule::get_list_board_task_schedule_editor,", "schedule read command registration"],
  [lib, "board_task_schedule::resolve_list_board_schedule_shortcut,", "shortcut command registration"],
  [lib, "board_task_schedule::update_list_board_task_schedule,", "schedule write command registration"],
  [lib, "board_task_schedule::save_list_board_task_recurrence,", "recurrence save command registration"],
  [lib, "board_task_schedule::remove_list_board_task_recurrence,", "recurrence remove command registration"],
  [api, 'invoke<TaskScheduleEditorSnapshot>("get_list_board_task_schedule_editor"', "typed schedule editor IPC"],
  [api, 'invoke<TaskSchedule>("resolve_list_board_schedule_shortcut"', "typed shortcut IPC"],
  [api, 'invoke<void>("update_list_board_task_schedule"', "typed schedule write IPC"],
  [api, 'invoke<RecurrenceMutationResult>("save_list_board_task_recurrence"', "typed recurrence save IPC"],
  [api, 'invoke<void>("remove_list_board_task_recurrence"', "typed recurrence remove IPC"],
  [dialog, 'data-task-schedule-shortcut={shortcut.kind}', "production schedule shortcuts"],
  [dialog, 'data-task-schedule-control="time-toggle"', "optional schedule time control"],
  [dialog, "Date-only schedules never round-trip through UTC.", "date-only semantic guidance"],
  [dialog, 'data-task-recurrence-control="preset"', "recurrence preset control"],
  [dialog, 'data-task-recurrence-control="replace-existing"', "Replace Existing Tasks control"],
  [dialog, "modified/history-bearing children remain independent", "replace child-preservation guidance"],
  [dialog, "generated recurrence occurrence", "generated occurrence explanation"],
  [dialog, "without creating a nested rule", "nested recurrence UI guard"],
  [dialog, "await updateTaskSchedule({", "schedule save boundary"],
  [dialog, "await saveTaskRecurrence({", "recurrence save boundary"],
  [dialog, "await removeTaskRecurrence({", "recurrence removal boundary"],
  [board, "const [scheduleEditorTaskId, setScheduleEditorTaskId]", "board schedule-editor state"],
  [board, "scheduleEditorTaskId === null", "schedule editor interaction lock"],
  [board, "canStartScheduleEditor = canStartCreate", "fail-closed scheduling readiness"],
  [board, "task.completedAt === null && !isLiveTask", "Done/live scheduling restriction"],
  [board, "onScheduleEdit={canEditSchedule", "production task-card scheduling wiring"],
  [board, "setMutationPendingTaskId(taskId);", "post-commit refresh interaction lock"],
  [board, "Task change was saved, but the board could not refresh.", "committed refresh failure distinction"],
  [board, "[data-task-schedule-control]", "schedule-control drag isolation"],
  [board, 'data-board-schedule-editor={scheduleEditorTaskId ? "open" : "closed"}', "board schedule editor marker"],
  [taskCard, 'data-task-schedule-control="open"', "task-card schedule affordance"],
  [taskCard, "list-board-task__schedule-button", "scheduled-row button without title geometry mutation"],
  [taskCard, "list-board-task__schedule-open", "unscheduled metadata-row affordance"],
  [boardCss, "width: 4.25rem;", "reserved title action slot remains fixed"],
  [dialogCss, ".task-schedule-dialog__backdrop", "dialog backdrop presentation"],
  [dialogCss, ".task-schedule-dialog__shortcuts", "shortcut layout"],
  [dialogCss, ".task-schedule-dialog__check--warning", "replace-existing warning presentation"],
  [fixtureHtml, "/src/taskScheduleVisualFixture.tsx", "scheduling fixture entry module"],
  [fixture, 'data-task-schedule-visual-fixture="true"', "production scheduling visual fixture"],
  [fixture, 'command === "get_list_board_task_schedule_editor"', "fixture-only authoritative read mock"],
  [fixture, "<TaskScheduleDialog", "production dialog fixture"],
  [fixture, 'fixture: "task-scheduling"', "scheduling geometry contract"],
  [vite, 'taskScheduleFixture: "task-schedule-fixture.html"', "Vite scheduling fixture registration"],
  [capture, 'task-scheduling-$theme', "Windows scheduling captures"],
  [validator, "scheduling editor geometry differs between light and dark themes", "theme geometry parity gate"],
]) {
  requireText(haystack, needle, label);
}

const scheduleStart = board.indexOf("const handleScheduleCommitted");
const scheduleEnd = board.indexOf("const commitDrop", scheduleStart);
if (scheduleStart < 0 || scheduleEnd < 0) {
  throw new Error("Could not isolate committed scheduling refresh flow.");
}
const committedFlow = board.slice(scheduleStart, scheduleEnd);
const pendingIndex = committedFlow.indexOf("setMutationPendingTaskId(taskId)");
const refreshIndex = committedFlow.indexOf("await refreshAfterMutation(taskId)");
const clearIndex = committedFlow.indexOf("setMutationPendingTaskId(null)");
if (pendingIndex < 0 || refreshIndex < 0 || clearIndex < refreshIndex) {
  throw new Error("Scheduling commit must keep board mutations locked through authoritative refresh.");
}

const scheduleCommandStart = boardSchedule.indexOf("pub fn update_list_board_task_schedule(");
const recurrenceCommandStart = boardSchedule.indexOf("pub fn save_list_board_task_recurrence(");
if (scheduleCommandStart < 0 || recurrenceCommandStart < 0 || scheduleCommandStart >= recurrenceCommandStart) {
  throw new Error("Schedule and recurrence renderer boundaries are not independently defined.");
}

if (boardSchedule.includes("UPDATE tasks") || boardSchedule.includes("INSERT INTO recurrence_rules")) {
  throw new Error("Renderer-facing scheduling commands must delegate raw persistence to authoritative persistence modules.");
}

if (dialog.includes("setInterval") || board.includes("setInterval")) {
  throw new Error("Scheduling UI must not introduce renderer polling.");
}

if (/reminder/i.test(dialog)) {
  throw new Error("Scheduling/recurrence slice must not absorb reminder UI.");
}

requireText(packageJson, '"test:ui-task-scheduling"', "scheduling frontend preflight script");
requireText(packageJson, "validate-task-schedule-captures.mjs", "scheduling Windows capture validator");

console.log("Task scheduling and recurrence production contract checks passed.");
