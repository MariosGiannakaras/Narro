# HANDOFF.md

This is the canonical zero-context continuation state for Narro. Start with `AI_START_HERE.md`, `AGENTS.md`, `ENGINEERING_QUALITY.md`, `AGENT_WORKFLOW.md`, this file, the active Milestone 4 section in `TODO.md`, relevant `STATUS.md`, `docs/BLITZIT_HISTORY_RISK_INDEX.md`, and the newest relevant immutable `work-log/*.md` entries.

## CURRENT MILESTONE

**Milestone 4 — Scheduling, recurrence, reminders, eligibility.**

- Milestones 1–3: COMPLETE / PASS.
- Milestone 4: ACTIVE / 13 of 15 top-level items validated.
- Milestones 5–10: NOT STARTED.

## ACTIVE WORK RECORD

- Latest completed source/test slice: **M4 physical due-reminder acceptance harness — COMPLETE / MAIN-VALIDATED**.
- Source implementation PR: **#58 — `M4: add due-reminder acceptance harness`**.
- Exact validated PR head: **`8f73abf919f7babcfba76c2dd17c73d7a4fd138f`**.
- Guarded squash-merge/resulting-main source SHA: **`438b28a36dfba58b35fa221557ff37d776453f23`**.
- Tracking reconciliation PR: **#59 — merged**.
- Current repository `main` tracking SHA after PR #59: **`927d9d2705a4c467fc0a311f0d536c3a32e44b01`**.
- Active source branch/PR: **None**.
- Pending source CI/main validation: **None**.
- Remaining M4 gate: **physical installed-Windows observation of one actual due reminder while Narro remains running in tray/background mode**.

Markdown-only tracking commits newer than `438b28a36dfba58b35fa221557ff37d776453f23` do not replace that validated source/test baseline.

## USER-FACING PROGRESS

**`M-4/10 | 6/6 | 13/15`**

Reminder-acceptance-harness checkpoints:

1. mandatory startup + confirm physical-acceptance path gap + risk review + branch start — COMPLETE;
2. implement narrow persisted-reminder acceptance probe + deterministic tests + candidate diff review — COMPLETE;
3. exact PR-head Windows CI success including repository preflight, Tauri release and artifact — COMPLETE;
4. final exact-head semantic/diff review — COMPLETE;
5. guarded merge with expected validated head — COMPLETE;
6. resulting-main Windows CI + tracking/work-log reconciliation + exact manual procedure/artifact identity — COMPLETE.

## VALIDATION EVIDENCE

### PR #58 exact-head validation

Initial PR head `6278197d4afcf59a1a592a9dfcde9aa15f9f04c5` failed Windows CI #254 / run `34056067473` / job `101548078178` only at `cargo fmt --check`. Frontend/config/date-formatting checks had passed; release/artifact steps were skipped. Only the exact rustfmt-required line wrapping was changed. This failed run did not increment progress.

Final exact validated PR head:

`8f73abf919f7babcfba76c2dd17c73d7a4fd138f`

Windows PR CI #256:

- run `34056230438`
- job `101548519396`
- conclusion: **SUCCESS**
- Repository Preflight: **PASS**
- Tauri Release: **PASS**
- artifact upload: **PASS**
- artifact ID `9996212916`
- digest `sha256:5eb8bcff58f8da58fa3aa8190d2159a351d205617bd7bc0641f7090a2e608d35`
- final exact-head semantic/diff review: **PASS**
- PR comments/reviews/review threads: **none**

PR #58 was squash-merged with expected-head guard `8f73abf919f7babcfba76c2dd17c73d7a4fd138f`, producing:

`438b28a36dfba58b35fa221557ff37d776453f23`

### Resulting-main validation

Windows main CI #257:

- run `34059656511`
- job `101557789155`
- exact main SHA `438b28a36dfba58b35fa221557ff37d776453f23`
- conclusion: **SUCCESS**
- Repository Preflight: **PASS**
- Tauri Release: **PASS**
- artifact upload: **PASS**
- artifact ID `9997215512`
- artifact name `narro-m1-runtime-harness-windows-x64`
- digest `sha256:d0192494bd8bdfca957109c28d969b1e6ea21c4a5a185393d6de08a9e8a1229a`

The artifact contains `narro.exe` plus generated NSIS/MSI installers. Use an installer for the physical notification acceptance so Windows observes the installed Narro identity.

## VALIDATED ACCEPTANCE-HARNESS CONTRACT

The harness is diagnostic-only and does not implement Milestone 5 scheduling UI.

- `src-tauri/src/reminder_acceptance.rs` creates one diagnostic list, one Today task and one real reminder in one SQLite transaction.
- Rust validates local date, local time, IANA timezone and strict DST resolution before writes.
- Tests prove the persisted reminder reaches the real `pending_due_reminders` boundary at its resolved instant.
- Forced reminder-insert failure rolls the list/task/reminder fixture back atomically.
- Invalid timezone is rejected before any rows are written.
- `schedule_reminder_acceptance_probe` does **not** call the notification API.
- The existing Rust-owned `reminder_service` remains the only path that can discover the due row, submit the Windows notification and acknowledge `fired_at`.
- The existing 30-second background polling cadence is unchanged.

Expected notification:

- title: `Task reminder`
- body: `Reminder acceptance probe - expected once`

## NEXT AGENT ACTION — BLOCKED ON PHYSICAL WINDOWS EVIDENCE

Remain inside Milestone 4. Do **not** start Milestone 5 yet.

The next action depends on the user's physical observation using the validated main artifact from CI #257:

1. If the physical check **PASSes**, create a new immutable work-log entry recording the returned evidence, mark both remaining M4 reminder TODO items `[x]`, update `STATUS.md` and `HANDOFF.md`, close Milestone 4 only after that reconciliation, and then proceed to Milestone 5.
2. If the physical check **FAILs**, record the exact observed defect and reopen only the narrow reminder source path required by that evidence; use a new source branch/PR with normal exact-head Windows CI discipline.

Do not infer visible notification success from CI and do not reopen PR #45 merely to collect manual evidence.

## USER ACTION REQUIRED

Use **main CI #257 / artifact `9997215512` / source SHA `438b28a36dfba58b35fa221557ff37d776453f23`**.

Physical acceptance procedure:

1. Download/extract artifact `9997215512` and install Narro using the included NSIS or MSI installer.
2. Launch the installed Narro build.
3. In Main, under **Windows Notification Diagnostics → M4 Due-Reminder Acceptance**, click **Schedule Real Reminder Probe (+2 min)** exactly once.
4. Record the displayed reminder ID, due local date/time and timezone. Do not click the probe again.
5. Hide or close Main, verify Narro remains running in the system tray, and do not quit/restart Narro during the test.
6. At the displayed due minute, allow the existing background poll up to 30 seconds to run.
7. Confirm exactly one visible Windows notification appears with title **Task reminder** and body **Reminder acceptance probe - expected once**.
8. Keep Narro running in tray/background for at least another 60 seconds and confirm no second identical notification appears.
9. Report **PASS** with the reminder ID/due time if the notification appeared once with no duplicate, or **FAIL** with the exact observed behavior.

Known limitation: reminder delivery does not claim crash-proof exactly-once semantics across the interval after Windows accepts a notification but before `fired_at` is durably acknowledged. The acceptance procedure intentionally avoids restart/crash during the observation.

## IMPORTANT INVARIANTS

- authoritative Rust/domain state and persistence-first mutations;
- stable task identities;
- date-only schedules never convert through UTC;
- strict IANA timezone/DST rules remain fail-closed;
- week starts Monday;
- reminder due evaluation remains Rust-owned and side-effect free until notification submission;
- reminder `fired_at` is written only after successful OS notification submission;
- failed reminder submission remains pending and retryable;
- acceptance probe must never directly submit a Windows notification;
- no renderer owns authoritative recurrence/reminder/timer state;
- async `main` recreation remains intact.
