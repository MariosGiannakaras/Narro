# Architecture / Technical Specification

Decision date: 2026-08-15

This document defines the technical architecture for the Windows-only, local-only Narro implementation. Product behavior is defined by `docs/PRODUCT_SPEC.md`; visual behavior by `docs/UI_UX_SPEC.md`; source rationale and known source-product failures by `docs/SOURCE_AUDIT.md`.

## 1. Requirements driving the stack

Narro needs more than a task web UI:

- normal desktop main window;
- narrow independently positioned Focus Panel;
- compact movable always-on-top Floating Timer;
- monitor enumeration and runtime display-topology handling;
- global shortcuts while other apps are focused;
- tray/background lifecycle;
- local notifications/reminders;
- optional autostart;
- reliable local persistence;
- correct timers independent of renderer/window lifecycle;
- transactional reorder/scheduling/recurrence;
- report/session history;
- Windows 10/11 packaging;
- screenshot-level UI fidelity with cheap micro-animation.

## 2. Selected stack

### Tauri 2

Use Tauri 2 for desktop shell/native coordination.

Required capability families:
- WebviewWindow creation/manipulation;
- always-on-top;
- monitor discovery/positioning;
- global shortcuts;
- tray;
- autostart;
- notifications;
- Windows bundling.

### React + TypeScript

Use React/TypeScript for UI because the product has many reusable visual states and screenshot-driven HTML/CSS reproduction requirements.

Use Vite unless the current official Tauri template at implementation time gives a concrete reason to use another supported build setup.

### Rust

Rust is the authority for:
- SQLite and migrations;
- task/list/subtask/note/session commands;
- identity/order/scheduling invariants;
- active timer/focus runtime;
- recurrence materialization;
- reminder scheduling;
- window orchestration;
- global shortcuts;
- tray lifecycle;
- recovery state;
- display-topology response.

Do not put correctness-critical timer, schedule, or identity state solely in React.

### SQLite

One database per Windows user/app-data directory.

Reasons:
- transactional local writes;
- no server/network dependency;
- strong identity/invariant enforcement;
- report queries;
- durable session history;
- migrations.

## 3. Why not Electron / native Windows as primary

Electron is fully capable but bundles its own Chromium runtime. The Windows-only persistent Floating Timer use case makes trying the OS WebView2/Tauri route preferable first.

WinUI/WPF/Win32 could minimize native-window overhead, but reproducing the screenshot-heavy rich UI would cost more implementation time. A native overlay remains a measured fallback only if the final Tauri/WebView2 Floating Timer is materially too heavy.

## 4. Process/window model

Persistent webview budget:
- `main`;
- `focusSurface`.

Do not keep separate persistent Focus Panel and Floating Timer webviews.

### `main`

- normal resizable Windows window;
- Home/lists/archives/search/preferences/reports;
- not always-on-top;
- can be hidden while Rust/tray runtime continues;
- may be destroyed/recreated during long focus-only periods if Milestone 1 measurements show meaningful savings.

### `focusSurface`

Presentation enum:

```text
Hidden
FocusPanel
FloatingTimerCollapsed
FloatingTimerExpanded
```

The active focus session is independent of this enum.

`FocusPanel`:
- narrow/tall;
- selected monitor edge;
- current Today queue + active task + scheduled/done groups;
- Notes/subtasks on demand.

`FloatingTimer*`:
- compact;
- always-on-top;
- movable;
- minimal renderer bundle;
- no normal navigation.

### Focus ↔ Floating transformation

1. persist safe floating position when leaving floating mode;
2. resolve target monitor/work area;
3. update native geometry/always-on-top/taskbar attributes through Rust/Tauri;
4. update presentation state;
5. renderer applies a short content transition only.

Never simulate native-window resizing with a high-frequency JS animation loop.

## 5. Dynamic Windows display model

Treat displays as runtime state, not launch-time constants.

Rust/window coordination must:
- enumerate current monitors/work areas;
- react to monitor connect/disconnect;
- react to resolution/work-area/DPI changes where exposed;
- revalidate selected Focus monitor;
- clamp Focus/Floating positions to visible work areas;
- recover a saved Floating position if its monitor disappears;
- preserve user placement when geometry is still valid.

Normal display hotplug must not require restarting Narro.

Persist a logical placement descriptor where possible, not only raw absolute coordinates. At minimum store last position plus enough monitor/work-area information to validate it safely.

## 6. Frontend ↔ Rust command/event boundary

Frontend → Rust commands include:
- list/task/subtask CRUD;
- task duplicate;
- reorder/move;
- Notes update;
- schedule/recurrence update;
- start focus;
- switch active task;
- pause/resume;
- start/skip break;
- skip task;
- complete task;
- Time's Up Extend/Done/Switch;
- edit/add/delete session;
- Preferences/native settings;
- window presentation commands;
- explicit open-external-URL action.

Rust → frontend events include:
- domain data changed;
- focus/timer snapshot changed;
- session phase changed;
- schedule/reminder event;
- notification/alert event;
- shortcut registration status;
- display topology/placement changed;
- theme/preferences changed in another view;
- persistence/domain command error.

Use typed DTOs. Do not expose arbitrary SQL or generic privileged shell calls to renderer code.

## 7. Identity and ordering invariants

Public source-product feedback includes drag/drop order failures and duplicate/triplicate tasks. Narro must make these impossible at the domain layer.

Rules:
- every list/task/subtask/session has an immutable unique ID;
- reorder changes ordering metadata only;
- move changes lane/list/order metadata only;
- Duplicate creates exactly one new independent ID;
- no UI optimistic operation may manufacture an ID without authoritative confirmation;
- failed reorder/move transaction restores previous UI projection;
- task count before/after reorder/move is invariant;
- use transactions for multi-row order updates;
- add uniqueness constraints where possible.

Use fractional/rank ordering or compact integer reindexing based on measured implementation simplicity, but hide ordering mechanics behind a Rust service.

## 8. Timer/focus runtime

The timer is the highest-risk subsystem because public Blitzit feedback includes completed tasks losing tracked time.

Recommended conceptual state:

```text
FocusRuntime {
  active_task_id: Option<TaskId>,
  mode: EstCountdown | CountUp | Pomodoro,
  phase: Idle | WorkRunning | WorkPaused | TimeUp | Overtime | BreakRunning | BreakPaused,
  phase_started_wall,
  phase_started_mono,        // in-memory only
  accumulated_work_ms,
  accumulated_break_ms,
  est_seconds,
  pomodoro_work_seconds,
  pomodoro_break_seconds,
  active_session_id
}
```

Exact Rust types may differ; invariants may not.

### Time calculation

While process is alive:
- elapsed uses monotonic time;
- UI derives current displayed value from authoritative snapshot;
- wall-clock changes cannot corrupt a live duration.

Persist:
- wall-clock session boundaries for reports;
- accumulated duration/checkpoints;
- recovery phase snapshot.

Never persist monotonic `Instant`.

### Pausing

On pause:
1. calculate current monotonic segment;
2. accumulate work/break;
3. persist/checkpoint transition;
4. enter paused phase;
5. emit coherent snapshot.

### Switching task

1. close/checkpoint current work segment;
2. preserve accumulated Time Taken;
3. select target task;
4. derive timer mode;
5. start new work segment;
6. emit one coherent domain update.

### EST expiry

At zero:
- transition into `TimeUp`;
- expose Extend / Done / Switch;
- Extend transitions into `Overtime` without losing current work duration;
- actual work continues accumulating in overtime.

Optional future automatic-overtime preference is not initial parity behavior.

### Pomodoro

- work interval countdown;
- at work interval end, persist work transition and automatically start break;
- emit notification;
- break is a separate session/phase;
- at break end, prompt/transition back toward work according to product spec;
- actual work duration remains independent of visible EST.

### Process interruption

Local policy:
- persist recovery state on meaningful transitions and safe checkpoints;
- next launch detects unfinished runtime;
- restore active task paused;
- do not count app downtime as work.

### Renderer ticking

Renderer may visually tick once per second/interpolate from authoritative timestamps, but it never mutates authoritative duration.

Resynchronize after:
- visibility change;
- Focus↔Floating transformation;
- main recreation;
- sleep/wake;
- task switch;
- pause/resume.

## 9. Focus eligibility

Conceptual function:

```text
is_focus_eligible(task, now_local):
  task not completed
  task effective lane == Today
  and (
    no specific scheduled time
    or scheduled local date-time <= now_local
  )
```

Date-only Today tasks are eligible for the day without an artificial midnight/UTC shift.

Blitz start selects the first eligible Today task by authoritative current ordering.

Typed no-start reasons should distinguish:
- no Today tasks;
- only future-timed Today tasks.

## 10. Scheduling data model — date-only is not date-time

Do **not** represent every schedule as one blindly converted UTC `scheduled_at` timestamp.

The official product distinguishes:
- schedule for a calendar date with no specific time;
- schedule for a specific local date + time.

Recommended conceptual fields:

```text
schedule_kind: None | DateOnly | LocalDateTime
scheduled_local_date: Option<DATE>
scheduled_local_time: Option<TIME>
schedule_timezone: Option<IANA/TZ identifier>
```

A derived UTC instant may be stored/cached for `LocalDateTime` if useful, but local semantic fields remain authoritative for recurrence/display/day classification.

Rules:
- date-only schedule never shifts calendar day because UTC offset changes;
- specific-time schedule resolves in configured Windows/local timezone;
- visible formatting follows Windows locale/system 12/24-hour convention;
- timezone changes trigger re-derivation, not destructive data rewriting.

This architecture explicitly prevents the wrong-day/timezone failure pattern present in source feedback.

## 11. SQLite schema direction

Use migrations from schema v1 and foreign keys.

### `lists`
- `id` immutable PK
- title
- color
- icon_asset
- sort_order/rank
- archived_at
- created_at
- updated_at

### `tasks`
- `id` immutable PK
- list_id FK
- title
- manual_lane
- sort_order/rank
- est_seconds
- manual_time_adjustment_seconds if needed
- schedule_kind
- scheduled_local_date
- scheduled_local_time nullable
- schedule_timezone nullable
- recurrence_rule_id nullable
- recurrence_parent_task_id nullable
- completion timestamp
- archived_at
- created_at
- updated_at

Do not store a mutable `time_taken_seconds` as the sole truth. Prefer session-derived work duration plus explicit normalized manual adjustment/edit semantics so report/session totals cannot silently diverge.

### `subtasks`
- immutable id
- task_id
- title
- sort_order/rank
- completed_at
- timestamps

### `task_notes`
- task_id
- editor_format_version
- content
- updated_at

Store sanitized structured editor content or sanitized HTML. Never store executable script.

### `recurrence_rules`
- immutable id
- parent_task_id
- frequency
- interval
- weekday mask/structured rule
- month-day behavior
- timezone/local rule semantics
- active
- last materialized period/checkpoint

### `recurrence_occurrences`
Recommended explicit idempotency table or equivalent unique key:
- recurrence_rule_id
- occurrence_local_date
- occurrence_local_time nullable
- child_task_id
- unique constraint on occurrence identity.

This is preferable to relying only on “last materialized” state because repeated startup/resume must not generate duplicates.

### `sessions`
- immutable id
- task_id nullable for break if chosen
- kind work/break
- started_at
- ended_at
- duration_seconds
- source focus/manual/edit
- timestamps

### `settings`
Versioned typed settings or structured key/value with strict decoding.

### `runtime_recovery`
Single authoritative current focus snapshot sufficient for paused recovery.

Indexes should cover:
- tasks list/lane/schedule/completion/archive;
- sessions task/start;
- recurrence active/occurrence;
- report date queries.

## 12. Lane derivation

Separate:
- manual planning lane;
- effective displayed lane.

Unscheduled:
- effective lane = manual lane.

Scheduled unfinished:
- effective lane derives from local schedule semantics + Monday-based week.

This prevents date-boundary logic from destructively rewriting manual organization.

Exact mixed ordering of manual vs scheduled tasks in Today outside Focus Panel remains a fidelity question; do not hardcode a screenshot accident into schema.

## 13. Recurrence engine

No server exists.

Run materialization on:
- startup;
- resume/wake;
- local date boundary;
- recurrence edit.

Official behavior:
- recurring parent remains Backlog;
- children are created on Monday of the week they are due;
- custom daily/weekly/monthly/yearly semantics;
- Replace Existing Tasks;
- detachment preserves existing independent children.

Use a unique occurrence key such as:

```text
rule_id + occurrence_local_date + optional_local_time
```

Repeated materialization must be idempotent.

Do not rewrite detached/modified historical children unless the explicit replace behavior requires it.

Tests must include:
- DST;
- Monday boundaries;
- timezone changes;
- app closed for several days;
- repeated startup;
- edit with/without Replace Existing;
- detach/re-add.

## 14. Notes/editor and external URLs

Need WYSIWYG behavior for:
- bold;
- italic;
- strike;
- bullet;
- numbered;
- undo/redo;
- links.

Choose a maintained React-compatible editor only after checking focus-surface bundle cost.

Architecture rules:
- lazy-load editor;
- sanitized content only;
- voice transcription omitted initially;
- use WebView/browser spellcheck where practical;
- compact inline Notes + larger/resizable editor presentation.

### URL conflict resolution

The current Help Center describes automatic link opening on live task, but the public roadmap later identifies that behavior as a resolved bug.

Narro:
- links are rendered normally;
- explicit renderer action sends a narrowly scoped `open_external_url` command;
- validate `http`/`https` schemes;
- Rust/Tauri opens OS default browser;
- Focus entry/task switch never triggers link opening;
- no remote preview fetch.

## 15. Background lifecycle / reminders

To support reminders/global shortcuts/focus:
- Tauri process may stay alive after main closes;
- tray provides Show Narro, focus presentation when active, and Quit;
- autostart is user-controlled.

Explicit Quit:
- persist runtime snapshot;
- unregister shortcuts;
- close DB/flush as appropriate.

Reminders:
- local OS notifications;
- compute next due reminder efficiently;
- re-evaluate on task/settings/timezone/sleep-wake changes;
- if Tauri cannot schedule durable notifications while process is fully terminated, do not claim that behavior; rely on running background process.

Sounds are bundled/local.

## 16. Frontend state architecture

Persistent/domain data comes from Rust services.

Transient UI state may live per view.

Do not keep independent mutable copies of the same task in `main` and `focusSurface`.

Use a small typed store/query cache if useful, but avoid state-library complexity before needed.

Focus surface code-splitting:
- base collapsed timer path stays minimal;
- Notes editor lazy-loads only when opened;
- Reports/charts never load into focus bundle.

## 17. Reports

Compute locally from SQLite/session view models.

Overview definitions follow current official docs:
- active work days;
- completed tasks + averages;
- work + break duration;
- average time per task including partial tasks;
- productive hour/day/month;
- time by list;
- early/late punctuality.

Sessions:
- filtered raw work/break sessions;
- editable date/start/end/duration;
- manual Add Session;
- transactional edits immediately update aggregates.

Delete semantics:
- normal archive preserves historical reporting;
- permanently deleted task is removed from user-facing reports, matching current official Blitzit behavior.

Export:
- Overview → PDF;
- Sessions → CSV.

No remote reporting service.

## 18. Performance / motion architecture

- route/code-split heavy main features;
- minimal `focusSurface` startup bundle;
- tabular timer numerals;
- fixed action slots;
- reduced-motion support;
- one-shot transform/opacity transitions;
- no infinite decorative gradients/blur;
- chart animation only on load/filter change;
- profile render churn before adding memoization by habit.

Animation never owns state. Rust completes persistence/domain transition first; UI visual response projects confirmed state.

Benchmark:
- baseline process;
- main only;
- Focus Panel;
- Floating collapsed;
- Floating expanded;
- timer CPU over several minutes;
- final UI versus Milestone 1 baseline.

## 19. Security/privacy

- no network dependency for core operation;
- no telemetry;
- no auth tokens/secrets;
- restrict Tauri capabilities by window/action;
- validate imported icons;
- sanitize Notes;
- external URL action only allows approved schemes;
- no globally enabled arbitrary shell/network API just because Notes can contain links.

## 20. Test strategy

### Rust/domain
- stable task identity/reorder/move;
- duplicate identity;
- timer mode derivation;
- pause/resume;
- Time's Up/overtime;
- Pomodoro work/break;
- task switch;
- completion preserves tracked time;
- crash recovery;
- focus eligibility;
- date-only vs date-time scheduling;
- lane derivation;
- recurrence/idempotency;
- permanent-delete report semantics.

### SQLite
Use temporary DB:
- migrations;
- CRUD;
- transactional reorder;
- archive/delete;
- recurrence occurrence uniqueness;
- session edits;
- recovery snapshot.

### Frontend
- task states/interactions;
- fixed hover geometry;
- Notes explicit links;
- Notes resize;
- modal/popup states;
- shortcuts dispatch;
- active/paused/break/time-up/overtime rendering;
- subtasks;
- reduced-motion;
- report interaction accessibility.

### Windows desktop smoke/integration
- main/focus/floating switching;
- always-on-top;
- monitor placement;
- monitor hotplug/recovery;
- saved Floating position;
- global shortcuts;
- tray/autostart;
- notifications;
- maximized/borderless-fullscreen overlay behavior;
- Windows locale 12/24-hour rendering;
- DPI 100/125/150/200%;
- installer;
- Floating RAM/CPU.

Known source-product failures from `docs/SOURCE_AUDIT.md` must become explicit anti-regression tests where they touch implemented behavior.

## 21. Target project structure

```text
/
  AGENTS.md
  README.md
  STATUS.md
  TODO.md
  docs/
    PRODUCT_SPEC.md
    UI_UX_SPEC.md
    ARCHITECTURE.md
    RESEARCH_EVIDENCE.md
    SOURCE_AUDIT.md
  src/
    app/
    features/
      home/
      lists/
      tasks/
      focus-surface/
      archives/
      preferences/
      reports/
    shared/
      components/
      design-system/
      motion/
      types/
  src-tauri/
    src/
      domain/
      persistence/
      timer/
      scheduling/
      recurrence/
      windows/
      notifications/
      shortcuts/
    migrations/
```

Do not create parallel architecture/status documents unless a genuinely new concern cannot fit the existing set.