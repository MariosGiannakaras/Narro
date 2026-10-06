# 2026-10-06 — finding36 implementation refinement

Status: **CURRENT DESIGN CLARIFICATION**

This note refines one implementation detail in `work-log/2026-10-06-chatgpt-finding36-focus-scope-analysis.md` before the source fix is validated.

## Refinement

The persistent Focus target is authoritative for **queue semantics**:

- Panel selection/remount;
- Skip candidate selection;
- Done/post-completion candidate selection;
- Success → Next Task identity.

The Floating Timer's own board projection remains an **All Lists read for live-task identity/presentation**.

Reason: a user can have an active timer whose task is not contained in the currently selected Focus list. Making the Floating Timer's display projection list-scoped could hide the authoritative active task and create a new regression. The finding36 defect does not require that change.

Therefore the narrow safe design is:

- `FocusSurfaceCoordinator` owns the persistent `ListBoardRequestTarget`;
- `FocusPanel` is controlled by that target and reports changes upward;
- `FloatingTimerFoundation` receives the target and passes it to `FocusLiveActions`;
- `FocusLiveActions` uses it for queue-changing authoritative reads;
- Floating live-task/subtask presentation may continue to use the global board projection.

This supersedes only the earlier analysis note's overly broad sentence that the Floating Timer itself must load its display board from the selected target. The finding disposition remains **READY_FOR_FIX**.
