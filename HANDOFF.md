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

## ACTIVE IMPLEMENTATION SLICE

**M5 Main UI — Rich task notes editor/viewer with clickable URLs.**

Active branch:

`m5-rich-task-notes`

Branch base / main tracking tip at slice start:

`333443e5f8e969f3ec46989f264faef9c915b452`

No open implementation PR or unfinished CI superseded this slice when it started. The latest authoritative Windows validation remains main CI #360 at source SHA `120bf882b67c54d832a1116f8fa024fe2727e155`.

### Evidence-backed mutation/read/UX contract

- Reuse the existing M2 `NoteDocument` / `NoteBlock` / `NoteTextRun` constrained rich-note model and `task_notes` persistence. No schema migration or HTML-authoritative storage is required.
- Supported persisted rich semantics remain paragraph, bullet list, numbered list, bold, italic, strikethrough, and optional `http`/`https` links. Existing persistence size limits and link validation remain authoritative.
- Task/list identity must be validated at the renderer-facing boundary before reads or writes. React memory is draft/presentation state only.
- Notes load lazily for one expanded task card at a time through a task-scoped Rust command. The board snapshot does not duplicate full note documents.
- Individual-list task cards may edit notes, including completed tasks, matching the existing M2 persistence contract; archived task/list mutation remains forbidden. `All Lists` is an aggregate read projection and exposes Notes read-only.
- Save/delete use persistence-first immediate transactions and optimistic stale guards based on the note row's expected `updated_at`: creating requires no existing row when the expected version is absent; replacing/deleting an existing row requires the expected persisted timestamp to match.
- The renderer-facing command layer returns stable stale/not-allowed/failed error classes rather than exposing raw SQLite text.
- Rich editing stays inline in task context and provides the confirmed controls: Bold, Italic, Strikethrough, bulleted list, numbered list, Undo and Redo. The microphone control remains excluded.
- Viewer rendering is structural React output rather than `dangerouslySetInnerHTML`. Link destinations remain constrained to persisted `http`/`https` values.
- Links are user-activated controls and open via the existing Tauri opener capability; this slice does not add any focus/live-task side effect. The separately ordered no-auto-launch TODO remains unclaimed until its dedicated anti-regression coverage is implemented.
- No remote link previews/fetches are introduced.
- Opening Notes locks conflicting parent task reorder/create/title/metric/schedule interactions and list switching, and Notes controls must not initiate parent drag.
- Successful mutations refresh the authoritative note snapshot. If persistence commits but the renderer refresh fails, report the note as saved and block unsafe follow-up writes until reload rather than misreporting the authoritative mutation as failed.
- Task-card reserved title/action geometry, keyboard/focus-visible access, timer/session accounting, scheduling/recurrence semantics, and existing Subtasks behavior must not regress.
- The later TODO items for larger/resizable Notes editing and WebView/browser spellcheck stay outside this slice unless an actual implementation dependency proves otherwise.

## TRACKING STATE

- `TODO.md`: Subtasks UI is checked complete; Rich task notes editor/viewer remains unchecked until exact-head PR CI, expected-head merge, resulting-main Windows CI and tracking reconciliation all pass.
- `STATUS.md`: Milestone 5 remains reconciled at **19/28** until this slice is fully validated.
- Latest immutable completed work log: `work-log/2026-09-11-0127-chatgpt-m5-subtasks-ui.md`.
- The post-merge markdown commits are tracking descendants only; validated source/test baseline remains `120bf882b67c54d832a1116f8fa024fe2727e155`.

## USER-FACING PROGRESS

**`M-5/10 | 0/5 | 19/28`**

Current five checkpoints:

1. mandatory inspection + narrow rich-note mutation/read/UX contract — **IN PROGRESS**;
2. authoritative note command/frontend implementation + deterministic Rust/static/visual coverage + semantic/diff review — PENDING;
3. exact PR-head Windows CI — PENDING;
4. final exact-head review + expected-head merge — PENDING;
5. resulting-main Windows CI + tracking/work-log reconciliation — PENDING.

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

The active ordered Milestone 5 item is:

**Rich task notes editor/viewer with clickable URLs.**

The following TODO items remain distinct unless a real dependency requires combining them:

- explicit click/keyboard-only URL activation / no auto-launch on focus;
- larger/resizable Notes editing presentation;
- WebView/browser spellcheck where practical.

## EXACT NEXT ACTION FOR A ZERO-CONTEXT AGENT

Continue checkpoint 1 on branch `m5-rich-task-notes`: finish inspection of current `ListBoard`/Subtasks interaction-lock patterns and Rust command registration, mark checkpoint 1 complete in this handoff, then implement checkpoint 2 directly from the contract above. Do not start a parallel replacement branch.

## USER ACTION REQUIRED

**None.**

## BLOCKERS / NOT RUN

- No product/user decision blocks the active slice.
- Local checkout/toolchain validation in this connector-only environment: **NOT RUN**.
- Windows GitHub Actions remains authoritative for frontend, Rust/Tauri, visual and artifact validation.
