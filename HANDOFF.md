# HANDOFF.md

Canonical zero-context continuation state for Narro. Read `AI_START_HERE.md`, `AGENTS.md`, `ENGINEERING_QUALITY.md`, `AGENT_WORKFLOW.md`, this file, active Milestone 5 in `TODO.md`, relevant `STATUS.md`, Notes sections in `docs/PRODUCT_SPEC.md`, `docs/UI_UX_SPEC.md`, `docs/BEHAVIOR_MATRIX.md`, `docs/SOURCE_AUDIT.md`, `docs/BLITZIT_HISTORY_RISK_INDEX.md`, and the newest relevant immutable `work-log/*.md` entry before changing source.

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

This is the expected-head guarded merge of PR #91 — `M5: add Subtasks UI`. Markdown-only descendants do not replace this source baseline.

## LATEST COMPLETED IMPLEMENTATION / CI

**M5 Main UI — Subtasks UI.** Detailed immutable evidence: `work-log/2026-09-11-0127-chatgpt-m5-subtasks-ui.md`.

Final PR #91 head: `929c5042a095dfcedc1343ff680080fb2d229cbe`.

Windows PR CI #359:

- run `34511982661`, job `102988191474`, conclusion **SUCCESS**;
- Repository Preflight, visual capture/upload, Tauri Release and diagnostic artifact upload: **PASS**;
- visual artifact `10166459738`, digest `sha256:176f7bf17badd1efd8aafeaaa09110ce44568ed70588db064e38abc412244ef8`;
- diagnostic artifact `10166706435`, digest `sha256:c52c6c764b29e3147de21c5e733948e985ca5de5aa091ebb7c7eb9cdec709a4c`.

Expected-head merge produced main source SHA `120bf882b67c54d832a1116f8fa024fe2727e155`.

Windows main CI #360:

- run `34536225635`, job `103068350228`, conclusion **SUCCESS**;
- exact source SHA `120bf882b67c54d832a1116f8fa024fe2727e155`;
- Repository Preflight, visual capture/upload, Tauri Release and diagnostic artifact upload: **PASS**;
- visual artifact `10175731468`, digest `sha256:5a7d009113217741067605456948ec7b7ed323974d265b28a663580fa68285ab`;
- diagnostic artifact `10175926487`, digest `sha256:01d5f5fdf8d4c825a12c6ab15e2532b470682c1a971f6349efe0b6ef24af7e32`.

## ACTIVE IMPLEMENTATION SLICE

**M5 Main UI — Rich task notes editor/viewer with clickable URLs.**

Branch: `m5-rich-task-notes`

Slice base / main tracking tip at start: `333443e5f8e969f3ec46989f264faef9c915b452`.

No open implementation PR or unfinished CI superseded this slice at startup.

### Checkpoint 1 contract — COMPLETE

Evidence inspected:

- M2 constrained rich-note domain/persistence and integration tests;
- current `TaskCard` fixture-only `notes-expanded` presentation;
- current `ListBoard` one-panel Subtasks state and interaction-lock pattern;
- current board-facing guarded persistence/command pattern and Tauri command registration;
- Notes product/UX behavior and `N-01` automatic-link-launch source-product risk.

Implementation contract:

- Reuse M2 `NoteDocument` / `NoteBlock` / `NoteTextRun` and `task_notes`; no schema migration and no HTML-authoritative storage.
- Persist paragraph, bullet list, numbered list, bold, italic, strikethrough and optional validated `http`/`https` links under the existing format version and size limits.
- Validate exact task/list binding on every board-facing read/write. React owns draft/presentation state only.
- Lazy-load one expanded Notes panel at a time; do not duplicate full note documents into the List Board snapshot.
- Individual-list task cards may edit Notes, including completed tasks, matching existing M2 persistence behavior. Archived task/list mutation remains forbidden. `All Lists` is read-only.
- Save/delete use immediate persistence-first transactions with optimistic stale guards against expected `updated_at`; absent expected version means create-only and must fail stale if a row appeared concurrently.
- Command errors expose stable `NOTE_STALE`, `NOTE_NOT_ALLOWED`, `NOTE_FAILED` classes.
- Inline editor provides Bold, Italic, Strikethrough, bulleted list, numbered list, Undo and Redo; microphone remains excluded.
- Viewer renders structural React nodes, never `dangerouslySetInnerHTML`. No remote previews/fetches.
- Valid links are explicit user-activated controls and use the existing Tauri opener capability. This slice adds no focus/live-task URL side effect; the separately ordered no-auto-launch TODO remains unclaimed until its dedicated anti-regression coverage is completed.
- Opening Notes locks conflicting parent task reorder/create/title/metric/schedule interactions and list switching; Notes controls do not initiate parent drag.
- A committed save/delete followed by renderer refresh failure is reported as saved and blocks unsafe follow-up writes until reload.
- Preserve fixed task-card title/action geometry, keyboard/focus-visible access, timer/session accounting, recurrence/scheduling behavior and existing Subtasks behavior.
- Larger/resizable Notes editing and explicit spellcheck remain later ordered TODO items.

## USER-FACING PROGRESS

**`M-5/10 | 1/5 | 19/28`**

1. mandatory inspection + narrow rich-note mutation/read/UX contract — **COMPLETE**;
2. authoritative note command/frontend implementation + deterministic Rust/static/visual coverage + semantic/diff review — **IN PROGRESS**;
3. exact PR-head Windows CI — PENDING;
4. final exact-head review + expected-head merge — PENDING;
5. resulting-main Windows CI + tracking/work-log reconciliation — PENDING.

## INVARIANTS THAT MUST NOT REGRESS

- Rust/domain/persistence remains authoritative and mutations remain persistence-first.
- Stable task/subtask identity, tracked Time Taken, timer/session accounting and one-open-session protection must not regress.
- A committed authoritative mutation plus failed renderer refresh/broadcast is not reported as mutation failure.
- All Lists remains an aggregate read projection.
- Scheduling/date-only/timezone/recurrence semantics validated through M4/M5 remain unchanged.
- Task-card reserved action/title geometry and pointer targets remain stable.
- Note URLs require explicit pointer/keyboard activation and may never auto-launch merely because focus/live task state changes.
- Excluded account/trial/upgrade/profile/AI/integration controls remain absent.
- Diagnostics remain gated behind `?diagnostics=1`.

## TRACKING STATE

- `TODO.md`: Rich task notes editor/viewer remains unchecked until exact-head PR CI, expected-head merge, resulting-main Windows CI and tracking reconciliation all pass.
- `STATUS.md`: remains **19/28** until that sequence completes.
- Latest immutable completed work log: `work-log/2026-09-11-0127-chatgpt-m5-subtasks-ui.md`.

## EXACT NEXT ACTION FOR A ZERO-CONTEXT AGENT

Resume checkpoint 2 on branch `m5-rich-task-notes`. Implement the guarded board note persistence/command boundary, typed frontend API, production `TaskNotes` editor/viewer integration, List Board one-panel orchestration/locks, deterministic Rust/static coverage and light/dark visual fixture coverage. Then review the exact branch diff before opening the PR. Do not start a parallel branch and do not mark the M5 item complete before authoritative Windows validation/merge/main validation.

## USER ACTION REQUIRED

**None.**

## BLOCKERS / NOT RUN

- No product/user decision blocks checkpoint 2.
- Local checkout/toolchain validation in this connector-only environment: **NOT RUN**.
- Windows GitHub Actions remains authoritative for frontend, Rust/Tauri, visual and artifact validation.
