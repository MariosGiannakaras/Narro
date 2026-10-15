# PA356 Windows targeted acceptance — 2026-10-15

Acquisition **2/2**, aggregate review **2/2**. Fully closed targeted groups **1/2**: Reports/PDF PASS; Preferences has scoped PASS paths plus an unresolved input/focus episode, so its complete group remains UNCERTAIN. This is not a new whole-milestone completion; mandatory **3/10**, M10 blocked. PA09/M11/live Blitzit excluded.

Exact source `f7456738b8b8498387d4d9637409c4a384f95ba3`, [PR356](https://github.com/MariosGiannakaras/Narro/pull/356) merged as `e0e7c3b3c9dd7352d5514bddd98457e8a457b93d`; [CI38688646540](https://github.com/MariosGiannakaras/Narro/actions/runs/38688646540) 3/3 SUCCESS. Main539/539 source/build/test/config blobs identical, workflow unchanged. Resulting-main duplicate38706169738 cancelled only after equivalence proof under CI strategy7. ValidationEXE SHA256 `b2d51e4e8b97f2feb5ae8235f91222126eca498c3615722e68531f912ec50293`.

## Evidence and integrity

[Whole frozen raw corpus](../work-log/evidence/pa356-native-20261015/README.md), [review images/data](../work-log/evidence/pa356-review-20261015). Original continuous OBS395.5s,4480×1080/60fps, both displays side-by-side; two binary parts reconstruct SHA256 `5d9fc868853722a9dc0e6c82a80fb8b156abf2a28b9ec84ddd56fe3d4e812b44`. Full decode exit0/no errors. Ten published binary PNG/PDF/ZIP/movie-part Git blobs equal originals; full movie reassembled from published Git blobs equals original. Original raw text/log bytes retained in raw-observations.zip; ordinary Git text normalization does not alter that archive. Four actual PDFs, twelve rendered pages, native UIA/HWND/action/keyboard-owner facts, system/motion/topology and complete7-file Narro-M7-Logs uploaded before review. Video/action offset is approximate; exact action UTC authoritative.

## Targeted group dispositions

| Group | Actual exercise and result | Disposition |
| --- | --- | --- |
| G1 Preferences | Primary100% normal: actual Light→Dark save08:33:40, scroll lower/top, Escape08:33:45.982 closes and Settings opener focused. Actual Dark→Light save08:34:04, Tab restores Close Preferences focus, Escape closes. LG125% reduced: actual Light→Dark save08:34:36, scroll lower/top, Escape08:34:41.962 closes; Settings reopens a newly loading Preferences frame. Real Shortcuts modal08:35:09, Escape returns Preferences, nextEscape returns Settings opener. | These narrow paths PASS, preserving width/scroll and nested-modal behavior. |
| G1 limitations | LG attempted Light+Tab08:34:54 did not actually change selection: UIA still Dark/toggle1, Light/toggle0. Do not count a passed light-save/Tab case from action labels. After returning from Nitro and reopening Preferences, Escape08:38:27 leaves Preferences visible while Windows Settings appears foreground at approximately324.5s. No claim that this is the same theme-save defect, a confirmed Narro regression, user interference or harness fault. Recovery used visible Close08:39:11. | Complete G1 **UNCERTAIN / OPEN** pending one bounded same-EXE native input/focus diagnosis. No speculative product patch or new CI. |
| G2 Reports/PDF | Actual90day inclusive Jul17–Oct15 export08:37:09, new `...07-17...-2.pdf`; exact new document opened in existing default Nitro, pages1→2→3 via actualNextPage, normalclose. FinalOct15 tooltip visible after export. Paired30day exports, including primarydark08:39:36, preserve date endpoints and normal return. | **PASS scoped**; current PDF legibility corrective acceptance closed. |

90day PDF glyph bounds: preceding visible tick FriSep25 ends at620.1951pdfpt; finalThuOct15 starts710.5898 and ends748.4948, a **90.3948pt positive gap**, fully inside page width792. The old overlapping Oct09 tick is omitted only in print; date range and daily bars preserved. All4PDFs×3pages rendered/reviewed: no observed endpoint overlap/clipping, no blank/lost content; repeated30day page2/3 render hashes match90day unchanged data. Actual chart3x crop and text bounds saved. Primary/LG PDFs in this session are dark; attemptedLG light switch did not persist, so do not claim light-native PDF acceptance from these files. CI light print fixtures remain automated evidence only.

## PA01–08 reuse matrix

| PA | Current scoped disposition | Change from this recording |
| --- | --- | --- |
| PA01 | Prior native reliability scopedPASS; quiet compact performance stillOPEN | Same Main identity/DPI observations only; no new Focus/performance claim. |
| PA02 | Prior entry reliability scopedPASS; canonical source motionOPEN | Not re-exercised; retain prior evidence. |
| PA03 | Prior deadline/Time'sUp scopesPASS | Not re-exercised. |
| PA04 | Picker/manual60s/tooltip/scrollbar/filename/nonoverwrite prior scopedPASS; currentPDF endpoint legibility nowPASS | Close affected M9export item11/12→12/12; direct canonical Reports/Sessions parity separatelyOPEN. |
| PA05 | Prior dualDPI/logical recovery scopedPASS; actualHDMI manualNOTRUN by user choice | Same Main realdrag100↔125 and unchanged topology observed; no hotplug/wake claim. |
| PA06 | Prior selectedMelodicBell volume/automaticdelivery scopedPASS; OSdenial/listenerfailureOPEN/NOTRUN | No new audio/delivery exercise. |
| PA07 | Prior real152px drag/trayQuit/sameEXE/restoredTimer C5 scopedPASS | Current Reports-only C5 INCONCLUSIVE; not newTimer placement evidence. |
| PA08 | Prior MSI+NSIS2/2 scopedPASS; clean-machine/older-schema/truebootNOTRUN | No packaging changes; no installer replay. |

Personal namespaces protected before launch with SQLite backup/quick_check; owned synthetic profile only. NormaltrayQuit08:39:38, OBSstop08:39:39, originals restored byte-identically08:39:40, SHA13185e54bc0ea08f3b368ccc48a8ede429683e1d58a60b15b8f7491a06d2224d. Originalmotion restored, DISPLAY1primary100/LGnonprimary125 unchanged. No Narro/recording/native viewer retained; private DB/namespace ledger/setupclip excluded.
