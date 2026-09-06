# HANDOFF.md

This is the canonical zero-context continuation state for Narro. Start with `AI_START_HERE.md`, `AGENTS.md`, `ENGINEERING_QUALITY.md`, `AGENT_WORKFLOW.md`, this file, the active Milestone 4 section in `TODO.md`, relevant `STATUS.md`, `docs/BLITZIT_HISTORY_RISK_INDEX.md`, and the newest relevant immutable `work-log/*.md` entries.

## CURRENT MILESTONE

**Milestone 4 — Scheduling, recurrence, reminders, eligibility.**

- Milestones 1–3: COMPLETE / PASS.
- Milestone 4: ACTIVE / 13 of 15 top-level items validated.
- Milestones 5–10: NOT STARTED.
- Do **not** begin Milestone 5 until the physical reminder retest passes and M4 is reconciled complete.

## CURRENT VALIDATED SOURCE BASELINE

Latest fully main-validated source/test SHA:

`c66558cdc3d3ab8f8ec0626c7897491625bb4ddd`

This is the guarded squash merge of PR #62 — `M4: fix live reminder polling and Windows app identity`.

Exact validated PR head:

`46e637698f3b6cb7339e5b73205d0e5dcc9c493d`

Windows PR CI #260:

- run `34063610881`;
- job `101568451581`;
- conclusion: SUCCESS;
- Repository Preflight: PASS;
- Tauri Release: PASS;
- artifact upload: PASS;
- artifact `9998442377`;
- digest `sha256:cdb700b20457ef265b6a216b54d89e75dfe358252c92000b01de87e484e91aad`.

PR #62 was squash-merged with expected-head guard `46e637698f3b6cb7339e5b73205d0e5dcc9c493d`, producing `c66558cdc3d3ab8f8ec0626c7897491625bb4ddd`.

Windows resulting-main CI #261:

- run `34064434528`;
- job `101570603570`;
- exact source SHA `c66558cdc3d3ab8f8ec0626c7897491625bb4ddd`;
- conclusion: SUCCESS;
- Repository Preflight: PASS;
- Tauri Release: PASS;
- artifact upload: PASS;
- artifact `9998653381`;
- artifact name `narro-m1-runtime-harness-windows-x64`;
- digest `sha256:864aa26b821c0e63d4d8fd7184004cd68bb8952f943febb738b1ef2394a87583`.

Markdown-only tracking descendants do not replace this validated source/test baseline.

## PHYSICAL FAILURE THAT PR #62 ADDRESSES

The user physically tested the earlier main CI #257 installed build and reported:

- a persisted real reminder did not notify while Narro remained running;
- quitting/killing and relaunching caused the overdue reminder to notify immediately;
- multiple diagnostic-button clicks created multiple independent pending reminders;
- tray / Task Manager did not show the expected Narro logo.

This is durable evidence; do not reinterpret the old build as passing.

## VALIDATED FIX CONTRACT

PR #62 changes only the bounded physical-Windows reliability path:

- `reminder_service` opens a fresh configured read/write SQLite connection for every immediate/30-second reminder cycle instead of retaining one connection for the process lifetime;
- a file-backed regression proves a later cycle sees and acknowledges a reminder inserted by an independent connection after an initial empty cycle;
- the diagnostic acceptance harness rejects a second probe while a prior diagnostic reminder is pending, preventing ambiguous multi-click retests;
- authoritative builds regenerate Tauri desktop icons from `assets/branding/narro-logo-master.png` and sync the tray image from the generated 64px Narro icon;
- reminder due query, task/list eligibility recheck, OS submission-before-`fired_at` acknowledgment ordering, retryability, 30-second cadence, schema, recurrence and scheduling semantics remain unchanged.

Initial PR CI #258 failed only `cargo fmt --check`; icon generation/tray sync/frontend build before that point passed. Only formatter-required wrapping was changed. No behavior/assertions changed.

## USER-FACING PROGRESS

**`M-4/10 | 6/6 | 13/15`**

Physical-failure-fix checkpoints:

1. mandatory startup + physical FAIL/root-cause reconstruction + branch start + regression plan — COMPLETE;
2. narrow reminder runtime fix + acceptance-probe repeat guard + Narro icon fix + deterministic tests + candidate diff review — COMPLETE;
3. exact PR-head Windows CI success including preflight, Tauri release and artifact — COMPLETE;
4. final exact-head semantic/diff review + no unresolved PR feedback — COMPLETE;
5. guarded merge with expected validated head — COMPLETE;
6. resulting-main Windows CI + durable tracking/work-log reconciliation + exact physical retest artifact/procedure — COMPLETE.

Milestone 4 remains 13/15 because manual Windows behavior cannot be inferred from CI.

## IMPORTANT INVARIANTS

- authoritative Rust/domain state and persistence-first mutations;
- stable task identities;
- date-only schedules never convert through UTC;
- strict IANA timezone/DST rules remain fail-closed;
- week starts Monday;
- reminder due evaluation remains Rust-owned and side-effect free until notification submission;
- `fired_at` is written only after successful OS notification submission;
- failed reminder submission remains pending and retryable;
- reminder delivery does not claim crash-proof exactly-once semantics across the post-submit/pre-ack crash window;
- reminder background cadence remains bounded at 30 seconds;
- acceptance probe never directly submits a Windows notification;
- renderer owns no authoritative recurrence/reminder/timer state;
- async `main` recreation remains intact;
- no M5 product UI work before M4 closes.

## NEXT AGENT ACTION — BLOCKED ON PHYSICAL WINDOWS EVIDENCE

Do not implement new M4 source work and do not start M5 unless the physical retest reports a failure that requires an evidence-backed correction.

When the user returns physical evidence:

- PASS: create a new immutable physical-acceptance work log, mark both remaining M4 reminder TODO items `[x]`, reconcile `STATUS.md` / `HANDOFF.md`, close Milestone 4, then proceed to Milestone 5;
- FAIL: record the exact failure (reminder delivery and icon identity independently), reopen only the failing source path on a new branch, and use exact-head PR CI -> guarded merge -> resulting-main CI -> tracking reconciliation.

## USER ACTION REQUIRED

Use only the newly validated installed Windows build from:

- source SHA `c66558cdc3d3ab8f8ec0626c7897491625bb4ddd`;
- main CI #261 / run `34064434528`;
- artifact `9998653381`;
- digest `sha256:864aa26b821c0e63d4d8fd7184004cd68bb8952f943febb738b1ef2394a87583`.

Physical retest:

1. Extract artifact `9998653381` and install Narro with its included NSIS or MSI installer.
2. Launch the installed build. If old overdue acceptance notifications from the earlier failed build arrive immediately, let them finish; they are not the new observation.
3. Check the Narro icon in both the system tray and Task Manager/executable surface and record PASS/FAIL for identity separately.
4. Under `Windows Notification Diagnostics -> M4 Due-Reminder Acceptance`, click `Schedule Real Reminder Probe (+2 min)` **once**.
5. Record reminder ID, due local date/time and timezone. If Narro instead reports an older pending diagnostic probe, return that exact message rather than repeatedly clicking.
6. Hide or close Main while leaving the same Narro process running in tray/background. Do not Exit, kill or restart it during the reminder observation.
7. At the due minute allow up to 30 seconds for the background poll.
8. Reminder PASS requires exactly one visible Windows notification with title `Task reminder` and body `Reminder acceptance probe - expected once` while the same process remains alive.
9. Keep Narro running for at least another 60 seconds and verify no second identical notification appears for that reminder.
10. Return PASS/FAIL with reminder ID/due time plus the tray/Task Manager icon result.

Detailed source/validation evidence is in `work-log/2026-09-07-chatgpt-m4-reminder-background-physical-fix.md`.
