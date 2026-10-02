# Blitzit Forensic Pass 3 — Video Queue and Records

Status: **ACTIVE — 0/19 full MP4s complete at Pass-3 depth**

Date: 2026-10-02

This file is the durable video-analysis companion to `docs/BLITZIT_FORENSIC_PASS3_TRACKER.md`.

The older `docs/BLITZIT_VIDEO_EVIDENCE.md` and `docs/BLITZIT_UI_UX_VIDEO_FORENSICS.md` are prior-pass inputs only. Their 19/19 completion does not satisfy Pass 3.

## Pass-3 video method

For every complete MP4:

1. inspect the full video, not only transcript-selected windows;
2. establish source duration, resolution and fps from the repository manifest;
3. map every material product state in chronological order;
4. densely sample every hover, click, drag, press, modal/popover, inline expansion, progress/counter change, timer boundary, presentation switch and success/completion sequence;
5. use frame-level inspection around motion when needed;
6. record:
   - pre-state;
   - trigger;
   - transient state(s);
   - final state;
   - exact visible copy;
   - control ordering;
   - geometry/reflow;
   - arithmetic/counter changes;
   - identity/order persistence;
   - timing classification;
7. classify each statement:
   - `VIDEO-DIRECT`;
   - `MOTION-MEASURED`;
   - `MOTION-APPROX`;
   - `CUT/UNMEASURABLE`;
   - `TRANSCRIPT-CLAIM`;
   - `INFERENCE`;
   - `SOURCE-ARTIFACT`;
8. reconcile contradictions against current screenshots and stronger/newer video;
9. do not compare/patch Narro implementation during this pass.

## Current environment limitation

The current chat can read repository metadata/SRT/docs and inspect repository images, but cannot decode the raw repository MP4 bytes through the available GitHub connector/runtime path.

Therefore no full repository MP4 is falsely marked complete here.

A future agent with a real repository checkout/raw-media-capable environment must resume from the exact queue below.

---

# Queue 1 — VE-003 — Blitz Mode

Source: `Blitzit Tutorial Blitz Mode.mp4`  
Metadata: **03:15.651, 1920×1080, 60 fps**  
Pass-3 status: **RAW_MEDIA_ACCESS_REQUIRED**

Prior hot windows:
- 00:00:19.200–00:01:16 — enter Focus and manage queue;
- 00:02:04–00:02:44 — Panel → Floating Timer → Panel;
- 00:02:45–00:02:56 — Done with success screen enabled.

Pass-3 questions:
- exact Blitz click/pressed state and first visible Focus frame;
- whether queue card hover action areas reserve width or reflow;
- exact Make Live feedback and live-task identity handoff;
- task ordering before/after switching;
- every progress/EST/Done count before and after completion;
- Panel→Floating geometry frame sequence, including any blank/clipped source artifacts;
- Floating→Panel reverse sequence;
- compact Timer resting vs hover/selected action strip;
- exact Done→success sequence;
- whether `Next Task` appears immediately or after another transient;
- `Take a Break` visibility and any demonstrated click outcome;
- success media/card geometry and preserved queue context.

Completion rule:
- whole 03:15.651 source reviewed, including areas outside prior hot windows.

---

# Queue 2 — VE-005 — Add & Manage Tasks and Lists

Source: `Blitzit Tutorial How to Add & Manage Tasks and Lists in Blitzit.mp4`  
Metadata: **03:38.848, 1920×1080, 60 fps**  
Status: **OPEN**

Prior windows:
- 00:00:22–00:00:38 — create/edit list;
- 00:00:40–00:01:23 — board / All Lists;
- 00:01:25–00:02:00 — task create, reorder, overflow;
- 00:02:02–00:02:40 — EST / Time Taken;
- 00:02:45–00:03:18 — completion/success.

Pass-3 focus:
- list-card hover/Open reveal and overflow;
- inline task create exact geometry/copy;
- board card resting ordinals and hover transition;
- direct action rail ordering;
- drag start/lift/source reflow/drop target/settle;
- Schedule / Change list / Duplicate / Delete exact menu;
- metric editor states and pause restrictions;
- completion card movement/Done treatment.

---

# Queue 3 — VE-013 — Subtasks

Source: `Blitzit Tutorial How to Use Subtasks in Blitzit.mp4`  
Metadata: **02:20.109, 1920×1080, 60 fps**  
Status: **OPEN**

Prior windows:
- 00:00:11–00:00:59 — board subtasks;
- 00:01:01–00:01:22 — Focus subtasks/source limitation;
- 00:01:23–00:02:02 — integration context.

Pass-3 focus:
- exact open/close state of subtask section;
- ring/count change per completion;
- input reveal/dismiss;
- row hover actions;
- reorder animation and identity persistence;
- delete feedback;
- Focus vs board action differences;
- Floating compact→expanded subtask geometry if shown.

---

# Queue 4 — VE-014 — Preferences

Source: `Blitzit Tutorial Preferences.mp4`  
Metadata: **02:48.484, 1920×1080, 60 fps**  
Status: **OPEN**

Prior windows:
- 00:00:08–00:00:59 — entry / Panel / General;
- 00:01:00–00:01:23 — Blitz mode/Pomodoro;
- 00:01:24–00:02:05 — Alerts;
- 00:02:06–00:02:25 — Celebration.

Pass-3 focus:
- Preferences opening/dismissal geometry;
- scroll behavior and section persistence;
- monitor selection feedback;
- side/theme segmented state transitions;
- every parent toggle child reveal/collapse;
- sound preview interaction;
- alert/notification/reminder hierarchy;
- success/GIF/sound hierarchy;
- any state that persists while scrolling.

---

# Queue 5 — VE-016 — Timer Modes

Source: `Blitzit Tutorial Timer Modes.mp4`  
Metadata: **02:55.380, 1920×1080, 60 fps**  
Status: **OPEN**

Prior windows:
- 00:00:17–00:01:03 — EST / Time's Up / Extend;
- 00:01:20–00:01:47 — Pomodoro / break;
- 00:01:50–00:02:27 — count-up / Time Taken.

Pass-3 focus:
- frame of EST reaching zero;
- exact Time's Up copy/control changes;
- Extend control appearance and timer direction;
- Done/Skip adjacency;
- Pomodoro work→break UI transition;
- count-up state;
- displayed timer vs Taken metric at boundaries.

---

# Queue 6 — VE-017 — Update Recurring Schedules

Source: `Blitzit Tutorial Update Recurring Schedules.mp4`  
Metadata: **02:50.063, 1920×1080, 60 fps**  
Status: **OPEN**

Prior windows:
- 00:00:34–00:01:10 — Replace Existing Tasks;
- 00:01:16–00:02:25 — No Repeat / Delete Existing / detachment.

Pass-3 focus:
- existing-rule editor entry;
- exact placement of neutral Replace row;
- state transition to No Repeat;
- whether Delete Existing replaces vs coexists with Replace;
- warm/destructive surface transition;
- count values;
- footer continuity;
- visible children before/after save.

---

# Queue 7 — VE-007 — Schedule Task Reminders

Source: `Blitzit Tutorial How to Schedule Task Reminders.mp4`  
Metadata: **02:52.803, 1920×1080, 60 fps**  
Status: **OPEN**

Prior windows:
- 00:00:12–00:01:02 — schedule date/time;
- 00:01:06–00:02:30 — recurrence/update/remove.

Pass-3 focus:
- task action that opens Schedule;
- quick-date shortcut pressed/selected treatment;
- selected calendar date feedback;
- step transition Next→time/repeat;
- exact time affordance;
- saved schedule metadata on card;
- update/remove schedule state.

---

# Queue 8 — VE-009 — Custom Recurring Schedules

Source: `Blitzit Tutorial How to Use Custom Recurring Schedules.mp4`  
Metadata: **02:39.893, 1920×1080, 60 fps**  
Status: **OPEN**

Prior window:
- 00:00:25–00:02:14 — custom interval editor.

Pass-3 focus:
- interval number/unit control;
- day/week/month/year switching;
- weekday chips;
- monthly subordinate options;
- plain-language rule summary;
- conditional geometry/reflow;
- Schedule footer persistence.

---

# Queue 9 — VE-010 — Notes

Source: `Blitzit Tutorial How to Use Notes.mp4`  
Metadata: **01:13.561, 1920×1080, 60 fps**  
Status: **OPEN**

Prior windows:
- 00:00:21–00:00:44 — rich editor;
- 00:00:45–00:01:00 — URL behavior.

Pass-3 focus:
- Notes affordance hover/selected state;
- editor expansion geometry;
- toolbar action ordering;
- content scroll;
- close/dismiss;
- URL styling;
- exact source auto-open sequence vs ordinary explicit activation.

---

# Queue 10 — VE-015 — Sessions Walkthrough

Source: `Blitzit Tutorial Sessions Walkthrough.mp4`  
Metadata: **02:56.216, 1920×1080, 60 fps**  
Status: **OPEN**

Prior windows:
- 00:00:18–00:01:26 — overview/filters;
- 00:01:28–00:02:21 — edit/delete/add;
- 00:02:22–00:02:39 — export.

Pass-3 focus:
- filter open/close;
- task/session detail selection;
- row field inline edit;
- save/cancel affordances;
- overflow delete;
- Add Session dialog;
- task-picker interactions;
- export label/state and version conflict with current direct CSV screenshot.

---

# Queue 11 — VE-011 — Reports

Source: `Blitzit Tutorial How to Use Reports.mp4`  
Metadata: **03:10.450, 1920×1080, 60 fps**  
Status: **OPEN**

Prior windows:
- 00:00:11–00:01:39 — filters/headline metrics/daily graph;
- 00:01:40–00:03:00 — productive cards/Time by List/Done.

Pass-3 focus:
- list/date filter transitions;
- chart hover target/tooltip placement;
- series toggle state;
- scroll/lower panel geometry;
- empty vs populated states.

---

# Queue 12 — VE-012 — Improved Sessions and Stats

Source: `Blitzit Tutorial How to Use Reports -Update Improved Sessions and Stats.mp4`  
Metadata: **06:56.357, 1920×1080, 30 fps**  
Status: **OPEN**

Prior windows:
- 00:00:23–00:03:55 — session-derived metrics/daily graph;
- 00:03:55–00:06:47 — productive/time-by-list/Done timing.

Pass-3 focus:
- exact calculations visible in UI;
- session contribution to graph values;
- task/break/total relations;
- early/late Done timing presentation;
- tooltip copy and color coding.

---

# Queue 13 — VE-006 — Delete & Archive

Source: `Blitzit Tutorial How to Delete & Archive Tasks and Lists.mp4`  
Metadata: **01:23.963, 1920×1080, 60 fps**  
Status: **OPEN**

Prior windows:
- 00:00:10–00:00:23 — permanent task delete;
- 00:00:26–00:00:58 — list archive/restore/delete forever;
- 00:00:59–00:01:08 — Done older than 60 days.

Pass-3 focus:
- exact destructive feedback;
- whether confirmation is visible or cut;
- archive movement;
- archived-card hover/actions;
- Archived Done table actions;
- 60-day claim: narration vs direct evidence.

---

# Queue 14 — VE-008 — Recurring Task Setup

Source: `Blitzit Tutorial How to Set Up Recurring Tasks.mp4`  
Metadata: **02:46.905, 1920×1080, 60 fps**  
Status: **OPEN**

Prior windows:
- 00:00:26–00:01:53 — presets/materialization;
- 00:02:00–00:02:25 — update/remove.

Pass-3 focus:
- recurring parent visual state;
- generated child visual state;
- scheduled grouping/counts;
- weekday/date metadata;
- update/remove and child coexistence/detachment evidence.

---

# Queue 15 — VE-002 — EST Suffix Parsing

Source: `Blitzit Tutorial Add Estimated Time Directly in Task Name.mp4`  
Metadata: **01:21.633, 426×240, 30 fps**  
Status: **OPEN**

Prior window:
- 00:00:17.920–00:01:00.879.

Pass-3 focus:
- keystroke-level title input;
- when EST field changes;
- suffix variants;
- save/Enter moment;
- visible title normalization;
- any error/unsupported suffix state.

---

# Queue 16 — VE-001 — Product Explainer

Source: `Blitzit Explained Simplify Your Tasks and Stay in Flow.mp4`  
Metadata: **02:19.088, 1920×1080, 30 fps**  
Status: **OPEN**

Prior windows:
- 00:00:32–00:01:19 — core loop montage;
- 00:01:21–00:02:16 — out-of-scope/context claims.

Pass-3 focus:
- catalog every unique visible product state;
- identify reused tutorial footage;
- label cuts/montage as timing-invalid;
- do not promote marketing narration to direct UI evidence.

---

# Queue 17 — VE-004 — Getting Started

Source: `Blitzit Tutorial Getting Started with Blitzit.mp4`  
Metadata: **04:09.870, 1920×1080, 60 fps**  
Status: **OPEN**

Prior windows:
- 00:01:24–00:03:20 — Home/list/task/Focus overview;
- account/trial sections around 00:00:39–00:01:22 and 00:03:38–00:03:55.

Pass-3 focus:
- Home→list→board→Focus continuity;
- unique vs duplicate interaction states;
- onboarding copy only where it affects in-product behavior;
- exclude auth/commerce from parity targets.

---

# Queue 18 — VE-018 — Daniel's Planning Workflow

Source: `Daniel's Productive Planning Workflow with Blitzit.mp4`  
Metadata: **03:33.090, 1920×1080, 60 fps**  
Status: **PARTIAL**

Prior broad window:
- 00:00:13–00:02:42 — personal planning routine.

### Completed Pass-3 excerpt

A separate user-supplied **9.344 s / 560-frame** planning-board excerpt has already been analyzed at the required depth.

Direct sequence findings:
- initial Backlog / This Week / Today board;
- four This Week→Today drags;
- floating drag preview;
- source reflow;
- positional destination insertion;
- stable visible ordinals through the sequence;
- final Today order `1, 3, 4, 2`;
- This Week remaining estimate `6h35 → 5h05 → 3h05 → 2h35 → 2h30`;
- Today remaining estimate `No Tasks → 1h30 → 3h30 → 4h → 4h05`;
- Today progress `0/0 → 0/1 → 0/2 → 0/3 → 0/4 Done`;
- hover completion + Notes/document + lane-left/lane-right + overflow grammar;
- persistent Today accent outline;
- anchored gradient Blitz CTA;
- CTA interaction followed by approximately 250 ms board-content fade.

Still required:
- full 03:33.090 MP4 review;
- all planning steps outside the supplied excerpt;
- Focus/break sequence and any later state;
- full-source chronology/cuts.

---

# Queue 19 — VE-019 — Oct Update

Source: `Oct Update Light mode and more!🚀.mp4`  
Metadata: **02:52.989, 1920×1080, 30 fps**  
Status: **OPEN / HISTORICAL**

Prior windows:
- 00:00:07–00:00:58 — Floating/live subtasks;
- 00:01:01–00:01:45 — settings/theme;
- 00:02:17–00:02:30 — Windows signing/security.

Pass-3 focus:
- historical Floating Timer subtask geometry;
- light-theme board comparison;
- settings shortcut/theme transitions;
- identify obsolete limitations;
- keep historical evidence subordinate to current v2.6.69.

---

# Completion ledger

| ID | Full MP4 Pass-3 | Deep sequences recorded | Conflict review | Source-only final disposition |
| --- | --- | --- | --- | --- |
| VE-001 | OPEN | 0 | OPEN | OPEN |
| VE-002 | OPEN | 0 | OPEN | OPEN |
| VE-003 | RAW_MEDIA_ACCESS_REQUIRED | 0 | OPEN | OPEN |
| VE-004 | OPEN | 0 | OPEN | OPEN |
| VE-005 | OPEN | 0 | OPEN | OPEN |
| VE-006 | OPEN | 0 | OPEN | OPEN |
| VE-007 | OPEN | 0 | OPEN | OPEN |
| VE-008 | OPEN | 0 | OPEN | OPEN |
| VE-009 | OPEN | 0 | OPEN | OPEN |
| VE-010 | OPEN | 0 | OPEN | OPEN |
| VE-011 | OPEN | 0 | OPEN | OPEN |
| VE-012 | OPEN | 0 | OPEN | OPEN |
| VE-013 | OPEN | 0 | OPEN | OPEN |
| VE-014 | OPEN | 0 | OPEN | OPEN |
| VE-015 | OPEN | 0 | OPEN | OPEN |
| VE-016 | OPEN | 0 | OPEN | OPEN |
| VE-017 | OPEN | 0 | OPEN | OPEN |
| VE-018 | PARTIAL | 1 | OPEN | OPEN |
| VE-019 | OPEN | 0 | OPEN | OPEN |

No row may change to SOURCE_COMPLETE without actual full-MP4 inspection.
