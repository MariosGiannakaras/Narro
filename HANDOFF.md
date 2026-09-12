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

- current main remained `a2a492c39bdc6bad2ee416af179fe818d10f66dd` at slice start;
- no open M5 implementation PR existed;
- source evidence fixes one archive destination with sibling `Archived lists` / `Archived done tasks` segments;
- existing Archived Lists Restore and archive-only permanent-delete flows remain persistence-first and unchanged;
- Archived Done Tasks is read-only in this slice: Search, `All Lists` / individual-list filter and empty state are evidenced, but Restore/Delete controls are not;
- completed tasks strictly older than 60 days auto-archive through an idempotent authoritative sweep over existing `completed_at` / `archived_at` fields;
- archived-list tasks are excluded from the active-list Archived Done Tasks projection; no new schema/network/search authority is introduced;
- normal archival must preserve task identity, completion, sessions, notes/subtasks and Time Taken/report history.

### Checkpoint 2 — COMPLETE: implementation + deterministic/runtime coverage + semantic/diff review

Reviewed implementation candidate before this HANDOFF-only checkpoint commit:

`fab25bc767f76f3e748ff717b2ea5adbf9fc3552`

Implemented scope:

- extended the existing archive renderer boundary with an `ArchiveSnapshot` containing archived lists, archived completed tasks and active list-filter options;
- added an atomic strict-60-day sweep that updates only eligible completed tasks on active lists, is idempotent, and fails closed on invalid stored completion timestamps;
- archive projection reuses authoritative task Time Taken/session accounting and excludes tasks owned by archived lists from the sibling done-task surface;
- board reads trigger the same authoritative archive snapshot first, so stale >60-day Done tasks are swept before Done is projected;
- `ArchivePanel` now composes sibling Archived Lists / Archived Done Tasks tabs while reusing the already validated `ArchivedListsPanel` lifecycle actions;
- Archived Done Tasks adds local case-insensitive task/list search, `All Lists` plus active-list filter, loading/error/empty/results states and read-only historical rows;
- deterministic archive fixtures cover lists-empty, done-empty, filter-open and populated results in light/dark;
- added `test-ui-archives.mjs`, a dedicated Windows Edge archive capture harness, captured-DOM validation and package/preflight wiring;
- retained all item-24 persistence-first list restore/delete and confirmation/focus guards; stale item-24 static expectations were updated only for the new composition/API shape;
- no dependencies/lockfile, schema, timer/session engine, scheduling, Notes, Focus Panel, Reports implementation, theme switching, or account/cloud/integration source changed.

Semantic/diff review against `a2a492c...` found 18 changed files, all within archive production UI/Rust projection, deterministic test/capture/config wiring, and this HANDOFF. Two pre-CI issues found during review were corrected before candidate freeze: an undefined `--elevation-popover` token was replaced with validated `--elevation-overlay`, and `Intl.DateTimeFormat.dateStyle` was replaced with ES2020-compatible explicit year/month/day options.

Full local repository preflight is **NOT RUN** because this connector environment has no local checkout/toolchain. Windows GitHub Actions remains the authoritative compile/typecheck/Rust/Edge/release gate.

### Five checkpoints

1. mandatory reconstruction + narrow archive contract — **COMPLETE**;
2. implementation + deterministic/runtime coverage + semantic/diff review — **COMPLETE**;
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

Open one PR from `m5-archives` to `main`, record the exact PR head SHA, and run/inspect authoritative Windows CI. Require Repository Preflight, production Edge archive light/dark captures/DOM validation, Tauri Release and required artifact uploads. Fix only evidence-backed failures; do not advance checkpoint 3 until the exact PR head succeeds.

## USER ACTION REQUIRED

**None.**

## BLOCKERS / NOT RUN

- No product/user decision blocks this contract.
- Full local repository preflight is unavailable in this connector environment; Windows GitHub Actions remains authoritative for Rust/Tauri validation.
