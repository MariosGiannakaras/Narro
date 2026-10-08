# UI / UX Specification

## Fidelity default

For every in-scope user-visible surface with Blitzit evidence, **Blitzit is the visual/interaction target, not merely inspiration**. Match confirmed layout, density, hierarchy, spacing, typography character, component geometry, colors, states, menus/dialogs, interaction sequencing, transitions and motion character as closely as the evidence permits.

Do not introduce a discretionary Narro redesign during implementation or final polish. Existing `[NARRO IMPROVEMENT]` items remain valid only where they are already evidence-backed/documented as local-only, reliability, accessibility, Windows-platform, or source-artifact corrections. Where exact measurements or interactions are unavailable after the relevant evidence has been exhausted, calibrate from the strongest screenshots/videos and adjacent Blitzit patterns, then apply established professional desktop-design practice, Narro's existing visual system, Windows conventions and accessibility. Record the result as an inferred/calibrated Narro decision rather than pretending an exact source value was observed.

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

Focus Panel and Floating Timer are two views of one authoritative Rust-owned active session, not independent apps or timers. They also share one persistent `focusSurface` WebView: Panel/compact/expanded are dynamic React presentations inside that host. Normal presentation switching must not be implemented by closing/opening, hiding/showing, or resizing separate Focus WebViews.

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

These are implementation starting points, not claims about Blitzit's source design tokens. As `docs/BLITZIT_VISUAL_SYSTEM.md` is populated, it becomes the preferred reusable calibration layer for ordinary components. Do not create independent per-component colors/radii/spacing merely because an exact Blitzit token is unknown; inherit the nearest evidenced system pattern and use Windows/accessibility/professional UI standards only for the remaining gap.

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

The completed prior video-forensics pass in `docs/BLITZIT_UI_UX_VIDEO_FORENSICS.md` distinguishes observed source motion from Narro motion policy. Where a source is `SOURCE_COMPLETE` in the newer exhaustive Pass 3, `docs/BLITZIT_FORENSIC_PASS3_VIDEOS.md` supersedes the older pass for source-detail questions. For stable static appearance, use `docs/BLITZIT_VISUAL_CALIBRATION_TRACKER.md` once the relevant image is calibrated. Unless a line below is explicitly labeled source-measured, these rules are **[NARRO IMPROVEMENT / CALIBRATION]**, not claims about Blitzit's internal design tokens or exact durations.

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

[NARRO IMPROVEMENT / CALIBRATION TARGETS]

These values are Narro implementation targets. Supplied Blitzit tutorials contain edits/cuts around most hover, menu, modal, inline-expansion and chart interactions, so their exact source durations/easings are not established.

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
- **[SOURCE-MEASURED]** VE-003 shows one continuous visible geometry transformation of roughly **0.27 s** at 60 fps;
- the source sequence progressively changes window geometry rather than using only an opacity crossfade;
- the recording does **not** establish Blitzit's internal native-window count or component/rendering architecture;
- **[SOURCE-ARTIFACT]** the recording exposes clipped/sparse intermediate content; Narro should preserve continuity without deliberately reproducing that artifact;
- **[NARRO IMPROVEMENT]** content may use a restrained crossfade/scale as needed, but domain state must remain continuous;
- **[NARRO IMPLEMENTATION PLAN / UNVALIDATED]** use one fixed-maximum-size Focus WebView with React presentation switching and a DPI-aware clipped native visible region; see `docs/M7_SINGLE_FOCUS_SURFACE_PLAN.md`;
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
- A22/SS-C03/SS-C16 Home `Your Lists` header uses **two ends of one row**: left title, right contextual helper `Lists with your upcoming tasks`. Current Narro nests them vertically inside one flex item (B55). Reconcile with calibrated spacing/responsive rules; no extra unrelated shell chrome.

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
- SS-C03 current Home preview rows carry leading task ordinals, whereas `HomeDashboard` currently renders dots. Its right-side time field must be reconciled with canonical reference semantics rather than automatically treated as EST/Taken.

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
- SS-C04 signature create tile is an actual **dashed cyan→lime gradient perimeter**, separate from its inner gradient plus. Current Narro flat `--color-accent-solid` dashed border lacks this calibrated visual treatment (B54); preserve keyboard/full-tile hit target and static/focus geometry.

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
- **SS-C01 source detail:** first swatch is multicolor, followed by a broader source preset family than current Narro's six choices; the visible label is `Pick a list color`. Do not infer exact HEX values from screenshot colors alone;
- **Custom color evidence boundary:** user confirms Blitzit supports a custom list-color picker, and SS-C01 visibly contains the multicolor affordance, but the canonical screenshot and VE-005 do not directly establish the trigger's open-state structure, input method or commit/cancel behavior. Those remain `SOURCE_INTERACTION_EVIDENCE_LIMIT` until stronger evidence; do not mistake a guessed popup for verified Blitzit parity;
- title input with visible placeholder `Enter your list title`;
- outlined Cancel;
- accent Create.

Local icon assets are copied into app-owned storage and previewed before confirmation.

---

# 5. Main window — List board and tasks

## 5.1 Board structure
- SS-H01 Help board and VE-008/VE-017 provide structured lane anatomy beyond flat task lists: Backlog `Recurring tasks` parent subsection (B39), scheduled-task grouped sections/counts inside affected lanes (B40), and Done completed-day groups with per-day counts (B43). Current Narro `BoardLane` maps each lane flat. Preserve real task identities, recurrence grouping exclusions, scheduled child lifecycle, sorting and locale dates.
- SS-H01 confirms the **This Week and Today** lanes both have source progress/completion fraction treatment; Narro currently only renders it for Today (B44). The historic weekly-superset total definition is not automatically a current rule; verify current data semantics independently of the visual bar.
- VE-005 Board list scope opens a compact anchored All Lists/named-list menu that retains list badges. The current text-only native select meets scope switching but does not satisfy source menu composition.

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
- **VE-002 reactive source parser B66:** typed `Prepare slides 28 m` displays draft EST `00:28` before Confirm, `1 HR` shows `01:00`, combined `2 HR 15 m` shows `02:15`. Draft title keeps suffix until commit; only committed card strips it. Narro currently calls the valid `parseEstimateSuffix` function only inside `ListBoard::submitCreate` and has no precommit EST auto-fill. Reconcile live preview while respecting persisted auto-parse OFF, manual field edits, typing/caret preservation, and existing VE-F001 commit/Persistence validation; B53 HH:MM manual input is a different issue.
- VE-005 ~00:40–01:08 empty single-list pending lanes show centered `All Clear`, where Narro BoardLane currently displays `No tasks`/`No Tasks` (B61). Empty Today retains the anchored Blitz CTA but visually subdued, unlike the always-vivid current `BlitzEntryButton` (B62). These come from a historical tutorial, not proof of current v2.6.69 empty state or a disabled-click contract; confirm the modern source/version before broad wording/interaction changes.

Visible older capture confirms:
- Cancel;
- Title;
- EST;
- Confirm;
- helper text.

Top create inserts at highest priority; bottom create appends.

## 5.3 Task-card states
- SS-H12 Board expanded Subtasks progress uses a compact circular ring, not the current horizontal Board bar (B60). Keep completed/total and row actions unchanged.
- VE-005 Board inline task creation has upper `× CANCEL`, Title and `Est time` HH:MM-style controls, help copy `Add a new task`, gradient `Confirm` action (B52); current `InlineCreateEditor` has bottom Cancel/Add task, different labels and no helper.
- VE-005/VE-016 demonstrate compact `HH:MM` entries for task EST and manual Taken editing, e.g. `00:30` means 30 minutes in the paused source task (B53). Narro Board's `parseMetricDuration` currently requires H:MM:SS and rejects that source grammar. Supporting both should preserve exact seconds-domain persistence, unambiguous format display and validation; do not loosen input to arbitrary strings.
- SS-H13 Board task overflow isolates `Delete` after an actual non-focusable divider; the current shared task menu uses consecutive items with red text but no separator (B48).
- VE-005 01:25–01:50 Board `+ ADD TASK` supports a repeat-ready inline editor for successive confirmations (B46), with the created task appearing while the draft editor can remain open. Current `submitCreate` closes it every time. Same clip's `Video` then `Record voice` list ordering places the second at highest priority (B47); currently ordinary bottom-add appends, and a separate `ADD TO TOP` explicitly inserts first. Confirm exact source entry control/version before altering persisted insertAtTop semantics; do not conflate the two findings.
- VE-017 linked recurring parent overflow differs from scheduled-occurrence overflow: `Update Recurring`, `Remove Recurring`, Duplicate and destructive Delete. VE-008 older version also directly shows Remove Recurring but different exact surrounding menu inventory. Current `TaskOverflowMenu` exposes generic `Update Schedule` for all; the direct parent removal affordance is absent (B45). `Remove Recurring` must detach without deleting generated children; `No Repeat + Delete existing` is a separate destructive cleanup path.
- VE-008/VE-017 recurring-parent task badges display the actual recurrence cadence (`Weekdays`, `Custom`, `Daily`) rather than a generic `Repeats` string (B41). A scheduled occurrence's overflow includes a current-date row with contextual X/remove alongside `Update Schedule` (B42); current scheduler `Unscheduled` action provides the underlying function but not that source menu control. Validate safe shortcut removal with correct pending/error/focus semantics.

Required states:

**Normal**
- title;
- optional order/priority affordance;
- list chip in All Lists context;
- EST;
- Time Taken.

**Hover/focus**
- **[CONFIRMED current video]** completion checkbox appears at the left and a compact icon action cluster appears at the right while the task remains in the same card context;
- movement/actions include Notes/Subtasks/lane actions plus final overflow according to context;
- **[NARRO IMPROVEMENT]** reserve/overlay the action geometry so reveal never shifts sibling content or makes targets move.

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
- **[CONFIRMED current Help Center]** permanent task deletion uses an explicit Confirm step after Delete;
- deletion remains irreversible and deleted tasks are excluded from user-facing Reports.

## 5.4 Reorder UX and reliability

[NARRO IMPROVEMENT]
- drag uses fixed placeholder and stable identity;
- drop animation does not imply success until local transaction succeeds;
- failed persistence restores previous order with clear feedback;
- moving/reordering can never duplicate a task identity;
- keyboard-accessible non-drag movement is required.

This directly addresses public reports of reordered tasks moving unexpectedly or duplicating in source versions. citeturn580012search8turn580012search16

---

## 5.5 Scheduling and recurrence control parity
- VE-009/VE-017 selected-date derived recurrence preset labels must speak the actual chosen day (e.g., `Every Monday`, `Every month on 22nd`) instead of fixed internal phrases. Custom choices update a visible plain-language summary as the interval/unit/weekday controls change, including `every week on Friday, Saturday, Sunday`. The existing normal date/time `scheduleDescription` is not a recurrence summary. B20 nth-weekday monthly semantics must exist before presenting its example as selectable.

- SS-H07 / VE-007 scheduling source modal uses Step 1 (full selectable calendar + Today/Later Today/Tomorrow/Next Week + Cancel/Next) and Step 2 (Pick Date return, selected-date summary, inline Add Time +ADD/×REMOVE with hour/minute/AM-PM, recurrence preset/custom selection, Cancel/Schedule). Date/current markers coexist when they are different. The current single-view native date input does not reproduce the evidenced steps; functional scheduling correctness is separately validated.
- VE-009 custom monthly recurrence supports a calendar-date option **or ordinal weekday** such as `Monthly on the 2nd Sunday`; ordinal weekday is not a plain weekday-mask rule generating every Sunday. Extend the persistence/domain model only with explicit migration/back-compat and recurrence materialization safety tests.

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
- SS-H14/VE-006 populated archived-list view retains recognizable task previews in muted cards with `Unarchive` and destructive `Delete Forever`; current preview-less rows are an open visual/data-projection parity gap. Continue requiring explicit local confirmation for permanent delete.

- tabs/segments for Archived lists / Archived done tasks;
- restore list;
- permanent deletion only from archive;
- empty state.

## 6.3 Archived Done Tasks
- SS-H15/VE-006 populated view is a table with `Task Name`, `List`, `Info`, `Date`, `Action`, relative dates, document/`No Info`, and per-row trash. The source does not execute trash; preserve that evidence limit and safe local delete semantics.

- search field;
- All Lists/list filter;
- empty state;
- original automatically archives Done tasks older than 60 days.

Normal archival preserves history. Permanent delete removes the entity from user-facing reports according to current official delete semantics.

---

# 7. Notes and subtasks

## 7.1 Notes
- SS-C21/SS-H10 expanded inline Notes has a visible bottom-right `× Close` action in the editor. Narro's save-only editor footer is a source-control gap, although the outer Notes trigger can close the panel. No source proof of automatic save-on-close is claimed.

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
- SS-H11/VE-013 board inline subtask create shows section plus, `Enter subtask task title*` placeholder and contextual X/cancel; Enter commits and leaves input available for another addition. Do not change separately evidenced Focus/Floating flows without their own cause.

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
- **Current full-Preferences root parity (SS-C07–C09, VE-014 main cog):** opens as a tall bounded internally scrollable dialog/overlay over the previous Home/Board surface, which remains visible but dimmed; header includes `Preferences`, source subtitle, and upper-right close X. Do not replace the whole main workspace with an unrelated Settings destination: keep prior board/list selection/context intact and restore interaction on dismissal. Give dialog a single accessible focus owner (initial/return focus, Escape, Tab trap, nested popover safety), stable scroll and reduced-motion-aware opening. VE-014's earlier Focus-local Preferences screen is not the modern SS-H05 Quick Preferences target.

Preferences are a vertically scrollable tall right-side drawer/panel with a close control and clear section dividers. The 2026-09-27 Help Center image pass independently confirms compact dark selects, mint active toggles, nested vertical-guide indentation for Pomodoro/Alerts/Celebration children, and destructive warm/red recurrence consequence rows. Current VE-014 video directly confirms the drawer hierarchy, segmented controls, mint active toggles and in-place nested setting families; exact drawer/nested-control animation duration is not established because the tutorial contains edits.

## 8.1 Blitz Panel
- SS-C07/VE-014 selected-screen control in full Preferences is a monitor thumbnail with visible dimensions/label and accent outline, not just a plain HTML `<select>`. Reuse source-calibrated presentation while preserving persisted monitor identity, current-display enumeration and stale-monitor fallback.

- monitor preview/resolution;
- selected screen;
- Left/Right segmented placement.

[NARRO IMPROVEMENT]
- monitor list updates dynamically after display topology changes;
- unavailable saved monitor falls back predictably.

## 8.2 General
- SS-C07 includes small information glyphs before several full-Preferences labels; Narro's shared Row/control label composition currently omits them (B57). Their presence is visually supported, but exact per-row mapping and tooltip/interactive behavior are **not** in canonical static evidence. Do not invent additional help content or tooltips on this basis alone.
- SS-C07 Timezone is displayed as an offset-qualified zone selector (e.g. `(GMT+03:00) Europe/Athens`); the current freeform zone input does not establish visual parity. Source menu selection/search details are not observed; do not replace safe timezone validation with guessed behavior.

[CONFIRMED]
- Open on wake/login;
- Hide EST / Time Taken;
- hidden values remain available on hover;
- Auto-parse EST from title; current direct video shows a successfully parsed terminal estimate is removed from the saved visible title and stored as EST;
- System/Dark/Light theme;
- timezone.

[NARRO IMPROVEMENT]
- schedule calculations use selected/local timezone consistently;
- visible date/time formatting follows Windows locale/system 12/24-hour preference by default.

## 8.3 Blitz Mode settings
- Source SS-C08 section title is `Blitz mode settings`, not current Narro `Blitz Mode`. Source SS-C09 completion section is `Celebrate task completion`, not current Narro `Celebration` (B58). This is source copy/control hierarchy, not a missing setting or timer runtime gate.
- VE-014 Pomodoros OFF→ON physically reveals nested `Work Sprint`/`Break Time` within roughly the next 0.1 s; full Preferences should disclose/hide subordinate controls instead of leaving every child always visible but disabled. Persist child values and preserve keyboard/focus/scroll continuity.

- Pomodoro toggle;
- configurable work sprint when enabled;
- Pomodoro break duration;
- default manual break duration;
- scrolling title on live timer.

Conditional settings expand/collapse without losing scroll position.

## 8.4 Alerts
- VE-014 sound/volume is a **speaker-triggered short vertical anchored slider popover**, separate from adjacent preview play and dropdown; Narro's persistent horizontal slider is a control-composition gap, not an audio-persistence defect. Parent toggles reveal subordinate alert/notification/reminder rows.

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
- SS-C09/VE-014 include an independently enabled `Success sound effect` capability with chooser/preview/volume, distinct from `Show success screen` and `Fun gif`. Exact disabled-parent behavior remains uncertain.

- success screen toggle;
- nested Fun GIF toggle;
- success sound;
- sound preview.

Nested controls clearly disable/collapse with parent state.

---

# 9. Windows shortcuts UI
- SS-C17 current source has a dedicated closeable shortcuts dialog with two explicit groups: three **Global** chords with toggles, then seven non-toggle **App** chords (Ctrl+Alt+T/B/P/S/F/N; Ctrl+F). Narro currently embeds only the three Global rows in full Preferences. The app-only chord logic is already implemented in `inAppShortcuts.ts`; expose a source-consistent read-only command reference without inventing app-only enable toggles or disturbing existing keyboard handling.

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
- VE-011 and VE-012 selected-range chart date axis must show consecutive timezone-local calendar categories including days without sessions. Current Rust daily-series projection omits no-session days, even though work-day summary must still count only genuinely active days. Verify 8/30/60/90-day responsive chart geometry; fixed eight-column CSS is not evidence of correct 30/60/90-day presentation. Preserve empty-range, zero tooltip, legend, DST and PDF semantics.
- SS-C15/VE-015 report filter uses list-color badges in the All Lists trigger; a generic `N` glyph is not the source identity. Overview and Sessions should share a badge-calibrated, accessible trigger without altering current multi-selection data rules.
- SS-C12 chart options affordance is visible. Exact option-menu contents/actions are not source-recorded; production must not leave a focusable apparent button with no activation behavior. Existing series-legend controls are separate from chart options.

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
- VE-011 01:24–01:32 pointer hover shows a tall category background band and highlighted Total bar with tooltip. Current tooltip-only date hit area needs a corresponding selection/hover visual state; keyboard focus must remain equivalent.
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
- VE-011 populated Done Tasks rows retain colored list badges and Early/Late/No Est status pill shapes, with Taken duration to the right. Current raw list-title/status spans need source-oriented presentation; group dates and the existing internal scroll remain correct.

Official behavior:
- work time aggregated by list;
- punctuality percentage is the proportion of tracked task time completed early vs late;
- Done rows show completion date, early/late if EST exists, and Time Taken;
- no EST => no early/late but Time Taken remains. citeturn580012search15

## 10.3 Date range picker
- SS-C02 shows both single and double calendar chevrons. The source screenshot does not prove distinct click effects; keep double navigation unaccepted until clarified, rather than assuming a year jump.

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
- SS-H17 Add Session Recent Tasks rows have a right-side colored list badge; current Narro task picker uses plain list name with no list-color projection (B59). Preserve Finding30 picker overflow containment.
- **B56 source metric conflict, not a settled formula:** current SS-C14 has `0min Time / 2 Tasks / 0 Sessions`, and historical VE-015 has `39 Tasks / 22 Sessions`. Narro's Rust `Total Tasks` is currently distinct task IDs having work sessions in range, which **cannot** yield either visible relation. The source's exact population (all list tasks, completed tasks, dated tasks, filter scope) remains unproven; reconcile before implementing or claiming metric parity. The visual fixture hardcodes 2/0 but is not runtime evidence. Preserve independent Total Time and Total Sessions contract and archived/deletion invariants.
- VE-015 ~00:51–00:55 visually differentiates `Hide Break sessions` with a gamepad/break icon; Narro currently shows a generic circle `◉` instead (B51). Preserve current accessible pressed state and data filter; this is iconography parity, not a new filtering feature.
- SS-C22/VE-015 provides a task session-detail modal with inline end-time editor and an Add Session control but **does not directly establish Escape/Tab/focus-return behavior**. Narro must nevertheless provide one accessible active modal owner: its current task-detail dialog does not own initial focus, Escape, Tab trap or opener restoration, unlike its Add Session dialog. Opening Add Session from detail currently leaves **both** `aria-modal=true` overlays rendered. Correct the local keyboard/modal lifecycle without inventing Blitzit source keyboard behavior; validate nested invocation and pending edit safety separately.

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
- VE-016 00:38–00:41 and 02:11–02:16 shows Focus paused live EST and Time Taken entered as HH:MM (e.g. `00:30` = 30min). Current `FocusLiveMetrics.tsx` has the same H:MM:SS-only parser limitation as Board (shared tracked B53). Correct both parsing boundaries without relaxing paused-only authority and pending/stale safety.
- SS-C19 ordinary Focus overdue queue rows display warm/orange relative age (e.g., `2d ago`), not just a generic `Overdue` marker. The current `isOverdue` and selected local schedule remain domain authorities; format relative calendar age as distinct display metadata.

## 11.1 Top bar
- SS-H04 / VE-003 Focus list selector opens an anchored overlay listing All Lists with stacked badge/count and per-list colored badges. Current native `<select>` is a functionally valid but source-incomplete composition; do not sacrifice selection/timer safety while correcting it.

[CONFIRMED]
- list selector (`All` in current capture);
- `Today`;
- Preferences gear;
- Home;
- compact/floating control.

## 11.2 Day summary
- Historical VE-018 ~02:24–02:40 shows a 10min manual Break temporarily contributes +10min to Focus `Est:` (1hr54→2hr4), then returns to original value, while 0/7 task-completion fraction remains constant (B38). This has no demonstrated current-2.6.69 same-state corroboration; never persist a new task EST simply to mirror the historical visual total.

- aggregate EST label;
- horizontal teal/lime progress;
- completion count such as `1/4 Done`.

Progress changes animate once, not continuously.

## 11.3 Active live card
- VE-010 00:21–00:25 and VE-003 ordinary Focus live card has mutually exclusive resting title+countdown vs compact hover action-strip presentation: icon actions replace visible title/time within the card; targeting one action expands a rounded labeled pill (`Notes`, `Done`) without expanding the Focus width (B49). Narro currently stacks a permanent title/time above an always-visible six-label text toolbar, which is not source grammar. Preserve stable keyboard/focus targets and accessible names while reconstructing.
- VE-016 Time's Up makes `Extend` available as a contextual replacement/additional live-card action; ordinary running/paused state does not show a permanently disabled Extend button (B50). Narro currently includes Extend among six toolbar cells in every state. Keep authoritative extension control and M7 Finding35 visibility gate independent.
- VE-016 (~01:32–01:44) source Pomodoro work/Break has a small green `POMO` badge on the timer/card (B37). Source Focus `Break` replaces the active top task card with the task returning to the queue (VE-016/VE-018, B35). Narro currently retains task identity/title as live card during break. These are **historical directly witnessed source states**; current v2.6.69 exact Break-state presentation requires corroboration before accepting or rejecting parity. Do not change Rust timer authority for an inferred visual reconstruction.

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
- Historical VE-016/VE-018 show completed Break sessions in Focus Done history as Break rows (B36), but distinct from actual Done tasks for the task-completion fraction. Narro currently renders only `board.done.tasks`; any parity restoration must use real break-session projection and preserve break/work history semantics. Current 2.6.69 Break-completed snapshot is not available; classify as source-version-limited until confirmed.

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

Current supplied VE-005 video directly confirms the compact anchored task overflow menu order:
- Schedule / Update Schedule;
- Change List;
- Duplicate;
- Delete.

Delete uses destructive red treatment. VE-006 did not visibly expose a separate confirmation state, but the current official Help Center explicitly documents `Delete → Confirm`; explicit permanent-delete confirmation is therefore source-confirmed, not merely a Narro safety deviation.

Older captures additionally show schedule summary and original `Open in Calendar`; Narro excludes external-calendar integration. `Change List` and `Duplicate` are therefore current direct behavior evidence, not merely historical screenshot fidelity.

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
- VE-003 repeated Done/success and VE-005 ~02:45–03:20 establish an **inline success-card state**, retaining Focus header/progress and pending queue. Current `FocusCompletionSuccess` instead renders a full opaque Focus-height dialog overlay (B63). Source-visible success features also include a prominent animated reaction GIF/media area conditional on the success setting (B64; no source proof of exact rotation algorithm), and a human-readable completion timing verdict (`525 minutes early` for 8h45 EST and effectively 0 Taken; B65). Current JSX only shows fixed EST/Taken summary with no media/delta. Preserve explicit Next Task, separate source-unknown Take a Break transition, safe reduced-motion/local-only media, accessible Focus/modal ownership and correct authoritative arithmetic.
- Done transition;
- optional success moment;
- **[CONFIRMED current video]** with success screen enabled, the completed/struck-through task title remains in context, the celebration/media area dominates the active card, `Next Task` is the primary gradient CTA, `Take a Break` is secondary, EST/Taken metrics remain visible, and the remaining queue stays below;
- when the success screen is enabled, direct video evidence shows the success state appears before the next task starts and exposes explicit `Next Task` / `Take a Break` choices;
- `Next Task` starts the next task only after activation in the observed sequence;
- success-screen-disabled progression and the exact post-click `Take a Break` timer/session semantics remain intentionally unresolved.

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
