# PA355 exact Windows aggregate review — 2026-10-15

Acquisition **3/3**, aggregate review **3/3**. Exact source `7b54e62f5d5f814e3e37ed93d8dfa996e9bad6e5`, guarded main `dbc3f6f2b86ba7d301b79fd0f568e1b8f20ad954`, Windows CI38630226135 **3/3 SUCCESS**, EXE SHA256 `d772edbfe09711ced7a5780dcedfd7bb8429999f4cc409ccb5e9f74377a8d074`. The prior full corpus is immutable: [native evidence](../work-log/evidence/pa355-native-20261015); [aggregate review images, observations, PDF text/pixels and database diff](../work-log/evidence/pa355-review-20261015). No source edits during capture or acquisition freeze.

One full914.034s continuous4480x1080/60fps dual-display video, original screenshots/UIA/HWND/input timestamps, actual PDFs and entire seven-file Narro-M7-Logs are published. Primary100%/LG125% extended desktop, dark/normal and light/reduced paired observations. Process-start UTC04:32:11.4526507 is approximate movie correlation; input UTC is authoritative. Review covers relevant action intervals and extracted frames/PDF pages, not a claim of frame-by-frame inspection of every idle frame.

## Three-group disposition

| Group | Result and actual exercised boundary |
|---|---|
| G1 Preferences | **PASS scoped width**, actual primarydark100 and LGlight125 lower sections have no horizontal scrollbar/overflow, vertical scrolling retained. Shortcuts opens a sole dialog and Escape returns to Preferences. **FAIL Escape after theme-save focus loss** at04:39:21.979: held real Escape leaves Preferences open; UIA focus is absent and video04:39:26 confirms modal remains. Explicit Close recovery04:40:26 succeeds. Subsequent background Add/Overview attempts04:39:22–43 are invalid and excluded. Earlier Tab-before-Escape succeeds, so do not report Escape always fails. |
| G2 Sessions | **PASS scoped picker/commit/cancel**: filterBoard04:36:39 then heldDown/Enter selects task; empty query and Home/End/Up paths observed; actual different-task mouse selection04:37:27 selects manual fixture with fields/footer visible. Actual06:00–06:01 manual session committed04:37:55, visible total20→21, exactly one durable60s manual row;7/7 task IDs/content unchanged. Nested detail→Add→Escape returns detail/+Add focus. Valid primary keyboard selection04:40:38–39 and Cancel04:40:41 restores+Add focus. An existing session changes only updated_at on normal checkpoint; no existing durations/tasks removed or modified. |
| G3 Reports/PDF | **PASS scoped tooltip ownership/containment**, same-viewportTab changes hover to focusedSep16 and pointer-leave retains it. Full left/final tooltip atLG125/90day after real PDF export. **PASS actual export/local inclusive filename/non-overwrite/default viewer**:30day exported twice to distinct paths, first SHA unchanged; normal Windows Nitro reader opens exact document and actualNextPage traverses3/3 pages. Both30day renders pixel-identical across3 pages. Actual90day Jul17→Oct15 filename matches visible range.9/9 pages rendered/reviewed across3 files; no tooltip/toolbar or final-date right-edge clipping. **FAIL90day adjacent endpoint labels overlap**: FriOct09 intersects ThuOct15 on actual PDF page1. Full-resolution image and PDF text span bounds are retained.30day endpoint is legible. Post30day pointer at an obsolete absolute coordinate produced no tooltip: insufficient evidence for that attempt; actual90day final tooltip provides post-export return acceptance. |

PR355 original picker and Preferences-width corrections pass their exercised native criteria. PDF clipping/filename corrections pass those narrow criteria; full PDF legibility remains FAIL due adjacent label overlap. Root causes of the two remaining defects are not inferred from screenshots alone; next phase traces their source boundaries and reproduces them with behavioral regressions before correcting.

## Reuse / all PA01–08

| PA | Current evidence disposition |
|---|---|
| PA01 | Prior persistent Focus/Time'sUp scoped PASS retained. Main HWND14291232 survives100→125→100→125 moves. No new Focus/performance/fullscreen acceptance. |
| PA02 | PA353 reliability scoped PASS retained; strict source-motion composition OPEN. Not exercised anew. |
| PA03 | Prior actual deadline/Time'sUp scoped PASS retained. No new deadline cycle. |
| PA04 | **FAIL overall** only for remaining90day PDF label overlap. Picker/manual insertion/cancellation and tooltip criteria PASS scoped. No blanket report-total reconciliation/source parity claim. |
| PA05 | DPI/topology observations scoped PASS; actual HDMI unplug/replug **NOT RUN/manual by explicit user choice**. No simulated device PASS. |
| PA06 | Prior selectedMelodicBell/volume0–100/Preview/automatic notification scoped PASS retained. OS-denial/listener-failure branches OPEN/NOT RUN; silent capture adds no audio acceptance. |
| PA07 | Prior actual152px drag/trayQuit/sameEXE/reappearedTimer scoped PASS retained. New Reports-only C5 log INCONCLUSIVE, expected absent Timer placement exercise; neither new PASS nor reversal of accepted evidence. |
| PA08 | MSI/NSIS installed launch/removal-restoration2/2 scoped PASS retained. Clean-machine, actual older-schema upgrade, trueboot NOT RUN. |

M8 width gate may reuse G1 PASS, but new Preferences Escape is FIX_NOW. M9 picker and filename/default-viewer/non-overwrite scopes reuse G2/G3 PASS; PDF legibility remains FIX_NOW. M5/M6 canonical source parity and other insufficiently exercised gates stay OPEN. Mandatory milestones3/10; M10 hard entry remains blocked. PA09/M11/liveBlitzit excluded.

## Safety / exact continuation

Normal trayQuit04:47:24.938447UTC; original profiles restored04:47:27.267372UTC, personal DB SHA unchanged `13185e54bc0ea08f3b368ccc48a8ede429683e1d58a60b15b8f7491a06d2224d`; Windows motion/topology restored, no owned Narro/recorder/viewer remains. Private original/owned DB backups and profile ledger excluded from upload.

NEXT: new feature branch from latest main; fix only confirmed Preferences keyboard ownership after async save/focus loss and PDF print label overlap. Reproduce actual disabled focused-control/async settlement and rendered text bounds, test failure/reopen/nested-modal/cleanup and short/30/60/90day ranges, whole available preflight, one coherent PR/exactCI, guarded merge/main identity, then only affected exact-build native recheck. Preserve approved Spectrum Core/image upload/218 icons and existing screen/chart/product behavior.
