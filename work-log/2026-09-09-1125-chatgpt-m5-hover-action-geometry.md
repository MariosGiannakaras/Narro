# M5 hover-action geometry — validated

Date: 2026-09-09 11:25 (Europe/Athens)

Agent/tool: ChatGPT / GitHub connector

## Milestone / slice

Milestone 5 — `Ensure hover actions use reserved/overlay slots and never reflow title/card geometry.`

This log records completion and validation of only that ordered item. The next ordered item is `Task creation and inline editing.`

## Reachable source commits

Final validated PR #87 head:

`94d6ef53ba882c4e0022a42eb242a87d427b84c9`

Merged and fully main-validated source SHA:

`f965da939397b22adc6b024e5dd86ee750a18b92`

The PR head and resulting main commit share tree `0928b83c165a21db3c7203094894cd9e4a6af5a4`, so the exact validated source content reached `main`. Markdown-only tracking descendants do not replace that validated source/test SHA.

## Material implementation

Validated source behavior includes:

- production `TaskCard` Move up / Move down actions occupy the existing fixed `4.25rem` reserved action column;
- visible `1.75rem` controls are absolutely overlaid inside the pre-existing `4.25rem × 1.25rem` slot rather than being inserted into title/card flow;
- hover, task-card focus and child focus reveal the action rail through opacity/visibility only, preserving card/title geometry and pointer targets;
- hidden actions retain reserved layout geometry while remaining inert until revealed;
- icon-only actions reuse the shared accessible `Tooltip` primitive and explicit `aria-label`s;
- pointer Move up / Move down and `Alt+ArrowUp/Down` reuse one `handleMoveWithinLane` helper and the already validated persistence-first `commitDrop` reorder boundary;
- action-button pointer initiation is rejected before parent task drag initiation can begin;
- aggregate All Lists, Done, scheduled tasks and otherwise non-reorderable rows remain read-only for these actions;
- deterministic static checks and the task-card visual capture contract require production action DOM, stable card/title dimensions and the original `68×20` reserved action-slot geometry;
- `preflight:frontend` now includes `test:ui-task-hover-actions`.

Changed PR #87 surfaces were confined to:

- `HANDOFF.md`;
- `package.json`;
- `scripts/test-ui-list-board.mjs`;
- `scripts/test-ui-task-card-states.mjs`;
- `scripts/test-ui-task-hover-actions.mjs`;
- `scripts/validate-task-card-state-captures.mjs`;
- `src/ListBoard.tsx`;
- `src/TaskCard.tsx`;
- `src/listBoard.css`.

No Rust, SQLite schema, domain-model or persistence implementation changed in this slice.

Explicitly not implemented: task creation/editing, completion/delete/archive task actions, EST/Time Taken editing, scheduling/recurrence UI, subtasks, notes editing/link activation, list settings, search, Settings or Reports.

## Reliability / interaction decisions

- Hover/focus affordances may reveal controls but may not insert/remove title-row columns or change task-card dimensions.
- The existing reserved action column remains the geometry authority; production controls were placed inside it rather than creating a second layout model.
- Pointer actions reuse the already validated reorder persistence boundary instead of introducing a renderer-only mutation path.
- Action controls do not become drag handles accidentally; their pointer-down path is isolated from task drag initiation.
- Aggregate/scheduled/Done read-only semantics from the validated reorder slice remain unchanged.
- Accessibility is part of the production contract: icon-only controls retain accessible labels/tooltips and focus-based reveal.

## Validation evidence

### Local

Connector-only local checkout/toolchain execution: **NOT RUN**. Semantic/diff review was performed through the GitHub connector. Windows GitHub Actions remained the authoritative reproducible compile/test/release/visual gate.

### Exact PR-head validation

PR #87 — `M5: harden task hover action geometry`.

Windows PR CI #324:

- run `34323668511`;
- job `102375871427`;
- exact head `94d6ef53ba882c4e0022a42eb242a87d427b84c9`;
- conclusion: **SUCCESS**;
- Repository Preflight: **PASS**;
- Capture Visual Regression Fixtures: **PASS**;
- Upload Visual Regression Artifact: **PASS**;
- Tauri Release: **PASS**;
- Upload Diagnostic Harness Artifact: **PASS**;
- visual artifact `10093105381`, digest `sha256:0bb2d5698589e6199b3fbbaad90efb7a9183da74e77d07c8664e95d284a8c5a0`;
- diagnostic artifact `10093299961`, digest `sha256:8e13f9cdcd8f6b3a8b06aed2bb9f59e060ba2b2ee3cdade46812b8edf7bbccc3`.

Final exact-head semantic/diff review: **PASS**. The final changed-file set remained confined to TaskCard/ListBoard/CSS, deterministic frontend static/visual validation, preflight wiring and the in-branch handoff note. No parallel Rust/domain/persistence mutation path was introduced.

PR feedback requiring resolution:

- issue comments: none;
- submitted reviews: none;
- inline review comments/threads: none.

### Merge and resulting-main validation

PR #87 merged at `2026-09-09T07:39:16Z`, producing main source SHA:

`f965da939397b22adc6b024e5dd86ee750a18b92`

Windows main CI #325:

- run `34324954967`;
- job `102379970998`;
- exact source SHA `f965da939397b22adc6b024e5dd86ee750a18b92`;
- conclusion: **SUCCESS**;
- Repository Preflight: **PASS**;
- Capture Visual Regression Fixtures: **PASS**;
- Upload Visual Regression Artifact: **PASS**;
- Tauri Release: **PASS**;
- Upload Diagnostic Harness Artifact: **PASS**;
- visual artifact `10093618064`, digest `sha256:d3dd321cc9ed0b47988217e7a661da14e13f2aec2b7596ae3a71d6ab25ee08cc`;
- diagnostic artifact `10093848439`, digest `sha256:eade32f945641e2a6c22789f40e0294e814d04172035cbf9b87e86d5dc766a68`.

No additional interactive Windows-only observation is required for this geometry/accessibility hardening slice beyond the authoritative Windows compile/test/Edge/release gates.

## Tracking reconciliation

This validated slice advances Milestone 5 from 14/28 to **15/28** top-level items.

- `TODO.md`: hover-action geometry checkbox becomes `[x]` only after main CI #325 PASS;
- `STATUS.md`: validated source baseline advances to `f965da93...`, with PR #87 / PR CI #324 and main CI #325 evidence;
- `HANDOFF.md`: active continuation advances to `Task creation and inline editing`;
- this file is the new immutable work-log entry.

## Blockers / limitations

- User/product blocker: none.
- Local toolchain validation: **NOT RUN**, as described above.
- This slice intentionally adds only the already meaningful reorder actions; later task editing, scheduling, notes and destructive controls remain separate ordered work.

## Exact continuation point

Begin the next ordered M5 item:

`Task creation and inline editing.`

Start from the latest `main` tracking tip while treating `f965da939397b22adc6b024e5dd86ee750a18b92` as the fully validated source/test baseline. Inspect the existing M2 task create/update persistence boundaries, the production List Board / `TaskCard` projection, the reserved add geometry and the screenshot-backed inline-create/edit states. Implement the narrow persistence-first creation/title-edit path without absorbing EST/Time Taken, scheduling/recurrence, subtasks, notes or destructive flows unless a strict dependency is proven.