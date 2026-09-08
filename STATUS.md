# STATUS.md

Last updated: 2026-09-08

For zero-context continuation start with `AI_START_HERE.md` and `HANDOFF.md`.

## Current phase

**Milestone 5 — Design system and Main window product UI.**

- Milestone 1 / Gate A: **PASS**.
- Milestone 2 / Gate B: **PASS**.
- Milestone 3 / Gate C: **PASS**.
- Milestone 4 / Gate D: **PASS**.
- Milestone 5: **ACTIVE / 12 of 28 top-level items validated**.
- Milestones 6–10: **NOT STARTED**.

**`M-5/10 | 5/5 | 12/28`**

The first twelve ordered M5 items are fully main validated: semantic theme tokens, typography, spacing/radius/elevation, shared motion primitives, `prefers-reduced-motion`, accessible tooltip/popover/menu primitives, the deterministic dark/light visual-regression harness, Main-window App shell/navigation, Home dashboard/list cards, list-card rest/hover/Open/overflow-menu/create-list states, the persistence-backed Create/Edit List modal, and the List board with Backlog / This Week / Today / Done. The next ordered item is the detailed task-card state model.

## Current validated source baseline

Latest fully main-validated **source/test** baseline:

`d54c4e57933588f89f8f1cf56b1e3dfe5441fd9b`

This is the expected-head guarded squash merge of PR #84 — `M5: add list board hierarchy`.

### PR #84 exact-head validation

Final validated PR head:

`233ab9cb930a5e9cee47d6cbf02d5cd8382c017e`

Windows PR CI #313:

- run `34261787995`;
- job `102181282975`;
- exact head `233ab9cb930a5e9cee47d6cbf02d5cd8382c017e`;
- conclusion: **SUCCESS**;
- Repository Preflight: **PASS**;
- Capture Visual Regression Fixtures: **PASS**;
- Upload Visual Regression Artifact: **PASS**;
- Tauri Release: **PASS**;
- Upload Diagnostic Harness Artifact: **PASS**;
- visual artifact ID `10070458234`, digest `sha256:b9ac6a69c7550e8ae25afbfb3e7f750e847bf4f416ec3ba60a95b4ebcb9bd303`;
- diagnostic artifact ID `10070674547`, digest `sha256:57d3d5d2c6fec36e228218d1b9f30a12e3c570d1f2e19ce23a1dddc9fc7d8f35`;
- final exact-head semantic/diff review: **PASS**; 15 changed files confined to the list-board read model, Home/App-shell navigation integration, board presentation/styles, visual harness/tests and branch tracking;
- PR comments, submitted reviews and inline review threads requiring resolution: **none**.

The final PR-head correction was evidence-backed and test-only: the captured task row correctly used the shared `--radius-task-card: 0.625rem` / 10 px contract, while the new visual validator incorrectly expected the 12 px panel radius. The validator expectation was corrected to 10 px and the complete authoritative pipeline then passed.

PR #84 was squash-merged with expected-head guard `233ab9cb930a5e9cee47d6cbf02d5cd8382c017e`, producing source SHA `d54c4e57933588f89f8f1cf56b1e3dfe5441fd9b`.

### Resulting-main validation

Windows main CI #314:

- run `34263232684`;
- job `102186124690`;
- exact source SHA `d54c4e57933588f89f8f1cf56b1e3dfe5441fd9b`;
- conclusion: **SUCCESS**;
- Repository Preflight: **PASS**;
- Capture Visual Regression Fixtures: **PASS**;
- Upload Visual Regression Artifact: **PASS**;
- Tauri Release: **PASS**;
- Upload Diagnostic Harness Artifact: **PASS**;
- visual artifact ID `10071063644`, digest `sha256:1d0fa6ec2579ea5e78fe035eba49c42eef5cd184c8673cb91d02aba56489108e`;
- diagnostic artifact ID `10071323113`, digest `sha256:4ca72195d7d269edb61bdcdf6f52ac91ad3556ec665142c595284f78d8568c83`.

Markdown-only tracking descendants do not replace this validated source/test baseline.

## Milestone 1 — Gate A complete

**PASS.** Tauri 2 + WebView2 architecture retained after physical Windows capability/performance validation. Two-window architecture (`main` + reusable `focusSurface`), tray/background lifecycle, notifications, autostart, monitor handling, shortcuts and performance baseline are validated. Key evidence remains under `work-log/2026-09-03-*`.

## Milestone 2 — Gate B complete

**PASS.** Durable SQLite/domain identity, CRUD, ordering, archive/delete, task metadata, recurrence/reminder/session schema, preferences and persistence-first mutation invariants are validated. Completion evidence: `work-log/2026-09-03-chatgpt-m2-completion.md`.

## Milestone 3 — Gate C complete

**PASS.** Authoritative timer/session engine, recovery, persistence boundaries, Pomodoro effects, large-elapsed safety and Windows sleep accounting are validated. Final M3 source baseline: `5eaf7f0eba1770112d41744377ea134ad5d41e33`.

## Milestone 4 — Gate D complete

**PASS.** All 15 scheduling/recurrence/reminder/eligibility items are implemented and validated. Final M4 source baseline before M5 was `c66558cdc3d3ab8f8ec0626c7897491625bb4ddd`, validated by Windows main CI #261 / artifact `9998653381`. Installed-Windows reminder acceptance passed for reminder `91f217f6-abc3-4df3-a6cc-66e18a0fb046` due `2026-09-07 01:56`, including tray/background delivery, no duplicate after more than one additional minute, and correct tray/Task Manager icon identity.

Reminder delivery still does **not** claim crash-proof exactly-once semantics across a process crash after Windows accepts a notification but before durable `fired_at` acknowledgment.

## Milestone 5 — active ordered work

### Completed: semantic theme-token foundation

Reusable light/dark/system semantic roles exist for canvas, surfaces, borders, text, accent, success, warning and destructive states. `scripts/test-ui-theme-tokens.mjs` guards the contract in frontend preflight.

Detailed evidence: `work-log/2026-09-07-chatgpt-m5-theme-token-foundation.md`.

### Completed: typography foundation

Validated typography provides the Windows-first `"Segoe UI Variable", "Segoe UI", system-ui, sans-serif` stack, reusable title/task/metadata/live-timer roles, and tabular timer numerals. `scripts/test-ui-typography.mjs` is part of frontend preflight and is Windows CRLF-safe.

Detailed evidence: `work-log/2026-09-07-chatgpt-m5-typography-foundation.md`.

### Completed: spacing/radius/elevation foundation

Validated geometry provides the documented 4 px spacing scale, semantic radius roles, restrained elevation tokens, reusable raised/floating surface roles, and deterministic LF/CRLF-safe `scripts/test-ui-geometry.mjs` coverage.

Detailed evidence: `work-log/2026-09-07-chatgpt-m5-spacing-radius-elevation.md`.

### Completed: motion-token foundation

Validated motion provides calibrated duration/delay/easing tokens and reusable opt-in transition primitives restricted to stable visual properties. `scripts/test-ui-motion.mjs` remains in `preflight:frontend`, and no per-second/infinite decorative animation is introduced.

Detailed evidence: `work-log/2026-09-07-chatgpt-m5-motion-token-foundation.md`.

### Completed: reduced-motion foundation

Validated reduced-motion behavior provides one shared `prefers-reduced-motion` contract, collapses animation durations, removes nonessential translation/scale, preserves tooltip intent delay, and keeps state changes visible. Deterministic `scripts/test-ui-reduced-motion.mjs` coverage remains in `preflight:frontend`.

Detailed evidence: `work-log/2026-09-07-chatgpt-m5-reduced-motion-foundation.md`.

### Completed: accessible overlay primitives

Validated dependency-free `Tooltip`, `Popover`, `Menu`, and `MenuItem` primitives provide accessible relationships, keyboard navigation/dismissal/focus restoration, outside-pointer dismissal, and absolutely positioned stable geometry. Deterministic `scripts/test-ui-overlay-primitives.mjs` coverage remains in `preflight:frontend`.

Detailed evidence: `work-log/2026-09-07-chatgpt-m5-overlay-primitives.md`.

### Completed: visual-regression fixture harness

Validated harness behavior provides deterministic representative light/dark fixture surfaces, stable semantic geometry/style contracts, Windows Microsoft Edge headless PNG capture, captured-DOM validation, exact 1280x720 image validation, and uploaded CI artifacts.

Detailed evidence: `work-log/2026-09-07-1920-chatgpt-m5-visual-regression-harness.md`.

### Completed: App shell/navigation

The eighth M5 top-level item is validated complete. Validated behavior includes the reusable default `AppShell`, compact list navigation, Search/Settings utility entries, Home/Reports primary navigation, stable keyboard/focus geometry, diagnostics gated behind `?diagnostics=1`, and deterministic light/dark Edge shell captures.

Detailed evidence: `work-log/2026-09-07-chatgpt-m5-app-shell-navigation.md`.

### Completed: Home dashboard/list cards

The ninth M5 top-level item is validated complete. Validated behavior includes a read-only SQLite Home snapshot, active list cards with task previews/pending/EST totals, default Home hierarchy, loading/empty/error states, safe list color projection, deterministic Home fixtures and theme-stable geometry validation.

Detailed evidence: `work-log/2026-09-07-2154-chatgpt-m5-home-dashboard-list-cards.md`.

### Completed: list-card interaction states

The tenth M5 top-level item is validated complete. Validated behavior includes callback-gated card actions, shared accessible overflow menus, stable absolute Open hover/focus affordance, callback-gated Create List tile, reduced-motion-safe presentation and deterministic state fixtures with no layout shift.

Detailed evidence: `work-log/2026-09-08-0019-chatgpt-m5-list-card-interaction-states.md`.

### Completed: Create/Edit List modal

The eleventh M5 top-level item is validated complete.

Validated behavior now provides:

- one reusable accessible Create/Edit List modal with dimmed viewport backdrop, close X, Escape dismissal, Tab focus trap and opener-focus restoration;
- local JPG/JPEG/PNG/SVG icon import with frontend and Rust size/content validation, 1 MiB cap and rejection of scripted/`javascript:` SVG payloads;
- Narro-owned app-data `list-icons/` storage with UUID filenames and only relative owned paths persisted;
- persistence-first reuse of the validated M2 `create_list` / `update_list` boundaries;
- success-only renderer IPC: the modal closes and Home re-reads authoritative SQLite state only after a successful mutation;
- typed validation/not-found/general command failures; failed mutations keep the modal open;
- best-effort cleanup of newly imported icons on database/mutation failure, refusal to delete non-owned paths, cleanup of partial temporary writes, and cleanup of replaced old owned icons only after the update commits;
- real runtime Create targets from sidebar/Home plus real Edit target from the existing list-card menu;
- deterministic create/edit light/dark fixtures, measured DOM-layout backdrop coverage, strict 1280x720 PNG output validation and geometry-only theme parity;
- deterministic `scripts/test-ui-list-editor-modal.mjs` frontend-preflight coverage.

Detailed evidence: `work-log/2026-09-08-1117-chatgpt-m5-create-edit-list-modal.md`.

### Completed: List board hierarchy

The twelfth M5 top-level item is validated complete.

Validated behavior now provides:

- a read-only Rust `list_board` projection over active lists and stable persisted task identities;
- individual-list and aggregate All Lists targets without creating a synthetic persisted list;
- Backlog / This Week / Today projection for pending tasks through validated M4 `effective_planning_lane_at` semantics;
- Done projection from completed, non-archived tasks only;
- duplicate-identity fail-closed protection and checked task-count / aggregate-EST arithmetic;
- active-list target validation and persisted timezone preference use, with the Windows/WebView IANA timezone used only as fallback presentation context;
- a typed renderer-facing `get_list_board_snapshot` read command with no task mutation commands in the board path;
- real runtime navigation from Home list-card Open, Home All Lists, sidebar All my lists, and in-board list selector switching;
- a four-column `ListBoard` hierarchy with count/aggregate EST and deliberately baseline/static task rows;
- aggregate-view origin labels for tasks from different lists;
- reserved future-add geometry without exposing dead Add Task controls;
- deterministic individual and aggregate board light/dark fixtures, Edge capture wiring, semantic/geometry validation and `scripts/test-ui-list-board.mjs` frontend-preflight coverage;
- no drag/drop/reorder, inline task creation/editing, detailed task-card state model, Time Taken controls, scheduling/recurrence UI, subtasks, notes, destructive task/list flows, search, Settings or Reports behavior was absorbed.

Detailed evidence: `work-log/2026-09-08-2144-chatgpt-m5-list-board.md`.

### Next ordered M5 item

The next top-level item is:

`Task-card state model: normal, hover/action-revealed, scheduled, overdue, done, inline-create, notes-expanded, subtasks-expanded, paused/editable, destructive-confirm.`

Start from the validated baseline/static board rows and current persistence/domain metadata. Implement only the ordered state-model presentation and the minimum projection/fixture plumbing required to make those states deterministic and reachable. Do not absorb the following drag/drop/reorder, task creation/editing behavior, EST/Time Taken editing behavior, scheduling/recurrence editor, subtasks editing, notes editor, list settings, search, Settings or Reports unless a strict dependency is required and recorded.

## Durable correctness decisions

Future work must preserve:

- authoritative Rust/domain state and persistence-first mutations;
- stable task identities and one-open-session invariant;
- renderer-independent timer accounting;
- date-only calendar semantics and Monday week boundaries;
- Windows/system-locale visible date/time formatting without changing stored scheduling semantics;
- explicit IANA timezone resolution with fail-closed DST gap/fold handling;
- deterministic/idempotent recurrence and bounded Rust-owned reminder/recurrence orchestration;
- reminder `fired_at` only after successful OS notification submission, with failed submission retryable;
- scheduling/move operations preserve task identity count;
- async `main` recreation remains intact and derives state from Rust/SQLite, not hidden renderer memory;
- Windows executable/installer/tray icon inputs derive from canonical Narro branding;
- M5 visual work never moves authoritative task/timer/reminder logic into renderer state;
- App shell remains presentation/navigation only;
- semantic color, typography, geometry and motion roles remain reusable independent contracts;
- motion never owns or delays domain-state completion;
- reduced-motion removes nonessential translation/scale without hiding state changes;
- tooltip intent delay remains independent from animation duration;
- overlay primitives preserve stable sibling geometry and keyboard/focus accessibility;
- timer numerals remain tabular and must not acquire per-second transition animation;
- no hover/focus interaction may reflow sibling content or move pointer targets;
- imported list icons remain app-data-owned and only relative owned paths are persisted or eligible for cleanup;
- List Board remains a read projection: renderer presentation cannot mutate task/list identities, lane order or persistence;
- scheduled pending tasks remain projected through validated effective planning-lane semantics rather than schedule-driven `manual_lane` mutation;
- archived lists/tasks remain absent from the board and completed non-archived tasks project to Done exactly once;
- All Lists remains an aggregate read projection, never a persisted synthetic list;
- task identity duplication in a board projection must fail closed;
- stored configured timezone wins over renderer fallback and all timezone identifiers remain validated;
- exact 1280x720 remains a PNG output contract, not a browser DOM-layout viewport assumption;
- excluded account/trial/upgrade/profile/AI/integration controls remain absent;
- diagnostic controls remain explicitly gated and outside normal product navigation;
- no infinite decorative animation, especially on `focusSurface`;
- keyboard/focus accessibility remains required as the visual foundation expands.

## Multi-agent continuation rule

Repository state must be sufficient for a zero-context implementation agent. Use `AI_START_HERE.md`, `AGENTS.md`, `ENGINEERING_QUALITY.md`, `AGENT_WORKFLOW.md`, `HANDOFF.md`, `TODO.md`, relevant `docs/*`, and newest `work-log/*.md` entries as the continuation source of truth.