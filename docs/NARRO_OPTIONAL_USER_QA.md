# Optional Milestone 12 — Professional in-app user QA / testing

**Status: DORMANT / STRICTLY OPT-IN — specification only.** This document records a *future optional* user-level quality-assurance campaign for Narro. Creating or reading it does **not** activate M12, grant permission to run the Windows app, resume paused physical acceptance, change settings, access real user data, or install anything.

## 1. Purpose and boundaries

Test the **real packaged Narro** the way a normal user uses the application. The goal is high confidence that the complete daily experience is useful, correct, responsive, understandable and consistent — not merely that code compiles or visual snapshots look plausible. Follow professional, risk-based QA practice: traceable scenarios and expected outcomes, smoke → functional/user journeys → exploratory → bug triage → fix/retest → focused regression → closure.

**Scope is deliberately limited to user actions inside Narro.** This is **not** a Windows stress/engineering campaign, a repeat of PA-01–09, a Blitzit source-forensics audit, or a full code/security/performance review. Prefer the actual mouse, keyboard and normal application dialogs/menus. Direct UI automation is acceptable only if it faithfully performs the same user-facing actions, and the exact device/application outcome can be observed; it does not convert non-executed manual/native acceptance into PASS.

### Included (ordinary in-app actions)

- Normal app launch/quit/reopen and user-facing navigation; minimize/restore only through usual window controls as part of regular use.
- Create/read/edit/duplicate/move/reorder/complete/reopen/archive/restore/delete through Narro controls, **using disposable test records only**.
- Open/close dialogs, popovers, menus and tooltips; hover, focus, keyboard input, Enter/Escape, cancel/confirm, validation/errors, and natural loading/feedback states.
- Planning and scheduling, date/time selection, recurrence, reminders configured **inside Narro**, search/filter, notes/subtasks, Focus/Timer and reports/history/exports via normal UI.
- Theme, timer, alert and other **in-app** Preferences; sound previews and ordinary app shortcuts where available without Windows configuration changes.
- App-visible saved state across navigation and a normal quit/relaunch; natural repeat action/empty/invalid-input cases. UX/readability/interaction consistency using in-scope UI.
- Ordinary app-triggered native Open/Save file dialogs when needed for image import/export, without altering OS permissions, registry or system preferences.

### Strictly excluded

**Do not include, request or perform any of the following under M12:**

- Multi-monitor/topology stress: no two-screen choreography, docking across monitors, connect/disconnect displays, cable unplug/replug, display hotplug, resolution/scaling/DPI/refresh-rate or color-profile changes.
- Windows Settings or Control Panel, OS notifications/security/Focus Assist/Do Not Disturb, system time/timezone, sleep/wake, registry, services, taskbar/task manager tweaks, startup policy, power settings, virtual desktops, driver changes or hardware changes.
- Installation/uninstallation, upgrade/migration, clean profile setup, AppData/SQLite edits, wiping caches, corrupting databases, manual filesystem modifications, permissions changes, process killing, fault injection, network manipulation or load/stress tooling.
- DevTools, debugging, internal protocol inspection, binary analysis, backend reverse engineering, CPU/RAM benchmarking, CI pipelines or infrastructure testing as **test actions** in this user-facing campaign.
- Blitzit external-source capture/comparison; cloud/account/AI/MCP/subscription/integration testing; unrelated external services.
- Deliberately damaging genuine user data or using real personal tasks for destructive tests.

An actual crash or bad result that occurs **naturally during an allowed in-app action** must still be recorded, but must not become a reason to improvise excluded OS-level experiments. An excluded check remains owned by its separate milestone/validation track; M12 cannot close, replace or reactivate it.

## 2. Activation, order and progress accounting

M12 must be **explicitly activated by the user by name or by a clearly equivalent request for the optional in-app QA campaign**. General 'continue', 'finish', completion of M10, activation of M11, existence of an installer/video, or creation of this plan does **not** authorize M12.

- **Prerequisite:** validated M10 baseline and a verified, runnable Narro release candidate. If M11 is explicitly activated, perform M12 against the **validated post-M11** candidate, not the older M10 candidate.
- M11 and M12 are **independently optional**. Neither activates the other. For an ordered final campaign: M1–M10 → M11 (if explicitly activated/completed) → M12 (if explicitly activated/completed) → required Final Comprehensive Review.
- If M12 is never activated, mark it **SKIPPED BY DESIGN**, do not treat any checklist here as a blocker, and proceed directly to the Final Comprehensive Review after the applicable earlier stage.
- The base progress denominator always remains **10 mandatory milestones** until an optional milestone is explicitly activated. If the reporting convention counts activated optionals, use **10 + number of separately activated optionals**, never 12 merely because this file exists. Always report mandatory 10 separately from optional completion and Windows/Blitzit source parity.
- **Safety prerequisite:** separate, explicit approval for *this* normal user-app session and its evidence/capture method; user-paused native PA-01–09 **remain paused**. M12 approval is not consent to install/execute outside the agreed application environment, modify user AppData or use genuine personal content.
- On activation record exact candidate source SHA, package identity, app version, owner, environment, allowed test data, session permissions and M12 status in current tracking. Never claim historical validation applies to a newer replacement SHA without impact review.

## 3. Testing method (professional but practical)

### Before testing — test charter and traceability

1. Use existing expected behavior from `docs/PRODUCT_SPEC.md`, applicable accepted source evidence, current app UI and verified requirements. Do not invent Blitzit-specific expected outcomes when the source is unknown; use established Narro-local requirements and accessibility/data-integrity rules.
2. Confirm **actual** packaged release candidate, SHA/version, environment, permissions, and access to a test-safe workspace. Protect existing personal data. Prefer a user-approved disposable test profile supplied through the normal workflow; do not manually manipulate storage or the OS.
3. Create a small **repeatable test dataset from inside Narro** (e.g. two lists, several tasks with/without EST, one scheduled/recurring task, notes, three subtasks, one safe timer session, one disposable archive/delete record). Record the baseline; do not overwrite original account/profile content.
4. Every test case has ID, area, priority (P0/P1/P2), preconditions, concrete in-app steps, expected observable result and actual result/evidence. Define prerequisites and sequence so earlier cases do not accidentally invalidate later ones.
5. Apply test outcome strictly: **PASS** (observed exactly), **FAIL** (reproducible or captured deviation), **BLOCKED** (dependency/environment), **NOT RUN**, **NOT APPLICABLE** (with reason). **Automated tests/CI or screenshots alone do not turn unexecuted M12 cases into PASS.**
6. During interactive testing capture lightweight evidence (screenshot, bounded screen recording, exact UI copy and time) when useful, without raw sensitive data. Long all-day video, UIA/ETW/DB dumps and technical instrumentation are **not requirements**.

### Execution stages

**A. Smoke** — open the app, navigate Home/Board/Focus/Reports/Preferences, basic task create/edit, normal close and relaunch. If core navigation or saving fails, fix that blocker before proceeding into dependent flows.

**B. Core journeys** — execute all applicable QA-01…QA-12 below with pass/fail evidence. Use full end-to-end outcomes rather than testing isolated buttons with no verification of their effect.

**C. Bounded exploratory testing** — time-box realistic tasks not fully represented by the script: navigate out/back, cancel/reopen, alternate valid inputs, repeat normal buttons, search and switch list after changes, use keyboard where possible. Record every credible unexpected behavior; do not broaden into OS/hardware testing.

**D. Triage and fix** — deduplicate existing issues first, reproduce defects on the exact candidate, classify impact, prioritize. Implementation fixes use the repository's normal branch/PR/preflight/exact-head Windows CI and resulting-main validation process; **QA does not waive any source/CI/integrity gate**.

**E. Retest and regression** — execute the exact failing scenario on corrected release candidate, then nearest affected user journeys and short smoke pass. A fixed source/CI result without actual in-app retest is **FIXED IN CODE / QA RETEST PENDING**, not PASS.

**F. Release report** — publish the test matrix with evidence, bug status and limitations; freeze exact accepted candidate identity. Do not claim zero bugs in untested surfaces.

## 4. In-app scenario matrix

IDs are stable scenario families, **not a predetermined number of tests that must PASS without execution**. Each family is broken into step-level cases upon activation, preserving the direct user-action-only restriction. Within each case check normal outcome, cancel/close path, transient feedback, resulting state and user-visible persistence where applicable.

| ID | Ordinary user journey | Key acceptance observations |
| --- | --- | --- |
| **QA-01** | Open Narro → Home → choose list → All Lists → back/home | Accessible navigation, correct selection/visible content, no blank/overlapping/blocked UI, coherent back/close. |
| **QA-02** | Create, edit, duplicate, archive, restore and (test-only) delete a list | Correct modal input, color/icon selection without breaking approved Spectrum Core picker/upload/218 icons, visible confirmation/cancel, preserved unrelated lists. |
| **QA-03** | Create/edit task via normal UI; title, EST, manual Time Taken, empty/invalid/long input | Correct validation, save/cancel behavior, displayed values, totals and reopened state. |
| **QA-04** | Reorder/move tasks within and across Backlog/This Week/Today/Done; use available non-drag action | Stable number of tasks/identities, no duplicates or lost tasks, correct ordering, progress/EST counters after actions and normal navigation. |
| **QA-05** | Add/edit/complete/reopen/reorder/delete subtasks; edit/format notes | Correct counts/progress, text formatting and persistent content, no mutation of other tasks. |
| **QA-06** | Schedule/clear tasks with presets/custom date/time; create/edit/cancel recurrence | Correct visible date/lane/group and recurrence after reopen; no duplicated instances or unexpected edits. No system-clock changes or long waits for scheduled dates. |
| **QA-07** | Search tasks/lists, quick actions, list selection, archive and completed-task filters | Accurate matches/empty results, filters/clear/close, correct link back to owning task/list. |
| **QA-08** | Start Focus; switch active task; pause/resume; notes and queue; break/skip/Done | Correct active identity, status/counters, feedback and Time Taken after normal task transitions, preserved work when returning to Board. |
| **QA-09** | Switch Focus ↔ Floating Timer; expand/collapse subtasks; hover ordinary controls | Same active timer state and task, expected visibility/placement in the existing display, functional buttons and readable controls. **No multi-monitor movement or special window topology cases.** |
| **QA-10** | Timer modes using naturally reachable short cases: EST/count-up, Time's Up/Extend, Pomodoro as feasible | Correct states and user actions; don't fake time, alter Windows, or wait indefinitely. Long-duration boundaries can be **NOT RUN** with reason. |
| **QA-11** | Use Reports Overview and Sessions: filters/date range, charts, add/edit/delete test session, CSV/PDF export | Visible metrics consistent with test records, charts/labels/tooltips, correct totals and standard app-initiated save flows; no private-data export. |
| **QA-12** | Preferences, dark/light/system choice **within app**, in-app alert/sound preview, success feedback, shortcuts, dialog keyboard focus; quit/reopen | Preferences and input settings persist, normal app feedback works, labels/contrast/focus/tooltip usable, no OS setting changes, existing data remains intact. |

### Cross-flow checks (apply while doing QA-01…12)

- A change made in one app surface appears where expected in another (Home/Board/Focus/Reports), without restart unless explicitly required.
- Cancel, Escape/close, disabled, required-field error, quick double-click and natural feedback do not create duplicate/partial data; never force service/network failures.
- Accessibility **from ordinary in-app input**: Tab/Shift+Tab, focus visibility and return after modal, accessible button labels/tooltips and readable content. Do not change Windows accessibility/system settings as part of M12.
- Data safety: original list/task ID count, stored tracked work and completed history must not change unexpectedly; only disposable entities may be intentionally deleted.
- Usability defects count: confusing labels, unresponsive controls, inconsistent behavior, clipped text, obstructive overlays, missing feedback, unreadable contrast, excessive accidental action or broken keyboard path — not just crashes.
- Visual fidelity must respect confirmed in-scope Blitzit evidence and approved Narro deviations, but **full live Blitzit audit / pixel-by-pixel source archaeology is not M12's purpose**.

## 5. Defect record and severity policy

One record per **distinct reproducible problem**; link duplicates and prior accepted findings. Minimum fields:

- Issue ID/title; candidate source SHA/app version and exact tested package.
- QA case ID and scenario; environment already in use (without changing Windows settings).
- Preconditions + repeatable **in-app** reproduction steps.
- Expected result (requirement/evidence reference) vs actual result, screenshots/short video/timecode.
- Reproducibility (always/intermittent/once) and effect on user data/workflows.
- Severity, priority, owner, state and affected release; fix commit/PR/CI when resolved.
- Exact retest result on corrected binary and neighboring regression cases.

**Severity:**
- **P0 / critical:** data loss/corruption, crash on core flow, dangerous action on wrong entity, irrecoverable tracked-time loss, security/privacy exposure encountered normally.
- **P1 / high:** primary user journey blocked, incorrect timer/scheduling/history, repeated missing save, major unusable UI with no normal workaround.
- **P2 / medium:** material non-blocking functional/UX/accessibility issue with a usable workaround.
- **P3 / low:** cosmetic/minor copy or isolated low-impact polish.

Severity is based on *user impact* and actual evidence, not number of clicks or speculative internal causes. For a non-reproducible anomaly, keep **UNCONFIRMED / INVESTIGATE**, not fabricated PASS or root cause.

## 6. Exit gates and evidence truth

M12 is **COMPLETE** only if:

1. The user specifically activated it; setup and data permissions were recorded and **only in-app actions** were used.
2. All applicable scenario families QA-01…QA-12 have step-level cases and honest PASS/FAIL/BLOCKED/NOT RUN/N/A records, with coverage rationale for anything skipped.
3. The smoke suite, core user journeys and meaningful focused exploratory coverage were **actually run on an identified packaged build**.
4. **No unresolved P0/P1** remains in the exercised scope; every P2 has a fix or an explicit documented acceptance decision with owner. P3 is logged and prioritized, not falsely closed. A blocked core scenario cannot silently satisfy completion.
5. Each fixed material defect has an exact-code CI/release validation result **plus an actual in-app retest**, with relevant regression and no new high-severity failure.
6. Final QA report records candidate source SHA/package hash, environment/test-data isolation, case ledger, bugs/dispositions, retest evidence, exclusions, risks and final **PASS / CONDITIONAL / FAIL / NOT RUN** release recommendation. **CONDITIONAL is not an unqualified PASS.**
7. Changes made under an activated M12 are reconciled with TODO/STATUS/HANDOFF and immutable work logs as required by the standard workflow, while preserving other agents' owned work and unrelated user changes.

**This optional QA stage adds no requirement** for multiple screens, unplugging cables, OS preferences, privileged instrumentation, simulated outages, native profile destruction, or historical Blitzit reverse engineering. It **does not** turn paused PA tests into PASS or replace the mandatory final comprehensive review. Unactivated M12 remains **DORMANT / NOT RUN / NOT A BLOCKER**.

## 7. Reporting and handoff

At activation, use an execution ledger with one row per test case:

`ID | build/SHA | preconditions | in-app steps | expected | actual | PASS/FAIL/BLOCKED/NOT RUN/N/A | evidence | bug link | retest build/result`

One current-session handoff identifies the **next unexecuted safe in-app scenario**, latest candidate identity, completed case outcomes, open bugs, user-data protections and exact next step. No test is repeated merely because another chat starts. Record meaningful, validated progress only; never claim background testing after the session ends.
