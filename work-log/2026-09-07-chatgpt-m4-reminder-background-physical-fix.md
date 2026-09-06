# M4 reminder background physical-failure fix

Date: 2026-09-07
Agent/tool: ChatGPT / GitHub connector
Milestone: 4 — Scheduling, recurrence, reminders, eligibility
Slice: physical installed-Windows due-reminder failure correction and Narro Windows identity correction

## Triggering physical evidence

The user tested the previously main-validated acceptance build from source SHA `438b28a36dfba58b35fa221557ff37d776453f23`, Windows main CI #257 / run `34059656511`, artifact `9997215512`.

Observed **FAIL**:

- a real persisted `Schedule Real Reminder Probe (+2 min)` produced no visible notification while Narro remained running in tray/background mode;
- fully exiting Narro (Exit or Task Manager) and relaunching caused the overdue notification to arrive immediately;
- repeated diagnostic-button clicks created multiple independent pending acceptance reminders, which appeared in sequence after restart;
- the installed app/tray/Task Manager surfaces did not show the expected canonical Narro logo.

The evidence bounded the reminder defect to the live background-delivery lifecycle: persistence and startup catch-up were proven to see/deliver the same pending row after a fresh process start.

## Source branch and scope

Implementation branch:

`ai/m4-reminder-background-physical-fix`

Base tracking main:

`170b622b712a6f931c94d3f16488e67f8145746b`

Implementation PR:

#62 — `M4: fix live reminder polling and Windows app identity`

Material source/config changes were limited to:

- `src-tauri/src/reminder_service.rs`;
- `src-tauri/src/reminder_acceptance.rs`;
- `package.json`;
- new `scripts/sync-tray-icon.mjs`;
- temporary `HANDOFF.md` slice tracking.

No schema/migration, recurrence, scheduling-domain, timer, notification-transport or Milestone 5 product UI changes were made.

## Reminder runtime correction

Previously the background reminder thread opened/configured one SQLite connection once and reused it for every 30-second poll for the full process lifetime.

The corrected path:

- validates at startup that the existing database can be opened/configured read-write;
- opens a fresh configured read/write SQLite connection for every immediate/30-second delivery cycle;
- preserves the same Rust-owned due query, active task/list recheck, Windows notification submission, and durable `fired_at` acknowledgment ordering;
- leaves failed submissions pending/retryable;
- retains the bounded 30-second cadence.

A file-backed regression now proves the physical-failure boundary: an initial cycle sees no reminder, an independent SQLite connection commits a due reminder afterward, and the next cycle opens fresh, sees it, submits it through the injected delivery seam and acknowledges it.

## Acceptance-harness repeat guard

The diagnostic acceptance module now rejects scheduling another probe while an existing Narro acceptance reminder remains pending. The lookup is limited to the reserved diagnostic list/task titles and active/non-terminal rows.

Tests prove:

- a second pending probe is rejected without adding list/task/reminder rows;
- a new probe is allowed after the prior diagnostic reminder is marked fired.

This prevents ambiguous physical retests from accumulating several independent probes through repeated clicks.

## Windows Narro identity correction

Canonical owner-supplied artwork remains:

`assets/branding/narro-logo-master.png`

Authoritative builds now run `prepare:icons` before the frontend production build. That command uses the locked Tauri CLI icon generator on the canonical master, including generation of Windows `icon.ico`, then `scripts/sync-tray-icon.mjs` copies generated `src-tauri/icons/64x64.png` to the runtime tray asset `src-tauri/icons/narro-tray-64.png`.

Thus executable/Task Manager packaging inputs and tray runtime identity are generated from the same Narro-owned master. Automated build success proves generation/packaging validity, not physical Windows icon appearance; icon appearance remains part of the next installed-build physical retest.

## Pre-CI discipline and first PR failure

Local project preflight: **NOT RUN** in the connector-only environment.

Initial exact PR head before formatting correction:

`d0e6fd304b23455dbba9cda1d394b1904de9406d`

Windows PR CI #258:

- run `34063408392`;
- job `101567874358`;
- conclusion: **FAIL**;
- frontend/config/date-formatting/icon-generation/tray-sync/frontend build before the failure: PASS;
- first failing command: `cargo fmt --check`;
- release/artifact: SKIPPED.

The CI log requested rustfmt-only line wrapping in the new reminder tests. Only those formatter changes were applied; no behavior or assertions changed. The failed run did not increment progress.

## Exact PR-head validation

Final validated PR head:

`46e637698f3b6cb7339e5b73205d0e5dcc9c493d`

Windows PR CI #260:

- run `34063610881`;
- job `101568451581`;
- conclusion: **SUCCESS**;
- Repository Preflight: PASS;
- Tauri Release: PASS;
- artifact upload: PASS;
- artifact ID `9998442377`;
- artifact name `narro-m1-runtime-harness-windows-x64`;
- digest `sha256:cdb700b20457ef265b6a216b54d89e75dfe358252c92000b01de87e484e91aad`.

Final exact-head semantic/diff review: PASS. Changed files were exactly the five expected files listed above. PR #62 had no comments/review threads requiring resolution.

## Guarded merge

PR #62 was squash-merged only with expected-head guard:

`46e637698f3b6cb7339e5b73205d0e5dcc9c493d`

Resulting main source/test SHA:

`c66558cdc3d3ab8f8ec0626c7897491625bb4ddd`

The `main` branch ref was verified to point exactly to that SHA before resulting-main validation was accepted.

## Resulting-main validation

Windows main CI #261:

- run `34064434528`;
- job `101570603570`;
- exact main SHA `c66558cdc3d3ab8f8ec0626c7897491625bb4ddd`;
- conclusion: **SUCCESS**;
- Repository Preflight: PASS;
- Tauri Release: PASS;
- artifact upload: PASS;
- artifact ID `9998653381`;
- artifact name `narro-m1-runtime-harness-windows-x64`;
- digest `sha256:864aa26b821c0e63d4d8fd7184004cd68bb8952f943febb738b1ef2394a87583`.

This is now the latest fully main-validated source/test baseline.

## Tracking state

`TODO.md` remains **13/15** for Milestone 4. Automated CI cannot prove the two remaining user-visible Windows reminder items after the physical failure correction.

The open top-level items remain:

- `Implement one-off local reminders.`
- `Add tray/background due-reminder processing while process is running.`

They may be checked only after the installed build from main CI #261 physically delivers exactly one newly scheduled real due reminder while Narro remains alive in tray/background mode.

## Exact physical retest

Use only:

- source SHA `c66558cdc3d3ab8f8ec0626c7897491625bb4ddd`;
- Windows main CI #261 / run `34064434528`;
- artifact `9998653381`;
- digest `sha256:864aa26b821c0e63d4d8fd7184004cd68bb8952f943febb738b1ef2394a87583`.

Procedure:

1. Extract artifact `9998653381` and install Narro using its included NSIS or MSI installer.
2. Launch that installed build. If old overdue diagnostic notifications from the previous failed build appear immediately at startup, let them finish; they are not the new acceptance observation.
3. Confirm the installed executable/Task Manager and tray surfaces now show the expected Narro identity; report any surface that still uses the wrong icon.
4. In Main, under `Windows Notification Diagnostics -> M4 Due-Reminder Acceptance`, click `Schedule Real Reminder Probe (+2 min)` exactly once. Do not repeatedly click the button.
5. Record the returned reminder ID, due local date/time and timezone. If the command instead reports that an older diagnostic probe is still pending, report that exact message rather than creating more probes.
6. Hide or close Main while leaving Narro running in tray/background mode. Do not Exit, kill, or restart Narro during the due-reminder observation.
7. At the displayed due minute, allow up to 30 seconds for the background poll.
8. PASS requires exactly one visible Windows notification with title `Task reminder` and body `Reminder acceptance probe - expected once` while the same Narro process remains alive.
9. Keep Narro running for at least another 60 seconds and confirm no second identical notification appears for that reminder.
10. Return PASS/FAIL plus reminder ID/due time and the tray/Task Manager icon observation.

Known limitation remains unchanged: delivery does not claim crash-proof exactly-once semantics across a crash after Windows accepts a notification but before `fired_at` is durably acknowledged. The retest intentionally avoids restart/crash during the observation.

## Exact continuation point

If physical retest PASSes:

- create a new immutable physical-acceptance work log recording artifact/source/reminder observation and icon observation;
- mark both remaining M4 reminder TODO items `[x]`;
- update `STATUS.md` and `HANDOFF.md`;
- only after repository reconciliation treat Milestone 4 as complete and move to Milestone 5.

If it FAILs:

- record the exact observed failure and whether the new icon identity passed independently;
- reopen only the evidence-backed failing source path on a new source branch;
- use normal exact-head PR CI, guarded merge, resulting-main CI and tracking reconciliation.
