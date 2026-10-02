# Blitzit Forensic Pass 3 — Video Queue and Records

Status: **ACTIVE — 1/19 full MP4s complete at Pass-3 depth**

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

## Raw-media access bridge

Raw MP4 access was established on 2026-10-02 without touching Narro implementation.

An isolated, **analysis-only** branch `analysis/blitzit-pass3-media-bridge` contains only a temporary GitHub Actions workflow that uploads the already-versioned `reference/original-blitzit-videos/inbox/*.mp4` files as an Actions artifact. It is not an implementation branch, must not be merged, and must not be used to modify product source.

Initial bridge evidence:
- branch source commit: `7ccd1733cdc63991ecd5569c21fda02f28138881`;
- workflow run: `37002068940`;
- artifact: `blitzit-pass3-source-videos`, artifact id `11223759761`;
- artifact contained all **19** repository MP4s and was downloaded into the analysis runtime;
- local extraction verified 19 MP4 files before VE-003 inspection.

If the artifact later expires, a future analysis agent may re-run/recreate the same isolated bridge pattern. Do not add the bridge workflow to `main`, and do not use transcript-only evidence as a substitute for the raw MP4.

---

# Queue 1 — VE-003 — Blitz Mode

Source: `Blitzit Tutorial Blitz Mode.mp4`  
Verified metadata: **03:15.651 container duration / 03:15.567 video stream, 1920×1080, 60 fps, 11,734 video frames; AAC stereo 44.1 kHz**  
Pass-3 status: **SOURCE_COMPLETE / IMPLEMENTATION_DEFERRED**

Inspection method:
- complete source scanned across the full 03:15.651 duration;
- 3 s whole-video contact scan;
- 0.5 s dense sampling across interaction regions;
- 10 fps micro-sequences around hover/menu/Notes/Done/success;
- 30/60 fps frame review for window morphs, reorder, delete, success insertion and Panel↔Floating transitions;
- SRT used only to classify narration claims, never as a substitute for pixels.

## VE-003 chronological state map

### 00:00:00–00:00:29.9 — planning board before Blitz entry

**VIDEO-DIRECT**
- four-column dark planning board is visible in a centered desktop window;
- Today contains five tasks: `Refine Portfolio`, `Call with Sarah`, `Analyze Instagram metrics`, `Slogan options`, `Brand description`;
- Today headline estimate is `3hr 15min`;
- the visible Today completion state is `0/5 Done`;
- the gradient Blitz CTA is anchored at the bottom of Today.

**ARITHMETIC-DIRECT**
- the visible estimates reconcile: Refine Portfolio `2hr` + Call with Sarah `30min` + Analyze Instagram metrics `45min` = `3hr 15min`; tasks without a visible EST do not contribute to this header total in the demonstrated state.

### ~00:00:30.08–00:00:30.30 — board → Focus entry

**VIDEO-DIRECT / MOTION-MEASURED**
- activating the Today Blitz CTA does not hard-cut to an unrelated window;
- the existing board window visibly **shrinks, translates toward the left edge and changes internal composition** into the narrow Focus Panel;
- 60 fps frame review places the visible geometry transition at roughly **0.22 s** from first clear resize/reposition to the narrow Focus geometry;
- content switches from four-column board to Focus content during the same window morph;
- no whole-window opacity fade is visible.

**TRANSIENT-DIRECT**
- the first Focus frames show the live task before its final runtime label settles;
- `PAUSED` appears briefly on `Refine Portfolio`, followed by the running countdown.

### ~00:00:30.30–00:00:42.7 — initial Focus Panel state

**VIDEO-DIRECT**
- Focus header:
  - list badge/dropdown at upper-left;
  - title `Today`;
  - gear/preferences, Home and presentation/resize control at upper-right;
  - `Est: 3hr 15min`;
  - progress bar + `0/5 Done`.
- live task `Refine Portfolio` has mint/green outline and a large remaining countdown around `01:47:xx`;
- its visible task metrics are `2hr` EST and about `12min` Taken, consistent with a remaining countdown near 1h48;
- ordinary queue rows appear below;
- bottom gradient pill reads `Focus mode`;
- secondary bottom text reads `Done for the day`.

### ~00:00:42.7–00:00:43.23 — Focus queue hover + reorder

**VIDEO-DIRECT**
- hovering an ordinary Focus task reveals:
  - leading circular completion affordance;
  - rocket / Make Live;
  - subtasks/list-like control;
  - Notes/document;
  - overflow ellipsis.
- this differs from the board's lane-left/lane-right hover grammar and confirms Focus has a surface-specific action rail.

**MOTION-MEASURED**
- `Call with Sarah` is reordered below `Analyze Instagram metrics`;
- 60 fps review shows the ordering flips between adjacent source frames, approximately **16.7 ms** apart;
- this specific Focus reorder sequence does **not** show the pronounced lifted-card/source-reflow/drop-settle animation seen in the separate planning-board evidence;
- do not generalize board drag motion to Focus queue motion.

### ~00:00:48.7–00:00:50.58 — overflow menu + immediate delete

**VIDEO-DIRECT**
- opening an ordinary Focus task overflow exposes, in order:
  1. `Schedule`
  2. `Change list`
  3. `Duplicate`
  4. `Delete` in destructive red.
- Delete is selected directly; no confirmation dialog is visible.

**MOTION-MEASURED / ARITHMETIC-DIRECT**
- the task disappears between adjacent 60 fps frames: visible mutation feedback is effectively one-frame / ~**16.7 ms** in this recording;
- `Call with Sarah` had `30min` EST;
- Focus header changes:
  - `Est: 3hr 15min → 2hr 45min`;
  - `0/5 Done → 0/4 Done`.
- this numerically confirms that the Focus headline EST is tied to the visible planned-task estimates in this state.

### ~00:00:51.2–00:00:54.0 — live-task action rail + Notes inline expansion

**VIDEO-DIRECT**
- hovering the **live** task does not use the ordinary rocket/subtask/Notes/overflow rail;
- the live row becomes a compact action strip corresponding to Break, Notes, Pause, Skip and Done semantics;
- choosing Notes expands a rich editor **inside the live card**;
- queue content is pushed downward rather than replaced;
- the Notes toolbar contains compact formatting/list/history controls;
- a bottom-right `Close` affordance collapses the editor.

**MOTION-APPROX**
- editor opening and closing are fast in-place height/reflow transitions, on the order of a few tenths of a second;
- no page/modal transition is used.

### ~00:00:59.9–00:01:02.7 — Refine Portfolio Done → success → Next Task

**VIDEO-DIRECT / MOTION-MEASURED**
- Done is exposed as a labeled hover pill on the live action strip;
- after activation, the live-card region transforms into a success surface;
- 60 fps review shows the success surface beginning around **00:01:00.45** and settling over only a few frames; there is no full-panel fade;
- success surface includes:
  - struck-through completed task title;
  - `Well done!` plus celebration emoji;
  - animated reaction GIF;
  - supporting early/finish message;
  - gradient `Next Task`;
  - secondary `Take a Break`;
  - EST/Taken summary.

**ARITHMETIC-DIRECT / SOURCE-ARTIFACT**
- immediately before completion: `Est: 2hr 45min`, `0/4 Done`;
- while Refine's success card remains visible: `Est: 2hr 45min`, **`1/5 Done`**;
- after explicit `Next Task`: `Est: 45min`, **`1/4 Done`**;
- therefore the success state temporarily counts the just-finished live card in the denominator while it is also already reflected in Done, producing a **+1 transient denominator**;
- the completed task's EST also remains in the headline until `Next Task` advances the success state;
- classify this as a source transient/counting artifact, not automatically as desired parity behavior.

**VIDEO-DIRECT**
- after `Next Task`, `Analyze Instagram metrics` becomes live;
- Done section appears with `1 Done` and Refine Portfolio struck through;
- the source does **not** auto-start the next task before the explicit success choice.

### ~00:01:04.5–00:01:07.5 — Make Live swaps the active identity

**VIDEO-DIRECT**
- while `Analyze Instagram metrics` is live, hovering `Slogan options` exposes the ordinary Focus rail;
- the rocket / Make Live control is selected;
- `Slogan options` becomes the outlined live card with timer starting around `00:00:00`;
- `Analyze Instagram metrics` returns to the ordinary queue above `Brand description`;
- the previous live task is not marked Done.

**INFERENCE LIMIT**
- this establishes live-task identity handoff and queue reinsertion;
- it does not prove any hidden persistence implementation beyond the visible state.

### ~00:01:19–00:01:33 — list selector / All Lists

**VIDEO-DIRECT**
- the Focus list selector opens an anchored menu with:
  - `All Lists` represented by stacked badges plus `+2`;
  - `Personal`;
  - `Freelance`;
  - `TYAMA`.
- list badges/colors are retained on tasks;
- an All Lists view visibly contains tasks from multiple lists;
- one demonstrated All Lists live card includes `3/4 Subtasks`.

**CAUSALITY LIMIT**
- switching selector states also changes the visible top timed card in the staged tutorial;
- this sequence is not strong enough to conclude that selecting a list automatically starts an independent timer for that list;
- record only the visible filter/view changes, not a hidden multi-timer model.

### ~00:01:33–00:02:00 — Preferences inside the narrow Focus surface

**VIDEO-DIRECT**
- gear opens a Preferences view in the same narrow companion window;
- header changes to `Preferences` with a back arrow;
- desktop remains visible beside it;
- visible families include:
  - Blitz Panel / screen selection;
  - Blitz Panel Side;
  - General;
  - theme;
  - Blitz mode settings;
  - Pomodoros;
  - Default break length;
  - scrolling live-timer title;
  - Alerts with nested timing/sound/flash/notification controls;
  - completion celebration lower in the scroll.
- the tutorial scrolls the settings vertically; it does not demonstrate changing these values.

**VERSION-PRECEDENCE**
- current supplied v2.6.69 screenshots remain stronger for exact current Preferences styling/copy;
- VE-003 is corroboration for the Focus-local settings workflow and section relationships.

### ~00:02:00.5–00:02:01.1 — Home exits Focus and pauses the live task

**VIDEO-DIRECT / MOTION-MEASURED**
- activating Home first exposes `PAUSED` on the live Slogan task;
- the narrow Focus window then expands/repositions back into the centered planning board;
- sampled frames show a visible reverse window morph over roughly **0.25–0.30 s**;
- this is not a simple page crossfade.

### ~00:02:04.6–00:02:06.0 — Blitz re-entry

**VIDEO-DIRECT**
- the board's Today Blitz CTA is activated again;
- board→Focus uses the same family of shrink/reposition window morph;
- the returned Focus state briefly exposes `PAUSED`, then the timer is visibly running again shortly afterward.

**CAUSALITY LIMIT**
- the pixels establish pause-before-exit and a transient paused state on re-entry;
- they do not by themselves establish the exact persistence/resume policy outside this demonstrated path.

### ~00:02:11.0–00:02:11.30 — Focus Panel → Floating Timer

**VIDEO-DIRECT / MOTION-MEASURED**
- the demonstrated trigger is the bottom gradient `Focus mode` control;
- 60 fps review shows the panel continuously shrinking and repositioning, with content progressively clipped/collapsed;
- final compact title/time pill is settled after roughly **0.28–0.30 s**;
- no opacity fade is visible;
- this is a real geometry/window transition, not a tutorial cut.

### ~00:02:12–00:02:18 — Floating Timer drag

**VIDEO-DIRECT**
- compact timer is dragged across the desktop from an upper-left position toward the center/top region;
- the whole window follows pointer movement;
- no rotation, scale-up, ghost preview, snap target or translucency is visible.

**TRANSCRIPT-CLAIM**
- narration says it stays always on top;
- this source shows it above the desktop, but does not independently prove always-on-top against another foreground application.

### ~00:02:24.5–00:02:42 — Floating Timer resting/hover micro-interactions

**VIDEO-DIRECT**
- resting compact state prioritizes task title on the left and live time on the right;
- on pointer entry, title/time crossfade into the action strip;
- frame sampling at 30 fps shows the change taking roughly **0.13 s** from resting content into the fully legible action strip;
- during the transition title/time briefly overlap/fade against incoming icons.

Final action order, left→right:
1. Break / gamepad-like icon;
2. Notes / document icon;
3. Pause;
4. Skip;
5. Done / circled check;
6. expand/restore icon.

A small horizontal handle remains at the far left.

**MICRO-INTERACTION-DIRECT**
- hovering an action expands that action into a rounded labeled pill while neighboring actions remain icon-only;
- outer Floating Timer width stays essentially fixed;
- directly visible labels include `Break`, `Notes`, `Pause`, `Skip`, `Done`.

**IMPORTANT SCOPE**
- in this section Break, Notes, Pause, Skip and Done are demonstrated by hover/label reveal only;
- their post-click outcomes are **not** shown here;
- only the rightmost expand/restore control is actually used.

### ~00:02:42.45–00:02:42.8 — Floating Timer → Focus Panel

**VIDEO-DIRECT / MOTION-MEASURED**
- activating the rightmost expand/restore control grows and translates the compact window back to the left-docked Focus geometry;
- 60 fps frames show approximately **0.28–0.35 s** of visible expansion/reposition;
- content progressively reappears as geometry expands;
- no full-window fade is visible.

### ~00:02:46.5–00:03:00.2 — repeated Done/success/Next Task sequence

The remaining tasks demonstrate the same success contract repeatedly.

**Slogan options**
- live action strip exposes Done;
- success appears with a different animated reaction GIF;
- success header shows **`2/5 Done`**;
- after `Next Task`, header normalizes to **`2/4 Done`** and Analyze Instagram metrics becomes live.

**Analyze Instagram metrics**
- Done leads to another distinct reaction GIF;
- success header shows **`3/5 Done`**;
- `Take a Break` is visibly hovered during the demonstration but **not clicked**;
- after `Next Task`, header becomes **`3/4 Done`** and Brand description becomes live.

**Brand description**
- Done leads to another success surface;
- header shows **`4/5 Done`** while the success card is present;
- activating `Next Task` with no ordinary tasks left removes the success card and normalizes header to **`4/4 Done`**.

**SOURCE-ARTIFACT — repeated transient denominator**
- the repeated pattern `1/5→1/4`, `2/5→2/4`, `3/5→3/4`, `4/5→4/4` proves the success-card denominator inflation is systematic in this source state, not a single unreadable frame;
- it should be preserved as evidence of source behavior, not silently converted into a product requirement.

### ~00:03:00.2–00:03:13.6 — all tasks finished / empty Focus state

**VIDEO-DIRECT**
- after the final `Next Task`:
  - headline `Est: 0min`;
  - progress is fully filled;
  - `4/4 Done`;
  - a short placeholder/skeleton interval appears;
  - centered empty copy resolves to `No Tasks added on this list`;
  - secondary action `+ CREATE TASK`.
- the skeleton/placeholder interval lasts only a fraction of a second before empty copy appears.

### ~00:03:13.6–00:03:15.651 — branded outro

**VIDEO-DIRECT / NON-PRODUCT**
- hard transition to black branded outro;
- Blitzit logo and tagline `Win your day, everyday.`;
- closing music is present;
- this is tutorial/outro material, not application UI.

## VE-003 source synthesis

High-confidence behavior/anatomy established by the raw source:
- board→Focus, Focus→board and Panel↔Floating are **window geometry morphs**, not simple content fades;
- Focus ordinary-task hover and live-task hover are different action grammars;
- Focus ordinary-task overflow order is Schedule / Change list / Duplicate / Delete;
- queue reorder is visibly much more immediate than the board drag grammar;
- ordinary task delete is immediate with no visible confirmation and updates aggregate EST/counts in the same moment;
- Notes expands inline inside the live card;
- Done with success screen enabled blocks automatic next-task start until explicit `Next Task`;
- Take a Break is directly visible but no clicked break outcome is established;
- Make Live swaps the live task and returns the previous live task to the queue;
- Floating Timer hover converts title/time into an icon strip and expands only the hovered action label;
- success GIF media varies between completions;
- success state contains a repeatable transient +1 denominator/counting artifact until `Next Task`;
- final completion reaches `4/4 Done`, `Est: 0min`, then an empty Focus state.

Static corroboration:
- SS-C19 / current Focus Panel corroborates narrow panel hierarchy;
- SS-C20 / current Floating Timer corroborates compact resting title/time state;
- SS-H04 corroborates list selector anatomy;
- SS-H05 and current Preferences screenshots corroborate settings families while current v2.6.69 wins exact styling;
- SS-H09 corroborates icon→labeled-pill action-strip behavior;
- SS-T04 historically corroborates Focus hover Make Live / Notes grammar.

Audio boundary:
- the source carries AAC stereo narration/music;
- non-speech UI sound effects were not classified confidently enough to create source requirements from this pass.

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
| VE-003 | **SOURCE_COMPLETE** | **12+ dense sequences** | **COMPLETE** | **SOURCE_COMPLETE / IMPLEMENTATION_DEFERRED** |
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
