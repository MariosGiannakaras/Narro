# M7 automatic local validation logging

The final M7 physical closure uses a dedicated validation executable named:

`narro-m7-validation.exe`

It is the same Narro runtime source with validation-only local instrumentation activated solely by that executable filename. Normal `narro.exe` does not enable this logger.

## What the user does

1. Quit any normal Narro instance first; the validation executable intentionally shares the single-instance/product-data boundary with Narro.
2. Extract/download the M7 validation artifact.
3. Run `narro-m7-validation.exe` normally. No PowerShell setup is required.
4. Keep/start one real active task and show the compact Floating Timer.
5. Drag the Timer by at least 64 physical pixels to an obvious safe non-default position.
6. Quit normally through tray **Quit Narro**.
7. Relaunch the same `narro-m7-validation.exe`.
8. Show/reopen the Timer for the recovered/live task.
9. Open the automatically created sibling folder `Narro-M7-Logs`.
10. Upload the entire `Narro-M7-Logs` folder for audit/debugging. The C5 restart test spans two process sessions, so keeping only the latest session would discard the pre-Quit drag/persistence timeline.

## Automatic files

The executable creates `Narro-M7-Logs` next to itself when that location is writable. If it is not writable, it falls back to Narro's local AppData validation-log directory.

Each process launch creates a new `session-*` directory containing. Do not delete the first session after relaunch; the pair is the complete cross-restart trace:

- `session.json` — process/build/privacy metadata;
- `events.jsonl` — ordered timestamped technical events;
- `panic-first-fault.jsonl` — **created only if a Rust panic occurs**, recording the source file/line/column, thread name and captured Rust backtrace before the timer mutex can subsequently report `TIMER_SERVICE_LOCK_POISONED`. This diagnostic is independent of the normal events mutex, so an unrelated poisoned validation logger cannot prevent the first-fault write. The original Rust panic hook is still invoked: a panic remains a panic and no state is silently recovered; the presence of this file is **not** a Timer fix or a physical PASS.
- `m7-c5-result.json` — evaluator state/result for that session.

The root also contains:

- `LATEST.txt` — latest session directory name;
- `m7-c5-latest-result.json` — current evaluator state;
- `m7-c5-last-terminal-result.json` — latest PASS/FAIL/INCONCLUSIVE terminal outcome;
- `m7-c5-last-pass.json` — preserved most recent PASS, when one exists;
- `pending-c5.json` — temporary cross-restart state while the evaluator is waiting for the second process;
- `README.txt`.

## Logged technical evidence

The JSONL trace records only technical validation data needed to diagnose M7 window/persistence behavior:

- UTC timestamp, monotonic elapsed time, sequence number, process/session identity, exact source SHA and a local byte-level executable fingerprint;
- Focus presentation (Panel / compact Timer / expanded Timer);
- Focus HWND outer position, size, visibility and scale factor;
- monitor names, bounds, work areas and DPI scale factors;
- native Timer move events accepted by the production placement path;
- placement persisted to SQLite, including saved position, visible size, monitor/work-area metadata;
- normal tray-Quit request and placement-save outcome;
- placement loaded and restored after relaunch;
- expected versus actual restore coordinates and work-area containment;
- second-launch forwarding events when applicable.

The logger does **not** record task titles, task descriptions, notes, list names or other user-authored content. The panic diagnostic deliberately omits the panic payload/message (which could contain such content) but its stack trace may contain local source/binary paths. Handle the entire evidence directory as local diagnostic material. It does not upload anything and does not add cloud telemetry.

## Evaluator semantics

The evaluator reports one of:

- **PASS** — a qualifying Timer drag was recorded, tray Quit saved placement successfully, a different process/session relaunched the same exact executable bytes/source build, monitor topology remained unchanged, the same persisted placement was loaded, the actual restored position matched the placement engine's expected position within 2 physical pixels, and the visible Timer region remained inside the target work area.
- **FAIL** — the recorded data proves a persistence/restore contradiction, such as a different placement being loaded after restart, restore coordinates diverging from the placement engine's expected coordinates, or the restored visible region ending outside the target work area.
- **INCONCLUSIVE** — required evidence is missing or intentionally unsuitable for automatic acceptance, such as too-small/no drag, no visible-Timer save at tray Quit, a changed monitor topology, a different executable fingerprint/source build after restart, or inability to persist the cross-restart validation state.
- **PENDING** — the attempt is not complete yet.

A PASS is deliberately fail-closed: missing observations never become PASS.

## Relationship to video evidence

The automatic evaluator is the primary structured technical evidence for the final saved-placement test. A `panic-first-fault.jsonl` file supports causal analysis only when it actually records a first fault; a missing file, clean launch or mere lock-poison symptom must not be promoted to root-cause proof. A short continuous screen recording remains useful as independent physical confirmation and for diagnosing unexpected visual behavior, but the raw JSONL trace provides the detailed native/persistence timeline needed for debugging.

## Opt-in Timer first-fault diagnostics across all candidate executables

**Separate from the automatic M7 validation logger above.** Candidate A/B, regular `narro.exe`, and the dedicated validation executable can all activate this *additional* local-only diagnostic channel by explicitly setting `NARRO_TIMER_DIAGNOSTICS_DIR` to a writable **absolute directory** before process startup. Without this variable the new channel performs **no diagnostic file I/O**; the existing M7 validation-only logger works as before.

For an isolated disposable test session, set the environment variable in the **launching process** (example PowerShell, adjust paths to the actual isolated test files):

```powershell
$env:NARRO_TIMER_DIAGNOSTICS_DIR = 'C:\Temp\Narro-Timer-Diagnostics'
& 'C:\Isolated-Narro-Candidate\narro-m7-validation.exe'
Remove-Item Env:NARRO_TIMER_DIAGNOSTICS_DIR
```

The specified directory receives one `timer-diagnostics-<PID>.jsonl` per process. Each log is capped at approximately 4 MiB plus one last record; the cap is deliberately fail-closed to prevent an unattended tick loop filling the disk. Only startup, committed interactive transitions, first poison occurrence *per lock category*, and panic evidence are written; 250ms successful background ticks are **not** written. Any write failure reports a technical diagnostic error to stderr but never changes authoritative Timer state, rollback behavior or the user-facing error code. If the explicit directory is invalid or cannot be created/opened at startup, the application fails startup instead of falsely claiming logging is active.

**Recorded fields:** UTC, process ID, build source SHA when supplied by packaging (otherwise `unknown`), thread name, named Timer operation, last stage (`read-clock`, `advance-and-persist-boundary`, `apply-authoritative-transition`, `reconcile-after-commit`, `publish-after-lock-release`, Focus Home lease, sleep/resume, or final checkpoint), panic source file/line and forced Rust backtrace. On the **first** poisoned `state`, `focus_home_pause_gate`, or `focus_home_pause_lease` mutex, the error event identifies the offending lock and caller operation. This distinguishes which lock reported the symptom; it does **not** alone prove what originally panicked.

No task title, note, list name, task content, command input, database path or panic payload is intentionally serialized. A backtrace can include local source paths/symbols, so protect the files as private diagnostic evidence. There is no network request or automatic upload. The existing Rust panic hook runs after the additional recorder, preserving ordinary panic/poison semantics. On the dedicated validation executable **both** log formats may contain the same panic for independent provenance; do not count this as two faults.

**Evidence/acceptance rule:** a new executable including this change and a first-fault log from the actual failed PID are required for root-cause attribution. The original historical PR419 B executable is unchanged and cannot retroactively gain this instrumentation. A later successful launch, absent first-fault file or inferred stack does not fix or close `TIMER_SERVICE_LOCK_POISONED`. Existing PR389/PR419 compositor physical-before-merge holds remain independent.
