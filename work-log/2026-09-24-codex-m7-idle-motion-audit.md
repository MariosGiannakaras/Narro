# 2026-09-24 — Milestone 7 idle motion audit

Agent: Codex. Scope: M7 item 13 static verification on source main `778a1bc4e1276128d6ae859e1a15b6f9c413e89b` (PR #128 merge), before the item-12 work-area candidate.

I searched `src/` for CSS animation declarations/keyframes, `infinite`, `requestAnimationFrame`, and scheduling loops, then traced the selectors and component mounts used by `FloatingTimerFoundation` and `FocusSurfaceTransition`.

- `floatingTimerFoundation.css` has one 720 ms, one-iteration attention pulse (180 ms with reduced motion). The pulse element is mounted only for a Find Timer request and removed on animation end.
- Floating expand/collapse and Panel/Timer opacity/transform changes are bounded transitions initiated by explicit user actions. The presented-frame helper resolves after two frames; it is not a frame loop.
- `FloatingTimerFoundation` does not start a decorative interval or animation while idle. `connectLiveTimerSessionProjection` schedules one-second state samples only in running, break, or overtime-running timer states; idle/paused states do not schedule them. This is functional timer display sampling, not decorative motion.
- The only `infinite` CSS animation found in `src/` is an overflowing-title scroll in `FocusLiveTitle`, which is mounted by the Focus Panel, controlled by its scrolling-title preference, and is absent from the Floating Timer.

Static audit: **PASS** for no continuous Floating Timer decorative animation in idle source. Physical idle observation and CPU/memory measurements: **NOT RUN**. The top-level item remains open pending the consolidated physical runtime check; item 14 separately requires the final-UI resource measurements. No source files changed in this audit.

Tracking: add an evidence-backed static subcheck under M7 item 13, preserve the physical gate, and include idle observation in `docs/M7_FLOATING_RUNTIME_VALIDATION.md`. Continuation: validate PR #130 and its resulting main before using one final build for the physical session.
