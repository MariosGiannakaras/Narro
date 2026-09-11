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

## LATEST COMPLETED IMPLEMENTATION / CI

**M5 item 24/28 — List settings: name, icon, archive/delete flows.**

Immutable evidence: `work-log/2026-09-12-0220-chatgpt-m5-list-settings.md`.

### Exact PR-head validation

- PR #96: `M5: add list settings archive and delete flows`.
- Final exact head: `0a17f510f92fdb5bd364933cca04ce95624e755b`.
- Windows PR CI #378: run `34655658720`, job `103447372737`, **SUCCESS**.
- Repository Preflight, Windows Edge captures/DOM validation, Tauri Release, visual artifact upload and diagnostic artifact upload: **PASS**.
- PR visual artifact `10286345586`, digest `sha256:7252b8f053ef4316c72a1c3325fba5afd0a767741d48178edc4392035264902e`.
- PR diagnostic artifact `10285591255`, digest `sha256:7d467a95a6f0c4054ad4adf2ec0b853674afa6645ea488bf0aa27dbefc9408fe`.
- Final review: mergeable; 31 commits ahead / 0 behind base; no submitted reviews; no unresolved review threads.
- Earlier failed PR runs did not advance progress. Evidence-backed fixes were limited to stale deterministic guards, rustfmt formatting, and explicit SQLite connection drops before Windows test-directory cleanup.

### Merge and resulting-main validation

- Expected-head guarded merge source SHA: `69c98ea107090e31589bb58299de603652336228`.
- Source tree: `0ae45142388df4dde7546c14ed1f1cf5b59d8c73`.
- Windows main CI #379: run `34656547631`, job `103450115073`, **SUCCESS**.
- Repository Preflight, Windows Edge captures/DOM validation, Tauri Release, visual artifact upload and diagnostic artifact upload: **PASS**.
- Main visual artifact `10286422012`, digest `sha256:9fdbdc0f96ae93c6d24b6be8b069e9ac7e49415846408af61b3568177e3fd848`.
- Main diagnostic artifact `10285427967`, digest `sha256:b8f1f479c2ff8fe45075406980151d0ea887be369295cabafa11c14c24942678`.

### Completed capability

- the existing validated Create/Edit List modal remains the only name/icon/color editor;
- active-list Archive is wired from list-card settings to an explicit keyboard/focus-contained confirmation;
- archive, restore and permanent-delete commands reuse authoritative local persistence and publish success only after mutation success;
- Archived lists now has the minimal management dependency required by this item: authoritative archived rows, Restore and archive-only permanent deletion;
- permanent deletion is explicit and irreversible, commits database deletion before best-effort app-owned icon cleanup, and refuses non-owned icon paths;
- archive/restore preserves list/task/history identity; `All Lists` remains a synthetic aggregate and cannot be archived/deleted;
- production Windows Edge fixtures validate light/dark active Archive, archived-list management and permanent-delete confirmation;
- search, full archive parity, theme work, Focus Panel and reports remained out of scope.

## ACTIVE IMPLEMENTATION SLICE

**M5 item 25/28 — Search / quick-actions palette with keyboard-first behavior.**

No implementation branch or PR should be assumed from this tracking reconciliation. Reconstruct the exact current repository/open-PR state before starting source changes.

### Required reconstruction / contract questions

- inspect current app-shell navigation, list/task snapshot APIs, overlay primitives, keyboard handling and any dormant search UI before creating a new surface;
- derive searchable entities and allowed quick actions from current product/spec evidence rather than inventing a generic command palette;
- keep search read behavior local and deterministic; preserve persistence-first boundaries for any command that mutates state;
- define keyboard-first open, query, result navigation, activation, Escape dismissal, focus containment/return and empty/no-match behavior;
- determine whether any action in the palette is merely navigation versus authoritative mutation and keep those boundaries explicit;
- add deterministic source gates and Windows Edge visual/DOM coverage for representative search states;
- do not absorb full archived lists/tasks parity, theme work, Focus Panel, reports or excluded cloud/account/integration controls.

## INVARIANTS THAT MUST NOT REGRESS

- list/task/subtask identities remain stable across edit/archive/restore/reorder/move;
- renderer success is published only after authoritative local mutation succeeds;
- archive/restore preserves history and owned assets; permanent list deletion remains explicit, archive-only and irreversible;
- committed database deletion is not reported as failed merely because post-commit owned-icon cleanup fails;
- `All Lists` remains a synthetic aggregate/read-only list identity, never persisted as a mutable user list;
- task timer/session/Time Taken, scheduling/date-only/timezone/recurrence and reminder semantics remain unchanged unless the ordered item explicitly requires them;
- Notes retain one mounted compact/large editor path, explicit-only URL activation and native spellcheck-only behavior;
- card/menu/modal/overlay geometry must not shift because hover/focus actions appear;
- keyboard/focus-visible access and reduced-motion behavior remain required;
- no auth/cloud/telemetry/trial/upgrade/profile/AI/integration authority is introduced.

## EXACT NEXT ACTION FOR A ZERO-CONTEXT AGENT

Reconstruct current state from repository and GitHub first. If no unfinished implementation PR exists, begin M5 item 25/28 by auditing current search/quick-action product evidence and existing app-shell/overlay/keyboard code, then define a narrow deterministic search-palette contract before source edits. Use a coherent feature branch/PR and exact-head Windows CI; do not advance the item until PR CI, expected-head merge, resulting-main CI and tracking reconciliation are all complete.

## USER ACTION REQUIRED

**None.**

## BLOCKERS / NOT RUN

- No current product/user decision is known to block starting the search/quick-actions reconstruction.
- Full local repository preflight is unavailable in this connector environment; Windows GitHub Actions remains authoritative for Rust/Tauri validation.
