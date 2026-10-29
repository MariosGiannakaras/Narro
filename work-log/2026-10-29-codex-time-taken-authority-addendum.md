# Live Time Taken authority addendum — 2026-10-29

Independent read-only source analysis while J05 final CI40862716381 runs. Source inspected: PR437 `1dd54ed8c3144498a2aaedaa9d59e2caa13731c7`. No additional product source/test change, physical replay or acceptance claim. This extends [the prior diagnosis](2026-10-28-chatgpt-pr437-time-taken-running-display-source-triage.md), rather than creating another finding or implementation stream. J05 remains the active correction.

## Additional facts that constrain the eventual correction

1. `timer/runtime.rs::start_task` starts a new engine with elapsed0 and resets closed-work accounting. Therefore `TimerSnapshot.work_elapsed_ms` is not the complete lifetime task Time Taken; previous task sessions and manual adjustment are separate.
2. `persistence/task_metadata.rs::persisted_work_seconds` sums all work-session `duration_seconds`, including the periodically checkpointed open work session. `task_time_taken_seconds` then adds the signed manual adjustment. Blindly adding current runtime work duplicates saved work; using runtime work alone loses prior sessions/manual edits.
3. `persistence/live_time_taken.rs::set_time_taken_while_paused` preserves raw runtime/session accounting while transactionally changing the manual adjustment. A paused manual edit to5s while raw elapsed remains50s must subsequently display6s after1s of real work, not51s or56s. Preserve its expected-task/expected-total guards.
4. `timer/runtime.rs::open_duration_seconds_for` subtracts closed work from total work because breaks split work sessions. Subtracting only the current open row from whole-runtime elapsed would double-count earlier segments from the same activity.
5. `persistence/timer_controller.rs::advance` refreshes `published_runtime` even without a semantic boundary/event; `snapshot` returns that Rust-observed projection. `timer_service.rs::snapshot` holds its existing state mutex and decorates the payload using the effects connection. A future native projection must keep elapsed, persisted basis, active task and event revision coherent under that authority; a renderer clock or repeated board refetch is unnecessary.

## Safe design direction, not implemented

Expose one task-bound native display projection: persisted task work plus manual adjustment, plus only the authoritative work delta not yet represented by the matching persisted runtime checkpoint. Handle work versus break checkpoint forms, task/session binding, integer-second boundaries, overflow/underflow and stale responses explicitly. Compute/cache the persisted basis at appropriate authoritative boundaries so a1Hz frontend sample does not introduce per-tick SQLite writes or needless repeated database aggregation. Do not modify countdown/elapsed semantics to fix the display.

Example: previous closed sessions90s, open checkpoint30s, manual adjustment−10s and current open work50s → display130s (`90+30−10+(50−30)`). A new checkpoint to50s must leave the display130s. A break must not add break time or re-add a closed segment. This arithmetic is an explanatory example, not an executed regression test.

Required executable regression cases before the later patch: first uninterrupted run; checkpoint invariance; previous task work; manual totals below/above raw elapsed; pause/resume; work→break→work; Pomodoro boundary; Time's Up/overtime; task switch and delayed old-task response; restart paused with no downtime; successful manual edit followed by failed board refresh. Preserve explicit domain errors and revision ownership. Add component coverage proving the displayed value advances from native payloads while editing continues to use the persisted CAS value.

## Scope and evidence limit

Canonical Pass-3 video source VE-016 ~02:11.3–02:16 confirms paused manual Taken editing independently from EST; ~02:16–02:51 explains actual tracked time. Those records do not independently prove a required live repaint frequency. The older native packet proves a visibly stale running metric alongside durable saved work, not data loss. Treat responsive live presentation as a bounded reliability/clarity decision if exact source cadence remains unobservable; record that distinction when implementing. No duplicate original-video research is needed to establish the accounting constraints above.
