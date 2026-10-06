# 2026-10-06 — finding35 Time's Up Floating action analysis

Status: **READY_FOR_FIX**

## Scope

This record supersedes the earlier broad description of supplemental finding35 as an unexplained expanded-Timer stale-state failure.

Exact evidence now separates the authoritative timer state from the actual missing/stale UI elements.

## CI953 evidence

Exact CI953 / source `38219e200fe3bec7309f8e03e72003184ca86d08` captured EST expiry for task A.

The frozen record states that the domain checkpoint reached `time_up / 60000ms` at approximately 2026-10-05T13:58:13Z.

The original UIA snapshots at:
- `work-log/evidence/m7-ci953-live-20261005/observations/26-A-expiry.json` (13:58:20Z)
- `work-log/evidence/m7-ci953-live-20261005/observations/27-A-expiry-settled.json` (13:58:34Z)

show that the expanded Floating renderer was **not actually stuck in Running**:

- accessible timer group name is `Time's Up`;
- displayed timer is `00:00`;
- Start break is disabled;
- Pause remains labeled `Pause` but is disabled;
- Skip is enabled;
- Complete task is enabled.

Therefore the earlier shorthand “expanded Timer remains 00:00/Pause” must not be interpreted as a stale authoritative timer projection.

Two concrete UI defects remain in those same snapshots:

1. the Floating action strip has no `Extend` action at all;
2. stale local action-status text `Task resumed.` remains visible after the automatic transition to Time's Up.

Returning to Panel exposed the full Time's Up decision state, which is consistent with the implementation asymmetry rather than a timer-engine recovery.

## Canonical source reconciliation

Pass-3 VE-016 is SOURCE_COMPLETE and records the actual full Timer Modes video.

Its high-confidence synthesis states:

- regular EST countdown changes from 00:00:01 to persistent `TIME'S UP`;
- Time's Up does not auto-progress;
- **Skip / Done / Extend remain available after expiry**;
- Extend changes expiry into overtime.

This is also consistent with `PRODUCT_SPEC.md`, `UI_UX_SPEC.md`, `BEHAVIOR_MATRIX.md` and the help-center evidence.

No new raw Blitzit forensic pass is needed for the existence of Extend; VE-016 already establishes it directly.

## Current Narro causal chain

`FocusLiveActions.actionState()` correctly marks `extendEnabled` only for `time_up`.

The Panel branch renders an explicit `data-focus-action="extend"` button wired to `extendTimer`.

The Floating branch renders Break, Notes, Pause/Resume, Skip, Done and Return-to-Panel, but **omits Extend entirely**. The action-state capability therefore exists but is unreachable in Floating mode.

Separately, `FocusLiveActions` owns `status` as local component state. Resume writes `Task resumed.`; no automatic-state reconciliation clears that success copy when the authoritative timer later crosses into `time_up`. This explains the contradictory stale status retained under the correct Time's Up timer/action state.

## Disposition

**READY_FOR_FIX**

Narrow correction:

- render an explicit Floating Extend action when the authoritative state permits it, using the same `extendTimer` mutation path already used by Panel;
- clear prior action success/status copy when an automatic authoritative transition enters `time_up` so stale “Task resumed.” cannot coexist with the expiry decision state;
- do not change timer-engine transition semantics, elapsed-time accounting, or automatic-boundary authority.

## Regression required

Before integration, deterministic renderer coverage should prove:

1. Floating `time_up` renders Time's Up / 00:00;
2. Pause/Break are disabled while Skip/Done/Extend are available;
3. invoking Floating Extend uses the existing `timer_extend` path and projects overtime;
4. a prior `Task resumed.` status does not remain visible after an authoritative transition to `time_up`;
5. Panel Time's Up behavior remains unchanged.

Automated validation does not replace any later routed physical/source-motion acceptance.
