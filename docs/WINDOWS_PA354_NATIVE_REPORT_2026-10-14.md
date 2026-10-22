# PA354 exact Windows Reports acquisition and aggregate review

Source `7647ffabb8ee93edfe95f90395baec632802b25e`, guarded main `73601944`, Windows CI38614321520 **3/3 PASS**, EXE SHA256 `205e0a422042e76db0ccee0317dda06d9a3186b0fc12d4c864054bc0a63f4f3a`. Acquisition **4/4 groups attempted**, aggregate groups **4/4 reviewed**. This is scoped corrective evidence, not overall PA or milestone completion.

[Entire corpus](../work-log/evidence/pa354-native-20261014): all three4480x1080/60fps dual-display recordings (479.967/299.984/240s, ordered40MiB parts/full SHA manifest), native actions/UIA/HWND/system snapshots, screenshots, actual PDF and all seven Narro-M7-Logs files. UTC action times are authoritative; sampled-video offsets below are explicit, approximate correlations. Hard-cap gaps are not attributed to video. Original personal DB/motion/topology restored, no Narro/recorder. Database backups/profile ledger remain private; synthetic test data only is published.

## Four-group disposition

| Group | Result | Exercised scope and evidence |
|---|---|---|
| G1 dark100 normal /30-day boundaries | **PASS scoped containment** | Native keyboard chart scroll107px; left partial-day and right final-day hover. Full heading/TASKS/BREAKS/TOTAL within chart bounds. `observations/g1-30-partial-left.json`: tooltip[543,784,690,891], viewport[539,732,1205,935]. `g1-30-last-day.json`: tooltip[1055,784,1202,891]. Whole recording1; extracted36s frame supports left hover. Frames62/64s are already date-picker states and are excluded from tooltip acceptance. |
| G2 dark100 normal /90-day, keyboard ownership | **PASS scoped containment and same-viewport ownership; offscreen-focus UNCERTAIN** | HoverJul18 whileJul16 focused; actualTab moves focusJul17 and tooltipJul17; pointer leave retainsJul17 (`g2-hover-over-focus`, `g2-keyboard-owner`, `g2-pointer-leave-owner`). Native chart scroll640px, partialAug11 hover contained[543,782,690,889]. Recording1 offset129s confirms completeJul17 tooltip. UIA focus to offscreenOct14 auto-scrolls and stationary-pointer tooltipSep18; browser retargeting vs ownership remains uncertain, not claimedPASS or confirmedFAIL. Offset217s shows a later Sep18 state, not the Aug11 observation. |
| G3 resize, LG125 light/reduced | **PASS scoped tooltip containment/DPI recovery; Preferences overflow FAIL** | Main reduced from1006x706→900x660 and moved to LG/DPI120. Close Preferences recovery19:30:16 UTC precedes all valid Reports acceptance. LeftSep22 tooltip[-1420,625,-1236,758] within viewport[-1425,560,-716,814]; lastOct14 tooltip[-904,625,-721,758]. Recording2 offset67s verifies complete left tooltip. Offset95s is Sessions view, excluded from tooltip evidence. Preferences screenshot `g4-input-grounding.png` visibly has horizontal overflow/scrollbar. Escape did not dismiss once, but saving/input timing is uncertain; do not classify that separately without root-cause evidence. Attempts behind the open modal are invalid. |
| G4 Sessions picker, cancellation, actual PDF | **FAIL picker usability/export completeness; PASS scoped cancel focus/export completion/tooltip return** | TypingBoard filters to one option. ArrowDown/Enter legacy, scan-mapped and held SendInput scancodes do not select; mouse at the UIA option rectangle closes picker but leaves empty selector/Add Session disabled. Recording3 offset14s shows popup search with result content clipped below it; offset61s shows unselected form. This proves unusable selection in this native path, not that the callback/DTO is the cause. Cancel19:41:07 restores+AddSession actualfocus. ActualPDF saved19:42:53,3/3 pages rendered/reviewed: tooltip absent, finalchartdate label visibly clipped, documentrangeSep14→Oct14 but filenameSep13→Oct14. Post-export tooltipTueSep15 complete byUIA19:43:23 and finalactual screenshot; these are after video3 cap, not video proof. No completed session insertion in this run. |

The original PR354 clipping criterion is **PHYSICAL_PASS scoped1/1** across the exercised dark100/light125,30/90-day, pointer/keyboard/scroll/resize/export-return states. This does not establish every ownership edge or canonical Blitzit source parity. **PA04 overall remains FAIL** for the newly exposed independent picker and PDF issues.

## Reuse across PA and M1–M9 gates

| PA | Current disposition |
|---|---|
| PA01 | Prior scoped native PASS retained; current Main identity1183842 and real100→125DPI move observed. No new Focus performance/fullscreen acceptance. |
| PA02 | PA353 physical reliability PASS retained; direct source motion composition remains OPEN. No Main→Focus run here. |
| PA03 | Prior exact-build Time'sUp scoped PASS retained. No new deadline/edit cycle here. |
| PA04 | **FAIL overall**; PR354 tooltip containment1/1 scopedPASS, picker selection/visible option clipping and PDF final-label clipping newlyFAIL. Cancel opener/actual export completion scopedPASS. |
| PA05 | Prior DPI/logical placement scopedPASS retained; **physical HDMI unplug/replug NOT RUN/manual**, explicitly deferred by user. No simulated physical PASS. |
| PA06 | PA351 selectedMelodicBell/volume0–100/Preview scopedPASS retained; OS-denial/listener-failure branchesOPEN. This recording is silent, no new audio acceptance. |
| PA07 | PA351 actual152px drag/trayQuit/sameEXE/reappearedTimer scopedPASS retained. Current normalQuit restored profile; currentReports-only C5 log **INCONCLUSIVE**, not a newPASS or a reversal of old acceptance. |
| PA08 | Verified PR353 MSI/NSIS installed launch/removal-restoration **2/2 scopedPASS** retained. Clean-machine MSI, real older-schema upgrade and trueboot remainNOTRUN. |

M8 Preferences theme selection/light rendering genuinely exercised; horizontaloverflow is an affected already-implemented surface **FIX_NOW**, not broad new milestone implementation. M9 Reports findings route to narrow correction. M5/M6 canonical parity cannot close merely because Home/Reports/Preferences appeared. Mandatory milestones remain **3/10**, M10 hard entry blocked. PA09/M11/liveBlitzit excluded.

## Frozen correction scope / continuation

After this report/corpus checkpoint, inspect only the confirmed recent-task picker geometry/interaction path, Preferences width containment, and PDF chart bounds/local-date filename contract. Preserve approved Spectrum Core picker/image upload/218 icons and all existing product semantics. Trace through real parent/modal/API boundaries; add regressions that reproduce the native failure rather than isolated mocks that miss it. No source edits were made during capture. Offscreen-focus and Escape remain UNCERTAIN unless further evidence establishes a defect. New feature branch/PR, whole logical/programmatic preflight, exact Windows CI/guarded merge/main proof, then affected exact-executable physical acceptance only.
