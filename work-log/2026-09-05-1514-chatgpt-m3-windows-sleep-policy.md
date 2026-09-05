# 2026-09-05 15:14 — Milestone 3 Windows sleep/resume policy completion

## Scope

Closed the final Milestone 3 correctness boundary: Windows system sleep/resume accounting and no-data-loss behavior for an active authoritative timer/session.

The user explicitly selected the safe default that unattended Windows sleep should **not** count as work, while also approving configurability. The implemented product model is therefore:

- global sleep-accounting preference: `exclude` by default, optionally `count`;
- per-task override: `inherit`, `exclude`, or `count`;
- effective policy is resolved when a focus session starts and persisted with that session;
- changing global/task preferences later does not retroactively change an already-active timer;
- Work↔Break replacements preserve the same task/session policy;
- Switch Task re-resolves the target task's policy.

No per-timer-instance UI override was added in M3. The typed backend capability is ready for the appropriate Preferences/task UI milestone.

## Source implementation

PR #35: `Add configurable Windows sleep timer accounting`

Exact validated PR head:

`a4582f5ea76737c8a5e01cb4e1c2cfb87a826159`

Squash merge on `main`:

`5eaf7f0eba1770112d41744377ea134ad5d41e33`

Key implementation points:

- preferences schema upgraded to v2 while legacy payloads remain readable;
- migration `0006_sleep_accounting_policy.sql` adds the persisted session policy and per-task override storage with safe `exclude` defaults;
- effective sleep policy is written atomically with a newly opened focus session;
- a sleep-aware logical timer clock isolates authoritative timer time from ambiguous Rust `Instant` suspend behavior;
- the existing persistent Windows HWND observer handles `WM_POWERBROADCAST`;
- `GetTickCount64` supplies the suspend interval used at resume;
- suspend performs authoritative catch-up to sleep entry followed by a forced durable checkpoint;
- `exclude` resumes without charging the unattended interval;
- `count` resumes by advancing authoritative logical time by the measured sleep interval;
- `count` catch-up reuses existing boundary stepping, so crossed EST/Pomodoro boundaries remain persistence-first and ordered;
- resume performs another durable checkpoint;
- process-restart downtime semantics remain unchanged and excluded from work;
- renderers never detect, measure, or supply authoritative sleep/timer timestamps.

## Regression coverage

Added deterministic coverage for:

- safe global `exclude` default;
- inherited global `count` policy;
- per-task override precedence;
- active-session policy stability after later preference/override edits;
- task switch re-resolving the target task policy;
- Work→Break→Work preserving the same task policy;
- logical clock `exclude` and `count` behavior across suspend/resume;
- duplicate power notifications;
- raw-clock / power-tick backwards safety;
- overflow safety;
- forced checkpoint behavior without semantic revision consumption;
- persisted session duration remaining frozen under `exclude`;
- persisted work/session duration advancing under `count`;
- compatibility with existing Pomodoro boundary stepping and durable effects.

## CI chronology

Early PR runs #186 and #191 stopped only at `cargo fmt --check` formatting differences. Those runs did not reach a semantic Rust failure and did not increment implementation progress.

Final PR validation:

- Windows CI #192
- run `33964109578`
- job `101301016918`
- exact source head `a4582f5ea76737c8a5e01cb4e1c2cfb87a826159`
- repository preflight: SUCCESS
- frontend/config: SUCCESS
- rustfmt: SUCCESS
- cargo check: SUCCESS
- Clippy: SUCCESS
- all Rust tests: SUCCESS
- performance harness: SUCCESS
- Tauri release build: SUCCESS
- artifact upload: SUCCESS
- artifact ID `9969024118`
- artifact name `narro-m1-runtime-harness-windows-x64`
- digest `sha256:834b247060eedfd426cf0566f97614fd357a326a25a4c4353547be0cb77fc2f6`

Main validation after squash merge:

- Windows CI #196
- run `33964738776`
- job `101302758803`
- source SHA `5eaf7f0eba1770112d41744377ea134ad5d41e33`
- repository preflight: SUCCESS
- Tauri release build: SUCCESS
- artifact upload: SUCCESS
- artifact ID `9969220078`
- artifact name `narro-m1-runtime-harness-windows-x64`
- digest `sha256:c2d1b2ce9cbaf12abdb45020a537b89081005c0f1f7305007cb97f812ee974d1`

## Milestone result

Milestone 3 Gate C is **PASS**.

All ordered M3 TODO items are now complete and the acceptance boundary is automated-validated on Windows. The validated source baseline is `5eaf7f0eba1770112d41744377ea134ad5d41e33`.

Tracking reconciliation begun immediately after validation:

- `TODO.md` commit `67f6ccd2d8e8e03e2e3303a2e1bfc7e70302a2e7` marks sleep/resume complete and records Gate C PASS;
- `STATUS.md` commit `7214fb0e8cfa7a79822a5472ee38e7d9a62e278d` moves the current phase to Milestone 4 and records PR/main CI evidence.

`HANDOFF.md` is the final zero-context reconciliation target for this completed slice.

## Progress

- General implementation after Gate C: **3/10 validated milestones**.
- This final M3 sleep/resume slice closes after the HANDOFF reconciliation checkpoint.

## Next ordered work

Proceed to Milestone 4 only after `HANDOFF.md` reflects this Gate C completion.

Milestone 4 scope is scheduling, recurrence, reminders and eligibility, including Monday-based week classification, date-only versus local-datetime semantics, future-time eligibility, recurrence idempotence/materialization, DST/timezone boundaries, due reminders, and anti-duplication scheduling regressions.

Do not skip to polished Milestone 5/6 UI unless the user explicitly changes roadmap order.