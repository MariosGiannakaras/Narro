# 2026-10-21 — R4 isolated 300-second alert: real native-frame first-pass

Original source: `work-log/evidence/safe-capture-supplement-20261021/clean-alert/R4-isolated-alert/native-original.mkv` (81.984s, 4901 decoded frames, native Desktop Duplication 2560x1080 nominal60fps). Full original/video is authoritative. This review inspected only selected mechanically sampled original desktop PNGs and the authoritative original native state saved by Codex; **not all 4901 video frames**.

## Grounded facts

- User-facing Preferences in owned fresh profile: `timed_alerts_enabled=true`, `task_alert_interval_seconds=300`, `animated_timer_flash=true`, `pomodoro_enabled=false`, verified original `owned-native-state-raw.json` at R4 evidence root. All setup through actual UI; original profiles fully restored. Recording starts `2026-10-21T12:18:54.127272Z`, stops `12:20:15.679059Z`, no pointer/key/presentation changes inside 80-second observation.
- Database effect for run `133c7c5d-b808-4eae-9267-aba9e1acfde4` and owned task: one `timed_alert_effects` boundary `300`, `decided_at=claimed_at=2026-10-21T12:19:44.947Z`; `timed_alert_runs.next_boundary_seconds=600`, `last_observed_work_seconds=371`. **Once-only persisted decision/claim is positively established.** This alone does not prove actual OS sound playback or composited animation.
- Native screenshot `frame-032.png` near timer `04:59`: timer numerals in baseline dark neutral color. `frame-035.png`, also showing `04:59`: timer numerals visibly shift to the configured teal-accent tint. `frame-036.png` returns towards baseline; later `frame-040.png` at `05:00` and `frame-042.png` at `05:01` show baseline appearance. These are unchanged native desktop PNGs, not WebView-only screenshots. Controlled action ledger shows **no user hover/input** while captured. This positively supports a **brief visible numeral-color transition** near the claimed event, but does not establish every moment of the pulse or a particular compositor cadence. **Scoped observation, not full 560ms flash acceptance.**
- Production `src/TimedAlertFlashRuntime.tsx` adds `timed-alert-flash--active` on matching task ID for a bounded `FLASH_DURATION_MS=560`. `src/timedAlertFlash.css` animates numerals via accent color and the entire live card via violet/red wash, with reduced-motion suppression. Existing `scripts/test-timed-alert-flash-runtime.mjs` checks source contracts, but no browser-mounted execution/whole-card raster comparison was performed in this review.

## Disposition and next evidence

- **R4 native scheduled-effect once-only claim: PASS (narrow).**
- **R4 visual timer numeral flash: OBSERVED (narrow sampled-native-frame fact).**
- **R4 full-card 560ms wash, continuous animation performance/contrast, audible sound, NVDA/system-notification side effects, OS-input behaviour: OPEN / NOT VERIFIED.**
- Do not patch a presumed missing alert based only on neutral-color frames; the adjacent tinted frame demonstrates a transient exists. If full physical C45 acceptance is required, review the original PTS-indexed 60fps source around `12:19:44.947Z`, not only the 5fps orientation samples. Do not initiate redundant capture/restart or alter the approved editor/icon catalog.

UI PR391 remains independent and cannot claim this as its own new physical acceptance; native compositor PR389 4/8 FAIL remains unaffected. Mandatory accepted milestones 4/10 unchanged.
