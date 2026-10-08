# A14 — Break and Pomodoro source-state implementation comparison

Date: 2026-10-08 (Europe/Athens)

## Provenance and ownership

GitHub authoritative main baseline `ee3bfa28b6681340ae16bb65d8799353220a89b5`, no open PRs/active CI, latest run CI1046 complete. Independent user-directed *analysis/evidence-only* track; Codex retains source/physical validation and existing M7 C4/35 unresolved native gates. Canonical Pass-3 records: VE-016 01:32–01:44 and VE-018 02:24–02:40. No reinspection of raw MP4, new current Blitzit capture, build, test or physical Windows action. These two videos are older source product versions; v2.6.69 screenshots do not show the same running/completed Break state. This is **direct historical evidence with current-version evidence limit**, not unqualified current target proof.

## New omissions relative to direct historical sources

- **B35 — Break occupies top live card.** VE-016 shows automatic Pomodoro work→Break transition in ~0.1s: live card becomes `Break` with its own countdown, previously live task returns to queue. VE-018 independently demonstrates 10min manual Break with Break as top live card. In Narro `src/FocusPanel.tsx`, `liveTaskId = timer.runtime.timer.task_id`, liveTask comes from `board.today.tasks`; heading always renders `<FocusLiveTitle title={liveTask.title}>` even when timer state is `break`, with Break only in `focusTimerStateLabel`. Missing source card **presentation/queue grammar**; authoritative timer/task identity must not be re-modeled from pixels. M6 SOURCE_PARITY_OPEN / CURRENT_VERSION_EVIDENCE_LIMIT.
- **B36 — completed Break history in Done.** VE-016 shows completed Break with its duration (5min) in Done; VE-018 shows struck Break/gamepad row (0min Taken) inside Done while completed-task fraction stays 0/7, explicitly distinguishing done-history rows from done tasks. Current `src/FocusPanel.tsx`: `doneTasks=board.done.tasks`, maps `FocusTaskRow` for tasks only; no session-based Break row projection. Source-visible history missing; must preserve break session source of truth and prevent counting Breaks as completed tasks. M6 SOURCE_PARITY_OPEN / CURRENT_VERSION_EVIDENCE_LIMIT.
- **B37 — Pomodoro POMO badge.** VE-016 directly shows a small green `POMO` badge on the active work timer and during its Break. Narro timer `focusTimerPresentation` computes `mode`; `FocusPanel` displays live clock and text state `Pomodoro work/break` but no visual POMO chip; no POMO markup in `FocusPanel.tsx`/`focusPanel.css`. M6 SOURCE_CONTROL_PARITY_OPEN / CURRENT_VERSION_EVIDENCE_LIMIT.
- **B38 — manual Break temporarily adds to headline EST.** VE-018 shows `Est:1hr54→2hr4` upon 10min Break, then back to 1hr54 after, with completion fraction remaining `0/7`. Narro `FocusPanel` always displays `formatEstimate(board.today.aggregateEstSeconds)`, independent of break duration. Source header behavior missing from current presentation, distinct from manipulating actual persisted task EST. M6 SOURCE_BEHAVIOR_PARITY_OPEN / CURRENT_VERSION_EVIDENCE_LIMIT.

## Reconciliation limits and safe next action

- SS-C19 current v2.6.69 shows ordinary Focus live/Done but does **not** demonstrate a Break in progress or completed Break, hence cannot confirm or refute historical Break presentation. Do not demand blind faithful recreation of an outdated path where newer evidence is absent; use adjacent current patterns or exact current source if safely available. No optional M11/live source audit activated.
- Break-related session persistence, manual/Pomodoro runtime, Done work-task counter, window transition and external native C4/35 are separate already-accepted or still-open gates. Never invalidate historical M3 domain PASS from a presentational comparison, fake a task row for a session, or conflate Break Taken with work Taken.
- No assertions regarding break completion auto-resume timing from staged tutorial cuts; source already warns of time jumps.
- Added four uniquely routed B35–B38 nested noncounting M6 TODO entries and crosswalk/UI spec/46+19 route index. Existing counters unchanged. **App/config/test source, Rust/TS build/test, Actions, physical Windows, raw-video replay, direct current-version parity NOT RUN.**

Next audit: unreviewed sources or implementation interactions, with claim-level current/history precedence; if further direct source evidence cannot establish current-version behavior, keep source-version limit rather than claiming parity PASS.
