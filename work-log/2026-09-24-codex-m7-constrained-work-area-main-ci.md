# 2026-09-24 — M7 constrained work-area recovery and validated merge

Agent: Codex. Slice: preserve usable expanded Floating Timer controls when the requested DPI-scaled outer size exceeds a monitor work area.

PR #132 changed `src-tauri/src/floating_placement.rs`, `src/floatingTimerFoundation.css`, and the scheduling visual capture harness. During hidden resize, native placement chooses the work area from the previous outer rectangle, fits the actual resized outer size to both work-area axes if needed, rereads the OS result, and rejects an unfitted result through the existing resize rollback. Deterministic Rust geometry tests cover a short secondary monitor and a work area smaller in both dimensions. At constrained CSS viewport sizes, the six actions wrap into three columns and expanded content scrolls, including subtask controls.

The first exact-head PR CI #496 / run `35978346552` passed Repository Preflight and the Floating Timer visual captures, then failed because the unrelated asynchronous scheduling fixture's dark-theme DOM was captured before its ready marker. The same premature capture occurred locally. The visual harness now checks that marker and recaptures once before accepting the screenshot/DOM pair. This correction was tested locally: the first scheduling-dark capture was premature, the second was ready, and `validate-task-schedule-captures.mjs` passed.

Validation:

- Local `npm run preflight:frontend`, `npm run check:rust:fmt`, `git diff --check`, Floating Timer light/dark Edge capture validator, and the scheduling capture validator: **PASS**.
- Local Edge DevTools emulated 240×200 CSS viewport: **PASS**; the action strip measured three 32px columns and 77px height, content scrolled 129px, and the last subtask moved inside the visible bottom edge.
- Local `npm run check:rust`: **NOT RUN to completion** because this desktop shell has no MSVC `link.exe`. Windows CI is the Rust compile/test authority.
- Final PR head `2e4cf9e7edb5bf0021771d55d0df2640503dddf7`: Windows CI #497 / run `35979772197` / job `107564048044`: **PASS**, including preflight, visual fixtures, Tauri Release, and artifacts. PR runtime artifact `10800282413`, digest `sha256:ebc9581f0945a91ce47adaa50500095ecba59a963e106ccc02526845c24efc8a`; visual artifact `10800331064`, digest `sha256:5194fe7f468492575586b2432a1a15da9188f906388a894216d99a31687d7f35`.
- Expected-head guarded squash merge: `59bdc2dc4d4c6ed7b871bbce0c224e532b51e075`. Resulting-main Windows CI #498 / run `35981558967` / job `107574406254`: **PASS** in every step. Runtime artifact `10801570232`, digest `sha256:e096decb5c9fc3f8bd179fadccfd42b1a075c4722c1b10b9d0329ec6dd0d4f77`; visual artifact `10800469073`, digest `sha256:0f7631b63b97d0012130c2a8e214ca38918c434d89c266eadcfc20eceeebb149`.
- Physical compositor, bottom/taskbar, secondary-monitor, high-DPI, topmost, idle-motion, and final-UI resource checks: **NOT RUN**. No top-level M7 gate is closed by CI alone.

Tracking: `TODO.md`, `STATUS.md`, `HANDOFF.md`, and `docs/M7_FLOATING_RUNTIME_VALIDATION.md` now identify CI #498 and runtime artifact `10801570232` as the consolidated M7 physical candidate. The next action is one physical Windows session covering open items 7–14; record PASS/FAIL/NOT RUN and measurements in a new immutable work log. Do not advance to M8 before M7 acceptance.
