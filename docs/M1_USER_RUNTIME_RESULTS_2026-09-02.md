# Milestone 1 — User Windows runtime validation results

Date: 2026-09-02

This file records physical observations from the project owner's real Windows desktop. Automated CI is useful for compile/test evidence, but these observations are the evidence for native window behavior.

## Pass 1 — original recreate failure

Environment: real user Windows desktop using the CI-produced diagnostic artifact from successful `Windows CI` run `33654231268`, commit `843549c5acf62eac1d178730bdaa18e431c59f46`.

Artifact: `narro-m1-runtime-harness-windows-x64`

### Results

- [x] `main` -> `focusSurface` shared state/event propagation: **PASS**
- [x] `focusSurface` -> `main` shared state/event propagation: **PASS**
- [x] hide/show `main`: **PASS**
- [x] forced destroy of `main` leaves process / `focusSurface` alive: **PASS**
- [x] Rust state continues to mutate while `main` is destroyed: **PASS**
- [ ] recreate `main`: **FAIL**
  - recreated native window appeared;
  - content stayed blank/white instead of loading the Narro diagnostic UI;
  - after recreate, both `main` and `focusSurface` stopped responding.

### Root cause and repair

The failing `main_window_recreate` path synchronously called `WebviewWindowBuilder::build()` from a Tauri command. Tauri 2 documents a Windows/WebView2 deadlock risk for webview-window creation from synchronous commands/event handlers.

The recreate command was changed to the documented async-command execution pattern and rebuilt in Windows CI.

Relevant official references:

- https://docs.rs/tauri/latest/x86_64-pc-windows-msvc/tauri/webview/struct.WebviewWindowBuilder.html
- https://docs.rs/tauri/latest/tauri/webview/struct.WebviewWindowBuilder.html

## Pass 2 — async recreate retest and focus-surface checks

Environment: real user Windows desktop using the newer raw `narro.exe` from successful Windows CI run `33658001715`, commit `2237f2f9d44c5a332856153475a11a47d04f6e67`.

### Results

- [x] `main` -> `focusSurface` state/event propagation: **PASS**
- [x] `focusSurface` -> `main` state/event propagation: **PASS**
- [x] forced destroy of `main` leaves the app/runtime alive: **PASS**
- [x] Rust state can still mutate while `main` is destroyed: **PASS**
- [x] recreated `main` opens and initializes its diagnostic UI: **PASS**
- [x] `focusSurface` remains responsive after `main` recreation: **PASS**
- [ ] recreated `main` visibly preserves the pre-destroy Rust counter/state: **NOT CONFIRMED**
  - the user reported this item as `PASS/FAIL`, so no stronger claim is recorded;
  - the parent lifecycle task remains open until this exact observation is confirmed.
- [x] `focusSurface` Panel -> Timer -> Panel transition: **PASS**
- [x] Timer Mode always-on-top against normal Windows applications: **PASS**
- [x] Timer Mode skip-taskbar behavior: **PASS**
- [x] only `main` and `focusSurface` remain as persistent webviews: **PASS**

## Additional observations discovered in Pass 2

### Diagnostic Panel/Timer geometry is still manually resizable

The current diagnostic Panel/Timer commands only switch the same `focusSurface` to predetermined dimensions/properties. The user can still manually resize the window afterward.

This is **not treated as a Milestone 1 failure**. The harness is temporary and exists to validate the window model. Final product constraints/geometry belong to the Focus Panel/Floating Timer implementation milestones unless a native sizing constraint is required for another M1 capability test.

### Background lifecycle can become invisible with no explicit exit path

The user discovered a real M1 lifecycle gap:

1. closing `main` with the native `X` leaves the Narro process alive because `focusSurface`/runtime can continue;
2. Panel/Timer may have no normal taskbar entry;
3. if `focusSurface` is also hidden, Narro can continue running with **no visible window, taskbar entry, tray affordance or explicit Quit path**;
4. the only observed way to terminate that state was Windows Task Manager.

This is not acceptable for the intended background/tray architecture. It makes process state invisible and gives the user no normal recovery or exit control.

The next implementation slice therefore prioritizes a persistent Windows tray affordance with:

- Show/Recreate Narro main window;
- Show/Focus `focusSurface`;
- explicit **Quit Narro** that terminates the process cleanly.

This tray slice is allowed to move ahead of some earlier M1 checklist entries because it directly fixes a lifecycle/recovery defect exposed by real Windows testing and makes subsequent manual tests safe.

## Current validation conclusions

Physically proven on Windows so far:

- the two-webview model shares authoritative Rust state/events at runtime;
- `main` can be destroyed without killing the Rust runtime or `focusSurface`;
- the async recreate path no longer reproduces the original white-window/deadlock failure;
- one `focusSurface` can switch between Panel and Timer dimensions/properties without creating a third persistent webview;
- Timer Mode can be always-on-top and skipped from the taskbar.

Still required before the `main` lifecycle parent item is fully closed:

- [ ] explicitly confirm the surviving Rust counter/state is visible unchanged in the recreated `main`.

New lifecycle validation required after the tray implementation is built:

- [ ] tray icon remains visible when `main` is closed and `focusSurface` is hidden;
- [ ] tray **Show Narro** recreates/shows `main` when necessary;
- [ ] tray **Show Focus Surface** restores the secondary surface;
- [ ] tray **Quit Narro** terminates the background process cleanly;
- [ ] no hidden Narro process remains after explicit Quit.
