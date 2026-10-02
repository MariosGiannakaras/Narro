# Blitzit exhaustive forensic re-audit plan

Status: **REQUIRED — third-pass interaction/state forensics and screenshot-by-screenshot parity reconciliation**

Date established: 2026-10-02

## Why this pass exists

The existing corpus has already received a functional pass and a UI/UX pass, but the 2026-10-02 dense analysis of the supplied planning-workflow clip proved that the second pass was not sufficiently granular for all stateful interactions. It had correctly recorded the broad planning workflow, yet missed directly observable details that materially affect implementation: cross-lane positional insertion, stable visible task ordinals during the move sequence, live remaining-work arithmetic, Today completion progress, source/destination reflow, the persistent highlighted Today lane, the anchored gradient Blitz CTA, and the board fade before Focus presentation.

Therefore the existing 19/19 status remains useful as prior coverage, but it is not the final exhaustive parity audit.

## Corpus to re-audit

- **19 MP4 + SRT pairs** in `reference/original-blitzit-videos/inbox/`.
- **46 canonical screenshot/image references** in `reference/original-blitzit-screenshots/`.
- Current Narro implementation, deterministic visual fixtures, interaction tests, and the final M10/final-review captures.

No source item may be silently skipped. Historical material must remain labeled historical and may not override stronger current v2.6.69/direct evidence.

## Pass 3 — videos

For every video pair:

1. Build a complete timeline map of every in-product state and transition.
2. Inspect every interaction sequence at frame-level or dense sampling sufficient to resolve:
   - pre-hover / hover / pressed / dragging / drop / settle;
   - source and destination layout reflow;
   - insertion position and identity/order persistence;
   - counters, progress, EST, Time Taken and any arithmetic before/after mutation;
   - temporary/transient copy;
   - visibility/reveal of controls;
   - modal/popover placement and dismissal;
   - animation direction, affected geometry, opacity and measured duration when the footage permits it;
   - state retained across navigation/presentation changes.
3. Record exact visible copy, card/column anatomy, control order, icon role, badges/ordinals and progress treatment.
4. For numeric UI, reconstruct the arithmetic from the visible task values and verify the displayed aggregate; do not merely record the final number.
5. Separate direct visual evidence, narration, inference, tutorial edits and source bugs/artifacts.
6. Reconcile every direct finding against current Narro source and tests:
   - **MATCHED** — implementation and regression coverage agree;
   - **IMPLEMENTATION_GAP** — current Narro differs from direct evidence;
   - **TEST_GAP** — implementation appears correct but lacks a reliable regression;
   - **AMBIGUOUS** — evidence is insufficient; do not guess;
   - **INTENTIONAL_DEVIATION** — documented reliability/accessibility/local-only exception.
7. Route every implementation/test gap into `docs/AUDIT_IMPLEMENTATION_CROSSWALK.md`, the relevant milestone/final-review checklist, and a concrete source/test slice.
8. For any sequence with material animation, store the source FPS/time range and enough frame checkpoints to reproduce the conclusion.

### Required planning-board baseline from the 2026-10-02 re-audit

The supplied 9.34 s / 560-frame planning clip is the minimum depth standard for Pass 3:

- Today lane retains a cyan→green accent outline and an anchored gradient `Blitz now` CTA.
- Four This Week→Today drags show a floating card, source reflow, target positional insertion and drop settle.
- Visible task ordinals remain attached to the moved cards during the sequence; final Today order is `1 Marketing brief`, `3 Call mum`, `4 Fire Jeffry`, `2 Insta post`.
- Live remaining-work values change on each transfer: This Week `6h35 → 5h05 → 3h05 → 2h35 → 2h30`; Today `No Tasks → 1h30 → 3h30 → 4h → 4h05`.
- Today progress changes `0/0 → 0/1 → 0/2 → 0/3 → 0/4 Done`.
- Hover exposes the left completion control plus compact Notes/document, lane-left, lane-right and overflow actions without card reflow.
- Activating the CTA animates the gradient and then fades the board over roughly 250 ms before Focus presentation.
- The canonical `help-v2x-today-column-task-progress-dark.png` independently shows a highlighted Today lane, `4/5 Done`, an ordinal at the left of the task row, EST on the lower left and Time Taken on the lower right.

## Pass 3 — screenshots/images

Inspect all 46 image references individually at native resolution. For each image record:

- source/version family and whether it is current, help-v2.x or historical;
- full surface geometry and hierarchy;
- exact visible copy;
- spacing, alignment, column/card proportions and reserved action geometry;
- typography hierarchy;
- colors/gradients/borders/radii/shadows;
- normal, hover, focus, selected, disabled, overdue, done, expanded and destructive states where visible;
- numeric/progress semantics and arithmetic;
- icon placement and action ordering;
- differences from current Narro and whether the difference is functional, visual-only, ambiguous or an intentional deviation.

Every image must receive a row/checkpoint in the screenshot parity tracker used by M10/final review. Similar screenshots may share one implementation slice, but not one inspection result.

## Implementation order

1. Correct direct high-confidence gaps that are independent of the currently open M1/M7 physical gate and do not alter its validated Focus-window architecture.
2. Batch related board parity changes together rather than producing micro-PRs.
3. Add semantic Rust/React regressions for identity/order/arithmetic and deterministic visual fixtures for geometry/state.
4. Run the narrowest relevant tests first, then repository preflight and Windows CI when the coherent source slice is ready.
5. Leave physical-only conclusions open until observed on the exact candidate.
6. Re-run the full 19-video + 46-image crosswalk after M10 against the release-candidate implementation; historical PASS records alone do not close final parity.

## Completion condition

This re-audit is complete only when all 19 video pairs and all 46 images have explicit per-item dispositions, every material direct finding is represented in the crosswalk, every implementation gap is fixed or explicitly routed, and the final release-candidate parity pass finds no orphaned source evidence.
