# Blitzit Forensic Pass 3 — Screenshot Findings

Status: **STATIC SOURCE PASS COMPLETE — 46/46 individually inspected**

Date: 2026-10-02

Scope: source analysis only. These records do **not** modify or validate Narro implementation.

## Evidence rules

- Every retained image was inspected individually rather than inferred from its filename/index entry.
- **CURRENT-DIRECT** current supplied v2.6.69 evidence has highest static-visual precedence.
- **HELP-V2X** adds distinct states/context and corroborates current/direct evidence.
- **HISTORICAL** establishes product evolution and long-lived grammar only; it cannot override stronger current evidence.
- Static screenshots establish visible state/anatomy, not transition timing or hidden behavior.
- Interaction implications inferred from a screenshot are labeled as such.
- Where text/icon detail is too small or ambiguous, this document says so rather than inventing exact semantics.

---

# 1. Current supplied v2.6.69

## SS-C01 — current-v2.6.69-create-list-dialog.png — 615×687

**CURRENT-DIRECT**

Visible anatomy:
- centered dark modal over a dimmed/blurred Home surface;
- close X in the upper-right corner;
- centered heading `Create a new list`;
- large circular upload affordance with image icon;
- exact visible copy `UPLOAD AN ICON` and `(Optional) (jpg, png, svg)`;
- `Pick a list color` followed by a compact horizontal swatch row;
- first swatch is multicolor; selected lime/green swatch has a bright outline and check;
- single title input with placeholder `Enter your list title`;
- bottom secondary `Cancel` as a dark/transparent outlined pill;
- bottom primary `Create` as a cyan→lime gradient pill.

Visual hierarchy:
- primary action uses the same high-salience gradient language seen elsewhere;
- upload and color choices are centered; input/actions are wider and aligned;
- modal surface is near-black with a thin low-contrast border and medium radius;
- substantial vertical whitespace separates functional groups.

Pass-3 implication:
- list creation is one compact modal, not a wizard;
- icon upload, color, and title are sibling inputs;
- no evidence here for validation errors, disabled state, upload progress, or post-create animation.

## SS-C02 — current-v2.6.69-reports-date-range-picker.png — 750×494

**CURRENT-DIRECT**

Visible anatomy:
- date-range trigger above popover reads `Aug 07,2026 - Aug 14,2026`;
- left preset column: `Today`, `Yesterday`, `This week`, `Last 30 days`, `Last 60 days`, `Last 90 days`;
- two visible months side-by-side: Aug 2026 and Sep 2026;
- weekday row begins Sun;
- month navigation exposes single/double chevrons;
- selected start/end dates 7 and 14 use filled purple/pink circular endpoints;
- in-between dates use a muted connected range background;
- bottom `Cancel` is a long outlined control;
- `Apply` is a smaller purple/blue gradient pill.

Interaction implications:
- range selection is two-ended and visually continuous;
- preset selection and custom calendar share one popover;
- static image does not establish keyboard behavior, hover, month-transition animation, or whether Apply is disabled before a valid range.

## SS-C03 — current-v2.6.69-home-dark.png — 2559×1079

**CURRENT-DIRECT**

Full-shell findings:
- near-black desktop canvas with large unused negative space below the primary content row;
- fixed left account/status card with Blitzit BETA branding, `(v2.6.69)`, plan state and trial messaging;
- second left navigation card with `+ Create new list`, `All my lists`, `Archived lists`;
- center greeting `Good Night, Ma` with contextual subtitle;
- `Your Lists` heading above a horizontal list-card grid;
- right-aligned contextual label `Lists with your upcoming tasks`;
- list cards show icon/badge + title + overflow ellipsis;
- card body previews numbered tasks with tracked/done time aligned right;
- bottom metadata includes pending-task count and, where present, `Est:` aggregate;
- dedicated dashed-outline Create List tile at the end of the grid;
- top-right utility cluster: `Upgrade Now`, search, app/grid icon, settings, user/avatar menu;
- bottom app navigation: Home and Reports left; help/assistant controls right.

State hierarchy:
- Home is card-centric and horizontally dense at the top, not a dashboard filling the full viewport;
- account/navigation remain visually isolated from the list grid;
- card preview rows are intentionally low-contrast compared with list titles;
- no persistent primary create-task CTA is dominant in this current Home capture.

## SS-C04 — current-v2.6.69-create-list-tile.png — 359×385

**CURRENT-DIRECT**

Visible state:
- large empty rounded rectangle;
- dashed perimeter uses a cyan/teal→lime gradient rather than a flat stroke;
- centered plus icon above `CREATE LIST`;
- label uses accent treatment and uppercase;
- cursor is over lower half, confirming whole tile is an interactive hit target.

Implication:
- this is a first-class card in the list grid, not a small toolbar button;
- hover/press animation is not established by the static image.

## SS-C05 — current-v2.6.69-list-card-hover-overflow-menu.png — 354×372

**CURRENT-DIRECT**

Hover state:
- list card receives a stronger outline;
- centered gradient `Open` pill appears over the preview area;
- underlying preview rows remain present but are visually de-emphasized;
- card footer still shows `4 pending tasks` and `Est: 37hr`;
- top-right ellipsis opens a compact anchored menu.

Exact menu order:
1. `Edit List`
2. `Duplicate`
3. divider
4. `Archive List`

Interaction implication:
- `Open` is hover/focus-revealed inside a reserved card body area;
- overflow is list management, distinct from the card's Open action;
- no destructive Delete action appears in this current list menu state.

## SS-C06 — current-v2.6.69-search-command-palette.png — 2559×1079

**CURRENT-DIRECT**

Visible anatomy:
- whole Home surface is dimmed rather than replaced;
- compact centered palette;
- search row contains magnifier, placeholder `Search for tasks, lists`, and keycap `Ctrl+F`;
- divider below search;
- heading `Quick actions`;
- three compact buttons: `Add new task`, `Add new list`, `Go to Reports`.

Implications:
- search and command actions coexist in one overlay;
- quick actions are immediately available before typing;
- screenshot does not establish result grouping, fuzzy matching, keyboard selection, close animation, or empty-results state.

## SS-C07 — current-v2.6.69-preferences-general.png — 735×879

**CURRENT-DIRECT**

Structure:
- tall centered/right-biased dark Preferences surface with internal vertical scroll;
- close X top-right;
- heading `Preferences`;
- subtitle `Customize your workflow for a personalized experience`;
- section dividers create a repeated vertical rhythm.

`Blitz Panel`:
- `Select Screen`;
- selected monitor thumbnail outlined with accent gradient;
- dimension overlay `2560×1080`;
- label `Screen 1`;
- `Blitz Panel Side` segmented Left/Right, Left visibly selected.

`General`:
- `Hide est/done times on tasks` toggle ON;
- `Auto-parse Est. time from title` toggle ON;
- `Theme` segmented `System / Dark / Light`, with Dark selected using accent fill.

`Time`:
- `Timezone` selector shows `(GMT+03:00) Europe/Athens`.

Interaction implication:
- monitor, side, theme and timezone are inline controls inside one scrollable Preferences family;
- information icons precede several labels;
- selected segmented buttons use filled/high-contrast treatment rather than only an outline.

## SS-C08 — current-v2.6.69-preferences-blitz-mode-alerts.png — 747×864

**CURRENT-DIRECT**

`Blitz mode settings`:
- `Pomodoros` toggle OFF;
- `Default break length` dropdown `10 mins`;
- `Scrolling title on live timer` toggle ON.

`Alerts`:
- `Timed alerts during a task` ON;
- nested children are indented and connected by a vertical guide:
  - `Pick task alert timings` → `10 mins`;
  - `Pick an alert sound` with speaker icon, play/preview triangle and sound dropdown;
  - `Animated flash on timer` ON;
- `Notification Alerts` ON with its own nested sound selector + preview controls;
- `Schedule reminders (system)` ON with nested `Reminder timing` → `10 mins before`.

Pass-3 finding:
- child controls are not separate dialogs; they disclose directly beneath enabled parents;
- different alert families keep separate sound selections.

## SS-C09 — current-v2.6.69-preferences-alerts-celebration.png — 747×820

**CURRENT-DIRECT**

Continuation of Alerts plus completion behavior:
- Timed alerts, Notification Alerts and Schedule reminders remain enabled with their nested controls visible;
- section `Celebrate task completion`;
- `Show success screen` ON;
- nested `Fun gif on success screen` ON;
- `Success sound effect` row includes speaker, preview triangle, dropdown (`Victory B...`) and an ON toggle.

Implication:
- success-screen media/sound are conditional children, visually subordinate but kept in the same flow;
- parent/child relation is expressed by indentation and vertical guide line.

## SS-C10 — current-v2.6.69-archived-lists-empty.png — 2557×1077

**CURRENT-DIRECT**

Visible state:
- normal Home shell and left navigation remain;
- `Archived lists` nav item selected;
- segmented tabs `Archived lists` / `Archived done tasks`, first selected;
- right-side contextual label `Your archived lists`;
- centered empty-state icon;
- exact primary text `No archived lists found`;
- supporting text `Looks Like you do not have any archived list at this moment`.

Layout implication:
- archive management is a Home-shell destination, not a modal;
- the empty state occupies the card-grid region while the shell remains fully available.

## SS-C11 — current-v2.6.69-archived-done-tasks-filter-empty.png — 2559×1079

**CURRENT-DIRECT**

Visible state:
- `Archived done tasks` tab selected;
- wide Search field;
- list filter aligned right with selected `All Lists`;
- open filter menu lists All Lists plus named lists with badges;
- central empty state:
  - `No Archived tasks found`;
  - `Looks Like you do not have any archived done tasks at this moment`.

Interaction implication:
- archived Done supports both text search and list scoping;
- list filter is a compact anchored dropdown using the same badge grammar as elsewhere.

## SS-C12 — current-v2.6.69-reports-overview-chart-tooltip.png — 2559×1079

**CURRENT-DIRECT**

Header:
- `< BACK`, `Reports`;
- segmented `Overview` / `Sessions` with Sessions carrying `Beta`;
- All Lists filter;
- `Export PDF`;
- date range trigger.

Summary row:
- `Total work days` → 8;
- `Total tasks done` → 0;
- `Total time worked` → 0hr 0min;
- `Avg. Time per task` → -.

Main chart:
- three series: TASKS, BREAKS, TOTAL;
- dates across x-axis;
- hover region is highlighted vertically;
- compact black tooltip shows date plus per-series values;
- small chart options/menu icon at upper-right.

Below:
- Most Productive hour/day/month cards;
- Time By List and Done Tasks panels.

Implication:
- chart tooltip is contextual and in-place;
- series legend is persistent beneath graph;
- Overview is built as card/panel hierarchy, not one freeform canvas.

## SS-C13 — current-v2.6.69-reports-overview-lower-panels.png — 2559×1079

**CURRENT-DIRECT**

Lower hierarchy:
- chart continues above;
- three equally weighted productive-time cards;
- `TIME BY LIST` large panel shows centered `No report on the selected date range`;
- `DONE TASKS` large panel has green/red legend with 0% values.

Implication:
- lower report panels preserve substantial vertical space even when empty;
- empty report messaging is local to the affected panel, not a page-level empty state.

## SS-C14 — current-v2.6.69-sessions-dashboard-empty.png — 2559×1079

**CURRENT-DIRECT**

Current Sessions state:
- Sessions tab selected and still labeled `Beta`;
- All Lists filter;
- top-right `+ Add Session`;
- current export label is **`Export .csv`**;
- `Hide Break sessions` control;
- date range;
- summary cards:
  - `Total Time` 0min;
  - `Total Tasks` 2;
  - `Total Sessions` 0;
- body is otherwise empty without a prominent centered empty-state message.

Important conflict:
- current/direct `Export .csv` has stronger precedence than older Help screenshots showing `Export PDF` for Sessions.

## SS-C15 — current-v2.6.69-reports-list-filter-open.png — 2559×1079

**CURRENT-DIRECT**

Visible filter:
- All Lists trigger has accent/active border;
- dropdown lists All Lists, Job Preparation, ReArrange, STUDY with badges;
- dropdown is narrow and anchored directly below the trigger;
- rest of Overview remains live/visible behind it.

Implication:
- report list selection is a compact popover, not a modal or separate filter page.

## SS-C16 — current-v2.6.69-home-light-list-hover.png — 2559×1079

**CURRENT-DIRECT**

Light-theme corroboration:
- same Home shell, left status/navigation, list grid and bottom nav as dark;
- light theme uses pale gray canvas and white cards rather than a literal color inversion;
- hovered Job Preparation card has stronger outline;
- centered gradient `Open` CTA appears without changing card dimensions;
- preview rows remain in-place behind hover action.

Pass-3 finding:
- dark/light preserve information architecture and geometry;
- hover CTA reveal is theme-consistent.

## SS-C17 — current-v2.6.69-windows-shortcuts-dialog.png — 760×726

**CURRENT-DIRECT**

Exact groups and visible bindings:

`Global (works outside & inside Blitzit)`
- Go to Blitzit — Ctrl + Shift + B — toggle;
- Alternate between Focus Mode — Ctrl + Shift + T — toggle;
- Find focus timer — Ctrl + Shift + P — toggle.

`App (works only inside of Blitzit)`
- Create new task — Ctrl + Alt + T;
- Start break — Ctrl + Alt + B;
- Pause task — Ctrl + Alt + P;
- Skip task — Ctrl + Alt + S;
- Finish active task (Mark as done) — Ctrl + Alt + F;
- Add Notes (Active task) — Ctrl + Alt + N;
- Search — Ctrl + F.

Visual grammar:
- white modal surface with large dark text;
- rounded keycaps;
- close X;
- global rows have enable toggles at far right;
- app-only rows do not.

## SS-C18 — current-v2.6.69-floating-timer-expanded-subtasks.png — 418×310

**CURRENT-DIRECT**

Expanded Floating Timer:
- width remains compact while height expands;
- top action strip is icon-led;
- visible control family includes a gamepad-like/break affordance, Notes/document, pause, skip, Done/check, and expand/restore;
- subtask summary `3/4 Subtasks` with circular progress, plus and collapse chevron;
- completed subtasks are struck through;
- incomplete row remains normal;
- each visible row exposes up/down/delete actions at right.

Implications:
- Floating Timer is a vertically expandable compact surface;
- subtask management is in-place, not a separate modal;
- exact semantics of the gamepad-like icon are corroborated by video/help material rather than inferred from this image alone.

## SS-C19 — current-v2.6.69-focus-panel-full.png — 294×727

**CURRENT-DIRECT**

Panel header:
- list selector `All`;
- `Today`;
- settings, Home and compact/expand presentation controls.

Progress:
- `Est: 2hr 10min`;
- gradient progress bar;
- `1/4 Done`.

Live card:
- `BFCM strategy`;
- large live time `08:07:14`;
- strong mint/gradient outline;
- subtask ring + `1/4 Subtasks`, plus, disclosure chevron.

Queue:
- ordinary rows retain dark card treatment;
- list badges appear at right;
- overdue metadata `2d ago` appears warm/orange;
- row-level subtask progress appears beneath some tasks.

Lower sections:
- `+ ADD TASK`;
- `3 Scheduled tasks`;
- scheduled rows with Today times and integration badges;
- `1 Done`;
- completed row uses strikethrough and still shows Taken time/badges.

Pass-3 finding:
- Focus Panel combines live task, queue, scheduled and Done in one continuous narrow surface.

## SS-C20 — current-v2.6.69-floating-timer-collapsed.png — 363×162

**CURRENT-DIRECT**

Collapsed compact state:
- title `BFCM strategy` left;
- live time `08:13:22` right;
- lower subtask summary row `2/4 Subtasks`;
- circular progress;
- plus;
- downward disclosure chevron.

No persistent full action rail is visible in this resting state.

Implication:
- action controls can be conditional/hover/selection driven;
- collapsed Timer prioritizes task identity, live time and subtask status.

## SS-C21 — current-v2.6.69-focus-panel-notes-expanded.png — 352×721

**CURRENT-DIRECT**

Notes state inside Focus:
- top live task remains visible with live timer and subtask progress;
- another queue task expands in-place;
- expanded task title row begins with circular completion affordance;
- Notes editor toolbar includes bold, italic, strikethrough, list controls, undo/redo and a microphone-like control at far right;
- multiline note body is directly editable/visible;
- `× Close` at bottom-right of editor;
- card height expands and pushes later content downward;
- `+ ADD TASK` remains below the expanded task.

Implication:
- Notes are contextual/inline even in narrow Focus;
- editor expansion does not replace the whole Focus surface.

## SS-C22 — current-v2.6.69-sessions-task-detail-inline-edit.png — 1615×849

**CURRENT-DIRECT**

Task-detail state:
- overlay/detail surface titled `BFCM strategy`;
- list chip/badge `Blitzit`;
- `+ Add Session`;
- aggregate session count/time visible at top-right of detail;
- rows named `Session 25`, `Session 24`, etc.;
- each row exposes date, start time, arrow, end time, duration and ellipsis;
- Session 25 shows an end-time field in active inline-edit state with bright accent border;
- green check control confirms the edit in-place.

Implication:
- single session fields are directly editable without navigating away;
- row geometry persists while one field becomes an editor;
- the screenshot does not prove the exact keyboard commit/cancel rules.

---

# 2. Help Center v2.x distinct-state references

## SS-H01 — help-v2x-board-four-columns-dark.png — 1160×729

**HELP-V2X**

Full planning board:
- top Back control, list selector and list summary text;
- four columns: Backlog, This Week, Today, Done;
- Backlog/Week/Today expose headline time and plus control;
- Week/Today expose horizontal progress + done fraction;
- Today carries a persistent cyan→green accent border;
- `BLITZIT NOW` is anchored at the bottom of Today;
- Blitz CTA is a multicolor gradient pill with rocket icon;
- cards show ordinal where applicable, title, optional note/schedule metadata, EST lower-left and Taken lower-right;
- scheduled sections remain inside Backlog/Week/Today;
- recurring tasks have a dedicated Backlog group;
- Done is grouped by date and per-day task count;
- completed task titles are struck through;
- bottom shell exposes Home, Reports, global Add new task and Help Center.

Critical static baseline:
- this is the strongest complete still image for the four-column planning composition;
- it corroborates the planning video excerpt's Today treatment and CTA anchoring.

## SS-H02 — help-v2x-today-column-task-progress-dark.png — 1048×718

**HELP-V2X**

High-detail Today crop:
- `Today`;
- headline `1hr 30min`;
- plus at upper right;
- gradient completion bar;
- `4/5 Done`;
- task ordinal `1` at far left;
- title `Prepare weekly report`;
- integration badges at right;
- `1hr 30min` lower-left;
- `15min` lower-right;
- `+ ADD TASK`;
- persistent cyan→green lane outline.

Pass-3 finding:
- card lower-left/right numbers visibly encode EST vs Taken without explicit text labels;
- ordinal occupies a reserved leading slot in the resting card.

## SS-H03 — help-v2x-focus-panel-docked-left-desktop-context.png — 1160×750

**HELP-V2X**

Desktop-context evidence:
- Focus Panel is flush/docked to the left edge of the desktop;
- narrow vertical surface coexists with another application's desktop space;
- top controls remain accessible inside the panel;
- live card, queue, overdue scheduled section and Add Task remain visible;
- panel height spans most of the available work area.

Static implication:
- supports edge-docked companion-window intent;
- does not establish exact Windows geometry because this capture is macOS context.

## SS-H04 — help-v2x-focus-panel-list-selector-open.png — 1161×840

**HELP-V2X**

Open selector:
- trigger at top-left uses one list badge + down chevron;
- dropdown includes `All Lists` with stacked badges and `+5`;
- named lists `Work`, `Home`, `Content Plan`;
- each named list has its own colored square badge;
- dropdown overlays Focus content without navigating away.

Implication:
- list switching is compact and contextual inside Focus;
- All Lists is represented by a badge stack/count rather than plain text only.

## SS-H05 — help-v2x-focus-panel-quick-preferences-open.png — 1160×1031

**HELP-V2X**

Quick Preferences is a distinct Focus-side surface:
- title `Menu` with back button;
- `Quick Preferences`;
- Hide est/done times toggle;
- screen thumbnails with explicit dimensions;
- selected screen outlined in accent;
- Blitz Panel Side Left/Right;
- Pomodoros;
- Timed alerts during a task;
- Notification Alerts;
- Show success screen;
- nested Fun gif on success screen.

Pass-3 distinction:
- this is not the same composition as the full current Preferences modal;
- it is a Focus-local fast settings surface and should be analyzed separately from global Preferences.

## SS-H06 — help-v2x-preferences-pomodoro-settings-expanded.png — 664×604

**HELP-V2X**

Conditional Pomodoro state:
- `Pomodoros` ON;
- nested vertical guide reveals:
  - `Work Sprint` → `30 mins`;
  - `Break Time` → `10 mins`;
- `Default break length` remains a separate top-level setting;
- `Scrolling title on live timer` ON.

Finding:
- Pomodoro-specific work/break lengths are children of the Pomodoro toggle, while Default break length is not.

## SS-H07 — help-v2x-schedule-date-picker.png — 840×832

**HELP-V2X**

Scheduling dialog:
- centered over the board;
- top quick shortcuts `TODAY`, `LATER TODAY`, `TOMORROW`, `NEXT WEEK`;
- month heading `December 2023`;
- selected date 7 is a filled gradient circle;
- small purple dots appear under some dates, indicating additional date metadata/state;
- footer `CANCEL` secondary and `NEXT` gradient primary.

Implication:
- scheduling is multi-step/context-preserving;
- exact meaning of date dots requires corroboration; do not infer from this still alone.

## SS-H08 — help-v2x-recurrence-no-repeat-delete-existing-tasks.jpg — 788×922

**HELP-V2X**

Recurrence state:
- heading `Recurring schedule`;
- `No Repeat` selected;
- other presets remain visible;
- warm/red consequence row `Delete existing tasks(6)` with checkbox;
- footer `Cancel` + gradient `Schedule`.

Finding:
- destructive consequence is conditional and visually differentiated inside the same recurrence surface;
- this is stronger than a generic destructive-menu inference.

## SS-H09 — help-v2x-floating-timer-action-strip-notes-selected.png — 1152×339

**HELP-V2X**

Action-strip state:
- horizontal compact dark surface;
- icon actions remain compact;
- Notes becomes a wider selected pill containing icon + text `Notes`;
- adjacent controls include pause, skip, Done/check and expand/restore;
- a small minimize/drag-like line appears at far left; a gamepad-like action is also present.

Interaction implication:
- selected action can expand from icon-only to labeled pill;
- action strip is not uniformly text-labeled.

## SS-H10 — help-v2x-task-notes-inline-expanded.png — 840×843

**HELP-V2X**

Board Notes editor:
- lane header remains visible with time/progress;
- task card expands in-place;
- toolbar contains rich-text/list/undo/redo controls;
- note body has internal vertical scrolling;
- `Close` sits at lower-right of editor.

Finding:
- editor owns its own scroll region inside the card;
- lane itself does not become a separate notes page.

## SS-H11 — help-v2x-subtasks-inline-add-input.png — 704×382

**HELP-V2X**

Subtask add state:
- card action strip remains visible above subtask section;
- `Subtasks +` header;
- section expanded;
- input placeholder `Enter Subtask task title*`;
- input receives bright cyan→lime focus border;
- X/cancel control inside input at right.

Finding:
- adding a subtask is a one-row inline expansion, not a modal.

## SS-H12 — help-v2x-subtasks-expanded-progress-actions.png — 624×382

**HELP-V2X**

Subtask management:
- circular progress ring + `4/5 Subtasks`;
- plus control;
- collapse chevron;
- completed row visibly struck/secondary;
- row hover/management actions at right: up, down, delete.

Finding:
- progress indicator and count are coupled;
- row reorder/delete affordances are compact and right-aligned.

## SS-H13 — help-v2x-task-overflow-menu-open.png — 830×732

**HELP-V2X**

Board task hover:
- completion circle at left of title;
- right-side action rail visibly includes a subtasks/list-like icon, Notes/document, left arrow, right arrow, ellipsis;
- opening ellipsis yields exact menu:
  1. Schedule
  2. Change list
  3. Duplicate
  4. divider
  5. Delete (red)

Pass-3 finding:
- lane-left/lane-right are direct card actions rather than overflow items;
- Delete is isolated/destructive;
- geometry remains one task card rather than transforming to a separate toolbar row.

## SS-H14 — help-v2x-archived-lists-unarchive-delete-forever.png — 1599×1019

**HELP-V2X / older v2.4.89**

Populated archive:
- normal Home shell;
- archived list cards are muted but preserve a task preview;
- bottom of each card exposes management actions;
- visible actions `Unarchive` and red `Delete Forever`.

Finding:
- archive state retains enough list context for recognition;
- Delete Forever is visually destructive and separate from Unarchive.

Historical precedence note:
- current v2.6.69 empty archive screenshots define shell styling; this older populated state supplies missing action anatomy.

## SS-H15 — help-v2x-archived-done-tasks-populated.png — 1659×1079

**HELP-V2X / older v2.4.89**

Populated Archived Done:
- Search and list filter;
- table headings `Task Name`, `List`, `Info`, `Date`, `Action`;
- rows retain ordinal, completion icon and struck-through title;
- list badge/name shown;
- Info can show document icon or `No Info`;
- relative dates (`2mon ago`, `3mon ago`);
- trash/delete icon at far right.

Finding:
- populated Archived Done uses a table/list layout unlike archived-list cards.

## SS-H16 — help-v2x-sessions-dashboard-populated-export-pdf.png — 2688×1743

**HELP-V2X**

Populated Sessions layout:
- Sessions tab selected with Beta badge;
- All Lists filter;
- `+ Add Session`;
- older `Export PDF`;
- `Hide Break sessions`;
- date range;
- summary cards `Total Time 12hr 23min`, `Total Tasks 38`, `Total Sessions 20`;
- sessions grouped by date headings;
- each row includes task title, list chip, session number, date, start→end, duration and overflow ellipsis.

Conflict:
- current/direct SS-C14 shows `Export .csv`, which supersedes this Help screenshot for current Sessions export format.

## SS-H17 — help-v2x-sessions-add-session-task-picker-open.png — 1249×843

**HELP-V2X**

Add Session state:
- compact `Add Session` dialog;
- task selector opens an anchored dropdown;
- search field placeholder `Select tasks...`;
- `Recent Tasks` grouping;
- task rows show title and list badge at right.

Finding:
- task selection in Add Session is searchable and recent-task oriented;
- background Sessions rows remain visible behind dialog.

---

# 3. Historical Tool Finder references

These are history/context only unless corroborated by current/direct or Help v2.x evidence.

## SS-T01 — historical-tool-finder-board-four-columns-light.png — 817×539

**HISTORICAL**

Corroborates:
- four-column Backlog / This Week / Today / Done architecture;
- Today accent border;
- Today progress fraction;
- anchored `Blitzit now` gradient CTA;
- scheduled grouping;
- bottom Home/Reports/Add new task/Help Center shell;
- `All Clear` empty treatment.

Historical-specific visual details must not override current dark/help screenshots.

## SS-T02 — historical-tool-finder-inline-task-create.png — 1241×710

**HISTORICAL**

Older inline-create anatomy:
- `× CANCEL`;
- labels `Title` and `Est time`;
- title input;
- small estimate input;
- helper `Add a new task`;
- gradient `Confirm`.

Use:
- evidence that task creation has long been inline inside a lane;
- exact copy/layout is historical and not automatically current.

## SS-T03 — historical-tool-finder-task-card-est-time-taken.png — 1239×711

**HISTORICAL**

Task card:
- title;
- list badge;
- EST bottom-left (`45min`);
- Taken bottom-right (`0min`);
- no visible `Est:`/`Taken:` labels;
- Today rows visibly include ordinal.

Corroborates current/help metric placement and ordinal grammar.

## SS-T04 — historical-tool-finder-focus-panel-task-hover-actions.png — 456×674

**HISTORICAL**

Focus hover:
- live task at top with timer;
- hovered ordinary/overdue task exposes compact action rail;
- visible controls include rocket/Make Live, subtasks, Notes/document and overflow.

Important distinction:
- Focus hover action grammar differs from board lane-left/lane-right grammar;
- do not collapse all task-card surfaces into one universal action set.

## SS-T05 — historical-tool-finder-preferences-full.png — 196×644

**HISTORICAL**

Long-form Preferences:
- screen selection;
- Panel side;
- hide times;
- theme;
- Pomodoro/default break;
- Alerts;
- completion celebration.

Use:
- corroborates long-lived section ordering/conditional hierarchy;
- current v2.6.69 direct screenshots supersede exact copy/control styling.

## SS-T06 — historical-tool-finder-focus-task-overflow-schedule-menu.png — 179×653

**HISTORICAL / LOW-RES**

Visible menu clearly includes:
- `Update Schedule`;
- a scheduled date/time line;
- `Open in Calendar`;
- `Change list`;
- `Duplicate`;
- a lower red/destructive row whose exact text is not sufficiently reliable at this resolution.

Rule:
- do not transcribe the ambiguous destructive label as fact;
- use current/help higher-resolution menu evidence for exact wording.

## SS-T07 — historical-tool-finder-board-notes-inline-expanded.png — 858×592

**HISTORICAL**

Corroborates:
- Notes expand inside a board task;
- rich toolbar and multiline body;
- scheduled-task context can retain inline Notes;
- Today CTA remains anchored while another lane contains an expanded card.

---

# 4. Cross-image source synthesis

## 4.1 Stable visual/product grammar

Across current/direct + Help evidence:

- charcoal/near-black is the dominant current desktop canvas;
- raised surfaces are subtle rather than strongly shadowed;
- primary text is near-white; metadata is muted gray;
- high-salience primary actions use cyan/mint/lime or broader pastel gradients;
- Today is a special planning lane with persistent accent border and anchored Blitz CTA;
- task/list actions are contextual and compact;
- dense controls prefer popovers/inline expansion over page navigation;
- dark/light preserve geometry and hierarchy;
- panel/card radii are moderate; pills are reserved for selected segments and high-salience CTAs;
- destructive actions are red/warm and usually isolated by spacing/divider/surface treatment.

## 4.2 Board card grammar

Directly supported:
- ordinal in a reserved leading slot at rest;
- title in primary row;
- integration/list badges at right;
- EST bottom-left;
- Taken bottom-right;
- hover can replace/reveal the leading completion affordance and right action rail;
- lane move arrows live in the direct hover rail on board;
- overflow contains Schedule / Change list / Duplicate / Delete;
- Notes and Subtasks expand inline.

## 4.3 Focus/Floating grammar

- Focus uses one narrow continuous surface;
- live task is emphasized by accent outline and prominent time;
- queue/scheduled/Done stay in the same vertical context;
- Focus hover has Make Live rather than board lane arrows;
- Floating Timer preserves task/time at rest;
- expanded Timer grows vertically for subtasks;
- selected action such as Notes can expand from icon to labeled pill.

## 4.4 Preferences grammar

- full Preferences is scrollable and sectioned;
- quick Focus preferences are a distinct reduced-scope surface;
- parent toggles disclose nested children in place;
- screen selection and panel side are first-class controls;
- alert families maintain separate timing/sound choices;
- success screen owns nested GIF/sound configuration.

## 4.5 Reports/Sessions grammar

- Overview and Sessions share one Reports shell;
- Overview uses four summary cards, a dominant chart, productive-time cards, then lower panels;
- Sessions uses three summary cards and chronological rows;
- row field editing is inline;
- Add Session uses a compact dialog + searchable task picker;
- **current Sessions export is CSV**, while older Help evidence showed PDF.

## 4.6 Archive grammar

- archive lives under Home;
- Archived Lists use card previews with Unarchive/Delete Forever;
- Archived Done uses searchable/filterable table/list rows;
- empty states preserve the full shell and communicate absence locally.

## 4.7 Evidence conflicts/evolution that later implementation must respect

1. **Sessions export format:** current direct = `Export .csv`; older Help = `Export PDF`. Current direct wins.
2. **Theme/preference styling:** historical light drawer is not the current styling target; current v2.6.69 direct screenshots win.
3. **Focus overflow exact destructive wording:** historical low-resolution image is ambiguous; do not use it to override higher-resolution evidence.
4. **Board action grammar vs Focus action grammar:** they are surface-specific and must not be treated as identical.
5. **Quick Preferences vs full Preferences:** these are separate surfaces with overlapping settings, not duplicate screenshots of the same UI.

## 5. What static images cannot establish

Still requires video evidence:
- hover reveal duration/easing;
- drag lift/reflow/drop settle timing;
- pointer-position insertion mechanics;
- modal/popover entrance/exit animation;
- Focus Panel↔Floating geometry timing;
- timer expiry and success-state transition sequencing;
- exact dismissal behavior;
- keyboard navigation/focus order;
- CTA gradient motion;
- board fade before Focus;
- whether controls appear by hover, focus, click or persistent state when the still image alone is ambiguous.

Those questions remain in the video Pass-3 queue.
