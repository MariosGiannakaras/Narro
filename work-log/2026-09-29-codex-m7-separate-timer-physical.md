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

The next candidate preserves the last valid board while refreshing the same Panel target or live Timer task. A changed target still clears stale content. Presentation readiness still waits for the new authoritative snapshot; only the visible placeholder is removed. Frontend preflight passed locally.

## Second exact-build transition capture

Commit `a6a945927550e464ac9c2edd38292187bb83d3a1` passed Windows CI run `36495957450` attempt 2; the downloaded `narro.exe` SHA-256 was `E35462D45AEDF284DD492B8076370C405341DB19F9531537D67CD5502DBE0D68`. Attempt 1 failed only in visual-fixture readiness and passed on rerun without source changes. The first new recording finished before the switch actions and is not evidence. The accepted batch used one continuous 2560×1080, animations-On capture, `gate7-final-settled.mp4` (3296 frames, 78.48 fps; SHA-256 `F5C2210FCB211BD0E5A280BC72306D9B1A6FB5905D51AB76C3D30F6FBE766239`), with three Panel→Timer→Panel cycles and an explicit wait for the source window to disappear on each leg. The paused `fas` display remained `07:40` throughout.

The boundary sheet `gate7-final-settled-boundaries.png` shows the prior loading placeholders are gone. It also shows the compact Timer image persisting over the Panel's top controls for several frames while the Panel card is visible below. This is a distinct Windows show/hide composition artifact, not a recurrence of the old full-white resize frame. **Gate 7 remains FAIL**; success from the loading-copy correction is not an overall acceptance result. A longer static Panel observation rendered correctly after the transient.

The same host also provided a narrow resource comparison, without extrapolating to other PCs: the separate-WebView candidate used about 512 MiB aggregate working set / 399 MiB private bytes versus about 417 MiB / 338 MiB for the old single-WebView exact build in paused floating-only mode (one versus three samples respectively). This roughly +95 MiB working-set cost is material. It is recorded as an architecture tradeoff, not a gate pass or a reason to repeat unrelated performance testing now.

The next single correction, commit `4e4960b`, disables DWM show/hide transitions for both Focus windows at startup and activates each prepared destination before reveal. It changes no timer/session behavior.

## DWM correction and decision to stop the loop

Exact source `4e4960b221f4aad310080ab0b07379e059b52fdc` passed Windows CI run `36530577060` (preflight, visual fixtures, Rust/Tauri release and runtime artifact). Its downloaded `narro.exe` SHA-256 was `EC5CD1C5B4A8F16055C66003A5D160BAD377C860252EB83597A1EE0C32DD4243`.

One animations-On continuous desktop recording `gate7-dwm-on.mp4` (2560×1080, 2675 frames, 77.41 fps, SHA-256 `FCB17DDD0F759F079CB68BB45432EFFE91A34E08827626256F2EACE073057F80`) contains three settled Panel→Timer→Panel cycles. A script detected the six card-presence boundaries at 22.826, 23.730, 24.686, 25.578, 26.456 and 27.386 seconds, and `gate7-dwm-on-boundaries.png` displays frames before, at and after every boundary in one sheet. The inspected boundary frames show no full-white host or loading placeholder. On Timer→Panel the Panel card can still appear underneath the compact Timer for approximately 5–8 frames (about 0.07–0.10 s) before the Panel header takes over. This is substantially shorter than the prior overlapping image, but still an observable transient. **Strict Gate 7 remains OPEN/FAIL.** No animations-Off run or resize run was repeated on this exact source because the user requested a transition-only, time-bounded check and the On transition already shows the residual defect. The earlier `8b94946` On/Off resize evidence remains valid only for that exact build.

The final Panel accessibility state still showed paused `fas`, `07:40`, and `Time Taken 0:13:41`. The test Narro process was stopped, its test database was retained under ignored artifacts, and the original live SQLite profile was restored with SHA-256 `D18A33C0BF5F88DACC74A513105C5E7A8FE7D3EE5E3A02F12E6EBDCBC5EC33C0`. Both Windows animation getters returned On; one 100% display was connected. Gate 12's secondary 125% branch remains open.

Stop successive tweaks to this composition. PR #191 remains unmerged. The narrower separate-WebView architecture removed the severe white resize failure but has a measurable memory cost and this residual mode-overlap defect. If Gate 7 must be fully closed, the next comparison should be a scoped native layered Timer/window composition against the same continuous Panel↔Timer acceptance capture; the evidence does not justify a framework-wide migration. Per the user's time/quota instruction, no further physical cycles or unrelated checks are started here.
