# M4 scheduling/recurrence regression reconciliation

Date: 2026-09-06
Agent: ChatGPT
Milestone: 4 — Scheduling, recurrence, reminders, eligibility
Slice: combined scheduling/recurrence regression matrix plus reconciliation of existing scheduled-lane anti-duplication coverage

## Validated source/test identity

- Implementation PR: #56 — `M4: complete scheduling regression matrix coverage`
- Exact validated PR head: `0a632c0ccb0a6df4f617807069c5b04671631153`
- Guarded squash-merge source/test SHA: `9ece00dc1c2e2d06eb64fc3b1fe88a08954ad434`
- This reconciliation is Markdown-only; it does not replace that validated source/test baseline.

## Scope and test inventory decision

The top-level Milestone 4 item requires regression coverage for DST, Monday/week boundaries, timezone changes, repeated startup, missed days, future-time eligibility and weekend/date-only behavior.

Before adding source, existing tests were inspected rather than duplicated. Current repository coverage already proved:

- Monday-based week classification across all weekdays and Sunday -> Monday rollover;
- strict IANA timezone resolution;
- DST gap/fold local datetimes fail closed;
- timed schedules retain the represented instant across display-timezone changes;
- date-only schedules remain local-calendar values across timezone changes;
- future-timed Today tasks remain focus-ineligible until the due instant;
- recurrence first startup avoids arbitrary historical backfill;
- repeated startup/same-day passes remain idempotent;
- same-week local-date changes remain idempotent;
- missed weeks catch up in Monday order without duplicate occurrences;
- timed recurrence resolves current local date in the rule's own timezone.

The missing behavior was the persisted weekend/date-only integration boundary. PR #56 therefore added only `src-tauri/tests/scheduling_weekend_date_only.rs` and did not modify production behavior.

## Added regression behavior

The new integration test proves:

- a persisted Sunday `DateOnly` schedule retains exactly `2026-09-13`;
- no local-time or timezone fields are attached to that date-only schedule;
- at one absolute instant, display-timezone changes may legitimately change Today vs This Week projection without reinterpreting or mutating the stored calendar date;
- Saturday -> Sunday -> Monday projection remains This Week -> Today -> overdue Today under the existing Monday-week rules;
- task identity remains singular across the projection-only boundary.

No Rust production/domain/schema/scheduling/recurrence/renderer behavior changed.

## Pre-final CI failures and corrective evidence

Two predecessor PR heads failed only `cargo fmt --check` inside repository preflight:

- Windows CI #250 / run `34041971123` / job `101510262188`: FAIL at Rust formatting for the new test; no release build or artifact was accepted.
- Windows CI #251 / run `34042122909` / job `101510664118`: FAIL at the remaining Rust formatting delta; no release build or artifact was accepted.

Only the exact formatter-required line wrapping was changed after each failure. Assertions and behavior were unchanged. Failed runs did not increment progress.

## PR-head Windows evidence

Windows CI #252:

- run `34042286755`
- job `101511100987`
- exact PR head `0a632c0ccb0a6df4f617807069c5b04671631153`
- conclusion: SUCCESS
- Repository preflight: PASS
- Tauri release build: PASS
- artifact upload: PASS
- artifact ID `9992229943`
- digest `sha256:c649584b0f2b24c14deb231f87b509057efe5d7209ab43632704af5ad1ef0912`

Final exact-head semantic/diff review was PASS. The PR contained only the focused integration regression plus temporary HANDOFF tracking; no production behavior change was present. No unresolved PR comments or review threads existed.

## Guarded merge

PR #56 was squash-merged only after re-reading its exact head and supplying expected head:

`0a632c0ccb0a6df4f617807069c5b04671631153`

Resulting main source/test SHA:

`9ece00dc1c2e2d06eb64fc3b1fe88a08954ad434`

## Resulting-main Windows evidence

Windows CI #253:

- run `34048631067`
- job `101528105468`
- exact main source/test SHA `9ece00dc1c2e2d06eb64fc3b1fe88a08954ad434`
- conclusion: SUCCESS
- Repository preflight: PASS
- Tauri release build: PASS
- artifact upload: PASS
- artifact ID `9994050581`
- digest `sha256:59ecfea5477108de7bb1a754680df36bad3830650e5f7c3dca17a86545f52a70`

Repository preflight runs `cargo test --manifest-path src-tauri/Cargo.toml --all-targets --locked`, so both new and existing Rust integration regressions were exercised on the validated main SHA.

## Existing scheduled-lane anti-duplication regression

During reconciliation, the separate top-level M4 item `Add regression tests ensuring moving a scheduled task between lanes cannot duplicate/triplicate it.` was checked against repository reality before creating redundant code.

`src-tauri/tests/scheduled_lane_move_regression.rs` already implements this exact reliability boundary. It was introduced by commit:

`16bb8b3e2fc2ac44c23c31268ad92bf1cdf8b7a3`

The regression executes 32 repeated reorder + Backlog -> Today -> Backlog cycles for a scheduled task and asserts throughout that:

- the scheduled task retains the same task identity;
- schedule kind/date/time/timezone are preserved;
- the scheduled task occupies exactly one active bucket at a time;
- the complete task set remains exactly three stable identities;
- persisted task row count remains exactly three;
- exactly one stored row has the scheduled identity and schedule fields.

This test passed again through PR CI #252 and resulting-main CI #253. No duplicate M4-only test was added merely to satisfy later roadmap wording.

## Tracking reconciliation

After the tracking PR carrying this log is merged:

- `TODO.md` marks the combined scheduling/recurrence regression item `[x]`;
- `TODO.md` marks the scheduled-lane anti-duplication regression item `[x]` based on the existing test and fresh main-CI revalidation;
- active Milestone 4 top-level progress becomes `13/15`;
- `STATUS.md` advances the fully main-validated source/test baseline to `9ece00dc1c2e2d06eb64fc3b1fe88a08954ad434` and records PR/main CI evidence;
- `HANDOFF.md` records that no further unblocked M4 source work remains;
- compact progress becomes `M-4/10 | 6/6 | 13/15`.

## Remaining Milestone 4 blocker

The only two unchecked top-level M4 items are:

- `Implement one-off local reminders.`
- `Add tray/background due-reminder processing while process is running.`

Their source implementations are already validated through PR #43/#45. They remain open solely because the repository requires physical installed-Windows evidence that one actual due reminder becomes visibly delivered while Narro remains in tray/background mode. Automated CI cannot establish visible OS notification acceptance.

PR #45 remains the authoritative reminder-delivery source evidence. Do not reopen it merely to collect manual evidence. If the physical observation fails, record the exact defect and reopen only the evidence-backed reminder path.

The newest fully validated main build is tied to source/test SHA `9ece00dc1c2e2d06eb64fc3b1fe88a08954ad434`, Windows CI #253 artifact `9994050581`, digest `sha256:59ecfea5477108de7bb1a754680df36bad3830650e5f7c3dca17a86545f52a70`.

## Exact continuation point

Remain in Milestone 4. Do not begin Milestone 5 while the two reminder items remain open.

Next evidence required is the user's physical Windows observation of one actual due one-off reminder with Narro in tray/background mode. On PASS, record that evidence in a new immutable work log, close both reminder TODO items, reconcile M4 completion, and only then proceed to the next ordered milestone. On FAIL, fix only the observed reminder defect under normal branch/PR/Windows-CI discipline.
