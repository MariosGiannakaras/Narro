# HANDOFF.md

This is the canonical zero-context continuation state for Narro. Start with `AI_START_HERE.md`, `AGENTS.md`, `ENGINEERING_QUALITY.md`, `AGENT_WORKFLOW.md`, this file, the active Milestone 5 section in `TODO.md`, relevant `STATUS.md`, `docs/UI_UX_SPEC.md`, `docs/RESEARCH_EVIDENCE.md`, `docs/BLITZIT_HISTORY_RISK_INDEX.md`, and the newest relevant immutable `work-log/*.md` entries.

## CURRENT MILESTONE

**Milestone 5 — Design system and Main window product UI.**

- Milestones 1–4: COMPLETE / PASS.
- Milestone 5: ACTIVE / 15 of 28 top-level items validated.
- Milestones 6–10: NOT STARTED.

## CURRENT VALIDATED SOURCE BASELINE

Latest fully main-validated source/test SHA:

`f965da939397b22adc6b024e5dd86ee750a18b92`

This is the merged result of PR #87 — `M5: harden task hover action geometry`.

Validation evidence:

- final PR #87 head `94d6ef53ba882c4e0022a42eb242a87d427b84c9`;
- PR head tree `0928b83c165a21db3c7203094894cd9e4a6af5a4`;
- Windows PR CI #324 / run `34323668511` / job `102375871427`: **SUCCESS**;
- PR Repository Preflight, visual capture/upload, Tauri release and diagnostic artifact upload: **PASS**;
- PR visual artifact `10093105381`, digest `sha256:0bb2d5698589e6199b3fbbaad90efb7a9183da74e77d07c8664e95d284a8c5a0`;
- PR diagnostic artifact `10093299961`, digest `sha256:8e13f9cdcd8f6b3a8b06aed2bb9f59e060ba2b2ee3cdade46812b8edf7bbccc3`;
- final exact-head semantic/diff review: **PASS**;
- issue comments, submitted reviews and inline review threads requiring resolution: **none**;
- merged main source SHA `f965da939397b22adc6b024e5dd86ee750a18b92` shares the validated PR tree `0928b83c165a21db3c7203094894cd9e4a6af5a4`;
- Windows main CI #325 / run `34324954967` / job `102379970998`: **SUCCESS**;
- main Repository Preflight, visual capture/upload, Tauri release and diagnostic artifact upload: **PASS**;
- main visual artifact `10093618064`, digest `sha256:d3dd321cc9ed0b47988217e7a661da14e13f2aec2b7596ae3a71d6ab25ee08cc`;
- main diagnostic artifact `10093848439`, digest `sha256:eade32f945641e2a6c22789f40e0294e814d04172035cbf9b87e86d5dc766a68`.

Markdown-only tracking descendants do not replace this validated source/test baseline. Detailed completed-slice evidence: `work-log/2026-09-09-1125-chatgpt-m5-hover-action-geometry.md`.

## LATEST COMPLETED SLICE

**M5 Main UI — Ensure hover actions use reserved/overlay slots and never reflow title/card geometry.**

Validated capabilities:

- production Move up / Move down actions live inside the existing fixed `4.25rem` action column;
- visible `1.75rem` controls are absolutely overlaid inside the existing `4.25rem × 1.25rem` reserved slot;
- hover/card-focus/child-focus reveal uses opacity/visibility only and does not change title/card geometry or pointer targets;
- hidden action controls retain reserved geometry while remaining inert until revealed;
- icon-only controls use explicit accessible labels and the shared Tooltip primitive;
- pointer controls and `Alt+ArrowUp/Down` reuse the validated persistence-first reorder boundary;
- action buttons are isolated from parent task drag initiation;
- All Lists, Done, scheduled and otherwise non-reorderable rows remain read-only;
- deterministic static and Windows Edge visual contracts enforce production action DOM and stable `68×20` reserved-slot geometry;
- no Rust/schema/domain/persistence implementation changed.

## ACTIVE SLICE

**M5 Main UI — Task creation and inline editing.**

Planned feature branch: `m5-task-create-inline-edit`.

No source work for this new slice is validated yet. Begin from the latest `main` tracking tip while treating `f965da939397b22adc6b024e5dd86ee750a18b92` as the validated source/test baseline until the new source slice completes the full PR/main Windows CI sequence.

Narrow scope:

- inspect and reuse the existing M2 task create/update persistence boundaries rather than adding renderer-owned or parallel task mutation semantics;
- make task creation reachable from the individual List Board using the existing reserved add geometry and the screenshot-backed inline-create presentation;
- implement inline task-title editing for an existing eligible task through the authoritative persistence boundary;
- validate empty/invalid titles, stale/missing targets and persistence failures before presenting success;
- update renderer state only after successful persistence and re-read the authoritative List Board snapshot;
- keep a committed mutation distinct from any subsequent snapshot-refresh failure so an unsafe retry is not encouraged;
- preserve stable task identity, lane/order semantics, scheduled-task projection and aggregate/Done read-only constraints;
- provide keyboard/focus behavior and deterministic static/visual coverage for create/edit/rest/error states without layout shift.

Explicitly out of scope unless a strict dependency is proven: EST/Time Taken editing, completion/delete/archive task actions, scheduling/recurrence editor, subtasks, rich notes editing/link activation, list settings, search, Settings and Reports.

## USER-FACING PROGRESS

**`M-5/10 | 0/5 | 15/28`**

Task creation / inline editing checkpoints:

1. mandatory startup + exact current-main/M2 CRUD/ListBoard/TaskCard/inline-create-edit/spec/risk/visual-contract inspection + narrow mutation/UX contract — PENDING;
2. persistence-first task creation/title-edit implementation + validation/failure/accessibility behavior + deterministic static/visual coverage + semantic/diff review — PENDING;
3. exact PR-head Windows CI including repository preflight, visual captures, release and required artifacts — PENDING;
4. exact-head semantic/diff/feedback review + validated-head merge — PENDING;
5. resulting-main Windows CI + TODO/STATUS/HANDOFF/new immutable work-log reconciliation — PENDING.

## COMPLETED CAPABILITIES / INVARIANTS THAT MUST NOT REGRESS

- authoritative Rust/domain/persistence state and persistence-first mutation semantics remain authoritative;
- stable task identities and one-open-session invariant must not regress;
- renderer-independent timer/session accounting must not regress;
- reorder/move changes position/lane only and never creates, deletes or aliases identities;
- scheduled pending tasks remain projected through effective planning-lane semantics rather than schedule-driven `manual_lane` mutation;
- archived lists/tasks remain absent; completed non-archived tasks project to Done exactly once;
- All Lists remains an aggregate projection, never a persisted synthetic list;
- task-card production states and durable Time Taken remain authoritative read projections;
- hover/focus action reveal may not reflow title/card geometry or move pointer targets;
- hidden action controls retain reserved geometry and keyboard/focus accessibility when revealed;
- fixture-only notes/subtasks/paused-edit/destructive presentations must not be mistaken for implemented mutations;
- notes never auto-launch URLs; explicit click/keyboard activation remains required when link behavior is implemented;
- existing Home/shell/list-board/theme/overlay/reduced-motion and exact 1280×720 PNG contracts must not regress;
- excluded account/trial/upgrade/profile/AI/integration controls remain absent;
- diagnostics remain gated behind `?diagnostics=1`.

## NEXT AGENT ACTION

Verify current `main` and that there is no open implementation PR that already supersedes this handoff. Create or reuse `m5-task-create-inline-edit` from the latest main tracking tip.

Inspect the M2 task create/update domain/persistence implementation and tests, current renderer task API boundaries, `src/ListBoard.tsx`, `src/TaskCard.tsx`, the reserved board add slot, task-card inline-create/edit fixtures and validators, and the relevant `docs/UI_UX_SPEC.md` / product evidence. Define the narrow create/title-edit contract from repository evidence, then implement it directly. Do not absorb the following EST/Time Taken item or later scheduling/subtask/notes/destructive flows.

Before any source/config push, run the strongest available local preflight; in this connector-only runtime local checkout/toolchain execution remains unavailable, so perform repository/diff semantic review and record local checks as **NOT RUN**. Use exact-head Windows GitHub Actions as the authoritative reproducible compile/test/release/visual gate.

## USER ACTION REQUIRED

**None.**

## BLOCKERS / NOT RUN

- No product/user blocker is known.
- Local checkout/toolchain validation in this connector-only environment: **NOT RUN**.
