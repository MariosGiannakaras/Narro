# Blitzit Forensic Pass 3 — Video Queue and Records

Status: **ACTIVE — 6/19 full MP4s complete at Pass-3 depth**

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
Verified metadata: **03:38.750 video stream / ~03:38.8 container, 1920×1080, 60 fps, 13,125 frames**  
Pass-3 status: **SOURCE_COMPLETE / IMPLEMENTATION_DEFERRED**

Inspection method:
- complete source scanned across the full duration;
- 5 s whole-video contact scan;
- 0.5–1.5 s dense sampling across all product sections;
- 0.25 s micro-sequences around list creation, board task hover/reorder/overflow, metric editing and completion;
- full-resolution frame crops used for exact action ordering, metric fields/tooltips and Done-state arithmetic;
- SRT used only to distinguish narration claims from direct pixels.

## VE-005 chronological state map

### 00:00:00–~00:00:22 — Home/list-grid baseline

**VIDEO-DIRECT**
- current dark Home shell is visible with account/navigation cards at left, list-card grid in the main area and the large Create List tile;
- list cards show list badge/title, task previews, pending count and EST summary where present;
- the Create List tile is a large card-sized target rather than a small toolbar action.

No unique motion requirement is derived from this idle/tutorial-introduction period.

### ~00:00:23–00:00:32 — Create list modal

**VIDEO-DIRECT**
- activating Create List dims the Home shell and opens one centered modal;
- modal groups:
  - heading `Create a new list`;
  - optional icon/upload affordance;
  - list-color swatches;
  - title input;
  - secondary Cancel;
  - gradient Create.
- during the demonstration the selected list color changes before commit;
- title is entered as `Tutorials`;
- clicking Create closes the modal and inserts a new `Tutorials` card into the list grid.

**MOTION-DIRECT**
- no wizard/page navigation is used;
- modal removal and list-card insertion are fast; the Home grid reflows in place.

### ~00:00:32–00:00:39.5 — newly created list-card hover / overflow / Open

**VIDEO-DIRECT**
- new `Tutorials` card appears with zero-content/empty treatment;
- hover strengthens the card outline and reveals a centered gradient `Open` pill without changing card dimensions;
- top-right ellipsis opens the list-management menu;
- visible menu order:
  1. `Edit List`
  2. `Duplicate`
  3. divider
  4. `Archive List`
- there is no permanent Delete item in this current list-card menu state;
- after menu dismissal, hover `Open` is available again;
- selecting Open navigates into the list board.

**STATIC CORROBORATION**
- current screenshot SS-C05 independently matches this hover/overflow grammar.

### ~00:00:40–00:01:08 — empty single-list board

**VIDEO-DIRECT**
- `Tutorials` opens as a four-column planning board:
  - Backlog;
  - This Week;
  - Today;
  - Done.
- empty pending lanes use centered `All Clear` state;
- Today retains the accent outline even when empty;
- Today bottom CTA occupies its anchored slot but is visually subdued while no runnable task exists;
- Backlog / This Week / Today expose `+ ADD TASK` affordances;
- Done remains a separate fourth column.

**INTERACTION-DIRECT**
- the board is the same surface used later for task creation/management; there is no separate edit mode.

### ~00:01:09–00:01:23 — list selector and single-list / All Lists switching

**VIDEO-DIRECT**
- the list selector at the top-left opens a compact anchored menu;
- menu visibly includes `All Lists`, `Tutorials`, `Blue Beach Hotel`, `Freelance` and `Music projects` in this staged dataset;
- choosing `All Lists` repopulates the same four-column board with tasks from multiple lists;
- task rows retain their source-list badges/colors;
- choosing an individual list filters the same board back to that list;
- switching back to Tutorials restores its empty state.

**CAUSALITY LIMIT**
- this demonstrates one board shell with a list-scope selector;
- it does not establish hidden query/storage implementation details.

### ~00:01:25–00:01:50 — inline task creation

**VIDEO-DIRECT**
- clicking Today `+ ADD TASK` expands an inline editor inside the lane rather than opening a modal;
- visible editor anatomy:
  - `× CANCEL`;
  - title input;
  - EST entry at right using HH:MM-style value;
  - helper text `Add a new task`;
  - gradient `Confirm`.
- first created task is `Video`;
- second created task is `Record voice`;
- after confirming/pressing Enter, the created task appears immediately while the inline editor can remain open for rapid additional entry;
- Cancel collapses the editor;
- final demonstrated Today order is:
  1. Record voice
  2. Video

**PRIORITY-DIRECT**
- later drag/arrow actions confirm top-to-bottom order is editable priority, not creation chronology only.

### ~00:01:50–00:02:03 — task hover grammar, lane movement and overflow

**VIDEO-DIRECT**
- resting board task shows a leading ordinal, title, lower-left EST affordance/value and lower-right Taken value;
- on hover the leading slot becomes/reveals the circular completion affordance and a compact right-side action rail;
- exact visible board action order in the high-resolution hover frame:
  1. Subtasks/list-like control;
  2. Notes/document;
  3. lane-left arrow;
  4. lane-right arrow;
  5. overflow ellipsis.
- this is distinct from Focus ordinary-task hover, where the leading direct action is Make Live/rocket rather than lane arrows.

**LANE-MOVE-DIRECT**
- Record voice is moved out of Today into This Week with the direct lane arrow, then returned to Today;
- the task identity is preserved;
- lane mutation is immediate in the demonstrated source state.

**OVERFLOW-DIRECT**
- board-task overflow menu exact order:
  1. `Schedule`
  2. `Change list`
  3. `Duplicate`
  4. `Delete` in destructive red.
- lane arrows are not duplicated inside this menu.

### ~00:02:03–00:02:18 — EST editing on an existing task

**VIDEO-DIRECT**
- Record voice lower-left EST affordance is directly editable;
- hovering it exposes tooltip `Est. HH:MM`;
- editor is a compact inline value field in the metric slot rather than a modal;
- demonstrated input resolves to **8hr 45min**;
- commit returns the card to its normal metric display;
- lower-right Taken remains `0min`.

**ARITHMETIC-DIRECT**
- after commit, the visible list/pending estimate reflects the 8h45 task estimate;
- Video still has no EST and therefore does not add estimate time in this staged state.

### ~00:02:18–00:02:24 — EST available during task creation

**VIDEO-DIRECT**
- the inline `+ ADD TASK` editor is opened again;
- title and EST are sibling fields in the create row;
- this visually corroborates narration that estimate can be entered at creation time.

The demonstration closes/cuts away without establishing additional validation/error behavior.

### ~00:02:24–00:02:33 — Blitz entry and live-task EST/pause relationship

**VIDEO-DIRECT**
- Today Blitz CTA enters the narrow Focus Panel;
- `Record voice` becomes the live task with countdown beginning at **08:45:00**, matching its EST;
- Focus header shows `Est: 8hr 45min`;
- Video remains queued below;
- live task hover reveals the live action strip;
- Pause changes the live timer to explicit `PAUSED`;
- Resume returns to the running countdown.

**EVIDENCE BOUNDARY**
- narration states a live task's EST can only be added/edited while paused;
- pixels do demonstrate the pause state immediately around the metric-edit discussion;
- the source does **not** show a failed running-state edit attempt, so the prohibition itself remains partly `TRANSCRIPT-CLAIM` rather than a measured rejection state.

### ~00:02:34–00:02:44 — manual Time Taken editing

**VIDEO-DIRECT**
- queued task `Video` exposes lower-right Taken value;
- hovering/clicking the value uses the same compact inline metric-slot editor;
- source tooltip/field semantics identify it as Taken using HH:MM formatting;
- demonstrated typed value is **05:35**;
- commit renders **5hr 35min** at the lower-right of Video;
- Video still shows `+ EST` at lower-left.

**STATIC/STRUCTURAL FINDING**
- EST and Taken occupy stable opposing metric slots:
  - EST left;
  - Taken right.
- task action rail remains in the title row above those metrics.

### ~00:02:45–00:02:51 — completing the live task in Focus

**VIDEO-DIRECT**
- Record voice remains live with countdown around 08:44:4x;
- Done is invoked from the live-task action strip;
- success surface replaces the live-card content in-place;
- success anatomy matches VE-003:
  - completed title;
  - `Well done!`;
  - reaction GIF;
  - gradient `Next Task`;
  - secondary `Take a Break`;
  - completion timing summary.

**ARITHMETIC-DIRECT**
- Record voice EST is 8hr45 = **525 minutes**;
- its demonstrated Taken is effectively 0min at completion;
- success copy reports completion **525 minutes early**, exactly matching EST − Taken;
- this directly validates the early/late comparison semantics shown by the UI.

### ~00:02:51–00:02:58 — board Done-state outcome

**CUT/UNMEASURABLE**
- tutorial cuts from Focus success back to the board; do not interpret this as a measured Focus→board transition.

**VIDEO-DIRECT**
- Record voice is now in Done with struck-through title and `0min` Taken;
- Today retains pending `Video`;
- top list summary reads one pending task and `Est: 0min` because the remaining Video has no EST;
- Today/This Week progress shows **1/2 Done** for the two-task planning set;
- Done groups the completed task by date and reports one task for that date/month context.

**METRIC-DIRECT**
- pending Video retains its manually entered **5hr 35min Taken** even though it has no EST.

### ~00:02:58–00:03:21 — Blitz-mode completion demonstration

**CUT/UNMEASURABLE**
- source cuts back into Focus; this is a tutorial edit, not a measured navigation transition.

**VIDEO-DIRECT**
- Video is shown as the remaining task;
- live-task Done is demonstrated again;
- success screen appears with animated reaction media;
- success screen prominently exposes:
  - `Next Task`;
  - `Take a Break`;
  - early/late completion message relative to EST where applicable.
- pointer hovers over the success choices during narration.

**TIMING LIMIT**
- because the sequence contains tutorial cuts and staged state changes, do not derive automatic-next-task delay or cross-surface navigation timing from this section.

### ~00:03:21–00:03:38.75 — Help Center / community outro

**VIDEO-DIRECT / NON-PARITY**
- product UI gives way to Help Center web content and then Discord/community material;
- these are tutorial/navigation outro surfaces, not Narro parity targets.

## VE-005 source synthesis

High-confidence source behavior established:
- list creation is one centered modal and inserts the new list card into the Home grid;
- current list-card hover reveals centered Open without card reflow;
- list overflow = Edit List / Duplicate / Archive List;
- one four-column board shell supports scoped single-list and All Lists views;
- task creation is inline, repeat-friendly and includes a sibling EST field;
- board resting task uses ordinal + EST-left + Taken-right;
- board hover rail = Subtasks / Notes / lane-left / lane-right / overflow;
- direct lane arrows preserve task identity and mutate lane immediately;
- board overflow = Schedule / Change list / Duplicate / Delete;
- existing EST is inline editable with `Est. HH:MM` semantics;
- demonstrated EST is 8hr45;
- live Record voice timer starts from that 8hr45 estimate;
- Pause/Resume is explicitly demonstrated during the live metric discussion;
- queued-task Taken is inline editable in HH:MM form and demonstrated as 05:35 → 5hr35min;
- completing Record voice with effectively 0min Taken yields `525 minutes early`, numerically equal to EST − Taken;
- completed task moves to dated Done grouping; remaining pending-task estimate excludes a task with no EST;
- progress shows 1/2 Done across the demonstrated two-task set;
- tutorial cuts must not be mistaken for product transition timing.

Static corroboration:
- SS-C01 current Create List dialog;
- SS-C05 current list-card hover/overflow;
- SS-H01 full four-column board;
- SS-H02 Today ordinal/EST/Taken/progress;
- SS-H13 board task hover + overflow;
- SS-T02 historical inline task creation;
- SS-T03 historical EST/Taken placement.

No implementation conclusion is made in this analysis track.

---

# Queue 3 — VE-013 — Subtasks

Source: `Blitzit Tutorial How to Use Subtasks in Blitzit.mp4`  
Verified metadata: **~02:20.03 video stream / ~02:20.1 container, 1920×1080, 60 fps, 8,402 frames**  
Pass-3 status: **SOURCE_COMPLETE / IMPLEMENTATION_DEFERRED**

Inspection method:
- complete source scanned across the full duration;
- 4 s whole-video contact scan;
- 0.5 s dense sampling through all product sections;
- full-resolution crops around board subtask add/reorder/delete, completion ring, Focus/Floating states and Notion-synced rows;
- 30 fps micro-sequences around task-card expansion, subtask completion and Focus→Floating geometry change;
- transcript used only to separate narrated limitations/integration claims from direct pixels.

## VE-013 chronological state map

### 00:00:00–~00:00:16 — board baseline

**VIDEO-DIRECT**
- dark four-column board for the `Blue Beach Hotel` list;
- Today contains three parent tasks:
  1. Blue Beach Hotel;
  2. Client's brief;
  3. Market research.
- parent-task progress at the lane level is `0/3 Done`;
- Blue Beach Hotel shows about `17min` Taken and no visible EST;
- Client's brief and Market research carry integration/source badges;
- Client's brief already shows a collapsed `1/3 Subtasks` state;
- Market research shows a collapsed `0/3 Subtasks` state.

This establishes that subtask completion/progress is a separate metric from parent-task Done progress.

### ~00:00:16–00:00:18 — subtask section open

**VIDEO-DIRECT**
- hovering Blue Beach Hotel reveals the board task action rail;
- selecting the subtasks/list-like action expands the card in place;
- the expanded area contains:
  - circular subtask-progress indicator;
  - `Subtasks` label/count;
  - plus affordance;
  - collapse chevron;
  - inline input with placeholder `Enter subtask task title*`;
  - X/cancel inside the input.

**MOTION-APPROX**
- 30 fps review shows the height reveal settling in roughly **0.10–0.15 s**;
- later lane content is pushed downward; the board does not switch to a modal or separate subtask page.

### ~00:00:18–00:00:31 — add subtasks inline

**VIDEO-DIRECT**
- first title entered: `Call with Alex`;
- pressing Enter/commit adds it immediately;
- input remains available for another entry;
- second title entered: `Coffee`;
- after commit, both rows appear under the same parent.

**COUNT-DIRECT**
- subtask count progresses from empty/no completed state through `0/1` to **`0/2 Subtasks`**;
- parent Today progress remains **`0/3 Done`**.

**INTERACTION-DIRECT**
- add flow is repeat-friendly and inline;
- no dialog or page transition occurs between successive subtask additions.

### ~00:00:32–00:00:45 — reorder and delete

**VIDEO-DIRECT**
- hovering a subtask row exposes compact right-side row actions:
  - up arrow;
  - down arrow;
  - trash/delete.
- the source demonstrates arrow-based reordering between `Call with Alex` and `Coffee`;
- identity is preserved while row order changes;
- deletion is immediate and does not show a confirmation dialog;
- `Call with Alex` is removed, leaving `Coffee`.

**COUNT-DIRECT**
- subtask count changes from **0/2 → 0/1** after deletion.

**MOTION-DIRECT**
- row mutations are fast and local;
- no pronounced drag-lift animation is used because this source demonstrates explicit up/down controls rather than subtask drag-and-drop.

### ~00:00:48–00:00:58 — complete subtask and progress ring

**VIDEO-DIRECT**
- clicking Coffee's leading checkbox marks that subtask Done;
- Coffee changes to completed/struck-through styling with a filled multicolor check treatment;
- the circular progress indicator fills;
- count changes **0/1 → 1/1 Subtask**.

**MOTION-APPROX**
- completion state and ring update within only a few frames; there is no card relocation or success screen.

**IMPORTANT SEMANTIC SEPARATION**
- parent task Blue Beach Hotel remains pending;
- Today lane still shows **0/3 Done**;
- therefore subtask completion does not implicitly complete the parent task in this demonstrated state.

### ~00:01:00–00:01:10 — Blitz/Focus subtask state

**VIDEO-DIRECT**
- Blitz entry presents the narrow Focus Panel;
- Blue Beach Hotel becomes the live task with a running timer around 17 minutes;
- Focus header remains `0/3 Done` and `Est: 0min`;
- Blue Beach Hotel retains its **1/1 Subtask** state;
- expanding the live task's subtask section shows completed Coffee in place;
- the plus affordance remains available in Focus.

**TRANSCRIPT-CLAIM / VERSION LIMITATION**
- narration states that this source version requires at least one pre-existing subtask before subtasks can be viewed/updated in Focus mode;
- the video does **not** show a failed no-subtask attempt, so the restriction is not promoted to VIDEO-DIRECT behavior;
- treat it as a version-specific narrated limitation unless corroborated elsewhere.

### ~00:01:10–00:01:12 — Focus Panel → Floating Timer

**VIDEO-DIRECT / MOTION-MEASURED**
- activating the Focus-mode presentation control continuously shrinks/repositions the narrow panel into the Floating Timer;
- the same live task/subtask identity remains visible through the transition;
- 30 fps inspection shows approximately **0.25–0.35 s** of visible geometry morph;
- this is not a hard cut or opacity-only transition.

This matches the geometry-morph family independently established in VE-003.

### ~00:01:12–00:01:18 — Floating Timer subtask expansion + add

**VIDEO-DIRECT**
- Floating Timer can show the subtask section while retaining the compact top action strip;
- visible structure:
  - circular progress ring;
  - `1/1 Subtask`;
  - plus;
  - collapse chevron;
  - completed Coffee row;
  - inline subtask input.
- selecting plus/input allows a new subtask to be typed directly in Floating Timer;
- title entered: `Another call`.

**COUNT-DIRECT**
- after commit, count becomes **1/2 Subtasks**;
- Coffee remains completed;
- Another call is incomplete.

**GEOMETRY-DIRECT**
- Floating Timer grows vertically to accommodate the expanded subtask content;
- width remains essentially stable;
- task controls remain in the top strip.

### ~00:01:18–00:01:32 — Floating subtask row controls

**VIDEO-DIRECT**
- expanded Floating Timer exposes right-side subtask row actions analogous to board:
  - up;
  - down;
  - delete/trash for ordinary local subtasks.
- Coffee and Another call remain visible with their distinct completion states;
- the source does not clearly demonstrate an additional successful delete/reorder commit in this interval, so only control availability is claimed.

**COUNT-DIRECT**
- state remains **1/2 Subtasks** through the demonstrated Floating-management section.

### ~00:01:32–00:01:34 — return from Floating / board context

**VIDEO-DIRECT**
- presentation controls are used to leave the Floating state;
- source returns to the list/board workflow shortly afterward.

**TIMING LIMIT**
- multiple presentation/navigation actions occur close together in tutorial footage;
- do not derive a single exact Floating→board transition duration from this interval.

### ~00:01:34–00:01:47 — Notion-synced subtask anatomy in Blitzit

**VIDEO-DIRECT**
- board returns with Blue Beach Hotel now showing **1/2 Subtasks**:
  - Coffee completed;
  - Another call incomplete.
- `Client's brief` is expanded;
- it shows **1/3 Subtasks** synchronized from Notion:
  - `Deliverables and Expecta...` completed/struck through;
  - `Objectives and Challenges` incomplete;
  - `Basic Information and Co...` incomplete.
- synced rows visually resemble ordinary subtasks for progress/completion state.

**SYNCED-ROW ACTION GRAMMAR**
- hovered synced row exposes up/down controls;
- the terminal right-side control is a Notion/source icon rather than the ordinary trash icon.

**TRANSCRIPT + VISUAL CORROBORATION**
- narration states synced Notion subtasks cannot be deleted from Blitzit because they remain linked to source data;
- absence/replacement of the local trash affordance on synced rows visually corroborates that distinction.

### ~00:01:47–00:02:04 — Notion page + live Blitzit companion sync

**CUT/CONTEXT**
- tutorial cuts from Blitzit board to a Notion page titled `Client's brief`;
- this browser/application change is tutorial context, not a product navigation animation.

**VIDEO-DIRECT**
- Notion page exposes checkbox properties matching the three Blitzit subtask labels;
- a Blitzit Floating Timer remains visible over the Notion window;
- its subtask list mirrors the same three identities;
- during checkbox changes in Notion, the Floating Timer's:
  - completed-row styling;
  - progress ring/count;
  - row states
  visibly update to corresponding states.

**SYNC TIMING LIMIT**
- the source demonstrates correspondence but does not isolate network/backend latency cleanly enough for a timing requirement;
- no exact sync-latency budget is inferred.

**DIRECTION LIMIT**
- narration discusses synchronization between Notion and Blitzit;
- because the tutorial contains staging/cuts around the integration example, do not infer a full bidirectional conflict-resolution model from this clip alone.

### ~00:02:04–00:02:20 — integration/future-feature outro

**TRANSCRIPT-CLAIM / NON-PARITY**
- narration says Notion is currently available and mentions future ClickUp/Trello integrations;
- these roadmap claims are not direct UI evidence and are not Narro parity requirements from this pass;
- closing community/outro material is non-product evidence.

## VE-013 source synthesis

High-confidence source behavior established:
- subtasks expand inline inside a parent task card;
- add input stays inline and supports rapid repeated entry;
- ordinary local subtask rows expose up/down/delete actions;
- subtask reorder/delete are immediate local mutations;
- subtask progress uses a circular ring plus done/total count;
- completing a subtask changes only subtask progress; parent Done progress remains independent;
- Focus Panel retains/expands the live task's subtask state;
- Focus→Floating preserves task/subtask identity through a geometry morph;
- Floating Timer can add and manage subtasks in its expanded state;
- adding Another call changes 1/1 → 1/2 without resetting Coffee's completed state;
- Notion-synced rows use source-specific action grammar and no ordinary trash affordance;
- Notion checkbox state is visibly mirrored in an overlaid Blitzit Floating Timer;
- exact integration sync latency and the narrated “must already have one subtask” Focus limitation are not promoted beyond the evidence actually shown.

Static corroboration:
- SS-C18 current Floating Timer expanded subtasks;
- SS-C19 current Focus Panel subtask summary;
- SS-H11 inline add-subtask input;
- SS-H12 expanded subtask progress/actions.

No implementation conclusion is made in this analysis track.

---

# Queue 4 — VE-014 — Preferences

Source: `Blitzit Tutorial Preferences.mp4`  
Verified metadata: **02:48.417 video stream / 02:48.484 container, 1920×1080, 60 fps, 10,105 frames**  
Pass-3 status: **SOURCE_COMPLETE / IMPLEMENTATION_DEFERRED**

Inspection method:
- actual complete MP4 inspected across the full duration;
- 4 s whole-source scan;
- 0.5–1 s dense sampling through every Preferences section;
- 0.1 s micro-sequences around Preferences entry, Focus-side Preferences entry, panel-side selection, theme switching, Pomodoro child reveal, timer-flash demonstration and completion-celebration demonstration;
- full-resolution crops used to read monitor dimensions, selected values, dropdown options and sound/volume controls;
- current v2.6.69 screenshots were used only for source-precedence reconciliation, not as a substitute for video inspection.

## Source/version note

This tutorial is visibly a **macOS-era source** and its exact Preferences inventory is older than the current supplied v2.6.69 screenshots.

Direct examples:
- VE-014 General shows `Hide est/done times on tasks` + Theme, but not the newer current `Auto-parse Est. time from title` / timezone rows visible in SS-C07;
- VE-014 Alerts uses Timed Alerts + Notification Alerts but does not show the newer separate `Schedule reminders (system)` hierarchy visible in SS-C08;
- Focus-side access in this tutorial opens a narrow `Preferences` surface, while the stronger current Help screenshot SS-H05 labels the modern Focus-local surface `Menu → Quick Preferences`.

Therefore:
- **video interaction/motion evidence remains valid where directly shown**;
- **current/direct screenshots supersede this tutorial for present-day option inventory and exact modern geometry**.

## VE-014 chronological state map

### 00:00:00–~00:00:10.7 — board baseline / Preferences entry target

**VIDEO-DIRECT**
- tutorial starts on the dark four-column planning board;
- top-right app toolbar includes a cog/settings affordance;
- pointer moves to the cog before Preferences opens.

### ~00:00:10.8–00:00:12.0 — full Preferences open

**VIDEO-DIRECT**
- clicking the main app cog dims the board and presents a Preferences surface;
- the source uses a dark side-oriented/narrow Preferences composition over the desktop rather than a full-page navigation;
- title `Preferences` and back/close navigation are retained at the top;
- first visible section is `Blitz Panel`.

**MOTION-APPROX**
- board→Preferences presentation is fast, roughly **0.1–0.2 s** in the 0.1 s sample sequence;
- the source uses opacity/dimming plus surface appearance rather than a long directional slide.

**VERSION PRECEDENCE**
- current SS-C07 has a wider modern Preferences composition. Use VE-014 for interaction semantics, not as the final modern pixel geometry target.

### ~00:00:14.8–00:00:18.0 — Preferences access from Focus

**VIDEO-DIRECT**
- tutorial cuts/presents the Focus Panel and uses the same top-right cog;
- selecting it replaces the task list area with a narrow `Preferences` surface while retaining the docked-panel footprint.

**MOTION-DIRECT**
- narrow Focus→Preferences content swap occurs quickly, with no separate desktop modal.

**VERSION PRECEDENCE**
- this source does not use the newer `Menu → Quick Preferences` naming/composition shown in SS-H05;
- treat the video as earlier interaction ancestry, not as current exact Focus settings UI.

### ~00:00:20–00:00:29 — Blitz Panel screen selection

**VIDEO-DIRECT**
- `Blitz Panel` section contains `Select Screen`;
- selected monitor is represented by a desktop thumbnail with a bright cyan/green outline;
- source monitor overlay reads **1470×956**;
- selected label is `Screen 1`.

**TRANSCRIPT-CLAIM / DIRECT LIMIT**
- narration says multiple monitors can be selected;
- the staged source visibly contains one selected screen, so multi-monitor enumeration behavior is not inferred beyond the stated capability.

### ~00:00:29–00:00:35 — Blitz Panel Side

**VIDEO-DIRECT**
- `Blitz Panel Side` is a Left/Right segmented control;
- source begins with Left selected;
- selecting Right immediately changes the selected segment.

**RESULT-DIRECT**
- the tutorial then shows the Focus Panel on the **right** edge of the desktop, confirming that the setting controls physical panel side.

**CUT/UNMEASURABLE**
- the crossfade between Preferences and the right-docked Focus demonstration is tutorial presentation and must not be treated as product transition timing.

### ~00:00:36–00:00:44 — Theme segmented control

**VIDEO-DIRECT / MOTION-DIRECT**
- Theme presents three sibling choices:
  - `System`
  - `Dark`
  - `Light`
- System is initially selected;
- selecting Light changes the Preferences surface to light styling **in place**, without closing it;
- selecting Dark changes it back to dark styling in place;
- selected segment uses the bright accent fill.

**MOTION-APPROX**
- theme application is effectively immediate in the 0.1 s samples; no long transition animation is visible.

### ~00:00:48–00:01:00 — Hide est/done times demonstration

**VIDEO-DIRECT**
- `Hide est/done times on tasks` is a parent toggle in General;
- after the setting is demonstrated, the tutorial shows Focus task rows with reduced resting metric detail;
- task timing detail can still be exposed contextually during task interaction/hover, matching the narration's stated behavior.

**EVIDENCE LIMIT**
- the tutorial uses crossfades between Preferences and Focus during this demonstration;
- those crossfades are not reliable product-motion evidence.

### ~00:01:00–00:01:03 — Pomodoros child reveal

**VIDEO-DIRECT**
- `Pomodoros` is a parent toggle under `Blitz mode settings`;
- turning it on reveals two nested controls beneath an indented vertical guide:
  - `Work Sprint`
  - `Break Time`.

**MOTION-APPROX**
- child controls are present by the next 0.1 s sample after toggle activation;
- behavior is best characterized as **fast inline disclosure/reflow (~0.1 s)** rather than modal presentation.

### ~00:01:03–00:01:10 — Work Sprint / Break Time values

**VIDEO-DIRECT**
- Work Sprint is a compact minutes dropdown;
- source menu visibly includes short presets including 5, 10, 15 and additional longer values;
- demonstrated final Work Sprint value becomes **30 mins**;
- Break Time is separately configured and demonstrated as **10 mins**.

**HIERARCHY-DIRECT**
- both controls remain nested under Pomodoros;
- disabling Pomodoros would therefore conceptually own their visibility, but this clip primarily demonstrates the ON/revealed state.

### ~00:01:10–00:01:19 — Default break length + scrolling title

**VIDEO-DIRECT**
- `Default break length` remains a **top-level Blitz mode setting**, not a Pomodoro child;
- demonstrated value: **10 mins**;
- `Scrolling title on live timer` is a separate toggle and is ON in the demonstrated final state.

**SEMANTIC DISTINCTION**
- Pomodoro Break Time and Default break length are separate settings with different parentage.

### ~00:01:24–00:01:33 — Timed alerts hierarchy

**VIDEO-DIRECT**
- `Timed alerts during a task` is a parent toggle;
- when enabled, an indented child group is visible:
  - `Pick task alert timings`;
  - `Pick an alert sound`;
  - `Animated flash on timer`.
- timing is a compact minutes dropdown;
- source demonstrates changing the interval to **30 mins**;
- the open menu visibly contains multiple presets including **20 mins, 25 mins, 30 mins and 60 mins**.

**STATE RETENTION**
- chosen interval remains visible after the menu closes.

### ~00:01:33–00:01:52 — task-alert sound, preview and volume

**VIDEO-DIRECT**
- sound row combines:
  - speaker/volume button;
  - play/preview triangle;
  - sound dropdown.
- source sound label changes during the tutorial; one later selected value is visibly truncated as `Futuristic...`;
- exact full sound-name suffix is not reliably readable and is intentionally not invented.
- clicking the speaker control opens a compact **vertical volume slider popover** anchored directly above/near the speaker;
- slider uses a bright green thumb/filled portion;
- play button is separate from volume.

**TRANSCRIPT + DIRECT**
- narration's sound/volume customization is fully corroborated by the visible controls.

### ~00:01:32–00:01:36 and ~00:01:53–00:01:56 — Animated flash on timer

**VIDEO-DIRECT**
- `Animated flash on timer` is a child toggle of Timed Alerts;
- tutorial demonstrates the resulting effect on a Focus task:
  - the live task row/card receives a temporary violet/pink accent wash;
  - task title/time remain readable;
  - the rest of the Focus surface remains substantially unchanged.

**MOTION-APPROX**
- visible flash persists for roughly **0.5–0.7 s** in the sampled sequence and fades back to normal;
- this is a localized task-timer flash, not a full-desktop flash.

### ~00:01:56–00:02:06 — Notification Alerts

**VIDEO-DIRECT**
- `Notification Alerts` is a separate parent toggle;
- it owns its own nested `Pick an alert sound` row;
- the row independently contains speaker/volume, preview triangle and sound dropdown;
- demonstrated selected sound is again visibly truncated as `Futuristic...`.

**SEMANTIC DISTINCTION**
- task timed-alert sound and general notification sound are independently configurable.

**VERSION PRECEDENCE**
- this tutorial groups due/task/break/Pomodoro notifications under Notification Alerts;
- the newer current SS-C08 additionally shows a separate `Schedule reminders (system)` + Reminder timing hierarchy, which supersedes VE-014 for the current inventory.

### ~00:02:06–00:02:13 — Celebrate task completion hierarchy

**VIDEO-DIRECT**
- new section `Celebrate task completion`;
- `Show success screen` is a parent toggle;
- `Fun gif on success screen` appears indented beneath it;
- `Success sound effect` is a separate row with its own enable toggle plus sound controls;
- selected success sound is clearly **`Victory Bell`**.

**HIERARCHY-DIRECT**
- GIF is visually subordinate to Show success screen;
- success sound is presented as a sibling capability rather than inside the GIF child row.

### ~00:02:13–00:02:21 — success screen without/with GIF

**VIDEO-DIRECT**
- tutorial switches to Focus to demonstrate completion presentation;
- success surface appears in-place in the Focus panel with:
  - completed task title;
  - `Well done!`;
  - gradient `Next Task`;
  - secondary break option.
- one demonstrated success state contains **no reaction GIF**, proving the success screen itself can exist independently of GIF media;
- a later demonstrated state contains the reaction GIF while retaining the same success structure.

**CUT/UNMEASURABLE**
- Preferences↔Focus crossfades in this comparison are tutorial edits;
- do not derive success-screen entrance timing from them.

### ~00:02:21–00:02:28 — success sound control demonstration

**VIDEO-DIRECT**
- Preferences returns to the completion section;
- success sound controls show speaker/volume + play preview + `Victory Bell` dropdown;
- pointer demonstrates the sound-preview control.

**AUDIO/MOTION BOUNDARY**
- the existence of preview behavior is direct;
- no implementation-specific audio API, buffering behavior or exact playback latency is inferred.

### ~00:02:28–00:02:44 — final Preferences overview

**VIDEO-DIRECT**
- tutorial leaves Preferences in a configured state:
  - Pomodoros ON;
  - Work Sprint 30 mins;
  - Break Time 10 mins;
  - Default break length 10 mins;
  - Scrolling title ON;
  - Timed alerts ON;
  - alert timing 30 mins;
  - Animated flash ON;
  - Notification Alerts ON;
  - Show success screen ON;
  - Fun GIF ON;
  - Success sound effect ON;
  - Victory Bell selected.
- internal Preferences scroll is used to move between sections;
- section content scrolls vertically inside the narrow Preferences surface.

### ~00:02:44–00:02:48.48 — outro

**VIDEO-DIRECT / NON-PARITY**
- source remains on Preferences briefly and then cuts to the Blitzit end card;
- end card is tutorial branding, not product UI parity evidence.

## VE-014 source synthesis

High-confidence interaction behavior established:
- main app cog opens Preferences over the current app context;
- Focus cog can expose settings within the narrow Focus footprint in this older source;
- screen selection uses monitor thumbnails and explicit dimensions;
- panel side is a direct Left/Right segmented setting and visibly affects docking side;
- System/Dark/Light theme changes apply live in-place;
- hide-times behavior is contextual rather than permanent data removal;
- Pomodoro is a parent disclosure with nested Work Sprint/Break Time;
- Pomodoro child reveal is a very fast inline reflow;
- Work Sprint and Break Time are independent values;
- Default break length is not a Pomodoro child;
- Timed Alerts own interval/sound/animated-flash children;
- sound rows consistently separate volume, preview and sound selection;
- animated flash is localized to the active task/timer and lasts roughly 0.5–0.7 s in this source;
- Notification Alerts keep an independent sound configuration;
- Show success screen can operate without GIF media;
- Fun GIF is a child of success-screen presentation;
- Success sound is independently configurable, with Victory Bell demonstrated;
- Preferences uses internal vertical scrolling and retains configured values.

Cross-source precedence/evolution:
- SS-C07/C08/C09 are stronger for current v2.6.69 option inventory;
- SS-H05 is stronger for the modern Focus `Quick Preferences` composition;
- VE-014 remains the strongest source for the demonstrated conditional reveal behaviors, live theme application, localized alert flash and success-screen-with/without-GIF comparison.

No implementation conclusion is made in this analysis track.

---

# Queue 5 — VE-016 — Timer Modes

Source: `Blitzit Tutorial Timer Modes.mp4`  
Verified metadata: **02:55.380 container / 02:55.333 video stream, 1920×1080, 60 fps, 10,520 video frames**  
Pass-3 status: **SOURCE_COMPLETE / IMPLEMENTATION_DEFERRED**

Inspection method:
- complete source scanned across the full duration;
- 2 s whole-video contact scan;
- 0.5 s dense sampling across EST setup, zero/Extend, Pomodoro configuration/work↔break and count-up/Time Taken sections;
- full-resolution keyframes around countdown zero, `TIME'S UP`, Extend, Pomodoro zero→Break, Break Over→work and manual Taken editing;
- frame/dense review used only where tutorial footage remained continuous;
- SRT used to classify narrated rules separately from direct pixel evidence.

## VE-016 chronological state map

### 00:00:00–~00:00:17 — board baseline and existing-task EST editing

**VIDEO-DIRECT**
- dark four-column board is the starting surface;
- Today contains `Post launch announcement` and `Send press-release`;
- the EST affordance on a task is edited inline in the card metric area rather than through a modal;
- the board retains ordinary task hover/action geometry while the estimate is edited.

**VIDEO-DIRECT / VALUE**
- `Post launch announcement` is prepared with a **30 min** EST for the countdown demonstration.

### ~00:00:17–00:00:22 — EST field in inline task creation

**VIDEO-DIRECT**
- Today `+ ADD TASK` expands the same inline-create pattern seen in VE-005;
- title and EST are sibling inputs;
- EST uses HH:MM-style entry;
- Cancel/Confirm remain in-lane.

**EVIDENCE LIMIT**
- this sequence demonstrates field availability but does not establish additional validation/error states beyond VE-005.

### ~00:00:22–00:00:32 — Blitz entry and EST countdown

**VIDEO-DIRECT**
- entering Focus makes `Post launch announcement` live;
- countdown begins around **00:29:5x**, directly matching the configured 30 min estimate;
- `Send press-release` remains queued;
- Focus headline/queue geometry matches the established Focus grammar.

**CUT/TIME-COMPRESSION**
- the tutorial does not wait 30 real minutes;
- later footage jumps the countdown close to zero;
- therefore the long countdown duration itself is staged/tutorial-compressed and not a source transition timing measurement.

### ~00:00:38–00:00:41 — pause state during live-EST discussion

**VIDEO-DIRECT**
- live-task action rail is exposed;
- Pause changes the live task to explicit `PAUSED`;
- Resume returns to countdown behavior.

**TRANSCRIPT-CLAIM / PARTIAL CORROBORATION**
- narration states a live task's EST may only be added/adjusted while the live timer is paused;
- the source demonstrates the relevant paused state during that explanation;
- it does **not** show a rejected running-state edit attempt, so the prohibition itself remains a narrated rule rather than a measured validation/error state.

### ~00:00:41–00:00:44.5 — countdown reaches zero

**VIDEO-DIRECT**
- staged near-zero countdown proceeds visibly through the final seconds;
- direct full-resolution frames show:
  - around 44.0 s: **00:00:01**;
  - shortly after: zero boundary;
  - by ~44.4–44.5 s: live label is **`TIME'S UP`**.
- the card remains the live card; queue/window geometry does not change.

**MOTION-DIRECT**
- zero→Time's Up is a fast content/state replacement, not a success screen or page transition.

### ~00:00:44.5–00:00:53.5 — Time's Up action state

**VIDEO-DIRECT**
- `TIME'S UP` replaces the numeric countdown in the live row;
- hovering the live row reveals the live action strip;
- normal live controls remain present, and the expired state adds an explicit **`Extend`** action;
- Skip and Done are also directly demonstrated as available choices in the expired state;
- `Extend` is visibly exposed as a labeled hover pill before activation.

**ACTION-SEMANTIC**
- Time's Up does not automatically complete or advance the task;
- user choice is required.

### ~00:00:53.5–00:01:04 — Extend → overdue timer

**VIDEO-DIRECT**
- selecting Extend leaves the same task live;
- countdown presentation switches to a warm/orange **negative overdue timer**;
- successive visible values become increasingly negative as time continues.

**CUT/STAGING LIMIT**
- the tutorial jumps from Time's Up to roughly a minute-overdue value rather than showing every intervening second;
- do not infer that Extend itself adds/subtracts exactly one minute;
- the source truth is the **direction/semantics**: after Extend, elapsed-over-EST time is represented as an increasingly negative overdue value.

### ~00:01:04–00:01:20 — Pomodoro introduction/context

**VIDEO-DIRECT / TRANSCRIPT**
- Focus remains present while narration introduces Pomodoro;
- no unique automatic transition is claimed until the preferences configuration and staged boundary below.

### ~00:01:22–00:01:31 — Pomodoro configuration in Focus Preferences

**VIDEO-DIRECT**
- Focus cog opens Preferences inside the narrow companion window;
- Pomodoros is enabled;
- demonstrated child values:
  - **Work Sprint: 5 mins**
  - **Break Time: 5 mins**
- Default break length remains a separate setting;
- alert/sound settings remain visible below, confirming Pomodoro configuration coexists with the broader preferences hierarchy.

**TUTORIAL-STAGING**
- 5-minute work/break values are deliberately short demonstration values; they are source-visible configuration, not universal defaults.

### ~00:01:32–00:01:34.5 — Pomodoro work sprint reaches zero

**VIDEO-DIRECT**
- returning to Focus shows `Send press-release` as live with a green `POMO` badge;
- direct frames show the final work-sprint countdown:
  - ~93.0 s: **00:00:02**;
  - ~94.0 s: **00:00:01**;
  - ~94.5 s: **00:00:00**.
- the parent task is not marked Done when the Pomodoro work interval reaches zero.

### ~00:01:35 — automatic work→Break transition

**VIDEO-DIRECT / BOUNDARY-DIRECT**
- immediately after the POMO work countdown reaches zero, the live card becomes:
  - title **`Break`**;
  - green `POMO` badge;
  - countdown **00:04:59**.
- `Send press-release` returns to the ordinary queue beneath the live Break card;
- `Finish the video` remains queued below it;
- no success screen is involved.

**ARITHMETIC/HEADER-DIRECT**
- Focus headline changes to **Est: 10min** in this staged state while the 5-minute Break card is active;
- this source behavior is recorded as observed and not generalized beyond this version/state.

### ~00:01:35–00:01:39 — break interval staging

**CUT/TIME-COMPRESSION**
- the source begins the Break at 4:59 but tutorial editing/time compression advances it close to completion within only a few real seconds;
- therefore the actual five-minute wait is not motion evidence.

### ~00:01:39–00:01:41 — Break Over state

**VIDEO-DIRECT**
- at break completion the live title becomes **`Break Over`** with **00:00**;
- Break also appears in the Done/history region as a struck-through row with a break/gamepad-like badge and **5min**;
- the earlier completed `Post launch announcement` remains below it;
- the Done/history aggregate visibly includes the break interval.

**INTERACTION-DIRECT**
- hovering Break Over exposes a labeled **`Done`** action;
- the next work sprint does **not** visibly start until that action is explicitly used in this demonstrated flow.

### ~00:01:41.5–00:01:42.5 — explicit Break Over Done → next Pomodoro work sprint

**VIDEO-DIRECT**
- activating Done on Break Over produces a very brief empty/live-card-shell transitional state;
- then `Send press-release` becomes live again with:
  - green `POMO` badge;
  - fresh **00:04:59** work countdown.
- thus the demonstrated cycle is:
  **work reaches zero → automatic Break → Break Over → explicit Done → next work sprint**.

**VERSION-SCOPE**
- this is the exact source behavior of VE-016; do not replace it with a generic assumption that Pomodoro automatically starts the next work sprint without user action.

### ~00:01:43–00:01:49 — Pomodoro in Floating Timer

**VIDEO-DIRECT**
- the active Pomodoro `Send press-release` timer is shown in the Floating Timer;
- title and work countdown remain visible in the compact window;
- the same work-sprint identity/countdown survives the Focus→Floating presentation change.

**MOTION**
- Panel↔Floating geometry behavior belongs to the already measured morph family from VE-003/VE-013; this tutorial does not establish a contradictory presentation model.

### ~00:01:50–00:01:58 — no-EST/no-Pomodoro count-up mode

**VIDEO-DIRECT**
- tutorial switches to a task `Email campaign` in a non-Pomodoro/no-EST state;
- its live timer visibly **counts upward**, e.g. roughly:
  - 00:04:19;
  - 00:04:21;
  - 00:04:23;
  - 00:04:25;
  - 00:04:27.
- this directly establishes positive count-up behavior when a countdown mode is not governing the task.

**CUT/SCENARIO BOUNDARY**
- the switch into this staged example is tutorial-edited; do not infer task-switch latency from it.

### ~00:02:00–00:02:12 — Time Taken accumulation / additional count-up example

**VIDEO-DIRECT**
- source returns through the board/Focus workflow to `Send press-release` in a count-up state;
- live numeric time progresses upward from roughly the mid-teens into the twenties;
- Focus header shows **Est: 0min**, directly distinguishing this mode from an EST countdown.

**SEMANTIC-DIRECT**
- live elapsed time is being accumulated as actual work time rather than remaining estimate.

### ~00:02:12–00:02:16 — manual Time Taken edit

**VIDEO-DIRECT**
- the live card's lower-right time metric is hovered;
- tooltip reads **`Taken. HH:MM`**;
- clicking opens a compact inline HH:MM editor in the metric slot;
- demonstrated edit proceeds from `00:00` through typed input and commits to **30min**;
- the editor closes back to the ordinary metric display.

**IMPORTANT**
- manual Taken editing is in-place and uses the same compact time-format grammar as EST;
- this sequence directly establishes the editable field and committed value;
- it does not demonstrate invalid input/error behavior.

### ~00:02:17 onward — pause and Time Taken recap

**VIDEO-DIRECT**
- the same live task is then shown as **PAUSED**;
- committed **30min** Taken remains visible;
- the rest of the tutorial keeps this state while narration summarizes timer modes and Time Taken semantics.

**TRANSCRIPT-CLAIM / DIRECT CORROBORATION**
- narration states Time Taken is recorded regardless of whether EST or Pomodoro is used;
- this full universality is a narrated product claim;
- direct footage separately corroborates Taken semantics across countdown/count-up examples but does not exhaustively execute every mode combination.

### ~00:02:52–00:02:55.380 — branded outro

**VIDEO-DIRECT / NON-PRODUCT**
- hard transition to Blitzit branded outro;
- non-product tutorial material, excluded from parity requirements.

## VE-016 source synthesis

High-confidence source behavior established:
- EST task time produces a true remaining-time countdown;
- a live EST task has an explicit Pause/Resume state;
- near-zero countdown changes to `TIME'S UP` without auto-completing the task;
- expired live state retains Skip/Done and adds Extend;
- Extend keeps the task live and changes timer representation to increasingly negative overdue time;
- source editing prevents interpreting the first negative value as an exact one-minute Extend increment;
- Pomodoro configuration in this tutorial is 5-minute work + 5-minute break;
- POMO badge is visible on the live task;
- work countdown zero automatically becomes a live Break card at 4:59;
- parent task returns to queue during Break;
- completed break is represented as `Break Over 00:00` and a 5min Done/history row;
- demonstrated flow requires explicit Done on Break Over before a fresh 4:59 Pomodoro work sprint starts;
- active Pomodoro state survives presentation in Floating Timer;
- no-EST/no-Pomodoro mode directly counts upward;
- Time Taken is an inline editable `Taken. HH:MM` metric and is demonstrated committing to 30min;
- tutorial cuts/time compression are explicitly separated from genuine application transitions.

No implementation conclusion is made in this analysis track.

---

# Queue 6 — VE-017 — Update Recurring Schedules

Source: `Blitzit Tutorial Update Recurring Schedules.mp4`  
Verified metadata: **02:50.063 container / 02:50.000 video stream, 1920×1080, 60 fps, 10,200 video frames**  
Pass-3 status: **SOURCE_COMPLETE / IMPLEMENTATION_DEFERRED**

Inspection method:
- complete 170 s source scanned end-to-end;
- 2 s whole-video contact scan;
- full-resolution keyframes around existing recurring-parent menu, custom-rule edit, Replace Existing Tasks, No Repeat/Delete Existing Tasks, Remove Recurring, re-scheduling after detachment and duplicate-child outcome;
- direct board counts/labels reconciled before and after each demonstrated mutation;
- narration kept separate where the source does not execute the alternative branch.

## VE-017 chronological state map

### 00:00:00–~00:00:34 — tutorial/context setup

**VIDEO-DIRECT / NON-UNIQUE**
- source begins on the dark planning board and briefly references earlier recurring-schedule tutorials;
- no unique recurring-update state is established until the `Get some sleep` example.

### ~00:00:34–00:00:38 — existing daily parent + seven generated children

**VIDEO-DIRECT**
- Backlog contains a dedicated `Recurring tasks` parent:
  - `Get some sleep`;
  - recurrence label **`Daily`**;
  - recurring/loop icon.
- list header reports **7 pending tasks**;
- Today contains one current `Get some sleep` child;
- This Week contains six further scheduled `Get some sleep` children;
- together the source visibly represents the seven generated daily instances associated with the current recurring parent.

### ~00:00:38–00:00:40 — recurring-parent overflow menu

**VIDEO-DIRECT**
- the recurring parent has a specialized overflow grammar:
  1. `Update Recurring`
  2. `Remove Recurring`
  3. divider
  4. `Duplicate`
  5. `Delete` in red.
- this menu differs from an ordinary detached task's Schedule / Change list / Duplicate / Delete menu.

### ~00:00:40–00:00:50 — update Daily → custom Fri/Sat/Sun

**VIDEO-DIRECT**
- `Update Recurring` opens the schedule editor over the board;
- editor retains `PICK DATE`, current date, Add Time and Recurring schedule;
- recurrence preset list can be replaced with `Custom`;
- Custom editor exposes:
  - `Repeat every`;
  - numeric interval;
  - unit dropdown;
  - seven weekday chips;
  - generated natural-language summary;
  - conditional existing-task action row;
  - Cancel / gradient Schedule footer.
- demonstrated rule becomes:
  - **Repeat every 1 week**
  - **Friday, Saturday, Sunday** selected.
- natural-language summary reads **`every week on Friday, Saturday, Sunday`**.

### ~00:00:50–00:00:53 — Replace Existing Tasks neutral action

**VIDEO-DIRECT**
- because this parent still owns the existing generated set, editor shows a neutral checkbox row:
  - **`Replace existing tasks(7)`**.
- row uses normal/dark surface treatment, not destructive red;
- checkbox is explicitly selected before Schedule is committed.

**SEMANTIC-DIRECT**
- the number in parentheses directly corresponds to the seven currently generated scheduled children.

### ~00:00:53–00:00:57 — replace commit result

**VIDEO-DIRECT**
- after Schedule:
  - success toast: **`Updated recurring tasks successfully!`**;
  - recurring parent remains in Backlog;
  - parent recurrence label changes from **Daily → Custom**;
  - seven prior generated children are replaced by exactly **three** visible scheduled children:
    - Fri;
    - Sat;
    - Sun;
  - list header changes from 7 pending to **3 pending tasks**.

**ARITHMETIC/IDENTITY-DIRECT**
- 7 old generated children → 3 children matching the new selected weekdays;
- this is direct evidence of the Replace Existing Tasks behavior, not merely narration.

### ~00:00:57–00:01:16 — replacement alternative explained

**TRANSCRIPT-CLAIM**
- narration states that without selecting Replace Existing Tasks, the already-generated child tasks would remain while new recurrence-generated tasks are added;
- this exact unchecked-Replace branch is **not executed** in this first demonstration;
- later detachment/re-schedule footage provides direct evidence for coexistence/duplicates, but it should not be mislabeled as the same internal branch.

### ~00:01:16–00:01:28 — reopen updated recurring rule

**VIDEO-DIRECT**
- board still shows:
  - Custom recurring parent;
  - three Fri/Sat/Sun scheduled children.
- parent can again be opened through Update Recurring;
- existing editor reconstructs the Custom every-1-week Friday/Saturday/Sunday rule.

### ~00:01:28–00:01:32 — switch recurring rule to No Repeat

**VIDEO-DIRECT**
- selecting **`No Repeat`** collapses/removes the custom interval/day controls;
- the existing-task consequence row changes category and visual severity.

### ~00:01:32–00:01:35 — destructive Delete Existing Tasks state

**VIDEO-DIRECT**
- No Repeat displays a red/warm destructive row:
  - **`Delete existing tasks(3)`**;
- this row replaces the neutral Replace Existing Tasks treatment;
- checkbox remains explicit/user-controlled;
- Cancel and Schedule footer remain unchanged.

**DIRECT CONTRAST**
- active recurring rule update: neutral `Replace existing tasks(n)`;
- No Repeat: destructive `Delete existing tasks(n)`.

This distinction is directly visible and must not be flattened into one generic “replace/delete children” option.

### ~00:01:35–00:01:37 — No Repeat + Delete Existing commit

**VIDEO-DIRECT**
- Delete Existing Tasks is selected and Schedule is committed;
- resulting board contains only one `Get some sleep` task;
- generated Fri/Sat/Sun children are gone;
- recurring-parent grouping/label is no longer present for that remaining task.

**RESULT-DIRECT**
- the remaining item is a normal single task, not an active recurring parent.

### ~00:01:37–00:01:46 — unchecked Delete alternative

**TRANSCRIPT-CLAIM**
- narration says choosing No Repeat without Delete Existing would leave generated children as independent tasks;
- this exact unchecked-No-Repeat branch is not separately executed here;
- do not claim a measured mutation from narration alone.

### ~00:01:47–00:01:53 — reset scenario: Custom parent + children

**TUTORIAL-STAGING / VIDEO-DIRECT**
- tutorial resets to a scenario with:
  - recurring `Get some sleep` parent;
  - Custom rule;
  - Fri/Sat/Sun scheduled children.
- reset is editorial/staged; do not interpret it as an application undo transition.

### ~00:01:51–00:01:53 — Remove Recurring

**VIDEO-DIRECT**
- recurring-parent overflow again shows Update Recurring / Remove Recurring / Duplicate / Delete;
- `Remove Recurring` is activated.

### ~00:01:53–00:01:55 — detachment result

**VIDEO-DIRECT**
- parent task remains visible, but:
  - it leaves the `Recurring tasks` parent grouping;
  - recurring label/loop metadata disappears;
  - ordinary hover/overflow grammar returns.
- the previously generated **Fri / Sat / Sun children remain visible** in This Week.

**MENU-DIRECT**
- detached parent's ordinary overflow now reads:
  1. `Schedule`
  2. `Change list`
  3. `Duplicate`
  4. `Delete`.
- Update Recurring / Remove Recurring are gone.

This is direct visual evidence of parent-child detachment without child deletion.

### ~00:01:55–00:02:01 — re-schedule detached parent

**VIDEO-DIRECT**
- Schedule on the now-ordinary parent opens the date/recurrence editor as a new scheduling operation;
- a new recurrence preset is selected (the demonstration moves through preset choices and settles on **Every day**).

**CRITICAL VIDEO-DIRECT**
- editor **does not show `Replace existing tasks(...)`**;
- the old Fri/Sat/Sun children are still visible behind the modal;
- Schedule footer remains available.

This directly confirms the narrated rule that once the old schedule relationship is detached, a later new schedule has no replace relationship to those old children.

### ~00:02:01–00:02:06 — re-schedule result: coexistence / duplicates

**VIDEO-DIRECT**
- after scheduling the detached parent again:
  - Backlog once again shows a recurring parent, now **Daily**;
  - new daily-generated `Get some sleep` entries appear;
  - old Fri/Sat/Sun detached children remain;
  - duplicate same-day labels are visibly present in This Week;
  - list header reaches **10 pending tasks** in the demonstrated state.

**DIRECT DUPLICATION EVIDENCE**
- source visibly contains multiple `Get some sleep` rows for the same weekday/date family after re-scheduling;
- this is direct corroboration of “new entries alongside old ones” after detachment.

### ~00:02:06–00:02:28 — why detached/customized children are preserved

**VIDEO-DIRECT**
- tutorial hovers/edits one of the surviving child rows:
  - EST affordance is independently editable;
  - Notes can expand inline on an individual generated/detached child;
  - child rows remain ordinary editable task cards.
- inline Notes editor occupies the child card and preserves the surrounding board.

**TRANSCRIPT-CLAIM / VISUAL CORROBORATION**
- narration explains preservation exists so renamed children, EST changes or Notes are not overwritten automatically;
- source directly shows EST and Notes affordances on individual child tasks, corroborating that these children can contain user-specific edits;
- it does not execute every possible customization/overwrite conflict.

### ~00:02:28–00:02:46 — summary

**VIDEO-DIRECT**
- board remains populated with parent + old/new child entries while narration summarizes the two user choices;
- no additional unique control state appears.

### ~00:02:46–00:02:50.063 — branded outro

**VIDEO-DIRECT / NON-PRODUCT**
- hard transition to Blitzit logo/tagline outro;
- excluded from application parity requirements.

## VE-017 source synthesis

High-confidence source behavior established:
- recurring parents use a specialized Update Recurring / Remove Recurring menu;
- Daily parent directly owns seven currently generated children in the initial example;
- custom weekly editor exposes interval, unit, weekday chips and natural-language rule summary;
- active relationship displays neutral `Replace existing tasks(n)`;
- selecting Replace on a 7-child Daily set and changing rule to Fri/Sat/Sun directly yields 3 generated children and parent label Custom;
- No Repeat swaps neutral Replace for destructive red `Delete existing tasks(n)`;
- selecting Delete Existing Tasks(3) removes the generated children and leaves one ordinary single task;
- Remove Recurring is semantically distinct from No Repeat + Delete: it detaches the parent while visibly retaining existing Fri/Sat/Sun children;
- after detachment the task's menu becomes ordinary Schedule / Change list / Duplicate / Delete;
- re-scheduling that detached parent shows no Replace Existing Tasks row;
- new Daily entries are then created alongside the retained old children, visibly producing duplicates and 10 pending tasks;
- individual child rows remain independently editable (including EST and Notes), visually corroborating the rationale for avoiding destructive overwrite;
- tutorial resets/cuts are explicitly separated from application mutation timing;
- unchecked Replace and unchecked Delete alternatives remain narration-only unless/direct until another source executes them.

No implementation conclusion is made in this analysis track.

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
