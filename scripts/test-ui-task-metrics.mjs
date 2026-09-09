import fs from "node:fs";

const root = new URL("../", import.meta.url);
const read = (relative) => fs.readFileSync(new URL(relative, root), "utf8").replace(/\r\n/g, "\n");

function requireText(haystack, needle, label) {
  if (!haystack.includes(needle)) throw new Error(`Missing ${label}: ${needle}`);
}

const estimatePersistence = read("src-tauri/src/persistence/task_estimate_edit.rs");
const timePersistence = read("src-tauri/src/persistence/task_time_taken_edit.rs");
const liveTime = read("src-tauri/src/persistence/live_time_taken.rs");
const runtime = read("src-tauri/src/timer/runtime.rs");
const controller = read("src-tauri/src/persistence/timer_controller.rs");
const timerEvents = read("src-tauri/src/domain/timer_events.rs");
const timerService = read("src-tauri/src/timer_service.rs");
const boardMetrics = read("src-tauri/src/board_task_metrics.rs");
const persistenceMod = read("src-tauri/src/persistence/mod.rs");
const lib = read("src-tauri/src/lib.rs");
const board = read("src/ListBoard.tsx");
const taskCard = read("src/TaskCard.tsx");
const css = read("src/listBoard.css");
const listApi = read("src/listBoardApi.ts");
const timerApi = read("src/timerSessionApi.ts");
const packageJson = read("package.json");

for (const [haystack, needle, label] of [
  [persistenceMod, "pub mod task_estimate_edit;", "EST persistence registration"],
  [persistenceMod, "pub mod task_time_taken_edit;", "Time Taken persistence registration"],
  [estimatePersistence, "TransactionBehavior::Immediate", "atomic EST transaction"],
  [estimatePersistence, "AND est_seconds IS ?5", "null-safe expected EST guard"],
  [estimatePersistence, "LiveTaskRequiresRuntimeBoundary", "non-live EST live-session rejection"],
  [estimatePersistence, "estimate_only_edit_preserves_unrelated_task_metadata", "EST preservation regression"],
  [estimatePersistence, "expected_estimate_guard_is_null_safe_and_rejects_stale_values", "null EST stale regression"],
  [timePersistence, "TransactionBehavior::Immediate", "atomic Time Taken transaction"],
  [timePersistence, "ExpectedTimeTakenMismatch", "expected Time Taken guard"],
  [timePersistence, "LiveTaskRequiresRuntimeBoundary", "non-live Time Taken live-session rejection"],
  [timePersistence, "non_live_edit_preserves_session_history_and_reconciles_effective_total", "non-live ledger preservation regression"],
  [liveTime, "expected_task_id", "live Time Taken expected-task guard"],
  [liveTime, "expected_total_seconds", "live Time Taken expected-total guard"],
  [liveTime, "StaleTask", "live Time Taken stale-task error"],
  [liveTime, "StaleTimeTaken", "live Time Taken stale-total error"],
  [liveTime, "paused_edit_rebases_effective_time_without_rewriting_raw_session_history", "live anti-snap-back regression"],
  [runtime, "pub fn set_estimate_while_paused(", "live EST runtime boundary"],
  [runtime, "TimerStateKind::Paused | TimerStateKind::OvertimePaused", "live EST pause gate"],
  [runtime, "TimerMode::Pomodoro", "Pomodoro EST precedence"],
  [runtime, "work.phase = WorkPhase::TimeUp", "expired EST TimeUp transition"],
  [runtime, "TransactionBehavior::Immediate", "live EST atomic task/checkpoint transaction"],
  [runtime, "UPDATE timer_runtime_checkpoint", "live EST checkpoint persistence"],
  [runtime, "tx.commit()?;", "live EST commit boundary"],
  [runtime, "self.engine = engine;", "post-commit runtime publication"],
  [runtime, "checkpoint_failure_rolls_back_estimate_and_runtime_candidate", "live EST rollback regression"],
  [runtime, "paused_count_up_rebase_to_estimate_preserves_session_and_recovers", "live EST recovery regression"],
  [controller, "TimerSessionChange::EstimateRebased", "EST controller event"],
  [controller, "expected_total_seconds", "controller Time Taken stale guard"],
  [timerEvents, "EstimateRebased", "EST event contract"],
  [timerService, "pub fn timer_set_estimate(", "live EST Tauri command"],
  [timerService, "expected_total_seconds: String", "lossless Time Taken expected total IPC"],
  [boardMetrics, "update_list_board_task_estimate", "non-live EST command"],
  [boardMetrics, "update_list_board_task_time_taken", "non-live Time Taken command"],
  [boardMetrics, 'CommandError::new("TASK_ESTIMATE_EDIT_STALE"', "stable EST stale error code"],
  [boardMetrics, 'CommandError::new("TASK_TIME_TAKEN_EDIT_STALE"', "stable Time Taken stale error code"],
  [lib, "pub mod board_task_metrics;", "board metric module registration"],
  [lib, "board_task_metrics::update_list_board_task_estimate,", "EST command registration"],
  [lib, "board_task_metrics::update_list_board_task_time_taken,", "Time Taken command registration"],
  [lib, "timer_set_estimate,", "live EST command registration"],
  [listApi, 'invoke<void>("update_list_board_task_estimate"', "typed non-live EST IPC"],
  [listApi, 'invoke<void>("update_list_board_task_time_taken"', "typed non-live Time Taken IPC"],
  [timerApi, 'type: "estimate_rebased"', "renderer EST event contract"],
  [timerApi, 'invoke<TimerSessionPayload>("timer_set_estimate"', "typed live EST IPC"],
  [timerApi, 'invoke<TimerSessionPayload>("timer_set_time_taken"', "typed live Time Taken IPC"],
  [board, "connectTimerSessionProjection", "authoritative timer projection subscription"],
  [board, "applyTimerSessionProjection", "monotonic timer projection application"],
  [board, "timerPayload !== null", "fail-closed task editor readiness"],
  [board, 'liveState === "paused" || liveState === "overtime_paused"', "live metric pause gate"],
  [board, "updateListBoardTaskEstimate({", "production non-live EST mutation"],
  [board, "updateListBoardTaskTimeTaken({", "production non-live Time Taken mutation"],
  [board, "setPausedTimerEstimate({", "production live EST mutation"],
  [board, "setPausedTimerTimeTaken({", "production live Time Taken mutation"],
  [board, "expectedEstSeconds: editorState.expectedEstSeconds", "renderer expected EST guard"],
  [board, "expectedTotalSeconds: editorState.expectedTimeTakenSeconds", "renderer expected Time Taken guard"],
  [board, "Task change was saved, but the board could not refresh.", "committed-refresh failure distinction"],
  [board, "MAX_EDITABLE_SECONDS = 4_294_967_295n", "u32 duration boundary"],
  [board, "H:MM:SS", "explicit duration edit format"],
  [board, "[data-task-metric-control]", "metric drag isolation"],
  [board, "Live task titles cannot be edited from the List Board.", "live title restriction"],
  [taskCard, 'data-task-metric-control="open"', "metric open control"],
  [taskCard, 'data-task-metric-control="input"', "metric input control"],
  [taskCard, 'data-task-metric-control="cancel"', "metric cancel control"],
  [taskCard, 'data-task-metric-control="save"', "metric save control"],
  [taskCard, 'data-task-metric-editing={metricEditor?.metric ?? "none"}', "metric editing state marker"],
  [taskCard, 'data-task-live-state={liveState ?? "none"}', "live state marker"],
  [taskCard, "event.key === \"Escape\"", "metric Escape cancellation"],
  [taskCard, "event.key === \"Enter\"", "metric Enter commit"],
  [css, ".list-board-task__metric-edit-actions", "metric actions overlay"],
  [css, "width: 4.25rem;", "reserved action width"],
  [css, ".list-board-task__metric-input", "stable metric input styling"],
  [css, "min-height: 1.5rem;", "stable metadata row height"],
]) {
  requireText(haystack, needle, label);
}

const commitIndex = runtime.indexOf("tx.commit()?;");
const publishIndex = runtime.indexOf("self.engine = engine;", commitIndex);
if (commitIndex < 0 || publishIndex < 0 || commitIndex > publishIndex) {
  throw new Error("Live EST runtime state must publish only after the atomic persistence commit.");
}

const metricStart = board.indexOf("const submitMetricEdit");
const metricEnd = board.indexOf("const handleDragStart", metricStart);
if (metricStart < 0 || metricEnd < 0) throw new Error("Could not isolate metric mutation flow.");
const metricCommit = board.slice(metricStart, metricEnd);
if (!metricCommit.includes('target.kind !== "list"')) {
  throw new Error("Metric mutation must remain restricted to a real individual List Board.");
}

if (taskCard.includes("setInterval") || board.includes("setInterval")) {
  throw new Error("Task metric UI must consume authoritative timer events rather than add renderer polling.");
}

if (boardMetrics.includes("UPDATE tasks") || boardMetrics.includes("INSERT INTO")) {
  throw new Error("Renderer-facing metric commands must delegate to persistence boundaries rather than own raw task SQL.");
}

requireText(packageJson, '"test:ui-task-metrics"', "task metric preflight script");

console.log("EST and Time Taken production contract checks passed.");
