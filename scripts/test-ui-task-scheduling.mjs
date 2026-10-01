import fs from "node:fs";

const root = new URL("../", import.meta.url);
const read = (relative) => fs.readFileSync(new URL(relative, root), "utf8").replace(/\r\n/g, "\n");

function requireText(haystack, needle, label) {
  if (!haystack.includes(needle)) throw new Error(`Missing ${label}: ${needle}`);
}

const dateTimeFormat = read("src/dateTimeFormat.ts");
const schedulePersistence = read("src-tauri/src/persistence/task_schedule_edit.rs");
const recurrencePersistence = read("src-tauri/src/persistence/recurrence.rs");
const replacePersistence = read("src-tauri/src/persistence/recurrence_replace.rs");
const listBoardRust = read("src-tauri/src/list_board.rs");
const boardSchedule = read("src-tauri/src/board_task_schedule.rs");
const scheduling = read("src-tauri/src/scheduling/mod.rs");
const persistenceMod = read("src-tauri/src/persistence/mod.rs");
const lib = read("src-tauri/src/lib.rs");
const listBoardApi = read("src/listBoardApi.ts");
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
  [listBoardRust, "pub recurrence_rule_id: Option<RecurrenceRuleId>", "recurrence parent identity projection"],
  [listBoardRust, "pub recurrence_parent_task_id: Option<TaskId>", "generated occurrence parent projection"],
  [listBoardRust, "recurrence_rule_id: projected.task.recurrence_rule_id", "authoritative recurrence parent projection wiring"],
  [listBoardApi, "recurrenceRuleId?: string | null", "typed recurrence parent task-card field"],
  [listBoardApi, "recurrenceParentTaskId?: string | null", "typed occurrence parent task-card field"],
  [boardSchedule, "pub fn get_list_board_task_schedule_editor(", "schedule editor read command"],
  [boardSchedule, "resolve_schedule_shortcut(shortcut, now_local, &timezone)", "Rust-owned shortcut resolution"],
  [boardSchedule, "update_task_schedule_if_expected(", "stale-safe schedule mutation boundary"],
  [boardSchedule, "generated recurrence occurrences cannot become nested recurrence parents", "generated-child nested recurrence guard"],
  [boardSchedule, "expected_rule_updated_at", "recurrence version guard"],
  [boardSchedule, "replace_existing_tasks_if_expected(", "atomic special replace-existing path"],
  [boardSchedule, "update_recurrence_rule_if_expected(", "atomic non-replace recurrence update path"],
  [boardSchedule, "recurrence_removal_preview(", "No Repeat child-impact preview"],
  [boardSchedule, "remove_recurrence_if_expected(", "atomic No Repeat removal path"],
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
  [replacePersistence, "pub fn recurrence_removal_preview(", "No Repeat safe-deletion preview"],
  [replacePersistence, "pub fn remove_recurrence_if_expected(", "No Repeat atomic removal"],
  [replacePersistence, "child_is_safely_deletable", "shared pristine/protected child classifier"],
  [replacePersistence, "legacy/corrupt linkage", "No Repeat unmatched-link fail-safe"],
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
  [api, 'committedScheduleMutation<void>("update_list_board_task_schedule"', "typed committed schedule write IPC"],
  [api, 'committedScheduleMutation<RecurrenceMutationResult>("save_list_board_task_recurrence"', "typed committed recurrence save IPC"],
  [api, 'committedScheduleMutation<RecurrenceRemovalResult>("remove_list_board_task_recurrence"', "typed committed recurrence remove IPC"],
  [dateTimeFormat, "new Intl.DateTimeFormat(locales", "system-locale date/time formatter"],
  [dateTimeFormat, 'hour: "numeric"', "locale-owned 12/24-hour convention"],
  [dialog, 'import { formatVisibleDate, formatVisibleDateTime } from "./dateTimeFormat";', "schedule dialog locale formatter import"],
  [dialog, "if (!scheduleUseTime) return visibleDate;", "date-only preview uses locale formatter"],
  [dialog, "formatVisibleDateTime(scheduleLocalDate, scheduleLocalTime)", "timed preview uses system locale and hour convention"],
  [dialog, 'data-task-schedule-shortcut={shortcut.kind}', "production schedule shortcuts"],
  [dialog, 'data-task-schedule-control="time-toggle"', "optional schedule time control"],
  [dialog, "Date-only schedules never round-trip through UTC.", "date-only semantic guidance"],
  [dialog, 'data-task-recurrence-control="preset"', "recurrence preset control"],
  [dialog, '<option value="none">No Repeat</option>', "source-evidenced No Repeat option"],
  [dialog, 'data-task-recurrence-control="replace-existing"', "Replace Existing Tasks control"],
  [dialog, 'data-task-recurrence-control="delete-existing"', "conditional Delete Existing Tasks control"],
  [dialog, "snapshot.deleteExistingEligibleCount", "authoritative safe-delete count"],
  [dialog, "snapshot.protectedExistingCount", "protected child disclosure"],
  [dialog, "customized or history-bearing tasks are preserved", "replace child-preservation guidance"],
  [dialog, "generated recurrence occurrence", "generated occurrence explanation"],
  [dialog, "without creating a nested rule", "nested recurrence UI guard"],
  [dialog, "await updateTaskSchedule({", "schedule save boundary"],
  [dialog, "await saveTaskRecurrence({", "recurrence save boundary"],
  [dialog, "await removeTaskRecurrence({", "recurrence removal boundary"],
  [board, "const [scheduleEditorTaskId, setScheduleEditorTaskId]", "board schedule-editor state"],
  [board, "scheduleEditorTaskId === null", "schedule editor interaction lock"],
  [board, "const canStartScheduleEditor = interactionIdle", "fail-closed scheduling readiness including All Lists identity edits"],
  [board, "task.completedAt === null && !isLiveTask", "Done/live scheduling restriction"],
  [board, "onScheduleEdit={canEditSchedule", "production task-card scheduling wiring"],
  [board, "setMutationPendingTaskId(taskId);", "post-commit refresh interaction lock"],
  [board, "Task change was saved, but the board could not refresh.", "committed refresh failure distinction"],
  [board, "[data-task-schedule-control]", "schedule-control drag isolation"],
  [board, 'data-board-schedule-editor={scheduleEditorTaskId ? "open" : "closed"}', "board schedule editor marker"],
  [taskCard, 'data-task-schedule-control="open"', "task-card schedule affordance"],
  [taskCard, 'data-task-recurrence={recurrenceState(task)}', "task-card recurrence state marker"],
  [taskCard, 'if (task.recurrenceRuleId) return "Repeats";', "recurrence parent visible label"],
  [taskCard, 'if (task.recurrenceParentTaskId) return "Occurrence";', "generated occurrence visible label"],
  [taskCard, "list-board-task__schedule-button", "scheduled-row button without title geometry mutation"],
  [taskCard, "list-board-task__schedule-trigger", "unscheduled metadata-row affordance"],
  [boardCss, "width: 4.25rem;", "reserved title action slot remains fixed"],
  [dialogCss, ".task-schedule-dialog__backdrop", "dialog backdrop presentation"],
  [dialogCss, ".task-schedule-dialog__shortcuts", "shortcut layout"],
  [dialogCss, ".task-schedule-dialog__check--consequence", "neutral replace-existing consequence presentation"],
  [dialogCss, ".task-schedule-dialog__check--destructive", "destructive No Repeat consequence presentation"],
  [fixtureHtml, "/src/taskScheduleVisualFixture.tsx", "scheduling fixture entry module"],
  [fixture, 'data-task-schedule-visual-fixture="true"', "production scheduling visual fixture"],
  [fixture, 'command === "get_list_board_task_schedule_editor"', "fixture-only authoritative read mock"],
  [fixture, "const maxReadyFrames = 120;", "frame-bounded scheduling fixture readiness"],
  [fixture, "window.requestAnimationFrame", "scheduling fixture yields browser frames while React passive effects settle"],
  [fixture, "<TaskScheduleDialog", "production dialog fixture"],
  [fixture, 'fixture: "task-scheduling"', "scheduling geometry contract"],
  [fixture, 'mode === "no-repeat"', "No Repeat fixture mode"],
  [fixture, 'data-task-recurrence-control="delete-existing"', "No Repeat visual consequence geometry"],
  [vite, 'taskScheduleFixture: "task-schedule-fixture.html"', "Vite scheduling fixture registration"],
  [capture, 'task-scheduling-$theme', "Windows scheduling captures"],
  [capture, 'task-scheduling-no-repeat-$theme', "Windows No Repeat scheduling captures"],
  [capture, '$maxAttempts = if ($ReadyMarker) { 4 } else { 1 }', "ready-marker visual capture retry budget"],
  [capture, 'Start-Sleep -Milliseconds (250 * $attempt)', "ready-marker visual capture retry backoff"],
  [capture, '-VirtualTimeBudgetMs 10000', "scheduling fixture virtual-time readiness headroom"],
  [validator, "scheduling editor geometry differs between light and dark themes", "theme geometry parity gate"],
  [validator, "No Repeat", "No Repeat capture validation"],
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

if (
  fixture.includes("performance.now() + 5_000")
  || fixture.includes("window.setTimeout(resolve, 10)")
) {
  throw new Error("Scheduling visual readiness must not spin virtual-time timer polling ahead of React passive effects.");
}

if (dialog.includes("setInterval") || board.includes("setInterval")) {
  throw new Error("Scheduling UI must not introduce renderer polling.");
}

if (dialog.includes('data-task-recurrence-control="remove"')) {
  throw new Error("No Repeat must own recurrence removal; the old separate Remove recurrence control must not return.");
}

if (/reminder/i.test(dialog)) {
  throw new Error("Scheduling/recurrence slice must not absorb reminder UI.");
}

requireText(packageJson, '"test:ui-task-scheduling"', "scheduling frontend preflight script");
requireText(packageJson, "validate-task-schedule-captures.mjs", "scheduling Windows capture validator");

console.log("Task scheduling and recurrence production contract checks passed.");
