# 2026-09-25 — M7 physical Windows reduced-motion follow-up

## Source and setting

- Agent: Codex. Same exact CI #507 runtime artifact `10865303816`, `narro.exe` SHA-256 `1285EC257AF2D45682D96702F815B86E6CC971127264A09EB6D609CAFB56A17A`, source tree `608aec06f64a3184568bc0d171adc1b085220fa9` as the preceding physical logs. One 2560×1080, 100%-scale Windows 10 build 19045 display; bottom auto-hide taskbar.
- Windows Settings → Ease of Access → Display → **Show animations in Windows** was visibly On before testing. It was switched Off through the Settings UI; `HKCU\Control Panel\Desktop\WindowMetrics\MinAnimate` changed from `1` to `0`. The original On setting was restored through the same UI after testing and `MinAnimate=1` verified. This is an actual OS preference check, not CDP media emulation.
- The original paused session `3e77a684-e7d6-4968-a189-cf6d41fc42c3` was used. Visible-desktop 20 fps captures are machine-local under the Codex task `work/reduced-panel-timer-frames/`, `work/reduced-timer-panel-frames/` and `work/reduced-pulse-frames/`. These captures can be occluded; the Focus surface was unobstructed during the recordings.

## Physical results

| Check | Result | Observation |
| --- | --- | --- |
| Panel→Timer with OS animations Off | **FAIL for no-staging-flash criterion** | Panel was stable through frame 262, disappeared at 263, empty Timer-sized WebView with scrollbar occupied frames 264–265, Timer content appeared at 266. No nonessential translation was visible. |
| Timer→Panel with OS animations Off | **FAIL for no-staging-flash criterion** | Timer was stable through frame 267, disappeared at 268, blank white Panel-sized surface occupied frames 269–270, Panel content appeared at 271. No nonessential translation was visible. |
| Visible Timer Ctrl+Shift+P with OS animations Off | **Scoped PASS** | One border accent pulse appeared in frames 266–268 and was gone at 269; the settled Timer content and session remained unchanged. At 20 fps this bounds the visible pulse to the captured frames, not an exact animation duration. |

The reduced-motion preference removes the ornamental translation/opacity sequence but does not remove the blank publish interval. This strengthens the state-order diagnosis in `work-log/2026-09-25-codex-m7-panel-timer-flash-reproduction.md`; it does not prove WebView2 compositor behavior or a particular fix. Native-hidden Timer Find Timer, secondary-monitor/DPI/taskbar, independent borderless/exclusive fullscreen and post-fix transitions remain NOT RUN. Top-level M7 items 7–12 stay open; M8 stays blocked.

## Cleanup

The exact #507 test process was stopped. The original roaming `narro.db` was restored byte-for-byte to SHA-256 `8271B4CFE1190D2E5952D3C6A969ED71FE4650ACBA2B12F0A7061A310C0F1F4E`; no Narro process remained. Windows animations were restored to On and the test Settings window was closed. No source code or user data change was made.
