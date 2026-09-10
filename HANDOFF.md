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

Open PR:

**#91 — `M5: add Subtasks UI`**

Initial exact PR head validated by CI #355:

`5ab6dc2d4d4b1eabc33aa77be84f1e9410e5d4d0`

Current formatter-corrected source/test candidate before this HANDOFF-only descendant:

`fe738146cec2cca6f8f1e638935fe347ca6b6c59`

The current PR head after this tracking commit must receive a fresh exact-head Windows CI run; intermediate source-only runs do not count once the branch advances.

## USER-FACING PROGRESS

**`M-5/10 | 2/5 | 18/28`**

Current five checkpoints:

1. mandatory inspection + narrow subtask mutation/read/UX contract — **COMPLETE**;
2. authoritative subtask command/frontend implementation + deterministic Rust/static/visual coverage + semantic/diff review — **COMPLETE**;
3. exact PR-head Windows CI — **IN PROGRESS**;
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

- Every renderer mutation binds the expected parent task and list.
- Title edits compare the expected prior title and only update title/`updated_at`.
- Completion toggles compare the expected prior completion state and only update completion/`updated_at`.
- Reorder compares the renderer's expected current ordered ID sequence inside the same transaction before assigning the requested sequence; a concurrent reorder or create/delete fails stale rather than being overwritten.
- Delete compares expected `updated_at` before deleting/compacting.
- Renderer-facing guarded mutations use an immediate SQLite transaction so validation and write form one authoritative boundary.
- Creation appends to the authoritative persisted order after validating exact parent/list/mutable state; it never creates renderer-side IDs or ranks.

### List Board / UX contract

- Normal task cards show authoritative completed/total subtask progress without renderer polling.
- Full rows load through one task-scoped Rust command on expansion.
- Aggregate All Lists and completed Done tasks may expose rows read-only; mutations remain blocked.
- Supported Main-window actions: add, title edit, complete/uncomplete, move up/down, delete.
- Completing the last subtask does not auto-complete the parent task.
- Full management remains available while the parent task is live; parent title/metric/schedule restrictions remain independent.
- Opening the panel locks conflicting task reorder/create/title/metric/schedule interactions and list switching.
- Subtask controls are excluded from parent drag initiation.
- Mutation success is persistence-first. After commit, authoritative subtask rows and board progress refresh together. A committed mutation plus failed secondary refresh enters the existing fail-closed mutation-blocked path.
- Pointer actions have keyboard/focus-visible equivalents and icon-only controls have accessible names/tooltips.

## CHECKPOINT 2 — IMPLEMENTED AND REVIEWED

### Authoritative persistence / command boundaries

- Added `src-tauri/src/persistence/subtask_board.rs` with `TransactionBehavior::Immediate` guarded create/title/completion/reorder/delete boundaries.
- Renderer writes validate task/list binding, expected title/completion/version/order and preserve stable subtask identity.
- Reorder validates duplicate-free equal identity sets and current expected order before rank rewrite.
- Delete validates expected `updated_at` and compacts remaining ranks in the same transaction.
- Added `src-tauri/src/board_task_subtasks.rs` typed Tauri commands with stable `SUBTASK_STALE`, `SUBTASK_NOT_ALLOWED` and `SUBTASK_FAILED` codes; raw SQL remains out of the command/React layer.
- Completed-parent reads remain available with `mutable=false`; mutations remain rejected by authoritative M2 parent/list rules.
- Commands/modules are registered through `lib.rs` / `persistence/mod.rs`.

### Board projection / frontend behavior

- `ListBoardTask` projects authoritative subtask total/completed counts; deterministic Rust board tests cover 2 total / 1 completed without changing identity/lane/time metadata.
- `listBoardApi.ts` exposes typed subtask DTOs and mutation requests.
- Added production `TaskSubtasks.tsx`; `TaskCard` renders progress and real expanded rows rather than relying on fixture-only presentation.
- `ListBoard` owns one transient expanded-panel state, loads authoritative rows on open and keeps conflicting parent mutations locked while the panel is open.
- All Lists and Done are read-only; active individual-list tasks can mutate even when the parent task is live.
- Create/edit/toggle/reorder/delete are persistence-first and refresh both the task-scoped subtask snapshot and board snapshot after commit.
- Post-commit refresh failure explicitly reports that the subtask change was saved and blocks unsafe follow-up mutations until the board is reloaded.
- Parent task drag start ignores `[data-task-subtask-control]` descendants.
- Expanded subtasks suppress the parent reorder action rail while retaining the fixed `4.25rem` title/action slot.
- A defensive rendered-parent identity gate compares the nearest `data-task-id` card identity with persisted `subtask.taskId` before any row mutation callback, preventing stale/mismatched rows from entering the pending mutation state.

### Deterministic coverage / visual evidence

- Added Rust regressions for stale title/completion and stale reorder/delete non-clobbering, completed-parent read-only behavior and board count projection.
- Added `scripts/test-ui-task-subtasks.mjs` covering persistence/command layering, stale guards, exact identity-set reorder, read-only states, combined refresh, drag isolation, no polling, scope exclusions and rendered-parent identity gating.
- Added production `task-subtasks-fixture.html`, `taskSubtasksVisualFixture.tsx/.css` and `validate-task-subtask-captures.mjs` for light/dark expanded, inline-edit and completed read-only states plus fixed parent title/action geometry.
- Wired the new static test and Windows capture validator into `package.json`, Vite and `capture-visual-fixtures.ps1`.
- Legacy list-board/create-edit/hover static guards were narrowed only enough to admit ordered subtask controls while continuing to forbid unordered parent-task completion/delete and requiring subtask-control drag isolation.

### Review findings resolved before PR

- Branch diff review caught an accidental full replacement of `persistence/mod.rs` that removed existing migration tests. It was restored from the validated base; the final slice diff contains only the intended `pub mod subtask_board;` addition there.
- A stale static assertion expected an earlier subtask-count helper name; it now checks the actual `subtask_counts` projection.
- A defensive UI review found that an impossible-under-normal-rendering mismatched subtask callback could set `pending=true` before returning. Row mutation controls now fail closed against the rendered parent task identity before invoking the board orchestrator, with a static regression requiring all five row mutation affordances to use the guard.
- Final compare from slice base to the reviewed source/test candidate is limited to 22 Subtasks UI / deterministic harness / branch-tracking files; no notes/search/archive/theme/timer-domain source scope was absorbed.

## CHECKPOINT 3 — WINDOWS CI EVIDENCE

### Windows CI #355 — FAILED / not counted

- run ID: `34511182147`
- job ID: `102985411935`
- initial exact PR head: `5ab6dc2d4d4b1eabc33aa77be84f1e9410e5d4d0`
- Repository Preflight: **FAILED** at `cargo fmt --check`.
- Every frontend/static contract before Rust formatting passed, including the new `test:ui-task-subtasks`, all earlier M5 guards, and the TypeScript/Vite production build with `task-subtasks-fixture.html`.
- Visual capture, release build and artifact uploads were skipped because preflight stopped at formatting.
- The log showed formatting-only diffs in exactly three Rust files:
  - `src-tauri/src/board_task_subtasks.rs`
  - `src-tauri/src/list_board.rs`
  - `src-tauri/src/persistence/subtask_board.rs`
- Evidence-backed formatter-only commits:
  - `e67169038e9c5dfd981b631b1dc498a062856152` — board subtask command rustfmt output;
  - `07bffcebd34b51d9353e955b5c340183d931bf42` — list-board count rustfmt output;
  - `fe738146cec2cca6f8f1e638935fe347ca6b6c59` — subtask persistence rustfmt output.
- Compare `5ab6dc2d...` → `fe738146...` touches only those three files and only the exact formatter shapes reported by CI; no behavior changed.

Checkpoint 3 remains open until a fresh Windows CI run succeeds completely on the newest exact PR head, including preflight, visual captures/upload, Tauri release and diagnostic artifact upload.

## INVARIANTS THAT MUST NOT REGRESS

- authoritative Rust/domain/persistence state and persistence-first mutation semantics remain authoritative;
- stable task and subtask identities are mandatory;
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

Fetch PR #91's current exact head after this HANDOFF-only tracking commit and inspect the Windows CI run associated with that exact SHA. If CI fails, inspect the exact failing job log and fix only evidence-backed problems. Do not merge or increment checkpoint 3 until the complete required Windows gate succeeds on the exact PR head.

## USER ACTION REQUIRED

**None.**

## BLOCKERS / NOT RUN

- No product/user decision blocks the slice.
- Local checkout/toolchain validation in this connector-only environment: **NOT RUN**.
- Windows GitHub Actions remains authoritative for frontend, Rust/Tauri, visual and artifact validation.
