# 2026-10-19 — independent current-main M7 C4 causal source and latest native acceptance reconciliation

**Owner:** ChatGPT code/evidence-only track, independent from currently active Codex 18-stream video analysis. **Phase:** ANALYZED scoped existing evidence; **no new source/config/test/CSS/CI/native changes**. At examination, latest main was `3b982ff2d4a23663d7607661cb26fec5eb1ea5dd`. Codex current ANALYZING/owned full video-review state is in [HANDOFF](../HANDOFF.md); do not overwrite its current tracker or count its reviews.

## Why the old C4 explanation is NOT the current production source

Historic [2026-10-10 F35/C4 cause analysis](2026-10-10-chatgpt-finding35-c4-causal-correction-start.md) correctly identified that the **earlier CI1046** presentation clipped the incoming full 700px Panel to an outgoing 110px/300px Timer region, with explicit historic CSS `inset(0 0 590px 0)` / `inset(0 0 400px 0)`. That **original physical FAIL is preserved** and should never be relabeled PASS.

However, [PR349](https://github.com/MariosGiannakaras/Narro/pull/349) is merged to `35528dea615e28b146d5eb808cc9432582184738` and **replaced this cause** with outgoing WebView raster before incoming React presentation promotion, one finite native position/geometry/full-image raster composition timeline, and final DPI/paint acknowledgement before releasing protection. The current code must be reviewed after this integration, not copied from the October10 analysis.

**Exact current source vs merged-PR349 Git blob equality (five independent live GitHub comparisons):**

| File | Git blob SHA (same at merged PR349 and current main) |
| --- | --- |
| `src/FocusSurfaceCoordinator.tsx` | `52bcfa212bba96dfd77aec1024f9c22f8ae0cb03` |
| `src/focusSurfaceCoordinator.css` | `633a2ce362ec096102aa9d982c5a800c89855652` |
| `src-tauri/src/focus_mode_raster.rs` | `856aa9d77ee7954c5b127c3a2b04eab498551488` |
| `src-tauri/src/focus_frame_hold.rs` | `eac648de6a78c40bfbe4a1dd623fc801ebae60b1` |
| `src/focusPresentationTransition.ts` | `d2c20821a7eb4dac454a672f1498b30a0cbbb4e3` |

Current `FocusSurfaceCoordinator.tsx` lines ~245–295: native `prepareFocusSurfaceModeRaster(targetPresentation)` **precedes** `prepareGeometryMotion`; `animateFocusSurfacePresentation(next, motionDurationMs, rasterToken!)` cooperates with `runGeometryMotion`; committed target and `finishFocusSurfaceModeRaster` occur only through prepared transition. Current CSS lines ~67–79 sets preparing incoming Panel `clip-path: inset(0 0 0 0 round 12px)` and no historic `590px/400px` crop. `scripts/test-ui-focus-surface-transition.mjs` ~173–188 explicitly protects this order and forbids the two historic crop constants. Do not propose reverting to the old staggered CSS or a workaround without new exact-current physical evidence.

## Existing real-Windows PASS — do not confuse with old failure or Blitzit source parity

[Post-fix original Windows PA](../docs/WINDOWS_PA_POSTFIX_REPORT_2026-10-13.md) reviewed the entire motion evidence scope on merged `35528dea`, with **36 native presentation changes** across Panel↔compact and compact↔expanded at normal/reduced 100%/125%/same-LG variants and **84 consecutive frames around each**, **3,024 sequential frames total**. Same Focus HWND and state continuity; incoming whole-image fitting no old cropped header/card staging or pale/blank/desktop contamination in exercised states. `docs/WINDOWS_PA01_08_FINAL_2026-10-15.md` PA01 subsequently explicitly marked **PASS scoped**, preserving these C4 results. Exact resulting-main Windows CI for the post-fix native candidate `38384969271` attempt2 had **3/3 SUCCESS**. Physical result is tied to this historical executable, not automatically to all later unrelated source updates, unsupported rollback branches or original Blitzit motion pixel parity.

The tested C4 renderer/native mechanism is still **5/5 byte-identical** to current main in inspected code (above); independent source/config/workflow changes must be evaluated only if they materially alter that acceptance path. No evidence here of newly regressed C4 or a new source patch justified today. C4's **historic October8/10 source-cause repair is already integrated and accepted within real PA01 scope**. M7 and other source-motion/parity/PA09 milestone gates remain OPEN as recorded; do not count an M7 milestone completion or invent a repeat physical test.

## Handoff to Codex and coding agent

This is read-only parallel current-code work, **not** a review of the 18 Codex videos or a replacement for its 56 pending CI953 original visual/canonical cells. New Codex video observations must be matched to their actual executable date: old CI953 footage cannot invalidate PR349's later physical PASS by showing the known historical pre-fix clip. If any current later-native source failure is reported, compare matching candidate/executable, actual input/transition timestamps, HWND/DPI and task/timer state, and investigate only a proven new signature. Do not start code correction until the user's full-analysis-first gate finishes. No other-owner PR344 intervention, no protected Spectrum Core controls, no M10/M11/M12.
