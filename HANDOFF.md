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

Branch: `m5-home-dashboard-list-cards`, based on main docs tip `389690551ff834e8761311bb2b2b8d273b4ff4fc`.

Implemented candidate scope:

- read-only `home_snapshot` Rust read model composes validated `active_lists` and `active_tasks_in_bucket` persistence reads rather than duplicating mutation/storage logic;
- Home snapshot excludes archived lists and completed/archived tasks through those existing reads, caps preview rows at four while retaining full pending/aggregate EST totals, uses checked aggregate arithmetic, and has deterministic Rust regressions;
- Tauri `get_home_snapshot` opens/configures the local Narro SQLite database and returns stable `HOME_SNAPSHOT_FAILED` command errors without mutating domain state;
- default Home renders a neutral time-based greeting, `Your Lists`, screenshot-derived helper copy, an `All Lists` aggregate card, and active-list baseline cards with list accent, task previews, pending count and aggregate EST;
- baseline cards reserve a fixed future action slot but intentionally contain no Open, overflow-menu, edit/duplicate/archive, or create-list interaction states;
- stored icon paths are not rendered directly and stored list color is accepted only as validated six-digit hex CSS data;
- empty/loading/error states are present and Home data reloads from SQLite whenever a new main renderer is created;
- deterministic sample data is injected only into the Home visual fixture, never normal product mode;
- existing App-shell fixture is isolated from runtime IPC and the Windows Edge harness now captures/validates `home-light` and `home-dark` alongside foundation/App-shell captures;
- Home visual validation asserts screenshot dimensions, semantic hierarchy, representative cards, and identical dark/light geometry;
- deterministic `scripts/test-ui-home-dashboard.mjs` is wired into `preflight:frontend`;
- candidate diff from main is 12 files and is confined to branch handoff, Home read/UI integration, visual harness and preflight scope.

Source review caught and corrected before PR: a test-only invalid `expect_err` call, use of nonexistent theme token `--color-text-muted`, and fixture card wrapping that would have hidden part of the Home hierarchy in the fixed capture shell.

Local Node/Rust preflight: **NOT RUN** — this environment cannot obtain an executable checkout because outbound GitHub DNS/network access is unavailable. No local PASS is claimed. Windows CI is the authoritative reproducible gate.

## USER-FACING PROGRESS

**`M-5/10 | 2/5 | 8/28`**

Home-dashboard/list-cards checkpoints:

1. mandatory startup + current-main/spec/domain/frontend/visual-harness inspection + narrow branch/scope — COMPLETE;
2. read-only Home snapshot + Home hierarchy/list-card implementation + deterministic contract/visual candidate review — COMPLETE;
3. exact PR-head Windows CI including repository preflight, Home dark/light capture, release and required artifacts — PENDING;
4. exact-head semantic/diff/review-thread check + expected-head guarded merge — PENDING;
5. resulting-main Windows CI + TODO/STATUS/HANDOFF/new immutable work-log reconciliation — PENDING.

## IMPORTANT INVARIANTS

- authoritative Rust/domain state and persistence-first mutation semantics remain unchanged;
- the Home boundary is read-only and reuses validated list/task reads;
- main-window recreation derives Home data again from SQLite, not hidden renderer memory;
- validated App-shell geometry/navigation/focus behavior must not regress;
- baseline list-card geometry reserves later action space without dead controls or layout-shifting hover states;
- reduced-motion and keyboard/focus accessibility remain required;
- excluded account/trial/upgrade/profile/AI/integration controls remain absent;
- diagnostics remain explicitly gated behind `?diagnostics=1`;
- deterministic sample data must never appear as normal user data;
- do not absorb the next ordered `List-card rest, hover/Open, overflow-menu and create-list states` item into this slice.

## NEXT AGENT ACTION

Open/reuse one PR for `m5-home-dashboard-list-cards`, record its exact head SHA, and observe authoritative Windows CI on that exact head. Require repository preflight (including Home static/Rust tests), real Edge `home-light`/`home-dark` capture validation, visual artifact upload, Tauri release build, and diagnostic artifact upload to succeed. If CI fails, inspect the exact failure log and fix only evidence-backed problems; do not broaden scope.

After exact-head PASS, inspect changed files and all PR comments/reviews/inline threads, merge only with an expected-head guard, validate the resulting main source SHA with Windows CI, and only then mark `Home dashboard/list cards` complete and reconcile `TODO.md`, `STATUS.md`, `HANDOFF.md`, plus one new immutable work-log entry.

## USER ACTION REQUIRED

**None.**
