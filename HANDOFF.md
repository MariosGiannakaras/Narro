# HANDOFF.md

This is the **current operational continuation state** for Narro. Any zero-context AI must start with `AI_START_HERE.md`, then read `AGENTS.md`, `ENGINEERING_QUALITY.md`, `AGENT_WORKFLOW.md`, this file, the active Milestone 3 section in `TODO.md`, `STATUS.md`, `docs/BLITZIT_HISTORY_RISK_INDEX.md`, and the newest relevant `work-log/*.md` entries.

## CURRENT MILESTONE

**Milestone 3 — Timer/session engine.**

Milestone 1 Gate A is PASS and Milestone 2 Gate B is PASS. Continue with Tauri 2 + React/TypeScript + Rust + SQLite and the two-window composition (`main` + reused `focusSurface`). Do not regress the async `main` recreation path; the old synchronous WebView2 recreation path deadlocked on real Windows.

## VALIDATED MILESTONE 3 BASELINE

Current validated **source** implementation baseline is PR #33 squash merge `3ffbaca0c5df78833584de26270686f6cdadca16`. Exact PR head `6a3e7d2f2b5fa941e6389bea7e3ed3247987c817`; Windows PR CI #181 / run `33953073811` / job `101271323980`: SUCCESS. Windows main CI #182 / run `33955789396` / job `101278781399`: SUCCESS.

Markdown-only tracking/work-log commits may be newer than that SHA; they do not change the validated source baseline and do not trigger the Windows CI workflow because of path filters.

Merged M3 slices:

- PR #23 / merge `efb50743e1625a597f2e8466d552f67f03539d5d`: authoritative pure Rust timer state machine with controlled time, CountUp/EST/Pomodoro, pause/resume, breaks, Time's Up and overtime semantics.
- PR #24 / merge `2da2496d1e7eab4ba57a0c80d82c680614fe2397`: Done/Skip/Switch lifecycle and Time's Up task exits.
- PR #25 / merge `faf46923acbebd59cd0b1d241eaad80c2618f606`: session persistence foundation, one-open-session DB invariant, work/break rows and restart-surviving persisted sessions.
- PR #27 / merge `c769c284002628b73f76b4c1e35b1595dc685bf0`: persistence-first `TimerRuntime`, atomic Work<->Break/task-switch session replacement, no per-second SQLite writes, pause/resume checkpoints, fractional segment accounting and rollback on failed switch. Windows CI #122 PASS.
- PR #29 / merge `3d4ab087682d3cf91a93f18aa5e1bd2cb23d2719`: durable runtime checkpoint/recovery tied atomically to the one open focus session. Running/overtime recover to safe paused variants; paused/Time's Up are preserved; Pomodoro/manual break progress survives restart without charging process downtime. PR CI #128 and main CI #129 PASS.
- PR #30 / merge `138fb5cc753dc520be731159be453fc6046aecb4`: product-level atomic Done boundary. Task completion, final work-session persistence, runtime-checkpoint deletion and active-rank compaction commit together before Idle is published. PR CI #138 and main CI #139 PASS.
- PR #31 / merge `c59e434e9f6b13b1837159f00e51fc96dd7f10a7`: paused live Time Taken rebasing without rewriting raw session history, plus exact 15m+15m pause/recovery and task-switch-adjacent restart regressions. PR CI #144 and main CI #145 PASS.
- PR #32 / merge `349260f28475f53472b444af6180704a4b981c20`: typed revisioned `timer-session-changed` projection, Rust-owned Tauri `TimerService`/monotonic clock/background advance, persistence-success event publication, typed lifecycle commands and race-safe subscribe-first/snapshot-second consumption in both `main` and `focusSurface`. PR CI #161 and main CI #162 PASS.
- PR #33 / merge `3ffbaca0c5df78833584de26270686f6cdadca16`: exact persistence/reporting of every crossed automatic Pomodoro boundary, durable once-only local notification decisions/claims, post-commit best-effort Windows notification submission, authoritative `awaitingResume` projection shared by both webviews, minimal Resume workflow, and process-recovery preservation without replaying already claimed notification decisions. PR CI #181 and main CI #182 PASS.

PR #26 (`m3-session-coordinator`) remains historical and was closed unmerged; its recovery idea was superseded by merged PR #29.

Important API and ownership boundaries now established:

- product/UI Done must call `TimerRuntime::complete_task`; lower-level `TimerRuntime::finish_task` is only the timer/session lifecycle primitive and does not mark the task completed;
- live Time Taken edits must call `TimerRuntime::set_time_taken_while_paused`; generic metadata mutation rejects an active focus session;
- raw timer/session accounting remains monotonic; user corrections are represented by durable `manual_time_adjustment_seconds` rather than rewriting historical sessions;
- renderers do not own timer time and must not pass authoritative monotonic timestamps; Tauri/Rust `TimerService` owns the process-local clock and automatic advance;
- renderer/window lifecycle is presentation-only unless an explicit domain command is invoked;
- typed timer/session events are emitted after successful authoritative persistence transitions and both webviews consume the same revisioned projection;
- automatic Pomodoro boundaries are stepped and persisted individually even under late observation, so Work -> Break -> Paused cannot lose the intermediate Break row;
- a Pomodoro boundary creates/claims one durable local notification decision per source session/effect kind. Windows toast delivery is an external best-effort submission after persistence; do not claim transactional exactly-once OS delivery across a process crash;
- `awaitingResume` is authoritative Rust/service projection state for a completed Pomodoro break, survives renderer recreation and process recovery, and clears when the authoritative projection leaves paused Pomodoro, including `timer_resume`.

## REQUIRED RESEARCH CONTEXT

The focused Blitzit history/reliability research is in `docs/BLITZIT_HISTORY_RISK_INDEX.md` and complements `docs/SOURCE_AUDIT.md` / `docs/RESEARCH_EVIDENCE.md`.

Highest-confidence M3 lesson: tracked-time loss is a recurring Blitzit failure family from late 2024 through current 2026 reports. Narro now has explicit automated coverage for completion-to-zero prevention, pause/resume accounting, restart recovery, task-switch restart, post-pause manual Time Taken rebasing, renderer-independent typed timer/session projection, late Pomodoro Work/Break boundary persistence, once-only local Pomodoro notification decisions and durable awaiting-resume recovery. Preserve these persistence-first boundaries.

Do not re-research these completed findings unless new evidence materially changes them. Use the feature-specific risk/checklist section when implementing the corresponding Narro slice.

## NEXT AGENT ACTION — MILESTONE 3

Continue from the validated PR #33 Pomodoro boundary/effect baseline. Do not start Milestone 4 or polished product UI.

Priority order:

1. Add long-duration/large-elapsed safety coverage so timer/session arithmetic, automatic-boundary calculations, wall-time interpolation, persisted duration conversion and event revisioning cannot overflow or corrupt state. Prefer checked arithmetic and deterministic error behavior over saturation that could silently falsify tracked time.
2. Audit the direct engine/runtime paths against those large-elapsed cases as well as the Tauri service path; the renderer must remain unable to supply authoritative time.
3. Define/test Windows sleep/resume behavior for **no data loss**, but do not invent whether unattended sleep counts as work. That accounting policy requires an explicit product decision before implementation; safety tests may establish what is preserved without choosing the accounting policy.
4. Use exact-head Windows CI as the authoritative Rust/frontend/release gate.

Suggested next source branch: `ai/m3-large-elapsed-safety`, based on current `main` after tracking reconciliation.

Do not pull Milestone 4 scheduling/recurrence materialization into M3.

## USER ACTION REQUIRED

**None for the next large-elapsed safety slice.** The remaining Windows sleep/resume accounting policy is unresolved and must not be guessed. Generic Windows notification delivery was already physically proven in M1; PR #33's boundary/effect semantics are automated-validated.

## IMPORTANT FILES

- `docs/BLITZIT_HISTORY_RISK_INDEX.md`
- `docs/SOURCE_AUDIT.md`
- `docs/PRODUCT_SPEC.md`
- `src-tauri/src/timer/`
- `src-tauri/src/timer_service.rs`
- `src-tauri/src/domain/timer_events.rs`
- `src-tauri/src/persistence/sessions.rs`
- `src-tauri/src/persistence/timer_runtime.rs`
- `src-tauri/src/persistence/timer_controller.rs`
- `src-tauri/src/persistence/pomodoro_effects.rs`
- `src-tauri/src/persistence/live_completion.rs`
- `src-tauri/src/persistence/live_time_taken.rs`
- `src-tauri/src/notifications/mod.rs`
- `src/timerSessionApi.ts`
- `src/TimerSessionProjection.tsx`
- `src-tauri/tests/timer_session_coordinator.rs`
- `src-tauri/tests/timer_recovery_regressions.rs`
- `src-tauri/migrations/0003_session_runtime.sql`
- `src-tauri/migrations/0004_timer_runtime_checkpoint.sql`
- `src-tauri/migrations/0005_pomodoro_boundary_effects.sql`
- `TODO.md`
- `STATUS.md`
- newest Milestone 3 `work-log/*.md`

Newest M3 evidence logs include:

- `work-log/2026-09-05-0835-chatgpt-m3-atomic-completion.md`;
- `work-log/2026-09-05-0836-chatgpt-m3-paused-time-taken.md`;
- `work-log/2026-09-05-0840-chatgpt-m3-typed-timer-events.md`;
- `work-log/2026-09-05-1149-chatgpt-m3-pomodoro-boundary-effects.md`.

## DURABLE M1 REFERENCES

- `work-log/2026-09-03-chatgpt-m1-physical-capability-results.md`
- `work-log/2026-09-03-chatgpt-autostart-restart-validation.md`
- `work-log/2026-09-03-chatgpt-floating-performance-results.md`
- `docs/M1_FLOATING_PERFORMANCE_MEASUREMENT.md`
