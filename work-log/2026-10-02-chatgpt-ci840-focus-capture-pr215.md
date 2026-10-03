# Current-main packaged Focus capture failure — CI #840 diagnosis / PR #215

Date: 2026-10-02

## Scope

This immutable entry follows
`work-log/2026-10-02-chatgpt-current-main-pr212-pr214-pr213-reconciliation.md`.

Current implementation main:
`7ebe7f8a31b2eb37b1113ae7ceb50b92ec66ff31`

Later main commits before this entry were Markdown-only tracking/forensic updates.

## Main CI #840 attempt 1

Run: `37016312476`

The combined current-main tree passed:
- validation gate;
- fast frontend/contract gate;
- cargo check;
- clippy;
- 346 Rust tests;
- performance-harness validation;
- complete visual-regression capture/validation;
- Tauri release build.

Packaged Focus runtime capture then failed because
`panel-to-timer-start` did not become ready within the harness's fixed 15 s
checkpoint window.

Because PR #213 exact head had passed CI #836, failed jobs were rerun rather
than changing product source immediately.

## Main CI #840 attempt 2

Attempt 2 again passed:
- validation/fast gates;
- check/clippy;
- 346 Rust tests;
- performance harness;
- complete visual-regression suite;
- Tauri release build.

It failed only at packaged Focus runtime validation:

`timer-to-panel-runtime captured no native HWND movement`

Runtime artifact:
- artifact id `11235012897`
- digest
  `sha256:1ed05ec3e81010f992074b684274c193c8dd755f61b5641384975a72cd6f0a56`

Reference exact-head PR #213 CI #836 runtime artifact:
- artifact id `11221699030`
- digest
  `sha256:5ae567922e07af9ba677ad19519a79be85fafb04bea87d84eb44af24a9dfa9b5`

## Artifact comparison

The exact-head #836 PASS captures:
- Panel start HWND around `(668, 0)`;
- Timer HWND around `(388, 80)`;
- Timer→Panel motion samples return from `(388, 80)` to `(668, 0)`.

The #840 attempt-2 artifact captures:
- the same Panel→Timer move from `(668, 0)` to `(388, 80)`;
- Timer→Panel renderer start at ~8.72 s;
- renderer Panel settlement only at ~14.90 s, approximately **6.2 s later**;
- the fixed native motion sampler had already ended after ~2.54 s, while the
  HWND was still at `(388, 80)`.

Therefore the failed contract did not establish that production Timer→Panel
positioning is broken. It established that the capture probes can terminate
before a slow hosted runner reaches the actual end checkpoint.

## Source-diff proof

A GitHub compare from PR #213 exact head
`54697ca5f242a4007c5eb1e7e58c6eb4552ab3db`
to combined implementation main
`7ebe7f8a31b2eb37b1113ae7ceb50b92ec66ff31`
shows the existing Focus transition logic is unchanged.

`src-tauri/src/lib.rs` differs only by PR #212 diagnostic additions:
- import of `clamp_top_left`;
- `DiagnosticStoragePaths` + command;
- `FocusPanelPlacementProbe` + command;
- command registration.

The following relevant blobs are byte-identical between those two source refs:
- `src-tauri/src/floating_placement.rs`;
- `src-tauri/src/persistence/preferences.rs`;
- `src-tauri/src/domain/preferences.rs`;
- `src/FloatingTimerFoundation.tsx`;
- `scripts/capture-focus-runtime.mjs` before the correction;
- `scripts/validate-focus-runtime-captures.mjs`;
- `src-tauri/tauri.ci.conf.json`;
- `src-tauri/tauri.conf.json`.

Timer placement persistence writes only the dedicated
`floating_timer_placement` table; it does not rewrite Focus Panel monitor/side
preferences.

## Narrow corrective PR #215

PR #215:
`CI: capture Focus motion through the real settle checkpoint`

Exact head:
`03cff34c6188bd5033da389ae1dadfa3dc15d4f6`

Changes only:
- `scripts/capture-focus-runtime.mjs`;
- `scripts/capture-focus-window-sequence.ps1`;
- `scripts/sample-focus-window-motion.ps1`;
- `scripts/test-focus-runtime-visual-harness.mjs`.

Correction:
- checkpoint readiness window is bounded at 30 s rather than 15 s;
- screenshot and high-frequency native probes still capture their minimum
  sample counts;
- with the transition harness they now remain active until the renderer emits
  the **actual end checkpoint**;
- a stop file terminates both probes after settlement;
- each probe retains a hard 30 s maximum;
- stop is signalled even when end-checkpoint waiting fails.

The existing runtime validator is intentionally **not weakened**. It still
requires:
- actual source/target HWND positions to differ;
- a bracketed native motion interval;
- real intermediate positions for standard motion;
- monotonic axis direction;
- the existing reduced/standard motion duration bounds.

No Rust/React/product runtime code changes in PR #215.

## Validation state

Windows CI #841 / run `37029033564` is the authoritative exact-head validation
for PR #215.

At the time this work-log entry was written it was still running. Do not merge
or claim the combined-main validation issue closed until #841 succeeds and its
runtime artifact proves real Timer→Panel native movement.

## Progress

No product/physical counter changes:
`4/10M || 4/5 | 14/19`.
