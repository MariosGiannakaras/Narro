# HANDOFF.md

This is the **current operational continuation state** for Narro. Any zero-context AI must start with `AI_START_HERE.md`, then read `AGENTS.md`, `ENGINEERING_QUALITY.md`, `AGENT_WORKFLOW.md`, this file, the active Milestone 3 section in `TODO.md`, `STATUS.md`, `docs/BLITZIT_HISTORY_RISK_INDEX.md`, and the newest relevant `work-log/*.md` entries.

## CURRENT MILESTONE

**Milestone 3 — Timer/session engine.**

Milestone 1 Gate A is PASS and Milestone 2 Gate B is PASS. Continue with Tauri 2 + React/TypeScript + Rust + SQLite and the two-window composition (`main` + reused `focusSurface`). Do not regress the async `main` recreation path; the old synchronous WebView2 recreation path deadlocked on real Windows.

## VALIDATED MILESTONE 3 BASELINE

Current validated implementation baseline is merge `c59e434e9f6b13b1837159f00e51fc96dd7f10a7`. Windows main CI #145 / run `33931153129`: SUCCESS.

Merged M3 slices:

- PR #23 / merge `efb50743e1625a597f2e8466d552f67f03539d5d`: authoritative pure Rust timer state machine with controlled time, CountUp/EST/Pomodoro, pause/resume, breaks, Time's Up and overtime semantics.
- PR #24 / merge `2da2496d1e7eab4ba57a0c80d82c680614fe2397`: Done/Skip/Switch lifecycle and Time's Up task exits.
- PR #25 / merge `faf46923acbebd59cd0b1d241eaad80c2618f606`: session persistence foundation, one-open-session DB invariant, work/break rows and restart-surviving persisted sessions.
- PR #27 / merge `c769c284002628b73f76b4c1e35b1595dc685bf0`: persistence-first `TimerRuntime`, atomic Work<->Break/task-switch session replacement, no per-second SQLite writes, pause/resume checkpoints, fractional segment accounting and rollback on failed switch. Windows CI #122 PASS.
- PR #29 / merge `3d4ab087682d3cf91a93f18aa5e1bd2cb23d2719`: durable runtime checkpoint/recovery tied atomically to the one open focus session. Running/overtime recover to safe paused variants; paused/Time's Up are preserved; Pomodoro/manual break progress survives restart without charging process downtime. PR CI #128 and main CI #129 PASS.
- PR #30 / merge `138fb5cc753dc520be731159be453fc6046aecb4`: product-level atomic Done boundary. Task completion, final work-session persistence, runtime-checkpoint deletion and active-rank compaction commit together before Idle is published. PR CI #138 and main CI #139 PASS.
- PR #31 / merge `c59e434e9f6b13b1837159f00e51fc96dd7f10a7`: paused live Time Taken rebasing without rewriting raw session history, plus exact 15m+15m pause/recovery and task-switch-adjacent restart regressions. PR CI #144 and main CI #145 PASS.

PR #26 (`m3-session-coordinator`) remains historical and was closed unmerged; its recovery idea was superseded by merged PR #29.

Important API boundaries now established:

- product/UI Done must call `TimerRuntime::complete_task`; lower-level `TimerRuntime::finish_task` is only the timer/session lifecycle primitive and does not mark the task completed;
- live Time Taken edits must call `TimerRuntime::set_time_taken_while_paused`; generic metadata mutation rejects an active focus session;
- raw timer/session accounting remains monotonic; user corrections are represented by durable `manual_time_adjustment_seconds` rather than rewriting historical sessions.

## REQUIRED RESEARCH CONTEXT

The focused Blitzit history/reliability research is in `docs/BLITZIT_HISTORY_RISK_INDEX.md` and complements `docs/SOURCE_AUDIT.md` / `docs/RESEARCH_EVIDENCE.md`.

Highest-confidence M3 lesson: tracked-time loss is a recurring Blitzit failure family from late 2024 through current 2026 reports. Narro now has explicit automated coverage for completion-to-zero prevention, pause/resume accounting, restart recovery, task-switch restart, and post-pause manual Time Taken rebasing. Do not remove these persistence-first boundaries when adding Tauri/UI integration.

Do not re-research these completed findings unless new evidence materially changes them. Use the feature-specific risk/checklist section when implementing the corresponding Narro slice.

## NEXT AGENT ACTION — MILESTONE 3

Continue from the validated timer reliability baseline. Do not start Milestone 4 or polished product UI.

Priority order:

1. Finish typed Tauri timer/session events consumed by both `main` and `focusSurface`. Events must be emitted only after an authoritative Rust transition/persistence success; renderer/window lifecycle changes remain presentation-only and must never advance/reset/create timer sessions.
2. Complete Pomodoro boundary side effects: automatic break-start/end notifications exactly once, including late observation/recovery, then implement the user-visible end-of-break prompt/resume workflow on top of typed events.
3. Add long-duration/large-elapsed safety coverage so timer/session arithmetic and event revisioning cannot overflow or corrupt state.
4. Define/test Windows sleep/resume behavior for **no data loss**. Do not invent whether unattended sleep counts as work; that accounting policy requires an explicit product decision before implementation.
5. Use exact-head Windows CI as the authoritative Rust/frontend/release gate.

The active typed-event implementation branch is `ai/m3-typed-timer-events`. Its design direction is a Rust-owned revisioned timer controller whose snapshot is the last Rust-observed persistence-coherent projection. Renderer reads must not project or apply automatic timer boundaries; authoritative `advance` does that and then publishes a typed event.

Do not pull Milestone 4 scheduling/recurrence materialization into M3.

## USER ACTION REQUIRED

**None for the current typed-event/Pomodoro backend slices.** Physical Windows validation is only needed when a slice actually depends on OS-visible notification/sleep behavior that automation cannot establish.

## IMPORTANT FILES

- `docs/BLITZIT_HISTORY_RISK_INDEX.md`
- `docs/SOURCE_AUDIT.md`
- `src-tauri/src/timer/`
- `src-tauri/src/persistence/sessions.rs`
- `src-tauri/src/persistence/timer_runtime.rs`
- `src-tauri/src/persistence/live_completion.rs`
- `src-tauri/src/persistence/live_time_taken.rs`
- `src-tauri/tests/timer_session_coordinator.rs`
- `src-tauri/tests/timer_recovery_regressions.rs`
- `src-tauri/migrations/0003_session_runtime.sql`
- `src-tauri/migrations/0004_timer_runtime_checkpoint.sql`
- `TODO.md`
- `STATUS.md`
- newest Milestone 3 `work-log/*.md`

## DURABLE M1 REFERENCES

- `work-log/2026-09-03-chatgpt-m1-physical-capability-results.md`
- `work-log/2026-09-03-chatgpt-autostart-restart-validation.md`
- `work-log/2026-09-03-chatgpt-floating-performance-results.md`
- `docs/M1_FLOATING_PERFORMANCE_MEASUREMENT.md`
