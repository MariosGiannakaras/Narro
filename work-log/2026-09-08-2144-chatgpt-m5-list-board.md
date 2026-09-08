# M5 List board hierarchy — validated

Date: 2026-09-08 (Europe/Athens)

## Scope

Completed only the ordered Milestone 5 item `List board with Backlog, This Week, Today, Done`.

Validated implementation:

- a read-only Rust `list_board` projection over active lists and stable persisted task identities;
- individual-list and aggregate All Lists targets without creating a synthetic persisted list;
- Backlog / This Week / Today projection for pending tasks through the validated M4 `effective_planning_lane_at` semantics rather than trusting `manual_lane` for scheduled tasks;
- Done projection from completed, non-archived tasks only;
- duplicate-identity fail-closed protection plus checked task-count and aggregate-EST arithmetic;
- active-list target validation and persisted timezone preference use, falling back to the Windows/WebView IANA timezone only when no preference is stored;
- typed renderer-facing `get_list_board_snapshot` read command; no task mutation commands are used by the board;
- real runtime navigation from Home list-card Open, Home All Lists, sidebar All my lists, and in-board list selector switching;
- four-column `ListBoard` hierarchy with title, count, aggregate EST and deliberately baseline/static task rows;
- aggregate-view origin labels for tasks from different lists;
- reserved top/bottom future-add geometry without exposing dead `+` / `ADD TASK` controls;
- deterministic individual and aggregate board light/dark fixtures, Microsoft Edge capture wiring, semantic/geometry validation and `scripts/test-ui-list-board.mjs` frontend-preflight coverage;
- prior List Editor/List Card preflight assertions updated only where the now-real Open target made old literal exclusions stale;
- no detailed task-card state model, drag/drop/reorder, task creation/editing, EST/Time Taken editing, scheduling/recurrence UI, subtasks, notes, destructive task/list flows, search, Settings or Reports behavior was absorbed.

## CI correction history

An earlier PR run exposed two test-infrastructure issues rather than product behavior regressions:

1. Windows PR CI #309 / run `34259918088` / job `102175005224` failed only at `cargo fmt --check`. The exact Windows rustfmt output was applied to `src-tauri/src/list_board.rs` and the `lib.rs` EOF/newline was preserved without changing runtime behavior.
2. A later exact-head run passed Repository Preflight but the new board visual validator expected the first task row to use a 12 px radius. The implementation correctly used the shared `--radius-task-card: 0.625rem` contract, which computes to 10 px; 12 px is the shared panel radius. Only the validator expectation was corrected from 12 px to 10 px.

No domain, persistence or runtime behavior was changed by either correction.

## Exact PR validation

PR #84: `M5: add list board hierarchy`.

Final validated PR head:

`233ab9cb930a5e9cee47d6cbf02d5cd8382c017e`

Windows PR CI #313:

- run `34261787995`;
- job `102181282975`;
- conclusion: **SUCCESS**;
- Repository Preflight: **PASS**;
- Capture Visual Regression Fixtures: **PASS**;
- Upload Visual Regression Artifact: **PASS**;
- Tauri Release: **PASS**;
- Upload Diagnostic Harness Artifact: **PASS**;
- visual artifact `10070458234`, digest `sha256:b9ac6a69c7550e8ae25afbfb3e7f750e847bf4f416ec3ba60a95b4ebcb9bd303`;
- diagnostic artifact `10070674547`, digest `sha256:57d3d5d2c6fec36e228218d1b9f30a12e3c570d1f2e19ce23a1dddc9fc7d8f35`;
- final exact-head semantic/diff review: **PASS**; 15 changed files confined to the list-board read model, navigation integration, board presentation/styles, visual harness/tests and branch tracking;
- PR comments, submitted reviews and inline review threads requiring resolution: **none**.

PR #84 was squash-merged with expected-head guard `233ab9cb930a5e9cee47d6cbf02d5cd8382c017e`.

## Resulting-main validation

Validated source/test SHA:

`d54c4e57933588f89f8f1cf56b1e3dfe5441fd9b`

Windows main CI #314:

- run `34263232684`;
- job `102186124690`;
- exact source SHA `d54c4e57933588f89f8f1cf56b1e3dfe5441fd9b`;
- conclusion: **SUCCESS**;
- Repository Preflight: **PASS**;
- Capture Visual Regression Fixtures: **PASS**;
- Upload Visual Regression Artifact: **PASS**;
- Tauri Release: **PASS**;
- Upload Diagnostic Harness Artifact: **PASS**;
- visual artifact `10071063644`, digest `sha256:1d0fa6ec2579ea5e78fe035eba49c42eef5cd184c8673cb91d02aba56489108e`;
- diagnostic artifact `10071323113`, digest `sha256:4ca72195d7d269edb61bdcdf6f52ac91ad3556ec665142c595284f78d8568c83`.

Markdown-only tracking descendants do not replace the validated source/test SHA above.

## Continuation

Milestone 5 advances to **12 of 28** validated top-level items.

The next ordered item is `Task-card state model: normal, hover/action-revealed, scheduled, overdue, done, inline-create, notes-expanded, subtasks-expanded, paused/editable, destructive-confirm`.

Start from the validated baseline/static board rows, current authoritative persistence/domain metadata, shared overlay/focus/motion primitives and deterministic visual harness. Implement the state-model presentation and only the minimum projection/fixture plumbing required to make those states deterministic and reachable. Keep drag/drop/reorder, actual task creation/editing behavior, EST/Time Taken editing behavior, scheduling/recurrence editor, subtasks editing, notes editor, list settings, search, Settings and Reports out of scope unless a strict dependency is documented.

Blockers: none.