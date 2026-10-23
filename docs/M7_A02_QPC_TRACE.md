# A02 ghosting diagnosis — isolated real-path replay with correlated QPC

**Owner:** PR389 / native M7 compositor. **Status:** instrumentation/code integrated in DRAFT PR; exact-head CI and native physical acceptance must be confirmed separately. **Not evidence of an A02 fix.**

## Existing validation logging vs this trace

- `src-tauri/src/validation_log.rs` was already present. It writes `Narro-M7-Logs/session-*/events.jsonl` only when the executable name is `narro-m7-validation.exe`. It tracks presentation/placement, DPI/topology, restarts and persistence; it **does not** give a raster frame-by-frame timeline. Do not modify this established cross-restart C5 evaluator.
- `scripts/capture-focus-runtime.mjs` + `src/focusRuntimeVisualDriver.ts` were already a Focus-specific packaged-runtime harness, with `NARRO_FOCUS_CAPTURE_DIR` and `scripts/capture-focus-window-sequence.ps1`. Before this correction the Timer Expanded leg used the **direct diagnostic native setter**, bypassing the actual protected user-click path. That cannot diagnose A02.
- This PR adds `src-tauri/src/focus_transition_trace.rs` (buffered native frame stage + limited React IPC phase markers), accurate QPC screen sample brackets, and `scripts/analyze-focus-compositor-trace.mjs` for offline correlation.

## Run safely on actual Windows

1. Use an **isolated disposable Windows profile / test DB / candidate**, never a user's personal running Narro, Roaming DB or Local caches. Do not delete/replace any personal data. Use the existing artifact-provenance and source-SHA process from `HANDOFF.md`; do not run during another owned capture. `capture-focus-runtime.mjs` creates a synthetic local task as part of the test, so it must never be run against a personal profile.
2. Validate the exact current PR389 head with the mandatory validation + fast + Windows-candidate gates first. A previous green SHA does not validate this instrumentation. Confirm the candidate manifest, hashes and exact EXE match that SHA.
3. With the candidate installed/extracted in the isolated test environment, execute the existing targeted packaged-runtime harness (not Main navigation). Syntax:
   ```sh
   node scripts/capture-focus-runtime.mjs <absolute-path-to-verified-exe> <absolute-disposable-output-directory>
   ```
   The output directory is **removed and recreated** by this existing harness; it must be a designated disposable path, not a user folder or the executable directory.
4. The driver now **clicks the real** `[data-floating-subtask-control="expand"]` in Compact, waits for the protected native transaction to settle, and clicks the same user control to collapse. The harness captures Panel→Compact, **Compact→Expanded (A02)**, **Expanded→Compact** and Compact→Panel. Actual window geometry/screenshots and React checkpoints are collected; the native overlay and raster path is not replaced by a browser approximation.
5. The trace file is `<output>/focus-transition-trace.jsonl`. Correlate a single A02 capture:
   ```sh
   node scripts/analyze-focus-compositor-trace.mjs <output>/focus-transition-trace.jsonl <output>/compact-to-expanded-runtime/frames.json <output>/compact-to-expanded-qpc.json
   ```
   The analyzer emits each screenshot sample's QPC capture bracket, the most recent previous native/renderer stage, all stages during the capture, the next stage and the nearest stage. The `captureQpcBefore`/`captureQpcAfter` values bracket the screen's `CopyFromScreen` operation on the same physical Windows machine; compare the PNG manually at suspected ghost frames. Check the native `rasterToken` against matching renderer phases.
6. Use the structured correlation to classify the first inconsistent physical frame. If `native.after-raster` occurred but `native.after-move` had not, investigate overlay/owner move ordering; if both completed but a duplicate remains on screen, investigate native layer owner/release/DWM/WebView2 stale paint. If the UI never reaches `renderer.commit` or rollback, examine the protected renderer preparation/recovery. These are **diagnostic hypotheses**, not verdicts without original screenshots and logs.
7. Capture full original desktop video (60 fps if available) as **independent evidence** for exact visually observed A02 artifacts. `CopyFromScreen` is not a substitute for genuine Desktop Window Manager frame/present telemetry; no per-call log can establish the exact scanout instant. The `after-raster` marker means the API returned, **not** that DWM presented that frame. To establish GPU compositor queue/present behavior if QPC remains inconclusive, add ETW/DWM/PresentMon-style event tracing only after reviewing privacy, overhead and capture safety.

## Recorded trace fields

`schemaVersion`, `sourceSha`, `processId`, `rasterToken`, `stage`, `utc`, `qpcTicks`, `qpcFrequency`, and technical `details` (bounded step, elapsed ms, eased progress, requested owner x/y). Native phases: `native.begin`, `native.before-raster`, `native.after-raster`, `native.after-move`, `native.committed`; best-effort renderer stages: raster-ready, target-prepared, native-request/finished, commit, release-request and rollback.

**Performance/security:** disabled when `NARRO_FOCUS_CAPTURE_DIR` is unset or not an absolute path. Native frame stages are buffered in RAM (bounded max 512), only flushed after animation. Renderer command is a strict whitelist; never log user-authored task titles, notes, list content, timer texts, screenshot pixels or network data. The screen PNGs themselves **do show actual pixels**, so use the synthetic isolated test task/profile and handle the resulting artifact as visual evidence with normal privacy care. Trace write failures do not change timer state or presentation transaction outcome.

## Deterministic checks / outstanding

- `npm run test:focus-compositor-trace` — synthetic stable-QPC ordering/bracketing/invalid input and DWM limitation assertions.
- `npm run test:focus-runtime-visual-harness` — ensures actual protected expand/collapse UI route, native QPC bracket tags, buffering and guarded trace wiring are present.
- `npm run preflight:frontend`, prescribed Rust/Windows CI: must be run on exact current SHA; do not infer PASS from source edits.
- Actual Windows A02/8-case acceptance and elimination of ghosting: **NOT RUN** for this new instrumentation. PR389's **PHYSICAL_BEFORE_MERGE** hold remains.
- Motion v4 500 ms code is independently preserved in **draft PR418**. Do not combine an unproven animation change with this A02 baseline before the trace isolates compositor root cause.

**Next operation:** exact PR389 head CI and isolated real-click A02 capture with trace+screenshots, identify the first ghosted frame and its surrounding native/renderer events, then apply the smallest evidence-backed fix within PR389 and retest. No new product window or Main migration is needed for this diagnostic.
