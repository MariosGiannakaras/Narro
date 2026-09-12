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

This is the expected-head guarded merge of PR #97. The markdown-only tracking commit containing this HANDOFF does not replace this source baseline.

## LATEST COMPLETED IMPLEMENTATION / CI

**M5 item 25/28 — Search / quick-actions palette with keyboard-first behavior.**

Immutable evidence: `work-log/2026-09-12-1123-chatgpt-m5-search-palette.md`.

- implementation branch: `m5-search-palette`;
- final exact PR head `ac21ecfff142f5b131d16b153fa7f23c37e336b2`;
- Windows PR CI #380 / run `34679557187` / job `103515510436`: **SUCCESS**;
- PR visual artifact `10293842373`, digest `sha256:7af4349267134d038686f476c15545ab1401b448f0b5ae4d652e53c1a888916b`;
- PR diagnostic artifact `10293942591`, digest `sha256:445eba5a3e04419e97a02e7f410f9b24d3a478a19af10a4a3e8f2f57926317a5`;
- final review: mergeable, no submitted reviews, no unresolved review threads;
- expected-head guarded merge source SHA `16552791479e6621deca6fa146b0cfc9a3301734`;
- Windows main CI #381 / run `34682513395` / job `103523630237`: **SUCCESS**;
- main visual artifact `10294496874`, digest `sha256:efcd0975f97abf892938ba2fbda1ad4d1f62e1a82fb754b63d31a69323d7f632`;
- main diagnostic artifact `10294497209`, digest `sha256:4880b908e4092395f6717a5fa1bc55885ab9eeca1361a1ff61dccea24e03a506`.

Completed capability:

- main Search utility and `Ctrl+F` open the same centered keyboard-first palette;
- search is local/read-only over authoritative active lists plus All Lists task projection; no new Rust/SQLite/schema/network authority exists;
- list/task matches navigate without mutating state;
- only `Add new task`, `Add new list`, `Go to Reports` quick actions are present;
- quick task creation requires explicit title/list/planning lane and publishes success only after existing `createListBoardTask` persistence succeeds;
- Add new list reuses the validated List Editor path; Reports is navigation-only;
- modal focus contract covers initial focus, Arrow traversal, Tab containment, Escape/backdrop dismissal and focus restoration;
- production Windows Edge light/dark fixtures validate quick-actions, result, no-result and quick-task-create states.

## ACTIVE IMPLEMENTATION SLICE

**M5 item 26/28 — Archived lists/tasks surfaces.**

No implementation branch or PR should be assumed from this reconciliation. Reconstruct exact current main/open-PR state before source changes.

Current validated dependency from item 24:

- production `ArchivedListsPanel` already exposes authoritative archived list rows with Restore and archive-only permanent deletion;
- active-list Archive is already persistence-first and confirmed;
- archive/restore preserves list/task/history identity;
- permanent list deletion is explicit, irreversible, archive-only, removes user-facing report history according to established persistence semantics, and performs owned-icon cleanup only after committed DB deletion;
- `All Lists` remains synthetic/non-archivable.

The ordered item 26 must now determine and implement the **full source-evidenced archived lists/tasks surface**, rather than merely the minimal management dependency item 24 added.

## INVARIANTS THAT MUST NOT REGRESS

- list/task/subtask identities remain stable across edit/archive/restore/reorder/move;
- renderer success is published only after authoritative local mutation succeeds;
- list archive/restore preserves history and owned assets; permanent list deletion remains explicit, archive-only and irreversible;
- committed DB deletion must not be reported as failed because best-effort post-commit owned-icon cleanup fails;
- permanent task deletion remains excluded from user-facing reports while normal archived history remains represented according to existing domain rules;
- `All Lists` remains a synthetic aggregate/read-only identity, never persisted as a mutable user list;
- Search remains local/read-only; its quick task mutation continues to use the existing persistence-first create boundary;
- timer/session/Time Taken, scheduling/date-only/timezone/recurrence/reminders and Notes behavior remain unchanged unless archive parity explicitly requires read-only projection of existing data;
- keyboard/focus-visible access and reduced-motion behavior remain required;
- no auth/cloud/telemetry/trial/upgrade/profile/AI/integration authority is introduced.

## EXACT NEXT ACTION FOR A ZERO-CONTEXT AGENT

Re-run the mandatory startup sequence from the current repository. Confirm `main` includes the markdown-only reconciliation and that no unfinished implementation PR supersedes it. Then audit archive evidence in `docs/PRODUCT_SPEC.md`, `docs/UI_UX_SPEC.md`, `docs/SOURCE_AUDIT.md`, `docs/BEHAVIOR_MATRIX.md`, the current `ArchivedListsPanel`/list-settings API, and existing task archive/delete persistence/read APIs. Define a narrow item-26 contract that distinguishes archived lists from archived/done tasks, preserves historical/report semantics, and identifies exactly which archive actions are evidenced. Only then create a coherent item-26 feature branch and implement deterministic source/Windows Edge coverage. Do not absorb the later theme item, Focus Panel, Reports implementation or excluded cloud/account controls.

## USER ACTION REQUIRED

**None.**

## BLOCKERS / NOT RUN

- No product/user decision is currently known to block archive-surface reconstruction.
- Full local repository preflight is unavailable in this connector environment; Windows GitHub Actions remains authoritative for Rust/Tauri validation.
