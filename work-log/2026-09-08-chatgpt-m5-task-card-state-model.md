# M5 Task-card state model — validated

Date: 2026-09-08 (Europe/Athens)

Agent/tool: ChatGPT / GitHub connector

## Milestone / slice

Milestone 5 — `Task-card state model: normal, hover/action-revealed, scheduled, overdue, done, inline-create, notes-expanded, subtasks-expanded, paused/editable, destructive-confirm`.

This log records completion and validation of only that ordered item. The following drag/drop/reorder slice remains separate.

## Reachable source commits

Final validated PR #85 head:

`e192df8a920cfb2c9227c734ca47a2307dc21dc2`

Expected-head guarded squash merge / validated main source SHA:

`9a93ae58c235a0d56b3879bb48d553dcb021aeb7`

Markdown-only tracking descendants do not replace that validated source/test SHA.

## Material implementation

Validated source behavior includes:

- reusable `TaskCard` presentation used by the real List Board;
- production-derived normal, scheduled, overdue and done presentations from authoritative board read metadata;
- authoritative durable Time Taken projection through the existing persistence/session boundary, serialized losslessly as a decimal string for renderer display;
- scheduled local date/time projection without changing persisted scheduling semantics or `manual_lane`;
- read-only overdue classification using validated M4 scheduling/focus eligibility semantics plus display-local date comparison for date-only schedules;
- fixed reserved completion/action/title geometry so action-revealed hover/focus presentation cannot reflow the card/title or move pointer targets;
- deterministic fixture-only action-revealed, inline-create, notes-expanded, subtasks-expanded, paused/editable and destructive-confirm states where real mutation behavior belongs to later ordered slices;
- fixture-only notes state explicitly preserving manual URL activation, with no auto-open/href navigation path in `TaskCard`;
- fixture-only destructive confirmation that performs no task delete/archive mutation;
- representative board fixture metadata for scheduled, overdue, done and durable Time Taken states;
- deterministic light/dark `task-card-states` fixture, Microsoft Edge capture wiring, semantic/geometry validator and `test:ui-task-card-states` frontend-preflight coverage.

Changed source/test surfaces in PR #85 were confined to:

- `src-tauri/src/list_board.rs`;
- `src/ListBoard.tsx`;
- `src/TaskCard.tsx`;
- `src/listBoard.css`;
- `src/listBoardApi.ts`;
- `src/visualFixtures.css`;
- `src/visualFixtures.tsx`;
- `scripts/capture-visual-fixtures.ps1`;
- `scripts/test-ui-list-board.mjs`;
- `scripts/test-ui-task-card-states.mjs`;
- `scripts/validate-task-card-state-captures.mjs`;
- `package.json`;
- branch `HANDOFF.md` tracking.

Explicitly not implemented in this slice: drag/drop/reorder, real task create/edit mutation, completion/move/delete handlers, EST/Time Taken mutation UI, scheduling/recurrence editor, subtask mutation, rich notes editor/link activation, list settings, search, Settings or Reports.

## Decisions / reasoning

- The board/task-card production path remained read-only because the ordered item is a state-model/presentation slice; mutation behavior is intentionally deferred to its own ordered items.
- Durable Time Taken is projected from the established authoritative persistence/session model rather than copied into renderer-owned state.
- Overdue presentation reuses validated M4 schedule/eligibility semantics instead of inventing a second scheduling model in React.
- Action reveal uses reserved/overlay geometry to directly address the historical jumping-action-button UX risk while preserving keyboard/focus equivalence.
- Inline create, expanded notes/subtasks, paused/editable and destructive-confirm states are deterministic fixtures only where the real persistence-backed behaviors are not yet the ordered task. The fixtures do not fake mutation success.
- Notes remain explicit-activation only; entering a task/focus presentation must never auto-launch URLs.
- No new product policy or architecture deviation was introduced.

## Validation evidence

### Local

Connector-only checkout/toolchain validation: **NOT RUN**. The environment did not provide a usable local repository/toolchain path. Windows GitHub Actions remained the authoritative reproducible gate; unavailable local checks were not described as PASS.

### PR correction history

Windows PR CI #316:

- run `34267196942`;
- exact head `8e7ffece46c2ce882a3983f24610ac16d83b9b39`;
- conclusion: **FAILURE**;
- failure was confined to `cargo fmt --check` in `src-tauri/src/list_board.rs`;
- frontend/static task-card checks and production frontend build had already passed before the formatting gate stopped the run.

Evidence-backed correction:

- forward commit `e192df8a920cfb2c9227c734ca47a2307dc21dc2`;
- applied only the exact Windows rustfmt output to `src-tauri/src/list_board.rs`;
- corrective compare touched one file and did not change runtime/test semantics.

### Exact PR-head validation

PR #85 — `M5: add task card state model`.

Windows PR CI #317:

- run `34270409390`;
- job `102210278846`;
- exact head `e192df8a920cfb2c9227c734ca47a2307dc21dc2`;
- conclusion: **SUCCESS**;
- Repository Preflight: **PASS**;
- Capture Visual Regression Fixtures: **PASS**;
- Upload Visual Regression Artifact: **PASS**;
- Tauri Release: **PASS**;
- Upload Diagnostic Harness Artifact: **PASS**;
- visual artifact `10073839851`, digest `sha256:3503ab0dc7e9e601af07f640667e73a95971748f78321b958c81977a0c09d5f5`;
- diagnostic artifact `10074080790`, digest `sha256:c6d745469ff4914a75aaf182463ee6041b604677db6451386e4080507076fc1e`;
- final exact-head changed-file/semantic review: **PASS**;
- issue comments: none;
- submitted reviews: none;
- inline review threads: none.

PR #85 was squash-merged only with expected-head guard `e192df8a920cfb2c9227c734ca47a2307dc21dc2`.

### Resulting-main validation

Validated source/test SHA:

`9a93ae58c235a0d56b3879bb48d553dcb021aeb7`

Windows main CI #318:

- run `34271876368`;
- job `102215181335`;
- exact source SHA `9a93ae58c235a0d56b3879bb48d553dcb021aeb7`;
- conclusion: **SUCCESS**;
- Repository Preflight: **PASS**;
- Capture Visual Regression Fixtures: **PASS**;
- Upload Visual Regression Artifact: **PASS**;
- Tauri Release: **PASS**;
- Upload Diagnostic Harness Artifact: **PASS**;
- visual artifact `10074394863`, digest `sha256:077835b516adbaecef115ae621d5765933f20672cc2b0768c949c137092d6272`;
- diagnostic artifact `10074634760`, digest `sha256:18871e7966d097c3f8b7d13987d7debac8aacf612f2ecbf962dc138315f8a951`.

No interactive Windows-only observation was required for this presentation/read-projection slice beyond the automated Windows Edge/release gates.

## Tracking reconciliation

This validated slice advances Milestone 5 from 12/28 to **13/28** top-level items.

Tracking reconciliation:

- `TODO.md`: task-card state-model checkbox becomes `[x]` only after main CI #318 PASS;
- `STATUS.md`: validated source baseline and PR/main CI/artifact evidence advance to PR #85 / source `9a93ae58...`; Task-card state model becomes completed;
- `HANDOFF.md`: task-card slice becomes historical validated evidence and active continuation advances to the next ordered drag/drop/reorder slice;
- this file is the new immutable work-log entry for the completed slice.

## Blockers / limitations

- User/product blocker: none.
- Local toolchain validation: NOT RUN as described above.
- The fixture-only expanded/edit/destructive states are not evidence that their future mutations exist; later ordered slices must implement and validate those behaviors independently.

## Exact continuation point

Begin the next ordered M5 item: `Drag/drop or equivalent reorder/move behavior with stable placeholder/drop animation`.

Before editing, inspect the validated M2 task reorder/move persistence APIs and regression tests, current List Board/TaskCard renderer path, relevant UI motion/drag evidence, and the reorder/duplicate corruption family in `docs/BLITZIT_HISTORY_RISK_INDEX.md`.

The next implementation must preserve exact task identity count/set across repeated same-lane reorder and cross-lane move, including scheduled tasks; UI ordering must update only after persistence success; animation/placeholder state must never own domain completion; and reduced-motion/keyboard accessibility must remain usable.