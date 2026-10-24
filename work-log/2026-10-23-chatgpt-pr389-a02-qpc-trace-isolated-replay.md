# 2026-10-23 — PR389 A02 QPC trace and real-click isolated replay (immutable source checkpoint)

**Owner:** ChatGPT source/test implementation. **Active branch:** `fix/m7-pixel-preserving-composition` / [PR389](https://github.com/MariosGiannakaras/Narro/pull/389). **Exact observed head:** `88baa42b02e79999d8b93f592ace9829c9ee1a88` after source and test changes. **Source changes committed** on PR389 (not merged). **CI validation/fast/Windows-candidate: NOT RUN for this exact source SHA** (the GitHub connector pushes have not surfaced a new Actions run). **Executable artifact: NOT BUILT for this SHA. Physical Windows acceptance: NOT RUN.** Prior ccb70a92 screenshot A02 ghost at ~12.61s still FAIL; A01/A03 now PENDING as regraded. Hold `PHYSICAL_BEFORE_MERGE` unchanged. Never transpose earlier CI39871074255 PASS to this head.

## User request / why

User asked whether previous Narro logging existed and whether A02 ghosting could be explained with frame-level timing or a minimal isolated reproduction. Source inspection confirmed existing `src-tauri/src/validation_log.rs` (`narro-m7-validation.exe` `Narro-M7-Logs/events.jsonl`) for C5 movement/placement/restart/DPI, and existing packaged Focus runtime visual capture with Win32 PNG sequence/geometry sampler. The old harness used direct diagnostic `applyFocusSurfacePresentation("timerExpanded")`, so it **did not traverse the protected user-click Compact↔Expanded route that failed A02**. Existing logs are not per-frame DWM/raster diagnostics.

## Implemented source and tests (all on PR389)

- `src-tauri/src/focus_transition_trace.rs`: opt-in `NARRO_FOCUS_CAPTURE_DIR` absolute disposable directory, bounded 512-event in-memory native batch, flushed on scope exit (never per-frame file I/O). Records stage, raster token, UTC, Windows QPC ticks/frequency, Rust elapsed/progress, requested owner position; only finite native and enumerated renderer technical stages, no user content.
- `src-tauri/src/lib.rs`: traces each protected native raster/owner step and explicitly tags outgoing vs incoming raster. Adds a strictly validated Focus renderer phase marker command. Existing Rust-owned timer/session authority, SQLite and state transitions unchanged.
- `src/focusSurfaceModeApi.ts`, `src/FocusSurfaceCoordinator.tsx`: best-effort React milestone instrumentation at prep/animate/commit/release/rollback, strictly disabled outside `runtimeVisual=1` browser entry so ordinary Narro sends no trace IPC. Error handling and native rollback path remain intact.
- `src/focusRuntimeVisualDriver.ts`: uses real bounded-wait `data-floating-subtask-control="expand"` click for both expand/collapse and waits for native resize pending to settle.
- `scripts/capture-focus-window-sequence.ps1`: wraps screenshot `CopyFromScreen` between QPC timestamps; `scripts/capture-focus-runtime.mjs`: captures all 4 real transition routes including A02, then auto-generates individual QPC correlation JSONs.
- `scripts/analyze-focus-compositor-trace.mjs` and `scripts/test-focus-compositor-trace.mjs`: offline technical correlation between native raster/owner/renderer events and the before/after screen-sampling QPC bracket, with fail-closed invalid clocks and explicit DWM scanout uncertainty.
- Existing `scripts/test-focus-runtime-visual-harness.mjs` and `scripts/test-protected-timer-resize.mjs` updated to **preserve/strengthen** real protected path source contracts; `package.json` standard preflight now runs the new analyzer regression. No weakening screenshot thresholds.
- Dedicated exact [reproduction/diagnosis guide](https://github.com/MariosGiannakaras/Narro/blob/fix/m7-pixel-preserving-composition/docs/M7_A02_QPC_TRACE.md) provides CLI, isolated profile rules, fields, data minimization, candidate requirements and decision tree.

**Important limitation:** QueryPerformanceCounter/Stopwatch.GetTimestamp provide one Windows monotonic clock for app and screenshot sampler, but native API return times do NOT prove the displayed DWM scanout frame or a fixed ghosting root. Actual 60 fps original desktop evidence is still required. Offline traces plus screen samples can locate suspect native stage boundaries; if they cannot distinguish the compositor queue, an explicitly bounded ETW/present investigation may follow.

## What did NOT happen

No actual Windows capture, installer execution, physical AppData/OS modification, CI PASS or guarded merge. No change to Motion v4 product styling, source-parity claims, Main-window count, Spectrum Core picker/image/218 icons, M1–M10 accepted denominator or dormant M11/M12. Independent [PR418](https://github.com/MariosGiannakaras/Narro/pull/418) retains the approved 500 ms Motion v4 code/prototype without mixing it into this A02 root-cause baseline.

## One exact next action

Run the repository's mandatory validation/fast/Windows candidate **on PR389 head `88baa42b02e79999d8b93f592ace9829c9ee1a88`**, diagnose and correct only evidenced build/test FAIL. Once 3/3 exact-head PASS, verify new candidate EXE/hash/manifest, then run real-control Focus-only A02 normal/reduced on an isolated Windows test profile with QPC JSONL + PNG/video. Map the first duplicate-title frame to raster source, owner position, renderer commit and release; fix proven cause on **same PR389**, pass fresh native eight-case physical acceptance before any guarded merge. Revalidate latest live GitHub head/status rather than assuming this historical checkpoint remains current.
