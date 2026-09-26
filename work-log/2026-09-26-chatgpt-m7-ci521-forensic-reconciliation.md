# M7 CI #521 forensic reconciliation — 2026-09-26

## Scope

Tracking-only reconciliation. No source change, no new PR, and no new CI were intentionally started by this entry. The repository workflow ignores Markdown-only pushes.

## Primary CI #521 physical result

The user supplied a 60 fps recording from the CI #521 runtime build. Panel↔Timer continuity remains a physical **FAIL**.

Normal Windows animations:
- ~8.300s: `No active focus task`;
- ~8.333s: correct live task `fas`;
- ~10.600s: `Loading Focus Panel…`;
- ~10.633s: settled Panel.

Windows animations Off:
- ~35.267s: `Loading focus task…` before settled Timer content;
- ~40.700s: `Loading Focus Panel…` before settled Panel content.

The same task/session remains active before and after the artifacts. The failure is transient representation/readiness, not persistent session loss.

## PR #151

The physical evidence shows the readiness barrier was placed after transparent native prewarm. Because the WebView2 child can expose content during that stage, temporary renderer states can leak before readiness completes.

PR #151 changes only the order:
`prepare -> publish -> readiness while hidden -> transparent prewarm -> presented-frame barrier -> reveal`

Recovery uses the same order.

Exact head:
`077c2ea4b74e1f346a7ca3b9e9ec7cb76b2ca451`

Exact-head Windows CI #522: **PASS**.

Merged main:
`8c3a108ec2c8ebdea0e5c1aa2b234490d718aff2`

Resulting-main Windows CI #523 / run `36203003936` was **IN PROGRESS** when this entry was written. No additional CI should be started while it is active.

## Independent second audit comparison

A second audit of the same recording was compared against the primary review.

Corroborated, already-known findings:
- false `No active focus task`;
- `Loading focus task…`;
- `Loading Focus Panel…`;
- temporary blank/incomplete transition surfaces;
- reproduction with animations On and Off;
- stable underlying session despite unstable transient representation.

These do not create separate Panel↔Timer bugs beyond the readiness-order problem already addressed by PR #151.

## Newly retained finding: Expand/Collapse empty-surface continuity

The second audit raised a separate Expand/Collapse issue. It was independently rechecked frame-by-frame and confirmed:

- animations On, Expand ~9.53–9.65s: the Timer surface enlarges before expanded controls/content are ready, exposing a mostly empty white surface;
- animations On, Collapse ~17.2s: expanded content disappears first, leaving an empty enlarged/shrinking surface before collapsed content republishes;
- animations Off, Expand ~43.02–43.13s: the same enlarged-empty-surface sequence remains;
- animations Off, Collapse ~37.38s: the same content-hidden-before-resize-completes sequence remains.

This is separate from Panel↔Timer readiness ordering and must be its own future narrow M7 corrective slice.

Do not reinterpret UX observations about information hierarchy or caret grouping as correctness blockers without separate product evidence. No persistent scrollbar defect was established in this recording.

## Ordered continuation

1. Check #523 only; do not start another CI while it runs.
2. If #523 passes, physically retest PR #151 via its resulting-main artifact, isolating Panel↔Timer with animations On/Off.
3. Only after that passes, implement the separate Expand/Collapse resize content-readiness/visibility correction.
4. Validate that slice with the normal exact-head CI -> guarded merge -> resulting-main CI -> physical retest sequence.
5. Continue remaining M7 physical gates; M8 remains blocked.
