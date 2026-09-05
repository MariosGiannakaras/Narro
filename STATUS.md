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

Latest fully main-validated **source** baseline:

`2135e40fe6953cf730d73edd184378510e2057aa`

This resulting-main SHA contains PR #40 recurrence execution/materialization plus the semantics-neutral PR #41 main-CI revalidation/tracking repair.

### Recurrence PR validation

PR #40 exact validated head:

`7217dbed78f930411fe5c360796729ee3e5b8d4b`

- Windows PR CI #212 / run `33979784683` / job `101342828953`: **SUCCESS**;
- repository preflight: **PASS**;
- Tauri release build: **PASS**;
- artifact upload: **PASS**;
- artifact ID `9973579168`;
- digest `sha256:1f75ebec83c7c0bf04f47e28acad627e727fab42872ff180aeef862ce6babc38`.

PR #40 squash merge: `ca0d45a22ee61a2e5cd3c308d873ff1b5a42f20a`.

The normal main push CI did not start for that merge because the squash commit message inherited a historical CI-skip token from branch history. This was treated as missing validation evidence, not as a pass.

PR #41 supplied a semantics-neutral revalidation path. Exact validated PR #41 head:

`0331173297647506d55da6adae50e5096c8d0173`

- Windows PR CI #214 / run `33981665186` / job `101347875865`: **SUCCESS**;
- repository preflight: **PASS**;
- Tauri release build: **PASS**;
- artifact upload: **PASS**;
- artifact ID `9974074797`;
- digest `sha256:d3366746cd3338ec94896fb04c236413ad452ccf97833313f2f2fecaeacc574e`.

### Main validation

PR #41 guarded squash merge produced source SHA `2135e40fe6953cf730d73edd184378510e2057aa` with a clean commit message containing no CI-skip token.

- Windows main CI #215 / run `33982239289` / job `101349403398`: **SUCCESS** on exact source SHA `2135e40fe6953cf730d73edd184378510e2057aa`;
- repository preflight: **PASS**;
- Tauri release build: **PASS**;
- artifact upload: **PASS**;
- artifact ID `9974264032`;
- digest `sha256:b88ffabf27cd8d736ea17c2a78739f78b28b537036f97f49ed78e3d4ce4f3e67`.

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

M2 recurrence support is metadata persistence only; M4 now owns recurrence execution/materialization behavior.

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

Milestone 4 remains open. Three coherent source slices are now validated and reconciled.

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

Merge: `77625cfac01ad133a4c5c188a9613b43d294460c`.

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

Evidence: `work-log/2026-09-05-chatgpt-m4-timezone-dst-reconciliation.md`.

### PR #40 / #41 — recurrence execution/materialization core

Fully validated resulting source baseline: `2135e40fe6953cf730d73edd184378510e2057aa`.

Validated recurrence behavior:

- deterministic day/week/month/year interval occurrence evaluation;
- weekly/monthly weekday masks and monthly calendar-date rules;
- Monday-through-Sunday materialization window;
- recurring parent normalization to unscheduled Backlog;
- new stable child task identities with parent linkage and copied title/list/EST fields;
- date-only and timed child schedule semantics;
- strict IANA/DST rejection for ambiguous/nonexistent timed occurrences;
- transactional child + `recurrence_occurrences` insertion under SQLite `IMMEDIATE` transaction;
- durable duplicate prevention through recurrence occurrence identity;
- repeated same-week materialization is idempotent;
- inactive rules are no-ops;
- failed timed materialization rolls back all parent/child/occurrence mutations;
- monotonic `last_materialized_local_date` checkpoint.

Evidence: `work-log/2026-09-05-chatgpt-m4-recurrence-materialization-reconciliation.md`.

### M4 progress boundary

The recurrence execution/materialization core slice is:

**Μικρή τρέχουσα υλοποίηση: 6/6 ολοκληρωμένες.**

No new M4 source slice is active after this reconciliation. The next source slice is **NOT STARTED** and must receive a new explicit small-slice denominator when source work begins.

Still open in M4:

- one-off local reminders;
- Replace Existing Tasks execution;
- recurrence detachment semantics;
- startup/resume/date-change orchestration and missed-day catch-up;
- tray/background due-reminder processing;
- Windows locale/system 12/24-hour visible formatting;
- remaining combined M4 regression matrix, including repeated startup/missed days;
- explicit scheduled-lane movement anti-duplication regression at the M4 behavior layer.

The broad TODO item covering DST + Monday/week boundaries + timezone changes + repeated startup + missed days + future eligibility + weekend/date-only behavior remains open. Existing slices validate the DST/week/timezone/future-eligibility/weekend/date-only and same-week recurrence-idempotency subsets, but repeated-startup/missed-day orchestration does not yet exist.

## Later milestone status

Milestones 5–10 are **NOT STARTED**.

This remains true even where prerequisite capability already exists. In particular:

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
- deterministic/idempotent recurrence;
- recurrence occurrence identity as the durable duplicate-prevention boundary;
- explicit link activation;
- dynamic monitor topology recovery;
- minimal `focusSurface` dependency/runtime footprint;
- async `main` recreation path that avoids the historical Windows WebView2 deadlock.

## Multi-agent continuation rule

Repository state must be sufficient for another capable coding AI without prior chat context. Use `AI_START_HERE.md`, `AGENTS.md`, `ENGINEERING_QUALITY.md`, `AGENT_WORKFLOW.md`, `HANDOFF.md`, `TODO.md`, `docs/BLITZIT_HISTORY_RISK_INDEX.md`, `work-log/*.md`, and legacy `WORK_LOG.md` according to their documented roles.
