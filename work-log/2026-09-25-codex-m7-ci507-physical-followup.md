# 2026-09-25 — M7 physical follow-up on CI #507

## Source and test environment

- Agent: Codex. Source: PR #143 exact head `9b80ee19c6678fca998b58740410f94c821cff26`, guarded main merge `fce15f8ed7a70cd83e05f3b9448d627413b719e7`, identical tree `608aec06f64a3184568bc0d171adc1b085220fa9`. Windows CI #507 / run `36136277164` PASS; runtime artifact `10865303816`. Tested `narro.exe` SHA-256 `1285EC257AF2D45682D96702F815B86E6CC971127264A09EB6D609CAFB56A17A`.
- Windows 10 build 19045, one 2560×1080 display at 100% scale, bottom auto-hide taskbar. The existing paused session `3e77a684-e7d6-4968-a189-cf6d41fc42c3` was used without authoritative session transitions.
- The built-in `sky` screenshot path still failed on this OS. A machine-local Win32-bounds/Pillow visible-desktop capture fallback recorded the UI. This capture can be occluded, so only unobstructed frames support visual claims. Diagnostic frames are machine-local under the Codex task `work/panel-to-timer-frames/`, with `panel-to-timer-contact.png` as a contact sheet.

## Physical results

| Gate | Result on #507 | Evidence and limit |
| --- | --- | --- |
| 7: settled resize/session | Partial PASS | One additional expand/collapse cycle showed the expanded six-button action strip and native 356×308 outer size, then no action strip and 356×118 collapsed size. The same paused session remained. Earlier #503 three-cycle evidence remains separate. |
| 7: continuous Panel→Timer | **FAIL in one captured transition; reproduce before patching** | The 20 fps capture showed outgoing Panel fading in frames 013–014, blank pale content in frame 015, a pale old-footprint rectangle in frame 016, an empty Timer-sized WebView surface with scrollbar in frames 017–018, and rendered Timer in frame 019. This does not meet the runtime guide's no-staging-flash criterion. The capture cannot alone establish whether WebView2, native resize, or renderer publication is the root cause. Timer→Panel continuous capture was not obtained. |
| 8: shortcut/retry | Partial PASS | Ctrl+Shift+T switched Panel→Timer; two rapid presses settled with one Focus window and the original session. A separate process successfully owned both T/P chords; Narro showed separate conflict messages. Retry while occupied retained the conflict. After releasing ownership, T and P retries each cleared their own message. Both chords then worked. |
| 9: Find Timer | Partial PASS | Ctrl+Shift+P on a visible Timer produced a finite accent-border pulse and returned to stable Timer; in Panel mode the Panel remained unchanged. No precise pulse duration was claimed. |

## Not run and continuation

- Windows OS-level reduced-motion preference, including transition and Find Timer behavior: **NOT RUN**.
- Native-hidden Timer Find Timer on #507: **NOT RUN**. A later attempt to inspect it was interrupted by an unrelated active call overlay obscuring the Timer; no hidden-state result was inferred.
- Secondary monitor, topology change, no-saved-placement, DPI/resolution, alternate taskbar/work area, independent borderless and exclusive fullscreen: **NOT RUN** on this one-display machine.
- Repeat the Panel→Timer continuous capture before changing source. If the flash reproduces, analyze the outgoing opacity/visibility boundary, native hide/resize/show, target DOM publication, and presented-frame ordering together. Keep item 7 open. Run OS reduced motion and the remaining available single-monitor checks when an unobstructed desktop is available; arrange different display hardware/configuration for the unavailable gates. M8 remains blocked.

## Cleanup and tracking

Both #507 test processes were stopped after their sessions; the temporary hotkey-ownership helper exited. The user's original roaming `narro.db` was restored byte-for-byte after each test session, final SHA-256 `8271B4CFE1190D2E5952D3C6A969ED71FE4650ACBA2B12F0A7061A310C0F1F4E`. No Narro process remained. No source/config or user data change is part of this log. `TODO.md`, `STATUS.md`, and `HANDOFF.md` record the scoped physical evidence while top-level M7 items 7–12 stay open.
