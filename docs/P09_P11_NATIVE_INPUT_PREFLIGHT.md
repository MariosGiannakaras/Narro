# P09/P11 — focused native input pre-physical handoff (2026-10-26)

## Scope and authority

This prepares **evidence collection** for two observed native intended-outcome failures on validated production source `efe6cadd8fb7d1a4785cd584c6d3d18e17523142`: P11 Ctrl+F displayed WebView2 Find instead of Narro Search; Ctrl+Alt+T did not show the quick-create palette; P09 Compact Timer attempts did not displace the host HWND. Source ownership is **UNKNOWN** until input delivery is measured. The probe is **not a source fix**, **not native physical acceptance**, and cannot turn the prior FAIL into PASS.

The probe is strictly read-only: it injects temporary capture-phase DOM observers via CDP into an **already running** Narro instance. It does not send keys, click, move the pointer/window, invoke Tauri APIs, take task text, record arbitrary keystrokes or alter storage. Only Ctrl+F / Ctrl+Alt+T key metadata, Compact Timer pointer metadata, geometry/focus/modals and limited structural hit-test info are retained. Output is a new explicit JSON file, never overwritten. `--self-test` is part of frontend preflight and **cannot** replace the Windows observation.

### Preconditions

- Run against a **fresh isolated test profile**, not personal Narro AppData or old restored protection ledgers; preserve the verified binary SHA, executable source/CI, port ownership and original video/HWND data.
- The Windows operator must already have started the exact intended EXE with CDP listening on a known isolated port (the established earlier native runs used `9234`). The tool connects only to exact WebView2 pages `http://tauri.localhost/` and `http://tauri.localhost/focus.html`; it rejects missing targets. A URL match alone does **not** prove the CDP process belongs to the isolated profile: verify the owning process separately.
- Node with built-in `fetch` and `WebSocket` is required. Do not enable a shared or externally reachable debug endpoint.

### Windows OS/HWND corroboration — read-only, operator-owned

PR429's CDP probe observes renderer delivery, **not** the Windows side of the same physical action. Capture an independent bounded, opt-in Win32 receipt at the same time. The companion script reads the **named Ctrl/Alt/F/T and left-mouse virtual-key held states**, foreground and focused HWND/PID, cursor point and the rectangles of visible top-level windows of the isolated Narro host process. It neither hooks all keystrokes nor injects input, steals focus, moves windows, accesses Narro storage or records user-entered text.

From a separate terminal on the **same isolated Windows machine**, select the verified exact Narro.exe PID (never a personal-profile process), create a new empty isolated evidence directory, and start this read-only sample before the matching CDP probe and operator action:

```powershell
# First identify the PID of the isolated Narro.exe explicitly; do not infer it from the example.
Get-Process Narro | Select-Object Id, Path
$isolatedNarroPid = 12345 # REPLACE with the verified PID from Get-Process above
powershell -NoLogo -NoProfile -ExecutionPolicy Bypass -File scripts/capture-native-input-receipt.ps1 -TargetProcessId $isolatedNarroPid -Seconds 45 -IntervalMs 50 -Out E:\IsolatedEvidence\P11-main-win32.json
```

Repeat with a **new** file `P09-focus-win32.json` for the P09 held-pointer case. Both scripts write with exclusive CreateNew semantics and will refuse to overwrite an existing receipt; the Win32 collector also refuses to create an unexpected parent directory. The Windows preflight has an isolated, **no-interaction** self-test:

```powershell
powershell -NoLogo -NoProfile -ExecutionPolicy Bypass -File scripts/capture-native-input-receipt.ps1 -SelfTest
```

The self-test is part of the existing Windows `test:performance-harness` candidate path and proves only that the isolated Win32 interop entrypoints can be called. Align `startedUtc` plus `elapsedMs` with the CDP receipt's `startedUtc`/event timestamps and the original video. **Do not equate virtual-key polling to an actual keyboard scan-code trace or a Win32 move-loop event:** short presses may be missed between samples, and no sampled key is not proof that no key was pressed. An externally witnessed physical action and the focused/foreground HWND are still required. For P09 the changing (or stationary) **Narro-owned HWND rect**, not `window.screenX` alone, is the native-window observation. `CAPTURED_NOT_VALIDATED` explicitly is **not** a scenario PASS.

### P11 Main — clean keyboard-owner capture

With the verified Main HWND focused, **close WebView2 Find, all modals and edit fields**; put focus on a known noneditable Main element. Start the probe (replace the evidence location with the actual fresh isolated Windows path):

```powershell
node scripts/native-input-prephysical-probe.mjs --target=main --port=9234 --seconds=45 --out=E:\IsolatedEvidence\P11-main-input.json
```

During continuous actual-desktop video, perform physical Ctrl+F, close any Find/palette overlay, reset noneditable focus, then physical Ctrl+Alt+T. Correlate the original video, focused HWND, keyboard scan-code/native accelerator receipt (if available), and probe's `keydown-capture` and `keydown-after-dispatch`. `targetEditable`, `activeEditable`, `modal`, `documentFocused` and `defaultPrevented` distinguish intentionally blocked attempts from valid dispatch. WebView2's native Find **does not exist in the DOM probe**.

- No capture with physically proven key delivery: investigate WebView2 accelerator/native focus delivery; **do not** blame the TS shortcut resolver.
- Valid capture but `defaultPrevented=false` or no expected palette: investigate AppShell/modal/editable/renderer dispatch on that same candidate.
- Modal/editor/focus-confounded captures: **INVALID CASE**, not a product FAIL.
- Never classify absent DOM events as proven absent OS keypress without the independent OS receipt.

### P09 Focus — exact pointer hit and move loop

With Compact Timer visible/settled and Focus HWND focused, execute:

```powershell
node scripts/native-input-prephysical-probe.mjs --target=focus --port=9234 --seconds=45 --out=E:\IsolatedEvidence\P09-focus-input.json
```

Capture actual `pointerdown` target/hit markers and `pointermove` while a **genuine held mouse button** drags a known Compact draggable region. Save synchronized native Win32 HWND rectangle before/during/after, held-button and window move-loop observation plus uninterrupted source video. The `exactDragMarker` and `ancestorDragMarker` are different: Tauri may require the direct hit element. The Compact hover actions intentionally occupy the former heading, so an obscured heading is **not** a valid drag-hit proof. Verify interactive actions remain usable, and do not change accepted Timer geometry or compositor.

- No pointerdown on the expected hit region: verify actual hit-testing/input delivery before changing Tauri code.
- Correct direct drag target and held input, but no move-loop/HWND displacement: investigate native start-dragging owner and permissions with OS evidence.
- Successful native displacement is not a retroactive PASS for the earlier unchanged-HWND attempts; record exact build and target.

### Evidence and disposition

- Correlate the new read-only Win32 receipt (`kind=narro-p09-p11-readonly-win32-input`) with the existing CDP receipt (`kind=narro-p09-p11-dom-delivery-only`). A single side by itself does not prove the handoff. A missed virtual-key poll must be marked inconclusive, not blamed on WebView2 or the app.


A new `P09/P11` outcome requires: exact EXE hash/source, focused HWND, original video, time-correlated probe JSON, actual OS input/move-loop evidence where needed, and per-scenario PASS/FAIL/INVALID/NOT RUN. Do not repeat already accepted A/B functional 8/8+8/8 clips. A/PR389 and B/PR419 strict compositor holds remain separately OPEN.

Exactly **three HUMAN PHYSICAL NOT RUN** remain outside this probe: P18 actual tray Quit, P19 real HDMI unplug/replug, P20 true sustained mouse-held drag+Escape. This probe cannot simulate or certify any of them. P03 source requirement/evidence remains OPEN. No M11/M12 work or personal-data mutation is authorized by this procedure.
