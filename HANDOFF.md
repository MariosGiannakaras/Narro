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

Exact PR validation:

- final PR head `233ab9cb930a5e9cee47d6cbf02d5cd8382c017e`;
- Windows PR CI #313 / run `34261787995` / job `102181282975`: **SUCCESS**;
- Repository Preflight, real individual + All Lists light/dark board captures, Tauri release and required artifacts: **PASS**;
- PR visual artifact `10070458234`, digest `sha256:b9ac6a69c7550e8ae25afbfb3e7f750e847bf4f416ec3ba60a95b4ebcb9bd303`;
- PR diagnostic artifact `10070674547`, digest `sha256:57d3d5d2c6fec36e228218d1b9f30a12e3c570d1f2e19ce23a1dddc9fc7d8f35`;
- final exact-head semantic/diff review: PASS; 15 changed files, no PR comments, submitted reviews or inline threads requiring resolution.

Expected-head guarded squash merge produced `d54c4e57933588f89f8f1cf56b1e3dfe5441fd9b`.

Resulting-main validation:

- Windows main CI #314 / run `34263232684` / job `102186124690`: **SUCCESS**;
- exact source SHA `d54c4e57933588f89f8f1cf56b1e3dfe5441fd9b`;
- Repository Preflight, real board captures, visual artifact, Tauri release and diagnostic artifact: **PASS**;
- main visual artifact `10071063644`, digest `sha256:1d0fa6ec2579ea5e78fe035eba49c42eef5cd184c8673cb91d02aba56489108e`;
- main diagnostic artifact `10071323113`, digest `sha256:4ca72195d7d269edb61bdcdf6f52ac91ad3556ec665142c595284f78d8568c83`.

Tracking commits descending from this source SHA update `TODO.md`, `STATUS.md`, this handoff and `work-log/2026-09-08-2144-chatgpt-m5-list-board.md`; they are markdown-only and do not replace the validated source/test baseline.

## LATEST COMPLETED SLICE

**M5 Main UI — List board with Backlog, This Week, Today, Done.**

Validated capabilities:

- read-only Rust `list_board` projection over active lists and stable persisted task identities;
- individual-list and aggregate All Lists targets without a synthetic persisted list;
- Backlog / This Week / Today projection for pending tasks through validated M4 `effective_planning_lane_at` semantics;
- Done projection from completed, non-archived tasks only;
- duplicate-identity fail-closed guard plus checked task-count and aggregate-EST arithmetic;
- persisted timezone preference wins; Windows/WebView IANA timezone is fallback only;
- typed renderer-facing `get_list_board_snapshot` read command with no task mutation commands;
- real Home list-card Open, Home All Lists, sidebar All my lists and in-board selector navigation;
- four-column hierarchy with title/count/aggregate EST and deliberately baseline/static task rows;
- aggregate origin labels and reserved future-add geometry without dead add controls;
- deterministic individual + aggregate light/dark Edge fixtures, visual validation and `test:ui-list-board` frontend-preflight coverage;
- detailed task-card states, drag/drop/reorder, task create/edit behavior, EST/Time Taken editing, scheduling/recurrence UI, subtasks, notes, destructive flows, search, Settings and Reports remain later ordered work.

Detailed evidence: `work-log/2026-09-08-2144-chatgpt-m5-list-board.md`.

## ACTIVE SLICE

**M5 Main UI — Task-card state model: normal, hover/action-revealed, scheduled, overdue, done, inline-create, notes-expanded, subtasks-expanded, paused/editable, destructive-confirm.**

No implementation branch or PR exists yet for this slice as of this reconciliation.

Scope intent:

- start from the validated baseline/static board row and authoritative persisted/domain metadata;
- implement the ordered visual/state model and only the minimum read projection/fixture plumbing required to make every requested state deterministic and reachable;
- preserve stable card/title/action geometry across hover/focus states;
- keep actual drag/drop/reorder behavior, task creation/edit mutation behavior, EST/Time Taken mutation behavior, scheduling/recurrence editor behavior, subtask mutation behavior, notes editor behavior, list settings, search, Settings and Reports out of scope unless a strict dependency is demonstrated and recorded;
- do not expose dead controls whose corresponding action is not implemented in the current ordered slice.

## USER-FACING PROGRESS

**`M-5/10 | 0/5 | 12/28`**

Task-card state-model checkpoints:

1. mandatory startup + exact current-main/spec/screenshot/task metadata/timer-state/history-risk/visual-harness inspection + narrow state-model scope — PENDING;
2. deterministic task-card state model + minimum read projection/fixtures + semantic/diff review — PENDING;
3. exact PR-head Windows CI including repository preflight, task-card state captures, release and required artifacts — PENDING;
4. exact-head semantic/diff/feedback review + expected-head guarded merge — PENDING;
5. resulting-main Windows CI + TODO/STATUS/HANDOFF/new immutable work-log reconciliation — PENDING.

## IMPORTANT INVARIANTS

- authoritative Rust/domain/persistence state and persistence-first mutation semantics remain authoritative;
- stable task identities and one-open-session invariant must not regress;
- renderer-independent timer/session accounting must not regress;
- list board presentation remains read-only unless a later ordered mutation slice explicitly adds a persistence-backed action;
- scheduled pending tasks remain projected through validated M4 effective planning-lane semantics; schedule metadata must not be mistaken for `manual_lane` mutation;
- archived lists/tasks remain absent; completed non-archived tasks project to Done exactly once;
- All Lists remains a read projection across active lists, never a synthetic persisted list;
- task identity duplication must fail closed rather than render duplicate aliases;
- stored configured timezone wins over renderer fallback and all timezone identifiers are validated;
- hover/focus/action-revealed task-card states must reserve or overlay action geometry and never reflow title/card geometry or move pointer targets;
- task-card visual states must not imply a mutation succeeded before authoritative persistence commits;
- paused/editable presentation must not create renderer-owned timer or Time Taken authority;
- notes-expanded presentation must not auto-launch URLs; explicit click/keyboard activation remains required when actual note-link activation is later wired;
- destructive-confirm presentation must not silently activate delete/archive behavior before the corresponding persistence-backed flow exists;
- existing Create/Edit List, Home, shell, theme, overlay, reduced-motion and exact 1280x720 PNG contracts must not regress;
- imported list icons remain app-data-owned and cleanup must never target arbitrary paths;
- excluded account/trial/upgrade/profile/AI/integration controls remain absent;
- diagnostics remain gated behind `?diagnostics=1`.

## NEXT AGENT ACTION

Perform mandatory startup against the current main tracking tip and the validated source baseline above. Inspect the task-card screenshots/state descriptions in `docs/UI_UX_SPEC.md`, relevant source-product evidence, `docs/BLITZIT_HISTORY_RISK_INDEX.md`, the current `ListBoard` / board snapshot types, M2 task/subtask/note persistence reads, M3 authoritative paused/timer projection, M4 scheduling/overdue semantics, shared overlay/focus/motion primitives and the visual fixture harness.

Then create one coherent feature branch for the task-card state-model slice and implement directly. Prefer deterministic fixture-only state activation where a requested state represents later mutation behavior; only extend production read projection when authoritative persisted/runtime metadata is genuinely required. Do not pull later mutation slices forward merely to make a visual state fixture possible.

## USER ACTION REQUIRED

**None.**