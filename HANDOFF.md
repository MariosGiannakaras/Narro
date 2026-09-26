# HANDOFF.md

Canonical continuation point. Read `AI_START_HERE.md`, `AGENTS.md`, `ENGINEERING_QUALITY.md`, `AGENT_WORKFLOW.md`, active M7 `TODO.md`, relevant `STATUS.md`, the newest immutable `work-log/` entry, and live PR/CI state before implementation.

GitHub `main` is the durable source truth.

## CURRENT MILESTONE

Milestone 7 — Floating Timer mode. Milestones 1–6 are complete. M7 remaining blockers are physical Windows acceptance gates; do not advance to M8.

## CURRENT VALIDATED SOURCE

Latest source with completed Windows validation:
`449eb5d1fda4a8d26832e803433209025a6dec38`, tree `51b27ba7a867dcea79a49927cb1ed4e0ee7bda6b`.

Relevant source validation:
- PR #151 readiness-before-prewarm: exact-head CI #522 PASS; merged source `8c3a108ec2c8ebdea0e5c1aa2b234490d718aff2`; resulting-main CI #523 PASS.
- PR #153 atomic Expand/Collapse transparent-host resize: exact head `ed046af079038952f5877b19324b6bf36912e69f`; CI #527 PASS; merged source `57a18a2b9ffd81b1b2d968c54bf1e997311c0cd8`; resulting-main CI #528 PASS.
- PR #154 CI dedup correction: exact head `0ddd837d5aabbdb6284a63fad37cb964dc10f8aa`; CI #529 PASS; merged source `449eb5d1fda4a8d26832e803433209025a6dec38`; resulting-main CI #530 PASS.

Subsequent commits `8d3b488226c7fdc7ed23deae6bfc9f6acb0d8d62` and later tracking reconciliation are documentation-only and do not replace the validated source baseline.

## GENERAL IMPLEMENTATION CADENCE

The repository now explicitly requires:
- batch multiple independently evidenced, compatible active-milestone changes into one coherent branch/PR before CI when none depends on another pending CI/manual result;
- prefer fewer high-value CI runs over micro-PRs;
- do not inflate scope or line count artificially;
- keep unrelated milestones, speculative cleanup and unresolved dependency chains separate;
- defer/batch compatible physical Windows checks only when later implementation is independent of their unknown result;
- keep deferred manual gates OPEN until real Windows evidence exists;
- continue to the next unblocked repository-recorded action after intermediate CI/merge checkpoints rather than stopping merely because a checkpoint completed;
- keep the user informed with concise progress updates during long work.

See `AI_START_HERE.md`, `AGENT_WORKFLOW.md`, and `ENGINEERING_QUALITY.md`.

## PHYSICAL WINDOWS GATES STILL OPEN

A single consolidated latest-build session should cover:
1. Panel ↔ Timer continuity with Windows animations On and Off after PR #151: no `No active focus task`, `Loading focus task…`, `Loading Focus Panel…`, blank/pale/staging frames, or abrupt flicker.
2. Timer Expand ↔ Collapse after PR #153: no enlarged/shrinking empty white surface, stale/duplicated pixels, or session discontinuity.
3. Ctrl+Shift+T transition-boundary stress: one accepted mode change, no duplicated session/window.
4. Ctrl+Shift+P repeated native-hidden/Panel interactions and post-fix actual Windows reduced-motion behavior.
5. Secondary-monitor/topology/no-saved-position recovery.
6. Borderless full-screen stacking; exclusive full-screen only if available and recorded separately.
7. Non-default taskbar, secondary-monitor constrained work area and high-DPI expanded placement.

Previously validated scoped physical evidence remains valid where later source did not affect it, but the open acceptance conditions above must not be marked PASS without new physical evidence.

## CI EFFICIENCY STATE

PR #152 introduced Rust/Cargo caching, frontend build reuse, and identical-tree main dedup without removing tests.
#528 exposed a bug in the first dedup lookup, so PR #154 corrected the proof to use the same GitHub workflow ID. #530 validated the corrected workflow change. The next ordinary identical-tree merge is the first expected real-world proof that the heavy main job is skipped automatically.

## NEXT AGENT ACTION

There is no further evidence-backed M7 source correction currently recorded. Do not invent code merely to enlarge a batch.

1. Recheck live repo/CI/PR state.
2. If new evidence or a real automated gap appears inside M7, batch compatible independent fixes before the next CI according to the general workflow.
3. Otherwise prepare/use the latest source artifact for one consolidated Windows M7 physical session covering the open matrix above.
4. Record physical PASS/FAIL evidence in a new immutable work log.
5. If any gate fails, batch compatible evidence-backed corrections where safe, validate with one coherent PR CI, merge with expected-head protection, and continue.
6. Do not start M8 until all required M7 physical gates pass.

## USER ACTION REQUIRED

A consolidated physical Windows M7 validation session is ultimately required. It is intentionally batched rather than requested one gate at a time.
