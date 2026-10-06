# Finding32 — Focus placement preference apply-timing analysis

Date: 2026-10-06

Status: **ANALYZED / NO_FIX**

Scope: analysis/disposition only. No Narro runtime/source/test correction is implemented by this record.

## Finding

CI953 dual-display capture shows that direct Preferences changes to selected monitor or Left/Right do not immediately relocate an already-present Focus Panel. Native probes immediately after the clicks retain the prior Panel geometry. After an explicit Timer→Panel presentation re-entry, the same persisted preferences produce the expected target-monitor/edge anchors.

The capture therefore establishes apply timing, but not a defect.

## Exact evidence

- Candidate/source: CI953 / `38219e200fe3bec7309f8e03e72003184ca86d08`.
- Packet: `work-log/evidence/m7-ci953-dual-20261005/`.
- Real settled topology: UltraGear 2560×1080 / 100% primary at (0,0), LG 1920×1080 / 125% secondary at (-1920,0).
- Same Focus HWND `7471826` survives the exercised paths.
- Actual selected-monitor and Left/Right preference interactions were recorded.
- Direct post-click probes retain prior geometry.
- Explicit Timer→Panel re-entry reaches all four expected physical anchors:
  - primary Left 0;
  - primary Right 2220;
  - secondary Left -1920;
  - secondary Right -425.

The original finding32 correctly left immediate relocation as `REVIEW_PENDING` pending requirement reconciliation.

## Requirement reconciliation

The authoritative earlier physical acceptance in `work-log/2026-10-04-codex-m7-ci911-physical-results.md` already defines the accepted behavior for this exact preference family:

> Preference takes effect on next Panel entry.

That run physically passed selected-monitor and Left/Right placement on both monitors.

A potentially conflicting sentence in `docs/UI_UX_SPEC.md` stating that changes are "immediately reflected across Main and focus views" was checked in context. It belongs to the **Subtasks** section and describes subtask mutation projection, not Preferences placement timing. It is therefore not an immediate-relocation requirement.

Canonical Preferences evidence establishes monitor selection and Left/Right controls, but the reviewed source does not establish a stronger immediate-live-move semantic.

## Current-source comparison

Production preference surfaces use `PreferenceSettingsRuntimeProvider`.

Its `save` path:

1. persists through `updatePreferenceSettings`;
2. updates the local snapshot;
3. receives normal preferences-changed projection.

It does **not** invoke a Focus-window move/reposition command after monitor/side writes.

The production `present_focus_panel` path loads persisted monitor/side preferences when Panel presentation is entered and applies native placement then. This matches the already accepted next-entry contract.

A direct `position_focus_panel` command exists for diagnostic placement tooling; that diagnostic path must not be mistaken for required ordinary production preference behavior.

## Disposition

**NO_FIX**

Do not add immediate live Focus relocation in response to finding32.

The captured behavior is consistent with the existing validated contract: the preference persists immediately and determines placement on the next Panel presentation/entry.

Reopen only if stronger direct Blitzit evidence or an explicit product decision changes the apply-timing requirement.

## Non-effects

- No application source or tests changed.
- No CI/build/manual acceptance was run.
- No roadmap/milestone counter advances.
- Finding27 stale selected-monitor/DPI recovery remains separate; this disposition does not weaken its physical gate.
