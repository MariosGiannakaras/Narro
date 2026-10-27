# Resumed native acquisition — frozen 2026-10-23

**Capture-only: 19/24 planned journey IDs fully acquired; 5/24 partial; 0 wholly NOT RUN. These are acquisition counters, not product acceptance or milestone PASS.** This packet supersedes its earlier 15/24 checkpoint. No product code, config, tests, CI, PR or merge changed by the operator. Source-owner reviews of older recordings remain authoritative within their stated scope; these new clips are UNREVIEWED.

Main source `cdaf85b3c20028a78d17f75f5700e652e7147f7e`, CI39921466242 3/3 SUCCESS, artifact12488287273. EXE SHA256 `2c8b091f6bea079196f7b068c303749417bd80a3529230fb8c6ed0f93d386765`. See session-meta.json for provenance. Current PR389/PR419 draft source is different and has no verified replacement executable in this operator handoff: this main capture cannot accept either draft or retire PHYSICAL_BEFORE_MERGE.

## Acquisition disposition

| ID | Acquisition | Actual scope / remaining |
|---|---|---|
| A1–A12 | COMPLETE, historical packet only | Existing old ccb70a92 transition/support footage in ../batch-main-20261023; not repeated or transferred to corrected source. Source owner's scoped FAIL/PENDING/PASS findings stand. |
| A13 | PARTIAL | Original OS lifecycle support incomplete. Current-candidate native drag/tray Quit/relaunch remains unacquired; no new candidate accepted. |
| A14 | PARTIAL | Original topmost/DPI support incomplete. Current-candidate topmost/125% DPI and unavailable physical monitor/hotplug cases remain open. |
| B1 | COMPLETE | Home / previews / Board navigation. |
| B2 | COMPLETE at planned journey scope | Tomorrow scheduling Save, recurrence editor/patterns/Cancel, Done history scroll, reversible list archive/unarchive and Archived done tab. No permanent delete or automatic recurrence-boundary claim. |
| B3 | PARTIAL | Create A/B, Escape, Duplicate and actual inline next-lane move acquired. Pointer drags recorded but successful reorder not established; keyboard reorder and drag-cancel remain unacquired. Do not infer Narro failure solely from input-tool behavior. |
| B4 | PARTIAL | Focus selector, live Pause/Resume, inline/large Notes Save, Escape, subtask create/complete acquired. Live-task Skip/switch continuation remains unacquired. The final Skip-named clip contains incomplete setup only. |
| B5 | PARTIAL | POMO work Resume, manual Break, Timer return, skip-break feedback, success ON Complete and Take a Break acquired. Actual expiry, timed POMO boundary and further break pause/resume paths unacquired; no time manipulation or inferred PASS. |
| B6 | COMPLETE at planned journey scope | Success OFF preference, new queued task Make live / Complete, All Clear/rest-related feedback. |
| B7 | COMPLETE at planned journey scope | Themes/display refresh/timezone dropdown/volume popovers and keyboard volume adjustment. No system timezone/DPI changes and no audio acceptance (video has no audio track). |
| B8 | COMPLETE at planned journey scope | Dedicated ten-row Shortcuts dialog, Tab/Shift+Tab/Escape. Not proof of all global shortcut registration contexts. |
| B9 | COMPLETE at planned journey scope | Overview list/date/chart controls, actual PDF export. |
| B10 | COMPLETE at planned journey scope | Sessions filtering/Break visibility, Add/Edit/Save/task-detail/inline minute edit, actual CSV export. |

## Original clips and chronology

Each clip is original Desktop Duplication, 2560×1080, nominal60fps, mouse visible, no audio. All 13 recorders ended exit0; ffprobe metadata/frame counts included. No cuts/re-encoding or substantive frame analysis. Capture action windows bounded165s with180s hard cap; videos include necessary hover/transition waits. Earlier input recovery can include idle tails. All files are kept, including unsuccessful setup. Use actual journal times to find the useful action interval, not the filename alone.

CHRONOLOGICAL_MANIFEST.tsv maps each logged action/observation to recording offsets mechanically. Observation timestamps follow the input and are not exact input-onset proof. Some literal entry/scroll/drag calls were followed by labelled observations without a separate input-onset row. Native UIA data is retained in native-actions.jsonl; no direct HWND sampler/QPC trace was added to this main run. WGC snapshots were used for navigation only and are not a separate saved screenshot corpus. A few adjacent clips overlap briefly; avoid double-counting those intervals.

| Clip | UTC start | UTC stop | Actual acquisition |
|---|---|---|---|
| [B1-home-list-navigation](B1-home-list-navigation/native-original.mkv) | 2026-10-23T13:39:43.778075+00:00 | 2026-10-23T13:41:02.693119+00:00 | Home / All my lists / Capture Project preview and Board. |
| [B2B3-board-schedule-reorder](B2B3-board-schedule-reorder/native-original.mkv) | 2026-10-23T13:41:02.633118+00:00 | 2026-10-23T13:43:49.293962+00:00 | Tomorrow schedule Save; recurrence editor patterns and Cancel. Includes failed tool-input attempts. |
| [B3-board-input-reorder](B3-board-input-reorder/native-original.mkv) | 2026-10-23T13:43:58.589391+00:00 | 2026-10-23T13:46:45.209088+00:00 | Input-tool-limited setup; no successful reorder proof. Preserve original, delimit useful intervals with journal. |
| [B7B8-preferences-shortcuts](B7B8-preferences-shortcuts/native-original.mkv) | 2026-10-23T17:57:28.951619+00:00 | 2026-10-23T18:00:15.315582+00:00 | Themes, display refresh, timezone selector; includes stale geometry/input failures. |
| [B7B8-preferences-lower](B7B8-preferences-lower/native-original.mkv) | 2026-10-23T17:59:52.631037+00:00 | 2026-10-23T18:02:39.436256+00:00 | All three volume popovers, Task Alert volume keyboard change, Preferences scroll; ten-row Shortcuts dialog Tab / Shift+Tab / Escape. |
| [B9B10-reports-navigation](B9B10-reports-navigation/native-original.mkv) | 2026-10-23T18:04:07.507590+00:00 | 2026-10-23T18:06:53.850302+00:00 | Overview, Reading filter, date-range calendars/year navigation, Last 60 days Apply, Tasks-only chart, native PDF export feedback. |
| [B10-reports-sessions](B10-reports-sessions/native-original.mkv) | 2026-10-23T18:06:29.159923+00:00 | 2026-10-23T18:09:01.844953+00:00 | Hide Breaks, Add Session / task selection / Save, session Edit and task detail, inline end-minute edit / Save, CSV export, Capture Project filter. |
| [B4-focus-live-notes](B4-focus-live-notes/native-original.mkv) | 2026-10-23T18:13:06.691336+00:00 | 2026-10-23T18:15:07.379737+00:00 | Blitz now entry; paused live controls; Notes literal text, Save, large editor, Escape, Close; subtask add/commit/complete; list selector. |
| [B4B5-focus-break-pomo](B4B5-focus-break-pomo/native-original.mkv) | 2026-10-23T18:15:07.470758+00:00 | 2026-10-23T18:16:43.390695+00:00 | Reading All Clear, Capture Project selection, Resume POMO work, manual Break, compact Timer and return, skip-break/work-paused feedback, success ON preference, Complete / success / Take a Break; create success OFF task. |
| [B6-success-off-rest](B6-success-off-rest/native-original.mkv) | 2026-10-23T18:16:43.316682+00:00 | 2026-10-23T18:17:39.010422+00:00 | Success OFF retained, queued task Make live / Complete, All Clear; exit to main Board. |
| [B2B3-board-native-drag](B2B3-board-native-drag/native-original.mkv) | 2026-10-23T18:17:38.733736+00:00 | 2026-10-23T18:19:17.744097+00:00 | Create A/B tasks, Escape, pointer drag attempts, Duplicate, next-lane arrow move, title edit/Escape. Drag attempts did not establish successful reorder. |
| [B2-board-done-archive](B2-board-done-archive/native-original.mkv) | 2026-10-23T18:19:17.703353+00:00 | 2026-10-23T18:20:35.047361+00:00 | Done history scrolling, Home list Archive, Archived lists / Unarchive, Archived done tasks tab. No permanent deletion. |
| [B4-focus-skip-final](B4-focus-skip-final/native-original.mkv) | 2026-10-23T18:20:47.967518+00:00 | 2026-10-23T18:21:28.761719+00:00 | Final incomplete Skip setup: global toggle from main with no active task, All Lists Board and incidental Notes open/close. No live-task Skip acquired. |

## Data protection and publication

Original personal Roaming and Local profiles restored at2026-10-23T18:21:29.797138Z. Personal DB SHA256 identical before/after: `13185e54bc0ea08f3b368ccc48a8ede429683e1d58a60b15b8f7491a06d2224d`. Both current and prior Local-cache restoration proofs are included. Owned Narro process and all owned recorders stopped. OBS was not controlled or stopped by this acquisition. No personal database, profile/cache, backup or executable is published. Synthetic retained test profile is private under the protected-profile ledger; never replay a consumed ledger.

Includes whole current Narro-M7-Logs folder and an original-byte ZIP (use ZIP for exact original line endings), actual UI-produced PDF/CSV copies and original-byte export ZIP, original recorder helper source ZIP, session/fixture identity and UTC/native journals. Original exports remain on F:. Original videos remain centrally in E:/SystemFiles/Desktop/Narro-Workspace/Narro-Resume-20261023-133857. SHA256-MANIFEST.json records staged Git-blob hashes and raw local byte hashes separately; text checkout normalization can differ, original binary media must not.

## Limits and exact continuation

No product acceptance checkbox advanced. M1–M4 accepted / M5–M10 open, M10 hard entry, M11/M12 dormant and protected Spectrum Core picker/image upload/218 icons remain unchanged. Image upload was not re-tested by this packet. Second monitor disconnected; actual HDMI hotplug remains user-deferred.

Source owner: analyze these new clips together with existing evidence; separate tool-input failure, actual observed product failure and unexercised behavior. Reuse shared-surface observations per requirement only when sufficient. Do not repeat acquired paths by default. Residual acquisition is precisely A13/A14 plus B3 reorder/cancel, B4 Skip/switch and B5 expiry/POMO/break-control boundaries above. Current PR389/PR419 A/B native eight-case acceptance needs their own exact-SHA CI-verified binaries and isolated profiles; latest main source-owner HANDOFF controls candidate readiness. This packet is not those builds.
