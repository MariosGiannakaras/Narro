# HANDOFF.md

This is the canonical zero-context continuation state for Narro. Start with `AI_START_HERE.md`, `AGENTS.md`, `ENGINEERING_QUALITY.md`, `AGENT_WORKFLOW.md`, this file, the active Milestone 5 section in `TODO.md`, relevant `STATUS.md`, `docs/PRODUCT_SPEC.md`, `docs/UI_UX_SPEC.md`, `docs/BEHAVIOR_MATRIX.md`, `docs/BLITZIT_HISTORY_RISK_INDEX.md`, and the newest relevant immutable `work-log/*.md` entries.

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

This is the expected-head guarded merge of PR #90 — `M5: add scheduling and recurrence editor`. PR Windows CI #353 and resulting-main Windows CI #354 are both **SUCCESS**. Detailed evidence: `work-log/2026-09-10-1105-chatgpt-m5-scheduling-recurrence-ui.md`.

Markdown-only tracking descendants do not replace this validated source/test baseline.

## ACTIVE IMPLEMENTATION

**M5 Main UI — Subtasks UI.**

Active branch: `m5-subtasks-ui`

Branch base / main tracking tip at slice start:

`1c4f14500265df9376384b5c608f7147e851e099`

No implementation PR exists yet for this slice.

## USER-FACING PROGRESS

**`M-5/10 | 1/5 | 18/28`**

Current five checkpoints:

1. mandatory inspection + narrow subtask mutation/read/UX contract — **COMPLETE**;
2. authoritative subtask command/frontend implementation + deterministic Rust/static/visual coverage + semantic/diff review — **IN PROGRESS**;
3. exact PR-head Windows CI — PENDING;
4. final exact-head review + expected-head merge — PENDING;
5. resulting-main Windows CI + tracking/work-log reconciliation — PENDING.

## CHECKPOINT 1 — EVIDENCE-BACKED CONTRACT

### Existing authoritative M2 behavior

- `domain::subtasks::SubtaskRecord` owns stable `SubtaskId`, stable parent `TaskId`, title, `sort_rank`, optional `completed_at`, and timestamps.
- `persistence::subtasks` already implements create/read/title update/complete/reopen/exact-set reorder/delete.
- Create appends at the next persisted rank; delete compacts ranks.
- Reorder rejects duplicate IDs and any set mismatch and persists a contiguous rank order.
- Existing M2 integration tests prove CRUD/completion/reorder/delete preserve identities, stale/duplicate reorder does not partially write, ordering/completion survive database reopen, and history remains readable after parent completion/archive.
- Subtask mutation is forbidden when the parent task is completed or archived or when the parent list is archived. Reads remain available for historical/completed parents.

### Renderer-facing stale-write policy

The existing M2 APIs are authoritative domain primitives, but the M5 renderer needs expected-state guards so stale UI cannot overwrite newer changes.

- Every renderer mutation binds the expected parent task and list.
- Title edits compare the expected prior title and only update title/`updated_at`.
- Completion toggles compare the expected prior completion state and only update completion/`updated_at`.
- Reorder compares the renderer's expected current ordered ID sequence inside the same transaction before assigning the requested sequence; a concurrent reorder or create/delete must fail stale rather than be overwritten.
- Delete is destructive and must compare expected `updated_at` before deleting/compacting.
- Renderer-facing guarded mutations use an immediate SQLite transaction so validation and write form one authoritative boundary.
- Creation may append to the current authoritative persisted order after validating the exact parent/list/mutable state; it never creates renderer-side IDs or ranks.

### List Board projection/read contract

- Normal task cards show authoritative completed/total subtask progress without per-card polling.
- The board snapshot therefore projects subtask counts with each task.
- Full subtask rows are loaded through one task-scoped Rust command when the user expands a real individual-list task; renderer memory is only a draft/presentation cache.
- Aggregate All Lists remains read-only for this Main-window mutation slice; it may display projected progress but does not expose subtask mutation affordances.
- Completed tasks may expose their persisted subtask rows read-only; mutation remains blocked by the authoritative parent-state rules.

### Main-window UX contract

- A compact progress/expand affordance lives in task metadata and does not change the fixed title/action slot geometry.
- Expanded subtasks show completed/total progress and persisted rows in persisted order.
- Supported actions: add, click/keyboard title edit, complete/uncomplete, move up/down, delete.
- Completing the last subtask does **not** automatically complete the parent task; parent completion remains an explicit task action outside this slice.
- Opening/using the expanded subtask editor locks conflicting task-card/board mutations as needed: task reorder, task create/title/metric/scheduling mutation cannot race a subtask write.
- Subtask controls are excluded from task drag initiation.
- Mutation success is persistence-first. After commit, refresh the authoritative subtask read and board snapshot. If the mutation committed but a secondary refresh fails, report the committed state as saved and block unsafe follow-up mutations until authoritative state is reloaded.
- Pointer actions have keyboard/focus-visible equivalents; icon-only actions have accessible names/tooltips.

### Scope exclusions

Do not absorb rich notes/URL activation, parent task completion/delete/archive UI, list settings, search, archives, theme settings, Reports, Focus Panel/Floating Timer product UI, or later milestones.

## CHECKPOINT 2 IMPLEMENTATION DIRECTION

1. Add renderer-facing guarded persistence functions for subtask title/completion/reorder/delete plus parent/list-bound create/read.
2. Add `board_task_subtasks` Tauri commands with stable machine-readable error codes and no raw SQL in React.
3. Project subtask completed/total counts in `ListBoardTask` and mirror them in `listBoardApi.ts` fixtures/types.
4. Replace fixture-only `subtasks-expanded` production path with real TaskCard/ListBoard expanded state while preserving the existing fixture evidence for deterministic state-model coverage.
5. Add deterministic Rust/static/Windows visual coverage including identity/order stale guards, read-only completed state, drag isolation, progress geometry and light/dark expanded presentation.
6. Perform semantic/diff review before opening a PR.

## INVARIANTS THAT MUST NOT REGRESS

- authoritative Rust/domain/persistence state and persistence-first mutation semantics remain authoritative;
- stable task identities and stable subtask identities are mandatory;
- subtask create/reorder/delete cannot alias, duplicate or silently remove unrelated identities;
- renderer-independent timer/session accounting and tracked Time Taken are not rewritten by subtask edits;
- a committed mutation plus failed renderer refresh/broadcast is not reported as authoritative mutation failure;
- All Lists remains an aggregate read projection;
- scheduling/date-only/timezone/recurrence semantics validated through M4/M5 remain unchanged;
- stale recurrence update/remove/replace requests continue to fail atomically before destructive child work;
- task-card title/action/edit/schedule geometry and pointer targets remain stable;
- notes never auto-launch URLs;
- excluded account/trial/upgrade/profile/AI/integration controls remain absent;
- diagnostics remain gated behind `?diagnostics=1`.

## EXACT NEXT ACTION FOR A ZERO-CONTEXT AGENT

Continue checkpoint 2 on `m5-subtasks-ui`: implement the guarded subtask persistence/command boundary first, then board projection + typed frontend API, then production TaskCard/ListBoard UI and deterministic tests/visual fixtures. Do not open a PR until semantic/diff review is complete.

## USER ACTION REQUIRED

**None.**

## BLOCKERS / NOT RUN

- No product/user decision blocks the slice.
- Local checkout/toolchain validation in this connector-only environment: **NOT RUN**.
- Windows GitHub Actions remains authoritative for frontend, Rust/Tauri, visual and artifact validation.
