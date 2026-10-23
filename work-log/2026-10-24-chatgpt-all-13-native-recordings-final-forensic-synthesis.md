# Final forensic synthesis — all 13 frozen Narro native MKVs (2026-10-24)

**Status:** **COMPLETE for the available 13 original source recordings and the defined visual/behavioral questions**, with explicitly identified unrecorded physical scenarios and product ambiguities left OPEN. This is an **analysis-only** work log. No Narro source, tests, CI, PRs, release artifacts, Windows profile, AppData or Blitzit M11 changes.

**Recorded implementation:** GitHub main commit `cdaf85b3c20028a78d17f75f5700e652e7147f7e`, Windows original EXE recorded SHA-256 `2c8b091f6bea079196f7b068c303749417bd80a3529230fb8c6ed0f93d386765`. The original package's CI `39921466242` was 3/3 SUCCESS (separate automated result). **This is not a new corrected candidate**: PR389 and PR419 remain a separate, later, nonvalidated physical acceptance scope.

## Media provenance and full-duration computational audit

The actual 13 untranscoded `native-original.mkv` files were retrieved through the temporary isolated GitHub Actions media bridge ([run 40025773555](https://github.com/MariosGiannakaras/Narro/actions/runs/40025773555), artifact `12533495087`, `narro-20261023-thirteen-native-mkvs`; workflow SUCCESS). The 13 independent original-MKV SHA-256 values were verified to match the frozen Git manifest `work-log/evidence/native-resume-20261023/SHA256-MANIFEST.json`.

**The whole corpus was decoded and scanned**: **90,140/90,140 frames in 13/13 originals**, 2560×1080 H.264 source, 1,560.471 total container seconds, zero ffmpeg decoder job errors. Each video frame was reduced to a 384×162 grayscale *analysis proxy only* and compared pixelwise to its previous frame for whole-image brightness change, affected-image proportion, and left/main versus right/Focus region change. Independently, **90,140/90,140 original decoded per-frame PTS** were collected using ffprobe and gap-checked. No reported nonmonotonic/zero PTS gaps; observed median separation ~17ms; **maximum observed gap 84ms**, **533 frame gaps >34ms**, **37 >50ms**, **0 >100ms** (floating-point threshold semantics as implemented). The nominal 60fps stream does **not** certify a unique image every 16.67ms.

**Visual inspection standard:** Combined the previous 13/13 full-clip screenshot orientation, 19 original-frame keyframe sheets and 34 around-action comparison sheets with targeted original-resolution crops and multi-frame motion sheets. Added **45 actual consecutive native-cropped frames at 36.65–37.40s** of the Break Panel→Compact transition and original full-source frame inspection of the end-of-capture anomaly. The image-change metrics scan **every original decoded frame at downscaled proxy size**, but **do not constitute manual scrutiny of every source pixel at native 2560×1080 resolution** or microscopic detection of stationary low-contrast artifacts. Selected original-size evidence and actual screenshots, never inferred CI screenshots or Adobe-generated substitutes, support individual UI claims. Frame-based pixel anomalies were triaged against action timing and OS context, not mechanically equated with product failures.

| Video | Frames actually decoded/scanned | Largest PTS gap | Scene/interaction family and additional coverage |
| --- | ---: | ---: | --- |
| `B1-home-list-navigation` | 4,480 | 50ms | Home, list previews, project board, return; old initial navigation/refresh contingency preserved |
| `B2B3-board-schedule-reorder` | 9,460 | 66ms | Tomorrow scheduling and recurring editor/dropdown dismissal; auxiliary task setup |
| `B3-board-input-reorder` | 9,161 | 34ms | No convincing input-driven UI motion: **9,157/9,161 frames with mean proxy change below 0.02**; incomplete input delivery is not a Narro implementation FAIL |
| `B7B8-preferences-shortcuts` | 9,166 | 67ms | Theme, monitor/UI refresh, timezone menu; significant screenshot differences can include exposed desktop/IDE |
| `B7B8-preferences-lower` | 9,591 | **84ms** | Task/notification/success volume controls, shortcut dialog, focus keyboard; audio not present |
| `B9B10-reports-navigation` | 9,791 | 83ms | Overview list popover ESC FAIL, simultaneous calendar, date preset, chart visibility, PDF export |
| `B10-reports-sessions` | 9,128 | 34ms | Add/Edit session, inline minute, filters, actual 45-row CSV |
| `B4-focus-live-notes` | 7,224 | 34ms | Blitz, pause, Notes save, large editor/ESC, subtask 0/1→1/1, selector |
| `B4B5-focus-break-pomo` | 5,745 | 34ms | Break/Panel/Compact, paused Pomodoro, feedback **NEW FAIL**, Success ON/Take Break |
| `B6-success-off-rest` | 3,352 | 34ms | Completion without Success modal, All Clear |
| `B2B3-board-native-drag` | 5,932 | 50ms | Drag attempts inconclusive, two task additions, Duplicate, next-lane arrow |
| `B2-board-done-archive` | 4,650 | 50ms | Archived list restore and Archived Done tab |
| `B4-focus-skip-final` | 2,460 | 34ms | Does **not** execute a real live Skip; one terminal white frame at actual PTS 40.733s followed by desktop exposure, origin uncertain |

## Updated observed physical-criterion matrix — recorded main build ONLY

[Initial 35-case findings](2026-10-24-chatgpt-native-thirteen-mkvs-scoped-physical-case-verdicts.md) are immutable. This independent supplement adds the newly substantiated **N36 Focus Break feedback** and narrows earlier N19 wording, without rewriting the old historical document.

- **30 PASS / 2 FAIL / 4 PENDING = 36 defined criteria; 32/36 have PASS/FAIL dispositions.** These are **review verdicts of already acquired original Windows video**, not newly executed native tests.
- **FAIL N28 (M9 Reports):** `B9B10-reports-navigation` at 33.88–43.5s. Overview list-filter popover remains visible after an attempted Escape and coexists with date-range calendar. Native before/after images and recorded `ReportsOverview.tsx`/View's missing list popover ESC-close route agree. The list filter itself still updates metrics (separate PASS).
- **FAIL N36 — NEW (M6 Focus feedback, M3 Timer authority):** `B4B5-focus-break-pomo` around 47.41–56.75s. After the Break is skipped via the Focus action, the *same frame at 52.02s* shows explicit **`Pomodoro Paused`** and the feedback line **`Break skipped. Work resumed.`** at the same time. This is a user-facing **contradictory success message**, not a runtime-work-duration defect: the recorded source `src/FocusLiveActions.tsx::handlePauseResume` hardcodes `run("pause_resume", skipBreakTimer, "Break skipped. Work resumed.")` while recorded Rust `src-tauri/src/timer/mod.rs::skip_break` intentionally returns **`TimerStateKind::Paused`**, verified in existing Rust tests (including `skipped_manual_break_leaves_task_paused` and Pomodoro skip). Actual main screenshot directly corroborates the two simultaneous labels; unchanged for multiple seconds. **N19 remains PASS only for exiting Break, publishing the safe paused work state and retaining a Break history row**—its older phrase “resumed work” must **not** be interpreted as timer RUNNING. This narrower interpretation supersedes the old N19 descriptive copy, without modifying the historical receipt.
- **PENDING N09/N10 (M5 Board):** pointer drag reorder and cross-lane drag/cancel not demonstrated to reach valid native mouse DnD; a largely static separate 167s clip reinforces the input-tool failure/evidence limitation, not a new code defect.
- **PENDING N15 (M6):** true *live-task* Skip/switch not acquired.
- **PENDING N21 (M3):** autonomous EST/Pomodoro expiry/boundary not acquired.

### Dense motion and surrounding-content regrade

- In `B4B5-focus-break-pomo` ~**36.650–37.400s**, 45 consecutive original source frames were cropped at 340×700 around actual Focus x=2220 for framewise composition review. The old Panel is present first, then transitions out as a single compact Timer/title/remaining-time/subtask surface appears. Subsequent pointer hover changes the compact title area to an action strip; **this is a presentation/hover change**, not proof of a ghosted duplicate title. Cropped pixels below the currently visible compact region may contain **the underlying Windows desktop/IDE text**, not invisible Narro Panel content. No verified *simultaneous full old Panel and full new Timer hierarchies* was observed in the examined local original-frame sequence. This cannot exclude every subframe compositor artifact or accept PR389 A01/A02/A03 or experimental PR419 Motion v4.
- The reverse Compact→Panel screenshots around 43.09–44.45s show restoration in the older main native recording, but any unsampled 16ms defect needs tighter specific evidence before a negative assertion. Original Blitzit exact motion/easing is a separate source-parity gate.
- In `B4B5`, the header `29/30 Done` counts **completed tasks**, while the lower section `30 Done` includes one **Break history session**; after the real task completes the header is `30/30 Done` and the lower group `31 Done`. Recorded `FocusPanel.tsx` intentionally uses task-only `board.done.count` for the header and `doneTasks.length + doneBreaks.length` for the lower section. **Not a confirmed count corruption**, though wording may merit a separate design decision.
- The actual CSV has 45 work rows; historical manual/edited vs focus stored duration behaves according to its distinct session types. A manually edited synthetic Session ended in the future relative to save time; the recorded validation allows it, but whether to prohibit future-ended manual sessions is a **product contract OPEN**, not an unsolicited FAIL.
- The volume-control UI and focus states are visible in Preferences/Shortcuts, but **video has no audio channel**, so device audio success is **NOT RUN**.
- **End-of-clip anomaly:** In `B4-focus-skip-final`, source frames 2422–2426 show the Board; frame **2427 at original PTS 40.733s** is almost full-screen white (cursor remains), frame 2428 onward exposes Windows desktop/IDE instead of Narro. The video ends at 41.267s. This is a **real captured visual discontinuity**, identified by the whole-frame 384×162 mean-difference peak **227.17 grayscale levels**; however, the recorded action timeline ends earlier and operator shutdown/capture cleanup is not disambiguated from abnormal program exit by video alone. **Do NOT label this an app crash, compositor bug, or physical FAIL**; keep as **INCONCLUSIVE capture-lifecycle anomaly** requiring exit/process logs if later relevant. Original clip remains intact.
- No separate duplicated labels, incorrect task IDs, spontaneous toast spam, broken theme selection, title-editor persistence failure, malformed modal or recurring-option corruption was verified from the examined original-size interaction windows and whole-video anomaly triage. This absence of an *observed verified* failure is not proof all conceivable pixel transients are impossible.

## Results by milestone for THIS original-video review ONLY

| Scope | PASS | FAIL | PENDING | Notes |
| --- | ---: | ---: | ---: | --- |
| M3 Timer engine | 0 | 0 | 1 | Autonomous expiry unrecorded; the wrong Focus feedback is filed under M6, while M3 correctly returns Paused |
| M4 Scheduling/recurrence | 2 | 0 | 0 | Specific editor and recurrence controls |
| M5 Main/Board/Lists | 6 | 0 | 2 | DnD not reliably exercised |
| M6 Focus Panel/feedback | 8 | **1** | 1 | New misleading Break skip success copy |
| M7 Floating Timer | 2 | 0 | 0 | Old-main sampled endpoint cases only |
| M8 Preferences/Shortcuts | 4 | 0 | 0 | Audible output not tested |
| M9 Reports/Sessions | 8 | **1** | 0 | Popover ESC |
| M1, M2, M10 | — | — | — | No new independent physical criterion in this 36-case set |
| **Total** | **30** | **2** | **4** | **36 scoped outcomes, recorded old main only** |

**NOT a roadmap completion change:** mandatory milestone acceptance stays at its separately validated **4/10 M1–M4**, M5–M10 OPEN. Historical 19/24 physically acquired journeys and five partial remain **acquisition** counts, not 19 PASS; new-head PR389 normal/reduced **0/8 NOT RUN**. No recent PR fix, merge or new build is validated by the October 23 main-source footage.

## Explicit conclusion and handoff

**THE ANALYSIS OF ALL 13 AVAILABLE ORIGINAL NARRO MKV RECORDINGS IS COMPLETE within the documented full-duration per-frame computational scan + dense evidence-led visual review scope.** All source bytes were accessible and every frame was decoded and PTS-accounted; **do not misdescribe** that as 90,140 manual 2560×1080 pixel-by-pixel human inspections. No other original 2026-10-23 clip is awaiting intake/first visual review. The four PENDING behavioral criteria are **not unfinished video work**: the necessary actions/automatic time boundaries were *not validly recorded* and require **different/new real-Windows acceptance input**, if later authorized under the appropriate current candidate/protocol. The final instant white-frame cause is likewise unestablished.

**For the user's requested later correction phase, prioritize exactly the 2 substantiated old-main user-facing FAILs** after checking they still exist on the appropriate latest source: M9 Reports list popover ESC/exclusivity; M6 Focus Break skip toast contradicting Paused. Do not start correcting in this analysis-only phase. Separately preserve PR389 historical A02 compositor FAIL and its 8-case `PHYSICAL_BEFORE_MERGE` hold as distinct work.
