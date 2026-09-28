# M7 separate Timer WebView experiment — first physical batch, 2026-09-29

## Exact candidate and environment

- PR #191 commit `8b949463ea7bc840430e060dd560c74d5c8c9f94` passed Windows CI run `36493571169`, including frontend preflight, Rust check/Clippy/tests, visual fixtures and Tauri release. The downloaded `narro.exe` SHA-256 was `021157B33630326AFF34329ED539C4E9DC0C6224CFBEC757B109276D659DA056`.
- Windows exposed one 2560×1080 display at 100%. Both `SPI_GETANIMATION` and `SPI_GETCLIENTAREAANIMATION` were verified On before the On run, set Off and verified for the Off run, then restored On and verified. The second-display/125% branch of Gate 12 remains unavailable.
- The original SQLite profile was backed up in ignored `artifacts/m7-separate-timer-runtime/profile-before.db`. Its live checkpoint and the checkpoint after the batch match: session `3e77a684-e7d6-4968-a189-cf6d41fc42c3`, task `d182ac7b-2215-439b-8e31-3d08cd1ee65d`, paused count-up work `460395` ms (display `07:40`). No transition changed the session identity or elapsed value.

## Continuous physical evidence

The first On recording started before setup of the available UI controls and ended before all Panel/Timer cycles; it is not used for acceptance. The valid replacement and Off recording each include three compact↔expanded cycles and three Timer↔Panel cycles. The batches were performed first; frame analysis followed afterward.

| Capture | Frames / actual fps | Raw SHA-256 | Observation |
| --- | --- | --- | --- |
| ignored `artifacts/m7-separate-timer-runtime/gate7-on-valid.mp4` | 2341 / 78.06 | `03A401872BB37C3A1E549ACD9BF5348CD1AFAD8ADE1F615A2A314616963BB3E5` | Six region-size boundaries at 18.063–21.073 s; three Panel intervals at about 21.765–22.277, 22.700–23.225 and 23.635–24.173 s. No full-white top-region candidate. |
| ignored `artifacts/m7-separate-timer-runtime/gate7-off.mp4` | 3497 / 77.71 | `9CF06A33F70F38B5C26E5AFE283B557703163F166E559779C875AAAF25358921` | Six region-size boundaries at 17.925–21.168 s; three Panel intervals at about 29.082–29.584, 30.189–30.703 and 31.257–31.810 s. No full-white top-region candidate. |

`scan_frames.py` scanned every frame for a nearly all-white, inkless top window region and found zero candidates in both valid captures. `*-events.png` shows adjacent frames at all six compact/expanded boundaries. The region clips and reveals painted controls without the old full-white expanded frame or trailing old rectangle. `*-boundaries.png` shows adjacent frames at all six Panel/Timer boundaries in each capture.

The On boundary sheet exposed a different, brief visual failure: `Loading Focus Panel…` is visible around frames 1698–1699 during Timer→Panel, and `Loading focus task…` replaces the Timer title around frames 1813 and 1885 on Panel→Timer. The source WebViews are persistent, but a refresh clears their last board snapshot while the same list/task loads again. This is a transient content regression, so **Gate 7 remains FAIL**; zero white-frame candidates alone is not acceptance. The Off boundary sheet does not show the loading copy at its sampled boundaries. No inference is made that the compositor cause is identical to earlier white-frame failures.

## Correction and next comparison

The next candidate preserves the last valid board while refreshing the same Panel target or live Timer task. A changed target still clears stale content. Presentation readiness still waits for the new authoritative snapshot; only the visible placeholder is removed. Frontend preflight passed locally. Exact-head CI, repeat continuous physical On/Off capture, and floating-only idle CPU/memory comparison remain pending. Do not adopt the separate-WebView architecture or merge PR #191 until those checks pass. Gate 12 remains separately open.
