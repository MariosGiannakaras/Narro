# HANDOFF.md

Canonical zero-context continuation state for Narro. Read `AI_START_HERE.md`, `AGENTS.md`, `ENGINEERING_QUALITY.md`, `AGENT_WORKFLOW.md`, this file, active Milestone 5 in `TODO.md`, relevant `STATUS.md`, list/archive sections in `docs/PRODUCT_SPEC.md`, `docs/UI_UX_SPEC.md`, `docs/SOURCE_AUDIT.md`, `docs/BEHAVIOR_MATRIX.md`, `docs/BLITZIT_HISTORY_RISK_INDEX.md`, and the newest relevant `work-log/*.md` entries before changing source.

## CURRENT MILESTONE

**Milestone 5 — Design system and Main window product UI.**

- Milestones 1–4: COMPLETE / PASS.
- Milestone 5: ACTIVE / **23 of 28** top-level items validated.
- Milestones 6–10: NOT STARTED.

## CURRENT VALIDATED SOURCE BASELINE

Source/test SHA: `d65b97b4f83a498bb0426b4d793449b8fd5e044b`

Source tree: `7c99559b708dd381892a2fb35d4df27dcf1c801e`

Latest main tracking tip at slice start: `30d08d9c9322fcfec3d274eea5dea83b124c56bd`. Markdown-only tracking descendants do not replace the validated source baseline.

## LATEST COMPLETED IMPLEMENTATION / CI

**M5 item 23/28 — native WebView/browser spellcheck on the existing Notes editor.**

Immutable evidence: `work-log/2026-09-12-0025-chatgpt-m5-notes-spellcheck.md`.

- PR #95 exact head `3affb7078f3bc89f6a6d03adeb0625c763a8f7c7`, Windows PR CI #370: **SUCCESS**;
- expected-head merge source SHA `d65b97b4f83a498bb0426b4d793449b8fd5e044b`;
- Windows main CI #371: **SUCCESS**.

## ACTIVE IMPLEMENTATION SLICE

**M5 item 24/28 — List settings: name, icon, archive/delete flows.**

Branch: `m5-list-settings`

Slice base: main tracking tip `30d08d9c9322fcfec3d274eea5dea83b124c56bd`.

### Checkpoint 1 — COMPLETE: reconstruction + list-settings contract

Repository evidence:

- no open implementation PR existed at slice startup;
- the existing Create/Edit List modal already main-validates rename, color and app-owned icon replacement through the M2 persistence-first update boundary; it is reused, not rewritten;
- M2 persistence already provides transactional/idempotent `archive_list` and `restore_list`, plus archive-first `permanently_delete_list`;
- active Archive is reversible and preserves list/task/history identity; permanent deletion is available only from archive, is explicit/irreversible, and removes list/tasks from user-facing report data;
- `All Lists` remains a synthetic aggregate view and is never archivable/deletable;
- full Archived Lists/Archived Done Tasks parity remains a later ordered M5 item. Item 24 owns only the minimal archived-list management dependency needed to make Restore/Permanent delete actually reachable.

### Checkpoint 2 — COMPLETE: implementation + deterministic/runtime coverage + semantic review

Reviewed source candidate before this HANDOFF-only checkpoint commit: `6f1f0ecc9a6c6f039acc134db1a57aa7d1abbee5`.

Implemented contract:

- existing Edit List modal remains the name/icon/color settings path and retains its validated icon file validation, owned-path guards and rollback semantics;
- active Home list cards now bind the already-present `Archive List` menu action to an explicit focus-contained confirmation dialog;
- archive UI awaits `archive_list_from_settings` before closing the confirmation or refreshing Home;
- new renderer-facing Rust commands reuse the M2 persistence functions for archive, restore and archive-only permanent deletion; archived list summaries are read from authoritative SQLite;
- the production `Archived lists` destination now exposes only minimal list management: archived list rows, Restore and Permanently delete;
- Restore and permanent-delete UI publish row removal only after their local persistence command resolves successfully; failures keep the surface/confirmation visible with an error;
- permanent list deletion reads the existing owned icon path before DB deletion, commits the archive-first database delete, then performs only best-effort owned `list-icons/<filename>` cleanup; non-owned paths are refused and cleanup failure cannot convert a committed deletion into a reported mutation failure;
- a reusable archive/delete confirmation dialog provides modal semantics, Escape dismissal, Tab containment, initial Cancel focus and opener focus restoration;
- deterministic source gates were added and the old list-card/list-editor tests were deliberately revised only to permit the now-ordered runtime Archive target while still forbidding the deferred Duplicate target;
- a dedicated production fixture entry covers active Archive confirmation, minimal archived list management and permanent-delete confirmation in light/dark; Windows Edge captured-DOM validation checks dialog semantics, stable archived list identities, Restore/delete controls and later-scope exclusion;
- fixture readiness is synchronous via `flushSync`; Vite differs from the slice base only by one fixture build-input line; no dependency/package-lock changes were introduced.

Semantic/diff review from `30d08d9c...` to the reviewed candidate found only the expected list-settings source/tests/tracking files. `src-tauri/src/lib.rs` adds the list-settings module and four command registrations only (plus a non-semantic final-newline diff from connector replacement); the visual capture script only adds the six light/dark list-settings captures; `AppShell.tsx` only gains archive confirmation/refresh and the archived-list destination. No task/timer/Notes/scheduling/schema/search/theme/Focus Panel behavior is changed.

Local full repository preflight remains unavailable in this connector environment. The Windows CI `cargo fmt --check`, TypeScript build, Rust check/clippy/tests and real Edge captures are authoritative for the next checkpoint.

### Five checkpoints

1. mandatory reconstruction + narrow list-settings/archive/delete contract — **COMPLETE**;
2. implementation + deterministic/runtime coverage + semantic/diff review — **COMPLETE**;
3. exact PR-head Windows CI — PENDING;
4. final exact-head review + expected-head merge — PENDING;
5. resulting-main Windows CI + TODO/STATUS/HANDOFF/work-log reconciliation — PENDING.

## USER-FACING PROGRESS

**`M-5/10 | 2/5 | 23/28`**

## INVARIANTS THAT MUST NOT REGRESS

- list/task/subtask identity remains stable across edit/archive/restore;
- list mutations publish success only after local persistence succeeds;
- archive/restore preserves history and owned icon assets; permanent delete remains explicit, archive-only and irreversible;
- committed mutations are not reported as failures merely because post-commit icon cleanup fails;
- All Lists remains an aggregate/read-only synthetic view, never a persisted mutable list;
- list-card/menu/modal geometry, keyboard/focus-visible access and reduced-motion behavior remain stable;
- existing Create/Edit list icon input validation, safe owned-path handling and rollback cleanup remain intact;
- the minimal archived list management dependency must not expand into Archived Done Tasks, archive search/filter or the later full archive-surface polish;
- Notes/timer/session/scheduling behavior remains out of scope;
- no account/cloud/integration controls are introduced.

## EXACT NEXT ACTION FOR A ZERO-CONTEXT AGENT

Open one PR from `m5-list-settings` to `main`, record its exact head SHA, and run the authoritative Windows CI. Inspect only evidence-backed failures. Require Repository Preflight (including frontend static gate, TypeScript/Vite build, Rust fmt/check/clippy/tests), production Edge list-settings captures/DOM validator, Tauri Release and required artifacts before advancing to final review/expected-head merge.

## USER ACTION REQUIRED

**None.**

## BLOCKERS / NOT RUN

- No product/user decision blocks the current contract.
- Full local repository preflight is unavailable in this connector environment; Windows GitHub Actions remains authoritative.
