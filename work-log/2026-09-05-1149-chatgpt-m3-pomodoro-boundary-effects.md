# M3 Pomodoro authoritative boundary effects and resume workflow

Date/time: 2026-09-05 11:49 Europe/Athens
Agent: ChatGPT
Milestone: 3 — Timer/session engine

## Result

PR #33 is merged and automated-validated on both the exact PR source head and the squash-merged `main` commit.

- exact final PR head: `6a3e7d2f2b5fa941e6389bea7e3ed3247987c817`
- PR #33 squash merge: `3ffbaca0c5df78833584de26270686f6cdadca16`
- PR Windows CI #181 / run `33953073811` / job `101271323980`: **SUCCESS**
- main Windows CI #182 / run `33955789396` / job `101278781399`: **SUCCESS**
- PR diagnostic artifact: `9965622577`, digest `sha256:92afddb899c01207dbcc54eab3cf5e80b062c736bbf05d9dce2f1bac14b04d71`
- main diagnostic artifact: `9966479878`, digest `sha256:65d1dc7d4bb5dca2e4cb55f2fdda866eff22403d0ac37feee988aad1735e94d7`

Local Rust validation: **NOT RUN** because the execution environment has no local Rust toolchain; Windows GitHub Actions remains the authoritative Rust/frontend/release gate.

## Material implementation

PR #33 changed the Pomodoro product path so a late Rust observation cannot collapse multiple automatic boundaries and silently omit the intermediate persisted Break session.

The Tauri timer service now advances to each due automatic boundary at its exact process-monotonic instant before advancing to the final observation time. Boundary wall timestamps are interpolated from the authoritative Rust observation wall time. A 2-second work / 3-second break Pomodoro first observed at 6 seconds therefore persists and reports, in order:

1. Work 2s closed -> Break opened;
2. Break 3s closed -> Work opened in paused state;
3. final non-boundary projection at the outer observation time.

This preserves Work/Break history even though the underlying timer engine can traverse Work -> Break -> Paused during one sufficiently late advance.

## Pomodoro notification effect boundary

Added durable local Pomodoro boundary effects and migration `0005_pomodoro_boundary_effects.sql`.

The authoritative local guarantee is one persisted boundary decision/claim per source session and effect kind. Break-start and break-finish decisions are distinct and ordered. Repeated observation/recovery does not create a second local decision for an already recorded boundary.

Windows notification submission reuses the existing `tauri-plugin-notification` integration and happens after persistence. Submission failure is log-only and cannot roll back an already committed timer/session transition.

This is intentionally **not** described as transactional exactly-once Windows toast delivery. The OS notification API is external to SQLite, so a process crash around the submission boundary cannot be atomically coordinated with the database. The durable Narro guarantee is the local authoritative decision/claim; OS delivery remains best-effort after commit.

## Durable awaiting-resume workflow

The timer/session payload now carries authoritative `awaitingResume` state for completed Pomodoro breaks.

- both `main` and `focusSurface` consume the same shared typed projection;
- a minimal shared prompt appears when the authoritative projection is paused Pomodoro and awaiting resume;
- Resume calls the existing Rust-owned `timer_resume` command;
- renderer recreation does not lose the prompt;
- process recovery preserves pending awaiting-resume intent;
- recovery does not replay an already claimed Pomodoro notification decision;
- leaving paused Pomodoro, including successful Resume, clears the service recovery fallback.

The final recovery implementation detects pending awaiting-resume intent from the persisted database state before `TimerController::recover` normalizes the runtime checkpoint, then carries that recovery-only fallback in `TimerService` until the authoritative projection leaves paused Pomodoro.

## Validation history

The final exact-head CI #181 passed:

- repository configuration checks: **PASS**
- TypeScript/Vite frontend build: **PASS**
- `cargo fmt --check`: **PASS**
- `cargo check --locked`: **PASS**
- Clippy all targets/features with `-D warnings`: **PASS**
- Rust tests: **PASS**, 127 tests
- performance harness: **PASS**
- Tauri release build: **PASS**
- diagnostic artifact upload: **PASS**

The squash merge then triggered main CI #182, which passed the same preflight, release build and artifact upload gates on merge SHA `3ffbaca0c5df78833584de26270686f6cdadca16`.

Two deterministic CI failures immediately before the final green head were fixed rather than rerun unchanged:

- CI #179 exposed only two `rustfmt` layout diffs in `timer_service.rs`;
- CI #180 compiled and passed Clippy, with 126/127 Rust tests passing. The sole failure was the recovery test using a fixed 12:00Z fixture while production `recover()` correctly used an earlier real wall clock. A test-only `recover_at(...)` seam was added; production `recover()` still uses `Utc::now()` and no timestamp invariant was relaxed.

## Material files/components

- `src-tauri/src/timer_service.rs`
- `src-tauri/src/domain/timer_events.rs`
- `src-tauri/src/persistence/pomodoro_effects.rs`
- `src-tauri/src/persistence/mod.rs`
- `src-tauri/src/notifications/mod.rs`
- `src-tauri/migrations/0005_pomodoro_boundary_effects.sql`
- `src/timerSessionApi.ts`
- `src/TimerSessionProjection.tsx`

## Tracking reconciliation

After main CI #182 passed:

- `TODO.md`: Pomodoro automatic notification and end-of-break prompt/resume items changed to `[x]`; commit `dd7307e5b3da0498f8b6545b706bcd2fec370b7d`.
- `STATUS.md`: validated source baseline advanced to PR #33 merge `3ffbaca0c5df78833584de26270686f6cdadca16`, PR/main CI evidence added, Pomodoro guarantee boundary documented, remaining M3 list reduced to overflow safety + Windows sleep/resume; commit `78083b91fdaa8e0921457fca9459a1eaf7aad167`.
- `HANDOFF.md`: validated baseline and API/ownership rules advanced through PR #33; next source slice changed to large-elapsed safety; commit `11114496d0e810e97210562bea74f96a6ec30263`.

These are Markdown-only tracking commits and do not change the validated source SHA.

## Remaining M3 boundaries / exact continuation point

Do not start Milestone 4 or polished UI.

Next source slice: long-duration/large-elapsed safety. Add controlled-time regressions and checked arithmetic around timer/session elapsed math, automatic-boundary target calculation, wall-time interpolation, persisted duration conversion and revision progression. Fail safely rather than silently saturating/falsifying tracked time.

Windows sleep/resume remains a separate unresolved M3 boundary. Establish no-data-loss behavior, but do **not** invent whether unattended sleep counts as work; that accounting policy still requires an explicit product decision.
