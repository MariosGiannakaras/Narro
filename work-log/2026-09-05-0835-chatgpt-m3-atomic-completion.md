# Milestone 3 — Atomic task completion

Date: 2026-09-05
Agent: ChatGPT
Slice: product-level Done boundary / final timer persistence

## Reachable commits

- PR #30 source head: `4c2a4e5f79facce124ddd6c1a67c4f08918ccf60`
- squash merge on `main`: `138fb5cc753dc520be731159be453fc6046aecb4`

## Implementation

PR #30 made `TimerRuntime::complete_task` the product-level Done boundary. It snapshots authoritative timer state and performs task completion and the final timer/session persistence work through one SQLite `Immediate` transaction before publishing Idle.

The transaction verifies the live task/open Focus Work session/checkpoint binding, computes the final open-session duration from authoritative runtime work minus already-closed work, closes the session, clears the runtime checkpoint, completes the task, compacts task rank, then commits once. There is no fallible product mutation after that commit before the runtime is published as Idle.

Supporting changes introduced shared in-transaction helpers for task completion and timer-session close/checkpoint clear. Lower-level `TimerRuntime::finish_task` remains a timer/session lifecycle primitive only and must not be used as product/UI Done because it does not mark the task completed.

## Regression coverage

Automated tests cover:

- Done after 2.5 seconds: closed session duration 2 seconds, Time Taken 2 seconds, task completed, checkpoint removed;
- forced task-completion failure rolls back task/session/checkpoint changes and leaves runtime unchanged, followed by successful retry;
- Done from `Time's Up` excludes decision delay;
- 15m work -> pause 15m -> resume 15m -> Done = exactly 30m;
- 90s work -> 60s break -> 60s work -> Done produces Work 90 / Break 60 / Work 60 session history and Time Taken 150 seconds without double-counting.

## Validation

- Windows PR CI #138 / run `33927834736`: **PASS** including repository preflight, Rust checks/tests, release build and artifact upload.
- Windows `main` CI #139 / run `33928547004`: **PASS**.
- Local Rust toolchain in the execution environment: **NOT RUN / unavailable**. Windows CI was the authoritative compiler/Clippy/test gate.

## Durable decision

Task completion is persistence-first: product-visible Done cannot be published unless final tracked work and task completion commit together. This directly protects the historical completion-to-`00:00` tracked-time loss risk.

## Continuation point

Subsequent UI/product Done paths must call `TimerRuntime::complete_task`. Preserve the transaction and rollback semantics when adding Tauri commands or renderer integration.
