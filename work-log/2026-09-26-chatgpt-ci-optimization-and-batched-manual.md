# CI optimization validation and batched-manual continuation — 2026-09-26

## Scope

Repository engineering optimization plus continuation-policy reconciliation. No product behavior change.

## Evidence before change

Recent Windows runs were typically ~16–20 minutes. PR/main pairs #147/#517, #148/#519, #150/#521 and #151/#523 had identical PR-head and merged-main Git trees, yet each pair ran a second full Windows job. Those four duplicate main runs consumed roughly 70 runner-minutes.

The prior workflow also:
- had npm dependency caching but no Rust/Cargo build cache;
- ran `npm run build` in repository preflight;
- ran the same frontend production build again through Tauri `beforeBuildCommand`.

`AGENT_WORKFLOW.md` already allowed duplicate main CI cancellation when exact-head validation and identical-tree proof exist.

## PR #152

PR #152 adds:
- fail-safe identical-tree dedup gate for main pushes;
- full CI fallback for direct/unproven pushes, different trees, workflow changes and Rust cache-key input changes;
- exact PR-head checkout contract;
- pinned `Swatinem/rust-cache` v2.9.2 commit for `src-tauri -> target`;
- cache writes only from trusted main push runs;
- CI-only Tauri config that disables duplicate `beforeBuildCommand`;
- explicit `dist/index.html` and `dist/focus.html` presence checks before packaging;
- static config contracts protecting these safeguards.

Exact head `299f46c4f8953d6f0a30bfc9953925c11def7eda` passed Windows CI #525.

Guarded squash merge:
`3dac35988ba03d9b12f5eb58dbb13d9e2792e488`

Because the workflow itself changed, resulting-main CI #526 correctly did NOT deduplicate and ran the full Windows job.

## Resulting-main validation

CI #526 PASS:
- validation gate PASS;
- checkout/setup PASS;
- Rust cache restore PASS;
- Repository Preflight PASS;
- Windows visual regression PASS;
- visual artifact upload PASS;
- reused frontend dist verification PASS;
- Tauri Release PASS;
- runtime artifact upload PASS;
- Rust cache post/save PASS.

Runtime artifact `10899467604`, digest `sha256:b8e412e4b0e9164da968aaa52d319d79125b968d83757bf29b38cf97840b891c`.

Visual artifact `10899945114`, digest `sha256:d2cd12e230558ec8f15944098c1382889f6dbddc4b7408f287125bb144945a0c`.

Measured #526 step durations:
- Repository Preflight: ~6m01s;
- Visual Regression: ~2m56s;
- Tauri Release: ~4m46s.
Earlier recent Tauri Release steps were commonly ~6–8 minutes, consistent with removing the duplicate frontend build. Future ordinary identical-tree merges should avoid the much larger duplicate full-main cost.

## Manual validation batching

The user explicitly requested continued implementation without stopping at every manual Windows gate where later work can proceed safely.

This changes scheduling, not acceptance:
- deferred manual checks remain OPEN;
- no physical PASS may be claimed without evidence;
- independently evidenced source fixes may continue;
- compatible physical checks should be batched on the latest relevant build to avoid redundant user testing.

## Continuation

Proceed with the separately evidenced M7 Expand/Collapse empty-surface continuity fix. PR #151 physical Panel↔Timer confirmation remains open and should be included in the later combined M7 manual matrix.
