# UI / UX Specification

Last updated: 2026-08-20

This document defines the visible Windows desktop experience for Narro. It combines current supplied screenshots, current official Blitzit documentation, and explicitly labeled Narro improvements derived from user feedback and reliability research.

The target is not a generic task manager. Narro should preserve Blitzit's compact planning-to-focus character while improving interaction stability, readability, accessibility, resource use, and Windows reliability.

See `docs/RESEARCH_EVIDENCE.md` for screenshot-by-screenshot evidence and `docs/SOURCE_AUDIT.md` for the exhaustive Help Center/video/roadmap/review audit.

## Evidence labels

- **[CONFIRMED]** visible in supplied current screenshots and/or stated in current official documentation.
- **[CORROBORATED]** visible in older supplied captures or consistent public evidence.
- **[NARRO IMPROVEMENT]** intentionally improved local behavior; do not describe it as original Blitzit behavior.
- **[INFERENCE]** reasonable interpretation where exact original behavior is not observable.

Current supplied screenshots take precedence for current visual details. Official Help Center behavior is used for transitions unless a later official bug/fix signal conflicts; conflicts are resolved in `STATUS.md` and `docs/SOURCE_AUDIT.md`.

---

# 1. Window model

Narro normally uses two webview windows on Windows:

1. **Main window** — Home, lists, task management, archives, search, Preferences, shortcuts, reports.
2. **focusSurface** — one secondary native window that changes presentation between:
   - **Focus Panel** — tall/narrow focus workspace;
   - **Floating Timer** — compact always-on-top widget.

Focus Panel and Floating Timer are two views of one authoritative Rust-owned active session, not independent apps or timers.

## 1.1 Main window

[CONFIRMED]
- normal resizable desktop window;
- Home and Reports are primary destinations;
- dark/light themes preserve the same hierarchy;
- planning and management happen here.

[NARRO IMPROVEMENT]
- native-feeling Windows chrome; no browser-like navigation shell;
- main webview may be destroyed while unused during long focus-only periods if measurements show meaningful savings;
- restoring main derives state from Rust/SQLite, never hidden renderer memory.

## 1.2 Focus Panel

[CONFIRMED]
- narrow vertical panel;
- placed on selected monitor and left/right side;
- contains Today workflow, active task/timer, remaining tasks, scheduled tasks, done tasks;
- includes list selector, Preferences, Home, compact/floating switch;
- active live task receives strong visual emphasis.

Starting target: approximately 340 logical px wide at 100% scale. Screenshot pixel widths are proportional evidence, not hard CSS dimensions.

[NARRO IMPROVEMENT]
- monitor selection and placement update at runtime when Windows display topology changes; normal hotplug must not require restart;
- clamp/recover panel into a visible work area after monitor, resolution, DPI, sleep/wake changes.

## 1.3 Floating Timer

[CONFIRMED]
- movable;
- always on top;
- current task and timer remain visible;
- collapsed and expanded states;
- expanded state exposes focus actions and subtasks;
- can return to Focus Panel.

Starting collapsed target: roughly 340 × 110 logical px, content-driven rather than rigid.

[NARRO IMPROVEMENT]
- persist last safe user position across launches;
- validate restored coordinates against current Windows work areas;
- expanded content must remain usable near taskbar/screen edges by repositioning/anchoring safely;
- validate always-on-top over normal maximized and borderless full-screen apps; document exclusive-fullscreen limitations instead of promising impossible overlay behavior.

---

# 2. Visual language

## 2.1 Overall character

Screenshot evidence establishes:

- charcoal canvas rather than pure black;
- low-contrast raised cards;
- thin borders;
- rounded compact cards/panels;
- dense desktop spacing;
- near-white primary text;
- subdued gray metadata;
- cyan/teal → lime accent family;
- restrained coral/red for overdue/destructive states;
- colored list chips/icons;
- minimal decorative imagery except completion celebration.

The interface should feel quiet and focused. Accent communicates state/action rather than decorating every surface.

## 2.2 Calibration tokens

These are implementation starting points, not claims about Blitzit's source design tokens.

Dark calibration:
- canvas around `#111111`;
- raised surfaces around `#171717`;
- deeper focus/floating layers may approach `#0E0F0F`;
- input/interactive surfaces roughly `#202222`–`#252626`;
- subtle borders `rgba(255,255,255,.08)`;
- strong borders `rgba(255,255,255,.16)`;
- primary text around `#F4F5F5`;
- secondary around `#9A9E9C`.

Light calibration:
- canvas around `#E8E8E8`–`#F0F0F0`;
- cards around `#F5F4F4`–`#FFFFFF`;
- subtle dark borders ~8% opacity;
- primary text around `#181A19`.

Accent calibration:
- teal/cyan start near `#48D6C5`;
- lime end near `#B7D96D`;
- success in teal/green family;
- overdue/destructive in warm coral/red.

Final values should be tuned by screenshot visual comparison, not blindly copied from sampled pixels affected by capture/compression/antialiasing.

## 2.3 Typography

Windows-first stack:
`"Segoe UI Variable", "Segoe UI", system-ui, sans-serif`

Suggested hierarchy:
- page title: 22–26 px semibold/bold;
- section title: 15–18 px semibold;
- task title: 14–16 px medium/semibold;
- metadata: 11–13 px;
- live timer: 18–22 px semibold with tabular numerals.

Timer digits must use tabular figures so geometry does not jitter every second.

## 2.4 Spacing/radius

Use a 4 px spacing base: 4, 8, 12, 16, 20, 24, 32.

Starting radius scale:
- compact controls 6–8 px;
- task cards 8–10 px;
- list cards/panels 10–12 px;
- modals 12–14 px;
- floating content 12–16 px.

---

# 3. Motion system

Motion is functional feedback, not decoration.

## 3.1 Rules

- hover/focus must never reflow sibling content or move action targets;
- reserve/overlay action slots;
- prefer opacity/transform;
- avoid continuously animated blur/backdrop-filter;
- no perpetual gradient animation in Floating Timer;
- timer text updates discretely; do not animate each second;
- domain state completes independently of animation;
- respect `prefers-reduced-motion`;
- reduced-motion keeps state clarity but removes nonessential translation/scale.

## 3.2 Timing targets

- press: 70–90 ms;
- hover/focus: 110–140 ms;
- tooltip: 120–150 ms after 350–500 ms intent delay;
- menu/popover: 130–160 ms;
- inline expansion: 160–200 ms;
- modal: 180–220 ms;
- reorder/drop settle: 160–200 ms;
- completion: 200–260 ms;
- chart/filter: 250–400 ms, one-shot.

Suggested easing:
- enter `cubic-bezier(.2,.8,.2,1)`;
- exit `cubic-bezier(.4,0,1,1)`.

## 3.3 Micro-interactions

Buttons:
- hover increases contrast and may visually lift ~1 px;
- press scale ~0.98 briefly;
- disabled controls do not move.

Task cards:
- hover border/background change;
- actions fade into reserved positions;
- drag lift ~1.01–1.015 with fixed placeholder;
- completion: checkbox/check feedback first, then strike/fade, then card movement.

Menus/popovers:
- opacity + 3–4 px translate or `.98 → 1` scale;
- close faster than open;
- transform origin follows trigger.

Progress:
- one-shot transition ~220 ms;
- no shimmer.

Focus Panel ↔ Floating Timer:
- native geometry changes directly or in a short controlled native sequence;
- content may crossfade/scale 120–180 ms;
- never drive native resize with high-frequency JS loops.

Find Timer:
- [CONFIRMED] original provides attention animation;
- [NARRO IMPROVEMENT] two restrained outline pulses/glow <=900 ms.

Completion celebration:
- [CONFIRMED] success screen, optional GIF and sound;
- [NARRO IMPROVEMENT] brief/skippable, default visual motion <=1.2 s.

---

# 4. Main window — Home

## 4.1 Shell

[CONFIRMED current screenshots]
- large central content region;
- compact left navigation/cards;
- utility actions upper-right;
- bottom Home / Reports navigation;
- greeting/title area;
- `Your Lists` section;
- helper text for upcoming-task lists.

Narro removes account/trial/upgrade/profile/AI/integration controls. Search and Settings stay accessible.

## 4.2 Left navigation

- `+ Create new list`;
- divider;
- `All my lists`;
- `Archived lists`;
- active row uses filled/raised state.

## 4.3 List card

Rest:
- icon/chip;
- list name;
- overflow `…`;
- preview task rows;
- optional time metadata;
- footer pending count;
- footer aggregate EST.

Hover:
- prominent `Open` affordance;
- card geometry remains unchanged.

Overflow:
- Edit List;
- Duplicate;
- divider;
- Archive List.

[NARRO IMPROVEMENT]
- Open/actions overlay or occupy reserved geometry;
- keyboard focus mirrors hover.

## 4.4 Create List tile

- dashed rounded outline;
- centered plus;
- uppercase `CREATE LIST`;
- teal/lime accent treatment;
- hover increases contrast; no looping accent animation.

## 4.5 Create/Edit List modal

- centered modal over dimmed context;
- close X;
- `Create a new list`;
- large icon-upload target;
- formats `(jpg, png, svg)`;
- color swatches and selected ring/check;
- title input;
- outlined Cancel;
- accent Create.

Local icon assets are copied into app-owned storage and previewed before confirmation.

---

# 5. Main window — List board and tasks

## 5.1 Board structure

[CONFIRMED official behavior + supplied captures]

Columns:
1. Backlog
2. This Week
3. Today
4. Done

Each column can contain:
- title;
- aggregate EST where applicable;
- top `+` insert-at-highest-priority control;
- progress/count where applicable;
- task cards;
- bottom `+ ADD TASK`.

Today is the focus-launch lane. Scheduled/overdue groups can be visually separated.

## 5.2 Inline create

Visible older capture confirms:
- Cancel;
- Title;
- EST;
- Confirm;
- helper text.

Top create inserts at highest priority; bottom create appends.

## 5.3 Task-card states

Required states:

**Normal**
- title;
- optional order/priority affordance;
- list chip in All Lists context;
- EST;
- Time Taken.

**Hover/focus**
- completion checkbox;
- movement/actions;
- no geometry shift.

**Scheduled**
- date/time metadata;
- lower scheduled grouping where evidenced.

**Overdue**
- warning grouping/red age/date treatment.

**Done**
- completion marker;
- strike/secondary treatment;
- Time Taken remains visible where appropriate.

**Live**
- accent border/state;
- timer.

**Paused live**
- visible paused state;
- EST/Time Taken become editable.

**Time's Up / overtime**
- distinct from normal countdown;
- Extend, Done, Switch Task actions.

**Notes expanded**
- editor stays in task/focus context.

**Subtasks expanded**
- progress + rows.

**Destructive confirm**
- explicit confirmation for permanent task deletion.

## 5.4 Reorder UX and reliability

[NARRO IMPROVEMENT]
- drag uses fixed placeholder and stable identity;
- drop animation does not imply success until local transaction succeeds;
- failed persistence restores previous order with clear feedback;
- moving/reordering can never duplicate a task identity;
- keyboard-accessible non-drag movement is required.

This directly addresses public reports of reordered tasks moving unexpectedly or duplicating in source versions. citeturn580012search8turn580012search16

---

# 6. Search and archives

## 6.1 Search / command palette

[CONFIRMED screenshot + shortcuts]
- dimmed app backdrop;
- centered compact palette;
- search icon;
- `Search for tasks, lists`;
- `Ctrl+F` hint;
- Quick actions:
  - Add new task;
  - Add new list;
  - Go to Reports.

[NARRO IMPROVEMENT]
- keyboard-first selection;
- stable result heights;
- matched-text highlight;
- Enter execute, Esc close;
- no vertical jumping as results change.

Search is unavailable in Blitz Mode.

## 6.2 Archived Lists

- tabs/segments for Archived lists / Archived done tasks;
- restore list;
- permanent deletion only from archive;
- empty state.

## 6.3 Archived Done Tasks

- search field;
- All Lists/list filter;
- empty state;
- original automatically archives Done tasks older than 60 days.

Normal archival preserves history. Permanent delete removes the entity from user-facing reports according to current official delete semantics.

---

# 7. Notes and subtasks

## 7.1 Notes

[CONFIRMED]
- accessible from list and Focus Mode;
- inline expansion keeps task context visible;
- Bold;
- Italic;
- Strikethrough;
- bulleted list;
- numbered list;
- Undo;
- Redo;
- URLs clickable;
- microphone exists in original but is excluded initially.

### URL conflict resolution

The current Help Center says note URLs automatically open when a task goes live. Blitzit's public roadmap later lists that automatic behavior as a shipped/resolved bug. citeturn580012search7

[NARRO IMPROVEMENT]
- URLs open only after explicit pointer/keyboard activation;
- entering Focus Mode, switching task, pause/resume never launches them automatically;
- no remote preview/fetch;
- valid external URL opening uses OS default browser.

### Notes ergonomics

[NARRO IMPROVEMENT]
- retain compact inline Focus Notes;
- allow a larger/resizable editing presentation for substantial notes;
- preserve task context while expanding;
- use WebView/browser spellcheck where practical.

This directly addresses current public requests for a larger/adjustable Notes area and spellcheck usability. citeturn580012search14turn580012search8

## 7.2 Subtasks

[CONFIRMED]
- add;
- edit title;
- complete/uncomplete;
- reorder via arrows;
- delete;
- proportional progress;
- full management while task is live;
- changes immediately reflected across Main and focus views.

Expanded Floating state shows per-row checkbox, reorder arrows, delete and completed strikethrough.

---

# 8. Preferences

Preferences are a vertically scrollable modal/panel with clear section dividers.

## 8.1 Blitz Panel

- monitor preview/resolution;
- selected screen;
- Left/Right segmented placement.

[NARRO IMPROVEMENT]
- monitor list updates dynamically after display topology changes;
- unavailable saved monitor falls back predictably.

## 8.2 General

[CONFIRMED]
- Open on wake/login;
- Hide EST / Time Taken;
- hidden values remain available on hover;
- Auto-parse EST from title;
- System/Dark/Light theme;
- timezone.

[NARRO IMPROVEMENT]
- schedule calculations use selected/local timezone consistently;
- visible date/time formatting follows Windows locale/system 12/24-hour preference by default.

## 8.3 Blitz Mode settings

- Pomodoro toggle;
- configurable work sprint when enabled;
- Pomodoro break duration;
- default manual break duration;
- scrolling title on live timer.

Conditional settings expand/collapse without losing scroll position.

## 8.4 Alerts

Screenshots/docs establish:
- timed alerts during task;
- interval;
- sound selector;
- volume/preview;
- optional animated timer flash;
- notification alerts;
- notification sound;
- schedule reminders;
- reminder timing.

Sound previews must stop/replace previous preview rather than overlap indefinitely.

## 8.5 Completion celebration

- success screen toggle;
- nested Fun GIF toggle;
- success sound;
- sound preview.

Nested controls clearly disable/collapse with parent state.

---

# 9. Windows shortcuts UI

[CONFIRMED screenshot + official docs]

Modal structure:
- close X;
- `Global (works outside & inside Blitzit)`;
- keycaps;
- per-global enable toggles;
- `App (works only inside of Blitzit)`.

Global:
- `Ctrl+Shift+B` — bring Narro front;
- `Ctrl+Shift+T` — alternate Focus Panel / Floating Timer;
- `Ctrl+Shift+P` — find/animate Floating Timer.

In-app:
- `Ctrl+Alt+T` — create task;
- `Ctrl+Alt+B` — start break;
- `Ctrl+Alt+P` — pause/resume;
- `Ctrl+Alt+S` — skip live task;
- `Ctrl+Alt+F` — finish active task;
- `Ctrl+Alt+N` — active Notes;
- `Ctrl+F` — search outside Blitz Mode.

Unavailable global shortcut registration must be visible locally rather than silently failing.

---

# 10. Reports

## 10.1 Overview

[CONFIRMED screenshots + official docs]

Header/filters:
- Back + Reports;
- Overview / Sessions tabs;
- list filter;
- date range;
- Export PDF.

Summary cards:
- Total Work Days;
- Total Tasks Done;
- Total Time/Hours Worked;
- Avg. Time per Task.

Official definitions:
- Work Days = active days;
- Tasks Done includes average per active day;
- Hours Worked = task + break time, plus average active-day hours;
- Avg Time per Task includes partially completed tasks. citeturn580012search11

Productivity chart:
- Tasks/work time;
- Breaks;
- Total session time;
- hover/focus tooltip with date + series values.

Most productive:
- hour = highest focus time;
- day = weekday with highest focus-session count;
- month = most active time when range spans months.

Lower:
- Time By List;
- Done Tasks / completion insight;
- early/late legend.

## 10.2 Time By List / punctuality

Official behavior:
- work time aggregated by list;
- punctuality percentage is the proportion of tracked task time completed early vs late;
- Done rows show completion date, early/late if EST exists, and Time Taken;
- no EST => no early/late but Time Taken remains. citeturn580012search15

## 10.3 Date range picker

Screenshot establishes:
- preset column: Today, Yesterday, This week, Last 30/60/90 days;
- two adjacent calendars;
- previous/next month controls;
- start/end filled markers;
- continuous selected span;
- Cancel;
- Apply.

[NARRO IMPROVEMENT]
- keyboard date navigation;
- clear focus/start/end states;
- Windows locale date labels.

## 10.4 Sessions

Dashboard:
- Add Session;
- current screenshot `Export .csv`;
- Hide Break sessions;
- date range;
- list filter;
- Total Time;
- Total Tasks;
- Total Sessions.

Rows/detail:
- task;
- list;
- session number;
- date;
- start/end;
- duration;
- overflow.

Editing:
- date/start/end/duration;
- inline edit accent state;
- confirmation check;
- task-specific Sessions modal;
- Add Session;
- delete.

[NARRO IMPROVEMENT]
- validation failure restores previous value with inline error;
- preserve scroll position after edit;
- visible times follow Windows locale/system 12/24-hour preference.

Export conflict resolution remains:
- Overview → PDF;
- Sessions → CSV.

---

# 11. Focus Panel

## 11.1 Top bar

[CONFIRMED]
- list selector (`All` in current capture);
- `Today`;
- Preferences gear;
- Home;
- compact/floating control.

## 11.2 Day summary

- aggregate EST label;
- horizontal teal/lime progress;
- completion count such as `1/4 Done`.

Progress changes animate once, not continuously.

## 11.3 Active live card

- strong accent border;
- task title;
- live timer right;
- subtask progress;
- add subtask;
- expand/collapse.

[NARRO IMPROVEMENT]
- up to two title lines where compact layout permits;
- full title accessible by tooltip/detail;
- timer fixed-width/tabular;
- no perpetual accent pulse.

## 11.4 Remaining task rows

Can show:
- title;
- list chip in All Lists;
- overdue age/date;
- checkbox;
- Rocket/make-live;
- subtasks;
- Notes;
- overflow.

Public feedback reports “jumpy” Blitz buttons that users feel they chase with the cursor. citeturn580012search16

[NARRO IMPROVEMENT]
- action controls occupy fixed slots;
- revealing actions never pushes title/siblings;
- hit targets remain stationary;
- icon labels use tooltips instead of expanding text under pointer.

## 11.5 Add Task / Scheduled / Done groups

- `+ ADD TASK` between main queue and scheduled section;
- scheduled section count;
- scheduled title/time metadata;
- optional context text;
- Done section count;
- completed title strike;
- Time Taken at right.

Remote integration chips/actions are omitted while local schedule metadata remains.

## 11.6 Focus Notes

Uses the Notes behavior from Section 7:
- editor expands without leaving focus context;
- URLs explicit-open only;
- larger/resizable editor available when needed;
- microphone omitted initially.

## 11.7 Overflow

Corroborated older capture:
- Update Schedule;
- schedule summary;
- Change list;
- Duplicate;
- destructive action/confirmation;
- original Open in Calendar excluded.

---

# 12. Floating Timer

## 12.1 Collapsed

[CONFIRMED current screenshot]
- rounded dark panel;
- title left;
- live timer right;
- subtask progress ring;
- `n/m Subtasks`;
- add `+`;
- expand chevron;
- minimal footprint;
- movable/always-on-top.

## 12.2 Expanded

Action strip:
- Break;
- Notes;
- Pause/Resume;
- Skip;
- Done;
- return to Focus Panel.

Subtasks:
- progress ring;
- count;
- add;
- collapse;
- checkbox;
- completed strike;
- reorder up/down;
- delete.

[NARRO IMPROVEMENT]
- fixed icon hit boxes >=32 px; critical actions preferably >=36 px;
- tooltips;
- hover never changes widget width;
- destructive subtask action uses safe confirmation/undo according to final product rule.

## 12.3 Resource rules

- minimal focus-surface bundle;
- no report/chart code in collapsed path;
- no persistent decorative animation;
- no React polling as authoritative time;
- no per-second DB write;
- benchmark CPU/RAM before product UI and after final Floating implementation.

---

# 13. Timer/focus visual state matrix

**Idle**
- no active accent card;
- focus start only when eligible Today work exists.

**Running EST countdown**
- active accent state;
- remaining estimate;
- actual Time Taken accumulates in Rust.

**Time's Up**
- explicit state at zero;
- Extend;
- Done;
- Switch Task. citeturn580012search12

**Overtime after Extend**
- continued work session;
- extra time clearly distinguished from remaining estimate.

**Running count-up**
- starts at zero and increments.

**Pomodoro work**
- sprint countdown overrides EST display;
- actual work still tracked.

**Pomodoro break**
- starts automatically at sprint end;
- notification;
- break tracked separately;
- end prompts return to work.

**Manual break**
- current task pauses;
- break session tracked;
- documented shortcut workflow resumes task after break unless manually skipped.

**Paused**
- unmistakable pause state;
- EST/Time Taken editable.

**Completed**
- Done transition;
- optional success moment;
- exact next-task auto-start behavior remains intentionally unresolved until fidelity testing.

---

# 14. Accessibility and Windows behavior

- target WCAG 2.2 AA contrast where practical;
- visible focus ring not dependent on color alone;
- semantic names for icon-only controls;
- keyboard equivalent for meaningful hover actions;
- tooltip for ambiguous icons;
- hit targets preferably >=32 px;
- chart values have accessible textual equivalent;
- Esc closes modal/popover/editor where safe;
- Enter confirms focused primary action;
- test 100%, 125%, 150%, 200% Windows scaling;
- use logical/physical coordinate conversion correctly;
- display changes are runtime events;
- Windows locale/system 12/24-hour preference drives visible schedule/session formatting by default;
- reduced-motion remains fully functional.

---

# 15. Explicit Narro improvements over source UX

1. No hover-induced layout shift.
2. Long-title two-line treatment + full-title access.
3. Stationary focus action hit targets.
4. Accessible icon tooltips/focus states.
5. Tabular timer geometry.
6. Larger/resizable Notes plus compact inline access.
7. Explicit URL activation; no surprise auto-launch.
8. Runtime monitor hotplug recovery.
9. Persisted safe Floating Timer position.
10. Windows-locale date/time presentation.
11. Strong destructive-action clarity.
12. Reduced-motion support.
13. Performance-budgeted micro-animation.
14. No dead cloud/account/integration UI.
15. Visual success only after local persistence/domain transition succeeds.

---

# 16. Screenshot visual-regression checklist

Before parity UI is considered complete, implementation fixtures/screenshots must cover:

- Home dark;
- Home light;
- list card rest/hover/Open;
- list overflow menu;
- Create List tile;
- Create/Edit List modal;
- Search palette;
- four-column board;
- inline Add Task;
- normal task with EST + Time Taken;
- scheduled group;
- overdue group;
- task hover/actions;
- Notes-expanded task;
- subtasks-expanded task;
- destructive confirmation;
- Archived Lists empty;
- Archived Done Tasks + filter;
- Preferences upper/middle/lower;
- Windows Shortcuts modal;
- Reports Overview top;
- chart tooltip;
- Reports lower cards;
- list filter;
- date-range picker;
- Sessions dashboard;
- Sessions task-detail inline edit;
- Focus Panel normal;
- active card;
- focus hover actions;
- Focus Notes expanded;
- focus overflow menu;
- paused state;
- Time's Up/overtime state;
- break state;
- Floating Timer collapsed;
- Floating Timer expanded/subtasks;
- reduced-motion variants for representative animated interactions.

Fidelity review should compare hierarchy, spacing, typography, density, contrast, control size, state clarity, and interaction behavior — not only raw pixel similarity.