# Milestone 1 — User Windows runtime validation results

Date: 2026-09-02

Environment: real user Windows desktop using the CI-produced diagnostic artifact from successful `Windows CI` run `33654231268`, commit `843549c5acf62eac1d178730bdaa18e431c59f46`.

Artifact: `narro-m1-runtime-harness-windows-x64`

## Evidence summary

The first interactive Windows run established that shared Rust state/event propagation and main-window destroy survival work before the recreate step. The recreate step fails and leaves the recreated `main` white/uninitialized while both webviews become unresponsive.

### Results

- [x] `main` -> `focusSurface` shared state/event propagation: **PASS**
- [x] `focusSurface` -> `main` shared state/event propagation: **PASS**
- [x] hide/show `main`: **PASS**
- [x] forced destroy of `main` leaves process / `focusSurface` alive: **PASS**
- [x] Rust state continues to mutate while `main` is destroyed: **PASS**
- [ ] recreate `main`: **FAIL**
  - recreated native window appears;
  - content is blank/white instead of loading the Narro diagnostic UI;
  - after recreate, both `main` and `focusSurface` stop responding to diagnostic controls.
- [ ] surviving Rust state visible in recreated `main`: **NOT VALIDATED** because recreate deadlocks/freezes the harness before this can be observed.
- [ ] Panel -> Timer -> Panel: **NOT RUN** after the recreate failure; further observations from the frozen process would not be reliable.
- [ ] Always-on-top: **NOT RUN** in this validation pass after the recreate failure.
- [ ] Skip-taskbar: **NOT RUN** in this validation pass after the recreate failure.
- [ ] only `main` + `focusSurface` after mode switching: **NOT RUN** in this validation pass after the recreate failure.

## Observed failure

Sequence that reproduces the failure:

1. Launch Narro diagnostic artifact.
2. Show `focusSurface`.
3. Verify state mutation works in both directions.
4. Hide/show `main` successfully.
5. Destroy `main` from `focusSurface`.
6. Mutate state successfully while `main` is absent.
7. Click **Recreate Main** from `focusSurface`.
8. A new native `Narro Main` window appears with a blank white client area.
9. The newly recreated `main` does not initialize the diagnostic React UI.
10. The original `focusSurface` also stops responding to commands.

This is not merely a visual-loading issue because the surviving `focusSurface` becomes unresponsive at the same point.

## Root-cause evidence to verify/fix

Current `main_window_recreate` is a synchronous Tauri command that directly calls `WebviewWindowBuilder::build()`.

Tauri 2's current Windows documentation explicitly lists a known WebView2 issue: creating a webview window from a **synchronous command or event handler can deadlock on Windows**. The documented guidance is to use an `async` command and/or a separate thread when creating windows.

Relevant current official API documentation:

- https://docs.rs/tauri/latest/x86_64-pc-windows-msvc/tauri/webview/struct.WebviewWindowBuilder.html
- https://docs.rs/tauri/latest/tauri/webview/struct.WebviewWindowBuilder.html

The observed failure mode — new white window plus both webviews becoming unresponsive immediately after synchronous `build()` — is strongly consistent with that documented Windows deadlock.

Do not treat this as fully proven until the recreate path is changed and the user retests the new artifact.

## Required next validation

After the recreate implementation is repaired and a new CI artifact is produced:

- [ ] repeat state mutation in both directions;
- [ ] destroy `main`;
- [ ] mutate Rust state while `main` is absent;
- [ ] recreate `main` without freezing either webview;
- [ ] confirm recreated `main` loads the diagnostic UI;
- [ ] confirm recreated `main` immediately reads the surviving Rust counter/state;
- [ ] then continue Panel -> Timer -> Panel, always-on-top, skip-taskbar, and two-window-count checks.

Until that retest passes, the parent Milestone 1 main lifecycle item remains open.
