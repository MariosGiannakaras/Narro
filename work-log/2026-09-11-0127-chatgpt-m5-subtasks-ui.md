# 2026-09-11 — M5 Subtasks UI

## Scope

Completed the ordered Milestone 5 **Subtasks UI** item on top of the previously validated scheduling/recurrence Main-window baseline.

The slice intentionally stayed within Main-window task-card/List Board subtask projection and editing. It did not absorb rich notes, parent task completion/delete/archive, list settings, search, archives, theme settings, Focus Panel/Floating Timer product UI, Reports, or later milestones.

## Validated behavior

- List Board task projections now include authoritative completed/total subtask counts.
- Production task cards expose a compact subtask progress/expand affordance without changing the fixed title/action slot geometry.
- Expanded rows are loaded through a task-scoped Rust command from authoritative SQLite state.
- Active individual-list tasks support persisted subtask add, inline title edit, complete/uncomplete, move up/down and delete.
- Aggregate All Lists and completed Done tasks are read-only for this Main-window slice.
- Subtask management remains available while the active parent task is live; parent task title/metric/schedule restrictions remain independent.
- Opening the subtask panel locks conflicting parent create/title/metric/schedule/reorder/list-switch interactions.
- Subtask controls are excluded from parent drag initiation.
- Successful subtask mutations are persistence-first and then refresh both authoritative subtask rows and board progress.
- If a mutation commits but the authoritative refresh fails, the UI reports the change as saved and blocks unsafe follow-up mutations until the board is reloaded.
- A rendered-parent identity guard rejects a stale/mismatched `subtask.taskId` before row mutation callbacks can enter pending state.
- Completing the final subtask does not auto-complete the parent task.

## Persistence / command boundaries

Added `src-tauri/src/persistence/subtask_board.rs` as the renderer-facing guarded persistence boundary.

- Mutating operations use `TransactionBehavior::Immediate`.
- Every write binds the expected parent task/list.
- Title edit compares expected prior title.
- Completion compares expected prior completion state.
- Reorder validates duplicate-free equal identity sets and the exact expected current order before rank rewrite.
- Delete validates expected `updated_at` and compacts remaining ranks inside the same transaction.
- Stable `SubtaskId` and parent `TaskId` identities are preserved.
- Parent completed/archived and archived-list mutation restrictions continue to come from the established M2 domain/persistence model.

Added `src-tauri/src/board_task_subtasks.rs` with typed Tauri commands and stable renderer error classes:

- `SUBTASK_STALE`
- `SUBTASK_NOT_ALLOWED`
- `SUBTASK_FAILED`

Raw SQL remains out of React and out of the command orchestration layer.

## Frontend / visual coverage

- Added typed subtask DTOs and commands in `src/listBoardApi.ts`.
- Added production `src/TaskSubtasks.tsx` and wired it through `TaskCard` / `ListBoard`.
- Added static production-contract coverage in `scripts/test-ui-task-subtasks.mjs`.
- Added light/dark production visual fixture and validator for expanded, inline-edit and completed read-only states.
- Added Windows capture integration through Vite, `capture-visual-fixtures.ps1` and `package.json`.
- Legacy task-card/list-board/create-edit/hover guards were narrowed only enough to admit ordered subtask controls while retaining parent drag/action invariants.

## Review findings fixed before final validation

- Restored an accidentally replaced `persistence/mod.rs`; final diff contains only the intended `pub mod subtask_board;` addition there.
- Corrected a stale static assertion to the actual `subtask_counts` board projection helper.
- Fixed a defensive pending-state lock leak possibility by rejecting persisted subtask rows whose `taskId` does not match the rendered parent card before any mutation callback.

## PR and CI evidence

PR #91 — `M5: add Subtasks UI`

Final exact validated PR head:

`929c5042a095dfcedc1343ff680080fb2d229cbe`

### Failed exact-head run — not counted

Windows CI #355:

- run `34511182147`
- job `102985411935`
- head `5ab6dc2d4d4b1eabc33aa77be84f1e9410e5d4d0`
- frontend/static contracts and TypeScript/Vite build passed
- failed only at `cargo fmt --check`
- visual/release/artifact steps were skipped

The exact rustfmt output was applied only to:

- `src-tauri/src/board_task_subtasks.rs`
- `src-tauri/src/list_board.rs`
- `src-tauri/src/persistence/subtask_board.rs`

A compare from the failed head to the formatter-corrected source candidate showed only those formatting changes; no production semantics changed.

### Final PR-head validation

Windows CI #359:

- run `34511982661`
- job `102988191474`
- exact PR head `929c5042a095dfcedc1343ff680080fb2d229cbe`
- conclusion: **SUCCESS**
- Repository Preflight: **PASS**
- Capture Visual Regression Fixtures: **PASS**
- Upload Visual Regression Artifact: **PASS**
- Tauri Release: **PASS**
- Upload Diagnostic Harness Artifact: **PASS**
- visual artifact `10166459738`, digest `sha256:176f7bf17badd1efd8aafeaaa09110ce44568ed70588db064e38abc412244ef8`
- diagnostic artifact `10166706435`, digest `sha256:c52c6c764b29e3147de21c5e733948e985ca5de5aa091ebb7c7eb9cdec709a4c`
- issue comments: none
- submitted reviews: none
- inline review threads: none
- final exact-head semantic/diff review: **PASS**

PR #91 was merged with expected-head guard:

`expected_head_sha=929c5042a095dfcedc1343ff680080fb2d229cbe`

Resulting main source SHA:

`120bf882b67c54d832a1116f8fa024fe2727e155`

Source tree:

`6c898857c43a1f25d147d4af1eec6d3f4d08a1a2`

Merge parents:

- previous main tracking tip `1c4f14500265df9376384b5c608f7147e851e099`
- validated PR head `929c5042a095dfcedc1343ff680080fb2d229cbe`

### Resulting-main validation

Windows CI #360:

- run `34536225635`
- job `103068350228`
- event `push`
- exact source SHA `120bf882b67c54d832a1116f8fa024fe2727e155`
- conclusion: **SUCCESS**
- Repository Preflight: **PASS**
- Capture Visual Regression Fixtures: **PASS**
- Upload Visual Regression Artifact: **PASS**
- Tauri Release: **PASS**
- Upload Diagnostic Harness Artifact: **PASS**
- visual artifact `10175731468`, digest `sha256:5a7d009113217741067605456948ec7b7ed323974d265b28a663580fa68285ab`
- diagnostic artifact `10175926487`, digest `sha256:01d5f5fdf8d4c825a12c6ab15e2532b470682c1a971f6349efe0b6ef24af7e32`

## Tracking reconciliation

- `TODO.md`: **Subtasks UI** marked complete.
- Milestone 5: **19/28** top-level items validated.
- Validated source/test baseline remains `120bf882b67c54d832a1116f8fa024fe2727e155`.
- Markdown-only tracking descendants do not replace the validated source SHA.

## Invariants carried forward

- authoritative Rust/domain/persistence state remains authoritative;
- persistence-first mutation semantics remain the success boundary;
- stable task and subtask identities are mandatory;
- renderer-independent timer/session accounting and Time Taken must not be rewritten by task metadata/subtask/note edits;
- a committed mutation plus failed renderer refresh is not reported as authoritative mutation failure;
- All Lists remains an aggregate read projection;
- scheduling/date-only/timezone/recurrence semantics remain unchanged;
- task-card reserved action/title geometry remains fixed through hover/edit/expanded states;
- notes URLs require explicit click/keyboard activation and must never auto-launch merely because a task becomes live;
- excluded account/trial/upgrade/profile/AI/integration controls remain absent;
- diagnostics remain gated behind `?diagnostics=1`.

## Exact next ordered action

Begin the next Milestone 5 item: **Rich task notes editor/viewer with clickable URLs**.

Before source changes, reconstruct the existing M2 constrained rich-note persistence model and the current task-card/List Board interaction locks, then define a narrow five-checkpoint implementation slice. Keep the following TODO items separate unless an actual dependency requires combining them: explicit no-auto-launch URL policy, larger/resizable Notes editing presentation, and WebView/browser spellcheck.

No user/product decision currently blocks the next slice.
