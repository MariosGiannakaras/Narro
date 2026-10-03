# Current-main source-chain reconciliation — PR #212 / #214 / #213

Date: 2026-10-02

## Why this entry exists

The M1 implementation handoff still named PR #211 merge
`c372ca29824c3c3839490a19e79f7ed3482cb360` as the latest validated
implementation merge. Repository reality advanced after that through three
non-Markdown merges from concurrent work.

This immutable log records the exact chain and the remaining main-validation
question without pretending a failed push run passed.

## Source/config merge chain after PR #211

### PR #212 — M1 physical diagnostics hardening and data isolation

Title: `M1: harden physical monitor diagnostics and isolate app data`

Exact PR head:
`c9e33c1bd12f0c5285f3a0a8807b94516dd71f33`

Exact-head Windows CI:
- CI #833 / run `36995382791`: **PASS**

Merged main commit:
`acdf8cc54d84247bba83e826020369003d5c244a`

Material scope:
- native Focus Panel placement probe;
- diagnostic monitor descriptors/placement verdict UI;
- isolated diagnostic Tauri identifier
  `com.mariosg.Narro.M1Diagnostic`;
- diagnostic storage identifier/path probe;
- Win32 floating-only scenario preflight;
- performance batch gating on real HWND/DPI/region state;
- diagnostic artifact packaging of the scenario preflight.

PR #212 does not close physical M1 gates; it makes future manual evidence
safer and shorter.

Resulting-main CI #837 failed only in Theme Settings visual-fixture readiness:
`theme-settings-dark did not reach fixture readiness`. Rust tests and the
performance harness had passed. This failure led to PR #214.

### PR #214 — Theme Settings visual-capture retry hardening

Title: `CI: retry Theme Settings capture until fixture ready`

Exact PR head:
`5073da095eef9cef86065d2813b27ed9e3a93b26`

Exact-head Windows CI:
- CI #838 / run `37007738270`: **PASS**

Merged main commit:
`ad6e1d84793e9a5de5a63dd5a2279d0ad67ed8da`

Scope is fixture/capture reliability only:
- `scripts/capture-theme-settings-fixtures.ps1`;
- `scripts/test-ui-theme-settings.mjs`.

The first resulting-main run #839 was cancelled by a newer main push, so it is
not main-validation evidence.

### PR #213 — dense Blitzit planning-board parity

Title: `Board: implement dense Blitzit planning parity`

Exact PR head:
`54697ca5f242a4007c5eb1e7e58c6eb4552ab3db`

Exact-head Windows CI:
- CI #836 / run `36997367072`: **PASS**

Merged current-main commit:
`7ebe7f8a31b2eb37b1113ae7ceb50b92ec66ff31`

Scope:
- positional cross-lane insertion;
- transactional source compaction + target rewrite;
- remaining-EST board projection;
- Today-lane Blitz entry placement and visual emphasis;
- related board/static regressions.

It does not modify Timer placement persistence or the M1 diagnostic isolation
paths added by #212.

## Current-main validation state

Initial main CI #840 / run `37016312476`, attempt 1:
**FAIL** only at packaged Focus runtime capture.

Before that failure, the combined current-main tree passed:
- validation gate;
- fast frontend/contract gate;
- rustfmt;
- cargo check;
- clippy;
- **346 Rust tests**;
- performance-harness validation;
- complete visual-regression capture/validation;
- Tauri release build.

Failure:
`Focus runtime checkpoint panel-to-timer-start did not become ready within 15000ms: Packaged runtime capture did not acknowledge panel`.

The corresponding #213 exact-head run #836 passed. The failure is therefore
being treated as a candidate capture-readiness flake unless a rerun proves
otherwise; it is not silently accepted as PASS.

A failed-jobs rerun of main CI #840 was started as attempt 2. Until it completes
successfully, current main is **not** claimed to have completed resulting-main
validation.

## Current source truth

Repository main currently points to:
`7ebe7f8a31b2eb37b1113ae7ceb50b92ec66ff31`.

Exact-head source/config validation exists for all three constituent PRs:
#212/#833 PASS, #214/#838 PASS, #213/#836 PASS.

The final combined-main validation question is solely CI #840 attempt 2 (or a
narrow evidence-backed correction if that attempt fails again).

## M1/M7 physical counters

No physical gate closes from any of this source/CI reconciliation.

Counters remain:
`4/10M || 4/5 | 14/19`.

M7 C5 saved placement remains physical-user evidence only.
M1 selected-monitor/reconnect/performance gates remain physical-user evidence
only.
