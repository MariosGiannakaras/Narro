# Milestone 3 timer reliability boundaries — 2026-09-05

Agent/tool: ChatGPT using the connected GitHub repository as source of truth.

## Scope

This log records the Milestone 3 reliability work that moved durable timer recovery, atomic task completion, paused live Time Taken rebasing, and the highest-risk tracked-time regressions onto validated `main`.

## Reachable implementation commits and PRs

- PR #29 — durable timer runtime recovery — merge `3d4ab087682d3cf91a93f18aa5e1bd2cb23d2719`.
- PR #30 — atomic live task completion — merge `138fb5cc753dc520be731159be453fc6046aecb4`.
- PR #31 — paused live Time Taken rebasing and expanded recovery regressions — merge `c59e434e9f6b13b1837159f00e51fc96dd7f10a7`.
- Tracking update: `TODO.md` commit `c59d99501074045db8b3520a42101ebe21058fd1`.
- Handoff update: commit `6527fe020b19026b1359972389079218ae86a6f4`.
- Status update: commit `dba4f64824aa1c1c008029848aec4de1fe781664`.

PR #26 remains a historical closed/unmerged branch; its intended crash-recovery capability was superseded by PR #29.

## Material implementation changes

### Durable recovery

Migration `0004_timer_runtime_checkpoint.sql` adds a singleton runtime checkpoint bound by foreign key to the authoritative open session. Session-ledger changes and checkpoint changes use immediate SQLite transactions so the runtime cannot persist one side of a transition without the other.

`TimerRuntime::recover` restores interrupted work conservatively: Running becomes Paused, OvertimeRunning becomes OvertimePaused, Paused and Time's Up remain non-running, and break/Pomodoro recovery preserves stored elapsed break progress without charging process downtime. Recovery validates checkpoint/session identity and duration accounting rather than guessing through corrupt state.

### Atomic task completion

Product-level Done is `TimerRuntime::complete_task`. One SQLite transaction closes the final work session, removes the runtime checkpoint, marks the task completed, and compacts active task ranks. Idle is published only after that transaction commits. The lower-level `TimerRuntime::finish_task` remains a timer/session lifecycle primitive and must not be used by product/UI Done wiring.

A forced task-completion trigger regression proves a failed task mutation rolls back session close/checkpoint deletion and does not publish the candidate runtime. Time's Up completion coverage also proves decision-delay wall time is excluded.

### Paused manual Time Taken rebasing

Live Time Taken corrections are routed through `TimerRuntime::set_time_taken_while_paused` and are allowed only in Paused/OvertimePaused states. The runtime, open work session, and durable checkpoint binding are checked in one immediate transaction.

The correction updates `manual_time_adjustment_seconds` relative to persisted work. Raw timer elapsed and historical session durations remain monotonic. The generic metadata setter rejects an active focus session, preventing bypass of the runtime-aware boundary.

Regression coverage proves pause -> edit -> resume -> pause/Done does not snap back, double-count, or diverge; the correction also survives process recovery. A forced database failure leaves task metadata and runtime projection unchanged.

### Source-product tracked-time regressions

New/expanded coverage includes:

- exact 15-minute work -> pause -> recovery/wait -> resume -> additional pause cycle -> final work totaling exactly 30 minutes in durable session history and Time Taken;
- restart immediately after a task switch, preserving the closed first-task history while recovering exactly one open session for the new task;
- running, already-paused, Time's Up/overtime, Pomodoro break and corruption/missing-checkpoint recovery paths;
- real task-completion mutation after tracked work, preventing completion from exposing `00:00` Time Taken.

## Validation evidence

Local Rust validation: **NOT RUN**. The available execution environment does not provide the required local Rust toolchain; Windows GitHub Actions is the authoritative repository gate.

- PR #29 exact-head Windows CI #128 / run `33917954626`: **PASS**.
- PR #29 main Windows CI #129 / run `33919037186`: **PASS**.
- PR #30 exact-head Windows CI #138 / run `33927834736`: **PASS** including repository preflight, Rust fmt/check/Clippy/tests, performance harness, Tauri release build and artifact upload.
- PR #30 main Windows CI #139 / run `33928547004`: **PASS** including release build and artifact upload.
- PR #31 exact-head Windows CI #144 / run `33929261772`: **PASS** including repository preflight, Rust fmt/check/Clippy/tests, performance harness, Tauri release build and artifact upload.
- PR #31 main Windows CI #145 / run `33931153129`: **PASS** including repository preflight, Tauri release build and artifact upload.

Earlier PR #31 runs #140 and #143 stopped only on deterministic rustfmt diffs; those exact formatter changes were applied before successful #144.

## Tracking changes

`TODO.md` now marks complete:

- durable runtime checkpoint/recovery;
- atomic task completion/final session persistence;
- paused manual Time Taken runtime integration;
- exact 15m+15m pause/recovery regression;
- real completion-path tracked-time regression;
- crash/restart coverage including task-switch.

`STATUS.md` and `HANDOFF.md` now identify `c59e434e9f6b13b1837159f00e51fc96dd7f10a7` as the validated M3 implementation baseline and no longer describe recovery/atomic completion/manual rebasing as missing work.

## Remaining Milestone 3 work

1. Typed Tauri timer/session events consumed by both `main` and `focusSurface`, with renderer/window lifecycle strictly presentation-only.
2. Exactly-once Pomodoro automatic boundary notifications and the end-of-break prompt/resume workflow.
3. Long-duration/large-elapsed overflow safety coverage.
4. Windows sleep/resume no-data-loss behavior. Whether unattended sleep counts as work is still a product-policy decision and must not be invented.

## Exact continuation point

Active branch: `ai/m3-typed-timer-events`.

At the time of this log, the branch contains a typed `timer-session-changed` payload contract and an in-progress Rust-owned `TimerController`. The controller design intentionally caches the last Rust-observed persistence-coherent runtime projection so renderer reads cannot project/apply automatic Pomodoro or Time's Up boundaries. Automatic `advance` is responsible for applying a boundary and only then producing a revisioned event. Finish this controller, compile it through Windows CI, then wire Tauri broadcast plus shared revision-aware listeners in both frontend entry points.
