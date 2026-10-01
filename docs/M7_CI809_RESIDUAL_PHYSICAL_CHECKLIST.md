# M7 CI #809 residual physical acceptance

Use only the CI #809 production artifact from Windows CI run `36865451660`.

## Candidate identity

- Artifact: `narro-m7-physical-windows-x64` (GitHub artifact id `11163439039`)
- ZIP SHA-256: `39ca0a91d7aa54be79ca35c509f82f25049a15a3fc4ffff199699eab309557a5`
- `narro.exe` SHA-256: `a4b8e163539f429769540480a7aa0b5db9ca6fa2c356d6742f78d687b5cb5675`
- Source: PR #208 exact head `d885a577c5e7f2e376ed1f6cf5e7f83146dfec58`, merged source `2767b3827670603d1ab259b6a843c2e0da82d85d`

Before recording, make sure old CI #795 fixture state is absent. Do not use an old profile that still contains `CI Focus Runtime` / `Packaged runtime focus task` residue.

At the start of the recording, show:

```powershell
Get-FileHash .\narro.exe -Algorithm SHA256
```

Expected hash: `A4B8E163539F429769540480A7AA0B5DB9CA6FA2C356D6742F78D687B5CB5675`.

## Residual run only

Already-proven CI #806 behavior does not need to be repeated: general Panel↔Timer continuity, task/time continuity, Focus→Main completion reconciliation, and ordinary live dragging.

### 1. Corrected Timer compositor boundary — C4

- [ ] Start one normal real task/session.
- [ ] Windows animations **On**.
- [ ] Run **5 compact → expanded → compact** cycles.
- [ ] Watch specifically for any white L/outline, blank, pale, loading, stale, duplicate, clipped or partially painted Timer frame.
- [ ] No document/browser scrollbar appears.
- [ ] Turn Windows animations **Off**.
- [ ] Run **2 compact → expanded → compact** cycles.
- [ ] Restore Windows animations **On** before continuing.

The CI #806 defect was visible during expanded→compact around 81.50 s. The corrected build must not reproduce it.

### 2. Single-instance ownership

- [ ] While Narro is already running, launch the same `narro.exe` a second time.
- [ ] Show Task Manager **Details** filtered to `narro.exe` (ignore WebView2 child processes).
- [ ] Exactly one Narro application authority remains; no competing Narro runtime/window appears.

### 3. Blitz-now entry semantics

- [ ] Keep the active task in compact or expanded Timer presentation.
- [ ] Click the Main-window `Blitz now` control while the Timer is visible.
- [ ] The existing persistent Focus surface presents the **Focus Panel**, not another Timer/window.

### 4. Real mixed-DPI / work-area behavior — C5

- [ ] In Windows Display settings, visibly show one monitor at **100%** and the other at **125%** before the move.
- [ ] Move the compact Timer from the 100% display to the 125% display and back.
- [ ] Timer remains correctly scaled and fully usable on both displays.
- [ ] Place Timer close to a taskbar/screen edge on the secondary display.
- [ ] Expand and collapse it; controls remain visible and the window stays inside usable work area.
- [ ] If practical, disconnect/reconnect the secondary display and confirm safe recovery. If unavailable, say so explicitly rather than simulating it.

### 5. Topmost

- [ ] Open a maximized or borderless-fullscreen application; browser F11 is sufficient for a borderless-fullscreen observation.
- [ ] Show the Timer above it.
- [ ] Switch focus away and back; Timer remains visible/topmost as intended.

### 6. Saved placement across restart

- [ ] Drag Timer to an obvious safe non-default position.
- [ ] Quit Narro normally through tray `Quit Narro`.
- [ ] Relaunch the same CI #809 `narro.exe`.
- [ ] Reopen/show the Timer for the live/recovered task as applicable.
- [ ] Saved placement returns to a safe visible position and is not stranded/off-screen.

### 7. Clean idle shortcut no-op — finish last

- [ ] End/complete the active task cleanly and visibly reach `All Clear` / no active Focus task.
- [ ] Press **Ctrl+Shift+T**. No placeholder Timer appears.
- [ ] Press **Ctrl+Shift+P** (`Find Timer`). No Timer is surfaced and no stale-Timer attention pulse appears.

Pause briefly before each idle shortcut, or type a marker in Notepad, so the otherwise invisible keypress can be audited.

## Evidence rule

One continuous recording is preferred. If any item fails, keep recording long enough to show the exact stable state after the failure and note the timestamp. Do not rerun the entire M7 matrix; only the evidenced failing gate will reopen.
