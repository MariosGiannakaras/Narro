# M4 reminder acceptance harness reconciliation

Date: 2026-09-06
Agent/tool: ChatGPT / GitHub connector
Milestone: 4 — Scheduling, recurrence, reminders, eligibility
Slice: diagnostic-only persisted due-reminder acceptance harness

## Why this slice was required

After the combined M4 scheduling/recurrence regression reconciliation, the only two open top-level M4 items were the one-off reminder and tray/background due-reminder items. Their source implementation was already validated through PR #43/#45, but repository policy correctly required physical installed-Windows evidence of one actual due reminder while Narro remained in tray/background mode.

A new zero-context inspection found that the then-current diagnostic build could not create a real persisted reminder through any Tauri/UI path. `Send Test Notification` submitted directly to the notification backend and therefore bypassed reminder persistence and the Rust-owned background dispatcher. Asking the user to perform the M4 physical acceptance would have required unsupported external SQLite manipulation.

The narrow solution was a diagnostic-only acceptance seam. Milestone 5 product scheduling UI was intentionally not started.

## Source branch and files

Implementation branch:

`ai/m4-reminder-acceptance-harness`

Base tracking main:

`6a824e761b54f1c069a7923aac2606abd8ecd2b9`

Material source changes:

- added `src-tauri/src/reminder_acceptance.rs`;
- added one Tauri command `schedule_reminder_acceptance_probe` in `src-tauri/src/lib.rs`;
- added one `Schedule Real Reminder Probe (+2 min)` control to the existing diagnostic `src/App.tsx` surface;
- temporary `HANDOFF.md` tracking changed while the source slice was active.

No reminder dispatcher, notification transport, schema, recurrence behavior, scheduling semantics or Milestone 5 product UI was changed.

## Acceptance-harness contract

The renderer computes a near-future local date/time and supplies its WebView2-resolved IANA timezone. Rust then:

- validates RFC3339 mutation time;
- strictly parses local `YYYY-MM-DD` and `HH:MM`;
- validates the IANA timezone identifier;
- resolves the local datetime with the existing strict DST gap/fold rules before writes;
- inserts one diagnostic active list, one Today task and one actual reminder in one SQLite transaction;
- reads the task/reminder back through typed decoders before commit.

The fixture writes directly to the established schema inside one transaction because the existing public create-list/create-task/create-reminder persistence functions each own their own transactions and cannot be safely nested. This is limited to the diagnostic acceptance module.

The acceptance command does **not** call the notification API. The existing `reminder_service` background dispatcher remains the only path that can discover the row through `pending_due_reminders`, submit `Task reminder`, and acknowledge `fired_at`.

Expected physical notification:

- title: `Task reminder`;
- body: `Reminder acceptance probe - expected once`.

Existing reminder polling cadence remains 30 seconds.

## Deterministic tests

The new Rust module tests prove:

1. a persisted probe is not due before its resolved instant and becomes visible to the real `pending_due_reminders` query exactly at the resolved instant;
2. a forced reminder insert failure rolls back the diagnostic list, task and reminder as one atomic unit;
3. an invalid timezone fails before any fixture rows are written.

The source-product reminder risk index was re-read before implementation. Historical late/duplicate/missed reminder and timezone failures remain relevant; this harness deliberately tests the real persisted/background path rather than the direct notification diagnostic.

## Pre-CI and first PR failure

Local project preflight: **NOT RUN** in the connector-only environment.

Candidate diff review before PR: PASS for scope/invariants. The initial PR head was:

`6278197d4afcf59a1a592a9dfcde9aa15f9f04c5`

Windows CI #254:

- run `34056067473`
- job `101548078178`
- conclusion: **FAIL**
- failing step: Repository Preflight -> `cargo fmt --check`
- frontend/config/date-formatting checks before Rust formatting: PASS
- release build: SKIPPED
- artifact: SKIPPED

The log showed exactly three rustfmt-only line-wrapping deltas: one in `lib.rs` and two in `reminder_acceptance.rs`. Only those formatting changes were applied. No behavior/assertion changed, and the failed run did not increment progress.

## Exact PR-head validation

PR #58:

`M4: add due-reminder acceptance harness`

Exact final validated PR head:

`8f73abf919f7babcfba76c2dd17c73d7a4fd138f`

Windows CI #256:

- run `34056230438`
- job `101548519396`
- conclusion: **SUCCESS**
- Repository Preflight: PASS
- Tauri Release: PASS
- artifact upload: PASS
- artifact ID `9996212916`
- artifact digest `sha256:5eb8bcff58f8da58fa3aa8190d2159a351d205617bd7bc0641f7090a2e608d35`

Final exact-head semantic/diff review: PASS.

PR #58 had no top-level comments, no review submissions and no inline review threads.

## Guarded merge

PR #58 was squash-merged only with expected-head guard set to the validated head:

`8f73abf919f7babcfba76c2dd17c73d7a4fd138f`

Resulting main source/test SHA:

`438b28a36dfba58b35fa221557ff37d776453f23`

The merge result and `main` branch ref were both checked against that exact SHA before main validation was accepted.

## Resulting-main validation

Windows CI #257:

- run `34059656511`
- job `101557789155`
- exact main SHA `438b28a36dfba58b35fa221557ff37d776453f23`
- conclusion: **SUCCESS**
- Repository Preflight: PASS
- Tauri Release: PASS
- artifact upload: PASS
- artifact ID `9997215512`
- artifact name `narro-m1-runtime-harness-windows-x64`
- artifact digest `sha256:d0192494bd8bdfca957109c28d969b1e6ea21c4a5a185393d6de08a9e8a1229a`

The CI workflow artifact contains:

- `src-tauri/target/release/narro.exe`;
- generated NSIS installer(s);
- generated MSI installer(s).

Installed-build identity is required for canonical physical Windows notification acceptance, so the user procedure uses an included installer rather than treating portable `narro.exe` execution as equivalent evidence.

## Tracking reconciliation

This Markdown-only reconciliation branch is:

`docs/m4-reminder-acceptance-reconciliation`

It is based directly on the validated source SHA `438b28a36dfba58b35fa221557ff37d776453f23`.

Tracking changes:

- `STATUS.md` advances the latest fully main-validated source/test baseline to `438b28a36dfba58b35fa221557ff37d776453f23` and records PR #58 / CI #256 / main CI #257 evidence;
- `HANDOFF.md` records the exact physical acceptance procedure and artifact identity;
- this new immutable work-log entry records the complete source/validation chain;
- `TODO.md` remains unchanged at **13/15** because automated CI cannot prove visible Windows notification delivery.

The source slice checkpoint counter becomes `6/6` after this reconciliation is merged. Markdown-only tracking commits do not replace the validated source/test baseline.

## Remaining blocker and exact physical procedure

Milestone 4 remains ACTIVE. Do not begin Milestone 5.

The only missing evidence is a physical installed-Windows observation using:

- source SHA `438b28a36dfba58b35fa221557ff37d776453f23`;
- Windows main CI #257 / run `34059656511`;
- artifact `9997215512`;
- digest `sha256:d0192494bd8bdfca957109c28d969b1e6ea21c4a5a185393d6de08a9e8a1229a`.

Procedure:

1. Extract artifact `9997215512` and install Narro with its NSIS or MSI installer.
2. Launch installed Narro.
3. In Main, under `Windows Notification Diagnostics -> M4 Due-Reminder Acceptance`, click `Schedule Real Reminder Probe (+2 min)` exactly once.
4. Record the displayed reminder ID, due local date/time and timezone; do not schedule a second probe.
5. Hide or close Main and verify Narro stays running in the system tray. Do not quit/restart during the test.
6. At the displayed due minute, allow up to 30 seconds for the background poll.
7. Verify exactly one visible notification appears with title `Task reminder` and body `Reminder acceptance probe - expected once`.
8. Keep Narro running in tray/background for at least another 60 seconds and verify no second identical notification appears.
9. Return PASS with reminder ID/due time, or FAIL with the exact observed behavior.

Known limitation retained from reminder delivery source: there is no claim of crash-proof exactly-once delivery across a process crash after Windows accepts a notification but before durable `fired_at` acknowledgment. The physical procedure intentionally does not restart/crash Narro.

## Exact continuation point

If the physical reminder check PASSes:

- create a new immutable physical-acceptance work log;
- mark both remaining M4 reminder top-level TODO items `[x]`;
- reconcile `STATUS.md` and `HANDOFF.md`;
- only then mark Milestone 4 complete and proceed to Milestone 5.

If it FAILs:

- record the exact failure evidence;
- reopen only the narrow evidence-backed reminder source path on a new implementation branch;
- use normal exact-head PR Windows CI, guarded merge and resulting-main validation.
