# Official Source, Video, and User Feedback Audit

Research date: 2026-08-15

This document is the exhaustive external-source audit for Narro. It complements `RESEARCH_EVIDENCE.md`, which is primarily the supplied-screenshot inventory and evidence-precedence record.

Use this file to avoid re-reading the Blitzit website, Help Center, public roadmap, and review sources during implementation.

## 1. How to use this audit

Evidence classes:

- **OFFICIAL CURRENT** — current Blitzit Help Center/site material; primary behavior evidence after supplied current screenshots.
- **OFFICIAL DIRECTION** — founder/team blog or official roadmap describing intended redesign/future direction; useful for UX rationale, not proof that a feature exists in the current supplied build.
- **PUBLIC PRODUCT FEEDBACK** — Blitzit's public Frill feature/bug board. Useful for confirmed UX friction and requested improvements, not for overriding current behavior.
- **PUBLIC REVIEW** — Product Hunt, G2, Trustpilot, or editorial hands-on feedback. Corroborative only.
- **NARRO DECISION** — local-only/Windows-only choice made for this project.

Do not convert planned Blitzit features into Narro parity requirements merely because they appear on a roadmap.

## 2. Complete current Help Center navigation

The current Help Center exposes these pages.

### Getting started

- Home
- Introduction to Blitzit
- Lists
- Tasks
- Blitz mode (focus sessions)

### Workflow

- Timer modes
- Scheduling task reminders
- Task notes
- Subtasks
- Deleting and Archiving
- Key shortcuts for MacOS
- Key shortcuts for Windows
- AI agent (Blitzy)

### Reports

- Productivity report
- Time spent report
- Sessions report

### Integrations

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

### Settings

- Preferences
- Account & billing
- Troubleshooting
- Activation code for a lifetime plan

### Community

- Submitting ideas and bugs
- Affiliate program

The integration/account/billing/affiliate surfaces are out of Narro's product scope, but they are still reviewed here when they reveal task fields, menu placement, synchronization semantics, or failure states relevant to the local domain model.

---

# 3. Help Center — page-by-page behavior audit

## 3.1 Help Center Home

Source: `https://www.blitzit.app/help-center/home`

**OFFICIAL CURRENT**

The Help Center Home links directly to:

- Changelog
- Roadmap progress
- Report a bug
- Submit a feature
- Discord
- Facebook Group

Implementation significance:

- none of these support/community surfaces belong in Narro's application UI;
- the public roadmap/feature board is a first-party-sanctioned feedback source, because Blitzit itself directs users there for bugs/features.

## 3.2 Introduction to Blitzit

Source: `https://www.blitzit.app/help-center/introduction-to-blitzit`

**OFFICIAL CURRENT**

Core product definition:

- personal productivity tool;
- simple to-do list;
- collapses into a floating countdown timer;
- current task remains visible;
- Pomodoro, reports, scheduling, and notes complement the core focus loop.

The documented workflow is:

1. Plan week/day.
2. Enter Focus Mode.
3. Gain momentum.
4. Win the day / relax.

Desktop requirements listed by Blitzit:

- Windows 10/11;
- macOS 12.3+;
- 8 GB RAM recommended by Blitzit for its own application.

Narro significance:

- the planning-to-execution loop is the central product invariant;
- features must not obscure the live-task/focus experience;
- the original app's memory recommendation is not a performance target for Narro. Narro explicitly benchmarks its lightweight floating-only state.

## 3.3 Lists

Source: `https://www.blitzit.app/help-center/lists`

**OFFICIAL CURRENT**

List creation:

- from Home `Create List` tile;
- from left-panel `+ Create new list`;
- title;
- color;
- optional uploaded icon.

Planning structure documented by the current article:

- Backlog — beyond one week;
- This Week — current week, starting Monday;
- Today — intended for today.

Scheduled tasks move automatically among Backlog / This Week / Today according to scheduled date.

Recurring tasks create a parent task in Backlog.

When the user has more than two lists:

- Individual List View shows one list;
- All Lists View aggregates all lists into the same planning structure;
- edits in either presentation represent the same underlying tasks.

Screenshot addition:

- current screenshots also show a Done column. Treat Done as a real current desktop presentation even though the Lists article describes the three planning columns only.

## 3.4 Tasks

Source: `https://www.blitzit.app/help-center/tasks`

**OFFICIAL CURRENT**

Creation:

- bottom `+ ADD TASK` appends to the relevant section;
- top `+` inserts at the top / highest priority.

Title:

- click title to edit;
- live-task title can only be edited in Notes mode.

Priority/order:

- move across planning columns by drag/drop;
- reorder inside a column;
- back/forward arrow controls appear on hover;
- Focus Mode executes Today from top to bottom.

EST:

- can be entered during create using HH:MM;
- can be entered via the lower-left numeric field;
- can be parsed from the end of the task title.

Documented parsing examples/formats include:

- `28min` / `28 min`;
- `1hr`, `1 hour`;
- `2hrs`, `2 hours`;
- combined examples such as `2hr 15min`.

Live task restriction:

- EST may be edited only while its live timer is paused.

Time Taken:

- automatically accumulates when working on a live task;
- can be edited manually using HH:MM;
- live-task Time Taken may be edited only while paused.

Done:

- list view checkbox moves task to Done;
- drag into Done;
- arrow navigation can move it across;
- active live task uses `Done` and can trigger gamified success feedback;
- non-live Focus rows can be completed by their checkbox.

Reliability implication:

- reorder/move operations must preserve task identity. Public feedback has historically reported duplication/corruption during reorder, so Narro must test reorder transactionality explicitly.

## 3.5 Blitz Mode / Focus Sessions

Source: `https://www.blitzit.app/help-center/blitz-mode-%28focus-sessions%29`

**OFFICIAL CURRENT**

Entry:

- Today ordering is priority ordering;
- tasks scheduled for a future time today are not yet eligible;
- if every Today task is future-timed, Blitz Mode does not start;
- clicking `Blitzit now` opens Focus Panel;
- top eligible Today task starts live automatically;
- remaining tasks appear below.

Focus Panel can:

- rearrange tasks;
- add tasks;
- delete tasks;
- show scheduled-today tasks;
- schedule tasks;
- add notes;
- show tasks completed during the current session;
- take breaks.

Changing the live task:

- Rocket action makes another task live;
- timer switches immediately.

Header/utility behavior:

- list dropdown changes list context;
- gear opens Quick Preferences, a subset of common settings;
- user can choose monitor and left/right screen side;
- Home exits Blitz Mode.

Floating Timer transition:

- switch via arrow in Focus Panel or Focus Mode control;
- movable anywhere;
- always on top;
- task + countdown stay visible.

Both Focus Panel and Floating Timer expose:

- Break;
- Notes;
- Pause/Resume;
- Skip;
- Done.

Floating Timer returns to Focus Panel via resize icon.

Narro improvement:

- current source Troubleshooting says a newly connected second monitor may require Blitzit restart. Narro must respond to Windows display topology changes without requiring restart.

## 3.6 Timer Modes

Source: `https://www.blitzit.app/help-center/timer-modes`

**OFFICIAL CURRENT**

Three modes:

1. EST countdown.
2. Pomodoro countdown.
3. Simple count-up Time Tracking.

Mode resolution:

| EST | Pomodoro | Mode |
|---|---|---|
| Yes | Off | EST countdown |
| No | On | Pomodoro |
| Yes | On | Pomodoro |
| No | Off | Count-up |

Actual real work time is tracked regardless of visible timer mode.

### EST countdown

- starts at task estimate;
- reaches `00:00`;
- visible state becomes `Time's Up`;
- user can Extend, Done, or Switch Task;
- Extend continues showing extra/overtime;
- completion can be classified early/late compared with EST.

This must be modeled as an explicit timer state, not a cosmetic text change.

### Pomodoro

Configurable:

- work interval;
- break interval;
- notification sounds.

At end of work interval:

- break starts automatically;
- notification is emitted.

At end of break:

- user is prompted to resume work.

Pomodoro overrides EST display while actual time still accumulates.

### Count-up

If no EST and Pomodoro is disabled:

- timer starts from zero and counts upward;
- can pause/stop;
- Time Taken reflects actual work;
- manual time entry remains available.

Public feedback implication:

- many users want automatic overtime without an interruption at EST. Blitzit's official roadmap also lists automatic overtime as a Focus Mode customization. For Narro initial parity, keep `Time's Up -> Extend/Done/Switch`; optional auto-overtime belongs in post-parity candidates rather than silently changing the core behavior.

## 3.7 Scheduling Task Reminders

Source: `https://www.blitzit.app/help-center/scheduling-task-reminders`

**OFFICIAL CURRENT**

Open task expanded menu -> Schedule.

Date shortcuts:

- Today;
- Later today = today, current time + 2 hours;
- Tomorrow;
- Next week = exactly +7 days;
- arbitrary date picker.

Second step:

- optional specific time via Add Time;
- without a time, task moves to Today on its due date.

Placement:

- scheduled tasks appear at bottom of relevant lane;
- tomorrow example: bottom of This Week today, then moves to Today tomorrow.

### Recurrence presets

Depending on selected date:

- Every day;
- Every weekday Mon-Fri;
- Weekly on selected weekday;
- Monthly on selected calendar date;
- Custom.

Custom recurrence:

- interval number;
- unit: days/weeks/months/years;
- weeks/months can select weekdays;
- UI gives natural-language summary such as `every 3 days` or `every 4 weeks on Monday and Friday`.

### Recurrence materialization

- recurring parent remains in Backlog;
- system creates child tasks on Monday of the week they are due;
- children behave as normal scheduled tasks.

### Editing recurrence

Replace Existing Tasks:

- resets recurring pattern;
- old generated pattern can be removed/replaced by new generated tasks.

Without Replace:

- existing children remain;
- new children are added.

Stop recurrence:

- set No Repeat;
- Delete Existing Tasks option removes recurring link according to documented flow.

Detaching:

- removing recurring schedule detaches parent from existing children;
- those child tasks become independent;
- re-adding recurrence later generates new children without overwriting old modified children;
- preserves older child renames, notes, EST changes, etc.

Narro requirements:

- deterministic/idempotent materialization;
- no duplicate child creation on repeated startup/resume;
- explicit tests at Monday/week boundaries, DST changes, timezone changes, and missed days while app was stopped.

## 3.8 Task Notes

Source: `https://www.blitzit.app/help-center/task-notes`

**OFFICIAL CURRENT**

Notes available from both List and Blitz Mode.

Formatting:

- bold;
- italics;
- strikethrough;
- bullets;
- numbered lists;
- undo;
- redo.

Original Blitzit also supports microphone transcription. Initial Narro does not implement remote voice transcription.

URLs:

- clickable;
- current Help Center text says URLs auto-open in default browser when a task goes live.

### Important source conflict: automatic URL opening

Blitzit's own public roadmap has a shipped/resolved bug titled approximately `When links are in the description, they are opened when pressing "blitzit now"`.

Therefore the Help Center description and later bug-resolution signal conflict.

**NARRO DECISION:**

- render URLs as clickable links;
- do not automatically launch every URL merely because a task becomes live;
- user explicitly opens links;
- no remote preview/fetch is required.

This is safer and matches the later UX feedback signal.

Public feedback also requests a larger/adjustable Notes surface and reports that the existing one is too small on large screens.

**NARRO IMPROVEMENT:** Notes editor should be comfortably resizable/expandable while preserving compact inline access in Focus Mode.

## 3.9 Subtasks

Source: `https://www.blitzit.app/help-center/subtasks`

**OFFICIAL CURRENT**

Purpose: break a larger task into actionable milestones.

Actions:

- add from Subtasks control;
- Enter saves;
- arrows reorder;
- title click edits;
- trash deletes;
- checkbox completes;
- progress dial = completed / total proportion.

During live Blitz Mode:

- view all subtasks;
- complete/delete;
- edit title;
- add;
- reorder;
- changes are reflected in main List view.

Integration-specific Notion restrictions are out of scope.

## 3.10 Deleting and Archiving

Source: `https://www.blitzit.app/help-center/deleting-and-archiving-tasks-and-lists`

**OFFICIAL CURRENT**

Delete task:

- hover;
- expanded menu;
- Delete;
- Confirm;
- permanent/unrecoverable;
- deleted task no longer appears in Reports.

This last rule is important: historical reporting does not retain permanently deleted tasks in original Blitzit's report presentation.

Archive list:

- list `...` menu;
- Archive List;
- removed from active workspace but reversible.

Archived Lists:

- Unarchive;
- Delete forever.

Delete forever:

- permanently removes list and all its tasks.

Archived Done Tasks:

- completed tasks older than 60 days are moved there automatically.

Narro must distinguish archive from permanent delete and require explicit confirmation for permanent deletion.

## 3.11 Windows Shortcuts

Source: `https://www.blitzit.app/help-center/key-shortcuts-for-windows`

**OFFICIAL CURRENT**

Shortcuts UI is accessed in original Blitzit from Avatar -> Shortcuts; Narro must expose it without requiring an account/avatar identity surface.

Global shortcuts, with individual enable toggles:

- Ctrl+Shift+B — bring app to front;
- Ctrl+Shift+T — alternate Focus Panel / Floating Timer during Blitz Mode;
- Ctrl+Shift+P — animate Floating Timer to locate it.

In-app:

- Ctrl+Alt+T — quick-create task into any list;
- Ctrl+Alt+B — pause current task and start break; after break task resumes, unless break is skipped manually;
- Ctrl+Alt+P — pause active task;
- Ctrl+Alt+S — skip live task; does not apply to break;
- Ctrl+Alt+F — finish active task;
- Ctrl+Alt+N — open active Notes;
- Ctrl+F — search; unavailable in Blitz Mode.

## 3.12 AI Agent / Blitzy

Source: `https://www.blitzit.app/help-center/ai-agent-%28blitzy%29`

**OUT OF NARRO SCOPE**, but useful as first-party evidence for the domain vocabulary.

Blitzy can prepare/create a task with:

- title;
- subtasks;
- notes;
- schedule;
- estimate;
- list placement.

It can modify existing data:

- rename task/list;
- edit subtasks;
- edit notes;
- adjust schedule;
- log Time Taken;
- move task to list;
- move task across Backlog/This Week/Today;
- complete tasks/subtasks.

Implication:

- Narro's domain model should keep these concepts cleanly separated even though it has no AI or remote API.

Future AI items in that article are not Narro requirements.

## 3.13 Productivity Report

Source: `https://www.blitzit.app/help-center/productivity-report`

**OFFICIAL CURRENT**

Filters:

- List / All Lists;
- date range.

Daily graph:

- task/focus hours;
- break hours;
- total session time;
- individual series can be understood/toggled from report UI evidence.

Metrics:

- Total Work Days = days active;
- Total Tasks Done + average per active day;
- Total Hours Worked = task + break time + average per active day;
- Avg. Time per Task includes partially completed tasks.

Most Productive:

- Hour = hour with most focus;
- Day = weekday with highest focus-session count;
- Month = month with most active time when selected range spans months.

Screenshot evidence adds current chart tooltip, filters, report cards, and Overview PDF export UI.

## 3.14 Time Spent Report

Source: `https://www.blitzit.app/help-center/time-spent`

**OFFICIAL CURRENT**

Time By List:

- total work time by list over selected range.

Completion Insights:

- punctuality graph is based on proportion of task time completed early versus late;
- example: 15h early + 5h late -> 75% / 25%.

Done Tasks:

- completion date;
- early/late indicator when task had EST;
- Time Taken;
- no EST => no early/late label, but Time Taken remains.

## 3.15 Sessions Report

Source: `https://www.blitzit.app/help-center/sessions-report`

**OFFICIAL CURRENT**

Purpose: detailed editable record of focus work, including manually added sessions.

Top metrics:

- Total Time = focused work;
- Total Tasks;
- Total Sessions.

Filters:

- Lists / All Lists;
- Hide/Show Break Sessions;
- Date Range.

Session rows:

- task;
- list;
- per-task session number;
- date;
- start/end;
- duration.

Editing:

- date;
- start;
- end;
- total duration;
- direct inline edit or menu;
- menu can expose all sessions associated with task;
- Delete.

Manual Add Session:

- select task;
- date;
- start/end or total duration;
- add.

### Export conflict

Help Center currently documents PDF export.

Supplied current desktop screenshot `Screenshot_13.png` visibly shows `Export .csv`.

Evidence precedence keeps the existing Narro decision:

- Overview -> PDF;
- Sessions -> CSV.

Do not add both merely to reconcile conflicting sources unless later user instruction changes this.

## 3.16 Google Calendar

Source: `https://www.blitzit.app/help-center/google-calendar-integration`

**OUT OF SCOPE**, but useful behavior evidence.

Reveals:

- integrations entry in upper app area;
- lists can be linked to external sources;
- imported scheduled events become tasks and are classified into Backlog/This Week/Today by scheduled date;
- imported title/date/time/notes/meeting URL map into task concepts;
- meeting links can be placed into Notes.

The current article again says meeting links automatically open when Blitz Mode starts, reinforcing that the auto-open behavior existed in some versions, but the Frill bug-resolution conflict still means Narro should prefer explicit opening.

## 3.17 Notion

Source: Help Center `Notion` integration page.

**OUT OF SCOPE**.

Relevant concepts:

- database/list mapping;
- task/property mapping;
- Notion checkboxes may map to Blitzit subtasks;
- externally sourced subtasks can have different ownership/deletion semantics.

Narro has no source-sync ownership model initially, so every local subtask is locally editable/deletable.

## 3.18 ClickUp

Source: `https://www.blitzit.app/help-center/clickup-integration`

**OUT OF SCOPE**.

Relevant domain evidence:

- status mapping into planning/done states;
- date mapping;
- task duplication creates independent copy;
- task can move between Blitzit lists;
- external subtasks can map either to Blitzit subtasks or separate tasks;
- article explicitly warns matching timezone settings matter for schedule consistency.

Narro implication:

- schedule/date logic should use Windows local timezone consistently;
- duplication must create a new identity, not an alias/reference to original.

## 3.19 Asana

Source: Help Center Asana integration page.

**OUT OF SCOPE**.

Relevant evidence:

- synced task retains schedule and list movement concepts;
- duplicate becomes independent unsynced copy;
- deleting on one side may unlink rather than erase local task in integration context.

No remote ownership/unlink state is needed in Narro.

## 3.20 Claude / ChatGPT / Raycast

Sources:

- `https://www.blitzit.app/help-center/claude`
- `https://www.blitzit.app/help-center/chatgpt`
- Help Center Raycast page

**OUT OF SCOPE**.

These integrations expose remote actions for:

- lists;
- tasks;
- subtasks;
- notes;
- schedules;
- EST;
- Time Taken;
- planning-column/list moves;
- completion.

This corroborates the core domain model but does not justify MCP/AI implementation in Narro.

## 3.21 Webhook guides: Zapier, n8n, Make, IFTTT

Sources: corresponding Help Center webhook pages.

**OUT OF SCOPE**.

The webhook documentation exposes useful task payload vocabulary, including fields such as:

- action;
- title;
- description;
- due_date;
- id;
- optional URL;
- optional estimate.

Each list can have integration-specific identifiers/configuration in original Blitzit.

Narro does not implement webhook URLs, secrets, remote errors, or connected-list dashboards.

## 3.22 Upcoming Integrations

Source: Help Center Upcoming integrations page.

**OUT OF SCOPE**.

Examples include external-tool capture/sync concepts. Do not create placeholder UI for them.

## 3.23 Preferences

Source: `https://www.blitzit.app/help-center/preferences`

**OFFICIAL CURRENT**

Open Preferences:

- cog from main app;
- cog from Focus Panel.

General:

- Open Blitzit on wake and login;
- Hide EST / Time Taken;
- hidden times remain visible on hover.

Panel positioning:

- monitor;
- left/right side.

Blitz Mode:

- Pomodoros;
- work sprint length;
- Pomodoro break length;
- default manual break length;
- scrolling title on live timer.

Alerts:

- periodic/timed task alerts;
- alert interval;
- alert sound;
- optional animated timer flash;
- notification sound and volume for due tasks, Time's Up, Pomodoro end.

Celebration:

- success screen;
- rotating Fun GIF;
- success sound.

Current supplied screenshots add:

- EST-title auto parsing toggle;
- System/Dark/Light theme;
- timezone selector;
- schedule-reminder timing;
- sound preview controls.

## 3.24 Account & Billing

**OUT OF SCOPE**.

Do not reproduce:

- account/profile identity;
- subscription state;
- billing portal;
- licensing/trial state;
- upgrade controls.

Any preferences/navigation area must work without an account avatar dependency.

## 3.25 Troubleshooting

Source: `https://www.blitzit.app/help-center/troubleshooting`

**OFFICIAL CURRENT**

The article documents:

- Microsoft Store update behavior;
- server-processing delays where newly created tasks may temporarily not appear;
- second monitor added after Blitzit launch may not be detected until restart.

Narro implications:

- server-delay issue disappears by architecture: task creation is local and committed transactionally before success is shown;
- do not reproduce monitor detection limitation: handle Windows display/monitor topology changes and revalidate saved window positions.

## 3.26 Activation Code / Lifetime Plan

**OUT OF SCOPE**.

No activation/license code exists in Narro.

## 3.27 Submitting Ideas and Bugs

Source: `https://www.blitzit.app/help-center/submitting-ideas-and-bugs`

**OFFICIAL CURRENT**

Blitzit explicitly directs users to its public feature/bug board and roadmap, where users can:

- submit ideas;
- upvote ideas;
- report bugs with repro/screenshots;
- browse status;
- comment.

Therefore the public Frill board is legitimate first-party-hosted user-feedback evidence, though not behavior documentation.

## 3.28 Affiliate Program

**OUT OF SCOPE**.

No product/domain implication for Narro.

---

# 4. Official product/design/engineering material

## 4.1 2025 redesign / Future of Blitzit

Source: `https://www.blitzit.app/blog/future-of-blitzit`

Published 2025-11-17 by Blitzit Team / founder narrative.

**OFFICIAL DIRECTION**

Founding product principle:

- Blitzit was intentionally not meant to become another project-management system;
- the founder wanted a tool that helps the user actually execute work;
- core interaction was an ever-present side panel plus one timer.

User-loved qualities reported by the team:

- satisfaction of task completion;
- constant side-panel focus;
- gamified joy.

Pain the team explicitly acknowledges from earlier versions:

- integrations limited/slow;
- reporting insufficiently accurate;
- no mobile;
- instant action bar clunky/fiddly;
- preferences/customization too shallow.

Redesign goals/results:

- cleaner focus UI;
- more tactile timer;
- smoother Blitz mode;
- clearer pause/overtime/Pomodoro states;
- instant actions should feel effortless/satisfying;
- rebuilt session tracking with edit/add ability;
- calmer dashboard;
- faster list switching;
- quick task creation;
- easier Today focus.

Narro significance:

- micro-interaction polish is part of the execution experience, not decorative scope;
- actions should be easy to hit and not shift under pointer;
- reporting/session accuracy is correctness-critical;
- do not broaden initial scope into collaboration/project management.

## 4.2 2026 engineering post

Source: `https://www.blitzit.app/blog/building-a-cross-platform-productivity-app`

Published 2026-02-21 by Omar Farook, founder.

**OFFICIAL DIRECTION / IMPLEMENTATION EVIDENCE**

Original Blitzit desktop currently uses Electron Windows/macOS, with separate mobile-native stacks.

Founder explains the cross-device architecture required API endpoints for:

- task ordering;
- schedules;
- estimates;
- time tracking;
- system-specific behavior.

He reports Windows as the highest-problem surface and says tracking issues are being architecturally addressed rather than patched.

Near-term requests mentioned include:

- Tags;
- better list navigation;
- due dates/deadlines;
- title wrapping preference;
- Windows tracking fixes.

Narro significance:

- Blitzit's Electron choice does not determine our Tauri choice;
- ordering, scheduling, and time tracking deserve strong invariants/tests;
- Windows-specific behavior is first-class;
- title wrapping demand corroborates our approved long-title treatment.

---

# 5. Official roadmap vs current Frill roadmap

Two official/public roadmap surfaces exist and are not always synchronized.

## 5.1 blitzit.app roadmap

Source: `https://www.blitzit.app/roadmap`

Contains product-direction concepts including:

- new UI / tactile focus timer;
- tags/labels;
- focus mode customization;
- automatic overtime preference;
- calendar week/month view;
- subtask time estimates;
- app theme customization;
- many integrations.

Treat dates/statuses cautiously: some entries refer to old target dates.

## 5.2 Frill roadmap

Source: `https://blitzit.frill.co/roadmap`

This is more useful for live user-feedback state.

At research time, notable In Development items include:

- Blitzit 3.0;
- Tasks sometimes lose tracked time;
- Calendar View;
- Tags;
- other cloud/integration items outside scope.

Notable Next items include:

- tasks appearing on wrong day / incorrect scheduling;
- larger/adjustable Notes screen;
- quick assignment to list while typing task title;
- convert bulleted/numbered list into multiple tasks;
- CSV task import;
- widget corner customization;
- search regression;
- screen-selection responsiveness issue.

Notable Shipped/Resolved items include:

- Light Mode;
- Notes link-save issues;
- duplicate/backlog refresh issues;
- long list archive bug;
- Focus/Blitz tower collapse bug;
- automatic link opening on Blitz start reported as a bug;
- list sorting on Home.

---

# 6. Official video inventory

The Help Center embeds short YouTube demonstrations. The web research environment can identify several actual video IDs/contexts, but YouTube video streams/transcripts are not reliably accessible through the available web cache.

**Rule:** do not invent spoken content. The accompanying Help Center article remains canonical behavior evidence unless the actual transcript/video is later available.

Confirmed embedded video IDs from the official Help Center source/navigation pass:

| Context | YouTube ID | Use |
|---|---|---|
| Introduction | `GWSFEDYYxiI` | high-level product/workflow demo |
| Lists | `gIGpWgeE6D4` | list creation/planning context |
| Timer modes | `FoPur53wBSY` | timer mode context |
| Scheduling | `-svimZDrVUk` | scheduled task flow |
| Recurring schedules | `dRuYw4jWlps` | recurrence flow |
| Custom recurrence | `JnWLP96Kv8M` | custom recurrence; embed references start around 15s |
| Edit/delete schedules | `JuMwx-9OgVc` | schedule update/removal context |
| Task Notes | `onfFmIdbmP4` | Notes workflow |
| Subtasks | `PpiM2eT_si4` | subtask workflow |
| Windows shortcuts | `mEOa7cB2B7s` | shortcut workflow |

Other Help Center pages visibly contain `Youtube Video` embeds, including Tasks, Reports, archive, and integrations. Their article text has been audited even where the underlying YouTube metadata/transcript could not be retrieved.

A third-party creator portfolio also mentions producing educational Blitzit videos around Notion sync, mobile overview, Blitzy AI, and Google Calendar. That is corroborative content-production evidence only; it is not used to infer missing desktop behavior.

---

# 7. Public user feedback — recurring themes

## 7.1 What users consistently value

Across official testimonials, Product Hunt, G2, Trustpilot, and editorial hands-on coverage:

### Simplicity / low cognitive overhead

Repeated praise:

- clean interface;
- distraction-free;
- quick day planning;
- does not turn organization into its own task;
- enough features without feeling like a large project-management suite.

Narro implication:

- protect density and clarity;
- avoid scope expansion that adds permanent UI chrome.

### Persistent focus / easy task starting

Repeated praise:

- live timer/focus mode helps start rather than endlessly plan;
- side panel keeps task present;
- smaller floating timer conserves screen space;
- current-task visibility reduces distraction.

Narro implication:

- Focus Panel + Floating Timer remain the signature experience;
- their activation must be low latency;
- compact surface resource usage matters because users keep it visible for long periods.

### Subtasks, Notes, Pomodoro, alerts

Users specifically value:

- subtasks;
- taking Notes without breaking focus;
- Pomodoro / reminders;
- audible/visual completion feedback.

### Reports / time awareness

Users value:

- actual time tracking;
- productive times;
- task completion patterns;
- early/late estimate feedback.

Accuracy is more important than visual complexity.

## 7.2 Reliability complaints to treat as anti-requirements

### Lost tracked time

Current Frill roadmap explicitly has `Tasks sometimes lose tracked time` in development.

Narro requirement:

- timer state transitions are transactional;
- periodic durable checkpoints where appropriate without per-second writes;
- crash/restart recovery tests;
- no hidden renderer-only accumulated time.

### Duplicate/corrupted tasks during reorder

Public editorial/review feedback has reported task duplication while rearranging.

Narro requirement:

- reorder changes position, never identity;
- DB transaction around ordering updates;
- uniqueness/invariant tests;
- repeated drag/drop must be idempotent at domain level.

### Wrong-day / timezone scheduling

Current roadmap explicitly tracks wrong-day/incorrect-scheduling problems; integration docs also warn about timezone mismatches.

Narro requirement:

- one explicit Windows local timezone model;
- date-only and date-time values distinguishable;
- DST/week-boundary tests;
- recurrence tests;
- UI formatting follows Windows locale.

### Monitor/screen handling

Help Center says second monitor added after launch may require restart; roadmap includes screen-selection responsiveness issue.

Narro requirement:

- listen for display topology changes;
- re-enumerate monitors;
- clamp windows into visible work areas;
- recover saved Focus/Floating placement when displays disconnect/reconnect;
- no restart requirement for normal hotplug.

### Notes ergonomics

Roadmap feedback asks for larger/adjustable Notes screen.

Narro improvement:

- Notes can expand/rescale appropriately;
- inline Focus Notes remain available;
- spellcheck should use WebView/browser capability where practical;
- no tiny fixed editor as the only Notes experience.

### Long task titles / hover actions

Founder engineering update and public feedback both identify title wrapping as desired; prior feedback also describes action controls becoming hard to target when hover changes geometry.

Narro improvement already locked:

- up to two lines in compact rows where practical;
- accessible full-title tooltip/detail;
- live-title scrolling remains optional;
- fixed action slots/no layout shift.

### Floating Timer over full-screen applications

Public feedback includes requests for the timer to remain visible over full-screen work.

Narro requirement:

- validate always-on-top behavior against normal maximized and borderless full-screen Windows applications;
- document OS/application cases where exclusive full-screen prevents overlay rather than promising impossible behavior.

### Floating position persistence

Users have asked for timer location to survive launches.

Narro already requires:

- persist last valid position;
- recover if monitor geometry changes;
- `Find focus timer` shortcut can visually locate it.

---

# 8. User-requested feature themes and scope decision

## 8.1 Include in initial parity/reliability work

These do not materially broaden the product and directly improve confirmed workflows:

- robust time tracking / crash recovery;
- robust scheduling/timezone/recurrence;
- robust reorder with no duplication;
- monitor hotplug recovery;
- stable hover controls;
- long-title treatment;
- larger/resizable Notes presentation;
- Windows-locale date/time formatting;
- persisted safe Floating Timer position;
- strong always-on-top testing;
- explicit clickable URLs rather than unexpected auto-launch.

## 8.2 Record as post-parity candidates, do not implement initially

These are popular/useful but broaden product scope or change parity behavior:

- Tags/labels;
- Calendar week/month view;
- quick list assignment while typing title;
- paste a bullet/numbered list as multiple tasks;
- CSV task import;
- optional automatic overtime without `Time's Up` interruption;
- subtask time estimates/tracking;
- richer theme/icon customization;
- partial-completion/day-by-day task accounting;
- bulk task operations.

Reason:

- founder's stated product principle is execution over project-management complexity;
- user repeatedly praises simplicity;
- parity and reliability must be stable before optional productivity expansion.

## 8.3 Remain excluded unless project scope changes

- cloud sync;
- external integrations;
- webhooks/API/MCP;
- AI agent;
- mobile/web app;
- collaboration/shared lists;
- account/billing/licensing;
- remote voice transcription.

---

# 9. Review-source synthesis

## Product Hunt

Public reviews generally praise:

- clean combination of tasks + focus;
- Pomodoro/focus sprints;
- floating panel;
- reminders;
- low-friction workflow.

Use only as corroboration.

## G2

Small review sample, but consistent themes:

- clean and intuitive;
- modern UI;
- simple task management;
- cohesive reminder/focus/task workflow;
- limited advanced project-planning/customization can be a weakness for users who want complex project management.

Narro implication:

- simplicity is intentional, not a missing feature to “fix” automatically.

## Trustpilot

Current review corpus at research time contains both strong praise and reliability criticism.

Positive recurring themes:

- clean/responsive/uncluttered;
- quick daily planning;
- built-in focus timer makes starting work easier;
- subtasks + time tracking useful;
- updates can add capability without clutter.

Negative recurring themes:

- historical bugs/outages;
- reliability can negate productivity gains;
- cloud/backend dependency created severe outage risk for some users.

Narro implication:

- local-only design directly removes remote outage/sync dependence;
- correctness must outrank feature count.

## Tom's Guide hands-on

Editorial testing praised:

- multiple lists + combined daily tasks;
- side Focus mode;
- timer/reminders;
- completion GIF;
- smaller timer window;
- reports / early-late insights.

The author also reported a serious task-duplication/reorder issue in the version tested.

Narro treats that as an explicit anti-regression target.

---

# 10. Quality principles derived from the full audit

These are Narro design/engineering decisions, not claims that Blitzit already behaves this way.

1. **Execution first.** Every permanent surface should support planning, doing, or reviewing work.
2. **Local confirmation is immediate.** When UI says a task was created/moved/completed, the local transaction has succeeded.
3. **Time is never disposable UI state.** Timer/session data belongs to the Rust domain runtime and SQLite history.
4. **Reordering never clones identity.** Position changes are transactional and invariant-tested.
5. **Date-only != date-time.** Avoid timezone conversion bugs by modeling them distinctly.
6. **Windows locale by default.** Respect system 12/24-hour and date-format conventions rather than hardcoding one display convention.
7. **Displays are dynamic.** Hotplug/reconnect is normal runtime behavior.
8. **Focus actions never move under the pointer.** Hover state may reveal controls but not reflow them.
9. **Compact does not mean unreadable.** Long titles and Notes get deliberate expansion/accessibility paths.
10. **No surprise URL launches.** Links are explicit user actions in Narro.
11. **Animation must explain state.** Short, finite, no persistent decorative work in Floating Timer.
12. **Add features only after parity is dependable.** Tags/calendar/bulk-entry/etc. remain candidates until core milestones pass.

---

# 11. Research limitations

- YouTube embeds were identified, but the available web environment did not expose reliable video streams/transcripts. No exact spoken content is claimed without transcript access.
- Public reviews are individual experiences and may refer to older/newer builds than the supplied screenshots.
- Roadmap status changes over time. Treat this file as the 2026-08-15 research snapshot unless a future task explicitly refreshes it.
- Blitzit Help Center and current screenshots can conflict. Use repository evidence precedence rather than forcing both behaviors into the product.