# 2026-10-07 — M6 PR243 integrated / CI1010 active

## Scope

Durable integration checkpoint for P3-M6-01 Board→Focus native morph. This record closes the implementation/integration slice checkpoints only; direct physical/canonical source-motion acceptance remains OPEN.

## Exact validated chain

- PR243 exact head: `9bbc0a008ee0fa43f2b3dec0a5325e7af8e62c41`.
- Exact-head Windows CI1009 / run `37550854386`: **PASS** through validation gate, frontend/contracts, Rustfmt, Rust check, Clippy, Rust tests, performance harness, visual fixtures, Tauri release, packaged Focus runtime capture, physical-validation build, M7 automatic validation preparation/logging and M1 diagnostic storage isolation.
- Expected-head guarded squash merge: `197f553fe4c04501c076ca1506c83510fe483e80`.
- Changed source/test files: 11.
- Post-merge blob identity: **11/11 byte-identical** between exact green PR head and merge commit.
- Resulting-main CI1010 / run `37585481400`: **ACTIVE** at this checkpoint.

## Implemented behavior

The historical renderer opacity fade is removed. The integrated source-backed entry path now:
- resolves authoritative Start Blitz first;
- prepares hidden persistent Focus Panel at the existing authoritative target;
- captures Main WebView pixels using the existing WebView2 `CapturePreview` path;
- holds those pixels in a finite native raster child;
- morphs the Main outer rect for 220 ms using the existing bounded Fluent easing discipline;
- at the endpoint hides Main, restores its exact original geometry and clears the raster while hidden, then reveals/focuses the prepared Focus Panel;
- bypasses morphing for reduced motion and minimized/maximized/fullscreen Main states;
- falls back without undoing the already committed timer/session;
- preserves the visible-Focus coordinator path.

CI1008 exposed a packaged-runtime harness mismatch because the visual driver still called `present_focus_for_blitz` without the new required `reducedMotion` key. The driver now passes `{ reducedMotion: false }`, and the harness contract guards that invocation. CI1009 proves the corrected runtime path.

## Validation limits

- Direct physical Windows comparison of Board→Focus motion against canonical Blitzit VE-003 remains OPEN.
- Narro CI/static/runtime fixtures do not establish canonical source-motion parity.
- P3-M6-06 Home pause/resume remains SOURCE-CONFIRMED / BACKEND-POLICY AMBIGUITY.
- No naive `timer_pause`, resume-all-paused policy or new timer authority is authorized.

## Progress

`3/10M || 3/3 | 17/18`

The active implementation slice checkpoints are complete. Whole M6 remains open because direct source/physical gates and P3-M6-06 remain unresolved.

## Exact next action

1. Inspect resulting-main CI1010/run `37585481400`; record PASS or fix only evidence-backed attributable failures.
2. While CI1010 runs, perform the bounded deep analysis for P3-M6-06 using current repository/source evidence and existing timer authorities.
3. Preserve P3-M6-01 physical/source-motion acceptance as a separate OPEN gate.
