# Finding29 — Reports Add Session modal keyboard-dismiss analysis

Date: 2026-10-06

Status: **ANALYZED / READY_FOR_FIX**

Scope: analysis/disposition only. No Narro runtime/source/test correction is implemented by this record.

## Finding

On the exact CI953 Windows candidate, opening Reports → Sessions → Add Session and sending two real Tab inputs followed by Escape left the Add Session modal open. Later native probes continued to expose the modal until explicit Cancel was invoked.

This is a real keyboard-modal defect, not a nested-picker Escape ambiguity.

## Exact evidence identity

- Candidate/source: CI953 / `38219e200fe3bec7309f8e03e72003184ca86d08`.
- EXE SHA-256: `bde7646d9a3f17af0078c41e8a90173bc044f6747d24fde278e6f5739ebe05d8`.
- Packet: `work-log/evidence/m7-ci953-interfaces-20261005/`.
- Whole original: `video/2026-10-05 12-11-29.mkv`, 1007.117 s; exact packet bookmark around 790–845 s.
- 09:24:39.189Z / ~789.576 s: real native `+ Add Session` invocation.
- Observation36 at 09:24:40.433Z: modal is present, but `+ Add Session` behind the modal still has real `HasKeyboardFocus=true`.
- 09:24:40.578Z and 09:24:40.980Z: two physical Tab inputs.
- 09:24:41.379Z: physical Escape.
- Observation38 at 09:25:08.808Z and observation39 at 09:25:10.939Z still expose the Add Session dialog, Close Add Session and Cancel.
- 09:25:34.231Z / ~844.618 s: explicit native Cancel closes the modal.

The subsequent underlying filter/menu pointer attempts occurred while the modal remained open and are not used as proof of those underlying actions.

## Nested-state check

Current `ReportAddSessionDialog` does not implement Recent Tasks as an independently opened popup. The Recent Tasks element is a persistent `role="listbox"` inside the modal. Therefore there is no nested open layer for Escape to dismiss first.

The task search is a normal `type="search"` input; the listbox remains rendered from filtered tasks. No current source path gives the observed Escape a legitimate nested-dismiss target.

## Current-source root cause

Current `src/ReportsSessionsView.tsx` renders the Add Session surface as:

- a backdrop;
- a `section role="dialog" aria-modal="true"`;
- ordinary Close and Cancel buttons whose only close path is `onClick={onClose}`.

The dialog has no local keydown/Escape handler and no focus-lifecycle implementation.

Current `src/ReportsSessions.tsx` only controls `addOpen` and passes `onClose`; it adds no document/window Escape listener, initial-focus transfer, focus containment or focus restoration for this dialog.

That source structure directly explains the physical result:
1. opening the modal leaves focus on the triggering `+ Add Session` button outside the modal;
2. Tab navigation is not explicitly contained by the modal;
3. Escape has no application handler that closes it.

This is not a provider-only interpretation. The physical observation, current source and behavior align.

## Requirement / accessibility reconciliation

The surface explicitly claims modal-dialog semantics through `aria-modal="true"`. The WAI-ARIA Authoring Practices modal-dialog pattern expects keyboard focus to move inside a modal dialog, Tab/Shift+Tab to remain within its tab sequence, and Escape to close the dialog. Narro's existing modal-hardening work also treats local Enter/Escape as dialog-owned behavior.

Canonical Blitzit evidence establishes the Add Session dialog/search/Recent Tasks structure, but does not need to establish a special nonstandard Escape exception. This correction is justified by Narro's accessibility/Windows interaction contract even if source media does not demonstrate the keyboard key directly.

Reference: https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/

## Disposition

**READY_FOR_FIX**

The future implementation slice should remain narrowly scoped to Reports Add Session modal keyboard ownership. Required behavior:

- move initial focus into the Add Session dialog when it opens;
- keep Tab/Shift+Tab within the active modal while it is open;
- Escape closes the modal when no mutation is pending;
- preserve the existing pending guard that prevents dismissal during an active Add mutation;
- restore focus coherently to the opener/context after dismissal;
- do not change session persistence, date/time calculations, task selection semantics or Reports filtering;
- add deterministic rendered keyboard regressions for initial focus, Tab wrap/containment, Escape dismissal and pending-state protection.

Implementation details are intentionally left to the implementation chat; this record establishes behavior/root cause, not a patch.

## Evidence limit

The committed whole recording remains canonical, but this analysis environment did not independently decode the binary MP4/MKV frames. The physical input timeline plus native UIA snapshots and source inspection are sufficient for this keyboard/focus state claim. No continuous-motion or direct visual-source-parity PASS is asserted.

## Non-effects

- No application source or tests changed.
- No CI/build/manual acceptance was run.
- No milestone/roadmap counter advances.
- Finding30's Recent Tasks horizontal scrollbar is separate and remains independently analyzable.
