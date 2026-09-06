# HANDOFF.md

This is the canonical zero-context continuation state for Narro. Start with `AI_START_HERE.md`, `AGENTS.md`, `ENGINEERING_QUALITY.md`, `AGENT_WORKFLOW.md`, this file, the active Milestone 4 section in `TODO.md`, relevant `STATUS.md`, `docs/BLITZIT_HISTORY_RISK_INDEX.md`, `docs/PRODUCT_SPEC.md`, and the newest relevant immutable `work-log/*.md` entries.

## CURRENT MILESTONE

**Milestone 4 — Scheduling, recurrence, reminders, eligibility.**

- Milestone 1 / Gate A: COMPLETE / PASS.
- Milestone 2 / Gate B: COMPLETE / PASS.
- Milestone 3 / Gate C: COMPLETE / PASS.
- Milestone 4: ACTIVE / PARTIALLY IMPLEMENTED.
- Milestones 5–10: NOT STARTED.

## ACTIVE WORK RECORD

- Latest completed source/test slice: **combined M4 scheduling/recurrence regression matrix — COMPLETE / MAIN-VALIDATED / RECONCILED after the tracking PR carrying this file is merged**.
- Active source slice: **None**.
- Active implementation branch: **None after this tracking reconciliation merges**.
- Active implementation PR: **None after this tracking reconciliation merges**.
- Latest fully main-validated source/test baseline: **`9ece00dc1c2e2d06eb64fc3b1fe88a08954ad434`**.
- Pending source CI/main validation: **None**.
- Remaining unblocked M4 source work: **None**.
- Remaining M4 completion gate: **physical installed-Windows observation of one actual due one-off reminder while Narro remains in tray/background mode**.

Markdown-only reconciliation commits newer than the validated source/test SHA do not replace that baseline.

## USER-FACING PROGRESS

**`M-4/10 | 6/6 | 13/15`** after this tracking reconciliation is merged.

Regression-matrix checkpoints:

1. mandatory startup + current risk/test inventory + branch start + fresh denominator — COMPLETE;
2. add only missing scheduling/recurrence regressions + candidate diff review — COMPLETE;
3. exact PR-head Windows CI success including preflight, Tauri release and artifact — COMPLETE;
4. final exact-head semantic/diff review — COMPLETE;
5. guarded merge with expected validated head — COMPLETE;
6. resulting-main Windows CI plus TODO/STATUS/HANDOFF/new immutable work-log reconciliation — COMPLETE after this tracking reconciliation is merged.

## PR #56 EXACT-HEAD VALIDATION

Exact validated PR head:

`0a632c0ccb0a6df4f617807069c5b04671631153`

- Windows PR CI #252 / run `34042286755` / job `101511100987`: **SUCCESS**.
- Repository preflight: **PASS**.
- Tauri release build: **PASS**.
- Artifact upload: **PASS**.
- Artifact ID `9992229943`.
- Digest `sha256:c649584b0f2b24c14deb231f87b509057efe5d7209ab43632704af5ad1ef0912`.
- Final exact-head semantic/diff review: **PASS**.
- Unresolved review threads/comments: **none**.

PR #56 was guarded-squash-merged with expected head `0a632c0ccb0a6df4f617807069c5b04671631153` and produced:

`9ece00dc1c2e2d06eb64fc3b1fe88a08954ad434`

## RESULTING-MAIN VALIDATION

- Windows main CI #253 / run `34048631067` / job `101528105468`: **SUCCESS** on exact source/test SHA `9ece00dc1c2e2d06eb64fc3b1fe88a08954ad434`.
- Repository preflight: **PASS**.
- Tauri release build: **PASS**.
- Artifact upload: **PASS**.
- Artifact ID `9994050581`.
- Digest `sha256:59ecfea5477108de7bb1a754680df36bad3830650e5f7c3dca17a86545f52a70`.

Evidence: `work-log/2026-09-06-chatgpt-m4-scheduling-regression-reconciliation.md` after this tracking PR merges.

## VALIDATED REGRESSION COVERAGE

The combined M4 scheduling/recurrence regression requirement is covered by current tests for:

- Monday/week classification and Sunday -> Monday rollover;
- strict IANA timezone handling and fail-closed DST gap/fold local datetimes;
- display-timezone changes for timed schedules without changing the represented instant;
- date-only timezone stability without UTC reinterpretation;
- future-timed Today focus eligibility;
- recurrence first startup without arbitrary historical backfill;
- repeated startup/same-week date-change idempotence;
- missed-week catch-up without duplicate occurrences;
- recurrence rule-local timezone date resolution;
- persisted weekend/date-only behavior added by PR #56.

The separate scheduled-lane anti-duplication requirement was already implemented in `src-tauri/tests/scheduled_lane_move_regression.rs`, introduced by commit `16bb8b3e2fc2ac44c23c31268ad92bf1cdf8b7a3`. Its 32 repeated reorder/move cycles assert stable task IDs, exact task-row count, preserved schedule fields and one-bucket-at-a-time membership. Repository preflight runs `cargo test --all-targets --locked`, so this existing regression passed again in PR CI #252 and main CI #253. Do not add a duplicate test merely to satisfy later milestone wording.

## NEXT AGENT ACTION — BLOCKED ON PHYSICAL REMINDER ACCEPTANCE

Remain inside Milestone 4. Do **not** start Milestone 5 yet.

No further unblocked source work remains in M4. The next action depends on the physical reminder observation:

1. obtain/record the user's installed-Windows observation of one actual due reminder while Narro remains in tray/background mode;
2. if PASS, create a new immutable work-log entry for that physical evidence, mark both remaining reminder top-level TODO items `[x]`, reconcile `STATUS.md`/`HANDOFF.md`, and only then mark Milestone 4 complete and proceed to the next ordered milestone;
3. if FAIL, record the exact observed defect and reopen only the reminder source path necessary to fix the evidence-backed failure, with normal branch/PR/exact-head Windows CI discipline.

Do not reopen PR #45 merely to collect physical evidence.

## REMINDER ACCEPTANCE — SOURCE ALREADY VALIDATED

Reminder source implementation remains validated through PR #43/#45. PR #45 evidence:

- exact validated PR head `61e7a473917cc3ae189228af63f3969f5fac361a`;
- Windows PR CI #226 / run `33987769236` / job `101364389957`: **SUCCESS**;
- PR artifact `9975828913`, digest `sha256:5efad294c22a6cdc936830f87495ad014393b1c992271fae5445ee7e94624b2f`;
- guarded merge source SHA `cd30ffafbe3e9cb0431f4bc8230c095451a106ca`;
- resulting-main CI #227 / run `33988613427` / job `101366662297`: **SUCCESS**;
- main artifact `9976084645`, digest `sha256:31bd024a7f4da25191582a0cb0812df53d8ba20aa31abcd6dbe39e0d492d5550`.

The current latest fully validated main build is newer: source/test SHA `9ece00dc1c2e2d06eb64fc3b1fe88a08954ad434`, CI #253 artifact `9994050581`, digest `sha256:59ecfea5477108de7bb1a754680df36bad3830650e5f7c3dca17a86545f52a70`.

Automated CI does not prove visible OS notification delivery. The two reminder TODO items remain open until physical evidence is recorded.

## IMPORTANT INVARIANTS

- authoritative Rust/domain state and persistence-first mutations;
- stable task identities;
- date-only schedules never convert through UTC;
- visible date/time formatting follows Windows/system locale by default without changing stored scheduling semantics;
- strict IANA timezone/DST rules remain fail-closed;
- week starts Monday;
- occurrence uniqueness remains the recurrence duplicate-prevention boundary;
- recurrence startup/resume/date-change orchestration remains Rust-owned, bounded and idempotent;
- reminder delivery remains submit-before-ack and failures remain retryable;
- no renderer owns authoritative recurrence/reminder/timer state;
- scheduling/move operations preserve task identity count;
- async `main` recreation remains intact.

## USER ACTION REQUIRED

**Physical installed-Windows reminder acceptance is required to complete Milestone 4.**

Observe one actual due one-off reminder while Narro remains running in tray/background mode. Record whether the Windows notification becomes visibly delivered at/after its due time and whether any unexpected duplicate notification appears. Use a build whose identity can be tied to the validated source; the newest validated main build is `9ece00dc1c2e2d06eb64fc3b1fe88a08954ad434` / Windows CI #253 / artifact `9994050581`.
