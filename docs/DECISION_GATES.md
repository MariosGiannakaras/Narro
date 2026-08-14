# Decision Gates

Status: **Proposal / implementation steering aid — not mandatory process**

Last reviewed: 2026-08-15

These gates are suggested checkpoints for avoiding expensive implementation mistakes. They are not release bureaucracy and they are not a reason to block a clearly superior implementation path.

Codex may combine, simplify, reorder, or replace a gate if the same risk is addressed more effectively. The important part is the evidence gathered, not following this document literally.

## Gate A — Windows desktop viability

Suggested timing: before polished product UI.

Question: does the current starting architecture actually behave well enough on the target Windows machine?

Suggested evidence:
- app startup and secondary-window startup feel acceptable;
- global shortcut registration works and conflict handling is understood;
- tray/background lifecycle works;
- Windows notification path works while the process is alive;
- autostart can be controlled locally;
- main window can be closed/destroyed and recreated without losing domain state;
- Focus Panel can target a monitor edge;
- Floating Timer is movable and remains always-on-top where Windows allows;
- monitor connect/disconnect/scaling changes do not strand windows;
- idle CPU and memory are measured for main, focus, and floating-only states;
- repeated Focus↔Floating switching shows no obvious leak or accumulating renderer/window instances.

Current proposal: validate Tauri 2 + WebView2 and the `main` + `focusSurface` approach.

Possible conclusion examples:
- **Proceed unchanged** — measurements and behavior are good.
- **Optimize current design** — architecture is sound but implementation has avoidable overhead.
- **Change window strategy** — another Tauri window/webview composition is measurably better.
- **Evaluate native overlay** — only the floating surface is problematic.
- **Reconsider shell/framework** — a concrete blocker makes the current starting stack the wrong choice.

No conclusion is predetermined.

## Gate B — Core correctness

Suggested timing: after persistence/timer/scheduling foundations, before depending on them throughout UI.

Question: can the local domain model be trusted?

Suggested evidence:
- SQLite migrations work from a clean data directory and across at least one upgrade;
- create/edit/move/reorder preserve stable IDs;
- reorder never changes task count;
- recurrence materialization is idempotent;
- date-only schedules stay on the intended calendar day;
- local date-time schedules remain correct across DST/timezone tests;
- future-timed Today tasks are not started early;
- work and break sessions remain separate;
- pause/resume/switch/complete preserve accumulated time;
- completion cannot convert tracked work to `00:00`;
- app interruption/recovery behavior is explicit and tested.

If a simpler schema or timer model proves more reliable than the current architecture sketch, prefer the better model and update the docs.

## Gate C — Core product fidelity

Suggested timing: after the main planning and Focus surfaces are functional.

Question: does MyBlitzit still feel like the intended Blitzit-style workflow rather than a generic task manager?

Suggested validation:
- create a task with very little friction;
- prioritize Today quickly;
- enter Focus without unnecessary navigation;
- identify the active task immediately;
- work primarily from Focus/Floating without reopening the dashboard;
- switch task, pause, break, note, subtask, and complete actions are easy to discover;
- long titles remain usable;
- hover/focus controls never jump under the pointer;
- dark/light hierarchy resembles current screenshots at a glance;
- UI is compact without becoming hard to target.

Pixel identity is not required where a better Windows-native or accessibility treatment improves the experience without losing the visual/product character.

## Gate D — Floating surface quality

Suggested timing: after real Floating Timer UI exists.

Question: is the always-visible surface light, stable, and pleasant enough to leave running for hours?

Suggested measurements/tests:
- collapsed idle CPU;
- expanded idle CPU;
- timer-running CPU;
- memory with main destroyed;
- memory before/after 100 Focus↔Floating transitions;
- memory before/after repeated Notes/subtask expansion;
- no continuous decorative animation while idle;
- title/timer geometry does not jitter every second;
- safe position survives restart and monitor topology changes;
- always-on-top behavior is tested over ordinary/maximized/borderless-fullscreen applications.

Do not use an arbitrary RAM target as the sole pass/fail criterion. Compare against the measured baseline and the actual user experience.

## Gate E — UI polish and accessibility

Suggested timing: once the product loop is stable.

Question: do motion and refinement improve understanding without adding fragility or resource cost?

Suggested validation:
- visible focus states;
- keyboard alternatives for pointer-only interactions;
- useful tooltips for ambiguous icons;
- reduced-motion behavior;
- short, one-shot animation only;
- no hover layout shift;
- no timer-number width jitter;
- no animation delaying persistence/domain transitions;
- Windows scaling at 100/125/150/200%;
- locale-aware date/time presentation.

Animation timings in `UI_UX_SPEC.md` are starting values. Tune or replace them if direct testing feels better.

## Gate F — Reports/history consistency

Suggested timing: before considering reporting complete.

Question: can every report total be explained from stored local data?

Suggested validation:
- report totals reconcile with session/task fixtures;
- manual session edits immediately update aggregates;
- break filtering is correct;
- archived records behave intentionally;
- permanent deletion semantics are consistent;
- date filtering honors local dates/timezone;
- exports are generated entirely locally.

If the source product's exact aggregation formula is unclear, prefer a transparent, internally consistent MyBlitzit definition and document it.

## Gate G — Release candidate

Suggested timing: before treating the app as stable for daily use.

Suggested scenario pass:
- fresh install;
- restart/reboot;
- sleep/wake;
- lock/unlock;
- monitor unplug/replug;
- task creation/reorder/scheduling/recurrence;
- multi-hour focus session;
- pause/break/overtime/completion;
- crash/interruption recovery;
- reports/session editing;
- upgrade/migration;
- tray Quit;
- Windows DPI and locale changes.

The gate passes when known failures are acceptable and documented, not merely because every checkbox in this proposal was executed literally.

## Recording a gate result

A short `STATUS.md` note is enough:

```text
Gate A — Windows desktop viability
Result: proceed with current Tauri focusSurface model.
Evidence: measured X/Y, shortcut/tray/monitor tests pass.
Remaining concern: ...
Revisit if: ...
```

Long reports are unnecessary unless the evidence is genuinely useful later.
