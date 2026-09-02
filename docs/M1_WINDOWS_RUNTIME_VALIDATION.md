# Milestone 1: Windows Runtime Validation Harness

This document defines the manual validation procedures for the Tauri 2 native runtime harness on Windows.

Automated Windows CI proves compilation, unit tests, dependency resolution and installer generation. It does **not** prove interactive desktop behavior such as cross-window event delivery, native window destruction/recreation, always-on-top or taskbar behavior. Those observations must be performed on a real Windows desktop.

## Preferred test build

The verified GitHub Actions build is:

- Workflow: `Windows CI`
- Run: `33654231268`
- Commit: `843549c5acf62eac1d178730bdaa18e431c59f46`
- Conclusion: `success`
- Artifact: `narro-m1-runtime-harness-windows-x64`
- Artifact SHA-256 digest: `fae196e8eb053db116025e6a3d1675981115845d636a07794545d899aa189b8b`

The artifact contains:

- `nsis/Narro_0.1.0_x64-setup.exe`
- `msi/Narro_0.1.0_x64_en-US.msi`

The diagnostic build is unsigned. Windows may show an unsigned-app / SmartScreen warning. This is expected for the Milestone 1 test build.

## Testing methods

### Option A — preferred: install the CI artifact

1. Open the repository's **Actions** tab.
2. Open successful `Windows CI` run `33654231268` for commit `843549c5...`.
3. Download the artifact `narro-m1-runtime-harness-windows-x64`.
4. Extract the ZIP.
5. Install either the NSIS `.exe` or MSI package. You do not need both.
6. Launch **Narro**.
7. Perform Scenarios 1–3 below and record every PASS/FAIL result.

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

- Main → FocusSurface state event: `PASS / FAIL`
- FocusSurface → Main state event: `PASS / FAIL`

## Scenario 2 — main window lifecycle and state survival

**Goal:** prove that the `main` webview can be hidden/destroyed/recreated without terminating the Rust process or resetting Rust state.

1. Keep `focusSurface` visible.
2. Mutate the counter to a recognizable value such as `5`.
3. In `focusSurface`, click **Hide Main**. Confirm `main` disappears.
4. Click **Show Main**. Confirm `main` reappears with the same counter.
5. In `focusSurface`, click **Destroy Main**. Confirm the `main` webview disappears.
6. While `main` does not exist, click **Mutate State** in `focusSurface`.
7. Confirm the counter continues to increment in `focusSurface`.
8. Click **Recreate Main**.
9. **PASS/FAIL:** does a new `main` window appear?
10. **PASS/FAIL:** does recreated `main` immediately display the surviving counter instead of resetting to `0`?

Notes:

- **Destroy Main** uses Tauri `WebviewWindow::destroy()`.
- **Close Main** is a separate diagnostic control using Tauri `close()` and is not the forced-destroy proof.
- Recreated `main` currently uses fixed `800×600` geometry. Preserving previous position/geometry is outside this slice.

Record:

- Hide/show main: `PASS / FAIL`
- Forced destroy while process/focusSurface survives: `PASS / FAIL`
- State mutation while main is absent: `PASS / FAIL`
- Recreate main: `PASS / FAIL`
- Rust state survives recreation: `PASS / FAIL`

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

Important: monitor-edge repositioning is **not implemented or validated in this slice**. This scenario proves resize/restyle/reuse only.

Record:

- Timer geometry: `PASS / FAIL`
- Timer always-on-top: `PASS / FAIL`
- Timer skip-taskbar behavior: `PASS / FAIL`
- Panel geometry/restyle restore: `PASS / FAIL`
- Same `focusSurface` reused / no third webview: `PASS / FAIL`

## What to send back after testing

Send the PASS/FAIL results plus any unexpected behavior. Screenshots are useful for failures but are not required for obvious PASS results.

Do **not** edit `TODO.md` manually unless you want to. The next coding/review agent can update the repository checklist from the observed evidence.