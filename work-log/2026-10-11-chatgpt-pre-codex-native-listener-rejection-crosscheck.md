# 2026-10-11 — Pre-Codex broader Tauri event-listener rejection-path crosscheck

## Why this check

The only source-proven PA-06 gap recorded in `docs/PRE_CODEX_RISK_AUDIT_2026-10-11.md` was a `.then(unlisten => ...)` Promise without `.catch` in the sound and flash timed-alert runtime consumers. The user requested proactive deeper code/call-path review before Codex physical Windows. Before generalizing this bug across the app or proposing broad subscription refactors, inspect the similar actual event-listener call sites on the **source baseline**.

## Independent inspection and bounded claims

At baseline `main` executable source `c6a39d2320ee291e9e3ff00fd792290360a8fc37` (later main Markdown updates preserve source), searched Tauri/renderer `.then((unlisten)` subscriptions via GitHub code index, then **fetched full actual source** and inspected the adjacent promise rejection branch in:
- `src/PomodoroResumePrompt.tsx`: `connectTimerSessionProjection` has `.catch` and intentionally no resume offer if native timer listener cannot connect.
- `src/usePreferenceSettingsProjection.ts`: preference listener `.catch` sets typed readable error; initial preference snapshot invocation also catches.
- `src/focus.tsx`: `state-changed` native event `.catch` sets error; initial state snapshot invocation also catches.
- `src/TimerSessionProjection.tsx`: timer-session listener `.catch` sets projection error.
- `src/PreferenceSettingsRuntime.tsx`: preference-changed native listener and initial multi-read both catch.
- `src/AppShell.tsx`: board-invalidation `.catch` prevents unhandled Promise and documents eventual local reconciliation.
- `src/FocusSurfaceCoordinator.tsx`: `FOCUS_PRESENTATION_CHANGED_EVENT` listener `.catch` sets transition error, with explicit authoritative refresh after successful registration.
- `src/FocusLiveActions.tsx`: keyboard shortcut listener `.catch` sets a routed Focus shortcut error.
- `src/WindowsShortcutSettingsPanel.tsx`: shortcut diagnostic subscription `.catch` sets settings error.
- `src/App.tsx`: both `state-changed` and `shortcut-diagnostic-changed` subscriptions `.catch` and surface errors.
- `src/FocusPanel.tsx`: both cross-window board and timer-session listener `.catch`; timer settled flag also handled on error.
- `src/ListBoard.tsx`: both cross-window board and timer subscription `.catch`, retaining mutation/projection error ownership.

These are **15 separately observed .then→catch subscription occurrences across 12 separate files**. No further missing `.catch` in this inspected subset was proven, so **NO_FIX** on those source paths. Some intentionally only record a user-visible error and do not automatically retry, an existing reliability policy; that is not by itself an observed present defect. Do not generalize this result to every async Promise or Win32/native message callback in the repository: this was a targeted rejection-chain review, not a complete proof of event delivery/ordering or physical Windows behavior.

The two exception paths `src/TimedAlertSoundRuntime.tsx` and `src/TimedAlertFlashRuntime.tsx` were source-proven missing the rejection branch and are handled narrowly by existing [PR #333](https://github.com/MariosGiannakaras/Narro/pull/333), with a separate scheduler-limited subscription owner and real-AST deterministic rejection/cleanup regression. **No broader event-bus rewrite justified.** No user-owned List Editor/picker, timer ledger, schema, native layout or visual CSS changed. Current #333 exact head at this checkpoint `ae206afea9eaccd732d6b20bb4b3651d625ad9b6`, [CI 38164122588](https://github.com/MariosGiannakaras/Narro/actions/runs/38164122588) validation+fast **SUCCESS**, Windows **NOT YET PASS**.

## Physical and Q12 limits

Original 11/11 implementation and previous production-Q12 candidate remain immutable PASS for their exact previous source. New PR #333 keeps expanded current accepted coding count **11/12** until its exact-head Windows CI and guarded merge. Any merged replacement requires fresh resulting-main CI/actual artifact ZIP+exe+installer hashes. Native physical Windows checks and independent Blitzit source comparison remain USER-PAUSED/NOT RUN; M10 blocked, optional M11 dormant. Do not infer source parity or OS event delivery from Promise rejection-path code review.
