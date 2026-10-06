# 2026-10-07 — M6 PR242 integrated / PR243 CI1004 active

## Scope

Durable continuation checkpoint for the active Milestone 6 whole-Focus reconciliation. This record does not advance a roadmap, slice, milestone-item, physical or source-parity counter.

## P3-M6-05 integration state

- PR242: `Fix M6 ordinary Focus action rail parity`.
- Exact validated PR head: `5623e7340d15f53d8fedecdf0286e9fa58913163`.
- Windows CI999 / run `37532811582`: **PASS**.
- Expected-head guarded squash merge: `6b4f8cfa8a1ff107fa95d4248e61dba176059493`.
- All 11 changed source/test blobs were checked after merge and are byte-identical between the green PR head and resulting `main`.
- Resulting-main Windows CI1000 / run `37545545505`: **IN_PROGRESS** at this checkpoint. It has already passed fast gate, Rust check, Clippy, Rust tests, performance harness, Windows visual fixtures, Tauri release, packaged Focus runtime and physical-validation build steps; final candidate work remains. Do not mark resulting-main acceptance until the run actually completes successfully.
- Direct physical/canonical source-parity acceptance remains OPEN.

## P3-M6-01 active implementation state

- Active PR243: `Fix M6 Board to Focus native morph parity`.
- Branch: `fix/m6-board-focus-morph`.
- Exact current head: `77a67a1468be3a559c2c9296f8b4a7cd5d4de51c`.
- Exact-head Windows CI1004 / run `37548063004`: **PENDING/IN PROGRESS** at this checkpoint.
- The implementation replaces the historical renderer-owned board opacity fade with the selected bounded retained-host/native design:
  - authoritative `start_blitz` resolves before presentation work;
  - renderer passes only `prefers-reduced-motion` policy into `present_focus_for_blitz`;
  - hidden persistent `focusSurface` is prepared at the authoritative Panel target;
  - Main WebView pixels are captured with the existing WebView2 `CapturePreview` path;
  - a finite native raster child freezes those pixels during host geometry change;
  - Main outer rect morphs for 220 ms using the existing bounded Fluent point-to-point easing discipline;
  - Focus is shown/focused, Main hidden, then Main geometry restored while hidden;
  - reduced motion and minimized/maximized/fullscreen Main states use direct handoff;
  - capture/raster/morph failures fall back without undoing the already committed timer/session.
- The encoded PNG capture allowance is bounded at 8 MiB consistently through capture and decode.
- New deterministic coverage includes native rect interpolation, native ownership, rollback/fallback and rejection of the old renderer fade.

## CI1002 failure and correction

CI1002 / run `37546690145` failed only in the fast frontend/contract gate at `scripts/test-single-focus-architecture.mjs`.

Exact cause: the static contract still expected:
- `invoke<void>("present_focus_for_blitz")`,
- `await presentFocusForBlitz()`,
- the old synchronous native command signature.

The production source was already using the intended single native boundary with a `reducedMotion` argument. The stale test was updated on the same PR branch.

A second stale assertion in `scripts/test-ui-m6-parity-reconciliation.mjs` still required historical `fadeBoardBeforeFocusPresentation() → presentFocusForBlitz()` ordering despite the same script now forbidding the legacy fade. That assertion was proactively corrected before CI1004.

Do not reopen CI1002 as an implementation/runtime failure.

## Validation limits

- Local repository preflight remains **NOT RUN** in the connector-only environment because the local runtime cannot resolve/fetch the repository/dependency checkout.
- Exact-head GitHub Windows CI remains authoritative for this source slice.
- No physical Windows/source-motion comparison has been performed for PR243.
- P3-M6-06 Focus Home pause/resume remains PRODUCT/ENGINEERING POLICY AMBIGUITY; do not introduce naive `timer_pause` or resume-all-paused semantics.

## Progress

Current compact progress remains:

`3/10M || 0/3 | 17/18`

No denominator changed and no counter advances from this checkpoint.

## Exact next action

1. Inspect PR243 exact-head CI1004/run `37548063004`.
2. Inspect resulting-main CI1000/run `37545545505`.
3. Fix only evidence-backed CI1004 failures on the existing PR243 branch.
4. Do not merge PR243 until exact-head Windows CI succeeds; then re-check live head/mergeability/current `main`, reconcile newer authoritative Markdown, use expected-head guarded merge, verify source/test blob identity and required resulting-main CI.
5. Keep physical/direct Blitzit motion acceptance separate and OPEN.
