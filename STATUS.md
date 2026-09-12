# STATUS.md

Last updated: 2026-09-12

For zero-context continuation start with `AI_START_HERE.md` and `HANDOFF.md`.

## Current phase

**Milestone 5 — Design system and Main window product UI.**

- Milestone 1 / Gate A: **PASS**.
- Milestone 2 / Gate B: **PASS**.
- Milestone 3 / Gate C: **PASS**.
- Milestone 4 / Gate D: **PASS**.
- Milestone 5: **ACTIVE / 25 of 28 top-level items validated**.
- Milestones 6–10: **NOT STARTED**.

The first twenty-five ordered M5 items are fully main validated. The latest completed item is **Search / quick-actions palette with keyboard-first behavior**. The next ordered item is **Archived lists/tasks surfaces**.

## Current validated source baseline

Latest fully main-validated **source/test** baseline:

`16552791479e6621deca6fa146b0cfc9a3301734`

Tree:

`290abfbc28e79eeb6ea0ab38e18989c759a8eea5`

This is the expected-head guarded merge of PR #97 — `M5: add keyboard-first local search palette`.

Markdown-only tracking descendants do **not** replace this validated source/test baseline.

### PR #97 exact-head validation

Final validated PR head: `ac21ecfff142f5b131d16b153fa7f23c37e336b2`.

Windows PR CI #380:

- run `34679557187`, job `103515510436`, conclusion **SUCCESS**;
- exact head `ac21ecfff142f5b131d16b153fa7f23c37e336b2`;
- Repository Preflight, production Edge search-palette capture/DOM validation, Tauri Release and diagnostic artifact upload: **PASS**;
- visual artifact `10293842373`, digest `sha256:7af4349267134d038686f476c15545ab1401b448f0b5ae4d652e53c1a888916b`;
- diagnostic artifact `10293942591`, digest `sha256:445eba5a3e04419e97a02e7f410f9b24d3a478a19af10a4a3e8f2f57926317a5`;
- final exact-head review: mergeable, 16 PR commits / 12 changed files, no submitted reviews and no unresolved review threads;
- final diff remained frontend-only search/AppShell/fixture/test/capture/tracking scope; no Rust/Tauri/SQLite/schema/domain source changed.

Expected-head guarded merge produced main source SHA `16552791479e6621deca6fa146b0cfc9a3301734`.

### Resulting-main validation

Windows main CI #381:

- run `34682513395`, job `103523630237`, conclusion **SUCCESS**;
- exact source SHA `16552791479e6621deca6fa146b0cfc9a3301734`;
- Repository Preflight, production Edge search-palette capture/DOM validation, Tauri Release and diagnostic artifact upload: **PASS**;
- visual artifact `10294496874`, digest `sha256:efcd0975f97abf892938ba2fbda1ad4d1f62e1a82fb754b63d31a69323d7f632`;
- diagnostic artifact `10294497209`, digest `sha256:4880b908e4092395f6717a5fa1bc55885ab9eeca1361a1ff61dccea24e03a506`.

Detailed immutable evidence is recorded in `work-log/2026-09-12-1123-chatgpt-m5-search-palette.md`.

## Milestone 5 — validated ordered work

Validated top-level items 1–24 remain as previously recorded. Item 25 is now additionally validated:

25. Search / quick-actions palette opens from the main Search utility and `Ctrl+F`, searches active local tasks/lists without introducing a new persistence authority, supports keyboard-first traversal/focus containment/dismissal, and exposes only the evidenced Add task / Add list / Reports quick actions.

### Latest completed: Search / quick-actions palette

Validated behavior includes:

- the Search utility and main-window `Ctrl+F` open the same centered modal palette; no focus-surface/Blitz search shortcut was introduced;
- active lists come from the existing Home snapshot and active-workspace tasks come from the existing All Lists board snapshot, so searching remains local/read-only and adds no Rust/SQLite/schema/network authority;
- matching is case-insensitive by task/list title with deterministic loading, error, results and no-results states;
- list/task result activation is navigation-only and does not mutate task/list state;
- the only quick actions are `Add new task`, `Add new list`, and `Go to Reports`, matching source evidence;
- quick task creation requires explicit title/list/planning lane, reuses `createListBoardTask`, retains the form on failure, and transitions only after committed success;
- Add new list reuses the validated List Editor create path; Reports uses existing navigation;
- keyboard behavior includes initial query focus, Arrow Up/Down option traversal, focused-button Enter activation, Tab containment, Escape/backdrop dismissal and opener focus restoration;
- deterministic static gates and real Windows Edge light/dark captures cover quick actions, matches, no-results and quick-task-create states;
- archived list/task parity, theme switching, Focus Panel, Reports implementation and account/cloud/integration controls remained out of scope.

### Next ordered M5 item

`Archived lists/tasks surfaces.`

Treat this as a focused archive-parity slice. Start from the already validated minimal `ArchivedListsPanel` and the existing authoritative archive/persistence semantics. Reconstruct source/spec evidence for archived lists versus archived/done tasks before expanding the production surface. Preserve archive/restore identity/history, archive-only permanent list deletion, report-history semantics, and persistence-first UI publication. Do not absorb the later theme item, Focus Panel, Reports implementation or excluded cloud/account controls.

## Durable correctness decisions

Future work must preserve:

- Narro remains personal, local-only Windows 10/11 x64 software; no auth/cloud/telemetry/integration authority is introduced.
- Tauri 2 + React/TypeScript + authoritative Rust/domain state + SQLite remains the validated architecture.
- `main` and reusable `focusSurface` are the normal two-webview model; presentation changes must not duplicate authoritative runtime state.
- authoritative task/list/session/timer/scheduling/note state lives outside renderer memory; persistence-first mutations remain the success boundary.
- stable task/subtask/list identities, tracked Time Taken, scheduling/date-only/timezone/recurrence semantics and All Lists aggregate semantics must not regress.
- list archive/restore preserves history; permanent list deletion remains explicit, archive-only and irreversible.
- post-commit owned-icon cleanup is best effort and cannot redefine a committed database deletion as failed.
- Search remains local/read-only; quick task creation must continue to use the existing persistence-first create path with explicit list/lane selection.
- Notes use one mounted compact/large editor/draft path; presentation switching cannot discard unsaved rich text.
- Notes URLs require explicit pointer/keyboard activation and may never auto-launch from focus/session/window transitions.
- Notes spellcheck remains a native user-agent hint only; no Narro remote spelling service, custom dictionary, persistence schema or automatic text mutation.
- hover/focus/edit interactions may not reflow task/list card geometry or move hit targets.
- keyboard/focus-visible equivalents and accessible names/tooltips remain required for icon-only actions.
- motion never owns or delays domain-state completion; `prefers-reduced-motion` remains usable and timer numerals remain tabular.
- excluded account/trial/upgrade/profile/AI/integration controls remain absent; diagnostics remain gated behind `?diagnostics=1`.

## Multi-agent continuation rule

Repository state must remain sufficient for a zero-context implementation agent. Use `AI_START_HERE.md`, `AGENTS.md`, `ENGINEERING_QUALITY.md`, `AGENT_WORKFLOW.md`, `HANDOFF.md`, `TODO.md`, relevant `docs/*`, and newest `work-log/*.md` entries as the continuation source of truth.
