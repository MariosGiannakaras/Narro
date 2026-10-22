# M6 Focus Panel static source-to-native evidence comparison — 2026-10-22

**Reviewer:** ChatGPT (sole implementation/static image agent). This is a direct visual comparison of ACTUAL stored PNG pixels, not source-code-only inference, live modern-original audit, or continuous motion proof.

| Evidence | GitHub exact path | Git blob SHA |
|---|---|---|
| Original Blitzit Focus Panel full screenshot, retained v2.6.69 | `reference/original-blitzit-screenshots/current-v2.6.69-focus-panel-full.png` | `aa9e3b0a18e5bc53d0a7cd5ac597cc7901e8569e` |
| Original Blitzit Focus Panel notes-expanded screenshot | `reference/original-blitzit-screenshots/current-v2.6.69-focus-panel-notes-expanded.png` | `682b1aa62635c0873a0a3f198e9e054ee3428165` |
| Old accepted physical Narro Panel WebView raster, PR389 evidence 2026-10-21 | `work-log/evidence/pr389-native-20261021/final-panel-webview.png` | `aaf3445aa45858a392f2c2fa9e8824e080eab97f` |

**Direct image observation:** Both full views show an independent list selector, Today heading, right-side settings/home/floating-presentation controls, an estimated-time/Done progress strip, a focused live-card title/timer, subtask-progress/actions, separate tasks, add task, scheduled group, and Done group. Narro also physically shows POMO badge and overdue relative age (3d ago), with contrast and icon alignment visibly present. These checks support **STATIC ELEMENT PRESENCE / STACKING ACCEPTED for this frozen old Narro screenshot only**, not pixel-perfect parity.

**Crucial difference in states:** Blitzit full source shows 08:07:14 with green running-like progress, 1/4 Done, 3 Scheduled, 1 Done; Narro view shows a paused 05:00 Pomodoro on a larger amber card, 47/49 Done, 0 Scheduled, task grouping tied to fixture dataset. The sources have different screenshot crop/resolution, card state, timer mode and data. Visual color, card density, progress shape, panel height, exact CSS/layout and source text **INCONCLUSIVE**, NOT a proven current-build defect. Blitzit source notes-expanded view has a rich text editor and Close within a task; Narro single Panel screenshot has NO notes-expanded state, so this feature is **NOT REVIEWED** by this image pair, rather than missing.

**Motion boundary:** This full-panel still does not show the Panel→compact mixed-pixel transient, expanded→compact duplicate hierarchy, live keyboard/scroll/focus or actual audio. PR389 old motion capture has verified **4/8 physical FAIL**; candidate new layered-raster source head `ffaa512ef629b15739fa47664537b338bb981eec` remains a separate exact CI/physical acceptance. No new implementation change justified by mismatched static task state. No PA-01–09 physical status changed; PA user-unpaused but OPEN. This direct static inspection does not require a continuous source video.

**Next:** Retain scoped PASS only for presence/stacking in this old physical PNG, and require same-state matching current Windows screenshot for numeric/geometry parity if genuinely needed. Primary active source work remains CI of PR389, and Codex later physical native movement on its exact accepted executable.
