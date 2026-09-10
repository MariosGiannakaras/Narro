# HANDOFF.md

This is the canonical zero-context continuation state for Narro. Start with `AI_START_HERE.md`, `AGENTS.md`, `ENGINEERING_QUALITY.md`, `AGENT_WORKFLOW.md`, this file, the active Milestone 5 section in `TODO.md`, relevant `STATUS.md`, `docs/UI_UX_SPEC.md`, `docs/PRODUCT_SPEC.md`, `docs/BEHAVIOR_MATRIX.md`, `docs/BLITZIT_HISTORY_RISK_INDEX.md` when source-product reliability risks are relevant, and the newest relevant immutable `work-log/*.md` entries.

## CURRENT MILESTONE

**Milestone 5 — Design system and Main window product UI.**

- Milestones 1–4: COMPLETE / PASS.
- Milestone 5: ACTIVE / **18 of 28** top-level items validated.
- Milestones 6–10: NOT STARTED.

## CURRENT VALIDATED SOURCE BASELINE

Latest fully main-validated source/test SHA:

`64b7cc8cc79b3991a7407c2838b60f923c63dc75`

Source tree:

`537390a65e7cec0343f01741db7c110bf38377a6`

This is the expected-head guarded merge of PR #90 — `M5: add scheduling and recurrence editor`. PR Windows CI #353 and resulting-main Windows CI #354 are both **SUCCESS**.

Detailed immutable evidence:

`work-log/2026-09-10-1105-chatgpt-m5-scheduling-recurrence-ui.md`

Markdown-only tracking descendants do not replace this validated source/test baseline.

## ACTIVE IMPLEMENTATION

**M5 Main UI — Subtasks UI.**

Active branch:

`m5-subtasks-ui`

Branch base / main tracking tip at slice start:

`1c4f14500265df9376384b5c608f7147e851e099`

No implementation PR exists yet for this slice.

## USER-FACING PROGRESS

**`M-5/10 | 0/5 | 18/28`**

Current five checkpoints:

1. mandatory inspection + narrow subtask mutation/read/UX contract — **IN PROGRESS**;
2. authoritative subtask command/frontend implementation + deterministic Rust/static/visual coverage + semantic/diff review — PENDING;
3. exact PR-head Windows CI — PENDING;
4. final exact-head review + expected-head merge — PENDING;
5. resulting-main Windows CI + tracking/work-log reconciliation — PENDING.

## CHECKPOINT 1 — REQUIRED INSPECTION

Before source changes, reconstruct the exact existing contracts for:

- Milestone 2 subtask domain model, persistence APIs, stable identity/order/completion behavior and integration tests;
- parent-task active/completed/archived restrictions for subtask mutation;
- current List Board / TaskCard task-card state model, especially `subtasks-expanded` fixture evidence;
- existing board mutation locks for reorder, title editing, EST/Time Taken editing and scheduling;
- relevant Subtasks behavior in `docs/PRODUCT_SPEC.md`, `docs/UI_UX_SPEC.md`, and `docs/BEHAVIOR_MATRIX.md`;
- relevant source-product reliability risks if subtask operations intersect task/subtask identity, ordering, history or renderer authority.

Checkpoint 1 must produce a narrow implementation contract before any production mutation/UI code is added.

## SLICE BOUNDARY

Implement only **Subtasks UI** for the Main-window List Board/task-card surface.

Expected direction, subject to repository/spec evidence from checkpoint 1:

- project authoritative persisted subtasks rather than renderer-owned copies;
- create/edit/complete/reorder/delete only through Rust/persistence boundaries;
- preserve parent task identity and stable subtask identities;
- preserve deterministic persisted ordering and persistence-first success;
- obey existing parent active/completed/archived mutation restrictions;
- integrate expanded/collapsed subtask state without changing unrelated task-card geometry or creating hover/focus layout shift;
- lock conflicting task-card/board interactions while a subtask mutation/editor is active where necessary;
- refresh from authoritative board/subtask state after committed mutations and reuse committed-but-refresh-failed safety semantics;
- provide keyboard/focus-visible equivalents for pointer interactions;
- add deterministic Rust/static/Windows visual evidence before PR validation.

Do not absorb rich notes, URL activation, destructive list/task flows, list settings, search, archives, theme settings, Reports, Focus Panel/Floating Timer product UI, or later milestones.

## INVARIANTS THAT MUST NOT REGRESS

- authoritative Rust/domain/persistence state and persistence-first mutation semantics remain authoritative;
- stable task identities and stable subtask identities are mandatory;
- subtask create/reorder/delete must not alias, duplicate or silently remove unrelated identities;
- renderer-independent timer/session accounting and tracked Time Taken must not be rewritten by subtask edits;
- a committed mutation plus failed renderer refresh/broadcast must not be reported as authoritative mutation failure;
- All Lists remains an aggregate read projection;
- scheduling/date-only/timezone/recurrence semantics validated through M4/M5 remain unchanged;
- stale recurrence update/remove/replace requests continue to fail atomically before destructive child work;
- task-card hover/focus/edit/schedule controls use stable reserved/metadata geometry and cannot move sibling hit targets;
- notes never auto-launch URLs;
- excluded account/trial/upgrade/profile/AI/integration controls remain absent;
- diagnostics remain gated behind `?diagnostics=1`.

## EXACT NEXT ACTION FOR A ZERO-CONTEXT AGENT

1. Verify exact branch tip and confirm no competing implementation PR.
2. Read the M2 subtask domain/persistence modules and tests plus the current task-card/ListBoard implementation and subtask-related specs.
3. Write the evidence-backed narrow subtask UI mutation/read contract into this HANDOFF and mark checkpoint 1 complete only after that inspection.
4. Implement checkpoint 2 on the same branch with deterministic coverage; do not open a PR until semantic/diff review is complete.

## USER ACTION REQUIRED

**None.**

## BLOCKERS / NOT RUN

- No product/user decision currently blocks checkpoint 1.
- Local checkout/toolchain validation in this connector-only environment: **NOT RUN**.
- Windows GitHub Actions remains authoritative for frontend, Rust/Tauri, visual and artifact validation.
