# Finding33 — large Notes resize/Escape analysis

Date: 2026-10-06

Status: **ANALYZED / NEEDS_REGRESSION_FIRST (Escape) / RESIZE FAILURE NOT ESTABLISHED**

Scope: analysis/disposition only. No Narro runtime/source/test correction is implemented by this record.

## Finding split

The capture bundled two observations on the large Notes presentation:

1. lower-right pointer drags did not change the observed large Notes bounds;
2. physical Escape left the large Notes presentation open.

These do not have the same evidentiary status and must not be patched as one symptom.

## Exact evidence

Candidate/source: CI953 / `38219e200fe3bec7309f8e03e72003184ca86d08`.
Packet: `work-log/evidence/m7-ci953-continuous-20261005/`.

### Main large Notes

- before: large dialog bounds `768,107 1024×673`; Task note `785,160 990×557`;
- real SendInput drag: `(1770,712) → (1640,612)`;
- after drag: dialog and Task-note bounds unchanged;
- contenteditable Task note receives real keyboard focus;
- physical Ctrl+A, Tab, Shift+Tab, Escape follow;
- post-Escape observation still exposes the large Notes dialog.

### Focus large Notes

- before: large dialog bounds `2228,8 324×684`; Task note `2237,69 306×576`;
- real SendInput drag: `(2540,642) → (2420,532)`;
- after drag: dialog and Task-note bounds unchanged;
- contenteditable Task note receives real keyboard focus;
- physical Ctrl+A, Tab, Shift+Tab, Escape follow;
- post-Escape observation still exposes the large Notes dialog.

The Escape behavior therefore repeats in two real Windows surfaces.

## Exact-source contract

The exact CI953 `src/TaskNotes.tsx` already implements explicit large-presentation keyboard behavior:

- large Notes is declared `role="dialog" aria-modal="true"`;
- `onKeyDown={handlePresentationKeyDown}` is attached to the editor shell;
- when `event.key === "Escape"`, the handler prevents/stops the event and calls `closeLargePresentation()`;
- Tab/Shift+Tab containment is handled in the same function.

The exact/current `scripts/test-ui-task-notes-large.mjs` also asserts the Escape close contract, but only statically/source-wise.

The physical Escape no-op therefore contradicts Narro's own explicit runtime contract. The current source is still materially the same in this area.

## Escape disposition

**NEEDS_REGRESSION_FIRST**

The failure is real, but the causal mechanism is not yet established because the expected handler is already present. A future implementation chat must first create the narrowest runtime regression around the actual contenteditable focus path and record:

1. the actual focused DOM node;
2. whether a real/synthetic keydown reaches the editor shell;
3. the observed `event.key` / propagation path;
4. whether `closeLargePresentation` runs;
5. whether presentation state changes but another authority immediately reopens/reprojects it.

Only then should source be changed. Do not add a second blind Escape listener without identifying the failed authority.

## Resize assessment

Narro intentionally makes large Notes resizable:

- CSS uses `resize: both`;
- the large presentation carries `data-task-note-resizable="true"`;
- existing tests explicitly assert the pointer-resizable contract;
- earlier work logs describe resizability as an explicit Narro Windows reachability decision, not a Blitzit parity claim.

However the CI953 drag coordinates do **not** prove that this contract failed.

For Main, the shell's lower-right corner is approximately `(1792,780)`, while the drag began at `(1770,712)`: about 22 px left and 68 px above the corner.
For Focus, the shell's lower-right corner is approximately `(2552,692)`, while the drag began at `(2540,642)`: about 12 px left and 50 px above the corner.

CSS/native resize hit regions are UA-defined and concentrated at the edge/corner. These starts are not reliable proof that the resize grip was actually hit. Unchanged bounds after those attempts therefore cannot be promoted to a resize defect.

### Resize route

No production fix is justified from finding33's resize evidence.

If physical resizability still requires acceptance, retest with an explicitly verified pointer start inside the rendered lower-right resize hit region and assert before/after shell bounds. Keep failure open only if that correctly targeted test still cannot resize.

## Source parity

VE-010 confirms inline Notes and its close affordance, but the larger resizable presentation is a Narro Windows reachability adaptation. This finding therefore must not be used to claim or deny Blitzit source parity for resizability.

## Non-effects

- No application source or tests changed.
- No CI/build/manual acceptance was run.
- No milestone/roadmap counter advances.
- No resize fix is routed from the invalidly targeted drag attempts.
