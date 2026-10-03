# M7 automatic validation logging — PR #219 pending Windows CI

Date: 2026-10-03

## Baseline reconciliation

- PR #217 is merged; the diagnostic-storage isolation line is no longer an open implementation blocker.
- Main source is `f1a200c3624c3e25154a7023443c1dfc5be1e69d`.
- Resulting-main Windows CI #866 / run `37078139295` completed **PASS** on `f1a200c3624c3e25154a7023443c1dfc5be1e69d`, validating the bounded post-exit diagnostic SQLite hash retry.
- PR #218 remains open as a divergent duplicate/follow-up around the same hash-release issue and must not be merged blindly over current main.

## M7 automatic logging implementation

PR #219 (`M7: add automatic local physical-validation logs`) is open.

Exact head at this checkpoint:
`422230e755a373d3ccb61246e1917ff7934a1210`

Branch:
`m7/automatic-validation-logging`

The slice adds a dedicated validation executable `narro-m7-validation.exe`. Logging is fail-closed to that executable name; normal `narro.exe` leaves the logger inert.

The validation executable automatically creates local `Narro-M7-Logs` evidence without PowerShell setup. Evidence includes ordered JSONL timestamps, process/session identity, exact source and executable fingerprint, Focus native geometry/presentation, monitor work areas/DPI, accepted Timer movement, SQLite placement save, tray Quit outcome, and cross-process placement restore.

No task titles, task descriptions, notes, list names, telemetry, or network upload are recorded.

The evaluator emits `PENDING / PASS / FAIL / INCONCLUSIVE`. PASS is fail-closed and requires a qualifying drag, normal tray Quit, a different process/session, identical executable bytes/source, unchanged monitor topology, identical loaded persisted placement, restore coordinates within the defined tolerance, and visible work-area containment.

CI also packages a dedicated `narro-m7-validation-windows-x64` artifact and smoke-launches the renamed executable to prove that automatic log creation and privacy metadata work on Windows.

## Validation state

Windows CI #869 / run `37079768471` is **PENDING** for exact PR #219 head `422230e755a373d3ccb61246e1917ff7934a1210`.

Do not mark the implementation automated-valid until #869 passes. Do not advance C5 or any progress counter from implementation alone.

## Exact next action

1. Check Windows CI #869 first.
2. If it fails, inspect the exact failing step/log and correct only evidence-backed issues on PR #219.
3. If it passes, verify the dedicated validation artifact and exact executable identity, then expected-head guarded merge PR #219.
4. Validate resulting main.
5. Reconcile tracking.
6. Only then run the final physical C5 flow with the validated `narro-m7-validation.exe`; use its structured result plus the physical observation to close C5.

Current progress remains `4/10M || 4/5 | 14/19`.
