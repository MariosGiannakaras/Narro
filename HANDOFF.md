# HANDOFF.md

This is the canonical zero-context continuation state for Narro. Start with `AI_START_HERE.md`, `AGENTS.md`, `ENGINEERING_QUALITY.md`, `AGENT_WORKFLOW.md`, this file, the active Milestone 5 section in `TODO.md`, relevant `STATUS.md`, `docs/UI_UX_SPEC.md`, `docs/RESEARCH_EVIDENCE.md`, `docs/BLITZIT_HISTORY_RISK_INDEX.md`, and the newest relevant immutable `work-log/*.md` entries.

## CURRENT MILESTONE

**Milestone 5 — Design system and Main window product UI.**

- Milestones 1–4: COMPLETE / PASS.
- Milestone 5: ACTIVE / 14 of 28 top-level items validated.
- Milestones 6–10: NOT STARTED.

## CURRENT VALIDATED SOURCE BASELINE

Latest fully main-validated source/test SHA:

`5d91767ba79482fe1d6d25b2965db19e6baac8c2`

This is the expected-head guarded squash merge of PR #86 — `M5: add task reorder and move interactions`.

Validation evidence:

- final PR #86 head `5096163f67f1c4b673ff6b05059cc9532b9de765`;
- Windows PR CI #320 / run `34280885956` / job `102245092274`: **SUCCESS**;
- PR visual artifact `10077803918`, digest `sha256:09169f15dd4d4beed6674020da6a4216119bc1365ffff446c614f380759e79ce`;
- PR diagnostic artifact `10078011804`, digest `sha256:9964d2fb4b44b7c1b6e2168afe257900b7e5bb67b388fc79f7f35f7d2acb159f`;
- expected-head guarded squash merge produced `5d91767ba79482fe1d6d25b2965db19e6baac8c2`;
- Windows main CI #321 / run `34316110248` / job `102352553758`: **SUCCESS**;
- main visual artifact `10090292156`, digest `sha256:4f0bf3c16161894a934d8d885c2e5cc3ce1c4e9dc15ceb9079c14eb13021875b`;
- main diagnostic artifact `10090429537`, digest `sha256:58dd8e279a2a248c373ab319b86fd9b4be00769be29e5eb4b038a8fe267905bb`.

Tracking descendants are markdown-only and do not replace the validated source/test baseline. Detailed completed-slice evidence: `work-log/2026-09-09-0858-chatgpt-m5-task-reorder.md`.

## ACTIVE SLICE

**M5 Main UI — Ensure hover actions use reserved/overlay slots and never reflow title/card geometry.**

Active branch: `m5-hover-action-geometry`.

Latest reviewed source candidate before this tracking-only handoff commit:

`49db47cde952b057466e87566c23ae43ecf68214`

No implementation PR existed at the last concurrency check. `main` remained `ca2fa3d3fd5b4ee56deedf5faf87aff44f964bf6`, a markdown-only descendant of validated source `5d91767ba79482fe1d6d25b2965db19e6baac8c2`.

Implemented candidate scope:

- production `TaskCard` Move up / Move down actions now occupy the existing fixed 4.25rem reserved action column;
- the visible 1.75rem action controls are absolutely overlaid inside the pre-existing 4.25rem × 1.25rem slot, preserving the validated rest title/card geometry;
- hover, card focus and child focus reveal the action rail with opacity/visibility only; hidden actions remain inert without removing layout geometry;
- icon-only actions reuse the shared accessible `Tooltip` primitive and explicit `aria-label`s;
- pointer actions and `Alt+ArrowUp/Down` reuse one `handleMoveWithinLane` helper and the already validated persistence-first `commitDrop` boundary;
- action-button drag initiation is rejected before the parent task drag path can start;
- aggregate All Lists, Done, scheduled tasks and non-reorderable rows remain read-only for these actions;
- deterministic static checks and the existing task-card visual capture contract now require production action DOM, stable card/title dimensions and the original 68×20 reserved slot geometry;
- `preflight:frontend` includes `test:ui-task-hover-actions`.

Explicitly not implemented: task creation/editing, completion/delete/archive actions, EST/Time Taken editing, scheduling/recurrence editor, subtasks, notes editing/link activation, list settings, search, Settings or Reports.

Local checkout/toolchain execution remains **NOT RUN** in this connector-only runtime. Semantic/diff review of the candidate against `ca2fa3d3fd5b4ee56deedf5faf87aff44f964bf6`: **PASS**; only TaskCard/ListBoard/CSS and deterministic frontend test/preflight files changed, with no Rust/schema/domain changes.

## USER-FACING PROGRESS

**`M-5/10 | 2/5 | 14/28`**

Hover-action geometry checkpoints:

1. mandatory startup + exact current-main/TaskCard/ListBoard/action-slot/spec/risk/visual-contract inspection + narrow scope — COMPLETE;
2. production hover/focus action geometry implementation/hardening + keyboard/accessibility + deterministic static/visual no-reflow coverage + semantic/diff review — COMPLETE;
3. exact PR-head Windows CI including repository preflight, visual captures, release and required artifacts — PENDING;
4. exact-head semantic/diff/feedback review + expected-head guarded merge — PENDING;
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
- hidden action controls must retain reserved geometry and keyboard/focus accessibility when revealed;
- fixture-only inline-create, notes-expanded, subtasks-expanded, paused/editable and destructive-confirm presentations remain non-mutating;
- notes never auto-launch URLs; explicit click/keyboard activation remains required when link behavior is implemented;
- existing Home/shell/list-board/theme/overlay/reduced-motion and exact 1280×720 PNG contracts must not regress;
- excluded account/trial/upgrade/profile/AI/integration controls remain absent;
- diagnostics remain gated behind `?diagnostics=1`.

## NEXT AGENT ACTION

Read the exact current branch head after this tracking commit, create one PR from `m5-hover-action-geometry` to `main`, and record its exact head SHA. Inspect the authoritative Windows PR CI for that exact head. Require Repository Preflight, visual captures, visual artifact upload, Tauri release build and diagnostic artifact upload to pass. If CI fails, inspect the exact job log and change only the evidence-backed problem. Do not merge an unvalidated newer head.

After exact-head CI passes, perform final semantic/diff/feedback review, merge with expected-head guard, validate the resulting main source SHA with Windows CI, then reconcile `TODO.md`, `STATUS.md`, this handoff and a new immutable work-log. The next ordered item after successful reconciliation is `Task creation and inline editing.`

## USER ACTION REQUIRED

**None.**

## BLOCKERS / NOT RUN

- No product/user blocker is known.
- Local checkout/toolchain validation in this connector-only environment: **NOT RUN**. Windows GitHub Actions is the authoritative reproducible compile/test/release/visual gate.
