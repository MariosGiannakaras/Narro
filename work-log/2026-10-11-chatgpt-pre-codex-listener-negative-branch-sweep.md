# 2026-10-11 — Focused Tauri listener rejection-path survey after PA-06 merge

## Authority / current candidate

The latest source merge is `ef22a7e434bea6cc4849282aa46c4786d9d90663` (#333). The exact source PR #333 passed validation/fast/Windows 3/3 at [38164122588](https://github.com/MariosGiannakaras/Narro/actions/runs/38164122588), 5/5 changed file blob identity on resulting main. The independent full-main [run 38173126053](https://github.com/MariosGiannakaras/Narro/actions/runs/38173126053) has not completed the Windows job in the last observed snapshot; new main ZIP/exe/NSIS/MSI SHA256 NOT RUN/VERIFIED. Current Markdown commits after merge do not establish a new executable candidate.

## Focused extension of PA-06 static review (negative promise branches)

As an independent bounded follow-up to the original PA-06 source-proven missing native listener registration failure branch, inspected **current fetched main file contents** of:
- `src/App.tsx` — both `state-changed` and shortcut diagnostic listener setup have `.catch` with UI error ownership.
- `src/FocusPanel.tsx` — `listenForBoardInvalidation` and `connectLiveTimerSessionProjection` Promise setup both catch rejection; board refresh asynchronous rejection and revision fences explicit.
- `src/ListBoard.tsx` — board invalidation listener and timer projection Promise setup catch rejection; separate requested snapshot errors handled.
- `src/TimerSessionProjection.tsx` — timer session connect listener catch and error state.
- `src/FocusSurfaceCoordinator.tsx` — generic helper wraps native `await listen<T>` in try/catch; presentation event listener has catch.
- `src/AppShell.tsx` — board invalidation listener catch intentionally falls back to next navigation/mutation; source comment documents behavior.
- `src/boardInvalidation.ts` — thin exported function returns raw `listen` Promise to caller; the reviewed caller sites handle it.
- `src/TimedAlertSoundRuntime.tsx`, `src/TimedAlertFlashRuntime.tsx`, `src/timedAlertListenerRecovery.ts` — current PA-06 source fix uses a finite two-delay 250/750 ms attempt owner, Promise catch, last failure warning, idempotent disposal, late success unlisten.
- `src/timedAlertApi.ts` — typed native event API returns `listen` Promise without scheduling, intentional pure boundary; wrapper is the recovery owner.

**Disposition NO_FIX** for this inspected set: no second source-proven *unhandled Promise rejection in native listener registration* was found. This is a **bounded source-level spot check**, not a complete semantic audit of all Rust/Tauri/WebView2 events or proof that native listeners reliably register under Windows. No new code/config/test changes, no new acceptance/counter increments. The approved List Editor Spectrum Core remains untouched.

## Runtime-only gate

The PA-06 negative-path branch has deterministic helper VM regression at source and exact PR 3/3 CI, but real OS event availability, Web Audio, toast delivery, monitor/DPI HWND transition and source Blitzit parity remain USER-PAUSED PHYSICAL/SOURCE_PARITY_OPEN. Current physical gate matrix: `docs/CURRENT_WINDOWS_RESIDUAL_PHYSICAL_SESSION.md` + `docs/PRE_CODEX_RISK_AUDIT_2026-10-11.md`. Do not turn this textual spot check or a passing static test into physical SUCCESS.

## Next agent action

Inspect [main CI 38173126053](https://github.com/MariosGiannakaras/Narro/actions/runs/38173126053) after work or status change; 3/3 Windows result and newly downloaded actual ZIP/exe/NSIS/MSI SHA256 are still required for **new** #333 replacement physical handoff. If green, update exact new production build pointers, retain physical user-paused gates, and complete handoff; if red repair the first actual causal error only. Avoid additional speculative source changes after this negative-path sweep.
