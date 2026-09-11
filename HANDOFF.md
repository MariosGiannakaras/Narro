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
- the existing Create/Edit List modal already main-validates rename, color and app-owned icon replacement through the M2 persistence-first update boundary; it must be reused, not rewritten;
- Home list-card UI already has callback-gated `Archive List`; production `AppShell` intentionally leaves it unbound from the earlier M5 slice;
- M2 persistence already provides transactional/idempotent `archive_list` and `restore_list`, plus `permanently_delete_list` which rejects active lists;
- product/spec evidence is explicit: active list Archive removes it from active workspace while retaining history; archived list Restore preserves the same identities; permanent deletion is available only from archive, requires explicit confirmation, is irreversible, and removes list/tasks from user-facing report data;
- archive must retain the list's app-owned icon because restore is reversible; after a successful permanent delete an owned icon may be cleaned best-effort, but a cleanup failure after the database commit must not turn the committed delete into a reported mutation failure;
- `All Lists` remains a synthetic aggregate view and is never archivable/deletable;
- full Archived Lists/Archived Done Tasks visual parity is a later ordered M5 item. A minimal production archived-list management projection is nevertheless a strict dependency of this item so Restore/Permanent delete are actually reachable; do not absorb Archived Done Tasks, archive search/filter, or the later full surface polish.

Narrow contract:

- keep existing Edit List modal as the name/icon/color settings path and preserve its icon-validation/rollback semantics;
- wire active Home `Archive List` through an explicit confirmation UI and a typed renderer-facing command reusing `persistence::lists::archive_list`; only after local commit may Home refresh/remove the card;
- expose archived lists from authoritative SQLite with only the fields required for management and render the minimal `archived-lists` production destination;
- provide Restore and Permanently delete actions for archived lists; Restore keeps identity/tasks/history, while permanent delete requires a second explicit destructive confirmation and reuses the M2 archive-first persistence boundary;
- add typed UUID/input/not-found/state/general failures; mutation failures keep the relevant UI visible and do not publish optimistic success;
- if permanently deleting a list with an app-owned icon, clean the owned file only after database deletion commits; non-owned paths are never removed and cleanup failure is warning-only after commit;
- deterministic static + Windows captured-DOM coverage must prove active Archive confirmation, archived Restore/delete controls, delete confirmation, failure-safe/persistence-first wiring, and the archive-first restriction without implementing search, archived done tasks, theme work or Focus Panel work.

### Five checkpoints

1. mandatory reconstruction + narrow list-settings/archive/delete contract — **COMPLETE**;
2. implementation + deterministic/runtime coverage + semantic/diff review — PENDING;
3. exact PR-head Windows CI — PENDING;
4. final exact-head review + expected-head merge — PENDING;
5. resulting-main Windows CI + TODO/STATUS/HANDOFF/work-log reconciliation — PENDING.

## USER-FACING PROGRESS

**`M-5/10 | 1/5 | 23/28`**

## INVARIANTS THAT MUST NOT REGRESS

- list/task/subtask identity remains stable across edit/archive/restore;
- list mutations publish success only after local persistence succeeds;
- archive/restore preserves history and owned icon assets; permanent delete remains explicit, archive-only and irreversible;
- committed mutations are not reported as failures merely because post-commit icon cleanup fails;
- All Lists remains an aggregate/read-only synthetic view, never a persisted mutable list;
- list-card/menu/modal geometry, keyboard/focus-visible access and reduced-motion behavior remain stable;
- existing Create/Edit list icon input validation, safe owned-path handling and rollback cleanup remain intact;
- Notes/timer/session/scheduling behavior remains out of scope;
- no account/cloud/integration controls are introduced.

## EXACT NEXT ACTION FOR A ZERO-CONTEXT AGENT

Implement checkpoint 2 on `m5-list-settings`: add the narrow typed Rust/list-settings renderer boundary over existing M2 archive/restore/permanent-delete persistence, add frontend API + active Archive confirmation + minimal production archived-list management/restore/delete confirmation, add deterministic static and Windows DOM/visual fixture coverage, deliberately revise old tests that forbade runtime Archive wiring, then review the exact diff before opening a PR.

## USER ACTION REQUIRED

**None.**

## BLOCKERS / NOT RUN

- No product/user decision blocks the current contract.
- Full local repository preflight is unavailable in this connector environment; Windows GitHub Actions remains authoritative.
