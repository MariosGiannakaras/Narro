# Blitzit full-video → Narro implementation control/state reconciliation

**Purpose:** After 19/19 independent raw MP4 Pass-3 source reviews, map each video's time-local transient/interactive claims to actual current production TSX/CSS/Rust and registered parity gaps. This is an additional implementation comparison, not raw-video reinspection or physical/source-visual acceptance.

**Progress: VIDEO-TO-CODE 19/19.** Current+Help screenshot-to-code per-control matrix completed 39/39 separately, 250 mapped claims. Original MP4 Pass-3 source forensic coverage was 19/19 and is *not* the same progress numerator.

| Video | New per-timestamp code review | Implementation disposition |
| --- | --- | --- |
| VE-001 | REVIEWED (15 montage-segment video-to-code claims) | Corroborates existing B35/B63/B64; source editorial limits explicit; no new B |
| VE-002 | REVIEWED (11 time-local video-to-code claims) | New B66 reactive draft EST preview; VE-F001 committed normalization scoped validated |
| VE-003 | REVIEWED (30 time-local video-to-code claims) | B15/B26/B49/B50/B63–B65 + P3-M6/M7 native gates; exact source motion NOT accepted |
| VE-004 | REVIEWED (19 time-local video-to-code claims) | First-use loop mapped; existing B3/B7/B8/B24/B48/B49/B52/B61–B64; auth/trial excluded |
| VE-005 | REVIEWED (24 video-to-code claims) | B61–B65 + prior B IDs; current code checked; native/source parity NOT RUN |
| VE-006 | REVIEWED (15 time-local video-to-code claims) | Delete confirmation/Archive arithmetic mapped; existing B10/B11 archive controls, limited unclicked trash |
| VE-007 | REVIEWED (21 time-local video-to-code claims) | Existing B19/B33/B40/B42/B48; new B70 post-unschedule Backlog vs original manual-lane return (older video limit) |
| VE-008 | REVIEWED (24 time-local video-to-code claims) | Existing B19/B33/B39–B42/B45; new B71 active recurring parent incorrectly contributes to pending counts |
| VE-009 | REVIEWED (18 time-local video-to-code claims) | Existing B19/B20/B33/B39–B41/B71; examples not committed, no new ticket |
| VE-010 | REVIEWED (14 time-local video-to-code claims) | Existing B26 Notes X and B49 live action hover-pills; auto-open-on-live source UNPROVEN |
| VE-011 | REVIEWED (19 time-local video-to-code claims) | Existing B13/B16/B25/B27/B28/B30; source Time By List vs headline unreconciled; no new B |
| VE-012 | REVIEWED (17 time-local video-to-code claims) | Existing B27/B28/B30; Rust avg/day/time-by-list/punctuality semantics align with documented source |
| VE-013 | REVIEWED (14 time-local video-code claims) | B12/B60 Board gaps; Focus/Floating subtask behaviors code-present, native M7 motion OPEN; Notion excluded |
| VE-014 | REVIEWED (24 time-local video-to-code claims) | Existing B9/B17/B18/B21/B34/B63/B64; new B69 alert-flash live-card wash vs timer text |
| VE-015 | REVIEWED (20 time-local video-to-code claims) | B56 high-priority metric meaning + NEW B68 selector disclosure; B59/B25/B32/B51 separate |
| VE-016 | REVIEWED (23 time-local video-to-code claims) | New B67 negative amber overtime; existing B35–38/B50/B53 + native Finding35 |
| VE-017 | REVIEWED (18 time-local video-to-code claims) | Existing B20/B33/B39–B42/B45/B71; replacement/detach branches reconciled, no new ticket |
| VE-018 | REVIEWED (20 time-local video-to-code claims) | Older weekly-superset and transient-success caveats retained; existing B35/B36/B38/B43/B44/B63–B65, no new ticket |
| VE-019 | REVIEWED (16 time-local video-to-code claims) | Older Floating/theme evolution and current source precedence; B21/B34 only, intentional live-first-subtask improvement |

## VE-005 — Add & Manage Tasks and Lists — REVIEWED 2026-10-08

**Source:** `docs/BLITZIT_FORENSIC_PASS3_VIDEOS.md` Queue 2, full 03:38.750 MP4 source previously inspected at 60fps with dense intervals, SRT for narration qualification. **Implementation head:** `f85ce87d601ad82b73cb5ebf1325ccd9951f3b79`. Older tutorial version: use current 2.6.69 screenshots as higher precedence where same surface exists.

| Time | Source action/state observed | Current Narro production/code route | Disposition |
| --- | --- | --- | --- |
| 00:00–00:22 | Home card rest, task previews, big Create List tile | HomeDashboard.tsx / homeDashboard.css | GAP_B23_B54_B55 |
| 00:23–00:32 | Create modal groups; color change; Create closes and grid adds Tutorials | ListEditorModal.tsx, AppShell.saveList | GAP_B3_B7_B8 / PRESENT_CODE_ONLY for committed insertion |
| 00:32–00:39 | Hover reveals centered Open without reflow; ellipsis Edit/Duplicate/Archive | HomeDashboard.tsx ListCard + CSS, AppShell routes | PRESENT_CODE_ONLY |
| 00:40–01:08 | Empty pending lanes centered All Clear | ListBoard.tsx BoardLane yields No tasks/No Tasks | NEW_GAP_B61 |
| 00:40–01:08 | Empty Today anchored but visually subdued Blitz CTA | BlitzEntryButton.tsx/css no eligible-state prop; vivid until pending | NEW_GAP_B62 |
| 00:40–01:08 | Four-column shell and empty lane primary actions | ListBoard LANES, BoardLane and BlitzEntryButton | PRESENT_CODE_ONLY |
| 01:09–01:23 | All Lists and named-lists anchored badge selector; changing scope repopulates board | ListBoard native <select> / onTargetChange, no badge menu | GAP_B24 / PRESENT_FUNCTION |
| 01:25–01:50 | Inline create X CANCEL/Title/EST/helper/Confirm layout | ListBoard InlineCreateEditor different labels/structure | GAP_B52 |
| 01:25–01:50 | Create Video and Record voice consecutively without closing editor | ListBoard submitCreate clears editorState after each mutation | GAP_B46 |
| 01:25–01:50 | New Record voice appears above Video through shown add path | ListBoard bottom add append vs separate ADD TO TOP | GAP_B47 / VERSION_ENTRY_LIMIT |
| 01:25–02:18 | Task EST entry and edit use HH:MM, tooltip Est. HH:MM | ListBoard parseMetricDuration uses only H:MM:SS; TaskCard placeholder H:MM:SS | GAP_B53 |
| 01:50–02:03 | Rest ordinal swaps to completion on hover; rail Subtasks Notes lane arrows ellipsis | TaskCard ordinal slot/TaskActionRail/hover CSS | PRESENT_CODE_ONLY |
| 01:50–02:03 | Move Record voice Today→Week→Today without changing task | ListBoard onMoveAcrossLane and persisted move API | PRESENT_FUNCTION / NATIVE_NOT_RUN |
| 01:50–02:03 | Overflow Schedule Change List Duplicate red Delete | TaskOverflowMenu MenuItems, missing separator before destructive Delete | GAP_B48 |
| 02:03–02:18 | EST changes to 8h45 and aggregate follows; Taken remains 0 | ListBoard metric edit and BoardLane aggregateRemainingEstSeconds | PRESENT_FUNCTION / NATIVE_NOT_RUN |
| 02:24–02:33 | Blitz focuses Record voice at 08:45 countdown; pause/resume | BlitzEntryButton; focusModeForTask; FocusLiveActions timer pause/resume | PRESENT_FUNCTION / NATIVE_NOT_RUN |
| 02:34–02:44 | Queued Video Taken 05:35 parses as 5h35 while EST null | TaskCard inline Taken; ListBoard parseMetricDuration strict H:MM:SS rejects 05:35 | GAP_B53 |
| 02:45–02:51 | Success replaces live card in-place while Focus queue/header persist | FocusCompletionSuccess full opaque Focus-area absolute overlay | NEW_GAP_B63 |
| 02:45–03:20 | Prominent animated reaction media; later completion also differs | FocusCompletionSuccess component has no img/video/media/GIF state | NEW_GAP_B64 |
| 02:45–02:51 | Success reports 525 minutes early for EST525min vs Taken0 | FocusCompletionSuccess only EST/Taken pair, no computed delta | NEW_GAP_B65 |
| 02:45–03:20 | Next Task waits for explicit click; Take a Break post-click unseen | FocusCompletionSuccess Next Task and disabled Take a Break; B4 source-limited | PRESENT_CORE / SOURCE_INTERACTION_LIMIT |
| 02:51–02:58 | Done grouped by date, 1/2 Done also in This Week | ListBoard flat Done, This Week progress only Today | GAP_B43_B44 |
| 02:51–03:20 | Tutorial cuts Focus↔Board and staged second completion | No product transition timing can be inferred across source edit points | SOURCE_EDIT_LIMIT |
| 03:21–03:38.75 | Help Center/Discord outro | Online community/help excluded under Narro local-only scope | EXCLUDED_SCOPE |

**VE-005 completion gate for code audit:** every original chronological source segment including tutorial cuts and outro has an explicit direct component/function/intentional-scope/evidence-limit route above. It does **not** certify source current-version visual pixel match, repeated Ctrl/keyboard edge behavior, Windows native motion, release EXE or CI. Raw video not replayed; previously fully inspected source Pass-3 record consumed. Independent user physical/Codex session remains authoritative for all native FAIL/OPEN.

## VE-003 — Blitz Mode — REVIEWED 2026-10-08

**Source:** full 03:15.651 MP4 original Pass-3 Queue1 source reviewed earlier with 60fps motion, dense hover/success samples; this pass uses canonical source notes rather than replaying unneeded raw media. **Compared code head:** `324986cb8f0aac532afdfce419a93e5f588fabbf`. Original tutorial chronology may predate v2.6.69 Help/current screenshots; per claim explicit source-version/interaction limits apply.

| Video time | Source transient/action | Current Narro source+validated-scope comparison | Disposition |
| --- | --- | --- | --- |
| 00:00–00:30 | Four-lane Board; Today 0/5 Done/3h15 EST from 2h+30m+45m | ListBoard LANES/aggregateRemainingEstSeconds and Today progress; This Week B44 | PRESENT_CODE_ONLY / GAP_B44 |
| 00:30.08–00:30.30 | Board window shrink+translation into Panel ~0.22s, no full fade | Main→Focus bounded native morph PR243/CI1009; current physical source comparison still open | IMPLEMENTED_CODE / PHYSICAL_PARITY_OPEN_P3_M6_01 |
| 00:30.30–00:42 | Initial PAUSED transient before countdown runs | Focus Home/entry one-shot paused projection, timer model; exact first start-frame source relation unproven | PRESENT_CODE_ONLY / TRANSIENT_LIMIT |
| 00:30–00:42 | Panel Today header/list selector/EST/progress/live card+queue | FocusPanel header/summary/live task/queue; selector plain native instead of badge menu | GAP_B15 / PRESENT_OTHER_CODE |
| 00:30–00:42 | Bottom Focus mode and Done for the day controls in older tutorial | FocusPanel offers top compact button/Home, no identical bottom pair; current SS-C19 shows top compact controls | HISTORICAL_VERSION_PRECEDENCE_LIMIT |
| 00:42.7–00:43.23 | Ordinary queue hover circle/rocket/subtasks/Notes/overflow | FocusTaskRow FocusPanel action rail, scoped CI1046 queue action pass | PRESENT_CODE_ONLY / PHYSICAL_SCOPE_ONLY |
| 00:42.7–00:43.23 | Focus reorder Call with Sarah below Analyze within ~one 60fps frame | FocusPanel beginFocusTaskPointerDrag and reorderListBoardTask; not same as animated Board drag | PRESENT_FUNCTION / EXACT_MOTION_NOT_RUN |
| 00:48.7–00:50.58 | Focus ordinary menu Schedule Change list Duplicate red Delete | FocusTaskRow more menu order and delete callback | PRESENT_CODE_ONLY |
| 00:48.7–00:50.58 | Old source immediate Delete+30min EST/one-count removal in one frame | FocusPanel requests TaskDeleteConfirmDialog for safe explicit confirmation; local persistence/aggregate refresh | LOCAL_DESTRUCTIVE_SAFETY_DEVIATION / OLD_VERSION_LIMIT |
| 00:51–00:54 | Live task hover swaps title/time for compact Break Notes Pause Skip Done rail | FocusPanel keeps title/time and six always-shown text actions | GAP_B49_B50 |
| 00:51–00:54 | Notes expands inline and pushes later queue rows, closes with bottom-right Close | FocusLiveActions TaskNotes rich inline body, but RichNoteEditor lacks source Close control | PRESENT_INLINE / GAP_B26 |
| 00:59.9–01:02.7 | Done success settles inside live card; Focus header and queue stay | FocusCompletionSuccess absolute opaque whole Focus overlay, coordinator inerts old panel | GAP_B63 |
| 00:59.9–01:02.7 | Success shows completed title+Well done+GIF+early copy+metrics | FocusCompletionSuccess title/Well done/metrics, no GIF or calculated early feedback | GAP_B64_B65 |
| 00:59.9–01:02.7 | Explicit Next Task starts Analyze, not automatic; Take Break not clicked | FocusCompletionSuccess Next Task callback and no implicit next; Take a Break disabled as source-unobserved | PRESENT_CORE / BREAK_INTERACTION_LIMIT |
| 00:59.9–01:02.7 | While success open header shows 1/5 then Next normalizes 1/4 | Source repeatable +1 denominator transient; Narro suppresses header under overlay; preserve as source artifact, not required math | SOURCE_ARTIFACT / NO_BLIND_BUGFIX |
| 01:04.5–01:07.5 | Make Live Slogan options replaces Analyze as active without marking Done | FocusPanel onMakeLive switchTimerTask authoritative + queued prior task snapshot | PRESENT_FUNCTION / NATIVE_NOT_RUN |
| 01:19–01:33 | All Lists stacked badges/+2/named colored lists and mixed task rows | FocusPanel native All/list-text select, no anchored badge stack | GAP_B15 |
| 01:19–01:33 | List selection and changed visible active card in staged tutorial | Focus target switch exists, but source does not prove auto-start or multi-timer | CAUSALITY_LIMIT |
| 01:33–02:00 | Gear opens narrow scrollable Focus-side Preferences screen | FocusQuickPreferences implements modern SS-H05 Quick Preferences; old VE003 larger family is superseded by modern source | SOURCE_VERSION_RECONCILIATION / PRESENT_FOCUS_QUICK |
| 02:00.5–02:01.1 | Home first shows PAUSED then Panel expands to Board ~0.25–0.30s | FocusPanel pauseTimerForFocusHome and coordinator handoff; PR244/CI1013 and scoped physical CI1046 accepted, canonical motion open | SCOPED_PHYSICAL_PASS / SOURCE_MOTION_OPEN |
| 02:04.6–02:06 | Re-enter Blitz briefly PAUSED then resumes same task | FocusPanel resumed guarded lease via resumeTimerFromFocusHome; scoped CI1046 physical pass | SCOPED_PHYSICAL_PASS / SOURCE_PARITY_OPEN |
| 02:11–02:11.30 | Bottom Focus mode causes ~0.28–0.30s Panel→Floating shrink/morph | Current top compact requestMode('timer') and 270ms native morph, but current CI1046 M7 C4 remains FAIL | HISTORICAL_TRIGGER_LIMIT / M7_C4_PHYSICAL_FAIL |
| 02:12–02:18 | Floating Timer dragged on desktop without ghost/snap | FloatingTimerFoundation drag region + native window drag path; physical CI953 scoped drag pass | SCOPED_PHYSICAL_PASS / ALWAYSONTOP_NARRATION_LIMIT |
| 02:24.5–02:42 | Rest title/time crossfade to icon actions ~130ms | FloatingTimerFoundation CSS heading/actions opacity 130ms, hover/focus state | PRESENT_CODE_ONLY / NATIVE_NOT_RUN |
| 02:24.5–02:42 | Target action grows only one icon into label pill within fixed outer width | FloatingActionButton and .floating...action:is(:hover,:focus-visible) label CSS; physical CI936 partial source pass | SCOPED_SOURCE_PASS / FULL_FOCUS_PENDING |
| 02:42.45–02:42.8 | Restore expands Floating into Panel over ~0.28–0.35s | FocusSurfaceCoordinator requestMode('panel'), motion CSS/native 270ms; CI1046 C4 FAIL | M7_C4_PHYSICAL_FAIL / SOURCE_MOTION_OPEN |
| 02:46.5–03:00 | Success repeated four times with different GIFs and explicit Next | FocusCompletionSuccess no media, opaque overlay; completed/next API present | GAP_B63_B64 / PRESENT_NEXT |
| 02:46.5–03:00 | Transient 2/5→2/4 etc +1 denominator repeats during success | Source old counting artifact, not product computation mandate; no Narro denominator change | SOURCE_ARTIFACT / NO_AUTOMATIC_FIX |
| 03:00.2–03:13.6 | Last Next yields 4/4, Est0, brief skeleton then No Tasks added on this list/+ CREATE TASK | FocusPanel final empty All Clear/No Today tasks left to focus on and + ADD TASK; existing idle semantics, old copy variant | HISTORICAL_COPY_DIFFERENCE / SOURCE_CURRENT_LIMIT |
| 03:13.6–03:15.65 | Brand/outro | Not a Narro app product surface | EXCLUDED_SCOPE |

**Closure rule:** every original VE-003 timestamp window and unmeasured transition has a specific code/source-artifact/physical-gate or version-limit route. No code source changes, runtime/canonical visual acceptance, or updated native timer C4/35 PASS. Existing B63/B64/B65 cross-video success omissions remain open independently of physical CI1046 success observations. The original +1 completion denominator behavior is explicitly a source artifact and **not** a requirement to corrupt authoritative Narro task counts.
## VE-002 — EST suffix parsing — REVIEWED 2026-10-08

**Source:** 01:21.633 MP4 original 30fps and previously verified enlarged Pass3 review, distinct from this current source→code mapping. Source code head `bf9d9cf74c97b4380577051f0b7334c1d204033c`; `taskEstimateParser.ts`, `ListBoard.tsx`, `TaskCard.tsx`, existing tests. **Do not confuse precommit UI state B66 with validated commit result VE-F001.**

| Video time | Source observed | Narro code route | Disposition |
| --- | --- | --- | --- |
| 00:00–00:18 | Today inline creator Title+EST=00:00/Cancel/Confirm | ListBoard InlineCreateEditor fields exist, copy and input H:MM:SS differ | GAP_B52_B53 |
| 00:18–00:32 | Prepare slides 28 m visibly changes EST to 00:28 before Confirm | ListBoard title onchange independent of EST, parser only at submit | NEW_GAP_B66 |
| 00:18–00:32 | Commit strips 28 m and retains 28min EST | taskEstimateParser+submitCreate committed DTO | PRESENT_VE_F001 |
| 00:32–00:40 | Write blog post 1 HR visibly changes EST to 01:00 precommit | Parser case-insensitive but editor does not run it live | NEW_GAP_B66 |
| 00:32–00:40 | Commit strips 1 HR and retains 1hr EST | taskEstimateParser and guarded backend creation | PRESENT_VE_F001 |
| 00:40–00:48 | Email campaign 2 HR 15 m shows 02:15 precommit | Parser has combined grammar, inline draft no reactive estimate | NEW_GAP_B66 |
| 00:40–00:48 | Commit strips combined suffix and retains 2hr15 EST | parseEstimateSuffix and submitCreate atomic write | PRESENT_VE_F001 |
| 00:48–00:59 | Tutorial narration supports full word hours (not executed on-screen) | Parser regex accepts hours, tests include 2 hours | SOURCE_NARRATION_LIMIT |
| 00:59–01:04 | Post-parse regular EST slot remains manually editable | TaskCard MetricValue edit exists; duration HH:MM input grammar B53 | PRESENT_EDIT / GAP_B53 |
| 01:04–01:18 | Create row persists for rapid successive tasks | ListBoard submitCreate always resets editorState to null | GAP_B46 |
| 01:18–01:21.63 | Branded outro | Not a product UI scope | EXCLUDED_SCOPE |

**Review closure:** 11 timeline claims incl source-annotation/outro mapped. Original raw video not replayed. No manual/candidate Windows visual parity, tests or CI performed. Parser `hours` narration lacks a directly executed original example, though Narro supports and tests it.
## VE-001 — product explainer montage — REVIEWED 2026-10-08

**Source:** 02:19.033 MP4 (1920×1080 30fps) already full-video Pass-3 scanned. This is **edited montage**, not continuous interaction evidence; do not compare cut intervals to transition duration. **Narro code source:** `090c674f92539f3ebd175aa150a4a8036a227746`. Exact current screenshot and continuous dedicated tutorials supersede visual/interaction ambiguities here.

| Source segment | Product pixels vs montage/nonproduct | Narro source/fidelity reference | Disposition |
| --- | --- | --- | --- |
| 00:00–00:15 | Presenter/desk context without continuous app interaction | Not source UX/action evidence | EXCLUDED_NONPRODUCT |
| 00:15–00:20 | Search overlay with input, quick actions, dimmed Home | SearchPalette.tsx + searchPalette.css; stronger current SS-C06 | PRESENT_CODE_ONLY / STRONGER_CURRENT_SOURCE |
| 00:20–00:31 | Narrow Focus next to external work, success reaction+Next+Break | FocusPanel separate surface; success JSX opaque dialog/no reaction media | GAP_B63_B64 / PRESENT_CORE |
| 00:32–00:41 | Four-lane Board, planned task metadata, Today CTA | ListBoard four BoardLane, TaskCard, BlitzEntryButton | PRESENT_CODE_ONLY / B39_B40_B43_B44_CONTEXT |
| 00:41–00:50 | Board then Focus shown by editorial hard cut | AppShell→Focus coordinator exists; motion only from full VE-003, not montage | SOURCE_CUT_LIMIT / P3_M6_01 |
| 00:50–01:03 | Floating Timer remains above external app; task/Notes shown | FloatingTimerFoundation actions/subtasks/Notes, native focusSurface; VE-003/010 stronger | PRESENT_CODE_ONLY / STRONGER_VIDEOS |
| 01:03–01:08 | Brief alert/flash visual amid rapid cuts | LowerPreferenceSections animatedTimerFlash and backend integration; no timing invariant from montage | PRESENT_SETTING / SOURCE_TIMING_LIMIT |
| 01:08–01:18 | Multiple reaction/Next/Take a Break cards shown via montage | FocusCompletionSuccess has Next & visible disabled Break, no GIF/inline card | GAP_B63_B64 / BREAK_SOURCE_LIMIT |
| 01:18–01:22 | Break named as a standalone active Focus card, queue still below | FocusPanel live task remains original task ID/title with Break only as status | GAP_B35 / OLD_VIDEO_LIMIT |
| 01:22–01:31 | External productivity tools/integration mentions | Narro excludes cloud integrations by explicit local-only scope; no isolated source sync proof | EXCLUDED_CLOUD_SCOPE |
| 01:31–01:39 | Preferences theme/Pomodoro/alerts across dark/light montage | ThemeSettingsPanel/PreferenceSettingsSections controls, current shell B34 and toggles B17 | PRESENT_CONTROLS / GAP_B34_B17 |
| 01:39–01:47 | Reports metrics, daily chart, Time By List, Done Tasks | ReportsOverviewView/Rust DTOs; existing sparse chart B30/row pills B27 | PRESENT_CODE_ONLY / B27_B30 |
| 01:47–02:03 | Community, roadmap, mobile, AI, list sharing | Narro local-only scope; no feature implementation claim | EXCLUDED_ROADMAP |
| 02:03–02:16 | Website, trial, pricing/lifetime deal | Explicit Narro excluded commerce/accounts/website scope | EXCLUDED_COMMERCE |
| 02:16–02:19.03 | Branded product outro | Not app behavior or a UI state | EXCLUDED_NONPRODUCT |

**Closure:** all VE-001 montage segments have a current-code or intentional scope/evidence limit. No unique implementation gap warranted beyond B35 (old Break card current-version limit) and cross-video B63/B64 Focus success. No timing derived from editorial cuts and no GIF rotation algorithm inferred from montage; no candidate Windows source visual PASS. This qualifies as one *video-to-code review* but not raw video reinspection.
## VE-016 — Timer Modes — REVIEWED 2026-10-08

**Source:** full 02:55.333 MP4, 1920×1080 at60fps, already individually source-reviewed Pass3 with 0.1s zero-boundary/Extend segments. This code audit compares full chronology against exact main `f901c2769839ae69cc190597799a32694330980d` and DOES NOT rerun the MP4. Source video precedes current 2.6.69 Help screenshots for some Break/Focus visuals; no tutorial cut or time jump becomes a performance invariant.

| Video time | Source state/action | Narro current code route | Disposition |
| --- | --- | --- | --- |
| 00:00–00:18 | Board Today/list EST arithmetic and opposing EST/Taken metric slots | ListBoard aggregateRemainingEstSeconds, TaskCard metric pair | PRESENT_CODE_ONLY |
| 00:18–00:25 | Edit EST of Send press-release to 40min; add 30min→70min | TaskCard metric edits and ListBoard aggregate; HH:MM field parser absent | PRESENT_ARITHMETIC / GAP_B53 |
| 00:25–00:31 | Inline create Title+Est 00:00, Cancel and Confirm | ListBoard InlineCreateEditor exists with different layout and H:MM:SS placeholder | GAP_B52_B53 |
| 00:32–00:38 | Blitz task 30min EST countdown starts, other task queued | focusModeForTask and FocusPanel timer/task queue projection | PRESENT_FUNCTION / NATIVE_NOT_RUN |
| 00:38–00:41.5 | Pause→Resume role, paused live task EST edited as 00:30 | FocusLiveActions pause/resume, FocusLiveMetrics paused gate, HH:MM parser rejects | PRESENT_GATE / GAP_B53 |
| 00:42 | Edited jump from ~30min to near-zero EST1min and header41min | Hard source tutorial cut, not elapsed performance evidence | SOURCE_STAGING_LIMIT |
| 00:42–00:44.4 | Regular EST countdown 00:00:01→TIME'S UP without stable 00:00:00 | focusTimerPresentation time_up returns 00:00 with label Time's Up; CI1046 native Finding35 FAIL | KNOWN_FINDING35_PHYSICAL_FAIL |
| 00:44.4–00:53 | Time's Up persists, no auto skip/Done, contextual Extend appears | Rust timer time_up state persists; FocusLiveActions state.extendEnabled but panel always renders disabled Extend | PRESENT_DOMAIN / GAP_B50 / FINDING35 |
| 00:53–00:56 | Extend changes text to negative warm overdue -00:01:01/-00:01:02 | focusTimerPresentation returns +overtime_ms clock, no warm timer state CSS | NEW_GAP_B67 |
| 00:53–00:56 | Immediate source -1min magnitude despite only seconds elapsed | Staged elapsed-time jump cannot establish exact milliseconds or speed | SOURCE_STAGING_LIMIT |
| 01:18–01:31 | Preferences Pomodoros enabled, 5min work/5min break, manual10min | LowerPreferenceSections durations + snapshot, disclosure B17 and shell B34 | PRESENT_SETTINGS / GAP_B17_B34 |
| 01:32–01:34.9 | POMO green badge with work countdown and EST header 0 | focusModeForTask pomodoro independent of EST, FocusPanel no POMO badge | PRESENT_MODE / GAP_B37 |
| 01:34.9–01:35 | POMO work timer displays 00:00:00 then break immediately | Timer service Pomodoro boundary, FocusPanel text projection; exact native frame not reviewed | PRESENT_DOMAIN / EXACT_MOTION_OPEN |
| 01:35–01:40 | Break replaces live task, original task returns to queue | FocusPanel retains taskId original live-card title and Break label only | GAP_B35 / CURRENT_VERSION_LIMIT |
| 01:36–01:40 | Staged Break Over, completed Break row 5min in Done | FocusPanel Done only board.done.tasks (no break sessions) | GAP_B36 / TIME_JUMP_LIMIT |
| 01:42–01:44 | After Break active POMO work returns | Pomodoro timer mode and focus session API exists, exact restart latency unmeasured | PRESENT_DOMAIN / SOURCE_TIME_JUMP |
| 01:43–01:49 | Floating mode retains Pomodoro task countdown | FloatingTimerFoundation shared timer projection, focusModeForTask and timer formatter | PRESENT_FUNCTION / M7_C4_SEPARATE |
| 01:50–02:00 | Source jump to new task/time | No automatic selection or elapsed-time requirement inferred | SOURCE_CUT_LIMIT |
| 02:00–02:10 | No EST and no POMO leads to count-up stopwatch | focusModeForTask count_up, focusTimerPresentation formatTimerClock elapsed | PRESENT_FUNCTION / NATIVE_NOT_RUN |
| 02:10–02:11.3 | Pause freezes count-up and exposes Resume | FocusLiveActions pause/resume and Rust timer paused state | PRESENT_FUNCTION / NATIVE_NOT_RUN |
| 02:11.3–02:16 | Paused Taken 00:30 commits as 30min, EST remains null | FocusLiveMetrics strict H:MM:SS rejects 00:30; independent persisted Taken/EST model | GAP_B53 / INDEPENDENT_METRICS_DOMAIN_PRESENT |
| 02:16–02:51 | Paused visual PAUSED, +EST and Taken30min plus prior Done task | FocusPanel status/FocusLiveMetrics and Done group; visual source acceptance outstanding | PRESENT_CODE_ONLY / SOURCE_COMPARISON_OPEN |
| 02:51–02:55.38 | Branded outro | Not application user-visible workflow | EXCLUDED_SCOPE |

**V05 closure:** 23 source-video segments routed. Distinguish actual source persistent Time's Up wordmark (Finding35 physically FAILED in current candidate), Extend negative amber visual sign (B67 new), and staged initial ~one-minute overtime magnitude (not validated elapsed time). Existing Break/POMO B35–B38 remain historical-version evidence-limited; B50 and B53 remain code-confirmed. No recent native physical/CI/pixel PASS performed by this audit.
## VE-015 — Sessions walkthrough — REVIEWED 2026-10-08

**Source:** original complete 02:56.167 /1920×1080 @60fps source-reviewed in Pass3; this review uses time-local canonical source record and current code head `4b55c5a1b0bb9f476747315f5c1b08b0d7e716a8`, not another raw video replay. Older source PDF/coming-soon superseded by current SS-C14 CSV; summary/flows still directly meaningful.

| Source time | Observed source behavior | Current Narro code route | Disposition |
| --- | --- | --- | --- |
| 00:00–00:20 | Reports Overview→Sessions Beta within shared shell | ReportsSessionsView tab list and navigation callbacks | PRESENT_CODE_ONLY |
| 00:20–00:43 | Add Session, older Export PDF, filters/date row | ReportsSessionsView toolbar, current Export .csv supersedes source PDF | PRESENT_ACTIONS / CURRENT_CSV_PRECEDENCE |
| 00:20–00:43 | 14h22 Time, 39 Tasks, 22 Sessions | Rust session_reporting.rs distinct worked-task IDs cannot exceed session rows | GAP_B56_METRIC_SEMANTICS |
| 00:20–00:43 | Date-grouped session rows with task/list/ordinal/time/ellipsis | ReportsSessionsView SessionRow and groupRows, task-relative ordinals | PRESENT_CODE_ONLY |
| 00:43–00:51 | Anchored checkmarked multi-list filter with badges | ReportsSessionsView listbox options/selection; trigger placeholder N instead of badges | PRESENT_FILTER / GAP_B25 |
| 00:51–00:55 | Hide Break sessions standalone gamepad filter | ReportsSessionsView break toggle functional but literal ◉ icon | GAP_B51 / PRESENT_FUNCTION |
| 00:54–01:04 | Presets Today/Yesterday/This week/30/60/90; two months Cancel/Apply | ReportsSessionsView DateRangePicker + report month state; double chevrons B13 | PRESENT_CODE_ONLY / GAP_B13 |
| 01:04–01:28 | Reverse date groups and task-relative Session 03 ordinal | ReportsSessionsView groupRows and Rust work-session ordinal map | PRESENT_DOMAIN / NATIVE_NOT_RUN |
| 01:28–01:49 | Inline end time 1:51→2:51, green check, 1h11→2h11 | ReportsSessionsView SessionRow inline editor; ReportsSessions.commitEndTime guarded Rust mutation | PRESENT_FUNCTION / SOURCE_ROUNDING_LIMIT |
| 01:28–01:49 | Total Time +1hour 14h22→15h22, Tasks39 Sessions22 unchanged | ReportsSessions.afterMutation reloads Sessions; Rust summary from work duration; B56 absolute Tasks definition remains | PRESENT_RECOMPUTE / GAP_B56_DEFINITION |
| 01:49–01:55 | Main row ellipsis menu Edit / red Delete | ReportsSessionsView Menu/MenuItem Edit and destructive Delete | PRESENT_CODE_ONLY |
| 01:53–02:04 | Task-detail overlay, title/list badge/Add, 3 sessions / 2h13 | ReportTaskSessionsDialog header+detail.rows and independent task-scoped view | PRESENT_CODE_ONLY / GAP_B32_MODAL |
| 01:53–02:04 | Each task-detail session row has destructive menu | ReportTaskSessionsDialog SessionRow showDetailAction=false leaves Delete | PRESENT_CODE_ONLY / SOURCE_DELETE_RESULT_LIMIT |
| 02:05–02:20 | Add Session task selector opens from collapsed state into Search/Recent Tasks menu | ReportAddSessionDialog always mounts search input and Recent Tasks list; no collapsed-open state | NEW_GAP_B68 |
| 02:05–02:20 | Recent Tasks options include colored list badges | ReportAddSessionDialog renders plain small listTitle; B59 | GAP_B59 |
| 02:05–02:20 | After task selection date/start/end/duration fields appear | ReportAddSessionDialog selected conditional date/time/duration form | PRESENT_CODE_ONLY / POSTSELECTION_POPUP_LIMIT |
| 02:20–02:24 | Add 2h session top of date group, Session04, toast successful | ReportsSessions.commitAddSession + afterMutation reload; sort/data ordinals | PRESENT_FUNCTION / NATIVE_NOT_RUN |
| 02:20–02:24 | Totals 15h22→17h22, Sessions22→23, Tasks39 unchanged | Rust summary duration and session count update; Tasks source denominator still B56 | PRESENT_TIME_AND_SESSION / GAP_B56 |
| 02:24–02:40 | Old Export PDF hover coming soon, no downloadable output | Current screenshot SS-C14 Export .csv; actual local CSV exported by Narro | VERSION_SUPERSEDED_EXPORT_CSV |
| 02:40–02:56.17 | Recap/outro | Non-product closing footage | EXCLUDED_SCOPE |

**Important semantic limit:** Source 39 Tasks with 22 Sessions and current 2 Tasks with 0 Sessions contradict Narro's session-only distinct-task total; even though Tasks stays at39 when an existing task gets another session, that does **not** establish a complete alternative count formula. Do not replace backend definition speculatively. The 1h edit and 2h addition *do* prove independent Total Time and Total Sessions arithmetic. Exact task picker source postselection closure and recency order remain evidence-limited, but its first-open disclosure is directly shown (B68).
## VE-011 — Reports populated Overview — REVIEWED 2026-10-08

**Source:** complete 03:10.400 original MP4 @60fps previously source-reviewed in Pass3, including live filters, hover and legend interactions. This is implementation comparison of canonical time-local notes vs `ReportsOverviewView`, `ReportsOverview`, `reporting.rs` and CSS at `00c3168977ee85b2ec9ff1abb73cdaed3e4c8e49`; original MP4 was not replayed. Newer SS-C12/C13/C15 source sets current report header/empty state precedence.

| Source time | Video-direct behavior | Current code source | Disposition |
| --- | --- | --- | --- |
| 00:00–00:19 | Home→Reports navigation, modern source Overview/Sessions tabs | AppShell primary nav and ReportsWorkspace routing, current SS-C12 shell wins | PRESENT_CODE / SOURCE_VERSION |
| 00:19–00:25 | Four Overview summary metrics and date/list filters | ReportsOverviewView summary, ReportsOverview Rust DTO, date/list state | PRESENT_CODE_ONLY |
| 00:19–00:25 | 7 active work days, 18 Done/2.6 per day, 9.2h/1.3h per day | Rust overview total_work_days from active dates and per-day ratios; no exact source dataset available | PRESENT_AGGREGATE / SOURCE_DATA_LIMIT |
| 00:19–00:25 | Tasks purple, Breaks mint, Total tan; chart options | ReportChart series and options button missing click action | PRESENT_SERIES / GAP_B16 |
| 00:25–00:34 | Live multiselect Freelance → Freelance+Music → All lists while menu stays open | ReportsOverview selectedListIds/toggleListSelection; menu stays mounted | PRESENT_FUNCTION / NATIVE_NOT_RUN |
| 00:25–00:34 | Trigger color stack/checkmarks/named list badges | ReportsOverviewView menu colors/checkmarks exist; trigger uses N glyph | GAP_B25 |
| 00:34–00:42 | Two-month date range, six presets, Cancel/Apply | ReportsOverviewView DateRangePicker; current SS-C02 double navigation B13 | PRESENT_FUNCTION / GAP_B13 |
| 00:42–01:23 | Consecutive eight calendar categories inclusive of days without sessions | Rust reporting.rs daily_series only emitted on session dates; chart fixed 8 tracks | GAP_B30 |
| 01:24–01:32 | Full-day hover translucent band + brightened total bar, black tooltip | ReportChart has tooltip, no categorical hover band/Total state CSS | PRESENT_TOOLTIP / GAP_B28 |
| 01:24–01:32 | Day Tasks1.2h+Breaks0.1h=Total1.3h | Rust reporting aggregates time types; no same source dataset, math consistent | PRESENT_AGGREGATION / SOURCE_DATA_LIMIT |
| 01:32–01:40 | Independent Tasks/Breaks/Total legend toggles hide/restored bars and recenter | ReportChart visibleSeries filter and series map; CSS grid stable | PRESENT_CODE_ONLY |
| 01:40–01:46 | Reports body scrolls between fixed app header and bottom nav | AppShell workspace grid fixed header and nav with scrollable content | PRESENT_CODE_ONLY |
| 01:46–02:07 | Most productive hour/day/month panels | ReportsOverviewView productive-grid and Rust summary fields | PRESENT_CODE_ONLY |
| 02:07–02:18 | Time By List donut/legend/color/time/percent populated panel | ReportsOverviewView donut/time_by_list from Rust work_by_list | PRESENT_CODE_ONLY |
| 02:07–02:18 | Headline 9.2hr vs same-range Time By List18h56 discrepancy | Source directly inconsistent; current data cannot establish alternate formula | SOURCE_METRIC_RECONCILIATION_LIMIT |
| 02:18–02:54 | Done grouped dates/counts with list-colored badges, Early/Late/No Est pills, Taken | ReportsOverviewView grouped Done with no source list accents/pill styling | GAP_B27 |
| 02:18–02:54 | Done list internal scroll independently of main Reports page | reportsOverview.css done-list overflow and max height | PRESENT_CODE_ONLY |
| 02:37–02:54 | Early76.22%/Late23.78% weighted by time variance, not task count | Rust punctuality early_seconds/late_seconds ratio, tests for weighted shares | PRESENT_SEMANTIC / SOURCE_DATA_LIMIT |
| 02:54–03:10.40 | Recap/outro | Not app functionality | EXCLUDED_SCOPE |

**VE011 close:** 19 chronological/source-anatomy claims mapped, no novel untracked production gap. Important source anomaly preserved: 9.2hr headline and 18h56 Time By List are too different for normal rounding, so no artificial reconciled formula. Current scoped Rust aggregates remain historically tested; code-matched controls not accepted without direct Windows/source capture. Existing B30 missing no-session calendar days and fixed-8 geometry remain critical; no new native test run.
## VE-012 — Reports improved Sessions and Stats — REVIEWED 2026-10-08

**Source:** complete 06:56.300 30fps source clip previously reviewed end-to-end at Pass-3 with 0.5s legend and 2s Done scroll sampling. This is a new time-segment code reconciliation against `b7bb348ab37054f85f7ab56bc040528319368bf5` `src-tauri/src/reporting.rs`, `ReportsOverview`, `ReportsOverviewView` and CSS, not another raw MP4 playback. The older source produces populated metric examples; current v2.6.69 stills set shell/copy precedence.

| Source time | Original behavior/data | Current Narro code/spec comparison | Disposition |
| --- | --- | --- | --- |
| 00:00–00:18 | Focus context then Reports navigation | AppShell / ReportsWorkspace routing; no unique Reports metric source | PRESENT_CODE / SOURCE_SCOPE |
| 00:18–00:25 | Last 30 days preset, Jan27–Feb26 2024 anchored two-month calendar | ReportsOverview reportPresetRange and ReportsOverviewView DateRangePicker | PRESENT_CODE_ONLY / DATE_STAGING |
| 00:25–03:00 | 17 active days, 44 Done; 2.6 tasks/active day | reporting.rs total_work_days session-active local dates; total_tasks_done from completed_tasks; ratio by active days | PRESENT_SEMANTICS / SOURCE_DATA_LIMIT |
| 00:25–03:00 | 81.7hr total time incl work+break, 4.8hr/day | reporting.rs total_time_seconds sums all sessions; average_time_per_work_day_seconds | PRESENT_SEMANTICS / SOURCE_DATA_LIMIT |
| 00:25–03:00 | 86min avg/task includes unfinished session-bearing tasks, not Done 44 denominator | reporting.rs total_work_seconds / work_by_task.len() | PRESENT_SEMANTICS / SOURCE_DATA_LIMIT |
| 03:00–03:37 | 30-day chart includes empty calendar days between active dates | reporting.rs daily_series BTreeMap only session-bearing dates; Reports chart fixed8 CSS tracks | GAP_B30 |
| 03:00–03:37 | Tall tooltip hover band over current date | ReportsOverviewView tooltip exists but category-band style absent | GAP_B28 |
| 03:00–03:37 | Tasks5.6+Breaks0.2 displayed Total5.7 (independent rounding) | ReportChart formats each source series independently from seconds; do not enforce sum of rounded labels | ROUNDING_SOURCE_LIMIT / PRESENT_MODEL |
| 03:32–03:37 | Legend can hide Tasks and Breaks leaving Total, recenter bars | ReportChart visibleSeries toggles and data-driven columns | PRESENT_CODE_ONLY |
| 03:37–03:55 | Reports body scrolls while top/bottom shell stays | AppShell workspace header/main/primary nav layout | PRESENT_CODE_ONLY |
| 03:55–04:52 | Productive hour 3pm-4pm, day Thursday, month Feb24 | reporting.rs hour=most work seconds, day=highest focus-session count, month=most work seconds; PRODUCT_SPEC 13.1 agrees | PRESENT_SPEC_SEMANTICS / SOURCE_DATA_LIMIT |
| 04:52–05:08 | Time By List 80h06 distinct from headline 81.7hr; list allocation excludes breaks | reporting.rs work_by_list only work, total_time_seconds includes Break and Work | PRESENT_SEMANTICS / SOURCE_ROUNDING_LIMIT |
| 05:08–06:08 | Done rows date groups/counts and Early/Late/On Time colored pills | ReportsOverviewView date groups and status values; badge/pill composition missing | GAP_B27 |
| 05:08–06:08 | Done task can be Early with 0min Taken, On Time separate status | reporting.rs completion_timing from task EST minus Taken, zero tracked time allowed | PRESENT_DOMAIN / SOURCE_DATA_LIMIT |
| 05:08–06:08 | Done list internal scroll, separate Reports page outer scroll | reportsOverview.css done-list height/overflow | PRESENT_CODE_ONLY |
| 06:08–06:47 | Punctuality 32.48% Early/67.52% Late weighted by variance time not task count | reporting.rs sum early_seconds/late_seconds and ratio, OnTime contributes zero variance | PRESENT_SEMANTICS / SOURCE_DATA_LIMIT |
| 06:47–06:56.30 | Recap/outro | No Narro product interaction requirement | EXCLUDED_SCOPE |

**V08 closure:** This video does not require a new B finding. Important numerator differences are intentional: `Most Productive day` in `docs/PRODUCT_SPEC.md`/UI_UX_SPEC is highest **focus-session count**, and Rust uses count primary, duration tie-break—do not misclassify transcript phrase 'greatest accumulated activity' as an independently proved highest-duration contract. Source one-decimal tooltip components may not add after rounding (5.6 + 0.2 vs5.7); no defect from arithmetic on rounded labels. Time By List allocates only work sessions and headline includes work+break, providing explanation for VE012 1.6hr difference but NOT erasing VE011 older contradictory state. B30/B28/B27 retained; no candidate tests/native acceptance performed.
## VE-013 — Subtasks — REVIEWED 2026-10-08

Canonical full VE013 Pass-3 source was already reviewed frame-by-frame. This pass checks its chronological control/interaction claims against production code; no new raw video or native app run.

| Time | Source action | Narro code route | Status |
| --- | --- | --- | --- |
| 00:00–00:16 | Board three parent tasks, Today 0/3 Done, independent subtask counts | ListBoard/TaskCard count models | PRESENT_CODE |
| 00:16–00:18 | Hover expands subtasks inline, plus, title input/X, circular progress | TaskSubtasks inline, B12 controls and B60 ring open | GAP_B12_B60 |
| 00:18–00:31 | Enter two subtasks successively, keep editor; 0/1→0/2, parent 0/3 | ListBoard.submitSubtaskCreate clears draft, retains panel and parent count | PRESENT_FUNCTION |
| 00:32–00:45 | Arrow reorder/Delete ordinary row, 0/2→0/1 without confirmation | TaskSubtasks arrows/delete, Rust mutations | PRESENT_CODE |
| 00:48–00:58 | Complete one subtask 0/1→1/1, parent stays pending | TaskSubtasks completion/progress, B60 Board shape | PRESENT_MODEL_GAP_B60 |
| 01:00–01:10 | Focus same live task; expanded done Coffee and plus | FocusLiveSubtasks circular header/TaskSubtasks nested row | PRESENT_CODE |
| 01:10–01:12 | Panel→Floating continuous geometry morph ~0.25–0.35sec | Tauri mode transition; opposite-direction C4 physical FAIL separate | M7_MOTION_OPEN |
| 01:12–01:18 | Floating subtask ring, plus, expanded panel; add Another call 1/1→1/2 | FocusLiveSubtasks floating create+refresh and sizing | PRESENT_CODE_PHYSICAL_OPEN |
| 01:18–01:32 | Floating row up/down/delete icons visible; no committed move/delete shown | FocusLiveSubtasks floating action buttons | PRESENT_SOURCE_LIMIT |
| 01:32–01:34 | Floating back towards Board via nearby cut | Focus return routing, exact time unknown | SOURCE_EDIT_LIMIT |
| 01:34–01:47 | Revisited Board retains Coffee done, Another call pending | Subtask store/Board refresh persistence path | PRESENT_CODE |
| 01:34–01:47 | Notion-linked row source icon replaces trash | Remote-linked Notion integration excluded | LOCAL_ONLY_DEVIATION |
| 01:47–02:04 | External Notion checkbox sync mirrored on Floating | Cloud sync excluded, latency not measurable | EXCLUDED |
| 02:04–02:20 | Integration roadmap narration and outro | Not product parity controls | EXCLUDED |

**V09 result:** No new B ID. B12 input/add composition and B60 circular ring already capture Board gaps. Focus and Floating have ring headers and subtask controls; Focus expanded panel reuses horizontal TaskSubtasks progress, requiring later rendered comparison, not a new unverified B. Task Done and subtask Done remain independent. Cloud sync is excluded. M7 C4 still fails on opposite Timer→Panel native presentation, not validated by source Panel→Floating. Tests/CI/Windows/source pixel PASS NOT RUN.
## VE-014 — Preferences — REVIEWED 2026-10-08

Canonical VE-014 full 02:48.484/60fps Pass-3 previously inspected. This review maps its chronological source-record controls against current production code without replaying source MP4. Older macOS-era option inventory and Focus cog view are superseded by current SS-C07/C08/C09 and SS-H05; direct video interaction/motion evidence remains useful where not contradicted.

| Time | Source action/state | Narro code route | Disposition |
| --- | --- | --- | --- |
| 00:00–00:10.7 | Board settings cog entry | AppShell utility navigation to Settings destination | GAP_B34 |
| 00:10.8–00:12 | Fast board dim and overlaid Preferences | AppShell replaces body with ThemeSettingsPanel, no backdrop/dialog/close | GAP_B34 |
| 00:14.8–00:18 | Narrow Focus cog Preferences in older tutorial | Modern FocusQuickPreferences distinct from full Preferences | VERSION_SUPERSEDED_SS_H05 |
| 00:20–00:29 | Screen 1 thumbnail/bright border/1470×956 | Full Preferences uses monitor text select; Focus Quick Preferences has thumbnails | GAP_B21 |
| 00:29–00:35 | Left/Right side segment; right-docked Panel later shown | BlitzPanelPreferenceSection focusPanelSide save/pressed state | PRESENT_CODE_NATIVE_GATE_SEPARATE |
| 00:36–00:44 | System/Dark/Light changes in-place | ThemeSettingsPanel/ThemeRuntime saves and applies root theme | PRESENT_CODE_ONLY |
| 00:48–01:00 | Hide EST/done times contextual Focus disclosure | GeneralPreferenceRows/FocusPanel hideTaskTimes projection | PRESENT_CODE_EDIT_LIMIT |
| 01:00–01:03 | Pomodoros ON reveals two nested controls rapidly | LowerPreferenceSections always renders disabled children | GAP_B17 |
| 01:03–01:10 | Independent Work Sprint 30 and Break Time 10 presets | Separate pomodoroWorkSeconds/pomodoroBreakSeconds and DurationSelect | PRESENT_CODE_ONLY |
| 01:10–01:19 | Default break length separate; scrolling title ON | Independent defaultBreakSeconds and FocusLiveTitle scroll switch | PRESENT_CODE_ONLY |
| 01:24–01:33 | Timed alerts parent reveals nested choices | Alert detail Rows always visible when parent OFF | GAP_B17 |
| 01:24–01:33 | Alert interval changed to 30 and retained | Task alert duration select supports 30 minutes | PRESENT_CODE_ONLY |
| 01:33–01:52 | Task sound selector plus dedicated preview triangle | SoundPreferenceControl select and preview owner | PRESENT_CODE_ONLY |
| 01:33–01:52 | Speaker opens vertical anchored volume slider | SoundPreferenceControl permanent horizontal range without speaker popover | GAP_B18 |
| 01:32–01:56 | Finite violet/pink wash of active Focus card (~0.5–0.7s) | 560ms TimedAlertFlashRuntime targets timer text; CSS only color/text-shadow | NEW_GAP_B69 |
| 01:56–02:06 | Notification Alerts separate parent and sound control | Distinct notificationSound/volume, child visible disabled while parent OFF | GAP_B17_WITH_PRESENT_MODEL |
| 01:56–02:06 | Older notification hierarchy lacks newer Schedule reminders | Current SS-C08 governs; Narro has schedule-reminder parent and lead | VERSION_SUPERSEDED_SS_C08 |
| 02:06–02:13 | Show success screen parent and nested Fun GIF | Persistent showSuccessScreen/funGif; full Preferences GIF child always shown disabled | GAP_B17 |
| 02:06–02:13 | Success sound effect independently enabled | Celebration sound selector/volume lacks enable flag/toggle | GAP_B9 |
| 02:13–02:21 | Success screen with and without reaction GIF | FocusCompletionSuccess opaque dialog, no funGif media use | GAP_B63_B64 |
| 02:13–02:21 | Well done, task title, Next Task and break option | FocusCompletionSuccess UI has Next Task; Take a Break disabled pending product decision | PRESENT_CODE_B37_LIMIT |
| 02:21–02:28 | Victory Bell select and independent play preview | Local catalog Victory Bell and preview code present; enable gap remains | PRESENT_SOUND_GAP_B9 |
| 02:28–02:44 | Internal Preferences scrolling with retained choices | Preference snapshot persists; exact modal scroll container missing | PRESENT_MODEL_GAP_B34 |
| 02:44–02:48.48 | Tutorial end card | Out of product UI scope | EXCLUDED |

**V10 closure:** 24 time-local code claims. Previously known B9/B17/B18/B21/B34/B63/B64 and B37 decision preserved. **New B69** is narrowly code-confirmed: Blitzit video shows finite violet/pink live-card wash while Narro changes only timer text accent/shadow. The source and production effects are similar duration, not equivalent visual targets. Keep PREF-R02 effect timing and reduced-motion evidence. Preference→Focus tutorial crossfades are edited and do not measure application transitions. No raw MP4 rerun, tests, CI, physical or source-visual acceptance performed.
## VE-007 — Schedule Task Reminders — REVIEWED 2026-10-08

Canonical VE-007 02:52.803, 60fps full-video Pass-3 analysis already source-complete. This pass maps each time-local source interaction to current production TSX + Rust scheduling/domain/persistence. Older June 2025 tutorial precedes current screenshots; labels and observed state carry older-video source-precedence caveat. No raw MP4 repeat.

| Time | Source action/state | Narro route | Disposition |
| --- | --- | --- | --- |
| 00:00–00:12 | TYAMA board, original Call with Pete unscheduled This Week | ListBoard manual lane + task aggregate model | PRESENT_MODEL_ONLY |
| 00:12–00:19 | Hover action rail, menu Schedule/Change list/Duplicate/Delete | TaskCard TaskActionRail/TaskOverflowMenu + TaskScheduleDialog trigger | PRESENT_CODE_MENU_SEPARATOR_GAP_B48 |
| 00:12–00:19 | Schedule opens over dimmed board, fast local modal | TaskScheduleDialog backdrop/role dialog but source inner wizard missing | PRESENT_SHELL_GAP_B19 |
| 00:19–00:52 | Initial compact calendar, Monday-first month grid and today/selected markers | TaskScheduleDialog native date input in single combined form | GAP_B19 |
| 00:19–00:52 | Today/Later Today/Tomorrow/Next Week quick labels | ScheduleShortcut buttons + Rust resolve_schedule_shortcut | PRESENT_CODE_TRANSCRIPT_CALC_LIMIT |
| 00:19–00:52 | Cancel + Next to details in same modal | TaskScheduleDialog no Next step, immediate Schedule/Repeat panels | GAP_B19 |
| 00:52–01:05 | Pick Date back link and selected-date summary | TaskScheduleDialog date summary but no return-to-calendar step | GAP_B19 |
| 00:52–01:05 | Date-derived No Repeat/Every day/Every weekday/Every Saturday/Every month on 14th presets | TaskScheduleDialog fixed recurrence select labels, No Repeat only on existing rule | GAP_B19_B33 |
| 00:56–01:04 | Add Time +ADD expands hour/minute/AM-PM and ×REMOVE | TaskScheduleDialog native time input behind Add a specific time checkbox | GAP_B19 |
| 01:05–02:00 | No Repeat remains selected, descriptions of recurrence generation | Existing scheduling/recurrence service handles recurrence, but no selected or committed source occurrence | PRESENT_DOMAIN_TRANSCRIPT_LIMIT |
| 02:00–02:01 | No Repeat date-only Schedule closes editor and commits without confirmation | updateTaskSchedule + CAS Rust update_task_schedule_if_expected, ListBoard refresh | PRESENT_CODE_ONLY |
| 02:01–02:13 | This Week 0/6→0/5; scheduled next-week task in Backlog | scheduling.effective_planning_lane_at classifies date beyond this week to Backlog | PRESENT_DOMAIN_ONLY |
| 02:01–02:13 | Backlog gets 1 Scheduled tasks backlog subheading and 14th task badge | BoardLane flat task rows with date metadata but no subgroup/short badge | GAP_B40 |
| 02:01–02:13 | Total pending tasks remains seven; task identity retained | Schedule mutation updates schedule fields only, preserves ID/other task fields | PRESENT_MODEL_ONLY |
| 02:13–02:22 | Update Schedule plus 14th June detail X and dividers in overflow | TaskOverflowMenu Update Schedule exists, no schedule detail/X; editor Unscheduled alternative | GAP_B42 |
| 02:22–02:25 | Update Schedule reopens populated *second step*, Pick Date returns calendar | TaskScheduleDialog loads existing schedule, single page, no wizard step | GAP_B19 |
| 02:25–02:28 | Cancel editor without mutation, prior date label remains | TaskScheduleDialog onClose discards draft; no mutation until save | PRESENT_CODE_ONLY |
| 02:28–02:29 | Schedule-detail X removes schedule immediately without confirmation | TaskOverflowMenu lacks X, only editor Unscheduled then Save | GAP_B42 |
| 02:29–02:33 | Unschedule preserves task but places ordinary task into Backlog, not original This Week | Rust update_task_schedule_if_expected preserves manual_lane=ThisWeek; unscheduled effective_planning_lane returns that manual lane | NEW_B70_OLDER_VIDEO_SEMANTIC_LIMIT |
| 02:33–02:42 | Unscheduled task has no date or subgroup; title/list/metrics intact | Rust schedule None clears scheduling fields; TaskCard hides date badge | PRESENT_MODEL_B70_LANE_DIFF |
| 02:42–02:52.80 | Narration/outro, no further product state | Out of UI parity scope | EXCLUDED |

**V11 closure:** 21 time-local comparisons. B19 two-step calendar/details/modal and Add Time fields, B33 date-derived recurrence presets, B40 scheduled section, B42 schedule-detail X, B48 destructive separator all pre-existing; not double-counted as new. **New B70** is a source-observed post-unschedule lane discrepancy: video takes task initially in This Week into scheduled next-week Backlog, then removing schedule leaves the ordinary task in Backlog. Narro Rust scheduling mutation changes schedule fields only, preserves manual_lane, and effective_planning_lane_at for no schedule returns that original This Week. This is CODE_CONFIRMED against an older tutorial, not yet a directive to mutate validated manual-lane/identity invariants; reconcile source-version and physical expectations before remediation. The four shortcut calculations and recurring occurrence generation in this video are narration-only and were not elevated to direct observation. Automated tests, source-visual/native Windows validation and raw video replay NOT RUN.
## VE-008 — Recurring Task Setup — REVIEWED 2026-10-08

Source VE-008 full MP4 02:46.905/60fps already covered by Pass-3; video-to-code analyzes canonical chronological record, current TSX, Rust recurrence persistence/materialization, scheduling, and board projection. No raw-video replay, build, or native validation.

| Time | Direct source state or action | Production code route | Disposition |
| --- | --- | --- | --- |
| 00:00–00:26 | TYAMA 9 pending, This Week 0/6, Today 0/1; Check emails ordinary This Week | ListBoard standard lane snapshot/TaskCard | PRESENT_MODEL_ONLY |
| 00:26–00:33 | Ordinary task overflow Schedule opens date picker | TaskCard Schedule action and TaskScheduleDialog | PRESENT_CODE_GAP_B19_WIZARD |
| 00:33–00:37 | June 16 selected cyan/lime on full calendar | Native input type=date and one-page schedule UI | GAP_B19 |
| 00:37–01:11 | Date→details Pick Date/Add Time/Recurring same modal | Schedule and Repeat always visible together, separate save buttons | GAP_B19 |
| 00:37–01:11 | No Repeat / Every day / Every weekday / Every Monday / Every month on16th | TaskScheduleDialog fixed Weekly on start weekday and Monthly on start date labels | GAP_B33 |
| 01:11–01:16 | Every weekday selected, Schedule commit | saveTaskRecurrence + recurrence draft weekday mask + materialize after commit | PRESENT_FUNCTION_ONLY |
| 01:16–01:33 | Check emails becomes Backlog Recurring tasks parent | recurrence::normalize_parent_as_backlog; BoardLane flat, no dedicated parent subsection | GAP_B39_PRESENT_DOMAIN_PLACEMENT |
| 01:16–01:33 | Parent displays Weekdays rule, recurring icon | TaskCard::recurrenceLabel returns generic Repeats | GAP_B41 |
| 01:16–01:33 | Today gets one generated child; This Week gets four scheduled children | recurrence materialization and scheduling date-based effective lane | PRESENT_DOMAIN_NOT_NATIVE_VALIDATED |
| 01:16–01:33 | This Week heading 4 Scheduled tasks this week | BoardLane has no subgroup and only flat lane count | GAP_B40 |
| 01:16–01:33 | Pending total 9→13: recurring parent excluded, 5 generated children count | active_tasks_in_bucket includes linked parent; LaneAccumulator.finish counts all active rows, so 9→14 if five children | NEW_B71_PARENT_PENDING_COUNT |
| 01:33–01:54 | Child tasks have normal rail/title/EST/Time Taken and own schedule | TaskCard same ordinary controls for recurrence occurrence IDs | PRESENT_CODE_ONLY |
| 01:54–02:00 | Complete one child; total pending 13→12 and scheduled heading 4→3 | completeListBoardTask persisted; flat BoardLane lacks scheduled subgroup count, parent still counted | PRESENT_COMPLETION_GAP_B40_B71 |
| 01:54–02:00 | Completed child in Done, parent stays linked and other children intact | complete task storage and recurrence parent linkage separate | PRESENT_DOMAIN_ONLY |
| 02:00–02:08 | Child Update Schedule and date row with circle X | TaskOverflowMenu Update Schedule only, no date/X shortcut | GAP_B42 |
| 02:08–02:13 | Child prepopulated schedule edited to another already-occupied Thursday | TaskScheduleDialog reads child schedule; updateTaskSchedule saves independent child | PRESENT_FUNCTION_GAP_B19 |
| 02:08–02:13 | Two same-title children coexist on Thursday; 3 scheduled this week remain | Independent child identities and date scheduling; no uniqueness-by-date invariant | PRESENT_DOMAIN_ONLY |
| 02:13–02:22 | Child schedule X removal, toast Removed schedule from task; 3→2 subsection count | Editor Unscheduled via CAS exists; no quick-X or source subgroup | GAP_B42_B40 |
| 02:13–02:22 | Unscheduling child preserves its identity and overall pending count | Rust schedule update fields only, no task deletion | PRESENT_DOMAIN_ONLY |
| 02:22–02:25 | Parent menu Remove Recurring/Change list/Duplicate/Delete | TaskCard parent overflow generic Update Schedule, no recurrence-specific action | GAP_B45 |
| 02:22–02:25 | VE017 newer parent menu adds Update Recurring, unlike this tutorial | Version precedence recorded; do not falsely demand missing older-only exact list | VERSION_LIMIT_VE017 |
| 02:25–02:27 | Remove Recurring detaches parent to ordinary Backlog and leaves children | Rust remove_recurrence_if_expected preserves/detaches children by default; parent normalized Backlog | PRESENT_DOMAIN_GAP_B45_CONTROL |
| 02:25–02:38 | Parent becomes countable again; pending rises one; children persist | Narro already counts parent while linked, so expected +1 accounting change absent | NEW_B71_DETACH_TRANSITION |
| 02:38–02:46.9 | Tutorial recap/outro, no further product state | Excluded | EXCLUDED |

**V12 closure:** 24 time-local claims. B19/B33/B39/B40/B41/B42/B45 pre-existing and retained, historical M4 persistence/recurrence safety preserved. **New B71**: source current-workweek arithmetic proves active recurrence parent excluded from pending counts (9−1+5=13), then detached parent counts again; `active_tasks_in_bucket` still returns parent with `recurrence_rule_id`, `LaneAccumulator.finish` counts it in `tasks.len`, resulting an extra pending entry during active recurrence. This is a code-confirmed domain/presentation projection gap; correcting must retain parent visibility in a separate Recurring group, avoid adding/removing domain identities, and reconcile Home/list totals/Focus eligibility without changing historical recurrence materialization. Source does not time-lapse next-week regeneration; VE017 stronger for parent action menu, do not infer early-version exact parent menu parity. Tests/CI/native parity/source visual checks NOT RUN.
## VE-009 — Custom Recurring Schedules — REVIEWED 2026-10-08

Canonical VE-009 entire 02:39.893/60fps source Pass-3 has been reviewed previously; this implementation reconciliation maps its chronological evidence against TaskScheduleDialog/TaskCard/ListBoard and Rust recurrence. No original raw MP4 replay.

| Time | Source state/action | Narro route | Disposition |
| --- | --- | --- | --- |
| 00:00–00:28 | PLATA board, Team meeting ordinary Today task; Schedule menu | ListBoard/TaskCard ordinary rail/schedule | PRESENT_CODE_ONLY |
| 00:31–00:35 | September 12 today marker, selected Sunday14 in first-step calendar | TaskScheduleDialog native date input not full dual-marked calendar | GAP_B19 |
| 00:35–00:40 | Second scheduler step + Custom nested disclosure under recurrence | TaskScheduleDialog separate Repeat section with pattern select and custom subform | GAP_B19_B33 |
| 00:40–00:59 | Count/unit day→3 days and live every 3 days summary | customInterval/customUnit supported; no live natural-language Custom summary | PRESENT_DOMAIN_GAP_B33 |
| 00:40–00:59 | Day/week/month/year dropdown, singular/plural grammar | customUnit supports day/week/month/year; fixed unit option labels with (s) | PRESENT_MODEL_COPY_GAP_B33 |
| 01:11–01:30 | Week unit exposes seven Sunday→Saturday circular weekday chips | TaskScheduleDialog customUnit week shows Monday-first checkbox fieldset | GAP_B33_CONTROL_GRAMMAR |
| 01:11–01:30 | 3 weeks Monday then 4 weeks Monday+Friday in-place summary | weekdayMask and interval support, no corresponding plain-language text | PRESENT_DOMAIN_GAP_B33 |
| 01:31–01:54 | Month unit replaces weekdays with date vs 2nd Sunday alternatives | customMonthPattern date or selected weekdays; no ordinal nth-weekday model | GAP_B20 |
| 01:31–01:54 | 4 months on 14th and 4 months 2nd Sunday summaries dynamically change | monthDay supported; nth-weekday missing; Custom human summary missing | GAP_B20_B33 |
| 01:54–02:08 | Year mode suppresses repeat-on, 4 years shown with live summary | customUnit year hides month/week controls, no live summary | PRESENT_MODEL_GAP_B33 |
| 02:08–02:13 | Demo 4 years→4 days→1 day, final committed Custom every day | Custom day interval1 available; do not treat prior examples as committed | PRESENT_MODEL_SOURCE_SCOPE |
| 02:11–02:15 | Rapid edited Schedule/Board alternate frames around commit | No trustworthy source animation duration; code async save/refresh | SOURCE_CUT_UNMEASURABLE |
| 02:15–02:18 | Recurring parent Team meeting in Backlog Recurring tasks group, Custom label | Rust normalize_parent_as_backlog; BoardLane flat, TaskCard label Repeats | GAP_B39_B41 |
| 02:15–02:18 | One visible Sun child in This Week scheduled section | recurrence materialization/effective date projection; no subgroup count | PRESENT_DOMAIN_GAP_B40 |
| 02:15–02:18 | Today 0/4→0/3; source 8 pending excluding parent | Board Today parent normalized Backlog; linked parent still included in Backlog.count | GAP_B71 |
| 02:15–02:18 | Created recurring tasks successfully toast | ListBoard onCommitted Task recurrence created, different source copy | LOW_COPY_DIFFERENCE_EXISTING_B19 |
| 02:18–02:27 | Parent plus child persist; future horizon not demonstrated | recurrence service creates in current window, but full future lifetime not proven by video | PRESENT_DOMAIN_SOURCE_LIMIT |
| 02:27–02:39.89 | Outro | Non-product | EXCLUDED |

**V13 closure:** 18 time-local claims. Existing B19 full two-step calendar, B20 missing nth-weekday ordinal monthly model, B33 live Custom summaries/date-specific labels, B39 recurring-parent group, B40 scheduled subsection, B41 cadence badge, and B71 parent pending-count bug cover the evidenced discrepancies; **no new B ticket**. The video demos 3-day/4-week/4-month/4-year variants, but only commits **Custom 1 day**. The Schedule/board alternation is tutorial editing, not application motion. Historic scoped recurrence engine PASS remains separate; no tests/CI/Windows/source visual acceptance performed.
## VE-010 — Notes — REVIEWED 2026-10-08

Canonical VE-010 01:13.561/60fps full-video Pass-3 reviewed previously; mapped source chronological interaction and motion notes against FocusLiveActions/FocusPanel, TaskNotes and CSS. Not a raw MP4 replay.

| Time | Source action/state | Narro production route | Disposition |
| --- | --- | --- | --- |
| 00:00–00:21 | Today Focus live count-up Finish the video + Send press-release queued | FocusPanel live-card and remaining-task queue | PRESENT_CODE_ONLY |
| 00:21–00:24.5 | Live-card hover shows Break/Notes/Pause/Skip/Done icon strip | FocusLiveActions controls exist; live rest/title/time/action composition differs | GAP_B49 |
| 00:21–00:24.5 | Hovered Notes icon expands to Notes label pill without overall width change | FocusLiveActions Notes control text and separate action style; source icon-to-label rest/hover grammar differs | GAP_B49 |
| 00:24.5–00:25.1 | Notes expands live card inline, queued task moves below | FocusLiveActions notesExpanded with div.focus-panel__notes within card | PRESENT_CODE_ONLY_MOTION_UNVALIDATED |
| 00:25–00:30 | Task title retained, pencil, toolbar divider and lower-right circular Close | TaskNotes toolbar/edit content exists; source lower-right close X differs from Narro edit shell | GAP_B26 |
| 00:25–00:30 | Toolbar order B/Italic/Strike/Bullets/Numbers/Undo/Redo | TaskNotes RichNoteEditor order matches seven controls | PRESENT_CODE_ONLY |
| 00:25–00:30 | Multiline editor Feels so good within live card | TaskNotes contenteditable with persistent document state | PRESENT_CODE_ONLY |
| 00:30–00:45 | Select text then apply Bold; Bold selected styling | TaskNotes formatting command bold/selection and toolbar UI; precise selected appearance unverified | PRESENT_CODE_ONLY |
| 00:30–00:45 | Italic/Strike/List/Undo/Redo exposed; no equal before-after proof each | TaskNotes implements commands, but tutorial source only exposes others | EVIDENCE_LIMIT |
| 00:45–00:50 | https://www.blitzit.app auto-linked inline on typing | TaskNotes autoLinkEditorUrls, safeExternalUrl, linked editor runs | PRESENT_CODE_ONLY |
| 00:50–00:52 | Hand cursor over link; Safari opens as external browser | TaskNotes links and Tauri openUrl on explicit interaction; external-app context preserved | PRESENT_MANUAL_LINK |
| 00:50–00:52 | Narration claims links auto-open on live, but pointer is on URL immediately prior | No auto-open-on-live source proof; do not add automatic browser launch based on this tutorial | SOURCE_AMBIGUOUS_NO_NEW_GAP |
| 00:52–01:01 | Browser loads while Focus stays visible, no Notes page replacement | Narro opens URL externally from Notes; native window compositing must be separately tested | PRESENT_CODE_NATIVE_OPEN |
| 01:01–01:13.56 | Outro | Not product UI | EXCLUDED |

**V14 closure:** 14 time-local claims, existing B26 (Notes lower-right X control) and B49 (rest→hover icon-to-label live-card action strip) account for code-confirmed discrepancies; no novel ticket. RichNoteEditor toolbar offers source seven commands and automatic safe HTTP(S) link detection and explicit external URL opening. Source **does not demonstrate** narrated automatic URL open-on-task-live: pointer sits over URL immediately prior to Safari opening, so no such behavior is accepted or requested. The ~66.7ms sampled editor expansion is source-video bound, not native Windows timing PASS. Tests/CI/raw video replay/physical and rendered visual validation NOT RUN.
## VE-004 — Getting Started — REVIEWED 2026-10-08

Full canonical original video already Pass-3 SOURCE_COMPLETE; the following are source-timed implementation comparisons, not raw MP4 reruns. Older v2.4.x version-specific commerce/account and copy never supersede current source screenshots.

| Time | Source state/action | Narro production route | Disposition |
| --- | --- | --- | --- |
| 00:00–00:39 | Windows/macOS marketing/download page | External distribution context, not local UI | EXCLUDED_LOCAL_ONLY |
| 00:39–01:24 | Account signup/email verification/Trial onboarding v2.4.68 | Narro local-only architecture intentionally has no cloud signup | EXCLUDED_INTENTIONAL |
| 01:24–01:35 | No-list Home first-use CTA | HomeDashboard no-lists Create your first list callback | PRESENT_CODE_COPY_DIFF_VERSION |
| 01:35–01:43 | Create List modal, icon initial and selected color swatch | ListEditorModal modal/color presets exist; B3/B7/B8 source control gaps | PRESENT_SHELL_GAPS_B3_B7_B8 |
| 01:43–01:49 | Tutorials card 0 pending, ALL CLEAR, list overflow | HomeDashboard card and Edit/Duplicate/Archive menu; empty copy differs | PRESENT_CODE_ONLY |
| 01:49–02:03 | Backlog/This Week/Today/Done empty board, All Clear | ListBoard 4 lanes and empty states; source empty-lane copy B61 | GAP_B61 |
| 01:49–02:03 | No Today eligible task, muted bottom Blitzit Now CTA | BlitzEntryButton vivid except pending; no eligibility-facing muted treatment | GAP_B62 |
| 02:03–02:11 | Board list-scope selector All Lists/Tutorials compact menu | ListBoard native select targets proper list, visual popup missing | GAP_B24 |
| 02:11–02:26 | Today inline create title/EST/Confirm and task appears | ListBoard InlineCreateEditor and createListBoardTask, different source composition | PRESENT_DOMAIN_GAP_B52 |
| 02:11–02:26 | Pending 0→1 Today 0/0→0/1 on create | ListBoard snapshot counts and refresh after create | PRESENT_DOMAIN_ONLY |
| 02:11–02:26 | Task hover circle, Subtasks, Notes, lane arrows, overflow | TaskCard TaskActionRail present; divider B48 remains | PRESENT_CODE_GAP_B48 |
| 02:26–02:32 | Tutorial cut Promo video→Script/Recording voice/Editing | No contiguous user task mutation observed | SOURCE_CUT_UNMEASURABLE |
| 02:32–02:38 | Today Blitz entry auto-starts top task, count-up without EST | BlitzEntryButton/start eligibility, Focus timer count-up branch | PRESENT_DOMAIN_SOURCE_MOTION_OPEN |
| 02:38–02:55 | Focus queued order/Make live/inline Add Task | FocusPanel queue/Task creation, live-hover source styling mismatches inherited | PRESENT_CODE_GAP_B49 |
| 02:55–03:04 | Panel→Floating morph persists same Script identity | FocusSurfaceCoordinator/FloatingTimerFoundation native morph, stronger VE013 source timing | PRESENT_CODE_NATIVE_OPEN |
| 03:04–03:18 | Floating actions hover expands Skip pill | FloatingActionButton label on hover CSS/selected; source-vs-native physical open | PRESENT_CODE_ONLY |
| 03:18–03:23 | Floating Done→Focus success with GIF, Next Task, Take a Break | FocusCompletionSuccess overlay omits GIF and source in-card arrangement, break disabled | GAP_B63_B64_B37 |
| 03:18–03:23 | Onboarding coaching bubble for Next Task | Old onboarding-only prompt, not normal success requirement | EXCLUDED_VERSION |
| 03:23–04:09.87 | Recap, trial/pricing, outro | Commerce/history out of local-only parity | EXCLUDED |

**V15 closure:** 19 claims. Existing B3/B7/B8 list color; B24 list selector; B48 overflow separator; B49 Focus hover; B52 inline task creation; B61/B62 no-eligible empty presentation; B63/B64 success overlay/media and B37 break source limit. Auth/trial/marketing/cloud onboarding intentionally excluded from local-only architecture. Tutorial staging cut 1→3 tasks isn't a hidden operation, and VE003/013 remain stronger for Panel/Floating geometry timing. No new B; native/source visual PASS NOT RUN.
## VE-006 — Delete & Archive — REVIEWED 2026-10-08

Full canonical original video already Pass-3 SOURCE_COMPLETE; the following are source-timed implementation comparisons, not raw MP4 reruns. Older v2.4.x version-specific commerce/account and copy never supersede current source screenshots.

| Time | Source state/action | Narro production route | Disposition |
| --- | --- | --- | --- |
| 00:00–00:10 | Personal list 5 pending, This Week 0/5 | ListBoard lane count + projected pending | PRESENT_DOMAIN_ONLY |
| 00:10–00:18 | Task Delete starts inline Confirm + X cancellation inside overflow | TaskCard InlineDeleteConfirmation, no separate modal | PRESENT_CODE_ONLY |
| 00:18–00:21 | Confirm deletes exactly one pending, 5→4 and 0/5→0/4 | permanentlyDeleteListBoardTask + board refresh | PRESENT_DOMAIN_ONLY |
| 00:18–00:21 | No recovery and Reports exclusion claimed in narration | No visible recovery experiment/Reports check in video | SOURCE_TRANSCRIPT_LIMIT |
| 00:26–00:35 | Home grid All Lists 25 pending including active ClickUp 3 | HomeDashboard and home_snapshot active lists | PRESENT_DOMAIN_ONLY |
| 00:35–00:37 | ClickUp card Archive List directly, no second dialog | HomeDashboard menu onArchive, archiveListFromSettings immediate | PRESENT_CODE_ONLY |
| 00:36.5–00:40 | ClickUp disappears active grid, cards reflow, All Lists 25→22 | Home list archive excludes archived list and its 3 tasks; grid rerender | PRESENT_DOMAIN_ONLY |
| 00:44–00:48 | Archived lists / Archived done tasks tabs in Home | ArchivePanel two tabs | PRESENT_CODE_ONLY |
| 00:48–00:59 | Populated Archived Lists ClickUp card previews preserved tasks | ArchivedListsPanel summary cards do not expose source task previews | GAP_B10 |
| 00:48–00:59 | Unarchive / Delete Forever visible, neither committed in source | ArchivedListsPanel action controls; no execution result proof | PRESENT_CODE_SOURCE_LIMIT |
| 00:59–01:04 | Archived Done search, All Lists badge filter, Task Name/List/Info/Date/Action | ArchivedDoneTasksPanel uses simplified read-only rows, missing source table grammar | GAP_B11 |
| 01:04–01:10 | Struck completed title, list badge, Info icon/No Info, date, trash | ArchivedDoneTasksPanel missing source Info/Action controls | GAP_B11 |
| 01:04–01:10 | Archived Done trash shown but never clicked | No source post-trash mutation contract, do not infer one-click deletion | SOURCE_INTERACTION_LIMIT_B11 |
| 01:04–01:10 | 60-day auto-archive narrated; visible rows aged 2mon/3mon | Source does not capture threshold crossing, no direct timing gate | SOURCE_TRANSCRIPT_LIMIT |
| 01:10–01:23.96 | Recap/outro | Non-product | EXCLUDED |

**V16 closure:** 15 claims. Task Delete uses observed inline confirm; list Archive applies directly, excluding archived list's 3 pending from active 25→22. Existing B10 archived-list task previews and B11 Archived Done table controls remain. Neither Unarchive, Delete Forever nor Archived Done trash was clicked in source; 60-day transition is narration with age corroboration, not observed automation. No new B; physical/destructive validation and source parity NOT RUN.
## VE-017 — Update Recurring Schedules — REVIEWED 2026-10-08

Canonical full MP4 was independently Pass-3 SOURCE_COMPLETE previously; this is time-local source-to-production code inspection only, no raw MP4 re-review.

| Time | Source state/action | Production route | Disposition |
| --- | --- | --- | --- |
| 00:00–00:23 | Daily linked parent in Backlog Recurring tasks and six This Week children | Rust parent normalization/materialization, BoardLane flat no scheduled/recurring grouping | GAP_B39_B40 |
| 00:34–00:39.6 | Parent menu Update Recurring / Remove Recurring / Duplicate / Delete | TaskCard generic Update Schedule, no direct Remove Recurring | GAP_B45 |
| 00:39.8–00:48 | Update existing daily rule; presets No Repeat/Every day/weekday/date/Custom | TaskScheduleDialog existingRule prefill/inferPreset, fixed date-derived labels | PRESENT_MODEL_GAP_B33 |
| 00:39.8–00:48 | Custom week selects Fri/Sat/Sun and live phrase every week on Fri/Sat/Sun | custom week weekdayMask persisted; no live natural-language preview | PRESENT_DOMAIN_GAP_B33 |
| 00:48–00:52 | Neutral Replace existing tasks(7) appears only for linked update | TaskScheduleDialog existingRule && preset != none shows Replace checkbox and eligible count | PRESENT_CODE_ONLY |
| 00:52–00:54 | Replace+Schedule changes six scheduled This Week to three Fri/Sat/Sun and toast | Rust replace_existing_tasks_if_expected and materialize_after_commit; board group missing | PRESENT_DOMAIN_GAP_B40 |
| 00:54–01:13 | Narration says unchecked replace preserves older children, not directly committed in this branch | Existing replaceExisting false update path, source action not direct | SOURCE_TRANSCRIPT_LIMIT |
| 01:14–01:29 | Reopen Custom→No Repeat: neutral Replace disappears; warm Delete existing tasks(3) shows | TaskScheduleDialog existingRule && preset none shows distinct destructive deleteExisting row | PRESENT_CODE_ONLY |
| 01:29–01:34 | Delete existing+No Repeat removes generated three, keeps parent task ordinary | removeTaskRecurrence deleteExistingTasks; safe deletion protects altered/history tasks | PRESENT_DOMAIN_ONLY |
| 01:34–01:45 | Unselected Delete Existing branch discussed but not committed | Preserve/detach implementation separate, video not direct outcome | SOURCE_TRANSCRIPT_LIMIT |
| 01:45–01:52.5 | Tutorial cut resets linked parent+3 child setup | Source editing/staging, not in-app undo | SOURCE_CUT |
| 01:52.5–01:54 | Direct Remove Recurring detaches parent, preserves three child tasks | Rust remove_recurrence_if_expected(false) detaches children; missing menu action B45 | PRESENT_DOMAIN_GAP_B45 |
| 01:54–02:00 | Detached parent shows ordinary Schedule; new editor starts No Repeat | recurrenceRuleId clears; TaskCard label becomes Schedule; TaskScheduleDialog no old existingRule | PRESENT_CODE_ONLY |
| 01:57–02:00.5 | Recreate Every day after detachment shows no Replace old-child checkbox | TaskScheduleDialog Replace only when existingRule; new rule has no original child linkage | PRESENT_CODE_ONLY |
| 02:00.5–02:02 | New daily recurrence adds to old detached 3, This Week 3→9 | Rust detached children retain identity, new materialization additive; BoardLane no subgroup count | PRESENT_DOMAIN_GAP_B40 |
| 02:02–02:08 | New parent recurrence label Daily on Backlog card | TaskCard label generic Repeats | GAP_B41 |
| 02:08–02:28 | Previously generated child opens own Notes editor | TaskNotes independent per-child record and Focus/Board Notes edit | PRESENT_CODE_ONLY |
| 02:28–02:50 | Future policy commentary/outro | No new direct UI state | EXCLUDED |

**V17 closure:** 18 time-local comparisons. Existing B20/B33/B39–B42/B45 cover the source-visible custom rule, modal, grouped parents and lifecycle menu differences. Replace existing (neutral) vs No Repeat/Delete existing (destructive) code branches and detached old child preservation are already implemented in Rust/TSX; source 3→9 on recreated recurrence is corroboration, not a new persistent data bug. B71 linked-parent pending arithmetic remains separately OPEN. Staged restore is tutorial cut, not Undo; unchecked No Repeat preservation in that same path is narration-only. No new B. No new tests/CI/physical or source-visual acceptance run.
## VE-018 — Daniel's Planning Workflow — REVIEWED 2026-10-08

Canonical full MP4 was independently Pass-3 SOURCE_COMPLETE previously; this is time-local source-to-production code inspection only, no raw MP4 re-review.

| Time | Source state/action | Production route | Disposition |
| --- | --- | --- | --- |
| 00:00–00:39 | Older Home Personal/list selection and task previews | HomeDashboard card/list entry, modern SS supersedes shell | PRESENT_CODE_VERSION_LIMIT |
| 00:39–00:50 | Personal 17 pending, 9h04 weekly, Today 1h30 with 0/6 | ListBoard active snapshot metrics; old This Week aggregate is weekly superset | VERSION_SPECIFIC_WEEKLY_SEMANTICS |
| 00:50–01:10 | Create Hug my dog in This Week and set 24min EST | ListBoard InlineCreateEditor/task EST edit | PRESENT_DOMAIN_GAP_B52 |
| 00:50–01:10 | Pending 17→18, weekly EST 9h04→9h28 | Rust task creation/estimate mutation authoritative aggregate | PRESENT_DOMAIN_ONLY |
| 01:18–01:35 | Move This Week→Today, same task 24min at ordinal4 | TaskCard lane controls and persistence planning-lane mutation | PRESENT_DOMAIN_ONLY |
| 01:18–01:35 | Today estimate 1h30→1h54, while This Week stays 9h28 | Old weekly-superset vs Narro distinct lane; newer unmapped 9.344s clip differs | OLDER_VERSION_CONFLICT_B44 |
| 01:35–02:14 | Today drag Hugo to first priority, aggregates unchanged | ListBoard reorderListBoardTask by task rank and lane | PRESENT_CODE_ONLY |
| 02:14–02:24 | Blitz Now launches top Today Hug countdown at 24min | BlitzEntryButton/start and Focus timer countdown | PRESENT_DOMAIN_ONLY |
| 02:14–02:24 | Focus queue follows reordered Today tasks, Est 1h54/0/7 | FocusPanel board.today projection, task ordering | PRESENT_CODE_ONLY |
| 02:24–02:40 | Break action switches live card to Break/countdown ~10min | FocusLiveActions break starts native timer; source Focus break card presentation differs | GAP_B35 |
| 02:24–02:40 | Focus Est header temporarily 1h54→2h04 during break | FocusPanel currently shows only board.today.aggregateEstSeconds, no active break addition | GAP_B38 |
| 02:24–02:40 | After break, work resumes and Break row appears Done, fraction stays 0/7 | FocusPanel Done renders completed task records, no equivalent Break Done row | GAP_B36 |
| 02:40–02:47 | Hug Done success reaction GIF, early-by-24, Next Task, Take Break | FocusCompletionSuccess no GIF, no early/late copy, Take Break disabled | GAP_B63_B64_B65_B37 |
| 02:40–02:47 | Transient success shows 1/8 despite pre 0/7 and later board 2/7 | Old source anomaly; no rule for new denominator inferred | SOURCE_TRANSIENT_VERSION_LIMIT |
| 02:47–02:55 | Pay electricity bill success early-by-10; 1h30 staged header | CompletionSuccess lacks early copy; estimate from authoritative remaining Today board | GAP_B65 |
| 02:55–03:06 | Board two tasks done, pending18→16, EST9h28→8h54 | Rust task completion and aggregate EST subtraction of 34min | PRESENT_DOMAIN_ONLY |
| 02:55–03:06 | Today completed 2/7, remaining EST1h20, queue tasks reorder kept | ListBoard/Focus board snapshot Today progress and remaining estimate | PRESENT_MODEL_ONLY |
| 02:55–03:06 | Done has two task rows plus Break row but heading counts only two tasks | Current BoardLane Done tasks flat; no Break-in-history visual, B36/B43 | GAP_B36_B43 |
| 02:55–03:06 | Old This Week superset finally reads 2/15, modern lane progression differs | Do not overwrite separate newer planning evidence; B44 remains source-version limited | VERSION_CONFLICT_NO_NEW |
| 03:06–03:33.09 | Recap/outro | No new product UI | EXCLUDED |

**V18 closure:** 20 time-local comparisons. Source 17→18 and 9h04→9h28 then Done 18→16 / −34min is historical. VE018 uses older This Week weekly-superset state and transient success denominator 1/8→2/8 vs board 2/7; a separate 9.344-second planning clip has distinct, unmapped lineage, so neither version is silently used to rewrite modern lane math. Existing B35/B36/B38 break card/history/+10min, B63–B65 success copy/GIF/context, B37 disabled Take Break, B43/B44 Done/week aggregates cover gaps. No new B, no mechanical normalization of transient source anomalies. No new tests/CI/physical or source-visual acceptance run.
## VE-019 — Oct Update — REVIEWED 2026-10-08

Canonical full MP4 was independently Pass-3 SOURCE_COMPLETE previously; this is time-local source-to-production code inspection only, no raw MP4 re-review.

| Time | Source state/action | Production route | Disposition |
| --- | --- | --- | --- |
| 00:00–00:09 | One-click updater popup narrated, not shown | No sourced updater UI interaction contract | SOURCE_TRANSCRIPT_LIMIT |
| 00:09–00:17 | Device Mockups Floating subtask 1/4 ring, plus and chevron | FloatingTimerFoundation/FocusLiveSubtasks shared live timer subtask summary | PRESENT_CODE_ONLY |
| 00:17–00:28 | Disclosure expands Floating vertically, width held; four subtasks | FocusLiveSubtasks controls Floating Timer region resize, preserving top controls | PRESENT_CODE_NATIVE_GEOMETRY_OPEN |
| 00:17–00:28 | Check previews completed, plus inline Enter subtask title* / cancel X | TaskSubtasks editor/input and snapshot in expanded Floating | PRESENT_CODE_ONLY |
| 00:17–00:28 | Hover subtask rows up/down/trash | TaskSubtasks reorder/delete commands and row controls | PRESENT_CODE_ONLY |
| 00:28–00:35 | Collapse restores compact timer; hover Pause labeled pill | Floating action controls/labels plus FocusLiveSubtasks collapse | PRESENT_CODE_ONLY |
| 00:35–01:01 | Old Focus live zero-subtask no first Add, queued zero-subtask can Add | Current FocusLiveSubtasks allows live-first creation; deliberate local/product improvement | INTENTIONAL_MODERN_DIFFERENCE |
| 01:01–01:11 | Top utility cog directly opens Preferences (older modal geometry) | AppShell settings destination, missing full modal shell already B34 | GAP_B34 |
| 01:11–01:28 | Preferences Screen thumbnails, Side and System/Dark/Light segmented | ThemeSettingsPanel/Runtime system/dark/light, full monitor thumbnail B21 | PRESENT_MODEL_GAP_B21 |
| 01:28–01:47 | Selecting Light repaints open Preferences and later board without navigation | ThemeRuntime saves and applies data-theme, persists; full Preferences overlay absent | PRESENT_CODE_GAP_B34 |
| 01:28–01:47 | Light board white task cards, accent Today outline, dark text | CSS data-theme light tokens, current SS-C16 supersedes old exact palette | PRESENT_CODE_VISUAL_OPEN |
| 01:47–01:58 | Light Home lists and hover Open CTA | HomeDashboard list cards themed, later SS-C16 stronger | PRESENT_CODE_VISUAL_OPEN |
| 01:58–02:08 | System theme offered, OS-follow system change never demonstrated | ThemeRuntime system option; no direct OS repaint measured | SOURCE_INTERACTION_LIMIT |
| 02:08–02:18 | Help Center Updates browser navigation | External support site, not desktop UI | EXCLUDED_EXTERNAL |
| 02:18–02:33 | Changelog Nov1 2024 and Windows code-signing narrative | No installer/SmartScreen/certificate interaction observed | EXCLUDED_EVIDENCE_LIMIT |
| 02:33–02:52.99 | Recap/outro | Non-product | EXCLUDED |

**V19 closure:** 16 time-local comparisons. Old Nov2024 Floating subtask and System/Dark/Light evolution already covered by current SS-C18/C20/C07/C16, shared FocusLiveSubtasks code and B21/B34 modal/monitor discrepancies. Original missing first-subtask creation while live is a superseded historical limitation and intentionally not imposed on current Narro; external updater/changelog/certificate statements are not demonstrated desktop UI controls. No new B; verify modern rendered Windows/source styling separately. No new tests/CI/physical or source-visual acceptance run.
## Exact next review

**VIDEO-TO-CODE COMPARISON QUEUE COMPLETE — 19/19, 362 time-local mapped source/code comparisons.** Original raw MP4 Pass-3 forensic coverage separately 19/19; current/Help static screenshot mapping separately 39/39 with 250 control comparisons. All novel confirmed B69/B70/B71 from this continuation are routed into AUDIT_IMPLEMENTATION_CROSSWALK and TODO M8/M5, alongside older B tickets. Documentation-only analysis does **not** close M5/M6/M7/M8/M9 implementation, current-source pixel parity, physical Windows acceptance or any unresolved handoff/manual gate. Next owner: Codex reviews new and existing crosswalk items within roadmap dependency order, implements and tests narrow fixes, obtains exact-head Windows CI and physical validation; forensic evidence agent reopens actual raw media only for an unresolved direct observation/claim, not to redo completed Pass-3. Await exact source-version/decision evidence where explicitly limited. Do not mutate historical PASS or silently increment milestone counters.
