# HANDOFF.md

Canonical zero-context continuation state for Narro. Read `AI_START_HERE.md`, `AGENTS.md`, `ENGINEERING_QUALITY.md`, `AGENT_WORKFLOW.md`, this file, active Milestone 5 in `TODO.md`, relevant `STATUS.md`, Notes/focus sections in `docs/PRODUCT_SPEC.md`, `docs/UI_UX_SPEC.md`, `docs/BEHAVIOR_MATRIX.md`, `docs/SOURCE_AUDIT.md`, `docs/BLITZIT_HISTORY_RISK_INDEX.md`, and the newest relevant immutable `work-log/*.md` entry before changing source.

## CURRENT MILESTONE

**Milestone 5 — Design system and Main window product UI.**

- Milestones 1–4: COMPLETE / PASS.
- Milestone 5: ACTIVE / **20 of 28** top-level items validated.
- Milestones 6–10: NOT STARTED.

## CURRENT VALIDATED SOURCE BASELINE

Latest fully main-validated source/test SHA:

`766781b03caa01b9c70d7af10827d751d998caba`

Source tree:

`93e72feb5da74fcaf6de16ab3b120c32008eddc6`

This is the expected-head guarded merge of PR #92 — `M5: add rich task notes editor and viewer`. Markdown-only tracking descendants do not replace this source baseline.

## LATEST COMPLETED IMPLEMENTATION / CI

**M5 Main UI — Rich task notes editor/viewer with clickable URLs.** Detailed immutable evidence: `work-log/2026-09-11-1629-chatgpt-m5-rich-task-notes.md`.

Final PR #92 head: `12e5de44b0ddc00f09a0b1b2bca72d4744ceb113`.

Windows PR CI #364:

- run `34599041219`, job `103261625630`, conclusion **SUCCESS**;
- Repository Preflight, visual capture/upload, Tauri Release and diagnostic artifact upload: **PASS**;
- visual artifact `10263334390`, digest `sha256:8634f7fa24c0dfa1cc315db57c34afdad0acc75dc27943ea55a5f9a88087cdb9`;
- diagnostic artifact `10263778572`, digest `sha256:6fe93eb9fe9aae3d18885c0d23beff680e019f6b69ef0f1cff906744bddd3875`.

Expected-head merge produced main source SHA `766781b03caa01b9c70d7af10827d751d998caba`.

Windows main CI #365:

- run `34600370102`, job `103265907994`, conclusion **SUCCESS**;
- exact source SHA `766781b03caa01b9c70d7af10827d751d998caba`;
- Repository Preflight, visual capture/upload, Tauri Release and diagnostic artifact upload: **PASS**;
- visual artifact `10263584561`, digest `sha256:0cb8b53e438e654882291764a6bac6868a6e527ed6e71619116f07fc9686c83a`;
- diagnostic artifact `10264950279`, digest `sha256:7dec60f2e218c0479d7058ea45e0a59229ae4715a160b62da2eceb1dfd7a2895`.

## COMPLETED CAPABILITIES FROM THE LATEST SLICE

- Reused the M2 constrained, versioned local `NoteDocument` persistence model; no schema migration and no authoritative HTML storage.
- Added board-facing exact task/list note reads and persistence-first save/delete commands with immediate SQLite transactions and expected-`updated_at` stale guards.
- Added stable `NOTE_STALE`, `NOTE_NOT_ALLOWED` and `NOTE_FAILED` command classes.
- Preserved completed-task note editing, archived task/list mutation restrictions and aggregate All Lists read-only behavior.
- Added production inline rich Notes editor/viewer with paragraph/list structure, Bold, Italic, Strikethrough, bullet/numbered lists, link creation, Undo/Redo, Save/Delete and structural rendering.
- Saved URLs are explicit user controls routed through the existing Tauri opener; editor links cannot navigate and there is no remote preview/fetch path.
- Notes expansion participates in the one-panel List Board interaction locks, is mutually exclusive with Subtasks, and Notes controls cannot initiate parent drag.
- Successful note writes refresh authoritative persistence; committed-write/refresh-failure is distinguished and blocks unsafe follow-up mutation.
- Added deterministic Rust/static coverage plus light/dark production visual fixtures for editable and aggregate read-only Notes states.

## USER-FACING PROGRESS

**`M-5/10 | 5/5 | 20/28`**

Completed five-checkpoint Rich Notes slice:

1. mandatory inspection + narrow rich-note mutation/read/UX contract — **COMPLETE**;
2. authoritative note command/frontend implementation + deterministic Rust/static/visual coverage + semantic/diff review — **COMPLETE**;
3. exact PR-head Windows CI — **COMPLETE**;
4. final exact-head review + expected-head merge — **COMPLETE**;
5. resulting-main Windows CI + tracking/work-log reconciliation — **COMPLETE** after this markdown-only reconciliation commit; validated source remains `766781b03caa01b9c70d7af10827d751d998caba`.

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

## ACTIVE IMPLEMENTATION SLICE

**Next ordered M5 item: Require explicit click/keyboard activation to open note URLs; do not auto-launch links when entering focus.**

No source changes for this new slice have been made by this reconciliation commit.

Before source changes, reconstruct the URL-open/focus transition contract from current source and:

- `docs/BLITZIT_HISTORY_RISK_INDEX.md` source-product risk N-01;
- Notes/focus behavior in `docs/SOURCE_AUDIT.md`, `docs/PRODUCT_SPEC.md`, `docs/UI_UX_SPEC.md`, and `docs/BEHAVIOR_MATRIX.md`;
- current `TaskNotes.tsx` explicit opener path;
- current Focus/Blitz task-live/session projection code and typed events.

Define a narrow five-checkpoint slice. The acceptance target is regression proof that URL opening can occur only from an explicit pointer/keyboard activation and never from entering focus, making/switching a task live, pause/resume, session events, renderer refresh/recreation, or focus-surface mode projection. Keep larger/resizable Notes editing and spellcheck separate.

## TRACKING STATE

- `TODO.md`: Rich task notes editor/viewer is checked; M5 is **20/28**.
- `STATUS.md`: **20/28**, validated source baseline `766781b03caa01b9c70d7af10827d751d998caba`.
- Latest immutable completed work log: `work-log/2026-09-11-1629-chatgpt-m5-rich-task-notes.md`.

## EXACT NEXT ACTION FOR A ZERO-CONTEXT AGENT

Begin the next ordered M5 slice: **Require explicit click/keyboard activation to open note URLs; do not auto-launch links when entering focus.** First perform the mandatory startup reads against the current repository, inspect the newest relevant work log and confirm there is no open unfinished implementation PR/CI. Then inspect all URL-open call sites and focus/live-task transition paths, record a narrow evidence-backed contract in `HANDOFF.md`, create a coherent feature branch, and implement deterministic anti-regression coverage before changing behavior unless source inspection proves a behavior defect.

## USER ACTION REQUIRED

**None.**

## BLOCKERS / NOT RUN

- No product/user decision blocks the next ordered slice.
- Local checkout/toolchain validation is unavailable in this connector environment because the container cannot resolve GitHub.
- Windows GitHub Actions remains authoritative for frontend, Rust/Tauri, visual and artifact validation.
