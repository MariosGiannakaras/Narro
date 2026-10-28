# 2026-10-28 — PR437-adjacent running Time Taken source triage

**Owner:** ChatGPT source analysis. **No source, tests, personal profile, OS display, or physical Windows change in this triage.** Source inspected at current PR437 candidate `41e8ff8ad8584b74821f3185401ed0c9740fc991`. This is an independent disposition of the Time Taken observation, not a J05/J01/U-R03 validation result.

## Grounded prior evidence

In the older PR437 physical packet ([original evidence](../work-log/evidence/pr437-native-20261028/README.md)), a newly running next task showed Panel `Time Taken 0:00:00` while the running timer passed five minutes. Final owned SQLite checkpoint held `total_work_ms=361522` for the same task; a separate paused-task restart later displayed `0:06:01` ([paired-capture evidence](../work-log/evidence/pr437-paired-capture-20261028/README.md)). That proves neither lost time nor correct live Panel presentation.

## Source-state diagnosis

- `src/FocusLiveMetrics.tsx` renders the `time_taken` metric from the `ListBoardTask.timeTakenSeconds` projection (`displayValue` / `timeTakenDraft`), **not from the continuously sampled `TimerSnapshot.work_elapsed_ms`**. The same projection is authoritative for paused manual editing, so the UI must not silently overwrite it with a derived amount.
- `src/FocusPanel.tsx` refreshes the board in response to semantic Timer payloads with `change` and other explicit invalidations. In contrast, `src/timerSessionApi.ts` samples the live running Timer payload roughly every second, but that sampling is **not a guaranteed board Time Taken refresh**. An uninterrupted running view can therefore retain the older board metric while its live clock advances.
- `src-tauri/src/persistence/task_metadata.rs::task_time_taken_seconds` sums persisted work-session duration plus the explicit manual adjustment. The native timer maintains a separate authoritative runtime work clock and periodically checkpoints the open session (`src-tauri/src/timer/runtime.rs`, 30-second checkpoint interval). A board-only UI refresh is therefore neither frame-accurate nor equivalent to the current runtime total.

**Disposition:** a plausible and source-supported **live-display staleness path**, independent of the old physical evidence of durable runtime accounting. Exact user-facing live Time Taken update semantics/parity are not verified; no data-loss finding and no source fix claimed.

**Safe implementation constraint if a live-display update is required:** derive a monotonic, task-bound display from authoritative current work and committed session/manual-adjustment totals, reconcile at pause/resume/edit/task switch/restart, and test for double-counting (especially already checkpointed open sessions) and stale board responses. Naively adding the full current `work_elapsed_ms` to `task.timeTakenSeconds` is unsafe because the latter can already include checkpointed/current work. Preserve paused Time Taken edit CAS semantics and the existing revision ownership. Gate separately from PR437's current three source fixes and all paused physical Windows checks.

**PR437 scope and next:** maintain U-R03/J01/J05 changes at `41e8ff8a`, exact-head CI `40677357491` (last observed validation/fast PASS, Windows candidate in progress). Reassess this UI-display issue only after the active gate/ownership is resolved, without confusing a display correction with a persistence recovery or physical PASS.
