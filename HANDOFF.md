# HANDOFF.md

This is the canonical zero-context continuation state for Narro. Start with `AI_START_HERE.md`, `AGENTS.md`, `ENGINEERING_QUALITY.md`, `AGENT_WORKFLOW.md`, this file, the active Milestone 5 section in `TODO.md`, relevant `STATUS.md`, relevant `docs/UI_UX_SPEC.md` / `docs/RESEARCH_EVIDENCE.md` / `docs/BLITZIT_HISTORY_RISK_INDEX.md` evidence, and the newest relevant immutable `work-log/*.md` entries.

## CURRENT MILESTONE

**Milestone 5 — Design system and Main window product UI.**

- Milestones 1–4: COMPLETE / PASS.
- Milestone 5: ACTIVE / 12 of 28 top-level items validated.
- Milestones 6–10: NOT STARTED.

## CURRENT VALIDATED SOURCE BASELINE

Latest fully main-validated source/test SHA:

`d54c4e57933588f89f8f1cf56b1e3dfe5441fd9b`

This is the expected-head guarded squash merge of PR #84 — `M5: add list board hierarchy`.

Validated list-board evidence:

- final PR #84 head `233ab9cb930a5e9cee47d6cbf02d5cd8382c017e`;
- Windows PR CI #313 / run `34261787995` / job `102181282975`: **SUCCESS**;
- expected-head guarded squash merge produced `d54c4e57933588f89f8f1cf56b1e3dfe5441fd9b`;
- Windows main CI #314 / run `34263232684` / job `102186124690`: **SUCCESS**;
- main visual artifact `10071063644`, digest `sha256:1d0fa6ec2579ea5e78fe035eba49c42eef5cd184c8673cb91d02aba56489108e`;
- main diagnostic artifact `10071323113`, digest `sha256:4ca72195d7d269edb61bdcdf6f52ac91ad3556ec665142c595284f78d8568c83`.

Tracking descendants are markdown-only and do not replace this validated source/test baseline. Detailed completed-slice evidence: `work-log/2026-09-08-2144-chatgpt-m5-list-board.md`.

## ACTIVE SLICE

**M5 Main UI — Task-card state model: normal, hover/action-revealed, scheduled, overdue, done, inline-create, notes-expanded, subtasks-expanded, paused/editable, destructive-confirm.**

Branch: `m5-task-card-states`, based on main tracking tip `2aed955968a1c86704329d453be1cfdc0dd5a660`.

PR: #85 — `M5: add task card state model` — OPEN.

Latest candidate before this handoff commit:

`a9f980972f670c1752017027bc388621a675a90a`

Candidate implementation includes:

- reusable `TaskCard` presentation used by the validated List Board;
- production-derived normal / scheduled / overdue / done states from authoritative board read metadata;
- authoritative durable Time Taken projection through existing `task_time_taken_seconds`, serialized losslessly as a decimal string for renderer display;
- scheduled local date/time projection without changing persisted schedule semantics;
- read-only overdue classification using validated M4 scheduling/focus eligibility semantics plus display-local date comparison for date-only schedules;
- stable reserved completion/action/title geometry so the action-revealed state cannot reflow card/title geometry;
- deterministic fixture-only action-revealed, inline-create, notes-expanded, subtasks-expanded, paused/editable and destructive-confirm states where real mutation behavior belongs to later ordered slices;
- fixture-only note state explicitly states links require explicit activation; no URL opener/href behavior exists in `TaskCard`;
- fixture-only destructive confirmation performs no mutation;
- deterministic `task-card-states` light/dark fixture, Edge capture wiring, semantic/geometry validator and `test:ui-task-card-states` frontend-preflight coverage;
- board fixtures now expose representative scheduled, overdue, done and durable Time Taken metadata;
- no drag/drop/reorder, task creation/edit mutation, completion/move/delete handler, EST/Time Taken mutation UI, scheduling/recurrence editor, subtask mutation, rich notes editor/link activation, list settings, search, Settings or Reports behavior was added.

Semantic/diff review before authoritative CI: **PASS**. PR #85 has 12 changed files, all confined to board read projection, task-card presentation, fixtures and validation/preflight. An ES2020 compatibility issue (`String.replaceAll`) was identified during review and corrected before this handoff/CI candidate.

Local checkout/toolchain validation: **NOT RUN**. The connector-only execution environment cannot resolve GitHub from the local container; Windows GitHub Actions remains the authoritative reproducible gate.

### CI state

Windows PR CI #315 / run `34267049009` was queued for exact candidate head `a9f980972f670c1752017027bc388621a675a90a` before this handoff update. Because this handoff commit changes the PR head, require a fresh authoritative run on the new exact PR head before merge. Treat #315 as superseded diagnostic evidence if it completes on the older head.

## USER-FACING PROGRESS

**`M-5/10 | 2/5 | 12/28`**

Task-card state-model checkpoints:

1. mandatory startup + exact current-main/spec/screenshot/task metadata/timer-state/history-risk/visual-harness inspection + narrow state-model scope — COMPLETE;
2. deterministic task-card state model + minimum read projection/fixtures + semantic/diff review — COMPLETE;
3. exact PR-head Windows CI including repository preflight, task-card state captures, release and required artifacts — PENDING;
4. exact-head semantic/diff/feedback review + expected-head guarded merge — PENDING;
5. resulting-main Windows CI + TODO/STATUS/HANDOFF/new immutable work-log reconciliation — PENDING.

## IMPORTANT INVARIANTS

- authoritative Rust/domain/persistence state and persistence-first mutation semantics remain authoritative;
- stable task identities and one-open-session invariant must not regress;
- renderer-independent timer/session accounting must not regress;
- the board/task-card production path remains read-only in this slice;
- scheduled pending tasks remain projected through validated M4 effective planning-lane semantics; schedule metadata must not mutate `manual_lane`;
- archived lists/tasks remain absent; completed non-archived tasks project to Done exactly once;
- All Lists remains a read projection, never a persisted synthetic list;
- task identity duplication must fail closed;
- stored configured timezone wins over renderer fallback and timezone identifiers remain validated;
- hover/focus/action-revealed task-card states must reserve/overlay action geometry and never reflow title/card geometry or move pointer targets;
- task-card visual states must not imply a mutation succeeded before authoritative persistence commits;
- paused/editable presentation must not create renderer-owned timer or Time Taken authority;
- notes-expanded presentation must never auto-launch URLs; explicit click/keyboard activation remains required when link activation is later implemented;
- destructive-confirm presentation must not activate delete/archive behavior before its persistence-backed slice;
- existing Create/Edit List, Home, shell, theme, overlay, reduced-motion and exact 1280x720 PNG contracts must not regress;
- excluded account/trial/upgrade/profile/AI/integration controls remain absent;
- diagnostics remain gated behind `?diagnostics=1`.

## NEXT AGENT ACTION

Read PR #85's current exact head after this handoff commit and observe the fresh Windows CI for that exact SHA. Do not make a source change unless the authoritative run produces an evidence-backed failure.

Require Repository Preflight including `test:ui-task-card-states`, real Edge light/dark `task-card-states` captures plus existing visual fixtures, visual artifact upload, Tauri release and diagnostic artifact upload to pass on the same exact head.

After exact-head PASS, inspect the final changed-file diff plus all PR comments/reviews/inline threads, merge only with an expected-head guard, validate resulting main with Windows CI, then reconcile `TODO.md`, `STATUS.md`, this handoff and one new immutable work-log entry.

## USER ACTION REQUIRED

**None.**