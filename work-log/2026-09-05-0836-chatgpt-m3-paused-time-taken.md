# Milestone 3 — Paused live Time Taken rebasing

Date: 2026-09-05
Agent: ChatGPT
Slice: paused manual Time Taken boundary + recovery regressions

## Reachable commits

- PR #31 final source head: `6f6cecf7e1a0731276a2c0b07300680fe00ac3ec`
- squash merge on `main`: `c59e434e9f6b13b1837159f00e51fc96dd7f10a7`

## Implementation

PR #31 added a runtime-aware live Time Taken persistence boundary. Generic `set_task_time_taken` now rejects a task that has an active Focus session; live edits must use `TimerRuntime::set_time_taken_while_paused` and are accepted only from Paused or OvertimePaused.

The live boundary verifies the current Work/Focus session, task binding, durable runtime checkpoint and checkpoint/session identity inside an SQLite `Immediate` transaction, then updates task Time Taken through the shared in-transaction metadata helper.

The architectural decision is deliberate: manual Time Taken correction does **not** rewrite historical session rows and does not mutate raw monotonic timer work elapsed. Instead, `tasks.manual_time_adjustment_seconds` rebases the durable effective task Time Taken. Future real work continues to increase raw session duration, so the effective value advances from the user-edited baseline without snap-back or double-counting.

## Regression coverage

Automated tests cover:

- live Time Taken edit rejected while Running;
- 15m raw work -> pause -> edit effective Time Taken to 10m -> resume -> 5m work -> Done gives 20m raw session history and 15m effective Time Taken;
- the same paused edit survives process recovery and future work;
- forced metadata-update failure rolls back and leaves runtime/session/task adjustment unchanged;
- repeated pause cycles plus recovery produce exactly 30m from 15m + 5m + 10m real work while paused waits are excluded;
- restart after task switch recovers only the new task/session identity and preserves the previous task's closed session.

The latter two regressions close the previously outstanding multi-pause/recovery and task-switch-adjacent recovery risk coverage.

## Validation

- Windows PR CI #144 / run `33929261772`: **PASS** including repository preflight, Rust checks/tests, release build and artifact upload.
- Windows `main` CI #145 / run `33931153129`: **PASS**.
- Local Rust toolchain in the execution environment: **NOT RUN / unavailable**. Windows CI was the authoritative compiler/Clippy/test gate.

## Durable API rule

- Active live edit: `TimerRuntime::set_time_taken_while_paused`.
- Generic metadata `set_task_time_taken` is for non-live tasks and rejects an active Focus session.
- User-facing Time Taken after a correction must use the effective task metadata value; raw timer/session elapsed remains the accounting ledger of actual tracked work.

## Continuation point

Preserve raw session monotonicity and the task-level adjustment model when wiring renderer controls. A paused edit must never be implemented by decreasing raw `TimerEngine.work_elapsed_ms` or rewriting historical Work session durations.
