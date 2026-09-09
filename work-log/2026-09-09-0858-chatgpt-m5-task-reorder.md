# M5 Task reorder/move interaction — validated

Date: 2026-09-09 08:58 (Europe/Athens)

Agent/tool: ChatGPT / GitHub connector

## Milestone / slice

Milestone 5 — `Drag/drop or equivalent reorder/move behavior with stable placeholder/drop animation`.

This log records completion and validation of only that ordered item. The following hover-action geometry checklist item remains separate.

## Reachable source commits

Final validated PR #86 head:

`5096163f67f1c4b673ff6b05059cc9532b9de765`

Expected-head guarded squash merge / validated main source SHA:

`5d91767ba79482fe1d6d25b2965db19e6baac8c2`

Markdown-only tracking descendants do not replace that validated source/test SHA.

## Material implementation

Validated source behavior includes:

- new Rust `board_task_mutation` command boundary for board-driven reorder/move;
- same-lane manual reorder through the validated M2 exact-set `reorder_active_bucket` persistence boundary;
- cross-lane move through the validated transactional M2 `move_task` boundary, preserving the task identity and appending it to the target persisted bucket;
- expected-list/lane stale-state validation plus invalid-anchor rejection before mutation;
- scheduled/completed/archived task rejection for manual board reorder/move;
- individual-list board interaction only; aggregate All Lists and Done remain read-only for this interaction;
- pointer drag/drop plus `Alt+Arrow` keyboard-equivalent reorder/move;
- no optimistic renderer-owned board order: persistence commits first, then the renderer re-reads the authoritative List Board snapshot;
- explicit distinction between a failed authoritative mutation and a post-commit board-refresh failure, avoiding unsafe retries of already committed moves;
- deterministic same-lane blank-area append semantics rather than retaining a stale card anchor;
- stable placeholder and target-lane feedback plus a finite settle presentation using the established motion token and reduced-motion behavior;
- dedicated task-reorder light/dark visual fixture entry and Windows Edge capture/validation;
- evolved List Board static contract plus dedicated `scripts/test-ui-task-reorder.mjs` frontend-preflight coverage.

Changed source/test surfaces in PR #86 were confined to:

- `src-tauri/src/board_task_mutation.rs`;
- `src-tauri/src/lib.rs`;
- `src/ListBoard.tsx`;
- `src/listBoardApi.ts`;
- `src/taskReorder.css`;
- `src/taskReorderVisualFixture.tsx`;
- `src/App.css`;
- `task-reorder-fixture.html`;
- `vite.config.ts`;
- `scripts/capture-visual-fixtures.ps1`;
- `scripts/test-ui-list-board.mjs`;
- `scripts/test-ui-task-reorder.mjs`;
- `scripts/validate-task-reorder-captures.mjs`;
- `package.json`.

Explicitly not implemented in this slice: the next hover-action geometry checklist item, task creation/inline editing, EST/Time Taken mutation UI, scheduling/recurrence editor, subtasks, rich notes, list settings, search, Settings or Reports.

## Reliability decisions / reasoning

- Existing M2 ordering/move primitives were reused rather than creating a second ordering model in the renderer or a parallel persistence path.
- Scheduled pending tasks remain governed by validated M4 effective planning-lane semantics. Manual board drag/move is therefore disabled while a schedule is active instead of presenting a move that schedule projection would immediately override.
- Same-lane reorder keeps the complete persisted bucket exact-set, including scheduled rows, while only an unscheduled task may be the manual moving task/anchor.
- Cross-lane move is deliberately transactional append-to-target for this slice rather than a non-atomic move-then-reorder sequence.
- All Lists is an aggregate projection and cannot safely own a persisted reorder operation, so it remains read-only.
- The renderer never treats a visual drag result as committed until the Rust/SQLite mutation succeeds.
- A successful persistence mutation remains success even if the subsequent board snapshot refresh fails. The UI reports refresh failure separately instead of encouraging a duplicate retry.
- No new product architecture or persistence authority was introduced.

## Regression coverage

Rust tests include:

- `same_lane_reorder_uses_exact_set_and_keeps_scheduled_rows_singular`;
- `scheduled_task_manual_reorder_is_rejected_without_position_write`;
- `cross_lane_move_appends_atomically_and_preserves_exact_global_identity_set`;
- `stale_source_lane_and_wrong_anchor_fail_without_mutation`.

Static/visual coverage asserts:

- validated M2 exact-set reorder and transactional move boundaries are reused;
- stale source/anchor and scheduled-task guards exist;
- Tauri commands and typed renderer wrappers are registered;
- individual-list interaction gating is explicit;
- scheduled tasks are not manually reorderable;
- pointer drag and keyboard alternatives exist;
- persistence precedes renderer snapshot replacement;
- committed-mutation refresh failure is not conflated with mutation failure;
- same-lane blank-area drag resolves to append;
- no continuous animation/poll loop is introduced;
- placeholder, dragging, settling and active-target geometry is captured in light/dark themes;
- scheduled-task non-reorderability remains visible in the captured contract.

## Pre-PR review findings

Repository/diff review before opening PR #86 found and corrected four evidence-backed issues without broadening scope:

1. the prior List Board static test still prohibited drag/drop handlers even though drag/drop was now the ordered item; the test was evolved while retaining the read-model mutation prohibition;
2. the new reorder capture validator required a geometry contract that the fixture initially did not emit; the deterministic contract was added;
3. same-lane drag over blank lane space could retain an older card anchor instead of targeting append; blank-area semantics were made explicit;
4. a successful SQLite mutation followed by a failed snapshot refresh could be reported as a failed move; mutation success and secondary refresh failure were separated.

## Validation evidence

### Local

Connector-only checkout/toolchain validation: **NOT RUN**. The runtime did not provide a usable local Rust/Node checkout/toolchain path. Repository/diff semantic review was performed through the GitHub connector; Windows GitHub Actions remained the authoritative reproducible compile/test/release/visual gate.

### Initial PR CI and correction

PR #86 — `M5: add task reorder and move interactions`.

Windows PR CI #319:

- run `34280633818`;
- job `102244250572`;
- exact head `ecfa71b2a3b1bb6801cd6c47ea9e679f955a3f2b`;
- conclusion: **FAILURE**;
- all frontend/static checks, including task-reorder contracts, and the production frontend build passed;
- failure was confined to `cargo fmt --check` in `src-tauri/src/board_task_mutation.rs`;
- visual/release artifact stages were skipped because preflight stopped at rustfmt.

Evidence-backed correction:

- forward commit `5096163f67f1c4b673ff6b05059cc9532b9de765`;
- changed only `src-tauri/src/board_task_mutation.rs` formatting according to the exact Windows rustfmt output;
- no runtime or test semantics changed.

### Exact PR-head validation

Windows PR CI #320:

- run `34280885956`;
- job `102245092274`;
- exact head `5096163f67f1c4b673ff6b05059cc9532b9de765`;
- conclusion: **SUCCESS**;
- Repository Preflight: **PASS**;
- Capture Visual Regression Fixtures: **PASS**;
- Upload Visual Regression Artifact: **PASS**;
- Tauri Release: **PASS**;
- Upload Diagnostic Harness Artifact: **PASS**;
- visual artifact `10077803918`, digest `sha256:09169f15dd4d4beed6674020da6a4216119bc1365ffff446c614f380759e79ce`;
- diagnostic artifact `10078011804`, digest `sha256:9964d2fb4b44b7c1b6e2168afe257900b7e5bb67b388fc79f7f35f7d2acb159f`;
- final exact-head semantic/diff review: **PASS**;
- issue comments: none;
- submitted reviews: none;
- inline review comments/threads requiring resolution: none.

PR #86 was squash-merged only with expected-head guard `5096163f67f1c4b673ff6b05059cc9532b9de765`.

### Resulting-main validation

Validated source/test SHA:

`5d91767ba79482fe1d6d25b2965db19e6baac8c2`

Windows main CI #321:

- run `34316110248`;
- job `102352553758`;
- exact source SHA `5d91767ba79482fe1d6d25b2965db19e6baac8c2`;
- conclusion: **SUCCESS**;
- Repository Preflight: **PASS**;
- Capture Visual Regression Fixtures: **PASS**;
- Upload Visual Regression Artifact: **PASS**;
- Tauri Release: **PASS**;
- Upload Diagnostic Harness Artifact: **PASS**;
- visual artifact `10090292156`, digest `sha256:4f0bf3c16161894a934d8d885c2e5cc3ce1c4e9dc15ceb9079c14eb13021875b`;
- diagnostic artifact `10090429537`, digest `sha256:58dd8e279a2a248c373ab319b86fd9b4be00769be29e5eb4b038a8fe267905bb`.

No additional interactive Windows-only observation is required for this board interaction/persistence slice beyond the authoritative Windows compile/test/Edge/release gates.

## Tracking reconciliation

This validated slice advances Milestone 5 from 13/28 to **14/28** top-level items.

- `TODO.md`: reorder/move checkbox becomes `[x]` only after main CI #321 PASS;
- `STATUS.md`: source baseline advances to `5d91767b...`, with PR #86 / #319 / #320 and main #321 evidence;
- `HANDOFF.md`: active continuation advances to the next ordered hover-action geometry item;
- this file is the new immutable work-log entry.

## Blockers / limitations

- User/product blocker: none.
- Local toolchain validation: **NOT RUN**, as described above.
- Scheduled tasks remain intentionally read-only for manual board reorder while scheduling owns their effective lane.
- Cross-lane placement is append-to-target in this slice; arbitrary indexed cross-lane insertion was not required to satisfy the ordered item and would have required a broader atomic placement boundary.

## Exact continuation point

Begin the next ordered M5 item:

`Ensure hover actions use reserved/overlay slots and never reflow title/card geometry.`

Inspect the validated `TaskCard` action-revealed state, current production hover/focus behavior, shared overlay/action geometry and captured no-reflow contracts. Implement only the missing production affordance/validation required for this checklist item; keep task creation/editing and later mutation UI out of scope unless a strict dependency is proven.