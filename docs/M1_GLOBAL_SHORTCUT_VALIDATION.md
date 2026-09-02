# Milestone 1 — Windows global shortcut validation

This procedure validates the temporary Narro M1 global-shortcut harness on a real Windows desktop.

Automated CI can prove compilation, linting, unit tests and packaging. It cannot prove that Windows actually reserves the key combination, delivers `WM_HOTKEY`, or releases the registration after unregister/exit.

## Diagnostic shortcut

The current M1 harness uses:

`Ctrl + Alt + Shift + N`

Implementation properties:

- native Windows `RegisterHotKey` / `UnregisterHotKey`;
- `MOD_NOREPEAT` so holding the key does not continuously generate trigger events;
- `focusSurface` is the persistent HWND that receives `WM_HOTKEY`;
- the shortcut does not depend on `main` existing;
- each accepted trigger increments `global_shortcut_trigger_count` in authoritative Rust state and advances the state revision;
- registration and unregistration are idempotent at the Narro command boundary;
- conflict and operation failures use structured command errors;
- a deterministic conflict probe is available while the Narro shortcut is unregistered.

`F12` is intentionally not used because Windows reserves it for debugger use.

## Scenario 1 — register and fire

1. Launch the fresh diagnostic `narro.exe`.
2. In `main`, find **Global Shortcut Diagnostics**.
3. Confirm status initially says **not registered**.
4. Note the current `global_shortcut_trigger_count` in Authoritative Rust State.
5. Click **Register Global Shortcut**.
6. **PASS/FAIL:** status changes to **registered** without an error.
7. Click **Register Global Shortcut** again only if the button/control allows it in the build under test.
8. **PASS/FAIL:** registration remains stable and does not create duplicate trigger behavior.
9. Press `Ctrl + Alt + Shift + N` once.
10. **PASS/FAIL:** `global_shortcut_trigger_count` increases by exactly 1.
11. Hold the shortcut briefly instead of repeatedly releasing/repressing it.
12. **PASS/FAIL:** `MOD_NOREPEAT` prevents a rapid stream of repeated trigger increments from one held press.

Record:

- Register succeeds: `PASS / FAIL`
- One press increments exactly once: `PASS / FAIL`
- Held-key repeat suppressed: `PASS / FAIL`

## Scenario 2 — works while `main` is destroyed

1. Keep the shortcut registered.
2. Show `focusSurface` so its authoritative state is visible.
3. Note the current shortcut trigger count.
4. Destroy `main` using the diagnostic **Destroy Main** control.
5. Press `Ctrl + Alt + Shift + N` once.
6. **PASS/FAIL:** the count shown by `focusSurface` increases by exactly 1 while `main` does not exist.
7. Recreate `main`.
8. **PASS/FAIL:** recreated `main` shows the same surviving shortcut trigger count and revision as `focusSurface`.

This also gives another explicit observation for the still-open exact-state-survival-across-recreate check.

Record:

- Shortcut works with `main` destroyed: `PASS / FAIL`
- Recreated `main` sees surviving trigger state: `PASS / FAIL`

## Scenario 3 — unregister and release

1. With `main` available, click **Unregister Global Shortcut**.
2. **PASS/FAIL:** status changes to **not registered** without an error.
3. Note the current trigger count.
4. Press `Ctrl + Alt + Shift + N`.
5. **PASS/FAIL:** Narro's trigger count does not change.
6. Click **Unregister Global Shortcut** again only if the control allows it in the build under test.
7. **PASS/FAIL:** repeated unregister is harmless/idempotent.

Record:

- Unregister succeeds: `PASS / FAIL`
- Shortcut no longer fires after unregister: `PASS / FAIL`
- Repeated unregister harmless: `PASS / FAIL`

## Scenario 4 — deterministic conflict handling

The Narro shortcut must be **unregistered** before this test.

1. Confirm status says **not registered**.
2. Click **Probe Shortcut Conflict**.
3. The probe first reserves the diagnostic combination under a temporary hotkey ID, then attempts to register the same combination under the real Narro ID, and finally cleans up the temporary reservation.
4. **PASS/FAIL:** the probe reports `conflictDetected: true`.
5. Preferred source is `deterministic-self-probe`; `external-or-system` is also valid if another application/Windows already owned the combination before the probe could reserve it.
6. **PASS/FAIL:** after the probe, Narro status remains **not registered**.
7. Click **Register Global Shortcut**.
8. **PASS/FAIL:** if no external program owns the combination, registration still succeeds, proving the probe cleaned up its temporary reservation.

If actual registration fails with `GLOBAL_SHORTCUT_CONFLICT`, record the exact error and any application that may already own that combination. Do not treat a real external conflict as a Narro crash; explicit conflict feedback is the expected safe failure path.

Record:

- Conflict detected explicitly: `PASS / FAIL`
- Probe leaves Narro unregistered: `PASS / FAIL`
- Probe cleanup allows later registration: `PASS / FAIL / BLOCKED BY EXTERNAL CONFLICT`
- Structured external conflict error if encountered: `PASS / FAIL / NOT ENCOUNTERED`

## Scenario 5 — background/tray interaction

Optional for the same consolidated M1 manual pass:

1. Register the shortcut.
2. Destroy/close `main`.
3. Hide `focusSurface` so only the tray affordance remains.
4. Press the shortcut once.
5. Restore `focusSurface` from the tray.
6. **PASS/FAIL:** its trigger count reflects the hidden/background shortcut press.
7. Use tray **Quit Narro**.
8. Relaunch Narro.
9. **PASS/FAIL:** the old process did not leave the Windows hotkey registration stuck; the new process can register the shortcut normally unless another program acquired it meanwhile.

## Evidence rule

Do not mark the M1 global-shortcut TODO parent complete from CI alone. Record physical PASS/FAIL observations in the user-runtime evidence file or a new immutable work-log entry, with the exact artifact/run used.
