# Narro 2026-10-23 native recordings — additional CSV, event, and timing forensics

**Owner:** ChatGPT; **scope:** independent source-only analysis of the already frozen 13 native Narro MKVs, their associated timestamped journals, native M7 logs, and actual app-produced CSV. **Not a new media acquisition. Not a Blitzit live M11 audit. No implementation or Windows execution.**

**Recorded executable identity:** `cdaf85b3c20028a78d17f75f5700e652e7147f7e` (main source of the freeze). Technical statements about code were cross-checked specifically at **this SHA**, not merely at the later documentation-only main head. Recorded Windows EXE SHA-256 and CI are documented by [the frozen acquisition](evidence/native-resume-20261023/README.md), not independently recalculated here.

**Companion canonical intake:** [13-clip chronology and scope dispositions](2026-10-23-chatgpt-unreviewed-native-mkv-chronology-index.md). Its original per-clip timestamps and evidence limits remain in force; this is a *new cross-source analytical layer*, not a replacement or a competing tracker.

## A. Actual Sessions CSV vs video action manifest vs source

Analyzed actual frozen `evidence/native-resume-20261023/exports/narro-sessions-2026-09-22-to-2026-10-23.csv` (plain-text contents returned through GitHub), produced during `B10-reports-sessions/native-original.mkv`.

- The file has **8 named columns** and **45 data records**. The emitted UTF-8 BOM and quoted CSV header match `src-tauri/src/report_commands.rs::sessions_csv` at the recorded source SHA; all 45 parsed rows had 8 fields.
- **Sources:** 35 `manual`, 9 `focus`, 1 `edit`. **Kinds:** all 45 `work`; no `break` records in this exported selection. **Lists:** 36 `Capture Project`, 9 `Reading & research`. Calculated total recorded duration **36,972 s** (manual 32,400; focus 1,032; edit 3,540), *not* an authoritative Reports UI aggregate or proof of product/source parity.
- The manifest timestamps `B10 Hide Breaks` near clip **21.797 s**, then `B10 Export CSV` at **119.623 s / 2026-10-23T18:08:28.783Z**, followed by `B10 Capture Project filter` near **135.696 s**. Therefore **work-only, multi-list CSV content is consistent with the recorded control order**. Do not misclassify absence of Break rows or inclusion of Reading & research as an export regression.
- **Edited row temporal question:** the `edit` record reports work from `2026-10-23T18:06:00.000Z` to `2026-10-23T19:05:00.000Z`, `duration_seconds=3540` (59 min). The operator journal places `B10 Save session end time` at **18:08:17.120Z**, CSV export at **18:08:28.783Z**. Thus the stored end is about **56 min 31 s after the export click**. This is not a timezone conversion guess: comparing ISO Z values directly yields this relationship. It is an **observed data result** from a synthetic test fixture, not a proof that the UI accidentally selected that time.
- At the **recorded source**, `src/ReportsSessions.tsx::commitEndTime` calls `reportSessionDurationSeconds` and rejects only a non-positive/invalid interval. `src/reportOverviewPresentation.ts::reportSessionDurationSeconds` validates `end > start`, rounds seconds, and enforces the u32 range; `src-tauri/src/persistence/sessions.rs::validate_closed_session_input` also only checks `ended >= started` plus timestamp syntax and numeric duration range. `edit_closed_session_if_expected` enforces closed-session and optimistic `updated_at` identity, but does **not** prohibit `ended_at > now`. This is a **verified code and sample-data observation**. Whether future-ending historical Sessions must be disallowed is a **product-contract decision still OPEN**, not an automatically confirmed bug; review historical/local specs and current desired UX before any later implementation.
- **Wall time vs stored focus time:** of the 9 `focus` rows, **5** differ by more than 1 second, **4** by more than 60 seconds. The most extreme row starts `2026-10-20T13:55:34.234Z`, ends `2026-10-23T14:07:05.492Z` (wall interval **259,891.258 s**), but stores **1 work second**. Further differences include wall **3073.890 s / stored 180 s**; wall **152.993 s / stored 25 s**; wall **693.564 s / stored 284 s**. All 35 manual and the one edited row match end-start exactly. Focus time deliberately stops accumulating during pauses and may differ from wall time: **NOT A CSV CORRUPTION FINDING**. Any suspicion about unusual multiday paused-session restoration requires actual timer state/persistence evidence, not just these rows.
- No independent PDF-byte/pixel extraction succeeded for `exports/narro-overview-2026-08-24-to-2026-10-23.pdf`. PDF creation is reported in the operator journal, but content/layout/chart numeric correctness remains **EVIDENCE_LIMIT**, not PASS.

## B. Focus native presentation — cross-correlation to the same clock

Readable runtime file: `evidence/native-resume-20261023/Narro-M7-Logs/session-20261023-175728.754Z-49344/events.jsonl`, recorded candidate SHA identical to video build. **Six native events**: 1 validation start, 3 `focus-presentation`, 1 `timer-placement-restored`, 1 `timer-placement-saved`.

| Source clip / UI-action offset | UTC action | Native log and UTC | What follows |
| --- | --- | --- | --- |
| `B4-focus-live-notes` Blitz now **29.315 s** | ~18:13:36.006Z | `focus-presentation(panel)` **18:13:36.188Z** | Panel transition reported ~182 ms after labelled input; first visible paint **not** timed |
| `B4B5-focus-break-pomo` compact Timer **35.895 s** | ~18:15:43.366Z | `timer-placement-restored` **18:15:43.689Z**; `focus-presentation(timerCompact)` **18:15:43.710Z** | Correct stored compact visible rect **340 × 110** at **(2220,0)**; not a rendered-frame PASS |
| same video, Panel return **43.094 s** | ~18:15:50.565Z | `timer-placement-saved` **18:15:50.820Z**; `focus-presentation(panel)` **18:15:50.929Z** | Panel reported ~364 ms after action, but event timestamps do **not** measure perceptual animation/latency |

All native events use one monitor `\\.\DISPLAY1`, 2560 × 1080, scale factor **1.0**, Focus position `(2220,0)`, process ID 49344. The `focus.outerSize` field still displays **340 × 700** in compact-state events while `actualVisibleRect` is **340 × 110**: **distinct reported host geometry and visible compact region**, not evidence on its own of a window-size or clipping defect. No compositor screenshots or WebView2 CapturePreview pairs were obtained. These video clips are **main cdaf85b3**, not PR389/PR419 candidate builds.

### Earlier process lifecycle and the M7-C5 result

The same packet's earlier `session-20261023-133912.357Z-60940/events.jsonl` has **46 events**: 1 validation start, 24 presentation changes, 9 placement restored, 9 placement saved, 1 tray-quit requested, 1 timer-checkpoint saved before normal exit, and 1 tray-quit placement-save-complete. At **2026-10-23T14:08:23.782Z**, the last event carries `placementSaved:false, saveError:null` while the projection is `panel`. The associated `m7-c5-result.json` explicitly reports **INCONCLUSIVE** with `tray-quit-did-not-produce-a-visible-timer-placement-save`.

This must **not** be promoted to M7-C5 PASS, and is **not yet** a demonstrated corruption or failed restore. The result depends on M7-C5-specific preconditions (qualified native Timer drag, normal quit, next process and stable topology), which these event counts alone do not prove. At 17:57 UTC the acquisition operator separately recorded an earlier process absent with **unknown cause**, followed by a new synthetic-profile recording session; no native lifecycle causation is inferred.

## C. Frame accounting — nominal capture is not 60 visible frames for each second

Directly checked **all 13 frozen `video-metadata.json`** values (each 2560 × 1080; `r_frame_rate=60/1`). Dividing `nb_read_frames` by container `duration` gives an **effective count/duration ratio**; it is **not** `avg_frame_rate`, measured presentation timing, nor proof of dropped unique desktop frames:

| MKV segment | Decoded frames | Container seconds | Count/duration (fps) |
| --- | ---: | ---: | ---: |
| B1-home-list-navigation | 4,480 | 79.434 | 56.399 |
| B2B3-board-schedule-reorder | 9,460 | 167.200 | 56.579 |
| B3-board-input-reorder | 9,161 | 167.150 | 54.807 |
| B7B8-preferences-shortcuts | 9,166 | 166.867 | 54.930 |
| B7B8-preferences-lower | 9,591 | 167.034 | 57.419 |
| B9B10-reports-navigation | 9,791 | 166.884 | 58.669 |
| B10-reports-sessions | 9,128 | 153.217 | 59.576 |
| B4-focus-live-notes | 7,224 | 121.234 | 59.587 |
| B4B5-focus-break-pomo | 5,745 | 96.467 | 59.554 |
| B6-success-off-rest | 3,352 | 56.250 | 59.591 |
| B2B3-board-native-drag | 5,932 | 99.550 | 59.588 |
| B2-board-done-archive | 4,650 | 77.900 | 59.692 |
| B4-focus-skip-final | 2,460 | 41.284 | 59.587 |

**Total:** 90,140 reported decoded frames / 1,560.471 s = **57.765 count/duration fps**. In particular, B3 input/reorder and B7 theme capture count ratios are only ~54.8–54.9. The evidence does **not** justify indexing `frameNumber = round(clipSeconds * 60)` or treating every 16.667 ms as a distinct observed desktop frame. Visual motion analysis needs **actual decoded PTS**, original PNGs, precise click-aligned frame sequences, and verification of repeated/absent/nonuniform pictures. The original 281 journal *data* entries (+1 TSV header) are input/observer landmarks, not PTS.

## D. All-recording analysis disposition and prioritized uninspected intervals

The accompanying 13-row chronology individually maps **every acquired clip** to the known user actions, including Home/Board, schedule/recurrence, drag, Preferences/shortcuts, Overview/Sessions, live Focus/Notes/subtasks, Break/POMO, Success ON/OFF, archive and incomplete Skip. **This pass rechecked their metadata, manifest and relevant independent logs, not their inaccessible pixels.** Specifically:

- **High diagnostic value:** `B2B3-board-native-drag` around **47.078 s**, **54.290 s**, and late ~**91.344 s** (pointer target/drag outcome remains unknown); `B3-board-input-reorder` needs actual mouse delivery proof before any product FAIL. `B4-focus-skip-final` toggled Focus with **no live task**, so it contains **no Skip/switch acceptance event**.
- **High presentation value:** `B4B5-focus-break-pomo` around **35.895 s** compact, **43.094 s** Panel, **61.186 s** Complete and **65.716 s** Take a Break; `B4-focus-live-notes` near **55.859 s** Notes, **69.715 s** Save, **75.206–81.414 s** larger editor/Escape and **89.300–108.461 s** subtask lifecycle. Inspect pre-action, transition, and settled frames once accessible.
- **High persistence/report value:** `B10-reports-sessions` around **77.852–108.714 s** inline edit and **119.623 s** export; `B9B10-reports-navigation` around **42.262–74.411 s** date range, **88.996–95.636 s** chart menu, **103.160 s** PDF; `B2-board-done-archive` **39.931–56.716 s** archive/unarchive. The CSV analysis above gives source-side corroboration for B10 only.
- **Preferences/keyboard:** `B7B8-preferences-shortcuts` **45.643/52.521/57.717 s** theme and **73.583 s** timezone; `B7B8-preferences-lower` **50.849–82.529 s** volume and **137.372–159.759 s** shortcuts/Tab/Shift+Tab/Escape. No audio track is present; actual sound output cannot be recovered from these MKVs.
- **Coverage bounds:** operator freeze remains **19/24 acquisition journeys fully acquired, 5 partial, 0 wholly missing**, *not* 19/24 functional PASS. A13/A14 native lifecycle/monitor, B3 reorder/drag-cancel, B4 Skip/switch, and B5 autonomous expiry/Pomodoro boundaries remain OPEN. No claimed per-pixel alignment, color measurement, animation-easing reconstruction, keyboard focus placement or Blitzit source parity.
- **Historical A02 distinction:** old PR389 `ccb70a92` native compact→expanded screenshot samples retain one scoped ghosted-title FAIL around **12.61 s**; A01/A03 older overstatements were withdrawn to PENDING. That separate capture is **not among these 13 main clips**, cannot validate new PR389 head `7ff68761` or PR419 head `32973d6d`, and cannot license either merge.

## E. Precise boundary and next permitted analysis

**Established:** source/fixture identity from GitHub evidence; 13 metadata inventories; actual CSV fields/row semantics; exact Windows event chronology/placement logs; recorded-code validation boundaries; specific camera/event timestamps to inspect next.

**Still not established:** real MKV video pixels, exact decoded frame PTS/complete raster integrity, success of every filmed user action, real drag/window motion, sound, actual PDF contents, end-to-end restart persistence, physical Windows PASS, current Blitzit fidelity, and new compositor-candidate acceptance.

**Next analysis-only operation when bytes become accessible:** extract original frames with actual PTS and clip SHA; inspect pre-action/transient/post-settle sequences at the intervals above, compare correlated native/WebView2 paint captures for A02 separately, and adjudicate each result against existing canonical findings and its exact executable SHA. Do **not** alter runtime/source, tests, workflow configuration, CI, PRs, protected AppData, milestone acceptance or optional M11/M12 as a consequence of this report.

**Disposition of this work:** immutable Markdown evidence analysis only; no physical test and no source/code/config/test modifications.