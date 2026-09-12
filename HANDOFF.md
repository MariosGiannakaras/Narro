# HANDOFF.md

Canonical zero-context continuation state for Narro. Before changing source, read `AI_START_HERE.md`, `AGENTS.md`, `ENGINEERING_QUALITY.md`, `AGENT_WORKFLOW.md`, this file, active Milestone 5 in `TODO.md`, relevant `STATUS.md`, current search/quick-action sections in `docs/PRODUCT_SPEC.md`, `docs/UI_UX_SPEC.md`, `docs/SOURCE_AUDIT.md`, `docs/BEHAVIOR_MATRIX.md`, `docs/BLITZIT_HISTORY_RISK_INDEX.md` when reliability risk applies, and the newest relevant immutable `work-log/*.md` entries. Inspect open implementation PRs and their exact CI state before making changes.

## CURRENT MILESTONE

**Milestone 5 — Design system and Main window product UI.**

- Milestones 1–4: COMPLETE / PASS.
- Milestone 5: ACTIVE / **24 of 28** top-level items validated.
- Milestones 6–10: NOT STARTED.

## CURRENT VALIDATED SOURCE BASELINE

Source/test SHA: `69c98ea107090e31589bb58299de603652336228`

Source tree: `0ae45142388df4dde7546c14ed1f1cf5b59d8c73`

This is the expected-head guarded merge of PR #96. Markdown-only tracking descendants do not replace this source baseline.

Latest main tracking tip at this slice start: `f58c35f334d46bee065c9ff050d5e1bbe2a8754f`.

## LATEST COMPLETED IMPLEMENTATION / CI

**M5 item 24/28 — List settings: name, icon, archive/delete flows.**

Immutable evidence: `work-log/2026-09-12-0220-chatgpt-m5-list-settings.md`.

- PR #96 final exact head `0a17f510f92fdb5bd364933cca04ce95624e755b`.
- Windows PR CI #378 / run `34655658720` / job `103447372737`: **SUCCESS**.
- Expected-head merge source SHA `69c98ea107090e31589bb58299de603652336228`.
- Windows main CI #379 / run `34656547631` / job `103450115073`: **SUCCESS**.
- Main visual artifact `10286422012`, digest `sha256:9fdbdc0f96ae93c6d24b6be8b069e9ac7e49415846408af61b3568177e3fd848`.
- Main diagnostic artifact `10285427967`, digest `sha256:b8f1f479c2ff8fe45075406980151d0ea887be369295cabafa11c14c24942678`.

## ACTIVE IMPLEMENTATION SLICE

**M5 item 25/28 — Search / quick-actions palette with keyboard-first behavior.**

Branch: `m5-search-palette`

Slice base: tracking tip `f58c35f334d46bee065c9ff050d5e1bbe2a8754f`; validated source/test baseline remains `69c98ea107090e31589bb58299de603652336228`.

### Checkpoint 1 — COMPLETE: reconstruction + narrow search contract

Repository/GitHub evidence:

- no open M5 implementation PR existed at slice start;
- current main stayed at tracking tip `f58c35f334d46bee065c9ff050d5e1bbe2a8754f`;
- source-product evidence shows a centered dimmed search palette opened by `Ctrl+F`, placeholder `Search for tasks, lists`, and only three evidenced quick actions: `Add new task`, `Add new list`, `Go to Reports`;
- official shortcut evidence says Search is unavailable in Blitz Mode; Narro main/focus bundles are separate, so this slice binds `Ctrl+F` only inside the main `AppShell` and introduces no focus-surface search behavior;
- Narro product spec limits main search results to local tasks and lists; this slice searches the active workspace only and deliberately excludes archived-list/task search because full archives are the next ordered M5 item;
- existing `get_home_snapshot` already supplies authoritative active lists and `get_list_board_snapshot` with the All Lists target already supplies authoritative active task rows across planning lanes, so no new Rust/SQLite search authority or schema is required;
- result activation is navigation-only: list results open that list board; task results open the owning list board. Opening/searching never mutates the database;
- the existing `createListBoardTask` boundary remains authoritative for the `Add new task` quick action. Because repository evidence does not establish a safe implicit list/lane default, the quick-create state requires explicit list + planning lane + title and publishes success only after the existing mutation resolves;
- `Add new list` reuses the validated List Editor create path; `Go to Reports` is navigation only;
- keyboard contract: opener/Search button and `Ctrl+F`, initial focus in query input, Arrow Up/Down option traversal, Enter through the focused option/action, Tab containment, Escape/backdrop dismissal, and opener focus restoration on dismissal; action/navigation transitions suppress stale focus restoration;
- no generic command framework, remote search, notes/subtask search, archive search, theme work, Focus Panel behavior, reports implementation, or account/cloud/integration surface is added.

### Five checkpoints

1. mandatory reconstruction + narrow search/quick-action contract — **COMPLETE**;
2. implementation + deterministic/runtime coverage + semantic/diff review — PENDING;
3. exact PR-head Windows CI — PENDING;
4. final exact-head review + expected-head merge — PENDING;
5. resulting-main Windows CI + TODO/STATUS/HANDOFF/work-log reconciliation — PENDING.

## INVARIANTS THAT MUST NOT REGRESS

- list/task/subtask identities remain stable across edit/archive/restore/reorder/move;
- renderer success is published only after authoritative local mutation succeeds;
- search opening/querying is read-only and local; no network or new database authority is introduced;
- quick task creation must use the existing persistence-first task create command and explicit user-selected list/lane;
- archive/restore preserves history and owned assets; permanent list deletion remains explicit, archive-only and irreversible;
- `All Lists` remains a synthetic aggregate/read-only list identity, never persisted as a mutable user list;
- task timer/session/Time Taken, scheduling/date-only/timezone/recurrence and reminder semantics remain unchanged;
- Notes retain one mounted compact/large editor path, explicit-only URL activation and native spellcheck-only behavior;
- card/menu/modal/overlay geometry must not shift because hover/focus actions appear;
- keyboard/focus-visible access and reduced-motion behavior remain required;
- no auth/cloud/telemetry/trial/upgrade/profile/AI/integration authority is introduced.

## EXACT NEXT ACTION FOR A ZERO-CONTEXT AGENT

Continue on `m5-search-palette`: implement the checkpoint-1 contract using the existing Home + All Lists read paths and existing task/list creation boundaries, add deterministic frontend static gates plus production Edge search-palette fixture/DOM validation, review the exact branch diff against `f58c35f...`, and only then open a PR for exact-head Windows CI.

## USER ACTION REQUIRED

**None.**

## BLOCKERS / NOT RUN

- No product/user decision blocks the current contract.
- Full local repository preflight is unavailable in this connector environment; Windows GitHub Actions remains authoritative for Rust/Tauri validation.
