# M5 task creation and inline editing — validated

Date: 2026-09-09 14:32 (Europe/Athens)

Agent/tool: ChatGPT / GitHub connector

## Milestone / slice

Milestone 5 — `Task creation and inline editing.`

This immutable log records completion and validation of only that ordered item. The next ordered Milestone 5 item is `EST and Time Taken display/edit states.`

## Reachable source commits

Final validated PR #88 head:

`ce89c473a7306982ce43a8a07fce43f3ecc1ee02`

Merged and fully main-validated source SHA:

`a7e6ed1d89d7592e1bf514e56f1e47e63495cbad`

Resulting main tree:

`bc5b22bc7093a7355b6bb0f93e1e88aa54d3a893`

Markdown-only tracking descendants after this point do not replace the validated source/test SHA above.

## Material implementation

Validated behavior includes:

- `src-tauri/src/board_task_editor.rs` exposes typed renderer-facing `create_list_board_task` and `update_list_board_task_title` commands;
- task creation reuses the existing M2 transactional `persistence::tasks::create_task` authority rather than introducing renderer/raw-SQL task creation;
- creation generates a stable task identity, appends inside the requested real pending bucket and rejects blank/missing/archived targets through typed command errors;
- `src-tauri/src/persistence/task_title_edit.rs` owns an atomic expected-state title-only persistence boundary;
- expected list/title and active task/list conditions are checked within the same SQLite transaction/write boundary;
- the title-only write changes only `title` and `updated_at`, so stale renderer state cannot overwrite EST, Time Taken/session-owned data, list/lane/order, scheduling metadata or completion state;
- stale expected-title/list, archived task/list and blank-title paths have deterministic Rust regressions;
- create identity/append/blank behavior has deterministic Rust coverage at the board command boundary;
- `src/listBoardApi.ts` exposes typed create/title-edit IPC helpers;
- production individual-list Backlog / This Week / Today lanes expose bottom `+ ADD TASK` controls;
- Done and aggregate All Lists expose no creation target;
- production inline creation is deliberately title-only in this slice; EST input/parsing remains deferred to the next ordered M5 item;
- clicking a production task title opens an inline title editor inside the existing fixed title/action grid;
- Enter/Save commits title editing and Escape/Cancel abandons the draft;
- title/edit controls are excluded from parent drag initiation;
- the existing reserved `4.25rem` action column remains the geometry authority, so edit/action reveal does not reflow title/card geometry;
- no optimistic task insertion or title rewrite is published before authoritative persistence succeeds;
- after a durable mutation, the renderer re-reads `getListBoardSnapshot` as the authoritative board projection;
- a successful mutation followed by failed snapshot refresh is explicitly reported as saved-but-not-refreshed and further board mutation is blocked until a clean reload/list switch, preventing unsafe retry of an already committed mutation;
- deterministic frontend/static contracts cover persistence layering, stale-state guards, accessibility/interaction markers, create/edit scope exclusions and the absence of EST mutation UI;
- Windows visual capture validation requires exactly three individual pending-lane Add Task targets, none in Done/All Lists, while preserving screenshot-backed inline-create/EST evidence;
- existing List Board, hover-action and reorder static contracts were evolved only where the new shared create/edit refresh boundary changed their correct source location.

Explicitly not implemented in this slice:

- top-priority lane insertion via the reserved top `+` slot;
- create-task shortcut;
- EST parsing/editing;
- Time Taken editing;
- completion/delete/archive task actions;
- scheduling/recurrence UI;
- subtasks;
- notes editing/link activation;
- list settings;
- search;
- Settings or Reports.

## Reliability decisions

- SQLite/domain persistence remains authoritative; React never manufactures a durable task identity or reports unsaved renderer state as committed.
- The expected-title/list guard is atomic with the title write, closing the stale-check/write race that would exist if validation occurred outside the transaction.
- Title-only persistence cannot reset EST or Time Taken. This is especially important because tracked-time loss/manual Time Taken divergence remains a current source-product reliability family in `docs/BLITZIT_HISTORY_RISK_INDEX.md`.
- Creation is limited to real individual pending lanes. All Lists remains an aggregate projection and Done is not a creation target.
- Bottom append creation is implemented now; top-priority insertion is deferred until it can be one atomic persistence operation rather than create-then-reorder with a partial-success window.
- Mutation failure and post-commit refresh failure remain distinct. A secondary refresh failure cannot convert a successful authoritative mutation into an apparent failure that invites duplicate retry.
- Existing stable task identity, reorder/move exact-set, session/time accounting, scheduling and no-layout-shift invariants remain unchanged.

## Changed PR surface

Final PR #88 changed-file set:

- `HANDOFF.md`;
- `package.json`;
- `scripts/test-ui-list-board.mjs`;
- `scripts/test-ui-task-create-edit.mjs`;
- `scripts/test-ui-task-hover-actions.mjs`;
- `scripts/test-ui-task-reorder.mjs`;
- `scripts/validate-task-create-edit-captures.mjs`;
- `src-tauri/src/board_task_editor.rs`;
- `src-tauri/src/lib.rs`;
- `src-tauri/src/persistence/mod.rs`;
- `src-tauri/src/persistence/task_title_edit.rs`;
- `src/ListBoard.tsx`;
- `src/TaskCard.tsx`;
- `src/listBoard.css`;
- `src/listBoardApi.ts`.

No migration/schema change was required.

## Validation evidence

### Local

Connector-only checkout/toolchain execution: **NOT RUN**. The environment did not provide a local repository/toolchain path. Semantic/diff review was performed through the GitHub connector. Windows GitHub Actions was the authoritative reproducible compile/test/release/visual gate.

### PR CI history

PR #88 — `M5: add task creation and inline editing`.

Several early exact-head runs failed and were not counted as progress. Each was fixed only from exact log evidence:

1. a List Board static check still looked for the new Add Task capture assertion in the old general validator;
2. the reorder static contract still searched for committed-refresh failure handling inside `commitDrop` after that logic had correctly moved to shared `handleCommittedRefreshFailure`;
3. `cargo fmt --check` identified formatting-only differences in the new Rust files.

The production behavior did not need speculative changes for those failures.

Final exact PR-head validation:

- final head `ce89c473a7306982ce43a8a07fce43f3ecc1ee02`;
- Windows CI #331;
- run `34340494624`;
- job `102429916044`;
- conclusion: **SUCCESS**;
- Repository Preflight: **PASS**;
- Capture Visual Regression Fixtures: **PASS**;
- Upload Visual Regression Artifact: **PASS**;
- Tauri Release: **PASS**;
- Upload Diagnostic Harness Artifact: **PASS**;
- visual artifact `10099815643`, digest `sha256:0f993845d8d302095c05be8a3edcca6c9dce65c2859e7ae7118ad19d0f4436c5`;
- diagnostic artifact `10100064241`, digest `sha256:1cf9061d914157a5bbb01897f04d8e0b261ee0e8a1e0dd5debecaf0b7222f25a`.

Final exact-head semantic/diff review: **PASS**. The final changed-file set remained confined to the intended task-create/title-edit persistence/command/UI/static/visual surfaces plus tracking and the evidence-backed compatibility updates to existing List Board/reorder validators.

PR feedback requiring resolution:

- issue comments: none;
- submitted reviews: none;
- inline review threads: none.

### Merge

PR #88 merged with an expected-head guard against the exact validated head `ce89c473a7306982ce43a8a07fce43f3ecc1ee02`.

Merge time: `2026-09-09T10:46:29Z`.

Resulting main source SHA:

`a7e6ed1d89d7592e1bf514e56f1e47e63495cbad`

### Resulting-main validation

Windows main CI #332:

- run `34342022923`;
- job `102434764558`;
- exact source SHA `a7e6ed1d89d7592e1bf514e56f1e47e63495cbad`;
- conclusion: **SUCCESS**;
- Repository Preflight: **PASS**;
- Capture Visual Regression Fixtures: **PASS**;
- Upload Visual Regression Artifact: **PASS**;
- Tauri Release: **PASS**;
- Upload Diagnostic Harness Artifact: **PASS**;
- visual artifact `10100383350`, digest `sha256:84facb757045e2f3a47ea128829b116bcad9784165c72e577ef58463c79fe9f7`;
- diagnostic artifact `10100609210`, digest `sha256:6434366a5f35dff7f2a411292fb9e9cf5fc2349515edef80b7f79f60f2332ac6`.

No additional physical Windows-only observation is required for this persistence/UI slice beyond the authoritative Windows compile/test/Edge/release gates.

## Tracking reconciliation

This validated slice advances Milestone 5 from 15/28 to **16/28** top-level items.

- `TODO.md`: `Task creation and inline editing.` becomes `[x]` only after main CI #332 PASS;
- `STATUS.md`: validated source baseline advances to `a7e6ed1d...` and records PR #88 / CI #331 / main CI #332 evidence;
- `HANDOFF.md`: continuation advances to `EST and Time Taken display/edit states.`;
- this file is the immutable completion evidence for the slice.

## Blockers / limitations

- User/product blocker: none.
- Local toolchain validation: **NOT RUN**, as described above.
- Top-priority insertion and create-task shortcut remain intentionally deferred from this item; they must not be silently assumed implemented.

## Exact continuation point

Begin the next ordered Milestone 5 item:

`EST and Time Taken display/edit states.`

Start from the latest main tracking tip while treating `a7e6ed1d89d7592e1bf514e56f1e47e63495cbad` as the fully validated source/test baseline. Re-read the current M2/M3 task metadata and authoritative paused manual-Time-Taken boundaries before exposing UI mutation. Preserve the current source-risk requirements: title/estimate editing must never lose tracked time, live Time Taken edits must use the already validated paused runtime/session rebase boundary, and renderer display must remain a projection of authoritative task/session state.