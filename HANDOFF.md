# HANDOFF.md

This is the canonical zero-context continuation state for Narro. Start with `AI_START_HERE.md`, `AGENTS.md`, `ENGINEERING_QUALITY.md`, `AGENT_WORKFLOW.md`, this file, the active Milestone 5 section in `TODO.md`, relevant `STATUS.md`, relevant `docs/UI_UX_SPEC.md` evidence, and the newest relevant immutable `work-log/*.md` entries.

## CURRENT MILESTONE

**Milestone 5 — Design system and Main window product UI.**

- Milestones 1–4: COMPLETE / PASS.
- Milestone 5: ACTIVE / 8 of 28 top-level items validated.
- Milestones 6–10: NOT STARTED.

## CURRENT VALIDATED SOURCE BASELINE

Latest fully main-validated source/test SHA:

`31f84a1fe2064e59ea27acc7c9afa9f650669608`

This is the squash merge of PR #80 — `M5: add app shell navigation`; Windows resulting-main CI #286 / run `34146374105` / job `101819196686` passed repository preflight, real Edge visual capture, Tauri release and required artifacts. Markdown-only tracking descendants do not replace this source/test baseline.

## ACTIVE SLICE

**M5 Main UI — Home dashboard/list cards.**

Branch: `m5-home-dashboard-list-cards`, created from current main docs tip `389690551ff834e8761311bb2b2b8d273b4ff4fc`.

Scope established from current evidence:

- preserve the validated App-shell hierarchy and build the Home content inside its central workspace;
- add a neutral time-based greeting/title area, `Your Lists`, and helper copy matching the current screenshot hierarchy without adding account/profile identity;
- render the evidenced All Lists aggregate card plus active-list baseline cards;
- baseline card content includes color/icon chip treatment, list title, up to four task previews, pending count and aggregate EST;
- normal product data must come from authoritative local SQLite through existing validated `active_lists` / `active_tasks_in_bucket` persistence primitives, exposed through a narrow read-only Home snapshot command;
- deterministic sample list data is allowed only inside visual fixtures;
- reserve stable future action geometry but do not implement the next ordered list-card hover/Open, overflow-menu, or create-list interaction states;
- do not implement create/edit-list modal, board/task editing, search palette, Settings content, Reports behavior, or later M5 items.

Startup/evidence/domain/frontend inspection is complete. No open implementation PR existed at slice start. Local Node/Rust preflight remains **NOT RUN** in this connector-only environment until/unless an executable checkout becomes available; authoritative Windows CI remains required.

## USER-FACING PROGRESS

**`M-5/10 | 1/5 | 8/28`**

Home-dashboard/list-cards checkpoints:

1. mandatory startup + current-main/spec/domain/frontend/visual-harness inspection + narrow branch/scope — COMPLETE;
2. read-only Home snapshot + Home hierarchy/list-card implementation + deterministic contract/visual candidate review — PENDING;
3. exact PR-head Windows CI including repository preflight, Home dark/light capture, release and required artifacts — PENDING;
4. exact-head semantic/diff/review-thread check + expected-head guarded merge — PENDING;
5. resulting-main Windows CI + TODO/STATUS/HANDOFF/new immutable work-log reconciliation — PENDING.

## IMPORTANT INVARIANTS

- authoritative Rust/domain state and persistence-first mutation semantics remain unchanged;
- the new Home boundary is read-only and must not duplicate or bypass validated list/task mutation services;
- main-window recreation derives Home data again from SQLite, not hidden renderer memory;
- validated App-shell geometry/navigation/focus behavior must not regress;
- baseline list-card geometry must reserve later action space without implementing dead controls or layout-shifting hover states;
- reduced-motion and keyboard/focus accessibility remain required;
- excluded account/trial/upgrade/profile/AI/integration controls remain absent;
- diagnostics remain explicitly gated behind `?diagnostics=1`;
- deterministic sample data must never appear as normal user data.

## NEXT AGENT ACTION

Implement the narrow read-only Home snapshot by composing existing list/task persistence reads, add deterministic Rust regression coverage, then render the Home dashboard/list-card baseline through a reusable React component. Extend the existing real-Edge visual harness with representative Home light/dark fixtures and deterministic semantic/geometry checks. Review the candidate diff before opening one PR.

## USER ACTION REQUIRED

**None.**
