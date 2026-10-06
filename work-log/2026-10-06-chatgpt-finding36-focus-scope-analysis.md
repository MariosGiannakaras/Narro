# 2026-10-06 — finding36 Focus scope / success Next Task causal analysis

Status: **READY_FOR_FIX**

## Scope

This record closes the analysis-only disposition for supplemental finding36 and makes the implementation rationale durable for zero-context continuation.

Finding36 was captured on exact CI953 / source `38219e200fe3bec7309f8e03e72003184ca86d08`: returning through success/presentation flow reset the Focus selector to All, and explicit Success → Next Task selected an older retained C5 task instead of the next task in the previously selected Focus list.

## Narro evidence

The frozen CI953 success packet records:

- Panel/success re-entry reset the selected list to All;
- Success → Next Task chose the older owned C5 fixture instead of the intended B task;
- the unexpected task accrued +51 s before recovery;
- the observation was retained as finding36 / REVIEW_PENDING rather than patched during capture.

Source: `work-log/evidence/m7-ci953-live-20261005/README.md`.

## Canonical source reconciliation

Canonical Pass-3 VE-003 records the Focus queue and completion sequence from the actual Blitzit source video:

- the Focus Panel owns an ordered current queue;
- after an ordinary Focus reorder, `Analyze Instagram metrics` is the next queued task;
- completing `Refine Portfolio` shows the success surface;
- the source does not auto-start another task before the explicit success choice;
- after explicit `Next Task`, `Analyze Instagram metrics` becomes live.

This establishes the required semantic invariant for the demonstrated path: **Success → Next Task advances within the current Focus queue/context order, not by searching an unrelated global task pool.**

Source: `docs/BLITZIT_FORENSIC_PASS3_VIDEOS.md`, VE-003 section around the Focus queue and `Refine Portfolio Done → success → Next Task` sequence.

No new raw Blitzit forensic pass is required for this conclusion; VE-003 is already a complete Pass-3 full-video forensic record.

## Current Narro causal chain

Current post-PR238 `main` still has the following ownership split:

1. `FocusPanel` owns the selected list target as component-local React state.
2. Panel↔Timer presentation swaps can unmount the Panel subtree, so that local target is not a durable Focus-session authority.
3. `FloatingTimerFoundation` independently loads `getListBoardSnapshot({ kind: "all" })`.
4. Floating `FocusLiveActions` receives `target={{ kind: "all" }}`.
5. `FocusLiveActions.handleDone` computes the success `nextTask` from that fresh target board.
6. `FocusSurfaceCoordinator.startNextTaskFromSuccess` then starts the task identity embedded in the success state.
7. Re-entering the Panel mounts a fresh local target whose default is All.

This directly explains both observed symptoms with one ownership defect: **Focus scope is not owned above the presentation subtrees.**

## Disposition

**READY_FOR_FIX**

The safe correction is to make Focus queue scope persistent at the `FocusSurfaceCoordinator` level and pass that authoritative target to both Panel and Floating Timer paths.

Required properties:

- Panel list selection updates the coordinator-owned target.
- Panel remount uses the same target instead of resetting to All.
- Floating Timer loads the board using that same target.
- Floating `FocusLiveActions` receives the same target, so Skip/Done/success next-task selection uses the current Focus queue context.
- If a selected list ceases to exist, the existing catalog-validation/fallback behavior must converge to All and update coordinator state; no stale list identity may be retained.
- Existing all-list behavior remains unchanged when target is All.
- Timer/session authority and ordering remain unchanged; this is scope ownership only.

## Validation required

Add deterministic renderer regression coverage for:

1. select a concrete list in Panel;
2. transition away from Panel so the Panel subtree is not the scope authority;
3. verify Floating board read/action target remains the selected list;
4. complete a live task with success enabled;
5. verify Success → Next Task chooses the next eligible task from that list/context, not a global older task;
6. return to Panel and verify selector/list target remains the same;
7. verify deleted/invalid selected-list fallback updates the coordinator to All.

Automated PASS does not substitute for any later routed physical/source acceptance requirement.

## Related current state

- PR237/finding07 implementation is integrated; physical blocked-SQLite responsiveness remains OPEN.
- PR238/M9 Overview PDF exact head `e584b5d5d40623a9e14b7180ecb5b117ad73ae03` passed full Windows CI971 and merged as `c8d1b67f74d5c2347877da410a4584fb6625a74c`; all 10 changed source/test blobs match resulting main. Physical PDF creation/rendering remains OPEN; M9 stays 11/12.
- finding35 remains NEEDS_REGRESSION_FIRST.
- finding37 remains PRODUCT_DECISION_REQUIRED / EVIDENCE_LIMIT.
