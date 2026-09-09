# HANDOFF.md

This is the canonical zero-context continuation state for Narro. Start with `AI_START_HERE.md`, `AGENTS.md`, `ENGINEERING_QUALITY.md`, `AGENT_WORKFLOW.md`, this file, the active Milestone 5 section in `TODO.md`, relevant `STATUS.md`, `docs/UI_UX_SPEC.md`, `docs/PRODUCT_SPEC.md`, `docs/BEHAVIOR_MATRIX.md`, `docs/BLITZIT_HISTORY_RISK_INDEX.md`, and the newest relevant immutable `work-log/*.md` entries.

## CURRENT MILESTONE

**Milestone 5 — Design system and Main window product UI.**

- Milestones 1–4: COMPLETE / PASS.
- Milestone 5: ACTIVE / **17 of 28** top-level items validated.
- Milestones 6–10: NOT STARTED.

## CURRENT VALIDATED SOURCE BASELINE

Latest fully main-validated source/test SHA:

`2c4ec648490764cfdd5b0f793f9f68ed73657037`

Source tree:

`a1d562c3153fa6c0f169eaf9d587285e7141301d`

This is the squash-merged result of PR #89 — `M5: add EST and Time Taken editing`.

Validation evidence:

- final PR #89 head `b7e6a5d2dbf428888fc6fb2e05fc5fa53229d9ad`;
- Windows PR CI #341 / run `34368816102` / job `102524819883`: **SUCCESS**;
- PR Repository Preflight, visual capture/upload, Tauri release and diagnostic artifact upload: **PASS**;
- PR visual artifact `10111419066`, digest `sha256:4a62f2146b8624287fe3f228407c59743a8de732afa9560af85d2fd71f9ac76a`;
- PR diagnostic artifact `10111710336`, digest `sha256:1f0a454973be877b39b12f3f72a1e6cba35c6727333183f4468a4de26331af61`;
- final exact-head semantic/diff review: **PASS**;
- comments/reviews requiring resolution: **none**;
- expected-head guarded squash merge at `2026-09-09T15:43:09Z`;
- merged main source SHA `2c4ec648490764cfdd5b0f793f9f68ed73657037`;
- Windows main CI #342 / run `34372082553` / job `102535551447`: **SUCCESS**;
- main Repository Preflight, visual capture/upload, Tauri release and diagnostic artifact upload: **PASS**;
- main visual artifact `10112664337`, digest `sha256:4e4f8cd95f8a1c8261c0ca7f25b30536fba3fcabca5ac4091e140c88b4cd5a7d`;
- main diagnostic artifact `10112942834`, digest `sha256:4ec3c3d8635ddbe1c65abdeb46d7de2d0677b2fd6c13e7c6f0dd202cd7a7edc1`.

Markdown-only tracking descendants do not replace this validated source/test baseline. Detailed evidence: `work-log/2026-09-09-1858-chatgpt-m5-task-metrics.md`.

## LATEST COMPLETED SLICE

**M5 Main UI — EST and Time Taken display/edit states.**

Validated capabilities:

- stale-safe expected-list/value persistence for non-live EST and Time Taken;
- active live focus tasks cannot bypass the authoritative timer runtime through non-live commands;
- live EST and Time Taken edits require exact active-task binding in `Paused` or `OvertimePaused`;
- live EST atomically commits task metadata and durable timer checkpoint before runtime publication;
- CountUp/EST countdown rebasing, including EST below elapsed -> `TimeUp`, preserves accumulated tracked work;
- Pomodoro timer precedence is preserved while EST metadata changes;
- live Time Taken rebases the validated manual adjustment while raw session/runtime accounting stays monotonic through resume/recovery/Done;
- stale task/current-value guards prevent renderer races and stale overwrites;
- individual real List Boards expose metric editing; aggregate All Lists remains read-only;
- live title editing remains unavailable from the List Board;
- metric drafts use explicit `H:MM:SS`; EST may be blank to clear and Time Taken may not;
- Save/Cancel use the fixed `4.25rem` reserved action slot and captured light/dark geometry proves no title/card reflow;
- action/title/metric controls are isolated from drag initiation;
- persistence-first mutation and saved-but-refresh-failed handling remain authoritative;
- deterministic Rust/frontend/static/Windows visual regression coverage is in preflight/CI.

## USER-FACING PROGRESS

**`M-5/10 | 5/5 | 17/28`**

The completed EST/Time Taken slice used five checkpoints, all complete:

1. mandatory inspection + narrow EST/Time Taken mutation/UX contract — **COMPLETE**;
2. authoritative persistence/runtime/frontend implementation + deterministic Rust/static/visual coverage + semantic/diff review — **COMPLETE**;
3. exact PR-head Windows CI — **COMPLETE**;
4. final exact-head review + expected-head merge — **COMPLETE**;
5. resulting-main Windows CI + tracking reconciliation — **COMPLETE**.

Do not reset this small-slice counter until the next implementation slice is actually begun and its checkpoint plan is recorded in the repository.

## COMPLETED CAPABILITIES / INVARIANTS THAT MUST NOT REGRESS

- authoritative Rust/domain/persistence state and persistence-first mutation semantics remain authoritative;
- stable task identities and one-open-session invariant must not regress;
- renderer-independent timer/session accounting must not regress;
- tracked time must never reset, disappear, double-count or snap back after pause/resume/recovery/Done;
- EST/title metadata edits must not rewrite or lose Time Taken/session state;
- paused manual Time Taken edits remain coupled to the authoritative runtime/session rebase path;
- a stale renderer cannot overwrite newer EST/Time Taken or retarget a live edit after task switch;
- a committed mutation plus failed renderer refresh/broadcast must not be reported as authoritative mutation failure;
- All Lists remains an aggregate read projection;
- scheduling preserves stable task identity and validated effective planning-lane semantics;
- date-only schedules remain distinct from local date-times; Monday week, timezone and DST semantics remain authoritative;
- recurrence materialization remains deterministic/idempotent and preserves validated replace/detach behavior;
- task-card hover/focus/edit geometry uses reserved/overlay slots and may not move sibling content/hit targets;
- notes never auto-launch URLs;
- excluded account/trial/upgrade/profile/AI/integration controls remain absent;
- diagnostics remain gated behind `?diagnostics=1`.

## NEXT ORDERED SLICE

**M5 Main UI — Scheduling UI and recurrence editor.**

This slice has not yet begun after the task-metrics reconciliation. When starting it, create/resume one coherent feature branch from the latest `main` tracking tip and record a narrow five-checkpoint plan before resetting the small-slice counter.

Required inspection before implementation:

- authoritative Milestone 4 scheduling/domain/persistence boundaries for date-only versus local date-time schedules, shortcuts, eligibility and effective planning lanes;
- recurrence rule model, parent/child materialization, replace-existing and detachment semantics;
- current `ListBoard` / `TaskCard` scheduling display and mutation boundaries;
- relevant scheduling/recurrence sections of `docs/PRODUCT_SPEC.md`, `docs/UI_UX_SPEC.md` and `docs/BEHAVIOR_MATRIX.md`;
- `docs/BLITZIT_HISTORY_RISK_INDEX.md`, especially wrong-day/timezone and duplicate identity failure families.

The implementation must project authoritative scheduling/recurrence behavior rather than recreate rules in React. Preserve persistence-first success, stable task identity, date-only calendar semantics, Windows local timezone/locale behavior, recurrence idempotency and existing board no-layout-shift behavior.

Do not absorb Subtasks UI, notes, destructive flows, list settings, search, Settings, Reports/session editing, Focus Panel/Floating Timer product UI, or later milestones.

## NEXT AGENT ACTION

Begin the ordered `Scheduling UI and recurrence editor` slice from the latest `main` tracking tip while treating `2c4ec648490764cfdd5b0f793f9f68ed73657037` as the validated source/test baseline. Create one coherent feature branch, inspect the authoritative M4 scheduling/recurrence boundaries and relevant UI/product/risk evidence, write a five-checkpoint slice plan into `HANDOFF.md`, then implement only the evidence-backed scheduling/recurrence UI scope.

## USER ACTION REQUIRED

**None.**

## BLOCKERS / NOT RUN

- No product/user blocker is known.
- Local checkout/toolchain validation in this connector-only environment: **NOT RUN**.
- Windows PR CI #341 and resulting-main CI #342 are the authoritative reproducible validation evidence for the completed task-metrics slice.
