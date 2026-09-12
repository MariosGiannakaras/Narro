# HANDOFF.md

Canonical zero-context continuation state for Narro. Before changing source, read `AI_START_HERE.md`, `AGENTS.md`, `ENGINEERING_QUALITY.md`, `AGENT_WORKFLOW.md`, this file, active Milestone 5 in `TODO.md`, relevant `STATUS.md`, theme-related sections in `docs/PRODUCT_SPEC.md`, `docs/UI_UX_SPEC.md`, `docs/SOURCE_AUDIT.md`, `docs/BEHAVIOR_MATRIX.md`, and the newest relevant immutable `work-log/*.md` entries. Inspect open implementation PRs and their exact CI state before making changes.

## CURRENT MILESTONE

**Milestone 5 — Design system and Main window product UI.**

- Milestones 1–4: COMPLETE / PASS.
- Milestone 5: ACTIVE / **26 of 28** top-level items validated.
- Milestones 6–10: NOT STARTED.

## CURRENT VALIDATED SOURCE BASELINE

Source/test SHA: `e142ff2f7d131570f01b5daf24d1122e4f219620`

Source tree: `505e62200da03b8469e7036c241dcc1e45b06e78`

This is the resulting-main source merge of PR #98. The markdown-only tracking commit containing this HANDOFF does not replace this source baseline.

## LATEST COMPLETED IMPLEMENTATION / CI

**M5 item 26/28 — Archived lists/tasks surfaces.**

Immutable evidence: `work-log/2026-09-12-2102-chatgpt-m5-archives.md`.

Implementation/validation evidence:

- implementation branch: `m5-archives`;
- final exact PR head: `221b4c888294d563c13b5b280017ca1f59b77590`;
- PR #98: `M5: add archived lists and done task surfaces`;
- Windows PR CI #385 / run `34701194858` / job `103573146278`: **SUCCESS**;
- PR visual artifact `10299679369`, digest `sha256:62839495d4c0704d3d8de5382f4a149f178b9a8e879993cf0e998c101da9a88d`;
- PR diagnostic artifact `10300690015`, digest `sha256:166e901be83ed5e6b135fa29e9fbc2f6f43a95450c54c3fcd1184354eb81ad4a`;
- final PR metadata: 25 commits / 20 changed files; no submitted reviews, issue comments, or inline review comments;
- merge source SHA: `e142ff2f7d131570f01b5daf24d1122e4f219620`;
- Windows main CI #386 / run `34701768320` / job `103574673946`: **SUCCESS**;
- main visual artifact `10301150038`, digest `sha256:931157337934c352a0c0a52793d0e65468902f9b3e9ea12b9130de7ae57e4ca8`;
- main diagnostic artifact `10300770757`, digest `sha256:c19f3397e0c56dc751475924f676f1569973a0493741f3c5c6a14954d0f8ed0a`.

Completed capability:

- one archive destination now exposes source-evidenced sibling `Archived lists` / `Archived done tasks` segments;
- existing archived-list Restore and archive-only permanent deletion remain persistence-first and unchanged;
- completed tasks on active lists strictly older than 60 days are automatically archived through an idempotent Rust/SQLite sweep using existing task archive state;
- archived-list tasks are excluded from the active-list Archived Done Tasks projection;
- normal task archival preserves identity, completion history, sessions and authoritative Time Taken/report eligibility;
- Archived Done Tasks is read-only in this slice and provides local Search, `All Lists` / active-list filtering, and loading/error/empty/results states;
- no speculative archived-task Restore/Delete controls were added because they are not evidenced by the current source surface;
- dedicated deterministic fixtures and Windows Edge light/dark capture/DOM validation cover lists-empty, done-empty, filter-open and populated-results states;
- no schema/dependency/lockfile, timer/session engine, scheduling, Notes, Focus Panel, Reports implementation, or account/cloud/integration source changed.

## ACTIVE IMPLEMENTATION SLICE

**M5 item 27/28 — Light/dark/system theme.**

No item-27 implementation branch or PR should be assumed from this reconciliation. Reconstruct exact current main/open-PR state before source changes.

The existing shared theme-token and visual-fixture foundation from earlier M5 work is a validated dependency. Item 27 must implement the evidenced user preference (`System`, `Dark`, `Light`) and hierarchy-preserving runtime application/persistence without redesigning the token system or absorbing unrelated Preferences work from M8.

## INVARIANTS THAT MUST NOT REGRESS

- list/task/subtask identities remain stable across edit/archive/restore/reorder/move;
- renderer success is published only after authoritative local mutation succeeds;
- list archive/restore preserves history and owned assets; permanent list deletion remains explicit, archive-only and irreversible;
- automatic done-task archival is idempotent, strict at the 60-day boundary, and preserves historical task/session data;
- archived-list tasks are not duplicated into the active-list archived-done projection;
- `All Lists` remains a synthetic aggregate/read-only identity, never persisted as a mutable user list;
- Search remains local/read-only; its quick task mutation continues to use the existing persistence-first create boundary;
- timer/session/Time Taken, scheduling/date-only/timezone/recurrence/reminders and Notes behavior remain unchanged;
- keyboard/focus-visible access and reduced-motion behavior remain required;
- theme changes must be presentation/preferences only and may not reset authoritative domain/runtime state;
- no auth/cloud/telemetry/trial/upgrade/profile/AI/integration authority is introduced.

## EXACT NEXT ACTION FOR A ZERO-CONTEXT AGENT

Re-run the mandatory startup sequence from the current repository. Confirm `main` includes the item-26 reconciliation tracking commit, confirm no unfinished implementation PR supersedes it, then reconstruct the exact item-27 theme contract from `TODO.md`, `STATUS.md`, `docs/UI_UX_SPEC.md`, `docs/PRODUCT_SPEC.md`, current theme-token/CSS/fixture code, and existing preferences persistence. Determine where `System` resolves to the Windows/browser color scheme, how the selection is persisted, and how both normal webviews consume it without duplicating authority. Only then create a coherent item-27 branch and deterministic Windows coverage. Do not absorb other M8 Preferences families or the final M5 cloud/account-control removal item.

## USER ACTION REQUIRED

**None.**

## BLOCKERS / NOT RUN

- No product/user decision currently blocks theme reconstruction.
- Full local repository preflight is unavailable in this connector environment; Windows GitHub Actions remains authoritative for Rust/Tauri validation.
