# Interaction / Video Capture Guide

Status: **Optional research proposal — use when direct access to the current Blitzit app or reliable video footage is available**

Last reviewed: 2026-08-20

Static screenshots and Help Center articles already cover most product structure. Further research is most valuable when it reveals **transitions, timing, transient states, window behavior, or edge cases** that static evidence cannot show.

This guide is therefore not a request to record everything and not a requirement to copy every observed behavior. Source-product behavior may be buggy or less suitable for a Windows-only local app. Record observations first; decide later whether Narro should reproduce, improve, or intentionally reject them.

## 1. Capture principles

When recording the original app:

- prefer short focused clips, roughly one workflow each;
- begin from a clearly known state;
- show the pointer and relevant window boundaries;
- avoid editing private/sensitive content into captures;
- capture the full window when window resizing/movement matters;
- if possible, record at known Windows display scaling and resolution;
- note Blitzit version if visible;
- do not infer hidden persistence/network behavior from visuals alone;
- separate **observed** behavior from **recommended Narro** behavior.

A clip is useful even if it reveals a bug. Bugs become reliability evidence, not clone requirements.

## 2. Highest-value workflow captures

### A. Task create/edit/delete

Suggested sequence:
1. Create at bottom of a lane.
2. Create at top of a lane.
3. Edit title.
4. Edit EST.
5. Complete.
6. Delete another task and observe confirmation.

Observe:
- focus placement after create;
- keyboard behavior;
- whether save is explicit or immediate;
- exact hover/action reveal;
- animation ordering;
- whether row height changes;
- completion transition and final destination.

Do not assume the exact animation should be copied if a more stable interaction works better.

### B. Drag/reorder/move

Suggested sequence:
- reorder within one lane;
- move between Backlog / This Week / Today;
- move a scheduled task if allowed;
- restart/reopen and confirm order.

Observe:
- drag preview/placeholder;
- activation distance;
- drop-zone feedback;
- settle timing;
- whether metadata changes automatically;
- any duplicate/disappearing task behavior.

Any duplication/order corruption is a bug signal, not parity behavior.

### C. Scheduling

Capture:
- Today;
- Later today;
- Tomorrow;
- Next week;
- custom date without time;
- custom date with time;
- reschedule;
- remove schedule.

Observe:
- picker layout;
- date/time formatting;
- immediate lane movement;
- scheduled-group placement;
- overdue transition;
- how time-only edits affect the task.

### D. Recurrence

Capture if practical:
- create daily/weekday/weekly recurrence;
- custom recurrence;
- edit recurrence;
- Replace Existing Tasks;
- detach/remove recurrence;
- generated child appearance.

Observe relationships and visible semantics. Do not infer database architecture from UI.

### E. Enter Blitz / Focus Panel

Suggested sequence:
1. Put several tasks in Today.
2. Include one future-timed scheduled task.
3. Start Blitz.

Observe:
- which task becomes live;
- panel opening position/size;
- whether main hides/closes/stays visible;
- exact active-card transition;
- queue grouping;
- pointer/focus behavior;
- whether future scheduled tasks can be selected early.

### F. Switch live task

Capture Rocket/make-live action while another task is running.

Observe:
- does previous timer pause or close immediately?
- does new timer begin immediately?
- is there confirmation?
- what visible Time Taken appears on the old task?
- does list order change?
- does the active-card highlight animate?

This is particularly valuable for validating session segmentation.

### G. Pause / Resume

Observe:
- icon/text changes;
- whether EST and Time Taken become editable;
- whether subtasks/notes remain usable;
- transition timing;
- whether elapsed display changes after a long pause.

### H. Manual Break

Observe:
- whether task automatically pauses first;
- break timer presentation;
- available actions during break;
- skip/end behavior;
- whether the same task resumes automatically afterward.

### I. EST reaches zero

One of the highest-value captures.

Observe:
- exact `Time's Up` state;
- whether timer stops, continues, becomes positive overtime, or changes labeling;
- Extend UI;
- Done UI;
- Switch Task UI;
- sounds/notification/flash;
- what happens to actual Time Taken.

### J. Pomodoro transition

Capture work sprint → break and break → next work phase.

Observe:
- automatic vs manual transition;
- notifications;
- window/state changes;
- whether EST is visible anywhere while Pomodoro is active;
- what happens if user pauses around zero.

### K. Complete live task

Another high-value unresolved workflow.

Observe exactly what happens after Done:
- next task auto-starts;
- next task becomes selected but paused;
- Focus remains idle;
- success screen appears;
- queue reorders;
- Floating/Focus window changes.

This capture could resolve one of the main remaining low-confidence behavior questions.

### L. Focus Panel ↔ Floating Timer

Capture multiple toggles.

Observe:
- native window geometry change;
- fade/scale timing;
- whether there is one visually transformed window or a replace/hide/show sequence;
- focus retention;
- position memory;
- timer continuity;
- task/subtask state continuity.

Do not copy the underlying source window architecture merely from appearance. Narro's architecture should be chosen from measured Windows behavior.

### M. Floating Timer expand/collapse

Observe:
- window resizing direction;
- control reveal order;
- subtask-row animation;
- drag region;
- hover tooltips;
- action hit targets.

### N. Notes

Capture:
- open Notes from normal board;
- open from Focus;
- edit formatting;
- click a URL;
- resize if current version supports it;
- close and reopen.

Observe whether timer state changes and whether URL opening is explicit. If the source unexpectedly auto-opens links, record it as source behavior/bug evidence rather than a Narro requirement.

### O. Subtasks

Capture add/edit/complete/reorder/delete in both normal and focus/floating contexts.

Observe:
- progress animation;
- row movement;
- whether completed subtasks stay in place;
- any difference between full and compact surfaces.

### P. Reports / Sessions

Capture:
- change date range;
- change list filter;
- graph hover;
- Add Session;
- edit a session;
- delete a session;
- export.

Observe:
- recomputation timing;
- validation errors;
- modal/inline editing behavior;
- whether scroll position is preserved.

### Q. Multi-monitor/window behavior

If practical:
- start app with two monitors;
- move/select Focus Panel monitor;
- unplug secondary monitor;
- reconnect it;
- change scaling;
- move Floating Timer partly near work-area edges;
- restart app.

Observe failures as well as successes. Narro should generally improve recovery rather than reproduce source limitations.

## 3. Useful Windows edge-case captures

Optional, only if easy to reproduce:

- sleep → wake during running task;
- lock → unlock;
- system clock change;
- timezone change;
- Windows DPI/scaling change;
- taskbar moved/autohide;
- Explorer restart;
- borderless fullscreen app under Floating Timer;
- normal app exit during running task;
- forced process kill during running task.

The goal is to understand UX expectations, not to mimic unsafe behavior.

## 4. Capture metadata template

For each useful clip, record something like:

```text
Clip: focus-done-next-task.mp4
Source version: vX.Y.Z if visible
OS: Windows 11
Display: 2560x1440 @ 125%
Starting state: Task A live, Task B next, success screen enabled
Action: click Done
Observed:
- ...
- ...
Confidence: direct observation
Narro recommendation: reproduce / improve / reject / undecided
Reason: ...
```

## 5. Interaction analysis template

For implementation-relevant clips, analyze six layers:

1. **Trigger** — pointer, keyboard, timer event, OS event.
2. **Immediate feedback** — pressed state, highlight, sound, outline.
3. **Domain transition** — what task/session/schedule state changes.
4. **Window/layout transition** — resize, move, modal, expansion.
5. **Persistence expectation** — what must survive restart.
6. **Narro choice** — reproduce, improve, or intentionally diverge.

This prevents confusing a visual transition with business logic.

## 6. Motion analysis

If a recording is high enough quality, approximate:
- delay before response;
- transition duration;
- transform direction;
- opacity changes;
- whether geometry changes before/after content;
- whether easing feels spring-like, ease-out, or linear;
- whether interaction causes layout shift.

Do not overfit exact millisecond values from screen recordings. Capture frame rate, compression, and system performance make exact reconstruction unreliable. Use the observation to tune Narro by feel and measured performance.

## 7. When to stop researching

Do not delay implementation to fill every unknown.

Direct interaction research is most valuable when it resolves:
- a low-confidence behavior that affects architecture or data integrity;
- an important transient state absent from screenshots;
- a window/multi-monitor question;
- an interaction whose feel is central to the product;
- a source conflict.

If a question can be answered more effectively by implementing two small prototypes and measuring them, prefer the prototype.

The objective is not a forensic reproduction of every Blitzit implementation detail. The objective is a reliable, lightweight, recognizable, and polished Narro experience.
