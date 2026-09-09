# HANDOFF.md

This is the canonical zero-context continuation state for Narro. Start with `AI_START_HERE.md`, `AGENTS.md`, `ENGINEERING_QUALITY.md`, `AGENT_WORKFLOW.md`, this file, the active Milestone 5 section in `TODO.md`, relevant `STATUS.md`, `docs/UI_UX_SPEC.md`, `docs/PRODUCT_SPEC.md`, `docs/BEHAVIOR_MATRIX.md`, `docs/BLITZIT_HISTORY_RISK_INDEX.md`, and the newest relevant immutable `work-log/*.md` entries.

## CURRENT MILESTONE

**Milestone 5 — Design system and Main window product UI.**

- Milestones 1–4: COMPLETE / PASS.
- Milestone 5: ACTIVE / **17 of 28** top-level items validated.
- Milestones 6–10: NOT STARTED.

## CURRENT VALIDATED SOURCE BASELINE

Latest fully main-validated source/test SHA:

`2c4ec648490764cfdd5b0f793f9f68ed73657037`

Source tree:

`a1d562c3153fa6c0f169eaf9d587285e7141301d`

This is the squash-merged result of PR #89 — `M5: add EST and Time Taken editing`.

Validation evidence:

- final PR #89 head `b7e6a5d2dbf428888fc6fb2e05fc5fa53229d9ad`;
- Windows PR CI #341 / run `34368816102` / job `102524819883`: **SUCCESS**;
- expected-head guarded squash merge at `2026-09-09T15:43:09Z`;
- Windows main CI #342 / run `34372082553` / job `102535551447`: **SUCCESS**;
- main Repository Preflight, visual capture/upload, Tauri release and diagnostic artifact upload: **PASS**.

Detailed completed-slice evidence: `work-log/2026-09-09-1858-chatgpt-m5-task-metrics.md`.

Markdown-only tracking descendants do not replace the validated source/test baseline.

## ACTIVE IMPLEMENTATION

**M5 Main UI — Scheduling UI and recurrence editor.**

Active branch:

`m5-scheduling-recurrence-ui`

Branch base / main tracking tip when created:

`24a476408c9b8c0e3ab224f4c117acbcc7673c4a`

No implementation PR exists yet.

## USER-FACING PROGRESS

**`M-5/10 | 0/5 | 17/28`**

Current five checkpoints:

1. mandatory inspection + narrow scheduling/recurrence mutation and UX contract — **IN PROGRESS**;
2. authoritative scheduling/recurrence command/frontend implementation + deterministic static/Rust/visual coverage + semantic/diff review — PENDING;
3. exact PR-head Windows CI — PENDING;
4. final exact-head review + expected-head merge — PENDING;
5. resulting-main Windows CI + tracking reconciliation — PENDING.

Do not increment checkpoint 1 until the M4 scheduling/recurrence boundaries, current board/task presentation, product/UI/behavior specs and history-risk evidence are inspected and the narrow implementation contract is explicit.

## REQUIRED INSPECTION / SCOPE

Inspect before source changes:

- Milestone 4 scheduling domain/persistence boundaries for date-only versus local date-time schedules, official shortcuts, eligibility and effective planning lanes;
- recurrence rule model, parent/child materialization, Replace Existing Tasks and detachment semantics;
- current `ListBoard`, `TaskCard`, board read model and mutation command patterns;
- scheduling/recurrence sections of `docs/PRODUCT_SPEC.md`, `docs/UI_UX_SPEC.md` and `docs/BEHAVIOR_MATRIX.md`;
- `docs/BLITZIT_HISTORY_RISK_INDEX.md`, especially one-hour/wrong-day/timezone and duplicate-identity failure families.

The renderer must project authoritative scheduling/recurrence behavior rather than recreate classification or recurrence materialization rules in React.

## INVARIANTS THAT MUST NOT REGRESS

- date-only schedules remain calendar dates and never round-trip through UTC;
- local date-time schedules retain explicit Windows-local timezone semantics;
- Monday week boundaries, DST behavior and future-time eligibility remain authoritative;
- schedule mutations preserve task identity and cannot duplicate/alias tasks;
- recurrence materialization stays deterministic/idempotent and preserves validated parent/child, replace-existing and detachment behavior;
- persistence-first mutation remains the success boundary;
- a committed mutation plus failed board refresh is reported as committed and blocks unsafe retries;
- All Lists remains an aggregate read projection;
- tracked time/timer/session state is not rewritten by scheduling metadata edits;
- task-card actions/editors preserve reserved geometry and keyboard/focus accessibility;
- no subtasks, notes, destructive flows, list settings, search, Settings, Reports/session editing, Focus Panel/Floating Timer product UI, or later milestones are absorbed into this slice.

## NEXT AGENT ACTION

Complete checkpoint 1 by inspecting the authoritative M4 implementation and relevant specs/risk evidence. Record the exact scheduling/recurrence UI contract in this file, then implement the smallest persistence-first renderer-facing command and List Board/TaskCard editor surface that reuses those authoritative boundaries.

## USER ACTION REQUIRED

**None.**

## BLOCKERS / NOT RUN

- No product/user blocker is known.
- Local checkout/toolchain validation in this connector-only environment: **NOT RUN**.
