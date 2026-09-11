# M5 Rich Task Notes Editor/Viewer — validated work log

Date: 2026-09-11
Agent: ChatGPT
Milestone: 5 — Design system and Main window product UI
Roadmap item: Rich task notes editor/viewer with clickable URLs

## Outcome

The ordered M5 Rich Notes item is fully implemented, exact-head validated, expected-head merged, resulting-main validated, and reconciled into repository tracking. M5 advances from 19/28 to 20/28 validated top-level items. Milestone 5 remains ACTIVE; Milestones 6–10 remain not started.

The validated source/test baseline is the merge commit:

`766781b03caa01b9c70d7af10827d751d998caba`

Source tree:

`93e72feb5da74fcaf6de16ab3b120c32008eddc6`

This markdown-only reconciliation work log does not replace that source baseline.

## Implemented capability

- Reused M2 `NoteDocument` / `NoteBlock` / `NoteTextRun` and existing `task_notes`; no schema migration and no authoritative HTML persistence.
- Added board-facing exact task/list note reads plus persistence-first save/delete commands.
- Save/delete use `TransactionBehavior::Immediate` and optimistic expected-`updated_at` stale guards; absent expected version is create-only and stale-safe.
- Preserved completed-task note mutability while archived task/list mutation stays forbidden and aggregate All Lists remains read-only.
- Added stable renderer error classes `NOTE_STALE`, `NOTE_NOT_ALLOWED`, and `NOTE_FAILED`.
- Added production inline rich Notes editor/viewer supporting paragraph, bullet/numbered lists, Bold, Italic, Strikethrough, link creation, Undo/Redo, Save/Delete and structural React rendering.
- Preserved root text nodes in the contentEditable DOM-to-domain parser after semantic review found a possible text-loss edge case.
- Saved URLs are explicit user controls invoking the existing Tauri opener only from user activation; editor links cannot navigate and no remote preview/fetch behavior was added.
- Notes uses the established one-panel List Board interaction model, mutually excludes Subtasks/conflicting task actions and isolates note controls from parent drag.
- Successful note writes refresh authoritative persisted note state; committed write followed by refresh failure is reported as saved and blocks unsafe follow-up mutations.
- Added deterministic Rust/static coverage and real production light/dark Notes visual fixtures for editable and aggregate read-only states.

## PR and validation evidence

PR: #92 — `M5: add rich task notes editor and viewer`

Final exact PR head:

`12e5de44b0ddc00f09a0b1b2bca72d4744ceb113`

Windows PR CI #364:

- run `34599041219`;
- job `103261625630`;
- exact head `12e5de44b0ddc00f09a0b1b2bca72d4744ceb113`;
- conclusion **SUCCESS**;
- Repository Preflight **PASS**;
- Capture Visual Regression Fixtures **PASS**;
- Upload Visual Regression Artifact **PASS**;
- Tauri Release **PASS**;
- Upload Diagnostic Harness Artifact **PASS**;
- visual artifact `10263334390`, digest `sha256:8634f7fa24c0dfa1cc315db57c34afdad0acc75dc27943ea55a5f9a88087cdb9`;
- diagnostic artifact `10263778572`, digest `sha256:6fe93eb9fe9aae3d18885c0d23beff680e019f6b69ef0f1cff906744bddd3875`.

Two failed runs did not count as progress:

- CI #361 failed on one stale Subtasks static assertion after the Notes expansion lock was correctly added; the assertion was updated narrowly.
- CI #362 then passed all frontend/static contracts and production Vite build, but failed only `cargo fmt --check` on the new Rust files; the exact rustfmt output was applied without logic changes.

Final PR review state before merge: mergeable, no submitted reviews, no unresolved inline review threads. The final diff remained limited to Notes/interaction/static/visual/tracking scope.

Expected-head merge guarded against `12e5de44b0ddc00f09a0b1b2bca72d4744ceb113` and produced:

`766781b03caa01b9c70d7af10827d751d998caba`

## Resulting-main validation

Windows main CI #365:

- run `34600370102`;
- job `103265907994`;
- event `push`;
- exact source SHA `766781b03caa01b9c70d7af10827d751d998caba`;
- conclusion **SUCCESS**;
- Repository Preflight **PASS**;
- Capture Visual Regression Fixtures **PASS**;
- Upload Visual Regression Artifact **PASS**;
- Tauri Release **PASS**;
- Upload Diagnostic Harness Artifact **PASS**;
- visual artifact `10263584561`, digest `sha256:0cb8b53e438e654882291764a6bac6868a6e527ed6e71619116f07fc9686c83a`;
- diagnostic artifact `10264950279`, digest `sha256:7dec60f2e218c0479d7058ea45e0a59229ae4715a160b62da2eceb1dfd7a2895`.

## Invariants preserved

- Authoritative domain/persistence ownership and persistence-first mutation boundaries.
- Stable task/subtask identity and no impact to timer/session/Time Taken accounting.
- All Lists remains an aggregate read projection.
- Completed task notes remain editable per existing M2 semantics; archived parent mutation remains forbidden.
- Task-card reserved action/title geometry and existing Subtasks/scheduling/reorder behavior remain intact.
- No remote URL preview/fetch path exists.
- Note URLs require explicit user activation; this slice added no focus/live-task URL-opening side effect.

## Exact next ordered action

Begin M5 item 21/28:

**Require explicit click/keyboard activation to open note URLs; do not auto-launch links when entering focus.**

This is a dedicated source-product reliability slice tied to `docs/BLITZIT_HISTORY_RISK_INDEX.md` risk N-01. Before source changes, inspect current URL-open call sites and every focus/live-task transition that could project Notes: focus entry, task switch/live selection, pause/resume, session events, renderer refresh/recreation and focus-surface mode projection. Add deterministic anti-regression proof that none can open a URL without an explicit pointer/keyboard activation. Keep the later larger/resizable Notes editor and spellcheck items separate.
