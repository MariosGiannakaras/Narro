# Blitzit Forensic Pass 3 — Video Queue and Records

Status: **ACTIVE — 14/19 full MP4s complete at Pass-3 depth**

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
Verified metadata: **02:55.333 video stream / 02:55.380 container, 1920×1080, 60 fps, 10,520 frames**  
Pass-3 status: **SOURCE_COMPLETE / IMPLEMENTATION_DEFERRED**

Inspection method:
- complete raw MP4 reviewed across the whole duration;
- 4 s full-source scan;
- 0.5–1 s dense sampling across EST setup, countdown, Time's Up, Extend, Pomodoro and count-up sections;
- 0.1 s frame-level sequences at the normal countdown zero boundary and Pomodoro work→break boundary;
- 0.1 s Extend-state sequence;
- 0.25 s sequence around count-up Pause and manual Time Taken entry;
- full-resolution crops used for exact timer labels, metric values, hover labels and progress state;
- SRT used only to separate narration claims from direct pixels.

## VE-016 chronological state map

### 00:00:00–~00:00:18 — board baseline / EST context

**VIDEO-DIRECT**
- tutorial begins on the four-column planning board;
- Today contains `Post lunch announcement` and `Send press-release`;
- EST and Taken remain card-level opposing metrics;
- Today aggregate and list-header EST values update as task estimates are changed.

### ~00:00:18–00:00:25 — existing-task EST edit

**VIDEO-DIRECT**
- `Send press-release` lower-left EST metric is edited inline;
- field uses HH:MM-style entry;
- committed value becomes **40min**;
- `Post lunch announcement` is **30min** in this initial staged state;
- resulting list / Today aggregate visibly becomes **1hr 10min** = 30min + 40min;
- Taken remains 0min.

**ARITHMETIC-DIRECT**
- the aggregate shown by the UI is numerically consistent with the two visible EST values.

### ~00:00:25–00:00:31 — EST at task creation

**VIDEO-DIRECT**
- inline `+ ADD TASK` editor is opened;
- title and `Est time` are sibling fields;
- EST field begins at `00:00`;
- the create row uses Cancel + Confirm and remains inside the lane.

This independently corroborates VE-005.

### ~00:00:32–00:00:38 — Blitz entry / normal EST countdown

**VIDEO-DIRECT**
- Blitz/Focus opens with `Post lunch announcement` live;
- countdown is derived from its EST;
- source shows roughly **00:29:50 → 00:29:48** while running;
- `Send press-release` remains queued below.

### ~00:00:38–00:00:41.5 — pause-gated live EST edit

**VIDEO-DIRECT**
- hovering live task reveals action strip;
- Pause changes action label to `Resume`;
- while paused, lower-left EST metric is opened as editable **00:30**;
- this directly corroborates narration that a live task's EST is editable while paused.

**EVIDENCE LIMIT**
- source does not show a failed attempt while running, so rejection behavior is not independently measured.

### ~00:00:42 — staged jump to countdown boundary

**CUT / SOURCE-STAGING**
- source jumps from a ~30-minute countdown to a near-zero demonstration state;
- aggregate also changes to **41min** and active-task EST/Taken are staged as **1min / 1min**;
- this is tutorial setup, not real elapsed time and must not be used as timer-speed evidence.

### ~00:00:42–00:00:44.4 — final normal countdown second

**VIDEO-DIRECT / MOTION-MEASURED**
- active task shows `00:00:03 → 00:00:02 → 00:00:01`;
- 0.1 s review finds no stable visible `00:00:00` frame in this normal EST path;
- source remains at `00:00:01` through approximately 44.3 s;
- by approximately **44.4 s** the numeric timer is replaced by `TIME'S UP`.

### ~00:00:44.4–00:00:53.1 — persistent Time's Up state

**VIDEO-DIRECT**
- `TIME'S UP` replaces the timer inside the live card;
- state remains present for roughly **8.5+ seconds** until the user acts;
- it does not auto-skip or auto-complete.

**HOVER / ACTION-DIRECT**
- live action strip remains available;
- demonstrated contextual labels include:
  - `Skip`;
  - `Extend`;
  - Done/check remains present as a direct action.
- ordinary supporting actions (break/gamepad-like, Notes) remain in the strip.

**SEMANTIC FINDING**
- after expiry, the former countdown control role changes to Extend rather than continuing a zeroed numeric timer automatically.

### ~00:00:53.1–00:00:56 — Extend → overdue count

**VIDEO-DIRECT**
- Extend is activated;
- Time's Up state clears;
- active task returns to its ordinary title presentation;
- timer becomes a **negative overdue counter** in warm amber/orange;
- visible examples:
  - `-00:01:01`
  - `-00:01:02`
- negative value continues increasing in magnitude over time.

**SOURCE-STAGING LIMIT**
- the first visible overdue value is already about one minute negative although only seconds elapsed in the tutorial;
- therefore the semantic direction/count-up is direct evidence, but the initial negative magnitude is staged and not suitable for elapsed-time validation.

### ~00:01:18–00:01:31 — Pomodoro setup

**VIDEO-DIRECT**
- Preferences is opened;
- Pomodoros is ON;
- demonstration values are intentionally shortened:
  - Work Sprint **5 mins**;
  - Break Time **5 mins**;
  - Default break length **10 mins**.
- this source state is tutorial setup and not a universal default-value claim.

### ~00:01:32–00:01:34.9 — Pomodoro work sprint countdown

**VIDEO-DIRECT**
- Focus Panel shows `Send press-release` as active;
- small green `POMO` badge appears above/within the live-card timer area;
- header can still show `Est: 0min`: Pomodoro timer can drive work timing independently of task EST;
- countdown reaches:
  - `00:00:03`
  - `00:00:01`
  - then `00:00:00`.

**MOTION-MEASURED**
- unlike the ordinary EST Time's Up path, the Pomodoro work path **does display `00:00:00`** for several sampled frames;
- break state replaces it at approximately **95.0 s**.

### ~00:01:35 — work→break transition

**VIDEO-DIRECT**
- active row changes from task to **`Break`**;
- new break countdown begins at approximately **00:04:59**;
- original task moves back into the queue beneath Break;
- `POMO` badge remains associated with the Pomodoro state.

**MOTION-APPROX**
- transition completes between adjacent 0.1 s samples; no long animation is visible.

### ~00:01:36–00:01:40 — break countdown and staged break completion

**VIDEO-DIRECT**
- break counts downward (e.g. 04:58).

**CUT / SOURCE-TIME-JUMP**
- tutorial then jumps forward rather than waiting five minutes;
- later source shows `Break Over` at `00:00`;
- menu-bar/source time changes confirm this is staged elapsed time.

**DONE-STATE-DIRECT**
- completed Break appears in the Done section with **5min**;
- Done count increases accordingly.

### ~00:01:42–00:01:44 — next Pomodoro work state

**VIDEO-DIRECT**
- source later shows `Send press-release` active again with `POMO`;
- visible countdown is around **00:04:57**.

**TIMING LIMIT**
- because of tutorial time jumps, this proves the post-break work state but not exact automatic restart latency.

### ~00:01:43–00:01:49 — Pomodoro in Floating Timer

**VIDEO-DIRECT**
- presentation changes to Floating Timer;
- compact surface shows:
  - task title `Send press-release`;
  - Pomodoro countdown (e.g. **00:04:54**);
- Floating Timer preserves the active Pomodoro countdown while minimizing occupied space;
- resting compact state does not require the full Focus queue to remain visible.

**MOTION FAMILY**
- transition belongs to the same Focus↔Floating geometry family established in VE-003/VE-013; no new timing constant is inferred here.

### ~00:01:50 onward — later staged Pomodoro example

**CUT / SOURCE-TIME-JUMP**
- source jumps to another task (`Email campaign`) with a different countdown and substantially changed system clock;
- do not interpret this as an automatic next-task selection sequence.

### ~00:02:00–00:02:04 — no-EST task setup

**VIDEO-DIRECT**
- tutorial returns to board/list context and then Focus with a task that has no EST;
- Focus header reads **`Est: 0min`**.

### ~00:02:04–00:02:10 — count-up timer

**VIDEO-DIRECT / ARITHMETIC-DIRECT**
- `Send press-release` runs with no EST;
- timer counts **up**:
  - 00:00:16
  - 00:00:18
  - 00:00:20
  - 00:00:21...
- this is direct proof that no-EST + no active Pomodoro yields elapsed-time count-up rather than countdown.

### ~00:02:10–00:02:11.3 — Pause count-up timer

**VIDEO-DIRECT**
- hover action strip exposes `Pause`;
- clicking it stops the count-up and live card enters explicit **`PAUSED`** state;
- Resume role replaces Pause while stopped.

### ~00:02:11.3–00:02:16 — manual Time Taken entry

**VIDEO-DIRECT**
- while paused, lower-right Taken metric is opened as an inline HH:MM editor;
- field is typed from an initial `0` to **`00:30`**;
- commit renders **`30min`** at the lower-right of the task card;
- lower-left remains `+ EST`;
- header remains `Est: 0min`.

**SEMANTIC FINDING**
- manual Taken edit modifies actual-time metadata without creating an EST;
- EST and Taken remain independent dimensions.

**EVIDENCE LIMIT**
- this source pauses before editing Taken, but narration does not state that Taken editing is pause-gated; do not infer a universal pause requirement from this example alone.

### ~00:02:16–00:02:51 — metric explanation / paused final state

**VIDEO-DIRECT**
- live task remains paused with:
  - `+ EST` left;
  - `30min` Taken right;
  - `PAUSED` replacing running timer.
- previously completed task remains in Done with its own recorded timing.

**TRANSCRIPT-CLAIM + VISUAL CORROBORATION**
- narration states Blitz records Time Taken regardless of EST/Pomodoro mode;
- multiple source states display persistent Taken values, which supports the concept, but the clip does not exhaustively exercise every combination.

### ~00:02:51–00:02:55.38 — outro

**VIDEO-DIRECT / NON-PARITY**
- tutorial cuts to the Blitzit end card;
- end card is branding, not product parity evidence.

## VE-016 source synthesis

High-confidence behavior established:
- existing EST is inline editable in HH:MM form;
- visible board aggregate arithmetic follows task EST values;
- live countdown derives from EST;
- a live EST edit is directly demonstrated only after Pause;
- regular EST countdown changes from 00:00:01 to persistent `TIME'S UP`;
- Time's Up does not auto-progress;
- Skip / Done / Extend remain available after expiry;
- Extend converts expiry into an amber negative overdue counter;
- Pomodoro can run even with task EST = 0;
- Pomodoro uses a visible POMO badge in Focus;
- Pomodoro work countdown reaches visible 00:00:00 before Break;
- work→Break replacement occurs essentially immediately;
- Break is a first-class timed state and later appears in Done with its break duration;
- tutorial time jumps invalidate real 5-minute transition timing;
- Floating Timer can preserve Pomodoro task/countdown state;
- no-EST/no-Pomodoro task timer counts upward as a stopwatch;
- Pause freezes that count-up state;
- Taken can be entered manually as HH:MM and is rendered independently from EST;
- the source directly distinguishes planned EST from recorded/manual Taken.

No implementation conclusion is made in this analysis track.

---

# Queue 6 — VE-017 — Update Recurring Schedules

Source: `Blitzit Tutorial Update Recurring Schedules.mp4`  
Verified metadata: **02:50.000 video stream / 02:50.063 container, 1920×1080, 60 fps, 10,200 frames**  
Pass-3 status: **SOURCE_COMPLETE / IMPLEMENTATION_DEFERRED**

Inspection method:
- complete raw MP4 inspected across the whole duration;
- 4 s full-source contact scan;
- 0.5 s dense sampling across replace, No Repeat/delete and detach/recreate scenarios;
- 0.2 s micro-sequences around recurring-menu entry, Custom rule configuration, Replace checkbox, No Repeat conditional destructive row, schedule commit and detached re-scheduling;
- full-resolution crops used to verify exact consequence labels/counts and absence/presence of Replace;
- SRT used only to separate narrated rationale from direct UI evidence.

## VE-017 chronological state map

### 00:00:00–~00:00:23 — initial daily-recurring dataset

**VIDEO-DIRECT**
- source begins on the four-column board for `Blitz Tutorial`;
- one `Get some sleep` parent lives in the Backlog `Recurring tasks` group;
- parent metadata shows a daily recurring rule;
- generated child tasks occupy scheduled areas, including multiple `Get some sleep` rows in This Week and Today;
- before replacement, This Week visibly reports **6 Scheduled tasks this week**.

This is the linked parent/child baseline for the replacement demonstration.

### ~00:00:34–00:00:39.6 — recurring-parent overflow

**VIDEO-DIRECT**
- hovering/opening the recurring parent's overflow exposes a recurrence-specific menu;
- visible items:
  1. `Update Recurring`
  2. `Remove Recurring`
  3. `Duplicate`
  4. destructive `Delete`.
- `Update Recurring` is selected.

**SEMANTIC FINDING**
- recurrence lifecycle actions are elevated into the task overflow when the task is still a linked recurring parent.

### ~00:00:39.8–00:00:48 — update existing rule to Custom

**VIDEO-DIRECT**
- scheduling surface opens in place over the dimmed board;
- top retains picked date `Mon, Sep 22, 2025`;
- recurrence presets include:
  - No Repeat;
  - Every day;
  - Every weekday;
  - Every Monday;
  - Every month on 22nd;
  - Custom.
- existing rule initially shows `Every day`;
- selecting `Custom` expands:
  - `Repeat every` numeric control;
  - unit selector;
  - `Repeat On` weekday chips;
  - plain-language summary.
- unit is changed to **week**;
- Friday, Saturday and Sunday become the selected chips;
- summary resolves to **`every week on Friday, Saturday, Sunday`**.

**DISCLOSURE-DIRECT**
- Custom controls replace the simple preset-only state inside the same scheduling surface; no second modal is introduced.

### ~00:00:48–00:00:52 — Replace existing tasks consequence

**VIDEO-DIRECT**
- because this is an update of a still-linked recurring parent, a neutral consequence checkbox appears below the rule:
  - **`Replace existing tasks(7)`**.
- row uses ordinary/dark styling rather than destructive red;
- checkbox is selected before commit;
- footer remains:
  - `Cancel`
  - gradient `Schedule`.

**SEMANTIC DISTINCTION**
- Replace is a cleanup/re-materialization choice for an existing recurrence, not the destructive No Repeat removal action.

### ~00:00:52–00:00:54 — replacement commit

**VIDEO-DIRECT**
- Schedule is clicked;
- scheduling surface closes;
- toast reports **`Updated recurring tasks successfully!`**;
- recurring parent remains in Backlog and now carries `Custom`;
- This Week changes from the earlier six scheduled children to exactly **3 Scheduled tasks this week**:
  - Fri;
  - Sat;
  - Sun.

**ARITHMETIC / MATERIALIZATION-DIRECT**
- the visible child count and weekday labels match the new Friday/Saturday/Sunday custom rule;
- this is direct evidence that checking Replace removes the prior generated set and materializes the selected rule's current children.

### ~00:00:54–00:01:13 — keep-old-children explanation

**VIDEO-DIRECT**
- board remains on the new 3-child Fri/Sat/Sun state.

**TRANSCRIPT-CLAIM**
- narration explains that if Replace had not been selected, old child tasks would remain while the recurring rule updates, producing old + new children.
- this exact unchecked-update branch is not executed in the first scenario; the later detach/recreate sequence provides independent direct evidence of additive coexistence after detachment.

### ~00:01:14–00:01:24 — setup for recurrence removal

**VIDEO-DIRECT**
- recurring parent and its three Fri/Sat/Sun children remain visible;
- the tutorial re-enters the recurring parent lifecycle controls.

### ~00:01:24–00:01:29 — Update Recurring → No Repeat

**VIDEO-DIRECT**
- `Update Recurring` opens the scheduling surface with the current weekly Fri/Sat/Sun rule selected;
- selecting **`No Repeat`** changes the selected preset in the same surface.

**CONDITIONAL-UI-DIRECT**
- the neutral Replace row disappears;
- a warm/destructive consequence row appears:
  - **`Delete existing tasks(3)`**.
- the count exactly matches the three currently materialized Fri/Sat/Sun children.

**MOTION-APPROX**
- consequence-row substitution is effectively immediate in the 0.2 s samples; no separate confirmation dialog appears.

### ~00:01:29–00:01:34 — Delete existing children + remove recurrence

**VIDEO-DIRECT**
- `Delete existing tasks(3)` is checked;
- Schedule commits the No Repeat state;
- the three generated scheduled children disappear;
- one `Get some sleep` task remains as an ordinary single item;
- recurring-group/linked recurrence presentation is no longer present.

**SEMANTIC-DIRECT**
- No Repeat + Delete Existing removes both the recurring relationship and the existing generated children while preserving the parent/task itself as a single item.

### ~00:01:34–00:01:45 — no-delete branch explained

**VIDEO-DIRECT**
- source holds on the single-task post-removal state.

**TRANSCRIPT-CLAIM**
- narration says leaving Delete Existing unchecked would preserve child tasks as individual tasks.
- that exact No Repeat unchecked branch is not separately committed in this interval; the next explicit Remove Recurring sequence demonstrates preservation/detachment directly.

### ~00:01:45–00:01:52.5 — second staged recurrence-removal scenario

**CUT / SOURCE-STAGING**
- source cuts to a restored linked-recurring dataset with the Fri/Sat/Sun children again present;
- this is tutorial reset, not a product undo animation.

**VIDEO-DIRECT**
- recurring parent overflow is opened;
- `Remove Recurring` is selected directly instead of entering Update Recurring/No Repeat.

### ~00:01:52.5–00:01:54 — Remove Recurring detaches without deleting children

**VIDEO-DIRECT**
- toast reports **`Removed schedule from task`**;
- the former parent leaves the `Recurring tasks` group and appears as an ordinary Backlog task;
- the three existing scheduled Fri/Sat/Sun child tasks remain in This Week.

**DETACHMENT-DIRECT**
- recurrence linkage is removed while already-materialized children survive;
- this visually corroborates the narration's definition of detachment.

### ~00:01:54–00:02:00 — schedule the detached task again

**VIDEO-DIRECT**
- ordinary task overflow now shows `Schedule`, not `Update Recurring` / `Remove Recurring`;
- Schedule opens date picker first;
- after date confirmation, recurrence surface begins from **No Repeat**.

**IDENTITY/LIFECYCLE FINDING**
- the detached parent is treated as an ordinary schedulable task rather than as the old recurring-parent relationship.

### ~00:01:57–00:02:00.5 — new Every day rule after detachment

**VIDEO-DIRECT**
- `Every day` is selected;
- footer remains Cancel / Schedule;
- critically, **no `Replace existing tasks(...)` row is present**.

**HIGH-CONFIDENCE ABSENCE EVIDENCE**
- full-resolution inspection confirms the surface ends after the preset list and footer;
- this directly proves the source's rule: after detachment, recreating recurrence no longer has the previous child-link set available for Replace.

### ~00:02:00.5–00:02:02 — new recurrence commit

**VIDEO-DIRECT**
- Schedule is committed;
- toast reports **`Created recurring tasks successfully!`**;
- old Fri/Sat/Sun children remain;
- newly generated daily children are added alongside them.

**COUNT-DIRECT**
- This Week visibly grows from **3 scheduled tasks** to **9 scheduled tasks this week**;
- repeated `Get some sleep` rows coexist for overlapping days, directly demonstrating the duplicate/additive outcome warned about by narration.

### ~00:02:02–00:02:08 — additive children remain

**VIDEO-DIRECT**
- board stays populated with the enlarged scheduled-child set;
- parent is again displayed under the recurring grouping with a new `Daily` rule;
- the old detached children were not retroactively re-associated/replaced.

### ~00:02:08–00:02:28 — why detached children are preserved

**TRANSCRIPT-CLAIM**
- narration explains preservation protects user modifications such as:
  - renaming generated children;
  - EST edits;
  - notes.

**VIDEO-DIRECT / PARTIAL CORROBORATION**
- source visibly opens an inline Notes editor on one scheduled child during this explanation;
- this directly demonstrates that a generated/scheduled child can carry editable per-task Notes state;
- the clip does not visibly execute a rename and EST modification in this section, so those two examples remain narration rather than demonstrated mutations.

### ~00:02:28–00:02:45 — policy/rationale and future-improvement narration

**TRANSCRIPT-CLAIM**
- narration characterizes the two choices as:
  - preserve existing scheduled tasks;
  - start fresh with replacement/deletion.
- statements about future feature improvement are roadmap commentary, not product UI evidence.

### ~00:02:45–00:02:50.06 — outro

**VIDEO-DIRECT / NON-PARITY**
- source cuts to Blitzit end card;
- branding outro is not product parity evidence.

## VE-017 source synthesis

High-confidence lifecycle behavior established:
- linked recurring parents expose Update Recurring and Remove Recurring in overflow;
- updating a still-linked parent can expose `Replace existing tasks(N)`;
- Replace is neutral/non-destructive visual treatment;
- direct source count is `Replace existing tasks(7)` before converting daily recurrence to Fri/Sat/Sun;
- Custom supports repeat interval/unit, weekday chips and a plain-language summary;
- selecting Friday/Saturday/Sunday + Replace transforms the visible scheduled set to 3 children and yields an update-success toast;
- switching a linked rule to No Repeat removes Replace and exposes destructive `Delete existing tasks(3)`;
- No Repeat + Delete Existing removes the generated children and recurrence while preserving a single ordinary task;
- direct Remove Recurring detaches the parent without deleting its three existing children;
- after detachment, the task's overflow returns to ordinary Schedule;
- creating a new recurrence after detachment shows **no Replace option**;
- committing Every day adds new children alongside the three detached children;
- visible scheduled count increases **3 → 9**, directly demonstrating duplicate/additive materialization;
- detached/generated child tasks can hold independent Notes state;
- rename/EST-preservation rationale is narrated but not separately demonstrated in this source.

Static corroboration:
- SS-H08 independently shows No Repeat + destructive Delete Existing Tasks row;
- board/help screenshots corroborate Recurring tasks grouping and scheduled-child presentation.

No implementation conclusion is made in this analysis track.

---

# Queue 7 — VE-007 — Schedule Task Reminders

Source: `Blitzit Tutorial How to Schedule Task Reminders.mp4`  
Verified metadata: **02:52.803 container / 02:52.750 video stream, 1920×1080, 60 fps, 10,365 video frames**  
Pass-3 status: **SOURCE_COMPLETE / IMPLEMENTATION_DEFERRED**

Inspection method:
- complete source reviewed across the full duration;
- 1–2 s whole-video contact scans;
- dense 1 s sampling across date selection, time/recurrence step and update/remove flow;
- full-resolution frames for ordinary-task overflow, date picker, second-step scheduler, scheduled-task menu and removal result;
- 10 fps micro review around popup opening, date→details step and reminder removal;
- transcript used only where shortcut/recurrence semantics were narrated but not actually executed.

## VE-007 chronological state map

### 00:00:00–~00:00:12 — board baseline

**VIDEO-DIRECT**
- source begins on list `TYAMA` with the established four-column board;
- header reports **7 pending tasks, Est: 0min**;
- This Week shows **0/6 Done**;
- Today shows **0/2 Done**;
- ordinary task `Call with Pete` is initially an unscheduled This Week task.

### ~00:00:12–00:00:19 — hover / overflow → Schedule

**VIDEO-DIRECT**
- hovering `Call with Pete` exposes the standard board action rail:
  - completion circle;
  - Subtasks;
  - Notes;
  - lane-left;
  - lane-right;
  - overflow.
- overflow menu exact order:
  1. `Schedule`
  2. `Change list`
  3. `Duplicate`
  4. `Delete` in red.
- selecting Schedule opens the scheduler over a dimmed board.

**MOTION-APPROX**
- menu→scheduler replacement is fast and local, with no page navigation;
- no pronounced slide or window-geometry morph is visible.

### ~00:00:19–00:00:52 — date picker

**VIDEO-DIRECT**
- first scheduler step is a compact centered calendar surface;
- top shortcut labels are:
  - `TODAY`;
  - `LATER TODAY`;
  - `TOMORROW`;
  - `NEXT WEEK`.
- month shown is **June 2025**;
- left/right month chevrons flank the month heading;
- weekday row starts Monday in this source;
- bottom actions:
  - outlined `Cancel`;
  - gradient `Next`.

**DATE-STATE-DIRECT**
- system date in the recording is Sunday, **8 June 2025**;
- final selected date is **Saturday, 14 June 2025**;
- when editing later, current day 8 is shown with a purple/pink marker while selected date 14 uses the cyan/lime selected marker;
- when current day is also the active selection, the selected treatment subsumes the separate today marker.

**SHORTCUT EVIDENCE BOUNDARY**
- the tutorial points across the four shortcut labels while narration explains:
  - Today = current date;
  - Later Today = roughly two hours ahead;
  - Tomorrow = next date;
  - Next Week = seven days ahead.
- this source does **not** execute each shortcut and inspect its resulting stored value;
- shortcut semantics beyond their labels are therefore `TRANSCRIPT-CLAIM` in VE-007.

### ~00:00:52–00:01:05 — scheduler second step: date summary, Add Time and recurrence presets

**VIDEO-DIRECT**
- Next swaps the calendar for a second step in the **same modal footprint**;
- header:
  - back affordance `< PICK DATE`;
  - selected-date summary **`Sat, Jun 14th, 2025`** in the initial flow / equivalent `Sat, Jun 14, 2025` formatting on later update;
- `Add Time` row has `+ ADD` at right;
- `Recurring schedule` section exact options:
  - checked `No Repeat`;
  - `Every day`;
  - `Every weekday`;
  - `Every Saturday`;
  - `Every month on 14th`.
- bottom actions remain Cancel + gradient Schedule.

**STEP-TRANSITION-DIRECT**
- date→details is a content swap inside one modal rather than a slide to a separate page/window.

### ~00:00:56–00:01:04 — optional time control

**VIDEO-DIRECT**
- clicking `+ ADD` expands the Add Time row in place;
- exact visible time input anatomy:
  - hour field, demonstrated as `01`;
  - minute field, demonstrated as `0`;
  - AM/PM selector, demonstrated as `AM`;
  - `× REMOVE` at upper-right of the row.
- removing the time collapses those controls back to `+ ADD`.

**SEMANTIC LIMIT**
- narration states that a date-only schedule moves the task into Today when its due date arrives;
- the video never reaches June 14, so that future automatic movement remains `TRANSCRIPT-CLAIM` rather than direct observed behavior.

### ~00:01:05–00:02:00 — recurring preset explanation

**VIDEO-DIRECT**
- No Repeat remains the selected setting throughout the demonstrated save flow;
- pointer/narration walks through the visible presets:
  - Every day;
  - Every weekday;
  - Every Saturday;
  - Every month on 14th.
- the preset labels are dynamically derived from the selected Saturday/14th date for the weekday/month variants.

**TRANSCRIPT-CLAIM**
- narration describes generated-task behavior:
  - Every day → seven generated child tasks per weekly batch;
  - Every weekday → Monday–Friday children;
  - Every Saturday → same selected weekday;
  - Every month → same selected day-of-month.
- none of these recurring presets is actually selected/committed in VE-007;
- generated-child semantics are therefore narration-only in this source and are handled as direct evidence in VE-017 / later recurring-task sources instead.

### ~00:02:00–00:02:01 — Schedule commit

**VIDEO-DIRECT / MOTION-DIRECT**
- Schedule is activated while No Repeat is selected and Add Time has been removed;
- scheduler disappears within the next sampled frames;
- board updates immediately, with no confirmation dialog.

### ~00:02:01–00:02:13 — scheduled task board result

**VIDEO-DIRECT**
- `Call with Pete` is no longer in the ordinary This Week stack;
- This Week progress changes **0/6 Done → 0/5 Done**;
- Backlog gains subsection exact copy:
  - **`1 Scheduled tasks backlog`**.
- `Call with Pete` appears in that subsection with:
  - date label **`14th`** at right;
  - original list badge;
  - EST/Taken slots preserved.
- top list summary remains **7 pending tasks** in the staged board, meaning scheduled tasks remain part of the list's pending-task population.

**POSITION-DIRECT**
- a date in the following calendar week is represented under Backlog's scheduled subsection rather than the active This Week stack.

### ~00:02:13–00:02:22 — scheduled-task overflow / Update Schedule

**VIDEO-DIRECT**
- scheduled task keeps the normal board hover action rail;
- opening its overflow changes the menu's scheduling area:
  1. `Update Schedule`;
  2. schedule-detail row **`14th June`** with a circular X/remove affordance at the right;
  3. divider;
  4. `Change list`;
  5. `Duplicate`;
  6. divider;
  7. `Delete` in red.
- `Schedule` is therefore replaced by `Update Schedule` plus the current schedule-detail/removal row.

### ~00:02:22–00:02:25 — Update Schedule reopens pre-populated editor

**VIDEO-DIRECT**
- choosing Update Schedule reopens the second scheduler step with:
  - selected date still **Sat, Jun 14, 2025**;
  - No Repeat still selected;
  - Add Time still unset.
- choosing Pick Date returns to the calendar;
- calendar simultaneously shows:
  - current day 8 marker;
  - selected day 14 marker.

**EDIT-COMMIT LIMIT**
- this tutorial opens the existing schedule for editing but does **not** commit a changed date/time/recurrence value;
- therefore “parameters can be adjusted” is supported by the editable/pre-populated UI, while an updated-result mutation is not independently demonstrated.

### ~00:02:25–00:02:28 — return to board

**VIDEO-DIRECT**
- editor is dismissed/cancelled;
- scheduled task remains dated 14th, confirming no change was committed.

### ~00:02:28–00:02:29 — remove schedule using schedule-detail X

**VIDEO-DIRECT**
- scheduled-task overflow is opened again;
- pointer targets the circular X on the `14th June` schedule-detail row;
- no confirmation dialog appears.

**MOTION-DIRECT**
- reminder removal is immediate/local; menu and scheduled subsection disappear within only a few sampled frames.

### ~00:02:29–00:02:33 — reminder removed, task preserved

**VIDEO-DIRECT**
- `Call with Pete` remains intact as an ordinary task;
- it is now placed in the ordinary **Backlog** task stack beneath `Find new copywriter`;
- `1 Scheduled tasks backlog` subsection disappears;
- date label and schedule metadata disappear;
- task title, list identity and metric slots remain.

**IMPORTANT POSITION SEMANTIC**
- removing the reminder does **not** visibly restore the task to its original This Week lane in this source;
- it becomes an ordinary Backlog task.
- therefore the strongest direct statement is “reminder removed, task preserved,” not “task returns to its previous lane.”

### ~00:02:33–00:02:42 — reminder summary

**VIDEO-DIRECT**
- board remains in the unscheduled result state while narration summarizes scheduling/reminder use;
- no additional unique scheduler state appears.

### ~00:02:42–00:02:52.80 — outro

**VIDEO-DIRECT / NON-PRODUCT**
- tutorial/community outro and music;
- no additional application parity evidence.

## VE-007 source synthesis

High-confidence direct behavior established:
- ordinary board task overflow enters scheduling through `Schedule`;
- date step has Today / Later Today / Tomorrow / Next Week shortcuts plus full calendar;
- selected date and current-date markers can coexist distinctly;
- Next keeps the workflow inside one compact scheduler and reveals date summary + optional time + recurrence presets;
- Add Time expands inline to hour/minute/AM-PM fields and can be removed inline;
- No Repeat / Every day / Every weekday / Every Saturday / Every month on 14th are the visible preset grammar for the selected date;
- recurring-generation semantics in this particular video are narrated, not committed;
- saving a date-only No Repeat schedule moves the task into a Backlog scheduled subsection and reduces the active This Week denominator;
- scheduled-task overflow changes to `Update Schedule` plus an inline schedule-detail/removal row;
- Update Schedule reopens a pre-populated editor;
- removing the reminder uses the X beside the schedule details, requires no confirmation and preserves the task;
- direct removal result is an ordinary Backlog task, not restoration to the original This Week lane;
- future due-date auto-movement and the four quick-shortcut calculations are not directly observed in this clip and remain transcript-level claims here.

Static corroboration:
- SS-H07 Help schedule date picker;
- SS-H13 ordinary task overflow;
- VE-017 recurring-update source for direct generated-task consequences.

No implementation conclusion is made in this analysis track.

---

# Queue 8 — VE-009 — Custom Recurring Schedules

Source: `Blitzit Tutorial How to Use Custom Recurring Schedules.mp4`  
Verified metadata: **02:39.893 container / 02:39.833 video stream, 1920×1080, 60 fps, 9,590 video frames**  
Pass-3 status: **SOURCE_COMPLETE / IMPLEMENTATION_DEFERRED**

Inspection method:
- complete source reviewed across the full duration;
- whole-video contact scan plus dense 1 s sampling through the recurrence editor;
- full-resolution keyframes for date selection, Custom entry, interval unit dropdown, week chips, month conditional selector, year state and final saved result;
- micro review around final Schedule/board outcome;
- transcript used only to distinguish examples/narration from the rule actually committed.

## VE-009 chronological state map

### 00:00:00–~00:00:28 — board baseline and Schedule entry

**VIDEO-DIRECT**
- tutorial begins on list `PLATA` with the established four-column board;
- Today contains `Team meeting` as an ordinary pending task in position 4;
- hovering the task exposes the board task action rail;
- overflow uses the ordinary Schedule / Change list / Duplicate / Delete grammar;
- selecting Schedule opens the standard date picker.

### ~00:00:31–00:00:35 — selected date

**VIDEO-DIRECT**
- calendar month is **September 2025**;
- current day **12** has a purple/pink marker;
- selected date **14** has the green/cyan selected marker;
- selected date is Sunday, and Next advances the same scheduler workflow.

### ~00:00:35–00:00:40 — recurrence presets → Custom

**VIDEO-DIRECT**
- second scheduler step contains Add Time and Recurring schedule presets;
- `Custom` is available at the bottom of the recurring options and is selected;
- Custom expands in-place within the same modal rather than opening another dialog.

**CUSTOM BASELINE**
- header: `< PICK DATE`;
- selected-date summary: **`Sun, Sep 14th, 2025`**;
- `Add Time` + `+ ADD`;
- `Recurring schedule`;
- `Custom` heading with X/remove affordance;
- `Repeat every`;
- numeric spinner;
- interval-unit dropdown;
- plain-language info summary;
- Cancel + gradient Schedule footer.

### ~00:00:40–00:00:59 — interval-unit selector and day example

**VIDEO-DIRECT**
- interval-unit dropdown exact base options:
  - `day`;
  - `week`;
  - `month`;
  - `year`.
- with count 1, editor shows singular unit and summary **`every day`**;
- increasing the numeric spinner pluralizes the displayed unit;
- demonstration changes the rule to:
  - `Repeat every 3 days`;
  - summary **`every 3 days`**.

**DYNAMIC-SUMMARY-DIRECT**
- the summary updates in place as interval/count changes;
- no separate preview/confirmation screen is used.

### ~00:01:11–00:01:30 — week interval + weekday chips

**VIDEO-DIRECT**
- switching unit to weeks inserts conditional `Repeat On` controls;
- seven circular weekday chips are shown in Sunday→Saturday order;
- with Monday selected, source shows:
  - `Repeat every 3 weeks`;
  - summary **`every 3 weeks on Monday`**.
- numeric spinner is then changed to **4**;
- Friday is additionally selected;
- resulting summary is exactly:
  - **`every 4 weeks on Monday, Friday`**.

**INTERACTION-DIRECT**
- weekday chips are independently selectable;
- selected chips receive the bright accent fill;
- conditional week controls appear only for the week unit.

**TRANSCRIPT-CLAIM**
- narration states clicking an already-selected weekday again removes it;
- this source demonstrates selection changes clearly, but a clean isolated deselection result is not required to establish the editor grammar and is not given a separate timing claim.

### ~00:01:31–00:01:54 — month interval + monthly-mode selector

**VIDEO-DIRECT**
- switching unit to months removes weekday chips and inserts a different `Repeat On` dropdown;
- with selected date September 14, the dropdown offers exact alternatives:
  1. **`Monthly on day 14`**
  2. **`Monthly on the 2nd Sunday`**
- with count 4 and the date-based option, summary is:
  - **`every 4 months on the 14th`**.
- choosing the weekday-occurrence option changes the control value to:
  - `Monthly on the 2nd Sunday`;
- summary updates to:
  - **`every 4 months on the 2nd Sunday`**.

**CONDITIONAL-GRAMMAR-DIRECT**
- month uses a mutually exclusive date-vs-nth-weekday selector rather than the week chip row.

### ~00:01:54–00:02:08 — year interval

**VIDEO-DIRECT**
- switching unit to years removes the monthly `Repeat On` selector;
- visible rule:
  - `Repeat every 4 years`;
  - summary **`every 4 years`**.
- no additional date selector is displayed because the selected schedule date is retained as context.

**EVIDENCE BOUNDARY**
- UI directly represents the four-year rule;
- the tutorial obviously does not wait four years, so future generation on that exact date remains recurrence semantics expressed by the editor/narration rather than observed elapsed-time behavior.

### ~00:02:08–00:02:13 — final rule reset before commit

**IMPORTANT VIDEO-DIRECT**
- the tutorial examples above are not all committed;
- after showing the four-year example, the editor is changed again before Schedule;
- source steps through `4 years → 4 days → 1 day`;
- final committed editor state is:
  - **Repeat every 1 day**;
  - Custom;
  - summary **`every day`**.

This prevents the example states from being mistaken for the saved recurrence.

### ~00:02:11–00:02:15 — Schedule and tutorial-cut artifact

**SOURCE-ARTIFACT / CUT**
- around the final Schedule click, the edited tutorial rapidly alternates between scheduler and board frames;
- this is not a trustworthy continuous product-transition sequence;
- no animation duration is derived from these alternating frames.

### ~00:02:15–00:02:18 — committed board result

**VIDEO-DIRECT**
- success toast exact copy:
  - **`Created recurring tasks successfully!`**.
- Backlog now contains a dedicated `Recurring tasks` group;
- parent:
  - title **`Team meeting`**;
  - recurrence label **`Custom`**;
  - recurring/loop icon.
- the original ordinary Today `Team meeting` is no longer in Today;
- Today denominator changes **0/4 Done → 0/3 Done**;
- This Week gains subsection:
  - **`1 Scheduled tasks this week`**;
- one visible child `Team meeting` is scheduled for **Sun**;
- list header shows **8 pending tasks**.

**COMMIT-DIRECT**
- this board outcome belongs to the final Custom every-1-day rule, not the earlier 3-day / 4-week / monthly / 4-year examples.
- the source only shows the child currently falling within the visible planning horizon; do not infer the full future materialized set from this one frame.

### ~00:02:18–00:02:27 — result/context summary

**VIDEO-DIRECT**
- parent + scheduled child remain visible while narration explains that custom recurrence generates child tasks like regular recurring schedules;
- no additional recurrence control state appears.

### ~00:02:27–00:02:39.89 — outro

**VIDEO-DIRECT / NON-PRODUCT**
- tutorial/community outro;
- excluded from application parity requirements.

## VE-009 source synthesis

High-confidence direct behavior established:
- Custom is an inline extension of the normal scheduler's second step;
- Custom rule consists of interval count + day/week/month/year unit + dynamic plain-language summary;
- unit dropdown base options are day/week/month/year;
- day example directly reaches `every 3 days`;
- week mode conditionally adds seven weekday chips and directly reaches `every 4 weeks on Monday, Friday`;
- month mode replaces chips with date-vs-nth-weekday options, directly demonstrating `Monthly on day 14` and `Monthly on the 2nd Sunday`;
- month summaries directly demonstrate `every 4 months on the 14th` and `every 4 months on the 2nd Sunday`;
- year mode directly demonstrates `every 4 years` without an additional Repeat On control;
- summary text updates in place as controls change;
- the tutorial's example states are not the saved rule: immediately before Schedule the source resets Custom to **every 1 day**;
- final board directly shows Team meeting as a Custom recurring parent, one visible Sunday scheduled child, Today 0/3 Done, 8 pending tasks and toast `Created recurring tasks successfully!`;
- rapid scheduler/board alternation around the final commit is treated as a tutorial/source cut artifact, not measurable application motion;
- long-horizon recurrence timing is not inferred beyond the rule expressed by the UI and resulting visible near-horizon child.

No implementation conclusion is made in this analysis track.

---

# Queue 9 — VE-010 — Notes

Source: `Blitzit Tutorial How to Use Notes.mp4`  
Verified metadata: **01:13.561 container / 01:13.500 video stream, 1920×1080, 60 fps, 4,410 video frames**  
Pass-3 status: **SOURCE_COMPLETE / IMPLEMENTATION_DEFERRED**

Inspection method:
- complete source reviewed across the full duration;
- 2–3 s full-source contact scan;
- 0.25 s dense sampling across Notes activation and URL/open-browser region;
- 15 fps micro review around live-card hover → Notes editor expansion;
- full-resolution frames for editor toolbar, formatted text and recognized link;
- transcript used only to separate narrated semantics from actions actually visible.

## VE-010 chronological state map

### 00:00:00–~00:00:21 — Focus baseline / tutorial intro

**VIDEO-DIRECT**
- source is demonstrated in the narrow Focus Panel, not the four-column board;
- list scope is `Today`;
- header shows `Est: 0min`, progress bar and `0/2 Done`;
- `Finish the video` is the live task with a count-up timer;
- `Send press-release` remains queued beneath it.

No unique Notes state is introduced before the interaction begins.

### ~00:00:21–00:00:24.5 — live-task hover → Notes affordance

**VIDEO-DIRECT**
- hovering the live task replaces title/time presentation with the live-task action strip;
- visible direct actions follow the established live-card grammar:
  - Break/gamepad-like action;
  - Notes/document;
  - Pause;
  - Skip;
  - Done/check.
- when the pointer targets the Notes icon, that icon expands into a rounded **`Notes`** labeled pill while neighboring actions remain icon-only.

**MICRO-INTERACTION-DIRECT**
- this icon→label expansion happens inside the fixed live-card action strip without changing overall panel width.

### ~00:00:24.5–00:00:25.1 — Notes editor expansion

**VIDEO-DIRECT / MOTION-MEASURED**
- activating Notes expands the live task card vertically in place;
- at 15 fps sampling, the action-strip state is still present at ~24.97 s and the expanded editor is already visible by ~25.03 s;
- therefore the visible state swap completes within approximately one **66.7 ms** sample interval in this recording;
- no modal, page switch or separate Notes window appears;
- queued `Send press-release` is pushed downward by the expanded card.

### ~00:00:25–00:00:30 — editor anatomy and text entry

**VIDEO-DIRECT**
- expanded live card retains task title `Finish the video`;
- a pencil/edit icon is visible at the card's upper-right;
- exact toolbar order, left→right:
  1. Bold `B`;
  2. Italic;
  3. Strikethrough;
  4. Bulleted list;
  5. Numbered list;
  6. Undo;
  7. Redo.
- toolbar is separated from the editable body by a horizontal divider;
- editor body is multiline;
- circular X/Close affordance sits at the lower-right of the editor body;
- typed body text in the demonstration is **`Feels so good`**.

**GEOMETRY-DIRECT**
- Notes owns the expanded area inside the task card;
- later Focus content remains in the same vertical flow rather than being overlaid/replaced.

### ~00:00:30–00:00:45 — formatting controls

**VIDEO-DIRECT**
- tutorial moves across the formatting/list/history controls;
- body text is selected before formatting;
- Bold is actually applied:
  - `B` receives a selected/highlighted background;
  - selected text later renders visibly bold.
- redo is visibly hover-targeted later in the sequence;
- toolbar remains available while content is selected/edited.

**EVIDENCE BOUNDARY**
- the source visibly exposes Italic, Strikethrough, Bulleted List, Numbered List, Undo and Redo;
- it does not provide equally clean before/after proof for every formatting command;
- therefore exact toolbar availability is direct, while only transformations clearly visible in pixels are treated as executed behavior.

### ~00:00:45–00:00:50 — URL recognition

**VIDEO-DIRECT**
- a second line is added:
  - **`https://www.blitzit.app`**.
- the URL is immediately rendered as visually distinct underlined link text inside the editor;
- this occurs without a separate “convert to link” command.

**DIRECT SEMANTIC**
- automatic URL recognition/clickable-link styling is strongly supported.

### ~00:00:50–00:00:52 — link hover and browser open

**VIDEO-DIRECT**
- pointer moves onto the recognized URL;
- cursor changes to a hand/link pointer;
- shortly afterward Safari opens to `blitzit.app`;
- Focus Panel remains visible beside the browser.

**AMBIGUOUS TRIGGER — IMPORTANT**
- narration says links “automatically open” when a task goes live;
- however, in this demonstrated sequence:
  - `Finish the video` was already live before Notes editing began;
  - immediately before Safari opens, the pointer is visibly positioned on the URL with a hand cursor.
- the pixels therefore cannot distinguish:
  - an automatic live-task link-open rule, from
  - ordinary manual activation/click of the recognized link.
- **Do not promote auto-open-on-live to VIDEO-DIRECT behavior from VE-010.**
- the strongest direct statement is: recognized note links are interactive and opening this link launches the default browser.

### ~00:00:52–00:01:01 — external browser context

**VIDEO-DIRECT**
- Safari first shows a loading/blank state, then loads the Blitzit website;
- the narrow Focus Panel remains alongside/over the desktop context;
- the task/editor state is not converted into a browser page; browser launch is external to the Notes surface.

**TIMING LIMIT**
- browser/network load duration is environment-dependent and is not an application animation requirement.

### ~00:01:01–00:01:13.5 — outro

**VIDEO-DIRECT / NON-PARITY**
- tutorial returns to general/outro context;
- no additional unique Notes editing state is established.

## VE-010 source synthesis

High-confidence source behavior established:
- Notes is a live-task hover action that expands from icon-only to a labeled `Notes` pill;
- activating Notes expands the live card inline and pushes following Focus content downward;
- the editor appears within approximately one 66.7 ms dense-sampling interval in this recording;
- toolbar exact order is Bold / Italic / Strikethrough / Bulleted list / Numbered list / Undo / Redo;
- body is multiline and uses a lower-right close affordance;
- Bold receives a selected state and visibly affects selected text in the demonstrated flow;
- pasted/typed `https://www.blitzit.app` is automatically recognized and rendered as an underlined interactive link;
- link hover produces a hand cursor and the URL can open the default browser;
- VE-010 does **not** cleanly prove the narrated “auto-open links when task goes live” behavior because the task was already live and the pointer was actively on the link immediately before Safari opened;
- editor internal scrolling is not demonstrated in this short clip, even though static Help evidence shows Notes can own an internal scroll region;
- editor Close is visible but not cleanly exercised as a standalone close interaction in this source.

Static corroboration:
- SS-C21 current Focus Notes expanded;
- SS-H10 board Notes inline expanded;
- SS-T07 historical board Notes inline expanded.

No implementation conclusion is made in this analysis track.

---

# Queue 10 — VE-015 — Sessions Walkthrough

Source: `Blitzit Tutorial Sessions Walkthrough.mp4`  
Verified metadata: **02:56.167 video stream / ~02:56.216 container, 1920×1080, 60 fps, 10,570 video frames**  
Pass-3 status: **SOURCE_COMPLETE / IMPLEMENTATION_DEFERRED**

Inspection method:
- complete source reviewed end-to-end;
- 5 s whole-video contact scan;
- dense 1 s sampling through filters, chronological rows, inline editing, task-detail modal, Add Session and export sections;
- 2–5 fps micro-review around inline session editing and row overflow→detail transition;
- full-resolution keyframes used to reconcile visible summary arithmetic before/after mutations;
- transcript used only for filter/feature claims not directly executed in pixels.

## VE-015 chronological state map

### 00:00:00–~00:00:20 — Reports shell → Sessions tab

**VIDEO-DIRECT**
- tutorial opens in Reports and moves from `Overview` to `Sessions`;
- Sessions tab carries a **Beta** badge;
- same Reports shell retains Back navigation and top-right app utility controls.

### ~00:00:20–00:00:43 — Sessions baseline anatomy

**VIDEO-DIRECT**
- top actions:
  - **`+ Add Session`**;
  - **`Export PDF`** in this source version.
- filter row:
  - list scope trigger showing stacked badges + `All Lists`;
  - **`Hide Break sessions`**;
  - date-range trigger **`Nov 27,2025 - Dec 04,2025`**.
- summary cards:
  - **Total Time — 14hr 22min**;
  - **Total Tasks — 39**;
  - **Total Sessions — 22**.
- sessions are grouped chronologically by date headings.

**ROW ANATOMY-DIRECT**
Each session row visibly contains:
- task title;
- list badge/name;
- session ordinal, e.g. `Session 03`;
- calendar/date;
- start time;
- arrow;
- end time;
- computed duration;
- overflow ellipsis.

### ~00:00:43–00:00:51 — list filter

**VIDEO-DIRECT**
- All Lists opens a compact anchored dropdown;
- rows carry checkmarks + list badges/names;
- visible entries include `All Lists`, `Blitzit` variants, `Bug tracker`, `ClickUp` and further lists below the viewport;
- the control presents multi-selection/checkmark grammar rather than a separate filter page.

**EVIDENCE LIMIT**
- the source opens/explores the selector but does not hold a clean before/after committed subset long enough to assign exact summary arithmetic to a specific list choice;
- narration that totals update with filters is therefore not converted into fabricated per-list numbers.

### ~00:00:51–00:00:55 — break-session filter

**VIDEO-DIRECT**
- `Hide Break sessions` is a compact standalone filter/action in the Sessions header;
- it uses a small gamepad/break-style icon matching break semantics elsewhere.

**TRANSCRIPT-CLAIM**
- narration states break sessions can be hidden/shown;
- the video does not provide a sufficiently isolated committed before/after break-only row set for a numeric requirement.

### ~00:00:54–00:01:04 — date-range picker

**VIDEO-DIRECT**
- date-range trigger opens the same two-month range picker family seen in current screenshots;
- left preset column:
  - Today;
  - Yesterday;
  - This week;
  - Last 30 days;
  - Last 60 days;
  - Last 90 days.
- months shown are **Nov 2025** and **Dec 2025**;
- range endpoints are visually filled and the between-range dates use connected muted highlighting;
- bottom actions are long outlined `Cancel` and gradient `Apply`.

**STATIC CORROBORATION**
- current SS-C02 has the same date-range architecture, with a different date/month instance.

### ~00:01:04–00:01:28 — chronological session list

**VIDEO-DIRECT**
- source scrolls through date-grouped rows;
- examples show multiple sessions on the same task and session ordinals that are task-relative, not global row indices;
- visible durations include minute-only and multi-hour values;
- row order is reverse chronological within the selected reporting period.

### ~00:01:28–00:01:49 — direct inline field editing

**VIDEO-DIRECT / ARITHMETIC-DIRECT**
- `Email newsletter` / Session 03 initially shows:
  - date **04 Dec**;
  - start **12:39 PM**;
  - end **1:51 PM**;
  - duration **1hr 11min**.
- clicking the end-time field converts only that field to an inline editor with bright accent border;
- a green check appears as explicit commit affordance;
- end time is changed to **2:51 PM**;
- after commit:
  - duration becomes **2hr 11min**;
  - toast appears **`Session updated!`**.

**SUMMARY ARITHMETIC-DIRECT**
- before the edit:
  - Total Time **14hr 22min**;
  - Total Tasks **39**;
  - Total Sessions **22**.
- after increasing this single session by exactly one hour:
  - Total Time becomes **15hr 22min**;
  - Total Tasks stays **39**;
  - Total Sessions stays **22**.
- this directly proves summary totals recompute from session-duration edits.

### ~00:01:49–00:01:55 — main-row overflow

**VIDEO-DIRECT**
- session-row ellipsis opens a compact menu with:
  1. **Edit**;
  2. **Delete** in red.
- choosing Edit opens a task-level session detail overlay.

### ~00:01:53–00:02:04 — task session-detail overlay

**VIDEO-DIRECT**
- centered/dimmed overlay is titled **`Email newsletter`**;
- shows:
  - `List` + Blitzit badge;
  - **`+ Add Session`**;
  - **3 Sessions**;
  - aggregate **2hr 13min**.
- contained rows:
  - Session 03 — 04 Dec — 12:39 PM → 2:51 PM — 2hr 11min;
  - Session 02 — 02 Nov — 7:19 PM → 7:20 PM — 0min;
  - Session 01 — 02 Nov — 7:15 PM → 7:16 PM — 1min.
- aggregate reconciles: 2hr11 + 0min + 1min ≈ displayed 2hr13min under source minute-rounding behavior.

**DETAIL-ROW MENU**
- each session row has its own ellipsis;
- opened detail-row menu exposes destructive **Delete**.

**ACTION LIMIT**
- Delete availability is directly shown;
- this source does not hold a clean committed delete result long enough to derive post-delete summary arithmetic, so deletion outcome remains unmeasured here.

### ~00:02:05–00:02:20 — Add Session flow

**VIDEO-DIRECT**
- top-level `+ Add Session` opens a compact anchored/overlay card;
- initial task selector expands to:
  - search field **`Select tasks...`**;
  - group heading **`Recent Tasks`**;
  - task rows with list badges.
- visible recent examples include:
  - `Project roadmap video`;
  - `Prepare weekly report`;
  - `Launch UGC campaign`;
  - `Repair car`;
  - `Order a gift for Alex`.

**VIDEO-DIRECT**
- selecting `Project roadmap video` expands the Add Session form;
- visible values:
  - date **04, Dec**;
  - start **3:54 PM**;
  - end **5:54 PM**;
  - computed duration **2hr**;
  - `Add Session` commit button.

### ~00:02:20–00:02:24 — Add Session commit and arithmetic

**VIDEO-DIRECT**
- new row appears at the top of 04 Dec:
  - `Project roadmap video`;
  - Content list badge;
  - **Session 04**;
  - 04 Dec;
  - 3:54 PM → 5:54 PM;
  - **2hr**.
- toast appears: **`Session added successfully!`**.

**SUMMARY ARITHMETIC-DIRECT**
- immediately before add, after the earlier edit:
  - Total Time **15hr 22min**;
  - Total Tasks **39**;
  - Total Sessions **22**.
- after adding the 2hr session:
  - Total Time **17hr 22min**;
  - Total Tasks remains **39**;
  - Total Sessions becomes **23**.
- therefore:
  - session count increments exactly once;
  - total tracked time increases by the new session duration;
  - adding another session to an already-known task does not increase distinct Total Tasks.

### ~00:02:24–00:02:40 — post-add list state

**VIDEO-DIRECT**
- newly added session remains first in the selected date group;
- existing rows preserve their values;
- summary remains 17hr22 / 39 / 23.

### ~00:02:24–00:02:40 — Export PDF source-version state

**VIDEO-DIRECT**
- source-version top-right button reads **`Export PDF`**;
- hovering it exposes tooltip **`coming soon`**;
- no downloadable PDF is produced in this tutorial.

**VERSION-PRECEDENCE**
- narration also says PDF export will be available soon;
- current supplied v2.6.69 screenshot SS-C14 instead shows **`Export .csv`**;
- for current UI parity, SS-C14 is stronger/newer direct evidence and supersedes this older Beta-era Export PDF label;
- VE-015 remains valuable historical evidence of Sessions interaction/data semantics, not the current export-format target.

### ~00:02:40–00:02:56.17 — recap/outro

**NON-PARITY**
- tutorial summary/outro; no additional unique Sessions state.

## VE-015 source synthesis

High-confidence behavior/anatomy established:
- Sessions is a Beta tab inside Reports;
- baseline summary in the source is 14hr22 / 39 tasks / 22 sessions;
- filters are list scope, Hide Break sessions and date range;
- date-range picker uses presets + two-month custom range + Cancel/Apply;
- session rows are date-grouped and expose task/list/session number/date/start/end/duration/ellipsis;
- individual session fields are inline-editable with accent editor + green check commit;
- changing Email newsletter end time by +1h changes row duration and Total Time by exactly +1h, with tasks/session count unchanged;
- main row overflow = Edit / Delete;
- Edit opens a task-level modal containing all sessions and aggregate task-session time;
- detail rows expose their own Delete menu;
- Add Session has searchable/recent task selection, date/start/end/duration and commit;
- adding a 2hr session increments Total Sessions 22→23 and Total Time 15hr22→17hr22 while Total Tasks stays 39;
- source-version Export PDF is visibly `coming soon`;
- current screenshot evidence supersedes Export PDF with Export .csv for current v2.6.69;
- no implementation conclusion is made in this analysis track.

Static corroboration:
- SS-C14 current Sessions dashboard shell/summary and current CSV export label;
- SS-C22 current session-detail inline edit;
- SS-H16 older populated Sessions rows;
- SS-H17 Add Session searchable task picker.

---

# Queue 11 — VE-011 — Reports

Source: Blitzit Tutorial How to Use Reports.mp4  
Verified metadata: **03:10.400 video stream / ~03:10.450 container, 1920×1080, 60 fps, 11,424 video frames**  
Pass-3 status: **SOURCE_COMPLETE / IMPLEMENTATION_DEFERRED**

Inspection method:
- complete source reviewed end-to-end;
- 5 s whole-video contact scan;
- dense full-resolution review of filter changes, metric cards, chart hover/tooltip, legend toggles and lower panels;
- 4 fps micro-review across the chart interaction sequence;
- direct arithmetic checked where visible values permit reconciliation;
- current v2.6.69 screenshots used only for source-version precedence, not to overwrite direct populated states from the video.

## VE-011 chronological state map

### 00:00:00–~00:00:19 — Home → Reports

**VIDEO-DIRECT**
- source begins on the dark Home list-grid shell;
- Reports is selected from the persistent bottom navigation;
- application enters the Reports dashboard while preserving the desktop-window shell and top utility controls.

**VERSION NOTE**
- this video predates the later Overview / Sessions segmented tabs visible in current v2.6.69 screenshots;
- current SS-C12 therefore has precedence for the current Reports header/shell, while VE-011 remains direct evidence for populated Overview behavior.

### ~00:00:19–00:00:25 — populated Overview baseline

**VIDEO-DIRECT**
- filter row:
  - stacked-badge All Lists;
  - date range **Jun 24, 2025 - Jul 01, 2025**.
- four headline cards:
  - **TOTAL WORK DAYS — 7 days**;
  - **TOTAL TASKS DONE — 18**, secondary **2.6 per day**;
  - **TOTAL HRS WORKED — 9.2hr**, secondary **1.3hr per day**;
  - **AVG. TIME PER TASK — 45.9 mins**.
- main chart occupies the dominant panel beneath them;
- legend order:
  1. TASKS — purple;
  2. BREAKS — mint;
  3. TOTAL — tan.
- chart options/menu icon remains at upper-right of the chart panel.

**ARITHMETIC-DIRECT**
- selected range spans eight calendar labels (Jun 24→Jul 1), but only seven chart days contain visible activity;
- Total Work Days = **7**, consistent with active days rather than calendar-span length;
- 18 / 7 = 2.57 → displayed **2.6 per day**;
- 9.2 / 7 = 1.31 → displayed **1.3hr per day**.

### ~00:00:25–00:00:34 — list filter is multi-select and live

**VIDEO-DIRECT**
- All Lists opens a compact anchored dropdown over the live dashboard;
- visible list rows include:
  - All Lists;
  - ClickUp;
  - Freelance;
  - Music;
- rows use checkmarks and list-color badges.

**LIVE FILTER-DIRECT**
- selecting **Freelance** alone updates the dashboard immediately while the dropdown remains open:
  - Total Tasks Done → **10**, **1.4 per day**;
  - Total Hrs Worked → **8.4hr**, **1.2hr per day**;
  - Avg. Time per Task → **55.7 mins**.
- then selecting **Music** as an additional list produces a two-list state:
  - trigger changes to truncated **Selected 2 l...**;
  - Total Tasks Done → **14**, **2.0 per day**;
  - Total Hrs Worked → **9.0hr**, **1.3hr per day**;
  - Avg. Time per Task → **54.0 mins**.
- choosing All Lists restores:
  - 18 tasks;
  - 9.2hr;
  - 45.9 mins.

**SEMANTIC-DIRECT**
- this is genuine multi-select filtering, not a single-choice replacement menu;
- headline cards and chart rerender while the popover stays open.

### ~00:00:34–00:00:42 — date-range picker

**VIDEO-DIRECT**
- date-range trigger opens the two-month picker over the still-live report;
- left preset column:
  - Today;
  - Yesterday;
  - This week;
  - Last 30 days;
  - Last 60 days;
  - Last 90 days.
- visible months are **Jun 2025** and **Jul 2025**;
- current selected range crosses the month boundary from Jun 24 to Jul 1;
- range endpoints are filled and intermediate dates use a connected muted background;
- bottom controls are outlined Cancel and gradient Apply.

**EDIT LIMIT**
- the tutorial inspects the picker but returns to the same Jun 24→Jul 1 range;
- no changed date-range result is committed in VE-011.

### ~00:00:42–00:01:23 — headline-metric explanation / chart baseline

**VIDEO-DIRECT**
- populated cards and chart remain stable while narration walks through their meanings;
- no hidden secondary panel replaces the dashboard;
- chart daily categories remain:
  - Tue 24 Jun;
  - Wed 25 Jun;
  - Thu 26 Jun;
  - Fri 27 Jun;
  - Sat 28 Jun;
  - Sun 29 Jun;
  - Mon 30 Jun;
  - Tue 01 Jul.

**TRANSCRIPT-CLAIM**
- narration defines:
  - work days as days actually worked;
  - tasks done as completed tasks;
  - total hours as task + break time;
  - average time per task as including completed and started-but-unfinished tasks.
- only the visible arithmetic relationships above are promoted to independently checked direct semantics.

### ~00:01:24–00:01:32 — chart hover target / tooltip

**VIDEO-DIRECT**
- hovering a day creates a tall translucent vertical highlight band across that x-category;
- the hovered Total bar becomes a brighter/paler yellow;
- a compact black tooltip appears adjacent to the group.

**EXACT TOOLTIP — Mon 30, Jun**
- TASKS: **1.2hr**;
- BREAKS: **0.1hr**;
- TOTAL: **1.3hr**.

**ARITHMETIC-DIRECT**
- 1.2hr + 0.1hr = **1.3hr**, directly reconciling the three series for that day.

**MOTION/GEOMETRY**
- hover overlay/tooltip is in-place;
- chart/card geometry does not shift.

### ~00:01:32–00:01:40 — clickable legend / series visibility

**VIDEO-DIRECT**
- legend entries are interactive series toggles;
- clicking TOTAL removes the tan Total bars while Tasks/Breaks remain;
- clicking/restoring series repopulates the plot;
- clicking BREAKS can independently remove the mint bars while Tasks/Total remain;
- legend labels persist as controls when their series is hidden.

**CHART-REFLOW-DIRECT**
- remaining visible bars reflow/recenter within each date group;
- the chart container, axes and headline cards do not resize.

### ~00:01:40–00:01:46 — page scroll to lower analytics

**VIDEO-DIRECT**
- Reports content scrolls vertically;
- filters/headline cards move out of the viewport;
- Reports title/top utility shell stays pinned at the top;
- bottom Home/Reports/Add new task/Help Center navigation remains pinned at the bottom;
- chart moves upward and remains partially visible during the transition.

### ~00:01:46–00:02:07 — productive-time cards

**VIDEO-DIRECT**
- three equal-width cards:
  - **MOST PRODUCTIVE HOUR — 9am-10am**;
  - **MOST PRODUCTIVE DAY — Tuesday**;
  - **MOST PRODUCTIVE MONTH — Jun '25**.

**TRANSCRIPT-CLAIM**
- narration attributes these to focus/live-session activity within the selected range;
- VE-011 directly establishes the cards/values, not the underlying aggregation algorithm.

### ~00:02:07–00:02:18 — Time By List populated panel

**VIDEO-DIRECT**
- left lower panel is TIME BY LIST;
- donut chart and legend share one card;
- top-right summary:
  - **Total Time: 18hr 56min**.
- visible legend:
  - **TYAMA — 1hr 40min — 8%**;
  - **Freelance — 14hr 17min — 75%**;
  - **Music — 2hr 46min — 14%**;
  - **Personal — 11min — 1%**.

**ROUNDING NOTE**
- displayed percentages sum to 98%, compatible with integer percentage rounding;
- displayed per-list minute values sum to 18hr54min, two minutes below the 18hr56min panel total, also compatible with independent rounded durations.

**SOURCE-SEMANTIC NON-RECONCILIATION**
- the same visible filter/date state earlier reports **TOTAL HRS WORKED = 9.2hr**, while Time By List reports **Total Time = 18hr56min**;
- this difference is far larger than display rounding;
- VE-011 does not expose enough data to prove whether these are intentionally different measures or a source/version inconsistency;
- do not force them into one semantic definition. Leave for cross-source reconciliation, especially VE-012.

### ~00:02:18–00:02:54 — Done Tasks populated panel

**VIDEO-DIRECT**
- right lower panel is DONE TASKS;
- top punctuality bar uses:
  - green **76.22%**;
  - red **23.78%**;
- percentages sum exactly to 100%.

**ROW ANATOMY-DIRECT**
- completed rows are grouped by completion date with a task count at the right;
- each row contains:
  - list badge;
  - task title;
  - early/late/no-est status pill;
  - Taken duration at far right.

Visible examples:
- **01 Jul, 2025 — 2 tasks**
  - Finishing mixing LP — **6min Late** — **1hr 6min**;
  - Clothes launch announcement — **No Est** — **2hr 15min**.
- **30 Jun, 2025 — 3 tasks**
  - Landing page (Ninja School) — **1hr 12min Early** — **1hr 17min**;
  - Vocal recording for "Turn into the air" — **No Est** — **0min**;
  - Email newsletter — **20min Early** — **1hr 9min**.
- next heading **29 Jun, 2025 — 1 task** is visible lower in the internal list during scroll.

**INTERNAL-SCROLL-DIRECT**
- Done Tasks owns a visible internal vertical scrollbar;
- this is distinct from the outer Reports-page scroll.

**TRANSCRIPT + VISUAL CORROBORATION**
- narration says early/late classification is only available when EST exists;
- rows marked No Est visibly lack early/late badges, corroborating that rule.
- narration says the far-right duration is task Time Taken; row presentation is consistent with that metric grammar.

### ~00:02:37–00:02:54 — punctuality semantics

**VIDEO-DIRECT**
- green/red bar remains fixed while the Done Tasks list is discussed;
- visual mapping is corroborated by green Early and red Late row badges.

**TRANSCRIPT-CLAIM**
- narration defines the percentages as share of task time finished early versus late, not share of task count;
- example narration: 15 hours early + 5 hours late → 75% / 25%.
- the visible subset of rows is insufficient to independently recompute 76.22% / 23.78%, so the aggregation formula is not reverse-engineered beyond the narrated definition.

### ~00:02:54–00:03:10.40 — recap / outro

**VIDEO-DIRECT / NON-PARITY**
- lower analytics remain visible through the recap;
- final seconds transition to tutorial/community outro;
- no additional unique Reports state appears.

## VE-011 source synthesis

High-confidence behavior/anatomy established:
- Reports Overview uses list/date filters, four metric cards, a dominant three-series daily chart and vertically lower analytics;
- list filtering is multi-select and rerenders metrics live while the dropdown remains open;
- direct filter examples prove 18→10→14→18 task-count changes and corresponding hour/average changes;
- Total Work Days and secondary per-day values are arithmetically consistent with the visible active-day count;
- chart hover uses a vertical category band + black tooltip and directly reconciles Tasks + Breaks = Total for Mon 30 Jun;
- legend entries are actual interactive series toggles, independently hiding/restoring Total and Breaks while the plot reflows in place;
- outer Reports content scrolls while top shell and bottom app navigation remain pinned;
- productive cards directly show 9am-10am / Tuesday / Jun '25;
- Time By List directly shows a populated donut with list durations/percentages and Total Time 18hr56min;
- the large difference between 9.2hr headline Total Hrs Worked and 18hr56min Time By List Total is preserved as an unresolved source-semantic distinction, not normalized by inference;
- Done Tasks groups completed tasks by date, shows Early/Late/No Est pills, Taken durations and its own internal scrollbar;
- visible punctuality share is 76.22% early-color / 23.78% late-color;
- current v2.6.69 SS-C12/SS-C13 supersede this older video for the modern Reports header (Overview / Sessions, Export control) and current empty-state styling, while VE-011 supplies the strongest populated interaction evidence.

Static corroboration:
- SS-C12 current Overview chart hover and modern Reports shell;
- SS-C13 current lower-panel empty states;
- SS-C15 current list-filter popover.

No implementation conclusion is made in this analysis track.

---

# Queue 12 — VE-012 — Improved Sessions and Stats

Source: `Blitzit Tutorial How to Use Reports -Update Improved Sessions and Stats.mp4`  
Verified metadata: **06:56.300 video stream / ~06:56.357 container, 1920×1080, 30 fps, 12,489 video frames**  
Pass-3 status: **SOURCE_COMPLETE / IMPLEMENTATION_DEFERRED**

Inspection method:
- complete 416.3 s source reviewed end-to-end;
- 10 s whole-video contact scan;
- full-resolution keyframes across date filter, headline metrics, chart tooltips/toggles, productive cards, Time By List and Done Tasks;
- 0.5 s dense sampling around chart-series toggle sequence;
- 2 s dense sampling through Done Tasks internal scrolling;
- visible arithmetic checked against source labels;
- transcript used only to distinguish explicit product definitions from independently measurable pixels.

## VE-012 chronological state map

### 00:00:00–~00:00:18 — live-task context → Reports

**VIDEO-DIRECT / NON-UNIQUE**
- source opens with Blitzit focus/live-task context and recent Done tasks;
- Home/Reports navigation is then used to enter Reports;
- no unique Reports metric state is established until the 30-day range is selected.

### ~00:00:18–00:00:25 — Last 30 days range

**VIDEO-DIRECT**
- date-range picker is opened;
- left preset column shows:
  - Today;
  - Yesterday;
  - This week;
  - **Last 30 days**;
  - Last 60 days;
  - Last 90 days.
- `Last 30 days` is selected;
- resulting header range is:
  - **Jan 27, 2024 - Feb 26, 2024**.
- two-month calendar shows Jan 2024 and Feb 2024;
- selected endpoints are Jan 27 and Feb 26 with connected range shading;
- bottom actions are Cancel / Apply.

### ~00:00:25–00:03:00 — updated headline metrics

**VIDEO-DIRECT**
For the selected 30-day range:
- **TOTAL WORK DAYS — 17 days**;
- **TOTAL TASKS DONE — 44**, secondary **2.6 per day**;
- **TOTAL HRS WORKED — 81.7hr**, secondary **4.8hr per day**;
- **AVG. TIME PER TASK — 86.0 mins**.

**ARITHMETIC-DIRECT**
- 44 / 17 = 2.588 → displayed **2.6 per day**;
- 81.7 / 17 = 4.806 → displayed **4.8hr per day**;
- both per-day values use Work Days as denominator, not the 30-day calendar span.

**WORK-DAY SEMANTICS — TRANSCRIPT + GRAPH CORROBORATION**
- narration defines a work day as a calendar day with actual Blitzit live-task/break session activity;
- chart contains exactly the pattern of active and zero/empty days expected from that definition;
- empty calendar days are not counted simply because they fall within the selected range.

**AVG-TIME-PER-TASK SEMANTICS**
- narration explicitly states the average includes:
  - completed tasks;
  - incomplete tasks that nevertheless have recorded session time.
- the displayed 86.0 mins is therefore not `Total Hrs Worked / 44 Done Tasks`;
- indeed 81.7hr / 44 ≈ 111.4 mins, independently confirming that Done Tasks is not the denominator.
- exact underlying count of all session-bearing tasks is not shown and is not invented.

### ~00:03:00–00:03:37 — daily session graph / tooltips

**VIDEO-DIRECT**
- chart series:
  - TASKS — purple;
  - BREAKS — mint;
  - TOTAL — tan.
- tooltip uses a dark floating card and a tall translucent hover band over the selected day;
- visible direct examples include:

**Tue 30, Jan**
- TASKS: **10hr**
- BREAKS: **0hr**
- TOTAL: **10hr**

**Thu 01, Feb**
- TASKS: **10.2hr**
- BREAKS: **0hr**
- TOTAL: **10.2hr**

**Tue 13, Feb**
- TASKS: **5.6hr**
- BREAKS: **0.2hr**
- TOTAL: **5.7hr**

**ROUNDING FINDING**
- the displayed Tue 13 component labels 5.6 + 0.2 do not arithmetically equal the displayed 5.7 total;
- this is consistent with each series being independently rounded to one decimal from more precise underlying durations;
- therefore Pass 3 must not require arithmetic equality after display rounding for every tooltip row.

**SEMANTIC-DIRECT**
- TOTAL represents combined task-session + break-session time for the day;
- non-zero mint Break bars occur independently of task bars.

### ~00:03:32–00:03:37 — legend series toggles

**VIDEO-DIRECT**
- legend entries are interactive;
- source hides TASKS and BREAKS, leaving only tan TOTAL bars;
- remaining bars recenter/reflow within each date group;
- series are then restored;
- chart container and axes remain fixed.

This independently corroborates VE-011's interactive legend behavior.

### ~00:03:37–00:03:55 — scroll to lower analytics

**VIDEO-DIRECT**
- outer Reports content scrolls vertically;
- chart moves upward;
- lower analytics enter the viewport while bottom Home/Reports/Add new task/Help Center navigation remains pinned.

### ~00:03:55–00:04:52 — productive-time cards

**VIDEO-DIRECT**
- **MOST PRODUCTIVE HOUR — 3pm-4pm**;
- **MOST PRODUCTIVE DAY — Thursday**;
- **MOST PRODUCTIVE MONTH — Feb '24**.

**TRANSCRIPT-CLAIM**
- narration defines these as the hour/day/month with the greatest accumulated live/session activity in the selected range;
- the cards/values are direct, but the complete underlying aggregation dataset is not exposed.

### ~00:04:52–00:05:08 — Time By List

**VIDEO-DIRECT**
- Time By List uses a donut + list legend;
- panel total:
  - **Total Time: 80hr 6min**.
- visible list rows:
  - **Glorify — 51hr 39min — 64%**;
  - **Collabify De... — 22min — 0%**;
  - **Blitzit — 19hr 32min — 24%**;
  - **buildwithomar — 8hr 31min — 10%**;
  - **Test List — 0min — 0%**.

**ROUNDING-DIRECT**
- displayed percentages sum to 98%, consistent with independent whole-percent rounding;
- displayed list durations sum to about 80hr 4min, two minutes below the 80hr 6min panel total, also consistent with independently rounded/truncated row values.

### Headline Total Hrs Worked vs Time By List — semantic reconciliation

**DIRECT FACTS**
- headline: **81.7hr Total Hrs Worked**;
- Time By List: **80hr 6min Total Time**;
- headline graph explicitly contains separate task and break session series;
- Time By List categories are actual task lists only; there is no break category.

**RECONCILIATION — HIGH-CONFIDENCE INFERENCE**
- 81.7hr is approximately 81hr42min at displayed precision;
- difference from 80hr6min is approximately **1hr36min ≈ 1.6hr**;
- this is strongly consistent with headline Total Hrs Worked including break sessions while Time By List distributes only task-session time that can be assigned to lists.
- exact minute equality is not expected because headline hours are rounded to one decimal and list rows/panel are shown in hour/minute form.

**VE-011 CONFLICT DISPOSITION**
- VE-012 supplies a coherent scope model for the two panels;
- it does **not** numerically repair VE-011's much larger 9.2hr vs 18hr56min discrepancy;
- the VE-011 pair remains a source/version inconsistency or older calculation-state issue rather than something Pass 3 should normalize by inference.

### ~00:05:08–00:06:08 — Done Tasks rows

**VIDEO-DIRECT**
- Done Tasks panel has green/red punctuality bar with:
  - **32.48%** green;
  - **67.52%** red.
- panel owns its own internal vertical scrollbar.

**26 Feb, 2024 — 6 tasks**
Visible rows:
- `Test 5 Blitzit` — **30min Early** — **0min** Taken;
- `Reply to emails` — **1hr 19min Early** — **0min**;
- `UserPilot` — **1hr 56min Late** — **3hr 16min**;
- `Check Blitzit Reports` — **19min Early** — **0min**;
- `Webinar Setup` — **On Time** — **1hr**;
- `Post webinar` — **16min Early** — **43min**.

During internal scroll:
- **25 Feb, 2024 — 1 task**;
- `Scrintal Script` — **On Time** — **2hr**;
- older date groups become visible lower in the list.

**STATUS-GRAMMAR-DIRECT**
- green pills are used for Early and On Time;
- red pill is used for Late;
- far-right value is Time Taken / recorded task-session time;
- a task can be Early with 0min Taken if it was completed without recorded session time.

**TRANSCRIPT + VISUAL CORROBORATION**
- narration explicitly explains that 0min rows can come from marking a task Done without recorded Taken/session time;
- source rows visibly demonstrate this combination.

### ~00:06:08–00:06:47 — early/late percentage semantics

**VIDEO-DIRECT**
- 32.48% / 67.52% remains visible while narration explains the statistic;
- percentages sum to 100%.

**TRANSCRIPT-CLAIM / PARTIAL VISUAL SUPPORT**
- narration defines the ratio using accumulated **time early vs time late**, not count of Early/Late tasks;
- example explanation describes total hours early and total hours late being compared;
- visible subset is insufficient to reconstruct the entire 32.48/67.52 result because not all Done rows are simultaneously visible;
- therefore exact formula implementation is not reverse-engineered beyond the narrated definition.
- On Time is visibly a distinct third row status even though the headline percentage visualization presents only green-vs-red totals; its exact contribution/exclusion in the ratio is not independently measurable from this source.

### ~00:06:47–00:06:56.30 — outro

**VIDEO-DIRECT / NON-PARITY**
- recap/outro;
- no additional Reports state.

## VE-012 source synthesis

High-confidence behavior and semantics established:
- Last 30 days resolves to Jan 27–Feb 26, 2024 in the staged source;
- headline metrics are 17 work days / 44 done tasks / 81.7hr worked / 86.0min average task time;
- secondary per-day figures use **work days**, not calendar days;
- average time/task includes unfinished tasks that have recorded sessions, so 44 Done tasks is not its denominator;
- daily graph is session-derived and separates Tasks / Breaks / Total;
- tooltip examples directly show 10/0/10, 10.2/0/10.2 and 5.6/0.2/5.7 hours;
- 5.6 + 0.2 vs 5.7 directly warns that independently rounded display components need not sum exactly;
- legend series can be hidden/restored and bars reflow in place;
- productive cards = 3pm-4pm / Thursday / Feb '24;
- Time By List = 80hr6min with direct per-list duration/percentage rows;
- the ~1.6hr gap between 81.7hr headline and 80hr6min Time By List is strongly consistent with break time being included in headline total but not attributable to a task list;
- VE-012 clarifies intended metric scope but does not erase VE-011's larger historical numeric inconsistency;
- Done Tasks has its own internal scroll, Early/Late/On Time pills and Taken values;
- source punctuality split is 32.48% / 67.52%, narrated as accumulated early-vs-late time ratio rather than task-count ratio;
- current v2.6.69 screenshots still have precedence for present-day Reports shell/header styling.

Static/other-video corroboration:
- SS-C02 date-range picker;
- SS-C12 current Overview chart/tooltip shell;
- SS-C13 lower panel layout;
- VE-011 earlier populated Reports interaction evidence;
- VE-015 session-edit arithmetic supporting session-derived reporting.

No implementation conclusion is made in this analysis track.

---

# Queue 13 — VE-006 — Delete & Archive

Source: `Blitzit Tutorial How to Delete & Archive Tasks and Lists.mp4`  
Verified metadata: **01:23.883 video stream / ~01:23.963 container, 1920×1080, 60 fps, 5,033 video frames**  
Source version visible in Home: **v2.4.89**  
Pass-3 status: **SOURCE_COMPLETE / IMPLEMENTATION_DEFERRED**

Inspection method:
- complete source reviewed end-to-end;
- whole-video contact scan;
- dense/full-resolution review around task Delete, list Archive, Archived Lists and Archived Done;
- 0.25 s sampling around the Archive action;
- visible counters and card identities reconciled before/after destructive/archive mutations;
- narration kept separate where the source shows an affordance but does not execute its result.

## VE-006 chronological state map

### 00:00:00–~00:00:10 — Personal board baseline

**VIDEO-DIRECT**
- list `Personal` uses the established four-column board;
- header: **5 pending tasks, Est: 0min**;
- This Week: **0/5 Done**;
- visible tasks:
  - `Delete me`;
  - `Visit dentist`;
  - `Decorate studio`;
  - `Accounting`;
  - `Pay the bills`.
- Backlog, Today and Done are otherwise in empty/All Clear states.

### ~00:00:10–00:00:18 — ordinary task Delete

**VIDEO-DIRECT**
- hovering `Delete me` exposes the standard board action rail;
- overflow exact order:
  1. `Schedule`;
  2. `Change list`;
  3. `Duplicate`;
  4. `Delete` in red.

**IMPORTANT DESTRUCTIVE STATE**
- selecting Delete does **not** immediately remove the task;
- the destructive menu row transforms in place into a confirmation state:
  - trash icon;
  - red **`Confirm`**;
  - X cancel affordance at the right.
- there is no separate modal.

This corrects any superficial reading that ordinary task Delete is a one-click destructive action in this source version.

### ~00:00:18–00:00:21 — confirmed task removal

**VIDEO-DIRECT**
- activating Confirm removes `Delete me`;
- remaining rows reflow upward;
- list header changes:
  - **5 pending → 4 pending**;
- This Week changes:
  - **0/5 Done → 0/4 Done**.

**ARITHMETIC-DIRECT**
- exactly one pending task is removed from both list-level pending count and lane denominator.

**TRANSCRIPT-CLAIM**
- narration states deleted tasks are permanent, cannot be recovered and do not appear in Reports;
- this clip proves confirmed removal, but does not separately demonstrate recovery impossibility or Reports exclusion.

### ~00:00:26–00:00:35 — Home/list-grid baseline

**VIDEO-DIRECT**
- source returns to Home in visible app version **v2.4.89**;
- active grid includes:
  - All Lists;
  - ClickUp;
  - Personal;
  - Freelance;
  - TYAMA;
  - Music.
- left navigation includes:
  - Create new list;
  - All my lists;
  - Archived lists.
- All Lists shows **25 pending tasks** before the archive mutation.

**VERSION PRECEDENCE**
- this is older than the current v2.6.69 direct screenshot corpus;
- use VE-006 for interaction/state behavior, not as the strongest current styling target.

### ~00:00:35–00:00:37 — list overflow / Archive List

**VIDEO-DIRECT**
- ClickUp list-card overflow exact order:
  1. `Edit List`;
  2. `Duplicate`;
  3. `Archive List`.
- selecting Archive List applies directly;
- no second confirmation state is visible.

### ~00:00:36.5–00:00:40 — active-grid archive result

**VIDEO-DIRECT / MOTION-DIRECT**
- ClickUp disappears from the active list grid within the next sampled frames;
- surrounding cards reflow to occupy the vacated slot;
- Create List tile becomes visible in the newly available grid position.

**ARITHMETIC-DIRECT**
- All Lists pending count changes:
  - **25 → 22**;
- the archived ClickUp card had **3 pending tasks**;
- the exact decrement of three directly shows that archiving the list removes its pending tasks from the active All Lists aggregate.

**SEMANTIC-DIRECT**
- Archive differs from task Delete:
  - task Delete required inline destructive confirmation and removed one task;
  - list Archive is directly applied from the list-card menu and removes the list from the active workspace/aggregate.

### ~00:00:44–00:00:48 — Archived Lists destination

**VIDEO-DIRECT**
- selecting left-nav `Archived lists` opens archive management within the Home shell;
- tabs:
  - `Archived lists`;
  - `Archived done tasks`.
- contextual heading: **`Your archived lists`**.

### ~00:00:48–00:00:59 — populated Archived Lists

**VIDEO-DIRECT**
- archived ClickUp card is present;
- its task previews retain the same identifiable ClickUp content, including:
  - `Record video...`;
  - `Record video well C...`;
  - `Does ClickUp wo...`.
- card-level actions are:
  - **`Unarchive`**;
  - **`Delete Forever`** in red.
- this directly demonstrates that Archive preserves recognizable list/task content rather than deleting it.

**ACTION LIMIT**
- the tutorial points to/hover-demonstrates both Unarchive and Delete Forever;
- it does **not** commit either action.
- therefore:
  - the availability and destructive/reversible distinction are VIDEO-DIRECT;
  - “Unarchive restores active state” and “Delete Forever permanently removes list + tasks and cannot be undone” remain TRANSCRIPT-CLAIM outcomes in VE-006.

**SOURCE-STAGING NOTE**
- another archived card named TYAMA is visible even though TYAMA appeared in the earlier active grid;
- the source does not establish whether these are duplicate names, staged data or a timeline inconsistency;
- do not infer a uniqueness/state rule from that coincidence.

### ~00:00:59–00:01:04 — Archived Done tab

**VIDEO-DIRECT**
- selecting `Archived done tasks` changes the archive body to a searchable/filterable completed-task table;
- controls:
  - Search field;
  - All Lists filter with badge stack.
- table columns exact:
  - `Task Name`;
  - `List`;
  - `Info`;
  - `Date`;
  - `Action`.

### ~00:01:04–00:01:10 — populated Archived Done rows

**VIDEO-DIRECT**
Visible completed rows include:
- `Plan Video Tutorials` — Freelance — document/info icon — **2mon ago** — trash action;
- `Accounting` — Music — `No Info` — **3mon ago** — trash;
- `SK email` — Music — `No Info` — **3mon ago** — trash;
- `Make a post SK` — Music — `No Info` — **3mon ago** — trash;
- `Reels video (SK)` — Music — document/info icon — **3mon ago** — trash.

**ROW GRAMMAR**
- task titles are struck through/completed;
- list identity is retained;
- Info can be an icon or explicit `No Info`;
- Action is a trash/delete icon.

**ACTION LIMIT**
- Archived Done delete is visible but not executed;
- no post-delete row/count mutation is measured here.

### 00:01:04–00:01:10 — automatic 60-day archival claim

**TRANSCRIPT-CLAIM + VISUAL CORROBORATION**
- narration says Done tasks older than **60 days** are automatically archived into this section;
- visible rows are aged **2mon** and **3mon**, which is consistent with the claim;
- the source does not observe a task crossing the exact 60-day boundary or an automatic move event.
- therefore the exact 60-day automation remains a narrated product rule with corroborating archived ages, not VIDEO-DIRECT transition evidence.

### ~00:01:10–00:01:23.88 — recap/outro

**VIDEO-DIRECT / NON-PARITY**
- Archived Done remains on screen during the recap, followed by tutorial outro;
- no additional destructive/archive state is introduced.

## VE-006 source synthesis

High-confidence behavior/anatomy established:
- ordinary task Delete opens an inline **Confirm + X cancel** destructive state before deletion;
- confirming removes exactly one task and updates pending/lane denominators 5→4 and 0/5→0/4;
- permanence/recovery/Reports-exclusion are narrated but not independently demonstrated;
- list Archive is directly applied from Edit List / Duplicate / Archive List with no second visible confirmation;
- archiving ClickUp removes it from the active grid and changes All Lists pending **25→22**, exactly matching ClickUp's 3 pending tasks;
- archived list content remains recognizable, proving Archive is data-preserving rather than deletion;
- Archived Lists directly exposes Unarchive and red Delete Forever, but VE-006 does not execute their outcomes;
- Archived Done is a searchable/list-filtered table with completed title, list, info, relative date and trash action;
- visible 2mon/3mon rows corroborate but do not independently prove the narrated automatic >60-day rule;
- app version is v2.4.89, so current v2.6.69 screenshots supersede exact shell/styling while this clip remains valid interaction/history evidence.

Static corroboration:
- SS-H14 populated Archived Lists / Unarchive / Delete Forever;
- SS-H15 populated Archived Done table;
- SS-C10 current v2.6.69 Archived Lists empty shell;
- SS-C11 current v2.6.69 Archived Done search/filter empty shell.

No implementation conclusion is made in this analysis track.

---

# Queue 14 — VE-008 — Recurring Task Setup

Source: `Blitzit Tutorial How to Set Up Recurring Tasks.mp4`  
Verified metadata: **02:46.833 video stream / ~02:46.905 container, 1920×1080, 60 fps, 10,010 video frames**  
Pass-3 status: **SOURCE_COMPLETE / IMPLEMENTATION_DEFERRED**

Inspection method:
- complete source reviewed end-to-end;
- 5 s whole-video contact scan;
- dense 2 s sampling from initial Schedule entry through parent/child materialization and later child/parent management;
- full-resolution keyframes for initial board arithmetic, recurrence preset state, materialized parent/children, child completion, child Update Schedule, child schedule removal and parent Remove Recurring;
- 10 fps micro review around the final child-schedule/parent-recurring removals;
- transcript used only to separate future-generation cadence claims from directly materialized task evidence.

## VE-008 chronological state map

### 00:00:00–~00:00:26 — ordinary board baseline

**VIDEO-DIRECT**
- list is `TYAMA`;
- header reports **9 pending tasks, Est: 0min**;
- This Week shows **0/6 Done**;
- Today shows **0/1 Done**;
- ordinary task `Check emails` is one of the six This Week tasks;
- Backlog has three ordinary tasks and no recurring-task subsection yet.

This gives a clean pre-recurrence baseline for later identity/count arithmetic.

### ~00:00:26–00:00:33 — ordinary task → Schedule

**VIDEO-DIRECT**
- hovering `Check emails` exposes the normal board action rail;
- its overflow uses the ordinary Schedule / Change list / Duplicate / Delete grammar;
- selecting Schedule opens the standard date picker.

### ~00:00:33–00:00:37 — selected date

**VIDEO-DIRECT**
- calendar month: **June 2025**;
- selected date: **Monday, June 16, 2025**;
- selected 16 uses the bright cyan/lime circular treatment;
- top quick-date shortcuts and Cancel / Next remain consistent with VE-007.

### ~00:00:37–00:01:11 — recurrence preset panel

**VIDEO-DIRECT**
- second scheduler step header shows:
  - `< PICK DATE`;
  - **Mon, Jun 16, 2025**;
  - `Add Time` with `+ ADD`;
  - `Recurring schedule`.
- exact visible preset list:
  1. `No Repeat`
  2. `Every day`
  3. `Every weekday`
  4. `Every Monday`
  5. `Every month on 16th`
- No Repeat is the initial selected state;
- tutorial points through the preset options while explaining their intended cadence;
- **Every weekday** is the preset actually selected before commit.

**VERSION/SEMANTIC NOTE**
- the weekday-specific and month-specific labels are dynamically derived from the selected Monday/16th date;
- this is the same date-derived preset grammar independently seen in VE-007.

### ~00:01:11–00:01:16 — Every weekday commit

**VIDEO-DIRECT**
- `Every weekday` shows the selected checkmark;
- Schedule is committed;
- scheduler closes and returns to the board.

### ~00:01:16–00:01:33 — parent + generated children materialize

**VIDEO-DIRECT**
- the original ordinary `Check emails` disappears from the ordinary This Week stack;
- Backlog gains a dedicated **`Recurring tasks`** subsection;
- parent card:
  - title **`Check emails`**;
  - recurrence label **`Weekdays`**;
  - loop/recurring icon;
  - list badge;
  - EST/Taken slots.
- Today gains one generated `Check emails` child due **Today**;
- This Week gains subsection exact copy:
  - **`4 Scheduled tasks this week`**;
- four additional `Check emails` children are materialized for the remaining weekdays.

**ARITHMETIC-DIRECT**
- pre-recurrence pending count: **9**;
- post-recurrence pending count: **13**;
- ordinary parent source task is replaced by:
  - one recurring parent;
  - five generated child tasks.
- the +4 net pending change proves the recurring parent itself is **not counted as a pending actionable task** while the five children are.
- arithmetic:
  - 9 original pending − 1 ordinary `Check emails` + 5 child tasks = **13**;
  - parent exists visually but is excluded from the pending count.

### ~00:01:33–00:01:54 — child-task placement and ordinary-task behavior

**VIDEO-DIRECT**
- one child sits in Today because it is due on the current Monday;
- the other four children remain in This Week's scheduled subsection with day/date metadata;
- child cards use ordinary task-card affordances rather than a special locked-child surface;
- child rows retain normal EST/Taken slots and hover controls.

**TRANSCRIPT + VISUAL CORROBORATION**
- narration says generated child tasks can be edited/completed/rescheduled independently;
- later interactions in the same source directly demonstrate completion and rescheduling, so this is not narration-only.

### ~00:01:54–00:02:00 — complete one generated child

**VIDEO-DIRECT**
- one generated `Check emails` child is marked Done;
- after settle:
  - list pending count **13 → 12**;
  - This Week scheduled subsection **4 → 3** remaining scheduled children;
  - Done gains `Check emails` under **Mon, Jun 16, 2025**;
  - Today/This Week progress bars update to include the completed child.

**IDENTITY-DIRECT**
- completing a child does not complete/remove the recurring parent;
- parent remains `Weekdays` in Backlog and other children remain independently pending.

### ~00:02:00–00:02:08 — child overflow / Update Schedule

**VIDEO-DIRECT**
- a remaining scheduled child opens its ordinary scheduled-task overflow;
- menu includes:
  - **`Update Schedule`**;
  - schedule-detail row such as **`18th June`** with circular X/remove affordance;
  - Change list;
  - Duplicate;
  - Delete.
- this is child-task scheduling grammar, not parent recurring-rule grammar.

### ~00:02:08–00:02:13 — child reschedule

**VIDEO-DIRECT**
- Update Schedule reopens the scheduler pre-populated for **Wed, Jun 18, 2025**;
- current child schedule is No Repeat;
- user returns to Pick Date and chooses a different date;
- commit moves that child to the new date independently of the recurring parent.

**RESULT-DIRECT**
- after the edit, This Week still contains **3 Scheduled tasks this week**;
- two generated `Check emails` rows now visibly share **Thu** metadata while the third remains Fri;
- this directly demonstrates an individual child can be rescheduled onto a date already occupied by another generated child, producing same-title/same-day coexistence without altering the parent's Weekdays rule.

### ~00:02:13–00:02:22 — remove a child's schedule via X

**VIDEO-DIRECT**
- opening the rescheduled child's menu shows `Update Schedule` plus current date detail (e.g. **19th June**) with X;
- clicking the X removes that child's schedule;
- toast exact copy:
  - **`Removed schedule from task`**.
- scheduled subsection count changes **3 → 2 Scheduled tasks this week**.

**COUNT/IDENTITY-DIRECT**
- list pending count remains unchanged across the child schedule removal;
- therefore removing the schedule does **not delete the child task**;
- it removes scheduling metadata/placement while preserving task identity as a pending task elsewhere in the board flow.

### ~00:02:22–00:02:25 — recurring-parent overflow

**VIDEO-DIRECT**
- parent `Check emails` in Backlog opens a specialized recurring-parent menu;
- in this source version the visible menu is:
  1. **`Remove Recurring`**
  2. `Change list`
  3. `Duplicate`
  4. `Delete` in red.

**VERSION DIFFERENCE**
- VE-017's newer recurring-parent menu also exposes `Update Recurring`;
- VE-008 does not show that item in this menu state.
- do not flatten the two source versions into one exact menu contract without precedence/reconciliation.

### ~00:02:25–00:02:27 — Remove Recurring detaches the parent

**VIDEO-DIRECT**
- Remove Recurring is activated;
- Recurring tasks subsection disappears;
- `Check emails` reappears as an ordinary Backlog task;
- a second generic toast **`Removed schedule from task`** appears;
- existing generated children remain:
  - completed child remains in Done;
  - Today child remains;
  - remaining scheduled children remain in This Week.

**ARITHMETIC-DIRECT**
- once the parent becomes an ordinary task again, the list pending count increases by one because the former parent is now actionable/countable;
- this independently corroborates the earlier finding that an active recurring parent is excluded from pending-task counts.

### ~00:02:27–00:02:38 — detached-parent result

**VIDEO-DIRECT**
- board continues with ordinary Backlog `Check emails` plus surviving child tasks;
- no automatic deletion of already-created children occurs;
- child state survives removal of the parent recurrence relationship.

### ~00:02:38–00:02:46.83 — recap/outro

**VIDEO-DIRECT / NON-PARITY**
- narration summarizes recurring scheduling and community/outro material;
- no additional unique recurring-task state is introduced.

## VE-008 source synthesis

High-confidence direct behavior established:
- an ordinary task can be converted into a recurring parent through the normal Schedule flow;
- for Monday Jun 16 the preset list is No Repeat / Every day / Every weekday / Every Monday / Every month on 16th;
- Every weekday is the rule actually committed;
- recurring parent is moved into Backlog's `Recurring tasks` subsection and labeled `Weekdays`;
- five generated children are materialized for the current workweek: one Today + four This Week scheduled children;
- 9→13 pending arithmetic proves the recurring parent is not counted as pending while its generated children are;
- generated children are ordinary-manageable identities: one can complete independently, reducing pending/scheduled counts while leaving parent intact;
- a child can use Update Schedule independently of the parent rule;
- rescheduling one child can create same-day/same-title coexistence with another child;
- the child schedule-detail X removes schedule metadata without deleting the task, evidenced by stable pending count and scheduled subsection decrement;
- VE-008 parent menu exposes Remove Recurring / Change list / Duplicate / Delete, while newer VE-017 also shows Update Recurring — explicit version difference;
- Remove Recurring converts the parent back into an ordinary Backlog task and leaves existing child tasks untouched;
- active recurring parent exclusion vs detached ordinary-task inclusion in pending counts is directly supported by board arithmetic;
- future Monday regeneration cadence described by narration is not independently time-lapsed in this source.

Cross-source corroboration:
- VE-007 scheduler/preset/date grammar;
- VE-017 newer recurring update/detachment semantics;
- SS-H08 No Repeat/destructive existing-task state for the newer update flow.

No implementation conclusion is made in this analysis track.

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
