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

- Latest completed source slice: **Windows locale/system 12/24-hour visible date/time formatting — COMPLETE / RECONCILED** after the tracking PR carrying this file is merged.
- Active source slice: **None**.
- Active implementation branch: **None**.
- Active implementation PR: **None**.
- Pending source CI/main validation: **None**.
- Latest fully main-validated source baseline: **`cadcf8b2d6d25d8cdd20652f11a426edbb21c91d`**.
- Next ordered unblocked source slice: **combined Milestone 4 scheduling/recurrence regression matrix — NOT STARTED**.
- Physical reminder acceptance remains independently pending: **visible due reminder while Narro remains in tray/background mode**.

Markdown-only reconciliation commits newer than the validated source SHA do not replace that source baseline.

## USER-FACING PROGRESS

**`M-4/10 | 6/6 | 11/15`** after this tracking reconciliation is merged.

Windows-locale formatting checkpoints:

1. mandatory startup + current visible-formatting/spec/dependency audit + branch start — COMPLETE;
2. shared locale-aware visible formatter + executable contract test + shared diagnostic projection + candidate diff review — COMPLETE;
3. exact PR-head Windows CI success including preflight, Tauri release and artifact — COMPLETE;
4. final exact-head semantic/diff review — COMPLETE;
5. guarded merge with expected validated head — COMPLETE;
6. resulting-main Windows CI plus TODO/STATUS/HANDOFF/new immutable work-log reconciliation — COMPLETE after the tracking PR carrying this file is merged.

## LATEST VALIDATED SOURCE BASELINE

`cadcf8b2d6d25d8cdd20652f11a426edbb21c91d`

### PR #54 exact-head validation

Exact validated PR head:

`73010ed9777d70123eee966c736ab1528173258c`

- Windows PR CI #248 / run `34032151067` / job `101483547592`: **SUCCESS**.
- Repository preflight: **PASS**.
- Tauri release build: **PASS**.
- Artifact upload: **PASS**.
- Artifact ID `9989152398`.
- Digest `sha256:5d40ce11808defb18602cd5aa8d18077d59986181841b876f7167ea18aa9849f`.
- Final exact-head semantic/diff review: **PASS**.
- Unresolved review threads/comments: **none**.

PR #54 was guarded-squash-merged with expected head `73010ed9777d70123eee966c736ab1528173258c` and produced:

`cadcf8b2d6d25d8cdd20652f11a426edbb21c91d`

### Resulting-main validation

- Windows main CI #249 / run `34038489647` / job `101500825881`: **SUCCESS** on exact source SHA `cadcf8b2d6d25d8cdd20652f11a426edbb21c91d`.
- Repository preflight: **PASS**.
- Tauri release build: **PASS**.
- Artifact upload: **PASS**.
- Artifact ID `9991119217`.
- Digest `sha256:769419c27a7c02624a6891ea692ecc218e42600aa4a2cbbe57e922b3b9c5e7e9`.

Evidence: `work-log/2026-09-06-chatgpt-m4-windows-locale-formatting-reconciliation.md`.

## VALIDATED WINDOWS-LOCALE FORMATTING CONTRACT

- `src/dateTimeFormat.ts` is the shared visible date/time formatting boundary for both webviews.
- Production/default formatting passes no explicit locale and no forced `hour12`/`hourCycle`, so WebView2/Intl follows the runtime Windows/system locale and hour convention.
- strict `YYYY-MM-DD` date-only values are parsed into local calendar components at local noon and never through UTC, preserving the intended calendar day.
- strict `HH:mm` local-clock values are validated before locale formatting.
- explicit locale injection is a deterministic test seam only; production/default calls use the runtime default locale.
- the executable contract test exercises the actual TypeScript formatter and covers date validity, leap day, invalid clocks, local date-only preservation, explicit 12-hour vs 24-hour locale behavior, and default-system resolution.
- repository preflight executes that formatter contract before the frontend build.
- the shared `TimerSessionProjection` diagnostic projection proves both current webviews consume the same formatting boundary without broad Milestone 5 product-UI work.
- no Rust/domain/schema/scheduling/timezone semantics changed in this slice.

## NEXT AGENT ACTION — NOT STARTED

Remain inside Milestone 4.

The next ordered unblocked source item is **the combined M4 scheduling/recurrence regression matrix**:

`Add tests for DST, Monday/week boundaries, timezone changes, repeated startup, missed days, future-time eligibility and weekend/date-only behavior.`

Before changing source:

1. run the mandatory repository startup sequence;
2. confirm no open implementation PR and confirm current main descends from validated source baseline `cadcf8b2d6d25d8cdd20652f11a426edbb21c91d`;
3. inspect existing tests first and add only missing behavior coverage rather than duplicating already validated tests;
4. consult `docs/BLITZIT_HISTORY_RISK_INDEX.md` for scheduling/restart/wrong-day reliability risks;
5. create one narrow source branch from current main and record a fresh small-slice denominator immediately;
6. validate exact PR head on authoritative Windows CI, perform final semantic review, guarded-merge, validate resulting main, then reconcile tracking.

After that item, the next open source item is the explicit scheduled-lane movement anti-duplication regression.

## IMPORTANT INVARIANTS

- authoritative Rust/domain state and persistence-first mutations;
- stable task identities;
- date-only schedules never convert through UTC;
- visible date/time formatting follows Windows/system locale by default without changing stored scheduling semantics;
- strict IANA timezone/DST rules remain fail-closed;
- week starts Monday;
- occurrence uniqueness remains the recurrence duplicate-prevention boundary;
- recurrence startup/resume/date-change orchestration remains Rust-owned, bounded and idempotent;
- reminder delivery submit-before-ack/retry semantics remain unchanged;
- no renderer owns authoritative recurrence/reminder/timer state;
- async `main` recreation remains intact.

## REMINDER ACCEPTANCE — INDEPENDENT PENDING EVIDENCE

PR #45 reminder source remains fully validated and reconciled. Physical installed-build observation of one actual due reminder in tray/background mode remains pending before the two reminder TODO parent items may be checked. Do not reopen PR #45 unless physical evidence reveals a defect.

## USER ACTION REQUIRED

None for the next scheduling/recurrence regression source slice. Physical installed-build visible due-reminder observation remains independently pending for reminder acceptance.
