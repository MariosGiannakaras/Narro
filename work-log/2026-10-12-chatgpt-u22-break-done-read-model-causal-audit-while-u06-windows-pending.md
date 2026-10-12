# 2026-10-12 — U22 persisted Break Done read-model causal assessment (U06 Windows CI active)

**Read-only / no source edits, no tests or native runs.** Existing U21 preserves task identity and Break ledger; U22 is separate local-first functional history presentation. M11 remains optional, not a blocking prerequisite.

## Actual source-data authority and risks

- `src/FocusPanel.tsx` only consumes `getListBoardSnapshot(target)` for Today/Scheduled/Done task lanes and subscribes to `connectLiveTimerSessionProjection`. The Done group is `doneTasks = board.done.tasks` and `{doneTasks.length} Done`. Focus completion fraction uses real `board.done.count/(board.today.count + board.done.count)`; a Break history row **must never count as a completed task** or change these invariants.
- `src/timerSessionApi.ts::TimerSessionChange` provides `manual_break_started`, `break_finished`, `break_skipped` and session IDs, but **is not itself a durable list** of closed Break sessions. Reconstructing rows from in-memory timer events would lose history on restart and can duplicate rows after event replay.
- Rust `src-tauri/src/reporting.rs::report_sessions` already reads authoritative persisted *closed* sessions and joins task/list metadata; it filters by `SessionKind::Break` downstream in `src-tauri/src/session_reporting.rs` and returns stable `SessionId`, optional `TaskId`/`ListId`, timestamp, duration, source and archival context in typed `src/reportsApi.ts` payloads. **Break history is already persisted; no ghost work/task should be synthesized.**
- **Performance trap:** `report_sessions` currently executes `SELECT ... FROM sessions ... WHERE s.ended_at IS NOT NULL ORDER BY s.started_at, s.id`, then filters the requested date range/list in Rust. Reusing the whole Reports Sessions read on every Focus board invalidation could scan all accumulated history and construct work ordinals unnecessarily; avoid a high-frequency, full-history hidden Reports command in Focus.
- **Causal view-only target:** a dedicated finite **read-only persisted recent Break-session projection** or a bounded existing data service query with explicit date/scope, stable `SessionId` keys, independent collection state and stale-target read epoch. Render completed Break display entries with duration/ended time and clear visual semantics separate from completed Task rows; source old-video Break row does not prove it is a completed task. Decide intentional list scope (selected list/all), per-day/history horizon, timezone, archive behavior and zero rows **before coding**. Do not decrement/rewrite session totals, task Done fraction, original task identity or persisted EST.
- Any new Rust query must handle orphan/missing associated task/list faithfully (optional IDs exist for Break), malformed persisted timestamps/errors, same-session double display, list deletion/archive, return order/limit and race with timer event/board refresh, backed by SQLite/report regression tests. Native physical acceptance remains independent and USER-PAUSED.

## U23 distinct runtime view-read trap

- Timer `BreakRuntime.duration_ms` is authoritative planned Break duration; persisted `total_break_ms` includes previously committed Breaks plus current elapsed, and `break_remaining_ms` is moving residual. Neither can be added directly to the static Focus Today EST without drift/double-counting. Proposed safe typed **read-only active planned Break duration** field in timer snapshot, no schema/state rewrite, plus view-only header presentation and restoration on resumed work. Separate U23 contract, not piggyback a fake task on U22.

## Safe sequencing

Do not overlap source files shared by active U06 #339 with U09; U22/U23 owners are distinct but require a dedicated read/typed timer data contract before coding. Current U06 new source **0/1** pending Windows CI; earlier bounded campaign **4/4 accepted**. Physical PA-01–09 USER-PAUSED, M10 blocked, M11 dormant. This analysis is not U22 implementation acceptance.
