# HANDOFF.md

Canonical continuation point. Read `AI_START_HERE.md`, `AGENTS.md`, `ENGINEERING_QUALITY.md`, `AGENT_WORKFLOW.md`, active M7 `TODO.md`, relevant `STATUS.md`, the newest immutable `work-log/` entry, and live PR/CI state before implementation.

GitHub `main` is the durable source truth.

## CURRENT MILESTONE

Milestone 7 — Floating Timer mode. Milestones 1–6 are complete. M7 physical gates remain open; do not advance to M8.

## CURRENT VALIDATED SOURCE

Current validated source baseline:
`3dac35988ba03d9b12f5eb58dbb13d9e2792e488`, tree `57a9b7258059c2ba35088c48f74585953aa1d580`.

This includes:
- PR #151 readiness-before-prewarm ordering; exact-head CI #522 PASS, merged source `8c3a108ec2c8ebdea0e5c1aa2b234490d718aff2`, resulting-main CI #523 PASS.
- PR #152 CI optimization; exact head `299f46c4f8953d6f0a30bfc9953925c11def7eda`, CI #525 PASS; guarded squash merge `3dac35988ba03d9b12f5eb58dbb13d9e2792e488`, resulting-main CI #526 PASS.

CI #526 runtime artifact:
`10899467604`, digest `sha256:b8e412e4b0e9164da968aaa52d319d79125b968d83757bf29b38cf97840b891c`.

CI #526 visual artifact:
`10899945114`, digest `sha256:d2cd12e230558ec8f15944098c1382889f6dbddc4b7408f287125bb144945a0c`.

## CI OPTIMIZATION NOW VALIDATED

PR #152 preserves the full PR Windows validation contract while reducing redundant work:
- exact-head PR runs still execute full preflight, visual regression, release build and artifact upload;
- main skips the heavy job only after proving merged PR association, identical Git tree and successful exact-head PR Windows CI;
- unsafe/unknown cases fail safe to full CI;
- workflow/Rust cache-key input changes force a full main run;
- Rust/Cargo cache is pinned and only trusted main pushes save reusable cache state;
- Tauri packaging reuses the frontend `dist` already built by preflight, with an explicit output check before packaging.

## PHYSICAL EVIDENCE STILL OPEN

The CI #521 recording proved Panel↔Timer staging before PR #151:
- normal animations ~8.300s `No active focus task`, ~10.600s `Loading Focus Panel…`;
- animations Off ~35.267s `Loading focus task…`, ~40.700s `Loading Focus Panel…`.

PR #151 is automated-validated but still needs physical confirmation. This manual gate remains OPEN.

Separately, the same recording independently proves an Expand/Collapse continuity failure:
- Expand animations On ~9.53–9.65s: enlarged mostly blank Timer before expanded content;
- Collapse animations On ~17.2s: content disappears before shrink completes;
- Expand animations Off ~43.02–43.13s: same enlarged-empty-surface sequence;
- Collapse animations Off ~37.38s: same content-hidden-before-resize-completes sequence.

## USER-DIRECTED MANUAL-TEST BATCHING

The user explicitly requested that implementation continue across multiple safe, independently evidenced slices instead of stopping at each manual Windows gate. Therefore:
- do not fabricate or mark deferred physical checks PASS;
- continue evidence-backed implementation where the next slice does not depend on the unknown manual result;
- batch compatible manual Windows checks later to reduce user interruption;
- if a later source change would make an earlier manual test obsolete, test only the latest relevant build for the combined acceptance matrix.

## INVARIANTS

Preserve:
- two-webview model only: `main` plus reusable `focusSurface`;
- Rust/native geometry, monitor/work-area/DPI and presentation authority;
- authoritative timer/session/task/persistence outside renderer memory;
- no fixed delay, polling loop, additional webview or high-frequency JS geometry loop;
- solved duplicate/stale-pixel behavior must not regress;
- CI optimization must never skip validation unless identical-tree + successful exact-head PR evidence is proven.

## NEXT AGENT ACTION

1. Recheck live main/open PR/CI state.
2. Start the narrow Expand/Collapse resize content-readiness/visibility corrective slice from the validated baseline.
3. Preserve existing native hidden-resize rollback and duplicate-key/stale-pixel fixes.
4. Add deterministic regression coverage for the visible ordering: content must be ready for the target layout before resized geometry is exposed; outgoing content must not disappear into a blank resized surface.
5. Validate exact PR head on Windows CI, guarded merge, then rely on the new identical-tree dedup gate when applicable.
6. Continue other independently automatable M7 work rather than stopping for manual checks.
7. Later provide one combined Windows manual matrix covering PR #151 Panel↔Timer continuity, Expand/Collapse continuity, shortcut boundary stress, find/hidden behavior, monitor/topology/taskbar/DPI cases and stacking. Do not start M8 until all required M7 physical gates pass.

## USER ACTION REQUIRED

None immediately. Manual Windows validation is intentionally deferred for batching, not waived.
