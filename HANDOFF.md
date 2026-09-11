# HANDOFF.md

This is the canonical zero-context continuation state for Narro. Start with `AI_START_HERE.md`, `AGENTS.md`, `ENGINEERING_QUALITY.md`, `AGENT_WORKFLOW.md`, this file, the active Milestone 5 section in `TODO.md`, relevant `STATUS.md`, the Notes sections in `docs/PRODUCT_SPEC.md`, `docs/UI_UX_SPEC.md`, `docs/SOURCE_AUDIT.md`, `docs/BEHAVIOR_MATRIX.md`, `docs/BLITZIT_HISTORY_RISK_INDEX.md`, and the newest relevant immutable `work-log/*.md` entry.

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

This is the expected-head guarded merge of PR #91 — `M5: add Subtasks UI`. PR Windows CI #359 and resulting-main Windows CI #360 are both SUCCESS. Detailed immutable evidence: `work-log/2026-09-11-0127-chatgpt-m5-subtasks-ui.md`.

Markdown-only tracking descendants do **not** replace this validated source/test baseline.

## ACTIVE IMPLEMENTATION

**M5 Main UI — Rich task notes editor/viewer with clickable URLs.**

Active branch:

`m5-task-notes-ui`

Branch base / main tracking tip at slice start:

`333443e5f8e969f3ec46989f264faef9c915b452`

No implementation PR exists yet for this slice.

## USER-FACING PROGRESS

**`M-5/10 | 1/5 | 19/28`**

Current five checkpoints:

1. mandatory inspection + narrow note mutation/read/URL/UX contract — **COMPLETE**;
2. authoritative note command/frontend implementation + deterministic Rust/static/visual coverage + semantic/diff review — **IN PROGRESS**;
3. exact PR-head Windows CI — PENDING;
4. final exact-head review + expected-head merge — PENDING;
5. resulting-main Windows CI + tracking/work-log reconciliation — PENDING.

## CHECKPOINT 1 — EVIDENCE-BACKED CONTRACT

### Existing authoritative M2 note model

- `domain::notes::NoteDocument` format version 1 is constrained structured local data, never persisted arbitrary HTML.
- Supported blocks are paragraph, bullet list and numbered list.
- Text runs support `bold`, `italic`, `strikethrough` and optional link metadata.
- `persistence::notes` already validates stored/read documents, block/list/run/text/link size limits and RFC3339 mutation timestamps.
- Persisted links are restricted to explicit `http://` / `https://` URLs; implicit domains, `javascript:`, `file:` and control-character URLs are rejected.
- Reads require an existing task. Writes are forbidden when the task or parent list is archived. Existing M2 note persistence does not forbid completed-task metadata edits.
- `set_task_note` / `delete_task_note` are authoritative M2 primitives, but they do not carry renderer expected-state guards and therefore are not sufficient directly as a stale-safe M5 renderer mutation boundary.

### Renderer-facing persistence contract

- Add a dedicated board-note persistence boundary rather than raw note SQL in React or command orchestration.
- Renderer reads/writes bind the exact task and expected list identity.
- Save/delete must compare expected prior note state inside the same immediate transaction: expected `updated_at` when a note exists, or expected absence when creating the first note.
- A stale note editor must fail instead of overwriting or deleting a newer authoritative document.
- Save preserves task identity, lane/order, EST, Time Taken/session state, scheduling/recurrence, completion and subtask state.
- After a committed write, authoritative note state is re-read. If the write committed but renderer refresh fails, report it as saved and use the established fail-closed mutation block rather than encouraging an unsafe retry.

### Main-window UX contract for this ordered item

- This slice implements the compact **Main-window** notes viewer/editor attached to real task cards. It does **not** absorb the later larger/resizable Notes presentation.
- The existing fixture-only `notes-expanded` state is replaced/augmented by production note UI while retained as deterministic state-model evidence where useful.
- One notes panel may be expanded at a time. Opening it locks conflicting task reorder/create/title/metric/schedule/subtask/list-switch interactions using the existing List Board lock pattern.
- All Lists is read-only for note mutation in this Main-window slice. Individual-list tasks may open the editor; archived entities remain unavailable through active board projection.
- Viewer renders constrained paragraphs/lists/styles and clickable HTTP(S) links from the authoritative document.
- Link opening requires an explicit pointer click or keyboard activation on the rendered link. No code path may open links merely because a task becomes live, a notes panel mounts, focus changes, pause/resume occurs, or authoritative data refreshes.
- Do not fetch remote link previews or remote metadata.
- Editor controls support paragraph/bullet/numbered blocks plus bold/italic/strikethrough/link metadata without persisting arbitrary HTML.
- Pointer controls require keyboard/focus-visible equivalents and accessible names/tooltips.
- Notes expansion must not change the fixed parent title/action slot geometry or permit note controls to initiate task drag.

### Ordered-scope boundary

This item may implement explicit activation for links because clickable URLs cannot be safe otherwise, but it must **not** claim the later ordered focus/no-auto-launch integration item complete until focus entry/switch behavior has its own required evidence. Keep these later TODO items distinct:

- explicit click/keyboard-only URL activation / no auto-launch on focus;
- larger/resizable Notes editing presentation;
- WebView/browser spellcheck where practical.

Do not absorb list settings, search, archives, theme settings, Focus Panel/Floating Timer product UI, Reports, parent task completion/delete/archive UI, account/cloud/integration features or later milestones.

## RELEVANT RISK / PRODUCT EVIDENCE

- `AGENTS.md` resolves the source conflict in favor of explicit URL activation only.
- `docs/BLITZIT_HISTORY_RISK_INDEX.md` treats auto-opening links as an unexpected-action reliability risk and calls for explicit activation/no focus-entry side effect.
- `docs/UI_UX_SPEC.md` requires explicit pointer/keyboard link activation, no remote preview/fetch and no link launch on Focus Mode/task-switch/pause-resume.
- `docs/RESEARCH_EVIDENCE.md` records the older board evidence as an inline Notes editor with a rich-formatting toolbar, multiline body and URL-like content.

## INVARIANTS THAT MUST NOT REGRESS

- authoritative Rust/domain/persistence state and persistence-first mutation semantics remain authoritative;
- stable task/subtask identities remain mandatory;
- renderer-independent timer/session accounting, tracked Time Taken and one-open-session protection must not regress;
- task title/EST/subtask/note edits must not rewrite or lose Time Taken/session state;
- a committed mutation plus failed renderer refresh/broadcast is not reported as authoritative mutation failure;
- All Lists remains an aggregate read projection;
- scheduling/date-only/timezone/recurrence semantics remain unchanged;
- task-card title/action/edit/schedule/subtask geometry and pointer targets remain stable;
- note links never auto-launch from state changes and never fetch remote previews;
- excluded account/trial/upgrade/profile/AI/integration controls remain absent;
- diagnostics remain gated behind `?diagnostics=1`.

## EXACT NEXT ACTION FOR A ZERO-CONTEXT AGENT

Continue checkpoint 2 on `m5-task-notes-ui`:

1. add a renderer-facing stale-safe board-note persistence/command boundary over the M2 constrained note model;
2. add typed TypeScript note DTOs/API;
3. add production compact TaskCard/ListBoard viewer/editor with explicit link activation and interaction/drag locks;
4. add deterministic Rust/static/light-dark visual coverage, including stale save/delete, invalid URL rejection, no auto-open side effects and fixed parent geometry;
5. perform branch-wide semantic/diff review before opening a PR.

Do not open a PR until checkpoint 2 is complete and reviewed.

## USER ACTION REQUIRED

**None.**

## BLOCKERS / NOT RUN

- No product/user decision blocks this slice.
- Local checkout/toolchain validation in this connector-only environment: **NOT RUN**.
- Windows GitHub Actions remains authoritative for frontend, Rust/Tauri, visual and artifact validation.
