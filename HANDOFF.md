# HANDOFF.md

This is the canonical zero-context continuation state for Narro. Start with `AI_START_HERE.md`, `AGENTS.md`, `ENGINEERING_QUALITY.md`, `AGENT_WORKFLOW.md`, this file, the active Milestone 5 section in `TODO.md`, relevant `STATUS.md`, `docs/PRODUCT_SPEC.md`, `docs/UI_UX_SPEC.md`, `docs/BEHAVIOR_MATRIX.md`, `docs/BLITZIT_HISTORY_RISK_INDEX.md` when source-product reliability risks are relevant, and the newest relevant immutable `work-log/*.md` entries.

## CURRENT MILESTONE

**Milestone 5 — Design system and Main window product UI.**

- Milestones 1–4: COMPLETE / PASS.
- Milestone 5: ACTIVE / **19 of 28** top-level items validated.
- Milestones 6–10: NOT STARTED.

## CURRENT VALIDATED SOURCE BASELINE

Latest fully main-validated source/test SHA:

`120bf882b67c54d832a1116f8fa024fe2727e155`

Source tree:

`6c898857c43a1f25d147d4af1eec6d3f4d08a1a2`

This is the expected-head guarded merge of PR #91 — `M5: add Subtasks UI`.

Markdown-only tracking descendants do **not** replace this validated source/test baseline.

## LATEST COMPLETED IMPLEMENTATION

**M5 Main UI — Subtasks UI.**

Validated capabilities:

- authoritative completed/total subtask counts project into List Board task cards without renderer polling;
- expanded rows load from task-scoped Rust/SQLite state and preserve stable `SubtaskId` / parent `TaskId` identity;
- active individual-list tasks support persisted add, inline title edit, complete/uncomplete, move up/down and delete;
- aggregate All Lists and completed Done tasks expose subtasks read-only;
- active live parent tasks can manage subtasks while parent title/metric/schedule restrictions remain independent;
- renderer mutations bind expected parent/list state and use immediate SQLite transactions;
- title/completion/delete/reorder writes carry expected-state stale guards;
- reorder preserves an exact duplicate-free subtask identity set and validates the expected current order before rewriting ranks;
- delete validates expected `updated_at` and compacts ranks in the same transaction;
- expanded subtask state locks conflicting parent task/list mutations and subtask controls cannot initiate parent drag;
- successful mutations refresh both authoritative subtask rows and board progress;
- committed-but-refresh-failed subtask mutations are reported as saved and block unsafe follow-up writes until reload;
- a rendered-parent identity gate rejects mismatched stale rows before mutation callbacks;
- fixed task title/action geometry remains intact in expanded/edit/read-only states;
- deterministic Rust/static coverage and light/dark production visual fixtures are wired into preflight/Windows CI.

Detailed immutable evidence:

`work-log/2026-09-11-0127-chatgpt-m5-subtasks-ui.md`

## LATEST PR / CI EVIDENCE

### PR #91 exact-head validation

Final validated PR head:

`929c5042a095dfcedc1343ff680080fb2d229cbe`

Windows PR CI #359:

- run `34511982661`;
- job `102988191474`;
- conclusion: **SUCCESS**;
- Repository Preflight: **PASS**;
- Capture Visual Regression Fixtures: **PASS**;
- Upload Visual Regression Artifact: **PASS**;
- Tauri Release: **PASS**;
- Upload Diagnostic Harness Artifact: **PASS**;
- visual artifact `10166459738`, digest `sha256:176f7bf17badd1efd8aafeaaa09110ce44568ed70588db064e38abc412244ef8`;
- diagnostic artifact `10166706435`, digest `sha256:c52c6c764b29e3147de21c5e733948e985ca5de5aa091ebb7c7eb9cdec709a4c`;
- PR comments: none;
- submitted reviews: none;
- inline review threads: none;
- final exact-head semantic/diff review: **PASS**.

Earlier Windows CI #355 / run `34511182147` failed only at `cargo fmt --check` after all frontend/static checks and the production build passed. The exact formatter output was applied to three Rust files and revalidated by #359; the failed run did not increment progress.

PR #91 merged with:

`expected_head_sha=929c5042a095dfcedc1343ff680080fb2d229cbe`

Resulting main source SHA:

`120bf882b67c54d832a1116f8fa024fe2727e155`

### Resulting-main validation

Windows main CI #360:

- run `34536225635`;
- job `103068350228`;
- event `push`;
- exact source SHA `120bf882b67c54d832a1116f8fa024fe2727e155`;
- conclusion: **SUCCESS**;
- Repository Preflight: **PASS**;
- Capture Visual Regression Fixtures: **PASS**;
- Upload Visual Regression Artifact: **PASS**;
- Tauri Release: **PASS**;
- Upload Diagnostic Harness Artifact: **PASS**;
- visual artifact `10175731468`, digest `sha256:5a7d009113217741067605456948ec7b7ed323974d265b28a663580fa68285ab`;
- diagnostic artifact `10175926487`, digest `sha256:01d5f5fdf8d4c825a12c6ab15e2532b470682c1a971f6349efe0b6ef24af7e32`.

## TRACKING STATE

- `TODO.md`: Subtasks UI is checked complete.
- `STATUS.md`: Milestone 5 is reconciled at **19/28**.
- Latest immutable work log: `work-log/2026-09-11-0127-chatgpt-m5-subtasks-ui.md`.
- The post-merge markdown commits are tracking descendants only; validated source/test baseline remains `120bf882b67c54d832a1116f8fa024fe2727e155`.

## USER-FACING PROGRESS

**`M-5/10 | 5/5 | 19/28`**

The completed Subtasks UI slice used five checkpoints, all complete:

1. mandatory inspection + narrow subtask mutation/read/UX contract — **COMPLETE**;
2. authoritative subtask command/frontend implementation + deterministic Rust/static/visual coverage + semantic/diff review — **COMPLETE**;
3. exact PR-head Windows CI — **COMPLETE**;
4. final exact-head review + expected-head merge — **COMPLETE**;
5. resulting-main Windows CI + tracking/work-log reconciliation — **COMPLETE**.

Do not reset the small-slice counter until the next implementation slice is actually begun and its five-checkpoint plan is recorded in the repository.

## INVARIANTS THAT MUST NOT REGRESS

- authoritative Rust/domain/persistence state and persistence-first mutation semantics remain authoritative;
- stable task and subtask identities are mandatory;
- renderer-independent timer/session accounting, tracked Time Taken and one-open-session protection must not regress;
- task title/EST/subtask/note edits must not rewrite or lose Time Taken/session state;
- a committed mutation plus failed renderer refresh/broadcast is not reported as authoritative mutation failure;
- All Lists remains an aggregate read projection;
- scheduling/date-only/timezone/recurrence semantics validated through M4/M5 remain unchanged;
- stale recurrence update/remove/replace requests continue to fail atomically before destructive child work;
- task-card title/action/edit/schedule/subtask geometry and pointer targets remain stable;
- notes URLs require explicit click/keyboard activation and may never auto-launch merely because a task becomes live;
- excluded account/trial/upgrade/profile/AI/integration controls remain absent;
- diagnostics remain gated behind `?diagnostics=1`.

## UNFINISHED WORK / NEXT ORDERED ITEM

The next ordered Milestone 5 item in `TODO.md` is:

**Rich task notes editor/viewer with clickable URLs.**

The following TODO items remain distinct unless a real dependency requires combining them:

- explicit click/keyboard-only URL activation / no auto-launch on focus;
- larger/resizable Notes editing presentation;
- WebView/browser spellcheck where practical.

## EXACT NEXT ACTION FOR A ZERO-CONTEXT AGENT

Begin a new narrow five-checkpoint M5 slice for **Rich task notes editor/viewer with clickable URLs** from the current main tracking tip.

Before source changes:

1. reconstruct the exact current main/tracking SHA and confirm no open implementation PR/unfinished CI supersedes this handoff;
2. inspect the existing M2 constrained rich-note domain/persistence APIs and tests;
3. inspect current `TaskCard` / `ListBoard` interaction locks and the existing fixture-only `notes-expanded` presentation;
4. read the relevant Notes sections in `docs/PRODUCT_SPEC.md`, `docs/UI_UX_SPEC.md`, `docs/SOURCE_AUDIT.md`, `docs/BEHAVIOR_MATRIX.md`, and `docs/BLITZIT_HISTORY_RISK_INDEX.md` where URL-launch reliability risk is relevant;
5. record the evidence-backed mutation/read/UX contract in this handoff before implementing.

Preserve the established rule that renderer memory is draft/presentation state only and authoritative note persistence remains outside React.

## USER ACTION REQUIRED

**None.**

## BLOCKERS / NOT RUN

- No product/user decision blocks the next ordered slice.
- Local checkout/toolchain validation in this connector-only environment: **NOT RUN**.
- Windows GitHub Actions remains authoritative for frontend, Rust/Tauri, visual and artifact validation.
