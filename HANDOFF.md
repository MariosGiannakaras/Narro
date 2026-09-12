# HANDOFF.md

Canonical zero-context continuation state for Narro. Before changing source, read `AI_START_HERE.md`, `AGENTS.md`, `ENGINEERING_QUALITY.md`, `AGENT_WORKFLOW.md`, this file, active Milestone 5 in `TODO.md`, relevant `STATUS.md`, archive-related sections in `docs/PRODUCT_SPEC.md`, `docs/UI_UX_SPEC.md`, `docs/SOURCE_AUDIT.md`, `docs/BEHAVIOR_MATRIX.md`, `docs/BLITZIT_HISTORY_RISK_INDEX.md` when reliability risk applies, and the newest relevant immutable `work-log/*.md` entries. Inspect open implementation PRs and their exact CI state before making changes.

## CURRENT MILESTONE

**Milestone 5 — Design system and Main window product UI.**

- Milestones 1–4: COMPLETE / PASS.
- Milestone 5: ACTIVE / **25 of 28** top-level items validated.
- Milestones 6–10: NOT STARTED.

## CURRENT VALIDATED SOURCE BASELINE

Source/test SHA: `16552791479e6621deca6fa146b0cfc9a3301734`

Source tree: `290abfbc28e79eeb6ea0ab38e18989c759a8eea5`

This is the expected-head guarded merge of PR #97. Markdown-only tracking descendants do not replace this source baseline.

Latest reconciled main tracking tip at item-26 start: `a2a492c39bdc6bad2ee416af179fe818d10f66dd`.

## LATEST COMPLETED IMPLEMENTATION / CI

**M5 item 25/28 — Search / quick-actions palette with keyboard-first behavior.**

Immutable evidence: `work-log/2026-09-12-1123-chatgpt-m5-search-palette.md`.

- final exact PR head `ac21ecfff142f5b131d16b153fa7f23c37e336b2`;
- Windows PR CI #380 / run `34679557187` / job `103515510436`: **SUCCESS**;
- expected-head guarded merge source SHA `16552791479e6621deca6fa146b0cfc9a3301734`;
- Windows main CI #381 / run `34682513395` / job `103523630237`: **SUCCESS**.

## ACTIVE IMPLEMENTATION SLICE

**M5 item 26/28 — Archived lists/tasks surfaces.**

Branch: `m5-archives`

Slice base: reconciled main tracking tip `a2a492c39bdc6bad2ee416af179fe818d10f66dd`; validated source/test baseline remains `16552791479e6621deca6fa146b0cfc9a3301734`.

### Checkpoint 1 — COMPLETE: reconstruction + narrow archive contract

Repository/open-PR state:

- current main remained `a2a492c39bdc6bad2ee416af179fe818d10f66dd` at slice start;
- no open M5 implementation PR existed;
- item 26 is the first unchecked M5 top-level item.

Source-evidenced contract:

- the Archive destination is one surface with sibling `Archived lists` / `Archived done tasks` segments;
- the existing validated `ArchivedListsPanel` remains the list-management authority: Restore and archive-only permanent deletion stay persistence-first and unchanged;
- `Archived done tasks` is a read-only historical task surface for this slice; supplied/current evidence establishes Search, a list filter containing `All Lists` plus individual lists, and an empty state, but does **not** establish Restore/Delete controls there;
- completed tasks older than 60 days are automatically archived; Narro will implement this as an idempotent authoritative sweep over `completed_at`/`archived_at`, with a strict older-than-60-days cutoff;
- the sweep must not clone/change task identity, sessions, notes, subtasks, schedule fields or Time Taken; normal archive preserves report/history semantics;
- tasks belonging to an archived list remain represented by the Archived Lists lifecycle rather than being duplicated into the active-list Archived Done Tasks projection;
- archived-done filtering/search stays renderer-local after one authoritative local snapshot; no network/search backend/schema migration is introduced;
- stale Done tasks are swept before relevant board/archive projections so they no longer remain visible in Done merely because the archive page has not been visited first.

Implementation shape:

- add a narrow Rust `archived_tasks` renderer boundary reusing existing task/list persistence and metadata reads;
- add deterministic 60-day sweep tests including exact-boundary/idempotence/archived-list exclusion/history preservation;
- add a production archive shell/panel that segments the existing Archived Lists panel and the new Archived Done Tasks panel;
- add static frontend guards plus Windows Edge light/dark archive captures/DOM validation;
- do not absorb theme switching, Focus Panel, Reports implementation, account/cloud/integration controls, or speculative task-archive actions.

### Five checkpoints

1. mandatory reconstruction + narrow archive contract — **COMPLETE**;
2. implementation + deterministic/runtime coverage + semantic/diff review — PENDING;
3. exact PR-head Windows CI — PENDING;
4. final exact-head review + expected-head merge — PENDING;
5. resulting-main Windows CI + TODO/STATUS/HANDOFF/work-log reconciliation — PENDING.

## INVARIANTS THAT MUST NOT REGRESS

- list/task/subtask identities remain stable across edit/archive/restore/reorder/move;
- renderer success is published only after authoritative local mutation succeeds;
- list archive/restore preserves history and owned assets; permanent list deletion remains explicit, archive-only and irreversible;
- committed DB deletion must not be reported as failed because best-effort post-commit owned-icon cleanup fails;
- automatic done-task archival is idempotent and changes only `archived_at`/`updated_at` for eligible completed tasks;
- normal task archival preserves sessions/notes/subtasks and historical report eligibility; permanent task deletion semantics remain unchanged;
- archived-list tasks are not duplicated into the active-list archived-done projection;
- `All Lists` remains a synthetic aggregate/read-only identity, never persisted as a mutable user list;
- Search remains local/read-only; its quick task mutation continues to use the existing persistence-first create boundary;
- timer/session/Time Taken, scheduling/date-only/timezone/recurrence/reminders and Notes behavior remain unchanged;
- keyboard/focus-visible access and reduced-motion behavior remain required;
- no auth/cloud/telemetry/trial/upgrade/profile/AI/integration authority is introduced.

## EXACT NEXT ACTION FOR A ZERO-CONTEXT AGENT

Implement the item-26 contract on `m5-archives`: authoritative archived-done snapshot + 60-day sweep, segmented archive UI, local search/list filter/empty states, deterministic Rust/static coverage, and Windows Edge fixture/capture validation. Review the exact diff against `a2a492c...`, record unavailable local preflight as NOT RUN, then open one PR and validate its exact head with Windows CI before any merge.

## USER ACTION REQUIRED

**None.**

## BLOCKERS / NOT RUN

- No product/user decision blocks this contract.
- Full local repository preflight is unavailable in this connector environment; Windows GitHub Actions remains authoritative for Rust/Tauri validation.
