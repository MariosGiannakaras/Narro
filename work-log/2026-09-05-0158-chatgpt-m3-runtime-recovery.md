# Milestone 3 durable runtime recovery

- Date/time: 2026-09-05 01:58 Europe/Athens
- Agent/tool: ChatGPT / GitHub connector
- Milestone: M3 timer/session engine
- Slice: durable timer runtime checkpoint/recovery

## Reachable commits

- PR #29 final source head: `a6f5f427cf489e8592a7cbf63b95f149cb7476a6`
- Squash merge on `main`: `3d4ab087682d3cf91a93f18aa5e1bd2cb23d2719`

## Material changes

- Added migration `0004_timer_runtime_checkpoint.sql` for one durable runtime checkpoint bound to the one open focus session.
- Added atomic persistence coordination between session ledger mutations and runtime checkpoint writes/removal.
- Added bounded progressing-state checkpoints plus explicit lifecycle checkpoints without per-second SQLite writes.
- Added deterministic recovery: Running -> Paused, OvertimeRunning -> OvertimePaused, Paused preserved, Time's Up preserved, Break/Pomodoro restored from durable elapsed state without charging process downtime.
- Recovery preserves the existing open-session identity and rejects missing/mismatched checkpoint state rather than guessing.
- Fractional runtime accounting remains millisecond-based while durable session rows remain integer seconds.

## Validation

- Local Rust build/tests: **NOT RUN** — available execution environment has no Rust toolchain and cannot clone GitHub over DNS.
- PR Windows CI #128 / run `33917954626`: **PASS**.
- Main Windows CI #129 / run `33919037186`: **PASS**.
- Automated regressions cover interrupted running, already-paused, Time's Up/overtime, Pomodoro break recovery, and missing-checkpoint corruption.
- Manual Windows validation: **NOT RUN / not required for this deterministic backend slice**.

## Tracking / limitations

- Core durable recovery is implemented and validated.
- The broader crash/restart TODO remains partially open until an explicit task-switch-adjacent recovery regression is added.
- Windows sleep/resume semantics remain a separate unresolved product/runtime decision.

## Continuation

Next correctness boundary: atomically coordinate live task completion with final timer/session persistence so Done cannot publish a completed task with lost/zero tracked time.
