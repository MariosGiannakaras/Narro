# Blitzit exhaustive forensic re-audit plan

Status: **ACTIVE — third-pass source forensics; ANALYSIS ONLY; implementation reconciliation explicitly deferred**

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
6. Record implementation-relevant implications as source findings without inspecting or changing Narro merely to classify them. If evidence is ambiguous, preserve the ambiguity rather than guessing.
7. Hand completed source findings to the separate reconciliation workflow in `docs/BLITZIT_PARITY_RECONCILIATION_WORKFLOW.md`; current-code comparison, crosswalk disposition and implementation/test routing are not part of the analysis-only Pass 3.
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
- implementation-relevant implications that can be derived from the source alone; comparison with current Narro is deferred to reconciliation.

The 2026-10-03 depth audit found that the existing 46/46 qualitative records do not consistently preserve enough measurable geometry/style detail for maximum visual parity. Their source inspection remains useful, but static visual calibration is separately required by `docs/BLITZIT_VISUAL_CALIBRATION_PLAN.md` and tracker.

Every image must receive a row/checkpoint in the screenshot parity tracker used by M10/final review. Similar screenshots may share one implementation slice, but not one inspection result.

## Analysis-only boundary

By explicit user direction on 2026-10-02, Pass 3 must **not** modify Narro implementation.

During this pass:
1. inspect and document source evidence only;
2. do not patch React/Rust/CSS/tests/configuration/CI;
3. do not modify or merge implementation PRs;
4. do not mark implementation gaps fixed/validated;
5. do not use current implementation as a reason to stop source inspection early;
6. record implementation-relevant implications as source findings only;
7. defer all code reconciliation to a later, separately authorized implementation phase.

The source pass therefore has three conceptual phases:

- **P3-A — source extraction:** per-image and per-video observation at maximum practical depth;
- **P3-B — source synthesis:** reconcile current/direct, Help, historical and transcript evidence without code changes;
- **P3-C — implementation reconciliation:** **DEFERRED** until the user explicitly asks the implementation track to consume Pass-3 findings.

Authoritative continuation files:
- `docs/BLITZIT_FORENSIC_PASS3_HANDOFF.md`;
- `docs/BLITZIT_FORENSIC_PASS3_TRACKER.md`;
- `docs/BLITZIT_FORENSIC_PASS3_SCREENSHOTS.md`;
- `docs/BLITZIT_FORENSIC_PASS3_VIDEOS.md`.

## Source-forensics completion condition

Pass 3 source analysis is complete only when:
- all 46 retained images have explicit per-image Pass-3 records;
- all 19 MP4s have been inspected across their full duration at Pass-3 depth;
- every material interaction/transient-state sequence has timestamps and state-transition notes;
- arithmetic, counters, task identity/order and visible copy are reconstructed where relevant;
- motion claims are measured/classified without inventing timing;
- contradictions across current/direct, Help, historical, narration and inference are explicitly resolved or left as genuine ambiguity;
- the Pass-3 tracker contains no OPEN, PARTIAL or RAW_MEDIA_ACCESS_REQUIRED items.

**Code parity is not part of this completion condition.** Implementation reconciliation is a later phase and must not block truthful completion of the source-analysis pass.
