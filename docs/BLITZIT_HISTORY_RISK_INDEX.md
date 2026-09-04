# Blitzit Product History and Engineering Risk Index

Research date: 2026-09-04

This document is the historical/reliability companion to `SOURCE_AUDIT.md` and `RESEARCH_EVIDENCE.md`.

- `SOURCE_AUDIT.md` remains the detailed current-behavior/source audit.
- `RESEARCH_EVIDENCE.md` remains the supplied-screenshot and visual-evidence inventory.
- This file reconstructs product evolution, recurring failures, fixes/regressions, user-request patterns, and the engineering implications that should be consulted while implementing Narro milestones.

The purpose is not to copy every Blitzit decision. It is to preserve evidence about what has failed, what users repeatedly value, and which edge cases deserve explicit Narro acceptance tests.

---

## 1. Executive findings

1. **Tracked-time correctness is the strongest recurring Blitzit reliability warning and is still current.** Reports span at least late 2024 through September 2026: time disappearing after dashboard/navigation or sleep, completed tasks showing `00:00`, paused intervals being counted, post-pause work not being persisted, and manual Time Taken edits diverging after resume. Blitzit itself still lists `Tasks sometimes lose tracked time` as **In Development** in its public roadmap. Treat this as a failure family, not one historical bug.
2. **Blitzit's own 2025 retrospective says reporting accuracy and the original foundation were major pain points.** The team says it rebuilt the core around a unified API and rebuilt time tracking into individual editable sessions. That is useful architectural evidence for Narro's session-ledger approach, but not proof that all time-tracking defects are resolved: later public reports show the class persists.
3. **Task identity/reorder corruption has recurred across years and surfaces.** Frill reports and an independent 2025 hands-on review describe duplicate tasks during drag/reorder; some reports describe deleting one visible duplicate deleting the underlying task. Narro M2's stable-ID/exact-set/persistence-first rules are therefore justified anti-regressions, not speculative hardening.
4. **Scheduling/day-boundary defects are a recurring class.** Historical shipped reports include a one-hour scheduling offset and completed tasks appearing on the next day; current roadmap items still report wrong-day scheduling. Mobile release notes repeatedly mention timezone, recurring-task, reminder and scheduling fixes. M4 must keep date-only semantics separate from local datetimes and test DST/week/day boundaries.
5. **Lifecycle transitions are repeatedly implicated in timer defects.** Reports mention dashboard navigation, OS sleep, app restart, editing notes/estimates, Pomodoro work-to-break, and mobile navigation. Timer state must remain authoritative outside renderers, and every renderer/lifecycle boundary must either preserve the runtime or perform an explicit domain transition.
6. **Blitzit's March 2026 backend outage is developer-confirmed and affected all access to tasks/data.** Blitzit later shipped an access/backend migration item and Blitzit 3.0 explicitly lists offline support, an independent backend and stronger error/sync handling. Narro's local-only SQLite architecture intentionally eliminates this particular dependency class; do not reintroduce network authority for core task/timer state.
7. **The core product loop is consistently praised:** low-friction planning, one-task-at-a-time focus, an ever-visible/floating timer, Pomodoro, quick completion, and a simple UI. Reliability improvements should preserve that immediacy rather than turning Narro into a project-management suite.
8. **Blitzit 3.0 is a future-direction source, not current behavior.** Its public roadmap says core stability, time tracking, offline support, performance, sync/error handling and edge cases are being reworked. This corroborates problem areas but does not create Narro parity requirements.

---

## 2. Methodology and reliability rules

Evidence was searched from the earliest public history reasonably recoverable through 2026-09-04.

Priority order:

1. official current Help Center / official product pages;
2. official dated announcements and founder/team retrospectives;
3. official App Store / Google Play version history and developer replies;
4. Blitzit's public Frill bug/feature board, which the Help Center itself directs users to;
5. supplied direct screenshots already inventoried in `RESEARCH_EVIDENCE.md`;
6. contemporaneous independent hands-on reviews and user reviews;
7. Reddit/community reports as corroboration or discovery signals.

Classification used below:

- **CONFIRMED** — official documentation/release note or developer acknowledgement establishes behavior/event.
- **REPEATED REPORT** — materially similar failures appear in independent reports or across time.
- **ISOLATED REPORT** — one user report with no independent confirmation found.
- **DEVELOPER-CONFIRMED** — Blitzit explicitly acknowledges the problem/event.
- **INFERRED** — engineering implication derived from evidence; not claimed as Blitzit's internal cause.
- **UNKNOWN** — available evidence cannot establish status.

Rules:

- A Frill status such as `Shipped/Resolved` is evidence that Blitzit considers an item resolved, not proof the same failure class can never recur.
- Current roadmap counts/upvotes are directional only; they are not statistical prevalence estimates.
- Mobile findings are separated from desktop behavior. They are used only when they expose cross-platform state/lifecycle failure modes relevant to Narro.
- Planned Blitzit 3.0 behavior is not treated as current product behavior.
- No missing desktop version/date is synthesized.

---

## 3. Reconstructed product timeline

| Period / version | Evidence-backed evolution | User/reliability significance |
| --- | --- | --- |
| **2022** | Official 2025 retrospective says Omar Farook sketched the first concept: Backlog/Week/Today planning, collapsible focus panel, timer, completion feedback, breaks/Pomodoro. | Establishes that planning -> one live task -> visible timer is foundational, not a late feature. |
| **2023, exact public-launch chronology disputed** | The official 2025 retrospective says six months were spent on the first usable alpha and says Blitzit went live on Product Hunt in **Nov 2023 after a year of early access**. The current Product Hunt launch page instead records the public launch on **2024-11-19** and the maker text says it followed **one year of beta**. | Preserve the disagreement. The safe conclusion is that prototypes/early access existed before the Nov 2024 public launch; do not invent an exact beta start. |
| **2023-12 onward** | Frill contains early requests such as resizable Blitz Panel and later a pinned timer; long-lived requests begin accumulating. | Early feedback already concentrates on focus-panel ergonomics and timer persistence/placement. |
| **2024** | Official retrospective says the original foundation slowed integrations/mobile work and that Blitzit paused feature work to rebuild its core around a unified API. | Developer-authored evidence that architecture/foundation constrained product evolution. |
| **2024-08 to 2024-10** | Reddit/community discussion describes Blitzit as new and still developing. Official Oct update (latest changelog referenced as **2024-11-01**) adds floating-timer subtask management, navbar Settings, Light/Dark/System theme, and Windows signing/security improvements. | Shows rapid UI/workflow evolution before the formal Product Hunt launch. |
| **2024-11-19** | Product Hunt records Blitzit launch #4 of the day. Maker describes Windows/macOS app, Backlog/Week/Today planning, Blitz/focus mode, floating timer, task estimates, Pomodoro, notes/subtasks and integrations. | Best dated public-launch anchor currently available. |
| **2024-11 to 2025-01** | Frill reports tracked-time loss after unsolicited dashboard/navigation and sleep (Nov/Dec 2024), scheduled tasks missing until overdue, and `Tasks sometimes lose tracked time` / completed task showing `00:00` (2025-01-05). | Core timer/session persistence and lifecycle defects appear very early in the public record. |
| **2024-2025** | Frill historical resolved list includes `Time taken in tasks coming up as zero when marked to DONE`, `Task scheduling error (1-hour offset)`, and `After 5pm, completed tasks goes to next day`. | Blitzit shipped fixes for symptoms in the same failure families that later reappear. This is strong regression evidence. |
| **2024-05 through 2025** | Frill reports temporary duplicate tasks when dragging in Today. A Jan 2025 report describes a task duplicating across lanes after an update, subtask expansion breaking, and deletion of one duplicate removing the task. A May 2025 Tom's Guide hands-on review independently reports repeated task duplication when reorganising Today. | Identity/render/persistence separation is a durable risk area. |
| **2025-11-17** | Official `Blitzit 2025 Wrapped` describes the largest redesign: refreshed focus/timer, mobile beta, AI, improved integrations, and **rebuilt session tracking** with individual editable sessions. It explicitly says this addresses a long-standing reporting-accuracy issue. | First-party confirmation that time/reporting accuracy required architectural redesign. |
| **2025-12-31, desktop < v2.5.45** | Frill report says Pause visually pauses but paused minutes are still included in total Time Taken. Status seen as `Waiting response`. | Direct timer state/accounting anti-regression for M3. |
| **2026-02-16 onward, mobile 1.x** | App Store version history begins at 1.0 on Feb 16 (available public history is incomplete/occasionally duplicated by store rendering). Subsequent releases add reordering, Live Activities, auto work/break, timer restore after restart, Pomodoro transition fixes, reminders/timezone reliability, recurring tasks and more. | Mobile is not Narro parity, but release notes expose lifecycle, timer, reminder and timezone edge cases the team repeatedly had to fix. |
| **2026-03-04 to 2026-03-21** | Developer-confirmed Firebase/Google account suspension caused backend-wide outages. Omar Farook says all users/tasks/data became inaccessible; the issue recurred in March. Google Play/Trustpilot users report multi-day inability to use core data. Frill later marks `Restore Blitzit access and migrate to independent backend` shipped/resolved. | Confirms a catastrophic centralized dependency failure. Narro's local-only architecture deliberately avoids it. |
| **2026-06-30, iOS 1.5.21** | Release notes: restore in-progress timer after app close/restart, more reliable Pomodoro work->break, auto breaks/work sprints, break-over flow, reminder fixes for late/duplicate/missed notifications and profile timezone, drag/reorder fixes. | Strong cross-platform checklist for recovery, exactly-once boundary effects and reminder correctness. |
| **2026-07-08, iOS 1.5.24** | Fixes timer auto-starting the first task on app launch; navigation away from Timer screen auto-pauses/stops Live Activity; startup task sync stale-list fix. | Avoid surprise implicit timer starts. Navigation/lifecycle semantics must be explicit rather than accidental. |
| **2026-08-05, iOS 1.6.2** | Adds recurring tasks and many workflow improvements; release notes say timer state is preserved while editing notes/time estimates and fixes timer accuracy/overtime/sync plus timezone/scheduling issues. | Editing adjacent task metadata must not reset or desynchronise an active timer. |
| **2026-08 supplied desktop captures** | `RESEARCH_EVIDENCE.md` records direct current captures showing desktop **v2.6.69**. Frill also contains a March announcement referring to inbound webhooks in desktop **v2.6.4**. | These are observed version anchors only; no complete desktop semver ledger was recoverable. |
| **Late Aug / early Sep 2026** | New Frill reports say post-pause visual timer can complete while only pre-pause time is logged, and manual Time Taken edited while paused can later display a different value after resume/pause. | The timer/persistence divergence class remains current immediately before Narro M3 work. |
| **Current roadmap, Sep 2026** | `Tasks sometimes lose tracked time` remains **In Development**. `Tasks appearing on wrong day & incorrect scheduling` remains queued. `Blitzit 3.0` is **In Development** and explicitly lists stability, time-tracking improvements, offline support, independent backend, performance and better sync/error/edge-case handling. | Do not treat historical fixes as proof a class is closed. Current first-party roadmap corroborates ongoing reliability work. |

### Desktop changelog gap

The official changelog URL exists and is linked from Blitzit's Help Center, but its current public page renders the release feed dynamically and the static/indexed response available during this research shows a loading state rather than a complete desktop release ledger. The Oct 2024 official LinkedIn post independently identifies `Friday, November 1st, 2024` as the then-latest changelog. Supplied captures establish desktop v2.6.69 by Aug 2026. No complete public mapping of desktop versions between those anchors was found, so none is fabricated here.

---

## 4. Feature evolution matrix

| Subsystem | Earlier/current evolution | Evidence quality | Narro implication |
| --- | --- | --- | --- |
| Planning lanes | Backlog / This Week / Today are foundational; current docs automate scheduled movement; Done is visible in current captures. | Official current + retrospective + captures | Preserve simple plan->execute loop; scheduling logic must not mutate identities. |
| Focus/Blitz mode | Side panel/floating timer foundational; redesigned by late 2025 for clearer pause/overtime/Pomodoro states. | Official retrospective/current docs | State clarity matters. UI is projection of one authoritative runtime. |
| Timer modes | Current docs: EST countdown, Pomodoro override, count-up; actual work tracked independently. | Official current | M3 modes must share one accounting model. |
| Time/session history | Early aggregate reporting had accuracy complaints; late-2025 redesign exposes individual editable sessions. | Developer-confirmed | Durable session rows are the correct accounting primitive; task display fields should derive from/coordinate with them. |
| Break/Pomodoro | Break reminders/Pomodoro are foundational; mobile releases later add auto-start work/break, restore, break-over flow and transition fixes. | Official retrospective + store release notes | Work/break rows and boundary side effects need exact transition tests and recovery. |
| Reorder/drag | Core interaction since early releases; multiple fixes/reports of snap-back, temporary duplicates and destructive duplicate behaviour. | Repeated reports + independent review + store fixes | Stable IDs, transactional exact-set reorder, rollback and visual projection tests. |
| Scheduling/recurrence | Current desktop docs have date-only/date-time scheduling and recurring parent/children; mobile releases repeatedly fix timezone/recurrence/reminder issues. | Official docs + release notes + reports | Separate calendar date from instant; make materialisation idempotent. |
| Notes | Compact task notes evolved toward full-screen editing, links and larger-editor requests; auto-opening links on entering Blitz was later marked resolved. | Official docs/store + Frill | Explicit link activation; no focus-entry side effects; larger editor without losing compact access. |
| Window/floating UI | Persistent floating timer is core; reports include hidden/off-screen/unmovable windows and multi-screen friction. | Repeated feedback | Existing Narro monitor topology/recovery rules remain justified. |
| Backend/offline | Original cloud dependency became catastrophic during Mar 2026 outage; offline/independent backend now part of 3.0. | Developer-confirmed + reviews + roadmap | Narro core remains local-authoritative; no network dependency for task/timer correctness. |

---

## 5. Bug and regression catalogue

Status here describes the evidence state, not an internal Blitzit root cause.

| ID | Subsystem | Evidence / first known period | Pattern / impact | Blitzit status evidence | Current assessment | Narro priority |
| --- | --- | --- | --- | --- | --- | --- |
| T-01 | Timer / completion | Historical resolved item says Time Taken could become zero on Done; Jan 2025 `Tasks sometimes lose tracked time` says completion sometimes shows `00:00`. | Work history can disappear at the most important persistence boundary. | Historical symptom shipped/resolved; newer broader issue remains In Development with repeated/upvoted reports. | **STILL REPORTED / RECURRENT CLASS** | **MUST ADDRESS M3** |
| T-02 | Timer / navigation / sleep | Nov-Dec 2024 `Time logged gets lost regularly`. | Dashboard navigation while timer runs can lose progress; sleep/resume also reported losing hours and returning to dashboard. | In Testing/Awaiting Feedback. | **UNRESOLVED** | **MUST ADDRESS M3/lifecycle integration** |
| T-03 | Pause accounting | 2025-12-31, `< v2.5.45`. | Pause appears active but paused interval is added to tracked total. | Waiting response in indexed Frill view. | **ISOLATED BUT HIGH-SEVERITY** | **MUST REGRESSION-TEST** |
| T-04 | Pause/resume persistence | Late Aug/early Sep 2026 Frill: 30-min task paused at 15, resumed to completion, only first 15 logged although visual timer completes. | Renderer/display and durable accounting diverge after pause. | New report; no fix status found. | **CURRENT ISOLATED REPORT; SAME FAILURE FAMILY AS T-01/T-02** | **MUST REGRESSION-TEST** |
| T-05 | Manual Time Taken edit | Late Aug/early Sep 2026 `Time change bug`: pause -> manual change -> resume -> pause again shows different time. | Editing the paused baseline is not stably reconciled with resumed timer state. | New Bug Report; no resolution found. | **CURRENT ISOLATED REPORT** | **MUST SPECIFY/TEST BEFORE UI EDITING** |
| T-06 | Pomodoro boundaries | iOS 1.5.21 says timing glitches/work-to-break transitions were fixed; automatic restoration after break and restart restoration were added. | Boundary transitions and lifecycle recovery can lose/duplicate state or become inconsistent. | Mobile release notes say fixed/improved. | **PROBABLY FIXED ON THAT MOBILE LINE; CROSS-PLATFORM RISK REMAINS** | **MUST TEST M3** |
| T-07 | Surprise auto-start | iOS 1.5.24 fixed first task timer auto-starting on app launch. | Implicit start can record work the user never initiated. | Fixed in mobile release notes. | **FIXED ON THAT MOBILE LINE** | **SHOULD PREVENT IN M6** |
| I-01 | Task identity / reorder | May 2024 temporary duplicate report; Jan 2025 duplicate-across-lanes after update; May 2025 Tom's Guide independent duplicate observation. | Duplicate projections, broken subtasks, destructive delete risk. | Some related items resolved/planned; reports recur. | **RECURRENT CLASS** | **M2 COVERAGE EXISTS; RETAIN** |
| S-01 | Scheduling / timezone | Historical `1-hour offset` shipped/resolved; `After 5pm...next day` shipped/resolved; scheduled tasks missing then overdue; current `wrong day & incorrect scheduling`; mobile timezone fixes. | Wrong local day/hour, missed eligibility and reminders. | Mixed: old symptoms resolved; current broader issue remains queued. | **RECURRENT CLASS** | **MUST ADDRESS M4** |
| S-02 | Recurrence | Current/mobile reports and releases mention child spawning, recurrence edits and timezone/scheduling fixes. | Duplicate/missing children or wrong dates after edits/restart. | Mixed / ongoing. | **UNRESOLVED CLASS** | **MUST ADDRESS M4** |
| N-01 | Notes links | User report: entering Blitz automatically opened links from description; current roadmap lists item under Shipped/Resolved. | Unexpected external side effect simply from changing focus state. | Shipped/Resolved. | **FIXED IN BLITZIT; KEEP AS NARRO ANTI-REGRESSION** | **MUST ADDRESS M5/M6** |
| U-01 | Focus controls | `Buttons during a blitz jumpy...chasing them` has multiple upvotes and was not reproduced by Blitzit in one historical view. | Moving hit targets create interaction errors/frustration. | Cannot reproduce. | **REPEATED UX SIGNAL, CAUSE UNKNOWN** | **SHOULD ADDRESS M5/M6** |
| W-01 | Window/display | Frill has hidden/window-not-showing and screen-selection reports; community report mentions inability to drag window. | Focus/floating surface becomes inaccessible. | Mixed/testing/queued. | **ONGOING UX/PLATFORM CLASS** | **M1 coverage exists; retain M6/M7 validation** |
| B-01 | Backend availability | March 2026 Firebase suspension twice; developer says every user/task/data inaccessible. | Core product unusable despite installed client. | Access/backend migration later shipped; 3.0 adds independent backend/offline. | **INCIDENT RESOLVED, ARCHITECTURAL RISK CONFIRMED** | **NARRO LOCAL-ONLY DECISION ALREADY AVOIDS** |
| R-01 | Reporting accuracy | Official 2025 retrospective says reporting wasn't accurate enough and session tracking was rebuilt to fix a long-standing issue. | Aggregates cannot be trusted if session accounting is weak. | Developer says rebuilt; later timer-loss reports persist. | **PARTLY ADDRESSED, RELATED RISK STILL CURRENT** | **M3 before M9** |

### Interpretation of recurring tracked-time reports

Do **not** collapse T-01 through T-05 into one guessed root cause. The public evidence supports a recurring failure family across separate state boundaries:

- final completion persistence;
- navigation/presentation changes;
- machine sleep/lifecycle;
- pause/resume accounting;
- manual Time Taken rebasing;
- divergence between visible timer state and stored session totals.

Narro should therefore test each boundary independently even if the internal implementation shares one timer engine.

---

## 6. Current unresolved / currently reported issues relevant to Narro

### Must address

- `Tasks sometimes lose tracked time` remains **In Development** on Blitzit's current public roadmap.
- Post-pause logging can preserve only the first work segment while the visual timer continues (new 2026 report).
- Paused Time Taken edited manually can later diverge after resume/pause (new 2026 report).
- Wrong-day / incorrect scheduling remains on the current roadmap.
- Current Blitzit 3.0 work explicitly includes time-tracking, stability, sync/error/edge-case and offline/reliability improvements, confirming these are active product concerns.

### Should consider

- Larger/resizable Notes editor is still requested; Narro already intends compact + larger editing surfaces.
- Long-lived offline-mode demand reinforces Narro's local-first scope.
- Users repeatedly value an always-visible timer but also report window placement/visibility friction; existing Narro dynamic monitor recovery must remain part of release validation.

### Low-confidence / watch items

- A user request for auto-pause on idle suggests users may want explicit treatment of computer-idle time. Blitzit evidence does not establish one correct policy. Narro should avoid silently inventing idle-time semantics; if sleep/idle behavior becomes product-visible, specify it explicitly and test it.
- Mobile's 24-hour automatic pause is battery-oriented mobile policy, not a Windows parity requirement. It is useful only as a reminder to test very long sessions for overflow/state safety.

---

## 7. Recurring feature requests and what they reveal

These are not automatically Narro scope.

| Request / pattern | Public signal | Deeper implication | Narro disposition |
| --- | --- | --- | --- |
| Tags / labels | One of the highest-voted long-running Frill requests. | Users outgrow flat list categorisation. | Post-parity candidate already recorded; not M3 scope. |
| Calendar view | Repeated/high-vote request and listed in Blitzit 3.0. | Scheduling users want spatial date visibility, not only lane movement. | Post-parity; do not pull into M4 without scope change. |
| Offline mode | Long-running high-vote request; 3.0 includes offline support after outage. | Reliability/access is a product feature, not merely infrastructure. | Narro already local-only; treat as satisfied architectural principle. |
| Larger notes / full-screen editor | Repeated request; mobile later added full-screen notes. | Compact focus UI is insufficient for serious note editing. | Already in M5/M6 design. |
| Automatic overtime | Users request continuing beyond EST without interruption. | `Time's Up` interruption is not universally preferred. | Keep current explicit `Time's Up` parity; optional auto-overtime remains post-parity. |
| Partial completion / day-by-day time visibility | Users want to retain work on unfinished tasks by day. | Aggregate Time Taken alone can hide session history. | M9 session rows already provide a stronger foundation; no new task status required for parity. |
| Pinned/persistent timer | Long-lived request. | Users depend on spatial continuity of the focus surface. | M7 safe-position persistence already planned. |
| Custom day-start time | Niche request from users working past midnight. | Calendar-day semantics can conflict with subjective workday semantics. | Do not change M4's Windows-local calendar semantics without explicit scope decision; record as watch item. |

---

## 8. Recurring UX complaints and positive signals

### UX complaints that should influence implementation

- Hover/action controls that move while targeted create disproportionate frustration. Reserve geometry for controls.
- Compact notes are useful in focus, but users still need a comfortable large editor.
- Unexpected actions are costly: auto-opening URLs, surprise timer auto-start, or navigation implicitly mutating timer state are examples.
- Large/complex integrations and feature growth can undermine the simplicity that attracted users. Reddit/Trustpilot criticism after reliability incidents specifically contrasts core simplicity with added AI/integration work.

### Positive feedback that identifies product invariants

Across Product Hunt, Google Play, G2/Trustpilot examples, Reddit and the independent Tom's Guide review, the most consistent positive themes are:

- simple task capture and list planning;
- one-task-at-a-time execution;
- an always-visible/floating timer;
- Pomodoro/break support;
- low visual clutter and fast learning;
- satisfying completion feedback;
- seeing how long work actually took.

Engineering implication: correctness work should be invisible whenever possible. Do not solve reliability by adding confirmation steps or complex state management to the normal focus loop unless the state is genuinely ambiguous.

---

## 9. Feature-to-risk implementation matrix

Use this section as the fast lookup before working on a milestone.

### M3 — Timer/session engine

**What Blitzit appears to do**

- EST countdown, Pomodoro, count-up;
- actual work tracked independently from the displayed countdown;
- explicit pause/break states;
- Time's Up/overtime presentation;
- individual session history in the redesigned product.

**Historical failures / complaints**

- completion can lose Time Taken / show zero;
- dashboard/navigation and sleep can lose running progress;
- paused time can be counted as work;
- resumed work can fail to persist even while the visible timer progresses;
- paused manual edits can later diverge;
- Pomodoro work/break transitions and restart restore required repeated fixes.

**Required Narro edge cases / regressions**

1. Work 15m -> pause -> wait 10m -> resume -> work 15m -> Done: durable Time Taken is exactly 30m, not 15m/40m; visual snapshot and DB ledger agree.
2. Repeat pause/resume several times; each running segment counts exactly once and paused intervals count zero.
3. Pause -> manually set Time Taken -> resume -> pause/Done: the edited value becomes a durable baseline and cannot snap back, double-count or diverge from session history.
4. Time's Up -> decision delay -> Done/Switch: decision delay follows the specified semantics exactly and cannot silently become work unless overtime/extend is active.
5. Work -> manual break -> work and Pomodoro work -> break -> awaiting resume: break seconds never enter work Time Taken.
6. Process crash/restart in running, paused, break, Time's Up/overtime and task-switch-adjacent states: recover deterministically; process downtime is not counted as work; no second open running session appears.
7. Persistence failure at pause/resume/switch/finish leaves authoritative runtime and DB in a coherent pre-transition state.
8. Task completion and final session close must share one successful persistence boundary (transaction or equivalently safe coordination) so Done cannot expose a completed task with lost/zero Time Taken.
9. Closing/recreating `main` or switching Focus Panel <-> Floating Timer must not reset, duplicate or independently advance the timer.
10. A timer must never auto-start merely because Narro launches or a renderer appears; start requires the explicit product transition that enters Blitz/focus.
11. Pomodoro notifications/boundary events fire at most once even when the renderer is late, a transition is replayed, or recovery occurs.
12. Test a large elapsed/suspend interval for overflow/state safety; do not infer an idle-time policy from Blitzit.

### M4 — Scheduling / recurrence / reminders

**Known Blitzit failure class**: one-hour offsets, wrong-day completion, scheduled items not appearing until overdue, current wrong-day reports, timezone/recurring/reminder fixes on mobile.

**Narro tests**

- date-only values never convert through UTC and shift calendar date;
- local datetime values handle DST gap/fold explicitly;
- Monday week boundary and Sunday->Monday rollover;
- timezone change between schedule creation and evaluation;
- recurrence materialisation repeated on startup/resume/date change is idempotent;
- delete/unschedule cancels pending reminder exactly once;
- schedule-lane moves preserve one task identity;
- reminder delivery cannot become late/duplicate merely because a due scan repeats.

### M5/M6 — Main UI and Focus Panel

**Known Blitzit pitfalls**: jumping action buttons, compact notes, auto-opening note URLs, subtasks disappearing in focus reports, surprise navigation/timer coupling.

**Narro tests**

- hover/focus action slots never reflow the row/card;
- note links open only after explicit activation;
- opening/closing notes cannot reset timer/session state;
- task/subtask identity remains the same across board and Focus projections;
- live Time Taken/EST edits are disabled unless paused;
- re-opening `main` projects current authoritative session without causing a transition.

### M7 — Floating Timer

**Known Blitzit pitfalls**: window invisibility/placement/multi-desktop complaints; users nevertheless strongly value the persistent timer.

**Narro tests**

- Focus<->Floating is presentation-only for timer/session identity;
- safe last position survives restart if valid and clamps after monitor removal/DPI change;
- expanded controls remain on-screen near taskbar/work-area edges;
- no continuous animation/polling causes idle CPU regression;
- timer numbers derive from authoritative state and cannot drift from session ledger.

### M9 — Reports

**Known Blitzit issue**: official retrospective says reporting accuracy was a long-standing problem and motivated individual session tracking.

**Narro tests**

- report totals derive from the same durable work/break session ledger used by M3;
- no separate mutable `Time Taken` cache can contradict session history;
- archived data remains historical; permanent deletion follows Narro's explicit report-exclusion rule;
- edited/added sessions reconcile task totals deterministically.

---

## 10. Current M3 implementation review against the research

Repository state inspected at main `c769c284002628b73f76b4c1e35b1595dc685bf0`.

### Already aligned / validated

- PR #23 / `efb50743...`: one authoritative pure Rust state machine; controlled time; explicit running/paused/break/time-up/overtime states; idempotent pause/resume; work independent of renderer cadence.
- PR #24 / `2da2496d...`: Done/Skip/Switch lifecycle, including Time's Up boundaries and atomic rejected target transitions at the engine layer.
- PR #25 / `faf46923...`: transactional session persistence, monotonic durations, work/break separation, database invariant preventing more than one unfinished session, restart-surviving persisted row.
- PR #27 / `c769c284...`: persistence-first `TimerRuntime`, no per-second SQLite writes, atomic work<->break and task-switch row replacement, pause/resume checkpoints, fractional-segment accounting and rollback on failed switch.
- `src-tauri/tests/timer_session_coordinator.rs` already proves a pause/resume/finish path where paused wall time is excluded and pre/post-pause work is combined; it also checks work/break separation, Pomodoro row boundaries and task-switch persistence.

### Remaining concrete risks before M3 can close

1. **Crash/restart runtime recovery is not merged.** PR #27 explicitly leaves recovery for a later durable checkpoint/recovery layer; the earlier PR #26 recovery attempt was closed unmerged.
2. **Task completion mutation is not transactionally coupled to timer exit.** PR #27 explicitly calls this out. Given the recurring Blitzit `Done -> 00:00` failure family, this is a must-address boundary, not optional cleanup.
3. **Manual Time Taken editing is not yet reconciled with a running `TimerRuntime`.** The M2 domain can store Time Taken metadata/session-derived values, but no merged M3 integration was found that rebases an active paused timer after a manual edit.
4. **Typed Tauri events and renderer integration are still pending.** When added, lifecycle/presentation actions must be proven non-authoritative and non-destructive.
5. **Pomodoro notification side effects/recovery are pending.** Exactly-once transition effects need tests so renderer timing/recovery cannot duplicate or miss notifications.
6. **Windows sleep/resume policy is not yet evidenced by M3 tests.** Required invariant is no session/data loss. Whether unattended sleep duration should count as work is a product decision and should not be guessed from Blitzit reports.

---

## 11. Source references

Primary / official:

- Blitzit Help Center — Timer modes: https://www.blitzit.app/help-center/timer-modes
- Blitzit Help Center — Tasks: https://www.blitzit.app/help-center/tasks
- Blitzit Help Center — Blitz mode: https://www.blitzit.app/help-center/blitz-mode-%28focus-sessions%29
- Blitzit Help Center — Scheduling: https://www.blitzit.app/help-center/scheduling-task-reminders
- Blitzit current changelog URL: https://www.blitzit.app/changelog
- Blitzit 2025 retrospective (published 2025-11-17): https://www.blitzit.app/blog/future-of-blitzit
- Official Oct 2024 update / Nov 1 changelog reference: https://www.linkedin.com/posts/blitzitapp_flowstate-productivity-productivitytools-activity-7258092457081405440-BmPE
- Product Hunt launch record (Nov 19, 2024): https://www.producthunt.com/products/blitzit-2
- App Store version history: https://apps.apple.com/us/app/blitzit-app/id6743005253
- Google Play listing/reviews/release notes: https://play.google.com/store/apps/details?id=app.blitzit.blitzit
- Blitzit public roadmap: https://blitzit.frill.co/roadmap
- Frill — Time logged gets lost regularly: https://blitzit.frill.co/b/xmnjk5vl/feature-ideas/time-logged-gets-lost-regularly
- Frill — Duplicated Task: https://blitzit.frill.co/b/xmnjk5vl/feature-ideas/duplicated-task
- Developer account of March 2026 Firebase outage: https://www.linkedin.com/posts/buildwithomar_today-is-a-horrible-day-for-blitzit-were-activity-7441030122369044480-N-iF

Independent/corroborative:

- Tom's Guide hands-on review (2025-05-26): https://www.tomsguide.com/computing/i-bought-this-productivity-app-from-instagram-and-its-now-an-essential-part-of-my-toolset
- Product Hunt reviews: https://www.producthunt.com/products/blitzit-2/reviews
- Trustpilot: https://www.trustpilot.com/review/blitzit.app
- Reddit — Aug 2024 feedback thread: https://www.reddit.com/r/ProductivityApps/comments/1em04rg/
- Reddit — Dec 2025 Rize vs Blitzit discussion: https://www.reddit.com/r/ProductivityApps/comments/1ph3mg0/r_i_z_e_vs_blitzitapp/
- Reddit — Feb 2026 critical reliability thread: https://www.reddit.com/r/ProductivityApps/comments/1r8jo9c/blitzit_app_review_a_masterclass_in_neglect_and/
- Reddit — Jun 2026 subscription/reliability discussion: https://www.reddit.com/r/productivity/comments/1u3jtki/should_i_subscribe_to_blitzit_or_is_there/

Repository-local evidence:

- `docs/RESEARCH_EVIDENCE.md` — supplied screenshots, including observed desktop v2.6.69 and Tool Finder review captures.
- `docs/SOURCE_AUDIT.md` — current Help Center, roadmap and feedback audit as of 2026-08-15.

---

## 12. Evidence gaps and uncertainties

- No complete static/public desktop changelog ledger could be recovered from the current official changelog page. Desktop version chronology between known anchors therefore remains incomplete.
- Blitzit's own Nov 2025 retrospective says it went live on Product Hunt in Nov 2023, while Product Hunt's current launch record is Nov 19, 2024 and the maker says that launch followed one year of beta. The discrepancy is retained rather than reconciled by assumption.
- Frill status labels and upvote counts change over time. They establish acknowledgement/workflow state at crawl time, not exact release-fix versions unless a release note also exists.
- Some recent Frill reports are visible through the board feed without a stable indexed direct-item URL. Their titles/date-relative board entries are recorded, but no exact fix version is claimed.
- App Store history rendering sometimes duplicates the current release text near the earliest-version entry. Only version/date pairs and release-note statements that are clearly attributable are used.
- Mobile-specific fixes do not prove the same desktop implementation or bug. They are included only as engineering-sensitive lifecycle/state evidence.
- Public reviews are self-selected and low-volume on several platforms. Sentiment is used qualitatively, not as statistically representative prevalence.

---

## 13. Use rule for future implementation sessions

Before implementing or changing a feature that overlaps Blitzit:

1. read the corresponding section of this file;
2. read the current behavior in `SOURCE_AUDIT.md` / `PRODUCT_SPEC.md`;
3. inspect the relevant Narro implementation/tests before assuming the risk is still open;
4. add only the missing anti-regressions relevant to the code being changed;
5. do not copy Blitzit behavior when the evidence above shows that behavior caused reliability or UX problems.
