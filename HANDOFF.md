# HANDOFF.md

This is the **current operational continuation state** for Narro. Any zero-context AI must start with `AI_START_HERE.md`, then read this file, `ENGINEERING_QUALITY.md`, the active section in `TODO.md`, `STATUS.md`, and the newest relevant `work-log/*.md` entries.

Do not require the user to reconstruct prior chat context or provide a custom continuation prompt.

## CURRENT MILESTONE

**Milestone 2 — Domain model, identity invariants, and local persistence**

Milestone 1 Gate A is sufficiently validated and no longer blocks implementation. Continue with the current Tauri 2 + WebView2 architecture and the two-window composition (`main` + reused `focusSurface`).

Current source truth is on `main`. Use forward history only; never amend/rebase/force-push published `main` during normal handoff work.

## MILESTONE 1 GATE A RESULT

**PASS — proceed with current Tauri 2 + WebView2 architecture.**

Physical Windows PASS evidence now includes:

- authoritative Rust state/event propagation both directions;
- hide/show/destroy/recreate of `main`;
- exact Rust state survives background mutation while `main` is absent and appears correctly after recreate;
- async `main` recreation without the historical WebView2 deadlock;
- Panel -> Timer -> Panel on the same `focusSurface`;
- Timer always-on-top and skip-taskbar behavior;
- only `main` + `focusSurface` as persistent webviews;
- tray/background recovery and explicit Quit;
- selected-monitor Focus Panel left/right placement;
- display disconnect/reconnect recovery without app restart;
- global shortcut physical behavior;
- visible local Windows notification from installed Narro;
- local autostart enable/disable registration visible in Windows Task Manager Startup apps;
- three valid floating-only steady-state performance runs with `main` destroyed.

Detailed latest physical evidence: `work-log/2026-09-03-chatgpt-m1-physical-capability-results.md`.

## AUTOSTART RESIDUAL — DO NOT BLOCK M2

Actual Narro process launch on a genuinely new Windows sign-in session remains **NOT RUN**.

The user intentionally does not want to reboot or terminate the Windows session solely for this validation. `Win+L` + PIN is lock/unlock, not sign-out/sign-in, and therefore is not valid fresh-login evidence.

What is proven:

- Narro enable/disable autostart commands work locally;
- post-operation state verification works;
- enabled Narro appears in Windows Task Manager Startup apps;
- official Tauri autostart implementation passed Windows CI.

Do not claim actual next-login launch was physically observed. Revisit this opportunistically in Milestone 10 restart/release validation rather than asking the user to reboot/sign out now.

## FLOATING-ONLY PERFORMANCE BASELINE

Three physical installed-build runs are committed under:

- `performance/m1-floating/20260903-074630Z/`;
- `performance/m1-floating/20260903-074840Z/`;
- `performance/m1-floating/20260903-075029Z/`.

All three had zero process churn and `steadyStateValid: true`.

Median baseline:

- CPU: about **0.026% of one logical core**;
- CPU total capacity: about **0.0022%**;
- aggregate process-tree working set: about **396.21 MiB**;
- aggregate process-tree private bytes: about **325.40 MiB**.

Memory is WebView2-dominated; idle CPU is effectively zero. The final run plateaued rather than showing continuing growth. Current evidence does not justify a native Win32/WinUI overlay rewrite.

Re-measure later after the real Floating Timer UI exists, especially collapsed/expanded/timer-running states and repeated Focus↔Floating/Notes/subtask stress transitions.

## IMPORTANT HISTORICAL CONSTRAINT

The original synchronous `WebviewWindowBuilder::build()` recreation path deadlocked on the real Windows machine. Narro uses the async creation path now and that path passed physical validation. Do not regress it without new evidence.

## NEXT AGENT ACTION — MILESTONE 2

Start from the first unchecked Milestone 2 task in `TODO.md` and implement the domain/storage foundation before product UI work:

1. define durable IDs and SQLite schema for lists, tasks, subtasks, notes, recurrence/reminders, sessions, preferences, and archived entities;
2. preserve authoritative Rust/domain ownership and stable identities;
3. use migrations rather than ad-hoc schema mutation;
4. add deterministic fixtures and regression tests as schema/CRUD behavior lands;
5. make successful persistence precede UI-visible success for create/edit/move operations;
6. keep the existing M1 diagnostic UI temporary and do not polish it;
7. validate source changes through the existing Windows CI gate when local Rust/Windows execution is unavailable.

Do not skip directly to polished Main/Focus/Floating UI. Milestones 2–4 establish correctness-critical data, timer, and scheduling behavior first.

## DURABLE REFERENCES

- `STATUS.md` — evidence/state summary;
- `TODO.md` — ordered milestone work;
- `AGENTS.md` / `ENGINEERING_QUALITY.md` — engineering invariants;
- `docs/ARCHITECTURE.md` — architecture model;
- `docs/PRODUCT_SPEC.md` — product/domain behavior;
- `docs/M1_FLOATING_PERFORMANCE_MEASUREMENT.md` — baseline measurement protocol;
- `work-log/2026-09-03-chatgpt-floating-performance-results.md` — performance decision;
- `work-log/2026-09-03-chatgpt-m1-physical-capability-results.md` — final physical M1 capability evidence.
