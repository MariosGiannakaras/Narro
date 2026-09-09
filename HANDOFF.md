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

Task-reorder validation evidence:

- final PR #86 head `5096163f67f1c4b673ff6b05059cc9532b9de765`;
- Windows PR CI #320 / run `34280885956` / job `102245092274`: **SUCCESS**;
- PR visual artifact `10077803918`, digest `sha256:09169f15dd4d4beed6674020da6a4216119bc1365ffff446c614f380759e79ce`;
- PR diagnostic artifact `10078011804`, digest `sha256:9964d2fb4b44b7c1b6e2168afe257900b7e5bb67b388fc79f7f35f7d2acb159f`;
- expected-head guarded squash merge produced `5d91767ba79482fe1d6d25b2965db19e6baac8c2`;
- Windows main CI #321 / run `34316110248` / job `102352553758`: **SUCCESS**;
- main visual artifact `10090292156`, digest `sha256:4f0bf3c16161894a934d8d885c2e5cc3ce1c4e9dc15ceb9079c14eb13021875b`;
- main diagnostic artifact `10090429537`, digest `sha256:58dd8e279a2a248c373ab319b86fd9b4be00769be29e5eb4b038a8fe267905bb`.

PR CI #319 / run `34280633818` / job `102244250572` failed only at `cargo fmt --check`; forward commit `5096163f67f1c4b673ff6b05059cc9532b9de765` applied the exact Windows rustfmt output to `src-tauri/src/board_task_mutation.rs` without runtime/test semantic change.

Tracking descendants are markdown-only and do not replace the validated source/test baseline. Detailed completed-slice evidence: `work-log/2026-09-09-0858-chatgpt-m5-task-reorder.md`.

## LATEST COMPLETED SLICE

**M5 Main UI — Drag/drop or equivalent reorder/move behavior with stable placeholder/drop animation.**

Validated capabilities:

- same-lane persistence-backed exact-set reorder and transactional cross-lane append move reuse M2 boundaries;
- task identity set/count is preserved and stale source/anchor requests fail closed;
- scheduled/completed/archived tasks are not manually reorderable; scheduled effective-lane semantics remain owned by M4 scheduling;
- All Lists and Done remain read-only for manual reorder;
- pointer drag/drop and `Alt+Arrow` keyboard equivalent are available on eligible individual-list pending tasks;
- no optimistic renderer order exists: mutation commits first, then the authoritative board snapshot is re-read;
- post-commit refresh failure is distinct from mutation failure and cannot encourage unsafe duplicate retry;
- stable placeholder/target feedback and finite settle animation respect reduced motion;
- Windows light/dark Edge captures and exact task-identity regressions passed.

## ACTIVE SLICE

**M5 Main UI — Ensure hover actions use reserved/overlay slots and never reflow title/card geometry.**

This is the next ordered top-level item after the fully validated reorder/move slice. Begin from the latest main tracking tip, while treating `5d91767ba79482fe1d6d25b2965db19e6baac8c2` as the validated source baseline until a new source PR passes the full merge/main sequence.

Narrow scope:

- inspect the real production `TaskCard` hover/focus/action-revealed path, existing reserved action slot, title-row geometry and applicable list-card/focus evidence;
- make any missing production hover/focus actions reachable without inserting/removing layout columns or moving pointer targets;
- preserve keyboard/focus-visible equivalence and accessible names/tooltips for icon-only affordances that become real;
- extend deterministic static/visual no-reflow validation for production hover/focus geometry;
- keep action behavior callback-gated/presentation-only unless an already validated mutation is a strict dependency.

Explicitly out of scope unless a strict dependency is proven: task creation/inline editing, EST/Time Taken edit controls, scheduling/recurrence editor, subtasks, notes editing/link activation, destructive task flows, list settings, search, Settings and Reports.

## USER-FACING PROGRESS

**`M-5/10 | 0/5 | 14/28`**

The small counter resets because the reorder/move slice is fully reconciled and this is a genuinely new ordered implementation slice.

Hover-action geometry checkpoints:

1. mandatory startup + exact current-main/TaskCard/ListBoard/action-slot/spec/risk/visual-contract inspection + narrow scope — PENDING;
2. production hover/focus action geometry implementation/hardening + keyboard/accessibility + deterministic static/visual no-reflow coverage + semantic/diff review — PENDING;
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
- task identity duplication in board projection fails closed;
- stored configured timezone wins over renderer fallback and timezone identifiers remain validated;
- task-card production states include normal, scheduled, overdue and done from authoritative read metadata plus durable Time Taken;
- action-revealed task-card geometry is reserved/overlayed and must not reflow title/card geometry or move pointer targets;
- no hover/focus interaction may change row/card geometry or move sibling controls under the pointer;
- fixture-only inline-create, notes-expanded, subtasks-expanded, paused/editable and destructive-confirm presentations must not be mistaken for implemented mutations;
- notes must never auto-launch URLs; explicit click/keyboard activation remains required when link behavior is implemented;
- existing Create/Edit List, Home, shell, theme, overlay, reduced-motion and exact 1280x720 PNG contracts must not regress;
- excluded account/trial/upgrade/profile/AI/integration controls remain absent;
- diagnostics remain gated behind `?diagnostics=1`.

## NEXT AGENT ACTION

Verify current `main` and that there is no new open implementation PR. Inspect `src/TaskCard.tsx`, `src/ListBoard.tsx`, `src/listBoard.css`, existing task-card state fixtures/validators, shared overlay/tooltip primitives, the hover/no-layout-shift sections of `docs/UI_UX_SPEC.md`, supplied evidence where relevant, and the action-button movement risk in `docs/BLITZIT_HISTORY_RISK_INDEX.md`.

Then implement the narrow hover-action geometry slice directly on one coherent feature branch. Reuse the existing reserved action geometry instead of introducing a new layout model. Do not activate later task-edit/destructive behavior merely to populate the slot; callback-gated or currently meaningful actions are preferable until their ordered mutation slices arrive.

## USER ACTION REQUIRED

**None.**

## BLOCKERS / NOT RUN

- No product/user blocker is known.
- Local checkout/toolchain validation in the connector-only environment: **NOT RUN**. Use the strongest connector/repository review available before pushing; Windows GitHub Actions remains the authoritative reproducible compile/test/release/visual gate.