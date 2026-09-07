# HANDOFF.md

This is the canonical zero-context continuation state for Narro. Start with `AI_START_HERE.md`, `AGENTS.md`, `ENGINEERING_QUALITY.md`, `AGENT_WORKFLOW.md`, this file, the active Milestone 5 section in `TODO.md`, relevant `STATUS.md`, relevant `docs/UI_UX_SPEC.md` evidence, and the newest relevant immutable `work-log/*.md` entries.

## CURRENT MILESTONE

**Milestone 5 — Design system and Main window product UI.**

- Milestones 1–4: COMPLETE / PASS.
- Milestone 5: ACTIVE / 9 of 28 top-level items validated.
- Milestones 6–10: NOT STARTED.

## CURRENT VALIDATED SOURCE BASELINE

Latest fully main-validated source/test SHA:

`62d8d8a600ecdb6c42ba70db43f345a9687cfddf`

This is the guarded squash merge of PR #81 — `M5: add Home dashboard list cards`.

Validation evidence:

- final exact validated PR head `42655fcf712cbb72d28dd5ad93dc4943a56091e4`;
- Windows PR CI #288 / run `34150415778` / job `101831341373`: **SUCCESS**; repository preflight, Home light/dark Edge capture, visual artifact, Tauri release and diagnostic artifact all PASS;
- PR visual artifact `10029290625`, digest `sha256:584514e21547a69770b61b92922b7b65591c5e3df021a9f71822c8ccbab36c7b`;
- PR diagnostic artifact `10029428916`, digest `sha256:5d43cab738b2cb830d83a35d7d0f1b530e82bbd721364c7b92a5669b039b97ae`;
- exact-head diff/review check: PASS; 12 changed files, no PR comments, review submissions or inline threads requiring resolution;
- expected-head guarded squash merge produced `62d8d8a600ecdb6c42ba70db43f345a9687cfddf`;
- Windows resulting-main CI #289 / run `34153630279` / job `101840803319`: **SUCCESS**; repository preflight, Home light/dark Edge capture, visual artifact, Tauri release and diagnostic artifact all PASS;
- main visual artifact `10030335039`, digest `sha256:f2125065aa0d046165179d20870545c3f7bed4b02df831cb3b887984d4216d46`;
- main diagnostic artifact `10030472150`, digest `sha256:0111064264e0ac26334424a9605fc77f1af921c44e6f35880f36f3f85dfcf852`.

Markdown-only tracking descendants do not replace this validated source/test baseline.

## LATEST COMPLETED SLICE

**M5 Main UI — Home dashboard/list cards.**

Validated capabilities:

- read-only Home snapshot reuses validated `active_lists` / `active_tasks_in_bucket` SQLite persistence reads;
- archived lists and completed/archived tasks are excluded through those existing reads;
- list cards expose up to four pending task previews plus complete pending-count and aggregate-EST totals with checked arithmetic;
- default Home renders a neutral time-based greeting, `Your Lists`, helper copy, `All Lists` aggregate card and active-list baseline cards;
- cards reserve a fixed future action slot without implementing the next hover/Open/menu/create-list interaction states;
- stored icon paths are not rendered directly; list accent projection accepts only validated six-digit hex colors;
- loading, empty and typed-error states are present;
- main-window renderer recreation reloads Home from local SQLite rather than retaining hidden renderer authority;
- deterministic sample data exists only in visual fixtures;
- real Edge `home-light` / `home-dark` captures validate semantic hierarchy and theme-stable geometry;
- deterministic Home static/Rust coverage is part of repository preflight.

Detailed evidence: `work-log/2026-09-07-2154-chatgpt-m5-home-dashboard-list-cards.md`.

## USER-FACING PROGRESS

**`M-5/10 | 5/5 | 9/28`**

Home-dashboard/list-cards checkpoints:

1. mandatory startup + current-main/spec/domain/frontend/visual-harness inspection + narrow branch/scope — COMPLETE;
2. read-only Home snapshot + Home hierarchy/list-card implementation + deterministic contract/visual candidate review — COMPLETE;
3. exact PR-head Windows CI including repository preflight, Home dark/light capture, release and required artifacts — COMPLETE;
4. exact-head semantic/diff/review-thread check + expected-head guarded merge — COMPLETE;
5. resulting-main Windows CI + TODO/STATUS/HANDOFF/new immutable work-log reconciliation — COMPLETE.

A new slice has not yet been started. Reset the small-slice counter only after defining the next ordered item and its meaningful checkpoints.

## IMPORTANT INVARIANTS

- authoritative Rust/domain state and persistence-first mutation semantics remain unchanged;
- Home remains a read-only projection over validated persistence reads;
- main-window recreation derives Home data from SQLite, not hidden renderer state;
- validated App-shell and Home geometry/navigation/focus behavior must not regress;
- hover/focus controls must use the already reserved card action geometry and never reflow titles/cards or move pointer targets;
- reduced-motion and keyboard/focus accessibility remain required;
- excluded account/trial/upgrade/profile/AI/integration controls remain absent;
- diagnostics remain explicitly gated behind `?diagnostics=1`;
- deterministic fixture data must never appear as normal user data.

## NEXT AGENT ACTION

Perform mandatory startup again and start only the next ordered Milestone 5 item:

`List-card rest, hover/Open, overflow-menu and create-list states.`

Inspect the current validated `HomeDashboard`/card geometry, reusable overlay primitives, relevant `docs/UI_UX_SPEC.md` screenshot evidence and existing visual harness. Implement evidence-backed rest/hover/focus/Open affordance, overflow-menu state and create-list card state while preserving the fixed reserved action slot and no-layout-shift invariant. Do **not** absorb the separate Create/Edit List modal item, board/task editing, search palette, Settings content, Reports behavior, or later M5 work.

## USER ACTION REQUIRED

**None.**
