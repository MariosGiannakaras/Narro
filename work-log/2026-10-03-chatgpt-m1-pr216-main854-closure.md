# M1 PR #216 resulting-main closure — CI #854

Date: 2026-10-03

## Implementation merge

PR #216 `M1: automate final monitor evidence and placement persistence reopen`
was expected-head guarded-squash-merged as:

`007a999e688144122362ad1a4012a22b310e66f2`

Exact PR head:

`306dfc50d68477059ceb65a45c5806558db6abbf`

Exact-head Windows CI #853 / run `37044645690`: **PASS**.

The exact-head runtime artifact was manually inspected and contained real native
Panel↔Timer source/target movement.

## Resulting-main validation

Windows CI #854 / run `37069188509`: **PASS**.

All relevant stages passed:
- validation gate;
- fast frontend/contract gate;
- rustfmt;
- cargo check;
- clippy;
- Rust tests;
- performance-harness validation;
- visual-regression capture/validation;
- Tauri release build;
- packaged Focus runtime capture/validation;
- production physical validation release/verification/upload;
- M1 diagnostic release/upload.

## Resulting-main packaged Focus evidence

Artifact:
- id `11254745758`;
- name `narro-m7-focus-runtime-visual`;
- ZIP SHA-256
  `d1cfe097e56dcf1091a51db2e305f838cc530532883280879ed7e7567e77fdb1`.

Downloaded ZIP hash independently matches GitHub's artifact digest.

Manual `frames.json` inspection:

Panel→Timer:
- first HWND position `(668,0)`;
- target `(388,80)`;
- movement observed at ~140 ms;
- final sample remains at target.

Timer→Panel:
- first HWND position `(388,80)`;
- target `(668,0)`;
- movement observed at ~135 ms;
- final sample remains at target.

This closes the prior #840/#845 capture-window question on the combined merged
main tree. The harness now sees real source→target native motion in both
directions rather than timing out before settlement.

## Resulting-main diagnostic artifact

Artifact:
- id `11254037811`;
- name `narro-m1-diagnostic-windows-x64`;
- ZIP SHA-256
  `acb24529528549762a1d7c1794268aa9ee7825197a1062b506c3b184942862b8`;
- contained diagnostic `narro.exe` SHA-256
  `a4da47d57fd08b5f3193a4f793c4df963061c094a861a4dc0fd4e6ed0b92f4af`.

The artifact contains:
- `scripts/measure-floating.ps1`;
- `scripts/run-m1-floating-performance-batch.ps1`;
- `scripts/verify-m1-floating-performance-scenario.ps1`;
- M1 display/runtime/performance validation docs.

This is a fully validated resulting-main diagnostic baseline for PR #216.

## Follow-up safety hardening

PR #217 is active after a code audit found that the diagnostic UI's
`Storage isolation: PASS` used only the configured identifier even though it
displayed resolved paths.

PR #217 makes the verdict native and path-aware and additionally fails closed
before diagnostic SQLite creation/open if the resolved app-data path does not
belong to the diagnostic namespace.

Therefore **do not promote CI #854 as the final user-facing Candidate B while
PR #217 is active**. It remains the validated fallback/baseline. Final Candidate
B should come from successful PR #217 integration/resulting-main validation.

## Physical progress

No manual gate changes:
`4/10M || 4/5 | 14/19`.
