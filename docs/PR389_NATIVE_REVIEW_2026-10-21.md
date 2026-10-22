# PR389 exact-build native review — 2026-10-21

**Acquired8/8; reviewed8/8;4scoped visualPASS/4FAIL. PR389 NOT MERGED.** Source77a6b13903cf6bf3f4ba67c3e6edddb1d0402ad1, exactCI39560130498 **3/3SUCCESS**, actual validation/normal EXE byte-identical SHA256`31cc0db9be9acf4dd7b4c1176fd31668f9ec407f4d9c2c126967c12cc3839a79`, embedded sourceSHA matches. Original personal profiles restored/DB hash identical; no owned app/recorder remains.

| Actual native transition | Normal stream PTS | Reduced stream PTS | Visual disposition |
|---|---|---|---|
| Panel→compact |4.367–4.583s|4.367–4.400s|**FAIL:** full compact Timer is already visible above the old orange Panel task/list hierarchy. It is not the single outgoing clipped hierarchy selected by the production arithmetic.|
| compact→expanded |11.150–11.583s|11.283–11.650s|**SCOPED PASS:** expected expanded Timer reached; old Panel card previously seen in PR388 is absent in reviewed frames. Finite crop/hover states are retained; no whole source-parity or compositor-ownership certification.|
| expanded→compact |18.200–18.400s|18.383–18.617s|**FAIL:** complete compact Timer occupies top110px while old expanded Subtasks/No-subtasks content remains below it. This is mixed outgoing/incoming hierarchy, even though the old orange Panel is gone.|
| compact→Panel |25.400–25.933s|25.233–25.500s|**SCOPED PASS:** clean Panel return and expected settled hierarchy observed; no wrong retained old task or whole-window scaling in these reviewed intervals. Exact canonical phase timing remains open.|

All8DOM target receipts show expected final presentation/pendingfalse. Paused05:00 is visibly preserved; no independent database/domain acceptance is inferred. Both previously obstructed Expand pointer actions succeed **2/2** through actual WebView2 CDP; Add hit-testing has real-browser proof but no new native Add workflow. No OS-input/global-hotkey/drag proof.

## Evidence and bounds

[Frozen packet](../work-log/evidence/pr389-native-20261021/README.md). Two original **full actual desktop** Desktop Duplication streams: normal28.934s/1724decoded frames; reduced28.900s/1726frames,2560x1080. Nominal60fps; max observed PTS gap34ms, so absence of every sub-frame artifact is not proven. Renderer media deliberately emulated and read back false/true; this is not Windows Settings UI acceptance.

Pixel-change bursts are located using mean-delta0.7 solely to find intervals. **Every decoded frame** within each burst±250ms is then preserved by sequential original decode with exact ordinal+PTS;235normal+197reduced frame occurrences (overlapping margins duplicate some). Ten contact sheets were visually reviewed, plus full-resolution failure frames. Original videos are authoritative for lower-delta/outside-window details. Native ROI2220,0,340x700 is derived from actual final window bounds and verified before/end Focus handle5375194. The full videos preserve any movement outside the crop. Final host340x700/region340x700; before/end identity matches, not an all-topology acceptance.

Full Narro-M7-Logs, CLI accessibility snapshots/input receipts, source/artifact/run identities, independent CI runtime artifact and final WebView screenshot are included. CI stable endpoints were reviewed; its full sampled motion corpus is preserved, not exhaustively re-analyzed or substituted for this desktop proof. C5 INCONCLUSIVE is expected: no qualifying drag/trayQuit test.

Two helper-setup failures occurred **before recorder start**: run-code needs an async page function; invoking the PowerShell npx shim with call-operator parsed an unintended `px` argument. The executed helper uses official npx-cli through Node with preserved receipts and finalization; empty first attempt and second error are documented. No hidden/idle recording.

## What the candidate actually establishes

The natural-pixel arithmetic and protected sequencing are locally/CI validated, but do **not** own the whole composed physical picture on the existing native GDI-child path. Incoming live WebView pixels appear over outgoing raster/backing content in the failed intervals. That visual ownership failure is directly observed; whether the exact obscured pixels come from the child bitmap or cached WebView backing requires a native layering probe. Do not label a particular driver/GPU root cause confirmed. GPU-compositing disabling already failed in the unchanged-EXE paired diagnostic.

This repeats the same single-hierarchy acceptance failure after another separately corrected, CI-validated physical candidate. Stop successive redraw/delay/arithmetic patches to the same native-child mechanism. Reassess composition ownership and compare a materially different scoped path. Candidate performance sampling is **NOT RUN**, deliberately deferred because this candidate fails visual acceptance; preserve the published3/3current-main baseline for the eventual acceptable alternative.

**Next comparison decision (before source changes):** evaluate an owned nonactivating/input-transparent **layered native bitmap popup** above the same Focus HWND, with atomic position/size/pixel presentation via UpdateLayeredWindow. It is a bounded transient GDI/DWM bridge, not another WebView/timer authority or a persistent Focus window. Keep the same two normal WebViews/fixed host, tokens, rollback and watchdog. Add explicit owner-hide cleanup (owned popups do not automatically hide merely when their owner hides), owner destruction/minimize handling, exact geometry/z-order/input/idle-resource proofs and matched performance. Native child vs this alternative must be compared with the same8transition protocol before selecting/merging. Source/rendering changes remain on existing PR389; no new PR/freshness PASS from API documentation.

Primary platform basis: [owned window relationships and layered input transparency](https://learn.microsoft.com/en-us/windows/win32/winmsg/window-features), [UpdateLayeredWindow](https://learn.microsoft.com/en-us/windows/win32/api/winuser/nf-winuser-updatelayeredwindow), [NOACTIVATE/tool window styles](https://learn.microsoft.com/en-us/windows/win32/winmsg/extended-window-styles). These support a scoped alternative, not a Narro fix claim.

## Gate reuse / continuation

M7C26–28/C35/affectedC19 remain **FAIL/OPEN** overall; the two expansion observations and tooltip2/2are scoped improvements only. M1same-Focus-handle observation is retained; candidate replacement composition/quiet footprint still OPEN before merge. Other M5/M6/M8/M9 surfaces were not sufficiently exercised here. Mandatory4/10 unchanged/M10blocked; optionalM11/M12dormant. Approved Spectrum Core/upload/218icons untouched. No user action is required for the next source/native-layer comparison.
