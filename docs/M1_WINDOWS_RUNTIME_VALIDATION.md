# Milestone 1: Windows Runtime Validation Harness

This document defines the manual validation procedures for the Tauri 2 native runtime harness on Windows.

Automated Windows CI proves compilation, unit tests, dependency resolution and installer/artifact generation. It does **not** prove interactive desktop behavior such as cross-window event delivery, native window destruction/recreation, always-on-top, taskbar behavior, tray UX or physical monitor placement. Those observations must be performed on a real Windows desktop.

## Preferred test build

Always use the exact current artifact identity in `HANDOFF.md`.

For diagnostic retests, prefer the raw `narro.exe` from the artifact when available so installer caching cannot accidentally execute an older build.

The diagnostic build is unsigned. Windows may show an unsigned-app / SmartScreen warning. This is expected for the Milestone 1 test build.

## Testing methods

### Option A — preferred: run the current CI artifact

1. Open the repository's **Actions** tab.
2. Open the successful `Windows CI` run identified in `HANDOFF.md`.
3. Download `narro-m1-runtime-harness-windows-x64`.
4. Extract the ZIP.
5. Prefer the included raw `narro.exe` for diagnostic retests; installer packages are also included when needed.
6. Launch Narro.
7. Perform the scenarios requested by `HANDOFF.md` and record every PASS/FAIL result.

### Option B — local development machine

Use this only on a Windows machine with Node, Rust/MSVC and WebView2 available:

```powershell
npm ci
npm run tauri dev
```

## Scenario 1 — shared authoritative Rust state

**Goal:** prove that `main` and `focusSurface` project the same Rust-owned state rather than independent authoritative renderer copies.

1. Launch Narro. The `main` diagnostic window should appear.
2. In `main`, click **Show FocusSurface**.
3. Confirm the `focusSurface` diagnostic window appears.
4. In `main`, click **Mutate State (Counter)**.
5. Confirm the counter increments in `main`.
6. **PASS/FAIL:** does `focusSurface` immediately display the same updated counter?
7. In `focusSurface`, click **Mutate State**.
8. **PASS/FAIL:** does `main` immediately display the same new counter?

Record:

- Main -> FocusSurface state event: `PASS / FAIL`
- FocusSurface -> Main state event: `PASS / FAIL`

## Scenario 2 — main window lifecycle and state survival

**Goal:** prove that the `main` webview can be hidden/destroyed/recreated without terminating the Rust process or resetting Rust state.

1. Keep `focusSurface` visible.
2. Mutate the counter to a recognizable value such as `5`.
3. In `focusSurface`, click **Hide Main**. Confirm `main` disappears.
4. Click **Show Main**. Confirm `main` reappears with the same counter.
5. In `focusSurface`, click **Destroy Main**. Confirm the `main` webview disappears.
6. While `main` does not exist, click **Mutate State** in `focusSurface` and note the new exact counter value.
7. Click **Recreate Main**.
8. **PASS/FAIL:** does a new `main` window appear and initialize the diagnostic UI?
9. **PASS/FAIL:** does `focusSurface` remain responsive after recreation?
10. **PASS/FAIL:** does recreated `main` immediately display the exact counter value noted in step 6 rather than resetting to `0` or another value?

Notes:

- **Destroy Main** uses Tauri `WebviewWindow::destroy()`.
- **Close Main** is a separate diagnostic control using Tauri `close()` and is not the forced-destroy proof.
- Recreated `main` currently uses fixed `800×600` geometry. Preserving prior position/geometry is outside this slice.

Record:

- Hide/show main: `PASS / FAIL`
- Forced destroy while process/focusSurface survives: `PASS / FAIL`
- State mutation while main is absent: `PASS / FAIL`
- Recreate main UI: `PASS / FAIL`
- FocusSurface responsive after recreation: `PASS / FAIL`
- Exact Rust state survives recreation: `PASS / FAIL`

## Scenario 3 — same `focusSurface` as Focus Panel / Floating Timer

**Goal:** prove that Narro can resize/restyle the same existing `focusSurface` webview instead of creating a third persistent focus webview.

1. Ensure both windows are visible.
2. In `main`, click **Refresh Window List**.
3. Confirm the list contains exactly `main` and `focusSurface`.
4. In `focusSurface`, click **Timer Mode**.
5. **PASS/FAIL:** does the same window resize to approximately `300×100`?
6. Open a normal Windows application such as Notepad or a browser and place/focus it over the Narro area.
7. **PASS/FAIL:** does Timer Mode remain above the normal application?
8. **PASS/FAIL:** is Timer Mode absent from normal taskbar presentation?
9. In `focusSurface`, click **Panel Mode**.
10. **PASS/FAIL:** does the same window resize to approximately `400×700`?
11. **PASS/FAIL:** does Panel Mode stop being always-on-top and return to normal taskbar presentation?
12. In `main`, click **Refresh Window List** again.
13. **PASS/FAIL:** does the list still contain exactly `main` and `focusSurface`, with no third persistent webview?

Important:

- monitor-edge positioning is validated separately in Scenario 5;
- the current diagnostic window remains manually resizable after a mode command; that is acceptable for M1 and is not final product sizing behavior.

Record:

- Timer geometry: `PASS / FAIL`
- Timer always-on-top: `PASS / FAIL`
- Timer skip-taskbar behavior: `PASS / FAIL`
- Panel geometry/restyle restore: `PASS / FAIL`
- Same `focusSurface` reused / no third webview: `PASS / FAIL`

## Scenario 4 — tray/background recovery and explicit Quit

**Goal:** prove Narro can intentionally remain alive in the background without becoming an invisible, unkillable process from the user's perspective.

This scenario applies only to builds containing the M1 tray lifecycle implementation.

1. Launch Narro.
2. Confirm a Narro symbol icon exists in the Windows system tray/notification area.
3. Show `focusSurface`, then switch it to Timer Mode.
4. Close `main` using the native window `X`.
5. **PASS/FAIL:** does the tray icon remain present while Narro continues running?
6. Hide `focusSurface` so no Narro window is visible.
7. **PASS/FAIL:** is the tray icon still the visible indication that Narro is running?
8. Left-click the tray icon.
9. **PASS/FAIL:** does Narro show or recreate `main` and focus it?
10. Hide/close `main` again.
11. Open the tray context menu and choose **Show Focus Surface**.
12. **PASS/FAIL:** does `focusSurface` become visible/focused again?
13. Hide all Narro windows again.
14. Open the tray context menu and choose **Quit Narro**.
15. **PASS/FAIL:** does the tray icon disappear and the Narro process terminate cleanly without Task Manager?
16. Optionally confirm in Task Manager that no Narro process remains after explicit Quit.

Record:

- Tray visible while main closed: `PASS / FAIL`
- Tray visible when all app windows hidden: `PASS / FAIL`
- Tray Show/Recreate Narro: `PASS / FAIL`
- Tray Show Focus Surface: `PASS / FAIL`
- Explicit Quit terminates process: `PASS / FAIL`
- No hidden Narro process after Quit: `PASS / FAIL`

## Scenario 5 — monitor enumeration and Focus Panel edge placement

**Goal:** prove Narro can enumerate the current Windows display topology and place the Focus Panel against the selected monitor's left or right work-area edge without relying on a hard-coded primary-screen origin.

This scenario proves explicit enumeration/placement only. **Automatic display-hotplug detection and recovery are a separate M1 capability and must not be inferred from this scenario.**

1. Launch the current diagnostic build and click **Show FocusSurface**.
2. In `main`, click **Refresh Monitors**.
3. **PASS/FAIL:** does the monitor selector list the displays currently enabled in Windows Display Settings?
4. Inspect the selected monitor descriptor. Confirm resolution, desktop position, work-area position/size and scale factor are plausible for that display.
5. Choose a monitor and click **Position Focus Panel Left**.
6. **PASS/FAIL:** does the same `focusSurface` switch to Panel mode and move to the selected monitor's left work-area edge?
7. Click **Position Focus Panel Right**.
8. **PASS/FAIL:** does the same panel move to that monitor's right work-area edge?
9. If more than one monitor is available, select each monitor in turn and repeat left/right placement.
10. **PASS/FAIL:** does the panel move to the chosen display rather than always using the primary monitor?
11. Confirm the panel top edge uses the Windows work area and does not intentionally position underneath a taskbar/docked work-area exclusion.
12. **PASS/FAIL:** does **Refresh Window List** still report only `main` and `focusSurface`?

### Optional stale-selection fail-safe check

Perform this only if disconnecting a secondary display is convenient and safe for your desktop setup.

1. With at least two monitors connected, click **Refresh Monitors** and select a secondary display.
2. Disconnect/disable that selected display **without clicking Refresh Monitors again**.
3. Click **Position Focus Panel Left** or **Right** using the now-stale selection.
4. **PASS/FAIL:** does Narro reject the action with `MONITOR_SELECTION_STALE` (or an equivalent explicit topology error) instead of silently targeting a different remaining monitor?
5. Click **Refresh Monitors** and confirm the selector updates to the currently available displays.

This optional check validates fail-safe stale-selection handling. It does **not** validate automatic hotplug detection/re-enumeration.

Record:

- Monitor enumeration matches Windows topology: `PASS / FAIL`
- Selected-monitor left placement: `PASS / FAIL`
- Selected-monitor right placement: `PASS / FAIL`
- Multi-monitor target selection (if applicable): `PASS / FAIL / NOT APPLICABLE`
- Work-area placement is plausible: `PASS / FAIL`
- Same two-webview model preserved: `PASS / FAIL`
- Stale monitor selection rejected safely: `PASS / FAIL / NOT RUN`

## What to send back after testing

Send the PASS/FAIL results plus any unexpected behavior. Screenshots are useful for failures but are not required for obvious PASS results.

Do **not** edit `TODO.md` manually unless you want to. The next coding/review agent can update the repository checklist from the observed evidence.
