# Finding31 — Reports inline session-edit Escape analysis

Date: 2026-10-06

Status: **ANALYZED / NO_FIX**

Scope: analysis/disposition only. No Narro runtime/source/test correction is implemented by this record.

## Finding

On the exact CI953 Windows candidate, a manual session's displayed end time was opened as an inline editor. Real Save operations changed the same session from 120s to 180s and back to 120s. A later physical Escape while the time spinner had keyboard focus left the inline editor open.

The observed Escape no-op is real, but the available source/requirements do **not** establish that Escape must cancel or close this inline editor. Therefore this observation is not sufficient evidence for a Narro defect.

## Exact evidence identity

- Candidate/source: CI953 / `38219e200fe3bec7309f8e03e72003184ca86d08`.
- EXE SHA-256: `bde7646d9a3f17af0078c41e8a90173bc044f6747d24fde278e6f5739ebe05d8`.
- Packet: `work-log/evidence/m7-ci953-gaps-20261005/`.
- Scope bookmark: M9-A05, approximately 525–1085 s.
- 10:01:59.748Z: physical Up on the focused end-time minute spinner; Save at 10:01:59.904Z.
- 10:02:02.788Z: physical Down; Save at 10:02:02.829Z, restoring the committed duration.
- 10:02:03.893Z: the displayed end-time control was invoked again.
- 10:02:04.554Z: native focus set to the minute spinner.
- 10:02:04.999Z: physical Escape through the normal scancode input path.
- Observation17 at 10:02:06.034Z still exposes the inline end-time editor; its minute spinner has real keyboard focus and the Save-session-end-time control remains available.
- The later bookmark records that the draft was explicitly restored and saved before closing task detail. The capture does not establish a persisted mutation from the unsaved Escape state.

The finding is therefore factual as an interaction observation: Escape does not exit the editor.

## Current-source comparison

Current `src/ReportsSessionsView.tsx` implements session end-time editing as a narrow inline state:

- clicking the displayed end time sets local `editing=true`;
- the row replaces only that field with `<input type="time">` plus a green check/Save control;
- the Save path commits through `onCommitEndTime` and exits editing only after a successful commit;
- there is no inline Cancel control and no Escape handler.

This directly explains the physical behavior. There is no hidden Edit Session modal to reconcile: the normal row menu's Edit action opens the task-level session-detail surface, and the actual field mutation remains inline.

## Canonical Blitzit reconciliation

Canonical Reports/Sessions evidence establishes the same interaction grammar:

- Session rows expose an end-time field in active inline-edit state;
- the active field receives the accent treatment;
- a green check control confirms the edit in place;
- row geometry remains stable while the field becomes editable.

The Pass-3 screenshot record explicitly states that the screenshot **does not prove the exact keyboard commit/cancel rules**.

VE-015 likewise confirms in-place field editing and successful edit persistence, but the reviewed source does not establish Escape-to-cancel or another dedicated inline-cancel gesture.

Accordingly, the stronger canonical evidence supports Narro's current inline-edit structure but does not support adding a new keyboard semantic as source-confirmed behavior.

## Cross-surface convention check

Other Narro editors, such as M5 task-title editing, support Escape/Cancel. That is useful adjacent interaction precedent, but it is not enough to rewrite this Reports field when:

- this surface uses a native `type=time` control with its own keyboard/spinner behavior;
- the canonical Sessions interaction exposes an explicit confirmation check but no demonstrated cancel action;
- the exact source keyboard behavior is explicitly unresolved.

Treating the task-title editor's Escape rule as automatically authoritative here would be a cross-surface assumption rather than evidence-based reconciliation.

## Disposition

**NO_FIX**

Do not change Reports session editing merely because the captured physical Escape left the inline editor open.

The current observation should be reopened only if one of the following appears:

1. direct Blitzit evidence establishes Escape/cancel semantics for this inline field;
2. a binding Narro product/accessibility requirement explicitly standardizes Escape-cancel across inline editors;
3. a separate demonstrated usability/accessibility failure shows that users cannot safely abandon an uncommitted edit.

A future product decision may deliberately add Escape-cancel as a Narro consistency/accessibility enhancement, but that must be recorded as an inferred/adaptive behavior rather than as correction of this finding.

## What is validated by the capture

The same physical run does establish that:

- the real edit path is the displayed end-time field, not a missing standalone Edit Session modal;
- the green-check Save path works;
- 120s→180s→120s changes preserve the same session identity.

Those facts do not by themselves close the broader M9 direct-source parity gate.

## Non-effects

- No application source or tests changed.
- No CI/build/manual acceptance was run.
- No roadmap/milestone counter advances.
- Finding29's Add Session **modal** Escape/focus defect remains separate; modal keyboard ownership must not be generalized from this inline-field disposition.
