# STATUS.md

Last updated: 2026-09-11

For zero-context continuation start with `AI_START_HERE.md` and `HANDOFF.md`.

## Current phase

**Milestone 5 — Design system and Main window product UI.**

- Milestone 1 / Gate A: **PASS**.
- Milestone 2 / Gate B: **PASS**.
- Milestone 3 / Gate C: **PASS**.
- Milestone 4 / Gate D: **PASS**.
- Milestone 5: **ACTIVE / 20 of 28 top-level items validated**.
- Milestones 6–10: **NOT STARTED**.

**`M-5/10 | 5/5 | 20/28`**

The first twenty ordered M5 items are fully main validated. The latest completed item is **Rich task notes editor/viewer with clickable URLs**. The next ordered item is **Require explicit click/keyboard activation to open note URLs; do not auto-launch links when entering focus**.

## Current validated source baseline

Latest fully main-validated **source/test** baseline:

`766781b03caa01b9c70d7af10827d751d998caba`

Tree:

`93e72feb5da74fcaf6de16ab3b120c32008eddc6`

This is the expected-head guarded merge of PR #92 — `M5: add rich task notes editor and viewer`.

Markdown-only tracking descendants do **not** replace this validated source/test baseline.

### PR #92 exact-head validation

Final validated PR head:

`12e5de44b0ddc00f09a0b1b2bca72d4744ceb113`

Windows PR CI #364:

- run `34599041219`;
- job `103261625630`;
- exact head `12e5de44b0ddc00f09a0b1b2bca72d4744ceb113`;
- conclusion: **SUCCESS**;
- Repository Preflight: **PASS**;
- Capture Visual Regression Fixtures: **PASS**;
- Upload Visual Regression Artifact: **PASS**;
- Tauri Release: **PASS**;
- Upload Diagnostic Harness Artifact: **PASS**;
- visual artifact `10263334390`, digest `sha256:8634f7fa24c0dfa1cc315db57c34afdad0acc75dc27943ea55a5f9a88087cdb9`;
- diagnostic artifact `10263778572`, digest `sha256:6fe93eb9fe9aae3d18885c0d23beff680e019f6b69ef0f1cff906744bddd3875`;
- final PR state: mergeable, no submitted reviews, no unresolved review threads.

Earlier PR CI #361 failed at a stale Subtasks static assertion after the Notes interaction lock was added; #362 then passed all frontend/static checks and production Vite build but failed only `cargo fmt --check` on new Rust formatting. Both were corrected narrowly and neither failed run counts as progress.

PR #92 was merged with expected-head guard against `12e5de44b0ddc00f09a0b1b2bca72d4744ceb113`, producing main source SHA `766781b03caa01b9c70d7af10827d751d998caba`.

### Resulting-main validation

Windows main CI #365:

- run `34600370102`;
- job `103265907994`;
- exact source SHA `766781b03caa01b9c70d7af10827d751d998caba`;
- event: `push`;
- conclusion: **SUCCESS**;
- Repository Preflight: **PASS**;
- Capture Visual Regression Fixtures: **PASS**;
- Upload Visual Regression Artifact: **PASS**;
- Tauri Release: **PASS**;
- Upload Diagnostic Harness Artifact: **PASS**;
- visual artifact `10263584561`, digest `sha256:0cb8b53e438e654882291764a6bac6868a6e527ed6e71619116f07fc9686c83a`;
- diagnostic artifact `10264950279`, digest `sha256:7dec60f2e218c0479d7058ea45e0a59229ae4715a160b62da2eceb1dfd7a2895`.

Detailed immutable evidence is recorded in `work-log/2026-09-11-1629-chatgpt-m5-rich-task-notes.md`.

## Milestone 5 — validated ordered work

The following top-level items are validated complete, in roadmap order:

1. semantic theme-token foundation;
2. typography foundation;
3. spacing/radius/elevation foundation;
4. shared motion primitives;
5. `prefers-reduced-motion` behavior;
6. accessible tooltip/popover/menu primitives with stable geometry;
7. deterministic screenshot/visual-regression harness;
8. App shell/navigation;
9. Home dashboard/list cards;
10. list-card rest/hover/Open/overflow/create-list states;
11. persistence-backed Create/Edit List modal;
12. List Board with Backlog / This Week / Today / Done;
13. Task-card state model;
14. persistence-backed drag/drop or equivalent reorder/move behavior;
15. production hover/focus action geometry with reserved/overlay slots and no title/card reflow;
16. persistence-backed task creation and inline title editing;
17. persistence-backed EST and Time Taken display/edit states with authoritative live-paused timer/session integration;
18. production scheduling and recurrence editor over the authoritative M4 scheduling/recurrence model;
19. production Subtasks UI over the authoritative M2 subtask identity/order/completion persistence model;
20. production rich task Notes editor/viewer over the authoritative M2 constrained rich-note model, including saved clickable URLs.

### Latest completed: Rich task notes editor/viewer with clickable URLs

Validated behavior includes:

- board-facing note reads/writes validate exact task/list identity and reuse the M2 constrained versioned `NoteDocument` format with no HTML-authoritative storage and no schema migration;
- save/delete use immediate SQLite transactions with expected-`updated_at` optimistic stale guards, including create-only absent-version protection and stale-safe delete;
- completed non-archived tasks remain note-editable, archived task/list mutation remains forbidden, and aggregate All Lists is read-only;
- the inline editor/viewer supports paragraph/list structure, Bold, Italic, Strikethrough, bulleted/numbered lists, link creation, Undo/Redo, structural rendering and explicit Save/Delete;
- saved URLs are explicit user controls using the existing Tauri opener path; editor links do not navigate and no remote preview/fetch path exists;
- Notes expansion is mutually exclusive with conflicting task/subtask/schedule/reorder interactions and Notes controls are isolated from parent drag;
- successful writes refresh authoritative persisted note state; a committed write followed by refresh failure is reported as saved and blocks unsafe follow-up writes;
- deterministic Rust/static coverage and light/dark production visual fixtures validate editable and aggregate read-only Notes states.

### Next ordered M5 item

`Require explicit click/keyboard activation to open note URLs; do not auto-launch links when entering focus.`

This is a dedicated source-product reliability slice. Re-read `docs/BLITZIT_HISTORY_RISK_INDEX.md` and the Notes/focus sections of `docs/SOURCE_AUDIT.md`, `docs/PRODUCT_SPEC.md`, `docs/UI_UX_SPEC.md` and `docs/BEHAVIOR_MATRIX.md` before source changes. The implementation should prove the existing explicit opener path is the only URL-open side effect and add regressions across task-live/focus entry, switching, pause/resume and renderer/window projection transitions. Do not absorb the later larger/resizable Notes presentation or spellcheck items.

## Durable correctness decisions

Future work must preserve:

- Narro remains personal, local-only Windows 10/11 x64 software; no auth/cloud/telemetry/integration authority is introduced.
- Tauri 2 + React/TypeScript + authoritative Rust/domain state + SQLite remains the validated architecture.
- `main` and reusable `focusSurface` are the normal two-webview model; presentation changes must not duplicate authoritative runtime state.
- authoritative task/list/session/timer/scheduling/note state lives outside renderer memory; persistence-first mutations remain the success boundary;
- stable task/subtask identities, tracked Time Taken, one-open-session protection, scheduling/date-only/timezone/recurrence semantics and All Lists aggregate semantics must not regress;
- a committed authoritative mutation must not be reported as failed merely because a secondary renderer refresh/event delivery fails;
- Notes URLs require explicit pointer/keyboard activation and may never auto-launch merely because a task becomes live, focus mode opens, task selection changes, or pause/resume occurs;
- hover/focus/edit interactions may not reflow task/list card geometry or move hit targets;
- keyboard/focus-visible equivalents and accessible names/tooltips remain required for icon-only actions;
- motion never owns or delays domain-state completion; `prefers-reduced-motion` remains usable and timer numerals remain tabular;
- excluded account/trial/upgrade/profile/AI/integration controls remain absent;
- diagnostics remain gated behind `?diagnostics=1`.

## Multi-agent continuation rule

Repository state must remain sufficient for a zero-context implementation agent. Use `AI_START_HERE.md`, `AGENTS.md`, `ENGINEERING_QUALITY.md`, `AGENT_WORKFLOW.md`, `HANDOFF.md`, `TODO.md`, relevant `docs/*`, and newest `work-log/*.md` entries as the continuation source of truth.
