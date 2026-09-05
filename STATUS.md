# STATUS.md

Last updated: 2026-09-05

For zero-context AI continuation, start with `AI_START_HERE.md` and `HANDOFF.md`.

## Current phase

**Milestone 4 — Scheduling, recurrence, reminders, eligibility.**

Validated top-level progress:

- Milestone 1 / Gate A: **PASS**;
- Milestone 2 / Gate B: **PASS**;
- Milestone 3 / Gate C: **PASS**;
- Milestone 4: **ACTIVE / PARTIALLY IMPLEMENTED**;
- Milestones 5–10: **NOT STARTED**.

**Γενική υλοποίηση: 3/10 milestones ολοκληρωμένα.**

Existing prerequisite/foundation code for later milestones does not mean those milestones have started. Examples include M1 diagnostic window code, notification capability, preference fields, schema columns, report-facing persistence fields, and other reusable infrastructure. A later milestone starts only when its ordered product implementation slice explicitly begins.

The current architecture remains Tauri 2 + React/TypeScript + Rust + SQLite on Windows 10/11 x64, normally with two persistent webviews only:

- `main`;
- `focusSurface`, reused for Focus Panel and Floating Timer.

Do not begin polished Milestone 5+ product UI while Milestone 4 remains open unless the user explicitly changes roadmap order.

## Current validated source baseline

Latest validated **source** baseline:

`77625cfac01ad133a4c5c188a9613b43d294460c`

This is the squash merge of PR #37, **M4: harden timezone and DST scheduling**.

Exact validated PR head:

`4ef9e89ccf68989716444d45a833c6e4436723f6`

### PR #37 validation

- Windows PR CI #207 / run `33976481855`: **SUCCESS**;
- repository preflight: **PASS**;
- Tauri release build: **PASS**;
- artifact upload: **PASS**;
- artifact ID `9972643028`;
- digest `sha256:9193752fe1a40d4c28d3ff186b37eaf4b37ba68f03f2cf6bbc69b0ce4ac59595`.

### Main validation

- Windows main CI #208 / run `33977191609` / job `101335861563`: **SUCCESS** on exact source SHA `77625cfac01ad133a4c5c188a9613b43d294460c`;
- repository preflight: **PASS**;
- Tauri release build: **PASS**;
- artifact upload: **PASS**;
- artifact ID `9972845872`;
- digest `sha256:dc554575ec03b5a7c793f5163a8451173cbcf6713070ed0615ccfada0ce564c0`.

Markdown-only reconciliation commits newer than this SHA do not replace the validated source baseline.

## Milestone 1 — Gate A complete

**Result: PASS / current Tauri 2 + WebView2 architecture retained.**

Physically validated on real Windows includes:

- authoritative Rust state surviving `main` destroy/background mutation/recreate;
- async `main` recreation without the historical WebView2 deadlock;
- one reused `focusSurface` switching Focus Panel <-> Floating Timer;
- Floating Timer always-on-top / skip-taskbar behavior;
- selected-monitor left/right positioning;
- display disconnect/reconnect recovery;
- tray/background recovery and explicit Quit;
- global shortcut behavior;
- visible local notification delivery;
- autostart registration plus actual launch after a real Windows restart/sign-in;
- three stable floating-only performance measurements with near-zero idle CPU and no unexplained process churn.

Key immutable evidence:

- `work-log/2026-09-03-chatgpt-m1-physical-capability-results.md`;
- `work-log/2026-09-03-chatgpt-autostart-restart-validation.md`;
- `work-log/2026-09-03-chatgpt-floating-performance-results.md`.

Merged authoritative shortcut implementation is PR #4. Historical PR #2 and PR #3 are superseded attempts and are not active work.

The native Win32/WinUI overlay remains only a measured fallback if later real Floating Timer UI materially regresses WebView2 resource use or exposes a concrete blocker.

## Milestone 2 — Gate B complete

**Result: PASS / domain and persistence foundation validated.**

Milestone 2 is validated through PR #21. Durable coverage includes:

- stable UUID identities and repeatable SQLite migrations;
- list/task/subtask CRUD, ordering, archive/restore/permanent delete;
- task planning moves without identity mutation;
- duplication as one independent new task identity;
- typed EST, Time Taken and schedule metadata;
- explicit date-only versus local-datetime schedule shapes;
- recurrence metadata persistence and stable parent linkage;
- constrained versioned rich notes;
- typed preferences/defaults;
- explicit permanent-delete report exclusion;
- persistence-first mutation visibility;
- deterministic fixtures and repeated scheduled-lane move/reorder identity corruption regressions.

Completion evidence:

- `work-log/2026-09-03-chatgpt-m2-completion.md`.

M2 recurrence support is **metadata persistence only**. It does not mean M4 recurrence materialization has started.

## Milestone 3 — Gate C complete

**Result: PASS / timer-session correctness engine validated.**

Final validated M3 source baseline before M4: `5eaf7f0eba1770112d41744377ea134ad5d41e33` (PR #35).

Validated capabilities across PRs #23–#35 include:

- authoritative CountUp / EST / Pomodoro timer state machine;
- explicit Running / Paused / Break / Time's Up / overtime semantics;
- exact work accounting independent of renderer refresh cadence;
- task Done / Skip / Switch lifecycle;
- durable work/break session rows with at most one unfinished focus session;
- persistence-first timer runtime and atomic Work<->Break/task-switch row replacement;
- durable runtime checkpoint/recovery without counting process downtime;
- atomic task completion + final timer/session persistence;
- paused live Time Taken rebasing without rewriting historical session durations;
- typed revisioned timer/session events consumed by both webviews;
- durable once-only Pomodoro boundary decisions before notification side effects;
- large-elapsed/overflow safety;
- configurable Windows sleep/resume accounting with persisted effective policy.

Final M3 evidence:

- PR #35 exact head `a4582f5ea76737c8a5e01cb4e1c2cfb87a826159`;
- PR CI #192 / run `33964109578`: **SUCCESS**;
- merge `5eaf7f0eba1770112d41744377ea134ad5d41e33`;
- main CI #196 / run `33964738776`: **SUCCESS**.

PR #26 is historical/unmerged and superseded by the later validated recovery implementation.

## Milestone 4 — active validated state

Milestone 4 remains open. Two coherent source slices are validated.

### PR #36 — scheduling / eligibility core

Merge: `4a39d94545a361736968b455a20a3889ee5c9a1c`.

Validated:

- Monday-starting week classification;
- effective scheduled `Today` / `This Week` / `Backlog` projection without rewriting `manual_lane`;
- official Today / Later today (+2h) / Tomorrow / Next week (+7d) / custom-date shortcuts;
- date-only calendar semantics;
- future-timed Today tasks visible in Today but focus-ineligible before due time;
- fail-closed corrupt schedule combinations;
- stable task identity across schedule changes and clearing a schedule.

Evidence: `work-log/2026-09-05-1618-chatgpt-m4-scheduling-core.md`.

### PR #37 — timezone / DST correctness

Merge/current source baseline: `77625cfac01ad133a4c5c188a9613b43d294460c`.

Validated:

- IANA timezone resolution through `jiff`;
- persisted timed timezone validation against the timezone database;
- stable-instant resolution for timed schedules;
- strict rejection of spring-forward nonexistent local times;
- strict rejection of fall-back ambiguous local times;
- timezone re-projection of timed schedule instants;
- date-only schedules remain entirely outside UTC/timezone conversion;
- persistence rejects invalid timezone/DST local-datetime shapes;
- unit/integration regressions for invalid zones, DST gaps/folds, timezone changes and date-only stability.

Final PR #37 source/test files:

- `src-tauri/Cargo.toml`;
- `src-tauri/Cargo.lock`;
- `src-tauri/src/persistence/task_metadata.rs`;
- `src-tauri/src/scheduling/mod.rs`;
- `src-tauri/tests/scheduling_core.rs`.

The temporary branch-only lockfile workflow was removed before the validated head and is absent from `main`.

Evidence: `work-log/2026-09-05-chatgpt-m4-timezone-dst-reconciliation.md`.

### M4 progress boundary

The completed timezone/DST slice is:

**Μικρή τρέχουσα υλοποίηση: 6/6 ολοκληρωμένες.**

The next M4 source slice is **NOT STARTED**. Do not reset the small counter until actual new source work begins.

Still open in M4:

- one-off local reminders;
- recurrence presets and custom interval/unit/weekday rules;
- recurring parent in Backlog and Monday-of-due-week child materialization;
- Replace Existing Tasks execution;
- recurrence detachment semantics;
- idempotent materialization on startup/resume/date change and missed-day catch-up;
- tray/background due-reminder processing;
- Windows locale/system 12/24-hour visible formatting;
- remaining combined M4 regression matrix;
- explicit scheduled-lane movement anti-duplication regression at the M4 behavior layer.

`src-tauri/src/recurrence/mod.rs` remains only a capability-boundary comment/stub. Recurrence occurrence materialization has **not started**.

The broad TODO item covering DST + Monday/week boundaries + timezone changes + repeated startup + missed days + future eligibility + weekend/date-only behavior remains open. PR #37 validates the timezone/DST/date-only subset, but recurrence/repeated-startup/missed-day behavior does not yet exist and must not be implied complete.

## Later milestone status

Milestones 5–10 are **NOT STARTED**.

This is true even where prerequisite capability already exists. In particular:

- M1 diagnostic `main`/`focusSurface` UI is not Milestone 5/6/7 product UI;
- global shortcut proof is not Milestone 8 Preferences implementation;
- persistence fields/session data are not Milestone 9 Reports UI;
- M1 lifecycle/package diagnostics are not Milestone 10 release-candidate validation.

Do not count or describe these later milestones as started until their ordered implementation work explicitly begins after prerequisite milestones close.

## Historical/reliability guidance

Use `docs/BLITZIT_HISTORY_RISK_INDEX.md` together with `docs/SOURCE_AUDIT.md` for source-product risk context.

High-priority reliability classes already reflected in Narro's roadmap/tests include:

- tracked-time loss / completion-to-`00:00`;
- pause/resume and sleep lifecycle divergence;
- task identity/reorder duplication corruption;
- scheduling wrong-day/timezone/DST failures;
- off-screen/multi-monitor window recovery;
- centralized backend availability failures, intentionally avoided by Narro's local-only architecture.

Do not infer that an old Blitzit fix permanently closes a failure class if later evidence reports recurrence.

## Durable scope

Narro is a **personal, local-only Windows desktop productivity application** reproducing the core planning -> focus workflow while prioritizing reliability.

Excluded unless the user explicitly changes scope:

- accounts/auth;
- cloud backend/sync;
- subscriptions/licensing/payments;
- off-device telemetry;
- collaboration/multi-user;
- remote integrations/webhooks/MCP;
- AI/Blitzy;
- remote voice transcription;
- non-Windows targets.

Allowed local equivalents include SQLite, tray/background lifecycle, Windows notifications, autostart, local assets/files and local report exports.

## Durable correctness decisions

Future agents must preserve:

- authoritative Rust/domain runtime state;
- persistence-first mutations;
- stable task identities;
- one-open-session invariant;
- renderer-independent timer accounting;
- date-only calendar semantics;
- Monday week boundaries;
- explicit timezone resolution for timed schedules;
- fail-closed DST ambiguity/nonexistence handling until a different policy is explicitly validated;
- deterministic/idempotent recurrence once implemented;
- explicit link activation;
- dynamic monitor topology recovery;
- minimal `focusSurface` dependency/runtime footprint;
- async `main` recreation path that avoids the historical Windows WebView2 deadlock.

## Multi-agent continuation rule

Repository state must be sufficient for another capable coding AI without prior chat context. Use `AI_START_HERE.md`, `AGENTS.md`, `ENGINEERING_QUALITY.md`, `AGENT_WORKFLOW.md`, `HANDOFF.md`, `TODO.md`, `docs/BLITZIT_HISTORY_RISK_INDEX.md`, `work-log/*.md`, and legacy `WORK_LOG.md` according to their documented roles.
