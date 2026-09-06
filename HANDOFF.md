# HANDOFF.md

This is the canonical zero-context continuation state for Narro. Start with `AI_START_HERE.md`, `AGENTS.md`, `ENGINEERING_QUALITY.md`, `AGENT_WORKFLOW.md`, this file, the active Milestone 4 section in `TODO.md`, relevant `STATUS.md`, `docs/BLITZIT_HISTORY_RISK_INDEX.md`, and the newest relevant immutable `work-log/*.md` entries.

## CURRENT MILESTONE

**Milestone 4 — Scheduling, recurrence, reminders, eligibility.**

- Milestones 1–3: COMPLETE / PASS.
- Milestone 4: ACTIVE / 13 of 15 top-level items validated.
- Milestones 5–10: NOT STARTED.

## ACTIVE WORK RECORD

- Active source slice: **physical due-reminder background-delivery failure fix**.
- Active branch: **`ai/m4-reminder-background-physical-fix`**.
- Branch base tracking `main`: **`170b622b712a6f931c94d3f16488e67f8145746b`**.
- Latest fully main-validated source/test baseline before this fix: **`438b28a36dfba58b35fa221557ff37d776453f23`**.
- Open implementation PR: **None yet**.
- Pending source CI/main validation: **this fix slice**.
- Do not begin Milestone 5.

Markdown-only descendants of the validated source/test SHA do not replace that source baseline.

## PHYSICAL WINDOWS FAILURE EVIDENCE

The user tested main CI #257 / artifact `9997215512` / source SHA `438b28a36dfba58b35fa221557ff37d776453f23` using the installed Windows build.

Observed **FAIL**:

- a persisted `Schedule Real Reminder Probe (+2 min)` produced no visible notification while Narro remained running;
- fully exiting Narro (Exit or Task Manager) and relaunching caused the overdue reminder notification to appear immediately;
- pressing the diagnostic probe button multiple times created multiple independent reminders, which then appeared one after another after restart;
- Narro also did not show the canonical Narro logo in the tray / Task Manager surfaces.

Interpretation:

- reminder persistence and startup catch-up are functioning because the same pending row is delivered immediately after restart;
- the live background reminder path is therefore defective and must be fixed before either open M4 reminder item can be checked;
- multiple button presses are currently multiple independently persisted diagnostic reminders, not evidence that one reminder is being submitted repeatedly; the acceptance harness should nevertheless prevent ambiguous multi-probe retests;
- the tray/executable icon report is separate evidence-backed Windows packaging/identity work and may be fixed in this same narrow physical-Windows reliability slice.

## USER-FACING PROGRESS

**`M-4/10 | 0/6 | 13/15`**

Current fix checkpoints:

1. mandatory startup + physical FAIL/root-cause reconstruction + branch start + regression plan — ACTIVE;
2. narrow reminder runtime fix + acceptance-probe repeat guard + Narro icon fix + deterministic tests + candidate diff review — PENDING;
3. exact PR-head Windows CI success including repository preflight, Tauri release and artifact — PENDING;
4. final exact-head semantic/diff review + no unresolved PR feedback — PENDING;
5. guarded merge with expected validated head — PENDING;
6. resulting-main Windows CI + durable tracking/work-log reconciliation + exact physical retest artifact/procedure — PENDING.

A failed CI run does not increment this counter.

## CURRENT ROOT-CAUSE BOUNDARY

Current implementation facts:

- `src-tauri/src/reminder_service.rs` opens one SQLite connection once, moves it into a raw background thread, dispatches immediately at startup, then reuses that same connection every 30 seconds forever;
- startup catch-up and the repeated cycle use the same due-query/notification code;
- `pending_due_reminders` uses fresh SELECT statements and strict resolved-instant comparison;
- the diagnostic probe writes through a separate configured SQLite connection;
- physical evidence shows a fresh process/background connection sees the pending row while the already-running loop does not produce the notification.

The fix should therefore first make every bounded reminder cycle use a fresh configured read/write SQLite connection, matching the known-good startup visibility boundary and removing long-lived connection state from reminder polling. Add a real file-backed regression where one cycle observes no reminder, a separate connection inserts a reminder, and the next cycle sees/submits it.

Do not broaden into a reminder architecture rewrite unless exact evidence disproves this path.

## ACCEPTANCE-HARNESS HARDENING

`src-tauri/src/reminder_acceptance.rs` currently creates a new diagnostic list/task/reminder for every click. Retest behavior must be unambiguous: repeated clicks must not accumulate multiple pending acceptance reminders. Any cleanup/replacement must be limited to the diagnostic acceptance fixture and preserve user data.

## WINDOWS IDENTITY / ICON EVIDENCE

Canonical owner-supplied Narro artwork is `assets/branding/narro-logo-master.png`. `assets/branding/README.md` explicitly requires Windows executable/taskbar/tray/installer derivatives to come from that master.

Current tray construction explicitly includes `src-tauri/icons/narro-tray-64.png`, while `tauri.conf.json` packages `src-tauri/icons/icon.ico` and other existing generated/scaffold derivatives. The user physically observed that tray and Task Manager do not show the expected Narro identity. Replace/re-generate the Windows icon inputs from the canonical master and keep the tray image explicitly Narro-owned.

## IMPORTANT INVARIANTS

- authoritative Rust/domain state and persistence-first mutations;
- reminder due evaluation remains Rust-owned and side-effect free until notification submission;
- `fired_at` is written only after the delivery path reports submission success;
- failed reminder submission stays pending and retryable;
- reminder background cadence remains bounded;
- no renderer becomes reminder authority;
- diagnostic acceptance code must never directly submit a notification;
- date-only scheduling/timezone semantics must not change;
- async `main` recreation remains intact;
- do not modify recurrence behavior or start M5 UI work.

## NEXT AGENT ACTION

1. Finish the evidence-backed root-cause review for the long-lived reminder connection.
2. Implement the smallest deterministic reminder-cycle fix and file-backed regression.
3. Make the acceptance probe single-pending/replacement-safe for retesting.
4. Correct Windows Narro icon inputs from the canonical branding master.
5. Review the exact candidate diff, then open one implementation PR and validate only its exact head on Windows CI.

## USER ACTION REQUIRED

**None now.** Do not ask for another physical test until a new exact main-validated Windows artifact exists.