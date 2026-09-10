# HANDOFF.md

This is the canonical zero-context continuation state for Narro. Start with `AI_START_HERE.md`, `AGENTS.md`, `ENGINEERING_QUALITY.md`, `AGENT_WORKFLOW.md`, this file, the active Milestone 5 section in `TODO.md`, relevant `STATUS.md`, `docs/UI_UX_SPEC.md`, `docs/PRODUCT_SPEC.md`, `docs/BEHAVIOR_MATRIX.md`, `docs/BLITZIT_HISTORY_RISK_INDEX.md` when source-product reliability risks are relevant, and the newest relevant immutable `work-log/*.md` entries.

## CURRENT MILESTONE

**Milestone 5 — Design system and Main window product UI.**

- Milestones 1–4: COMPLETE / PASS.
- Milestone 5: ACTIVE / **18 of 28** top-level items validated after tracking reconciliation.
- Milestones 6–10: NOT STARTED.

## CURRENT VALIDATED SOURCE BASELINE

Latest fully main-validated source/test SHA:

`64b7cc8cc79b3991a7407c2838b60f923c63dc75`

Source tree:

`537390a65e7cec0343f01741db7c110bf38377a6`

This is the expected-head guarded merge of PR #90 — `M5: add scheduling and recurrence editor`.

Markdown-only tracking descendants do not replace this validated source/test baseline.

Detailed immutable evidence:

`work-log/2026-09-10-1105-chatgpt-m5-scheduling-recurrence-ui.md`

## LATEST PR / CI EVIDENCE

### PR #90 exact-head validation

Final validated PR head:

`6b90835b58a2c659b0a78584b20af7d7c614a965`

Windows CI #353:

- run `34408571026`;
- job `102657360398`;
- conclusion: **SUCCESS**;
- Repository Preflight: **PASS**;
- Capture Visual Regression Fixtures: **PASS**;
- Upload Visual Regression Artifact: **PASS**;
- Tauri Release: **PASS**;
- Upload Diagnostic Harness Artifact: **PASS**;
- visual artifact `10126546425`, digest `sha256:7543eebd260dfabec66c784e3b3ec3a79fbcd7927d1d96d5f14941ccb46dd97b`;
- diagnostic artifact `10126751008`, digest `sha256:f76696b40b91006e10beb055ca01d2b7be5c682965c83ec3631b1736b5852b31`;
- PR comments: none;
- submitted reviews: none;
- inline review threads: none;
- final exact-head semantic/diff review: **PASS**.

PR #90 was merged with `expected_head_sha=6b90835b58a2c659b0a78584b20af7d7c614a965`, producing main source SHA `64b7cc8cc79b3991a7407c2838b60f923c63dc75`.

### Resulting-main validation

Windows CI #354:

- run `34451504139`;
- job `102788059565`;
- event `push`;
- exact source SHA `64b7cc8cc79b3991a7407c2838b60f923c63dc75`;
- conclusion: **SUCCESS**;
- Repository Preflight: **PASS**;
- Capture Visual Regression Fixtures: **PASS**;
- Upload Visual Regression Artifact: **PASS**;
- Tauri Release: **PASS**;
- Upload Diagnostic Harness Artifact: **PASS**;
- visual artifact `10141970473`, digest `sha256:f91c5c14056fe8f72edb005cd4153201dc5799dd82abdaf45a487a6111577bfb`;
- diagnostic artifact `10142174154`, digest `sha256:255491c37bcb2fa7943a92d635d6ab82b6d0e7f05fe828cec3fbcde6fd2f178a`.

## LATEST COMPLETED SLICE

**M5 Main UI — Scheduling UI and recurrence editor.**

Validated capabilities:

- production schedule/repeat editor on real individual List Boards; All Lists remains read-only;
- Rust-owned Today / Later today / Tomorrow / Next week shortcut resolution;
- custom date-only and local-date-time scheduling over the established M4 strict timezone/DST boundary;
- expected-list + expected-schedule stale-safe immediate-transaction writes;
- recurrence create/edit/remove over the established M4 persistence/materialization model;
- recurrence update/remove/Replace Existing expected-version guards are atomic inside persistence transactions;
- stale Replace Existing fails before child scan/detach/delete;
- modified/history-bearing generated children and occurrence reservations preserve validated detach/replace semantics;
- generated occurrences cannot create nested recurrence rules;
- board projection exposes authoritative recurrence parent/occurrence identity for visible Repeats / Occurrence status without renderer polling;
- schedule editor locks conflicting create/title/metric/reorder/list-switch interactions and its controls cannot initiate drag;
- committed mutation followed by failed board refresh continues to use the existing blocked-mutation safety path;
- deterministic Rust/static/frontend/Windows visual coverage is in the repository preflight/CI chain;
- asynchronous scheduling visual fixture capture is deterministic via a schedule-only Edge virtual-time budget; legacy synchronous fixtures are unchanged.

## USER-FACING PROGRESS

**`M-5/10 | 5/5 | 18/28`**

The completed scheduling/recurrence slice used five checkpoints, all complete:

1. mandatory inspection + narrow scheduling/recurrence mutation and UX contract — **COMPLETE**;
2. authoritative command/persistence/frontend implementation + deterministic Rust/static/visual coverage + semantic/diff review — **COMPLETE**;
3. exact PR-head Windows CI — **COMPLETE**;
4. final exact-head review + expected-head merge — **COMPLETE**;
5. resulting-main Windows CI + tracking/work-log reconciliation — **COMPLETE**.

Do not reset this small-slice counter until the next implementation slice is actually begun and its five-checkpoint plan is recorded in the repository.

## INVARIANTS THAT MUST NOT REGRESS

- authoritative Rust/domain/persistence state and persistence-first mutation semantics remain authoritative;
- stable task identities and one-open-session invariant must not regress;
- renderer-independent timer/session accounting must not regress;
- tracked time must never reset, disappear, double-count or snap back after pause/resume/recovery/Done;
- a committed mutation plus failed renderer refresh/broadcast must not be reported as an authoritative mutation failure;
- All Lists remains an aggregate read projection;
- date-only schedules remain calendar dates and never round-trip through UTC;
- local date-time schedules retain explicit IANA timezone semantics and reject DST gaps/folds through the existing strict boundary;
- Monday week boundaries and future-time eligibility remain authoritative;
- schedule/recurrence mutations preserve task identity and cannot duplicate/alias tasks;
- stale recurrence update/remove/replace requests fail atomically before destructive child work;
- recurrence materialization remains deterministic/idempotent and preserves parent/child, Replace Existing, detachment and occurrence-reservation behavior;
- scheduling/recurrence edits do not rewrite tracked Time Taken/timer/session state;
- task-card hover/focus/edit/schedule controls use stable reserved/metadata geometry and cannot move sibling hit targets;
- notes never auto-launch URLs;
- excluded account/trial/upgrade/profile/AI/integration controls remain absent;
- diagnostics remain gated behind `?diagnostics=1`.

## UNFINISHED WORK / NEXT ORDERED SLICE

**M5 Main UI — Subtasks UI.**

This slice has not begun yet after scheduling reconciliation.

The next zero-context agent must begin from the latest `main` tracking tip, create/resume one coherent feature branch for `Subtasks UI`, and record a narrow five-checkpoint plan before resetting the small-slice counter to `0/5`.

Required inspection before implementation:

- the authoritative Milestone 2 subtask domain/persistence APIs and existing integration tests;
- parent-task active/completed/archived mutation restrictions;
- current `TaskCard` state-model `subtasks-expanded` presentation and any fixture-only subtask evidence;
- current `ListBoard` interaction locks for reorder, title, metrics and scheduling;
- relevant subtask sections of `docs/PRODUCT_SPEC.md`, `docs/UI_UX_SPEC.md`, and `docs/BEHAVIOR_MATRIX.md`;
- relevant source-product reliability risks if subtask behavior intersects identity/order/history semantics.

Implementation must project authoritative subtask persistence rather than create renderer-only state. Preserve stable subtask identities, deterministic ordering, persistence-first success, parent binding, no task identity changes, no tracked-time rewrites, no layout-shifting hover/actions, keyboard accessibility and the existing committed-but-refresh-failed safety boundary.

Do not absorb rich notes, URL activation, destructive list/task flows, list settings, search, archives, theme settings, Reports, Focus Panel/Floating Timer product UI, or later milestones.

## EXACT NEXT ACTION FOR A ZERO-CONTEXT AGENT

1. Verify latest `main`, confirm no open implementation PR and confirm the current roadmap still has `Subtasks UI` next.
2. Create the coherent M5 subtasks feature branch from that exact main tracking tip.
3. Record the five-checkpoint subtasks plan in branch `HANDOFF.md`, then set user-facing small progress to `0/5`.
4. Inspect the existing M2 subtask domain/persistence boundaries and current task-card/list-board state before source changes.
5. Implement only the narrow ordered Subtasks UI slice with deterministic Rust/static/visual coverage.
6. Validate exact PR head on authoritative Windows CI before merge; after merge validate resulting main and reconcile tracking again.

## USER ACTION REQUIRED

**None.**

## BLOCKERS / NOT RUN

- No product/user decision currently blocks the next ordered slice.
- Local checkout/toolchain validation in this connector-only environment: **NOT RUN**.
- Windows GitHub Actions remains authoritative for frontend, Rust/Tauri, visual and artifact validation.
