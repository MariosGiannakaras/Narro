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
- Candidate source head before PR creation: **`6dcacbe57bcf8f74d82e6205c68c705b89fbc161`** plus this HANDOFF-only tracking commit.
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
- the live background reminder path is defective and must be fixed before either open M4 reminder item can be checked;
- multiple button presses were multiple independently persisted diagnostic reminders, not evidence that one reminder was submitted repeatedly;
- the tray/executable icon report is separate evidence-backed Windows packaging/identity work included in this narrow physical-Windows reliability slice.

## USER-FACING PROGRESS

**`M-4/10 | 2/6 | 13/15`**

Current fix checkpoints:

1. mandatory startup + physical FAIL/root-cause reconstruction + branch start + regression plan — COMPLETE;
2. narrow reminder runtime fix + acceptance-probe repeat guard + Narro icon fix + deterministic tests + candidate diff review — COMPLETE / CANDIDATE READY;
3. exact PR-head Windows CI success including repository preflight, Tauri release and artifact — PENDING;
4. final exact-head semantic/diff review + no unresolved PR feedback — PENDING;
5. guarded merge with expected validated head — PENDING;
6. resulting-main Windows CI + durable tracking/work-log reconciliation + exact physical retest artifact/procedure — PENDING.

A failed CI run does not increment this counter.

## CANDIDATE FIX CONTRACT

### Reminder background cycle

`src-tauri/src/reminder_service.rs` no longer keeps one SQLite connection alive for the entire polling thread. Instead:

- startup validates that the existing database can be opened/configured read-write;
- each immediate/30-second delivery cycle opens a fresh configured read/write connection;
- due selection, active task/list recheck, notification submission and `fired_at` acknowledgment remain otherwise unchanged;
- a file-backed regression runs an empty cycle, inserts a due reminder through a separate SQLite connection, then proves the next cycle sees, submits and acknowledges that reminder.

This matches the known-good fresh-start visibility boundary exposed by the physical failure without changing schema, cadence, scheduling semantics or renderer authority.

### Acceptance-harness repeat guard

`src-tauri/src/reminder_acceptance.rs` now rejects another probe while a prior diagnostic acceptance reminder remains pending. It identifies only the reserved diagnostic list/task titles, returns the pending reminder ID in the error, and writes no additional list/task/reminder rows. A new probe is allowed only after the prior reminder is terminal. Tests cover both boundaries.

### Windows Narro identity

The owner-supplied canonical artwork remains `assets/branding/narro-logo-master.png`.

- `package.json` now runs `prepare:icons` automatically before frontend builds;
- `prepare:icons` invokes the locked Tauri CLI icon generator on the canonical master, regenerating the desktop icon set including Windows `icon.ico`;
- `scripts/sync-tray-icon.mjs` copies the generated `64x64.png` to the existing runtime tray asset `src-tauri/icons/narro-tray-64.png` before Rust/Tauri compilation;
- therefore executable/Task Manager, installer bundle and tray runtime all consume derivatives generated from the same canonical Narro master for authoritative CI/release builds.

Tauri CLI is locked at `2.11.4`; 64px generation is supported in the current v2 icon command.

## CANDIDATE DIFF REVIEW

Compared with base `170b622b712a6f931c94d3f16488e67f8145746b`, the candidate changes only:

- `src-tauri/src/reminder_service.rs`;
- `src-tauri/src/reminder_acceptance.rs`;
- `package.json`;
- new `scripts/sync-tray-icon.mjs`;
- this `HANDOFF.md` tracking state.

No schema, migration, recurrence, scheduling-domain, timer, notification transport or product UI file changes are present. Local project preflight is not available in the connector-only environment; exact-head Windows CI is authoritative.

## IMPORTANT INVARIANTS

- authoritative Rust/domain state and persistence-first mutations;
- reminder due evaluation remains Rust-owned and side-effect free until notification submission;
- `fired_at` is written only after the delivery path reports submission success;
- failed reminder submission stays pending and retryable;
- reminder background cadence remains bounded at 30 seconds;
- no renderer becomes reminder authority;
- diagnostic acceptance code never directly submits a notification;
- date-only scheduling/timezone semantics do not change;
- async `main` recreation remains intact;
- do not modify recurrence behavior or start M5 UI work.

## NEXT AGENT ACTION

1. Open one implementation PR from `ai/m4-reminder-background-physical-fix`.
2. Record the exact PR head SHA and accept Windows CI only for that exact head.
3. On failure inspect the exact step/log and change only evidence-backed problems.
4. On success perform final exact-head semantic/diff review, check comments/reviews/threads, guarded-merge the validated expected head, then validate resulting main on Windows CI.
5. Reconcile `STATUS.md`, `HANDOFF.md` and a new immutable work log. `TODO.md` remains 13/15 until the new installed build physically passes.

## USER ACTION REQUIRED

**None now.** Do not ask for another physical test until a new exact main-validated Windows artifact exists.