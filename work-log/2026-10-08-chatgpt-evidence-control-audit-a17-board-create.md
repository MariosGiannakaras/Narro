# A17 — board repeated inline task create / priority and destructive separator

Date: 2026-10-08 (Europe/Athens)
Baseline GitHub main `6e900667ba7cb63d6b1192099cb4440f2de0db27`. Independent source → implementation audit only. Source owner Codex paused for review; no source edits, no native UI actions. No open PR or active workflow on entry; original physical CI1046 final handoff kept unchanged.

## Three new narrowly evidenced comparisons

**B46, M5 — inline create persistence.** Pass-3 VE-005 01:25–01:50 explicitly records first `Video` then `Record voice` through inline Today editor, with repeated Confirm/Enter, created cards appearing and inline draft still available for a further entry, until Cancel collapses it. In `src/ListBoard.tsx`, `submitCreate` sets `setEditorState(null)` directly on successful `createListBoardTask`, before refreshing the board. Thus no same-editor repeat entry. This is a **source interaction gap**; do not change committed data/error/focus blindly. Additional modern v2.6.69 source directly confirming repeat behavior is not available, so keep historical-version caveat. Validation needed: two rapid Enter commits, explicit Cancel, no duplicates under latency, form focus, reset title+EST only after commit, safe refresh failure and correct list ownership.

**B47, M5 — initial task priority.** Same source sequence visibly shows `Record voice` above `Video` after the second task's creation through `+ ADD TASK`; top-to-bottom order is priority. Current `BoardLane` ordinary bottom `+ ADD TASK` passes `insertAtTop=false`; `src-tauri/src/board_task_editor.rs` uses `create_task` for false, whose `src-tauri/src/persistence/tasks.rs` obtains `next_bucket_rank` and appends. A separately labeled `ADD TO TOP` uses true/`create_task_at_top`. The observed source ordering conflicts with the normal bottom-create outcome, BUT original capture action entry context/shortcut and historical version may matter. **SOURCE_BEHAVIOR_RECONCILIATION_OPEN** rather than an unqualified defect. Avoid overwriting existing tested explicit top/bottom product choices without a coherent reconstructed insertion contract.

**B48, M5 — board task-menu divider.** SS-H13 current Help v2.x card overflow shows Schedule/Change List/Duplicate, a visible thin divider, then red Delete. `TaskOverflowMenu` in `src/TaskCard.tsx` renders MenuItems consecutively; `src/overlayPrimitives.css` changes destructive item text color but has no preceding border or separator. This is source visual/control separator omission, not missing destructive behavior. Implement calibrated nonfocusable presentation without keyboard regression or unrelated global menu changes.

## Nearby inspected items already present

- `src-tauri/src/persistence/tasks.rs` has both atomic default create and atomic top create; the root persistence behavior is already implemented and tested within its prior scope.
- List card hover Open, Create List tile and task management menu option order exist; only the Delete divider absent.
- Confirm and keyboard Enter handling for single create exist, and inline card/EST creation is present. B46 is specifically successive-entry continuity, not inability to create.
- SS-C06 Search palette initial quick actions and Ctrl+F keycap exist; no invented search-results parity finding (no source result data).
- Archived Done auto-archive 60-day backend already exists; no new gap.

## Routing and validation

Nested M5 TODO, crosswalk B46–B48 and family/video summary, UI_UX_SPEC, 46/19 route index updated. Historical source-version and control-context caveats explicit. Raw original MP4 not re-reviewed for this source-record comparison; if insertion policy depends on the exact activation/interval, inspect the narrow original segment before code intervention rather than assume source behavior. No TypeScript/Rust tests, screen fixtures, Actions, native Windows, source-level acceptance run. **NOT RUN / no new PASS / counters unchanged**, Codex retains correction and physical-test ownership.
