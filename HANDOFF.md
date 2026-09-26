# HANDOFF.md

Canonical continuation point. Read `AI_START_HERE.md`, `AGENTS.md`, `ENGINEERING_QUALITY.md`, `AGENT_WORKFLOW.md`, active M7 `TODO.md`, relevant `STATUS.md`, the newest immutable `work-log/` entry, and live PR/CI state before implementation.

GitHub `main` is the durable source truth.

## CURRENT MILESTONE

Milestone 7 — Floating Timer mode. Milestones 1–6 are complete. M7 remaining blockers are physical Windows acceptance gates; do not advance to M8.

Current progress: `6/10M || 2/2 | 8/14` — consolidated validation preparation is complete; physical acceptance remains open.

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

## LATEST CONSOLIDATED VALIDATION PACKAGE

Use CI #530 runtime artifact:
- artifact ID `10902390320`;
- digest `sha256:726991f5a92eadda25eaa833d0a7443c21531896eb56e462609a0db6988cc6de`;
- prepared filename `narro-m7-latest-main-ci530-windows-x64.zip`.

The exact latest procedure is `docs/M7_FLOATING_RUNTIME_VALIDATION.md`. It batches all unresolved M7 gates into one Windows session and explicitly avoids repeating already-settled checks.

## PHYSICAL WINDOWS GATES STILL OPEN

**Latest physical result (2026-09-26): Gate 7 FAIL on exact CI #530 runtime.** A continuous capture of three Panel→Timer→Panel shortcut cycles with Windows animations On caught a nearly empty pale focus window followed by exposed desktop before the Timer appeared. The settled mode and paused task remained intact, but visual continuity failed. See `work-log/2026-09-26-codex-m7-ci530-panel-timer-physical-fail.md` and its retained frame evidence. Expand/Collapse, animations Off, and gates 8–12 were not run on #530. M7 remains 8/14.

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

The CI #530 physical Gate 7 failure is an evidence-backed source correction target. The likely transition sequencing path is documented in the newest work log; the exact compositor cause remains unproven.

1. Recheck live repo/CI/PR state.
2. If new evidence or a real automated gap appears inside M7, batch compatible independent fixes before the next CI according to the general workflow.
3. Correct the observed Panel→Timer blank/desktop exposure as one coherent source slice, including recovery behavior and executable transition tests. Validate locally, then use exact-head CI and a guarded merge. A new runtime artifact is needed for physical acceptance.
4. Record physical PASS/FAIL evidence in a new immutable work log.
5. If any gate fails, batch compatible evidence-backed corrections where safe, validate with one coherent PR CI, merge with expected-head protection, and continue.
6. Do not start M8 until all required M7 physical gates pass.

## USER ACTION REQUIRED

The CI #530 Gate 7 failure requires a correction and new exact-build physical validation. The remaining checks should still be consolidated using `docs/M7_FLOATING_RUNTIME_VALIDATION.md` after that correction.
