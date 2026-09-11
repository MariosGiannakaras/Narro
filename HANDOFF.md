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

Reviewed source/test candidate before this HANDOFF-only descendant:

`79f117cf085d51c4564feb88aaab044a38a6d22e`

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

### Checkpoint 2 implementation and review — COMPLETE

Authoritative persistence / commands:

- Added `persistence::note_board` with immediate transactions, exact task/list validation, expected-`updated_at` stale guards, create-only insert semantics and stale-safe delete.
- Existing M2 `NoteDocument` and `validate_note_document` remain authoritative; no migration or HTML persistence was added.
- Completed tasks remain note-editable while archived task/list mutations remain blocked.
- Added typed Tauri note read/save/delete commands with stable `NOTE_STALE`, `NOTE_NOT_ALLOWED` and `NOTE_FAILED` mappings and registered them in `lib.rs`.
- Added Rust regressions for stale save non-clobbering, concurrent create-only rejection, completed-task editing and stale delete rejection.

Frontend / interaction behavior:

- `listBoardApi.ts` exposes typed rich-note DTOs and read/save/delete IPC only; full note documents are lazy loaded and not copied into the board snapshot.
- Added production `TaskNotes` with structural paragraph/list/run rendering, Bold/Italic/Strikethrough, bullet/numbered list, link creation, Undo/Redo, explicit save/delete and saved-note viewer.
- Direct root text nodes from `contentEditable` are explicitly preserved by the DOM-to-`NoteDocument` parser; a review-found text-loss edge case was fixed before PR.
- Viewer never uses `dangerouslySetInnerHTML`; no remote preview/fetch path exists.
- Saved URLs render as explicit button controls and call the Tauri opener only from the user click handler. Editor links cannot navigate on click.
- One Notes panel is controlled by `ListBoard`; opening it locks reorder/create/title/metric/schedule/list switching and mutually excludes Subtasks expansion. Notes controls are excluded from parent drag initiation.
- `All Lists` opens Notes read-only. Individual-list completed tasks follow the authoritative M2 rule and remain editable.
- Note save/delete are persistence-first and refresh the authoritative note snapshot after commit. A committed write followed by refresh failure is reported as saved, blocks further note writes locally and enters the board fail-closed mutation blocker.
- Task-card reserved title/action geometry remains unchanged; reorder action rail is suppressed while Notes is expanded.

Deterministic coverage / visual evidence wired for Windows CI:

- Added `scripts/test-ui-task-notes.mjs` covering registration/layering, immediate/stale guards, stable error codes, completed-task behavior, typed IPC, identity gates, parser text preservation, structural rendering, explicit-only opener behavior, read-only aggregate projection, interaction locks, drag isolation and committed-refresh failure semantics.
- Updated the existing hover/action static guard only to include `[data-task-note-control]` in the already validated parent drag exclusion selector.
- Added `task-notes-fixture.html`, `taskNotesVisualFixture.tsx/.css` and `validate-task-note-captures.mjs` using the real production `TaskCard`/`TaskNotes` surface in light/dark editable and aggregate read-only states.
- The visual contract checks fixed title/action geometry, rich editor/viewer presence, eight formatting controls and explicit saved-link controls.
- Wired the new static test, Vite entry, Windows capture and capture validator into `package.json`, Vite and the existing visual pipeline.

Semantic/diff review:

- Base `333443e5f8e969f3ec46989f264faef9c915b452` to candidate `79f117cf085d51c4564feb88aaab044a38a6d22e` is ahead by 21 commits and limited to 19 Notes/guard/fixture/tracking files.
- `ListBoard.tsx` full-file replacement was explicitly diff-reviewed; the commit contains only the intended Notes state/locks/wiring and one drag-selector extension, with no accidental pre-existing logic deletion.
- `TaskCard.tsx` diff contains only production Notes integration and expansion geometry locking.
- No search/archive/timer-domain/recurrence implementation or later larger-editor/spellcheck scope was absorbed.

## USER-FACING PROGRESS

**`M-5/10 | 2/5 | 19/28`**

1. mandatory inspection + narrow rich-note mutation/read/UX contract — **COMPLETE**;
2. authoritative note command/frontend implementation + deterministic Rust/static/visual coverage + semantic/diff review — **COMPLETE**;
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

Open/resume the implementation PR from `m5-rich-task-notes`, record its exact head SHA and inspect the authoritative Windows CI. If CI fails, fix only the exact evidence-backed failure and revalidate the new exact head. If CI succeeds, perform final exact-head semantic/review-thread checks, expected-head merge, resulting-main Windows CI, then reconcile `TODO.md`, `STATUS.md`, this HANDOFF and a new immutable work log. Do not mark the M5 item complete before that sequence finishes.

## USER ACTION REQUIRED

**None.**

## BLOCKERS / NOT RUN

- No product/user decision blocks checkpoint 3.
- Local checkout/toolchain validation could not be run in this connector environment; the local container cannot resolve GitHub and has no Rust toolchain checkout for this repository.
- Windows GitHub Actions remains authoritative for frontend, Rust/Tauri, visual and artifact validation.
