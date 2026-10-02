# M7 automatic local validation logging

The final M7 physical closure uses a dedicated validation executable named:

`narro-m7-validation.exe`

It is the same Narro runtime source with validation-only local instrumentation activated solely by that executable filename. Normal `narro.exe` does not enable this logger.

## What the user does

1. Extract/download the M7 validation artifact.
2. Run `narro-m7-validation.exe` normally. No PowerShell setup is required.
3. Keep/start one real active task and show the compact Floating Timer.
4. Drag the Timer by at least 64 physical pixels to an obvious safe non-default position.
5. Quit normally through tray **Quit Narro**.
6. Relaunch the same `narro-m7-validation.exe`.
7. Show/reopen the Timer for the recovered/live task.
8. Open the automatically created sibling folder `Narro-M7-Logs`.
9. Upload the latest `session-*` folders plus `m7-c5-latest-result.json` (and preferably `m7-c5-last-terminal-result.json`) for audit/debugging.

## Automatic files

The executable creates `Narro-M7-Logs` next to itself when that location is writable. If it is not writable, it falls back to Narro's local AppData validation-log directory.

Each process launch creates a new `session-*` directory containing:

- `session.json` — process/build/privacy metadata;
- `events.jsonl` — ordered timestamped technical events;
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

- UTC timestamp, monotonic elapsed time, sequence number, process/session identity and source SHA;
- Focus presentation (Panel / compact Timer / expanded Timer);
- Focus HWND outer position, size, visibility and scale factor;
- monitor names, bounds, work areas and DPI scale factors;
- native Timer move events accepted by the production placement path;
- placement persisted to SQLite, including saved position, visible size, monitor/work-area metadata;
- normal tray-Quit request and placement-save outcome;
- placement loaded and restored after relaunch;
- expected versus actual restore coordinates and work-area containment;
- second-launch forwarding events when applicable.

The logger does **not** record task titles, task descriptions, notes, list names or other user-authored content. It does not upload anything and does not add cloud telemetry.

## Evaluator semantics

The evaluator reports one of:

- **PASS** — a qualifying Timer drag was recorded, tray Quit saved placement successfully, a different process/session relaunched the same source build, monitor topology remained unchanged, the same persisted placement was loaded, the actual restored position matched the placement engine's expected position within 2 physical pixels, and the visible Timer region remained inside the target work area.
- **FAIL** — the recorded data proves a persistence/restore contradiction, such as a different placement being loaded after restart, restore coordinates diverging from the placement engine's expected coordinates, or the restored visible region ending outside the target work area.
- **INCONCLUSIVE** — required evidence is missing or intentionally unsuitable for automatic acceptance, such as too-small/no drag, no visible-Timer save at tray Quit, a changed monitor topology, a different source build after restart, or inability to persist the cross-restart validation state.
- **PENDING** — the attempt is not complete yet.

A PASS is deliberately fail-closed: missing observations never become PASS.

## Relationship to video evidence

The automatic evaluator is the primary structured technical evidence for the final saved-placement test. A short continuous screen recording remains useful as independent physical confirmation and for diagnosing unexpected visual behavior, but the raw JSONL trace provides the detailed native/persistence timeline needed for debugging.
