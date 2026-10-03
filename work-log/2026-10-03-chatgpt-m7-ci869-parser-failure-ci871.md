# M7 PR #219 — CI #869 parser-only failure and #871 corrective rerun

Date: 2026-10-03

## Failed exact head

PR #219 exact head:
`422230e755a373d3ccb61246e1917ff7934a1210`

Windows CI #869 / run `37079768471`:
**FAIL**

All substantive gates before the new validation smoke passed, including:
- fast frontend/contracts;
- Rust formatting/check/Clippy/tests;
- performance harness;
- visual regression;
- packaged Focus runtime capture;
- physical validation release build;
- physical validation build verification.

The sole failing step was:
`Verify M7 Automatic Validation Logging`.

Exact evidence from the Windows log:
- PowerShell parser error in `scripts/verify-m7-validation-logging.ps1`;
- broken fingerprint regex/string around line 71;
- duplicated trailing script block left unmatched braces/try/finally syntax;
- process exited before the validation EXE smoke could execute.

Therefore CI #869 does **not** evidence a Narro runtime/logger failure. It failed before the smoke launched.

## Narrow correction

PR #219 advanced only through validation-tooling fixes:
- `fab030f529ea52f7604615146581614a0f542718` — reconstruct the smoke script with a valid anchored fingerprint regex and one coherent try/finally block;
- `fd621696e539ab1e621e48b2ad2a2318c01219b2` — add PowerShell parse validation to the earlier performance/preflight harness so the same class of syntax error fails before the expensive physical build.

No logger/runtime/persistence semantics were intentionally changed by this corrective slice.

## Current validation

PR #219 current exact head:
`fd621696e539ab1e621e48b2ad2a2318c01219b2`

Windows CI #871 / run `37100908558` is active for that exact head.

At checkpoint creation:
- validation-gate: PASS;
- fast-gate: in progress.

## Next action

Check CI #871 first.
- On failure, inspect the exact failing step/log and change only evidenced behavior.
- On PASS, verify `narro-m7-validation-windows-x64` artifact and exact validation executable identity, then expected-head guarded merge PR #219 and validate resulting main.

No M7/M1 physical or milestone counter advances from #869 or this fix.

Current progress:
`4/10M || 4/5 | 14/19`.
