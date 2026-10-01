# M7 physical artifact smoke hardening — WAL coverage

Date: 2026-10-01

## Context

The CI #795 physical artifact-validity failure established that a user-test executable must never be the CI-instrumented `runtimeVisual=1` binary.

PR #192 already separated:
- instrumented automated capture build;
- production-config physical validation build in `src-tauri/target-physical`;
- a pre-upload isolated-profile runtime smoke.

## Additional hardening

SQLite may keep newly committed fixture rows in `narro.db-wal` before they checkpoint into `narro.db`.

Therefore the runtime smoke was strengthened:
- commit `ea75601f3fca2cc4bd577d35750738b4d998a955` scans the entire SQLite file family matching `narro.db*`, not only the main DB file;
- it intentionally does **not** scan the whole WebView profile because cached frontend JS legitimately contains the literal fixture strings and would create false positives;
- the smoke still rejects either `CI Focus Runtime` or `Packaged runtime focus task` in any SQLite DB/WAL family member.
- commit `2f64d8d223d3c2deec23b33c7e24df293758611a` protects the WAL-aware requirement in the static packaged-runtime harness contract.

## Current gate

PR #192 exact head:
`2f64d8d223d3c2deec23b33c7e24df293758611a`

Windows CI #799 / run `36825786468`: **IN PROGRESS** at this checkpoint.

No production Focus/timer/task behavior changed in these WAL-hardening commits.
