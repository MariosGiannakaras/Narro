# Milestone 1 — Global shortcut Windows validation

This procedure validates the temporary Milestone 1 global-shortcut capability. It is diagnostic evidence only; the accelerator and controls are not final Narro product UX.

## What automated validation can prove

Windows CI can prove:

- the Win32 `RegisterHotKey` / `UnregisterHotKey` FFI compiles and links;
- the shortcut observer compiles with the existing `focusSurface` HWND subclass chain;
- structured error mappings compile and their pure tests pass;
- shortcut state versioning/idempotence/overflow tests pass;
- both frontend bundles compile;
- the Tauri release packages successfully.

CI **cannot** prove a physical keyboard shortcut fires system-wide. Keep the M1 TODO parent open until a real Windows desktop test passes.

## Diagnostic shortcut

Temporary accelerator:

`Ctrl + Alt + Shift + F10`

Properties:

- uses Win32 `RegisterHotKey`;
- uses `MOD_NOREPEAT`;
- avoids F12 because Windows reserves F12 for debugger use;
- is hosted by the persistent `focusSurface` HWND, not by `main`;
- trigger evidence is a Rust-owned versioned `ShortcutStatus`, broadcast to both webviews as `shortcut-state-changed`.

## Scenario 1 — register, idempotence, fire

1. Launch the fresh diagnostic `narro.exe`.
2. In `main`, find **Global Shortcut Diagnostics**.
3. Confirm initial state shows `registered: false` and `triggerCount: 0`.
4. Click **Register Shortcut**.
5. **PASS/FAIL:** state changes to `registered: true` without an error.
6. Click **Register Shortcut** again.
7. **PASS/FAIL:** repeated registration succeeds idempotently and does not create a second registration/state revision solely because of the repeat.
8. Switch focus to a normal unrelated Windows application.
9. Press `Ctrl + Alt + Shift + F10` once.
10. **PASS/FAIL:** Narro's Rust-owned `triggerCount` increments by exactly one.
11. Hold the shortcut briefly instead of repeatedly pressing it.
12. **PASS/FAIL:** keyboard auto-repeat does not rapidly produce repeated increments.

Record:

- First registration: `PASS / FAIL`
- Repeated registration idempotent: `PASS / FAIL`
- System-wide physical fire: `PASS / FAIL`
- `MOD_NOREPEAT` behavior: `PASS / FAIL`

## Scenario 2 — firing while `main` is destroyed

1. Ensure the shortcut is registered.
2. Show `focusSurface` and observe its **Global Shortcut State** block.
3. Destroy `main` using the existing diagnostic control.
4. Press `Ctrl + Alt + Shift + F10` from another normal Windows application.
5. **PASS/FAIL:** `focusSurface` remains responsive and its `triggerCount` increments.
6. Recreate `main`.
7. **PASS/FAIL:** recreated `main` reads the same latest shortcut status/trigger count.
8. Refresh the window list.
9. **PASS/FAIL:** only `main` and `focusSurface` are persistent webviews.

Record:

- Fires with `main` destroyed: `PASS / FAIL`
- Focus surface remains responsive: `PASS / FAIL`
- Recreated main sees latest shortcut state: `PASS / FAIL`
- Only two persistent webviews: `PASS / FAIL`

## Scenario 3 — deterministic duplicate-registration conflict

This does not depend on another random application owning the accelerator.

1. Ensure **Register Shortcut** has succeeded and state is `registered: true`.
2. Click **Probe Duplicate Conflict**.
3. The probe asks Windows to register the exact same accelerator under a second diagnostic hotkey ID.
4. **PASS/FAIL:** result shows `conflictDetected: true` and Windows error code `1409` (`ERROR_HOTKEY_ALREADY_REGISTERED`).
5. **PASS/FAIL:** the primary shortcut remains registered and still fires afterward.

If Windows unexpectedly permits the duplicate registration, Narro must immediately unregister that probe registration and return a structured failure rather than silently accepting an ambiguous state.

Record:

- Duplicate conflict detected: `PASS / FAIL`
- Expected OS error 1409: `PASS / FAIL`
- Primary registration survives probe: `PASS / FAIL`

## Scenario 4 — unregister and idempotence

1. Click **Unregister Shortcut**.
2. **PASS/FAIL:** state becomes `registered: false`.
3. Press `Ctrl + Alt + Shift + F10` from another application.
4. **PASS/FAIL:** Narro's `triggerCount` does not change.
5. Click **Unregister Shortcut** again.
6. **PASS/FAIL:** repeated unregister succeeds idempotently without a spurious failure.
7. Click **Probe Duplicate Conflict** while unregistered.
8. **PASS/FAIL:** Narro rejects the invalid probe with stable code `SHORTCUT_NOT_REGISTERED` rather than performing a misleading OS test.

Record:

- Unregister: `PASS / FAIL`
- No firing after unregister: `PASS / FAIL`
- Repeated unregister idempotent: `PASS / FAIL`
- Probe while unregistered fails explicitly: `PASS / FAIL`

## Scenario 5 — real external conflict, optional

Run only if convenient. The deterministic probe above is the required conflict test.

If another known application already owns `Ctrl + Alt + Shift + F10`, attempt **Register Shortcut**.

Expected behavior:

- registration fails without partially changing Rust shortcut state;
- the UI reports stable code `SHORTCUT_REGISTRATION_CONFLICT` when Windows returns the known duplicate-registration error;
- Narro remains responsive and other native capabilities still work.

Record:

- External conflict handling: `PASS / FAIL / NOT RUN`

## Evidence rule

Send back the PASS/FAIL observations and any unexpected behavior. Do not mark the canonical M1 shortcut TODO parent complete from CI alone. Physical system-wide firing is required evidence.
