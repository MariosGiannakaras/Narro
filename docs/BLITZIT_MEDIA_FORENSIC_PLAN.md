# Blitzit media forensic parity plan

Status: **required exhaustive parity program**.

The repository already contains a substantial two-pass corpus review: 19/19 MP4/SRT pairs were functionally reconciled and separately reviewed for UI/UX. VE-020 demonstrates that feature-level “complete” did not mean every interaction had been decomposed to native-frame arithmetic/state-transition depth. This plan upgrades the standard for the complete source corpus.

## Corpus

### Video
- 19 MP4/SRT pairs under `reference/original-blitzit-videos/inbox/`.
- VE-020 user-supplied planning clip (9.34 s, 60 fps), to archive when repository tooling can ingest the raw upload.

### Static images
46 canonical source images under `reference/original-blitzit-screenshots/`:
- 22 current v2.6.69 captures;
- 17 Help Center captures;
- 7 historical corroboration captures.

Primary indexes/evidence:
- `reference/original-blitzit-screenshots/CANONICAL_INDEX.md`
- `docs/RESEARCH_EVIDENCE.md`
- `docs/BLITZIT_VIDEO_EVIDENCE.md`
- `docs/BLITZIT_UI_UX_VIDEO_FORENSICS.md`
- `docs/AUDIT_IMPLEMENTATION_CROSSWALK.md`

## Mandatory pass for every video

For each recording, create or extend one evidence record with:

1. media facts — filename, hash, dimensions, fps, duration, transcript relationship;
2. exact shot/scene map for every stable state and edit/cut;
3. native-frame interaction pass for pointer entry/exit, hover/focus/pressed/disabled, drag start/lift/preview/placeholder/source reflow/target reflow/drop/settle, menus, dialogs, drawers, popovers, tooltips, inline editors, notes/subtasks, completion, Focus/Timer transitions, loading, empty, error and recovery states;
4. motion ledger — start/end frame, duration, changed property, and classification as MEASURED / APPROX / CUT-UNMEASURABLE;
5. state/data ledger — every visible counter, timer, EST, Time Taken, date, progress fraction, ordering and before/after arithmetic;
6. layout ledger — component geometry, spacing, alignment, reflow, anchored/fixed regions, overflow and clipping;
7. visual ledger — color/gradient roles, typography hierarchy, radii, borders, elevation, opacity and icon/glyph shape;
8. interaction semantics — only behavior directly demonstrated by the source; unknown glyph meaning remains UNKNOWN;
9. evidence class — UI-DIRECT / MOTION-MEASURED / MOTION-APPROX / TRANSCRIPT-CLAIM / INFERENCE / SOURCE-BUG / NARRO-DECISION;
10. Narro diff — PRESENT / PARTIAL / MISSING / INTENTIONAL-DEVIATION with exact source and test paths;
11. disposition — implement now, milestone route, reliability-improved deviation, or unresolved pending stronger evidence.

A video is not “deep complete” until all materially visible transient states are represented, not merely its feature family.

## Mandatory pass for every screenshot

For each of the 46 canonical images:

1. identify version/source/time relevance;
2. enumerate every visible component and state;
3. measure pixel-relative geometry and alignment;
4. record palette/contrast relationships;
5. record typography hierarchy where inferable;
6. record radii, borders, shadows, dividers and progress geometry;
7. inventory icons and exact placement;
8. record visible copy, counters, dates and task data;
9. compare against the matching Narro fixture/runtime state;
10. create a finding for every material mismatch.

Screenshots are authoritative for static detail; videos are authoritative for transient behavior and motion.

## Cross-media reconciliation

After the individual passes:

- cluster findings by Home, Board, Task Card, Schedule/Recurrence, Notes, Subtasks, Blitz/Focus, Floating Timer, Preferences, Search, Archives, Sessions and Reports;
- resolve current-vs-historical conflicts by source version/date;
- preserve contradictions explicitly rather than averaging them;
- build one state-transition matrix per interactive component;
- maintain one source→Narro implementation matrix with no unowned direct finding;
- require implementation + regression coverage or an explicit intentional deviation for every direct finding.

## Implementation and validation loop

For each coherent source-backed batch:

1. patch the smallest shared production primitive/behavior rather than fixture-only markup;
2. add semantic unit/integration tests for data behavior;
3. add deterministic visual fixture/capture coverage for presentation;
4. run narrow tests first and broader repository preflight only when the affected surface justifies it;
5. run Windows CI for source/config changes;
6. compare generated Narro captures against source evidence at matched states;
7. update evidence/crosswalk only after the implementation state is known;
8. keep Windows-only physical gates OPEN until physically observed.

## Priority queue created by VE-020

1. planning-board positional cross-lane DnD;
2. remaining-time EST aggregation;
3. Today primary CTA placement/visual hierarchy;
4. lane progress accounting semantics;
5. stable ordinal semantics across lane moves;
6. hover quick-action glyph semantics;
7. drag/reflow/settle fidelity;
8. exact CTA gradient behavior;
9. final fade only if independently corroborated.

## Completion rule

The exhaustive parity pass is complete only when:
- all 19 repository videos + VE-020 (once archived) have transient-state/data/motion ledgers;
- all 46 screenshots have explicit component/state comparison records;
- every direct Blitzit finding maps to Narro implementation/test or an explicit intentional deviation;
- no “complete” status is based only on feature-level summary;
- final end-state Narro runtime captures pass the post-M10 comprehensive parity review.
