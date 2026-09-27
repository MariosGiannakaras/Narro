# Blitzit Help Center text + image evidence pass

Status: **COMPLETE for the current navigation relevant to Narro — 34/34 legacy-navigation pages inventoried/classified; 15/15 Narro-relevant product pages deep-reviewed for text and available official imagery**

Research date: 2026-09-27

This pass supplements, but does not replace, the user-supplied screenshot and video evidence.

The user's explicit request for this pass was to inspect not only Help Center prose but also the instructional images/screenshots embedded in the articles, because those images expose labels, control hierarchy, component states, visual treatment and interaction details that article text often omits.

## Evidence precedence

Use the repository-wide precedence from `docs/RESEARCH_EVIDENCE.md`:

1. latest explicit user requirement;
2. supplied current/direct recordings and screenshots;
3. current official Blitzit Help Center documentation, including its embedded screenshots;
4. older supplied/public captures;
5. public feedback/reviews;
6. inference.

A Help Center screenshot proves the visible state shown. Article prose proves the documented behavior/contract, but does not by itself prove exact animation timing or hidden persistence semantics.

## Version split discovered during this pass

The Help Center currently mixes two product generations.

### Public v2.x / v2.6.69 documentation

The legacy/current navigation still exposes the product surfaces corresponding to the supplied Narro reference corpus: Lists, Tasks, Blitz mode, timer modes, scheduling, notes, subtasks, reports, Preferences, shortcuts and archive flows.

### Blitzit 3.0 material

Newer discoverable pages explicitly say they target Blitzit 3.0 and warn that features may not exist in the current public version 2.6.69. Examples include:
- Blitzit 3.0 Migration;
- Linear integration;
- TickTick integration;
- Google Tasks integration;
- Microsoft To Do integration;
- Todoist integration;
- Trello integration;
- GitHub Issues integration;
- Microsoft Calendar integration.

These pages are **version-tagged contextual evidence only** for Narro. They do not override v2.6.69/direct supplied evidence and do not introduce account/cloud/integration UI into Narro.

## Current Help Center navigation inventory

The visible legacy navigation exposes **34 pages**.

### Getting started — 5
- Home
- Introduction to Blitzit
- Lists
- Tasks
- Blitz mode (focus sessions)

### Workflow — 8
- Timer modes
- Scheduling task reminders
- Task notes
- Subtasks
- Deleting and Archiving
- Key shortcuts for MacOS
- Key shortcuts for Windows
- AI agent (Blitzy)

### Reports — 3
- Productivity report
- Time spent report
- Sessions report

### Integrations — 12
- Google Calendar
- Notion
- ClickUp
- Asana
- Claude (Anthropic)
- ChatGPT (OpenAI)
- Raycast
- Zapier via Webhooks
- Upcoming integrations
- n8n via Webhooks
- Make via Webhooks
- IFTTT via Webhooks

### Settings — 4
- Preferences
- Account & billing
- Troubleshooting
- Activation code

### Community — 2
- Submitting ideas and bugs
- Affiliate program

Every page above was classified for Narro relevance. Account/billing, AI, integrations, Mac-only shortcuts, activation/commerce and community/affiliate surfaces remain excluded from Narro unless they incidentally establish a generic task-domain fact already in scope.

## 15 Narro-relevant pages — deep text/image review

### HC-01 Introduction to Blitzit

Source: https://www.blitzit.app/help-center/introduction-to-blitzit

Documented:
- plan → focus → momentum → finish workflow;
- simple list collapsing to a floating countdown;
- Pomodoro, Reports, scheduling and Notes complement the core loop.

Disposition:
- corroborates product framing only;
- no new Narro implementation delta.

### HC-02 Lists

Source: https://www.blitzit.app/help-center/lists

Documented:
- Create List tile and left-panel `+ Create new list`;
- list title + color or uploaded icon;
- Backlog / This Week / Today semantics;
- week starts Monday;
- scheduled tasks move between lanes by scheduled date;
- recurring parent lives in Backlog;
- individual-list vs All Lists view.

Official image evidence:
- full dark board preserves dense four-column planning composition when Done is visible;
- each lane has compact header/progress treatment;
- Today includes overdue scheduled grouping;
- primary `BLITZIT NOW` uses the pink→mint/green gradient;
- bottom shell actions remain visually secondary.

Relevant official image URL:
- `https://framerusercontent.com/images/DNfRInKrA20di6Wj6JO6AcBAlys.png`

Disposition:
- corroborates existing M5/UI spec; no new source gap.

### HC-03 Tasks

Source: https://www.blitzit.app/help-center/tasks

Documented:
- add at column bottom or top;
- title editable by click; live title only editable in Notes mode;
- drag between priority lanes and reorder within lane;
- hover movement controls;
- highest eligible Today task starts first;
- EST entered as HH:MM or parsed from terminal title text;
- documented parser examples include minutes/hours/mixed forms;
- EST is editable during live only while paused;
- Time Taken is actual tracked time and live-editable only while paused.

Official image evidence:
- inline task create keeps title, EST/list controls and confirmation in the lane context;
- focused input uses a bright teal/green outline;
- primary Confirm/Blitz CTA uses gradient fill;
- task metadata sits in compact lower-card positions;
- hover state exposes completion at left and icon actions at right without leaving the card.

Relevant official image URL found in Help Center:
- `https://framerusercontent.com/images/FSr99pZtFWhuLkzSQ6zEpbp9TLk.png`

Disposition:
- strengthens existing VE-F001 and hover/action layout evidence; no new parser formats beyond current product spec.

### HC-04 Blitz mode (focus sessions)

Source: https://www.blitzit.app/help-center/blitz-mode-%28focus-sessions%29

Documented:
- eligible Today task at top starts automatically;
- future-timed Today work is not eligible until due;
- Focus Panel can reorder/add/delete/schedule/open Notes/complete/start break;
- Rocket makes an ordinary row live;
- list dropdown filters the panel;
- quick Preferences and Home are in the top region;
- Floating Timer is movable/always-on-top and carries Break/Notes/Pause/Skip/Done.

Official image evidence:
- list switcher is a dark anchored popup under the compact list chip;
- `All Lists` is visually promoted above individual lists;
- selected/active task uses strong mint outline;
- day EST + progress + Done count precede the active card;
- ordinary rows remain dense and single-card;
- top icons stay compact and secondary.

Relevant official image URLs:
- `https://framerusercontent.com/images/j9hEBVlSNGRM0cSUFl7cebecg.png?height=750&width=1160`
- `https://framerusercontent.com/images/wv4znAMGFovLUBAdMpk7Nu4Klms.png`
- `https://framerusercontent.com/images/CwxlTCSfz9VGphjtXJadB9O4Zzw.png?height=1031&width=1160`

Disposition:
- corroborates M6/M7 structures;
- does not alter the measured ~0.27 s Panel→Floating video evidence or close physical Windows validation.

### HC-05 Timer modes

Source: https://www.blitzit.app/help-center/timer-modes

Documented state matrix:
- EST + Pomodoro off → estimate countdown;
- no EST + Pomodoro on → Pomodoro;
- EST + Pomodoro on → Pomodoro has display priority;
- no EST + Pomodoro off → count-up;
- estimate expiry → Time's Up with Extend / Done / Switch;
- Extend continues beyond estimate;
- actual Time Taken remains real work time;
- Pomodoro work end enters break and notifies;
- end of break prompts return to work.

Official image evidence:
- Pomodoro parent toggle reveals nested `Work Sprint` and `Break Time` selects;
- Default break length remains a sibling setting;
- Scrolling title is a separate toggle;
- active toggles use mint/green;
- nested controls are aligned under a vertical guide.

Relevant official image URL:
- `https://framerusercontent.com/images/GwACIize9RBH2kbOZqq6T5gpcI.png`

Disposition:
- corroborates existing M3/M8; does **not** resolve success-screen `Take a Break` post-click semantics because that is a distinct interaction context.

### HC-06 Scheduling task reminders

Source: https://www.blitzit.app/help-center/scheduling-task-reminders

Documented quick dates:
- Today;
- Later today = current time +2h;
- Tomorrow;
- Next week = +7 days.

Documented workflow:
- first step chooses date;
- second step optionally adds exact time;
- date-only tasks move to Today on due date;
- recurring presets include daily/weekday/same weekday/same monthly date/Custom;
- custom recurrence supports interval + day/week/month/year and weekday/monthly choices;
- recurring parent is held in Backlog;
- generated children behave as ordinary scheduled tasks;
- children for a due week are materialized on Monday;
- Update Schedule exposes Replace Existing Tasks;
- changing to No Repeat exposes Delete Existing Tasks;
- detached prior children remain independent.

Official image evidence:
- recurrence choices form a compact vertical list;
- selected rule uses a leading check;
- Cancel is secondary outline; Schedule is primary gradient;
- `Delete existing tasks(n)` appears as a full-width warm/dark-red checkbox row;
- destructive consequence is visually stronger than the neutral recurrence options.

Relevant official image URLs:
- `https://framerusercontent.com/images/JTtEepSacGObloMxzzoD1Uc.png`
- `https://framerusercontent.com/images/6xwkgciiAoKB6plxZxzqDcoxCY.png`

Disposition:
- strongly corroborates already validated M4 recurrence semantics and the video VE-017 visual state;
- do not weaken Narro's idempotent materialization/anti-duplication safeguards.

### HC-07 Task notes

Source: https://www.blitzit.app/help-center/task-notes

Documented:
- Notes available in list context and Blitz mode;
- Bold, Italic, Strikethrough, bulleted/numbered lists, Undo, Redo;
- URLs clickable;
- original product can auto-open note URLs when task becomes live;
- microphone/voice transcription exists in source.

Official image evidence:
- editor expands inline rather than navigating away;
- toolbar is compact and icon-led;
- multiline editor uses the same dark card context;
- `Close` is explicit.

Relevant official image URLs:
- `https://framerusercontent.com/images/OTCpZgcwVZDej3fcAFivAt25vDM.png`
- `https://framerusercontent.com/images/CRexOs0FutrUnEDN6pe96UWMFBM.png`

Disposition:
- Narro keeps explicit URL activation and omits microphone initially.

### HC-08 Subtasks

Source: https://www.blitzit.app/help-center/subtasks

Documented:
- add/edit/delete/reorder;
- Enter confirms new title;
- completion updates proportional progress;
- live Blitz context supports add/edit/reorder/delete/complete with immediate synchronization.

Official image evidence:
- progress uses compact circular indicator + `n/m Subtasks`;
- inline rows use checkbox/title with small management actions;
- completed rows use strike/secondary treatment.

Relevant official image URLs:
- `https://framerusercontent.com/images/z9VdxDhqqO2Fbc8eioZFAS4dgI.png`
- `https://framerusercontent.com/images/KYE1LcJjWOzKSZnSYNA6zNyGSs.png`

Disposition:
- supports existing Narro behavior; historical source first-subtask-live limitation remains intentionally excluded.

### HC-09 Deleting and Archiving

Source: https://www.blitzit.app/help-center/deleting-and-archiving-tasks-and-lists

**Material clarification versus video-only evidence:**
- current official documentation explicitly specifies task deletion as hover → expanded menu → Delete → **Confirm**;
- deleted tasks are permanent and excluded from Reports;
- lists are archive-first;
- archived lists can be Unarchived or `Delete forever`;
- deleting an archived list permanently deletes that list and all its tasks;
- Done tasks older than 60 days are automatically archived.

Official image resources:
- task delete: `https://framerusercontent.com/images/mSVblVyTyZqsOub4FURh5tJjblU.png`
- archive list: `https://framerusercontent.com/images/46SzIQBMKFc3TFDZDacn1yz5P18.png`
- archived list management: `https://framerusercontent.com/images/8SZZpe7MgU1TrR4jewCLcWtEEoI.png`
- archived done tasks: `https://framerusercontent.com/images/hhkOtEmQYAJfJzcMtsXEH5HKBY.png`

Disposition:
- explicit permanent-task-delete confirmation is now **OFFICIAL CURRENT**, not merely a Narro safety improvement;
- VE-006's recording simply failed to expose the confirmation state clearly;
- keep current Narro confirmation behavior and report-exclusion semantics.

### HC-10 Windows shortcuts

Source: https://www.blitzit.app/help-center/key-shortcuts-for-windows

Documented global shortcuts:
- Ctrl+Shift+B bring Blitzit front;
- Ctrl+Shift+T alternate Focus Panel/Floating Timer;
- Ctrl+Shift+P find/animate timer.

Documented app shortcuts:
- Ctrl+Alt+T create task;
- Ctrl+Alt+B start break;
- Ctrl+Alt+P pause/resume;
- Ctrl+Alt+S skip;
- Ctrl+Alt+F finish;
- Ctrl+Alt+N Notes;
- Ctrl+F Search outside Blitz mode.

Additional documented break behavior:
- starting a break pauses current work;
- normal break completion resumes/returns toward the current task workflow; user can manually skip/end the break.

Disposition:
- corroborates M8 shortcuts;
- this does not prove that the success-screen `Take a Break` button has identical post-click semantics, so that ambiguity remains open.

### HC-11 Productivity report

Source: https://www.blitzit.app/help-center/productivity-report

Documented:
- list/date filters affect the whole report;
- top metrics: work days, tasks done, hours worked, average time/task;
- tasks done and hours worked include active-day averages;
- average time/task includes partially completed tasks;
- daily graph series are Tasks, Breaks and Total session time;
- graph series can be toggled;
- Most Productive hour/day/month definitions.

Official image evidence:
- four compact metric cards precede the primary chart;
- chart is the dominant report surface;
- hover tooltip groups date + all series values;
- purple/mint/yellow series distinguish work/break/total;
- chart/menu/filter controls remain visually compact.

Relevant official image URL:
- `https://framerusercontent.com/images/Ti6EJrNtaYAUQ14cwKE7u4taHw.png`

Disposition:
- routes to M9; no early source implementation.

### HC-12 Time spent report

Source: https://www.blitzit.app/help-center/time-spent

Documented:
- Time By List aggregates tracked work by list;
- punctuality = proportion of tracked task time completed early vs late;
- Done rows show completion date and Time Taken;
- early/late classification appears only when EST exists.

Relevant official image URL:
- `https://framerusercontent.com/images/Sxgz1A0jWhEd2JIIjWh3TN4L8vo.png`

Disposition:
- preserves session-ledger-derived M9 design and early/late semantics.

### HC-13 Sessions report

Source: https://www.blitzit.app/help-center/sessions-report

Documented:
- totals: Total Time, Total Tasks, Total Sessions;
- filters: list, break visibility, date range;
- rows: task, list, session number, date, start/end, duration;
- edit through overflow menu or direct inline value activation;
- delete through overflow;
- Edit can expose all sessions for the task;
- Add Session requests task/date/start-end or duration;
- article text currently says `Export PDF`.

Official image resources:
- dashboard: `https://framerusercontent.com/images/udqL8eWSP0SHyF7SabuRSDxej0.png`
- filters: `https://framerusercontent.com/images/3x5RTLOxaD2ATQNZFwpSBLjXdok.png`
- edit/session detail: `https://framerusercontent.com/images/MVvFzAUBrWV0aqE8br8ajVQ4qk8.png`
- add session: `https://framerusercontent.com/images/LdYRyXQOGTi2ppTNik5sUNzjNEc.png`

**Evidence conflict retained:**
- Help Center prose: Sessions → Export PDF;
- supplied current v2.6.69 screenshot: Sessions → `Export .csv`.

Resolution:
- direct current screenshot remains stronger visual/current evidence;
- Narro keeps Overview → PDF and Sessions → CSV until stronger newer current-product evidence resolves the conflict.

### HC-14 Preferences

Source: https://www.blitzit.app/help-center/preferences

Documented:
- Open on wake/login;
- Hide EST / Time Taken while preserving hover disclosure;
- selected screen + left/right panel side;
- Pomodoro toggle with work/break durations;
- default break;
- scrolling title;
- timed alerts with interval, sound and optional animated timer flash;
- Notification Alerts with sound/volume used for user-facing events such as due/time-up/Pomodoro boundaries;
- completion celebration with success screen, optional fun GIF and success sound.

Official image evidence:
- tall dark Preferences drawer/panel with vertical section rhythm;
- parent controls reveal/enable subordinate rows under a vertical guide;
- active toggles are mint/green;
- selects are dark rounded rectangles with thin borders;
- alert groups use info icons and nested indentation;
- celebration group places `Fun gif on success screen` beneath `Show success screen`.

Relevant official image URLs:
- open Preferences: `https://framerusercontent.com/images/hqALKsRoRuh0QqLVKBSOE3OhAzk.png`
- general: `https://framerusercontent.com/images/nqcaGP6yHLJofjZXxtH1cHTG90Q.png`
- alerts: `https://framerusercontent.com/images/kRie6ehi9W4xdzBdZJW0qqP5I.png`
- celebration: `https://framerusercontent.com/images/LsKapZzTc459kbKdqU8E3Yo8Oqk.png`

Disposition:
- corroborates M8 nested hierarchy and notification settings;
- exact transition duration/easing remains Narro calibration because static Help images cannot establish motion.

### HC-15 Troubleshooting

Source: https://www.blitzit.app/help-center/troubleshooting

Current source limitations documented:
- Microsoft Store update can be triggered by Open;
- a just-created task can take time to appear because source data may still be processing server-side; suggested workaround is Home → return to list;
- second monitor added after app launch may not be detected; suggested workaround is restart.

Disposition for Narro:
- do **not** copy server-latency workaround because Narro is local-first/persistence-first;
- do **not** copy monitor restart limitation; Narro's validated runtime topology recovery is an intentional improvement;
- useful as source-risk evidence only.

## Screenshot-level visual conclusions added by Help Center

The Help Center images independently reinforce the following visible design grammar:

- dark charcoal surfaces with low-contrast raised cards;
- near-white primary text and muted gray metadata;
- mint/green for active/selected/success state;
- pink→mint/green gradient for high-salience primary actions;
- red/warm containers or labels for destructive consequences;
- compact rounded inputs/selects rather than large form controls;
- contextual inline editing rather than page navigation;
- anchored dark popovers for list/task choices;
- tall right-side Preferences surface;
- small info icons + nested vertical guides for conditional settings;
- dense desktop spacing and relatively small icon hit areas in the source.

Narro may improve accessibility/hit target size, keyboard focus, reduced motion and reliability while retaining the hierarchy and interaction grammar.

## Material Help Center deltas versus the completed video pass

| Finding | Video evidence | Help Center evidence | Narro disposition |
| --- | --- | --- | --- |
| Task permanent delete confirmation | VE-006 did not visibly expose separate confirm | Explicitly says Delete → Confirm | Treat confirm as source-confirmed and retain |
| Sessions export | direct supplied screenshot says CSV; video export functionality unresolved | article text says PDF | Current supplied screenshot wins: Sessions CSV |
| Panel→Floating exact timing | ~0.27 s measurable in video | static images only | keep video measurement |
| Hover/menu/modal timing | mostly cut/unmeasurable | static images only | Narro calibration, not source timing |
| Recurrence destructive row | directly visible in VE-017 | official image shows warm/red `Delete existing tasks(n)` | reinforced |
| Success hierarchy | directly visible in VE-003 | Preferences + product imagery corroborate success screen/GIF configuration | reinforced |
| Notes auto-open URL | visible/narrated in video | current Help article documents it | Narro explicit-activation deviation remains |
| Second-monitor hotplug | videos cannot prove reliability | Troubleshooting says source can require restart | strengthens Narro runtime-recovery improvement |

## Pages intentionally not promoted into Narro scope

The following were still inventoried/classified but do not become Narro product surfaces:
- MacOS shortcuts;
- Blitzy AI agent;
- all account/billing/activation/lifetime-plan flows;
- affiliate/community submission UI;
- cloud/integration setup and sync settings;
- all Blitzit 3.0 migration/account/cloud surfaces.

Integration pages may be consulted only when a generic task-domain state is useful corroboration; their external-service UI/chips/actions remain excluded.

## Completion criterion

This Help Center pass is complete when:
- all 34 pages in the visible legacy navigation are inventoried/classified;
- all 15 Narro-relevant product pages are reviewed for article text and available official visual evidence;
- 3.0 material is explicitly version-separated;
- contradictions with direct supplied evidence are recorded rather than silently resolved;
- new evidence is reconciled into the durable specs/tracking files.


## Local canonical Help Center image set — 2026-09-27

The Help Center image evidence is now materialized beside the supplied screenshots under `reference/original-blitzit-screenshots/`.

Retained official originals: **17**. They use descriptive `help-v2x-...` filenames and were kept only when they add a distinct state/context not already represented better by current direct v2.6.69 evidence.

Retained states:
- dark four-column board;
- Today-column task/progress detail;
- Focus Panel docked in desktop context;
- Focus list selector open;
- Focus quick Preferences open;
- Pomodoro nested settings;
- Schedule date picker;
- No Repeat + Delete existing tasks recurrence state;
- Floating Timer Notes-selected action strip;
- inline Notes editor;
- subtask add input;
- expanded subtask progress/actions;
- task overflow menu;
- populated Archived Lists;
- populated Archived Done Tasks;
- populated Sessions dashboard;
- Add Session task-picker state.

Nine Help Center images were intentionally not copied into the canonical folder because stronger current/direct references already cover the same state: list-card overflow, Productivity Overview, Time By List crop, Reports date picker, Sessions task detail, Home toolbar, and the three overlapping Preferences crops.

Exact filenames and dimensions: `reference/original-blitzit-screenshots/CANONICAL_INDEX.md`.
