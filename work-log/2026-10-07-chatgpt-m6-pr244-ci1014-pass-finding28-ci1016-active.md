# 2026-10-07 — M6 PR244 resulting-main CI1014 PASS

## Scope

Immutable resulting-main closure for P3-M6-06 Focus Home pause provenance automation/integration. Direct physical/canonical source acceptance remains separate and OPEN.

## Exact validated chain

- PR244 exact head: `ae69acd71ef15d91c87a3d935e4df40479a1ae2b`.
- Exact-head Windows CI1013 / run `37594066892`: **PASS** through the full workflow.
- Expected-head guarded squash merge: `8c9a1a181c51e9119ef2e04a5de742027ed845ea`.
- 9/9 changed source/test blobs were verified byte-identical between the green PR head and resulting merge.
- Resulting-main Windows CI1014 / run `37602323133`: **PASS** through validation gate, frontend/contracts, Rustfmt, Rust check, Clippy, Rust tests, performance harness, Windows visual fixtures, Tauri release, packaged Focus runtime, physical-validation build, M7 automatic validation preparation/logging and M1 diagnostic storage isolation.

P3-M6-06 is therefore **INTEGRATED / AUTOMATED_VALIDATED / SOURCE_PARITY_OPEN**.

## Acceptance limit

The following remain OPEN and must not be inferred from CI:
- direct physical observation of visible `PAUSED` before Home exit;
- direct physical/canonical observation of paused transient then running on Blitz re-entry;
- direct canonical current-candidate comparison;
- P3-M6-01 direct Board→Focus motion comparison.

## Current continuation

Finding28 is the active regression-first slice on PR245 / `test/finding28-post-drag-action-rail-regression`.

At this checkpoint:
- exact head: `9692cc80f23ae6e5217a9a699b3945490c3c791b`;
- CI1015 passed all pre-visual gates but timed out before the Finding28 fixture became ready, so it produced **no behavioral verdict**;
- the only follow-up change is diagnostic-only harness reporting for ListBoard/bootstrap failures;
- exact-head CI1016 / run `37608351115` is active.

## Progress

`3/10M || 0/3 | 17/18`
