# M1 diagnostic storage safety hardening — PR #217 / CI #862 checkpoint

Date: 2026-10-03

## Why this slice exists

The remaining M1 physical batches B/C/D must use an isolated diagnostic Narro
build so they cannot mutate the user's production lists/tasks.

PR #212 introduced diagnostic identifier
`com.mariosg.Narro.M1Diagnostic` and exposed resolved storage paths, but a
later code audit found two evidence gaps:

1. the UI's `Storage isolation: PASS` verdict depended only on the configured
   identifier, not the actual resolved Windows AppData paths;
2. the UI verdict appeared only after normal persistence startup had already
   resolved/created/opened SQLite, so a hypothetical path-resolution failure
   could touch production storage before the UI could report FAIL.

PR #217 closes both gaps.

## Native path-aware verdict

Current branch adds:
- production identifier constant `com.mariosg.Narro`;
- diagnostic identifier constant `com.mariosg.Narro.M1Diagnostic`;
- `DiagnosticStoragePaths.isolationPass`;
- case-insensitive leaf verification for both resolved `app_data_dir` and
  `app_local_data_dir`;
- explicit production-identifier rejection.

Rust unit regressions cover:
- valid diagnostic Roaming + Local paths;
- production identifier/path rejection;
- diagnostic identifier with one wrong production path leaf.

The React diagnostic UI consumes only the native `isolationPass` verdict and
labels it **Storage isolation (native identifier + resolved paths)**.

## Fail-closed persistence startup

For the diagnostic identifier only, `initialize_persistence()` now validates
the resolved app-data directory **before**:
- `create_dir_all`;
- opening `narro.db`;
- migrations;
- diagnostic startup insert.

If the resolved app-data leaf does not equal
`com.mariosg.Narro.M1Diagnostic`, startup fails with
`validate diagnostic app data isolation` instead of creating/opening SQLite.

A static architecture contract locks this check before
`std::fs::create_dir_all(&app_dir)`.

Production identifier behavior is unchanged.

## Real Windows runtime storage smoke

PR #217 also adds
`scripts/verify-m1-diagnostic-storage-isolation.ps1`.

The Windows CI step runs it after the diagnostic release build and before
diagnostic artifact upload.

It:
- requires no pre-existing `narro.exe`;
- resolves real Windows Roaming and Local AppData through
  `Environment.SpecialFolder`, without APPDATA/LOCALAPPDATA overrides;
- defines production namespaces:
  - Roaming `com.mariosg.Narro`;
  - Local `com.mariosg.Narro`;
- defines diagnostic namespaces:
  - Roaming `com.mariosg.Narro.M1Diagnostic`;
  - Local `com.mariosg.Narro.M1Diagnostic`;
- clears only diagnostic data in the isolated CI environment;
- fingerprints production namespace existence, directories, files, lengths and
  SHA-256 hashes;
- launches the actual diagnostic EXE;
- requires real `narro.db` creation under diagnostic Roaming AppData within
  20 seconds;
- fails if the diagnostic process exits first;
- verifies production Roaming and Local fingerprints remain unchanged during
  and after the launch;
- terminates the diagnostic process after the check.

This directly tests Tauri's actual Windows path resolution, addressing the
earlier repository lesson that environment-variable redirection assumptions
were not authoritative.

## Validation chronology

- initial PR head CI #855: frontend/contract PASS; **rustfmt-only FAIL**.
- rustfmt diff was applied exactly.
- CI #856 then passed the fast gate before later safety hardening advanced the
  head.
- head `f872d2cadeeb3e22583c24bd41fba9cc218cc9a2` added the pre-SQLite
  fail-closed guard; CI #858 became superseded by later changes.
- runtime smoke wiring advanced through CI #861.
- production fingerprint was then hardened so missing namespace and empty
  namespace cannot compare equal; directory entries are included, not only
  files.

Current exact head:
`d8b6a58709c8d22d1d2e94be506a21bee0edc182`.

Authoritative Windows CI:
#862 / run `37071670434`.

At this checkpoint #862 had just been queued/pending. Do not merge or promote a
final Candidate B until exact-head #862 passes.

## Relationship to PR #216 baseline

PR #216 resulting-main CI #854 is already fully PASS and remains validated
fallback evidence:
- merge `007a999e688144122362ad1a4012a22b310e66f2`;
- Focus runtime artifact id `11254745758`, real Panel↔Timer HWND motion
  manually confirmed;
- diagnostic artifact id `11254037811`, digest
  `sha256:acb24529528549762a1d7c1794268aa9ee7825197a1062b506c3b184942862b8`;
- diagnostic EXE SHA-256
  `a4da47d57fd08b5f3193a4f793c4df963061c094a861a4dc0fd4e6ed0b92f4af`.

Do not use that fallback for final B/C/D while PR #217 is active. The final
Candidate B should come from successful post-#217 resulting-main validation.

## Progress

No physical/manual gate advances from this hardening:

`4/10M || 4/5 | 14/19`.
