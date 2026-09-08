# STATUS.md

Last updated: 2026-09-08

For zero-context continuation start with `AI_START_HERE.md` and `HANDOFF.md`.

## Current phase

**Milestone 5 — Design system and Main window product UI.**

- Milestone 1 / Gate A: **PASS**.
- Milestone 2 / Gate B: **PASS**.
- Milestone 3 / Gate C: **PASS**.
- Milestone 4 / Gate D: **PASS**.
- Milestone 5: **ACTIVE / 11 of 28 top-level items validated**.
- Milestones 6–10: **NOT STARTED**.

**`M-5/10 | 5/5 | 11/28`**

The first eleven ordered M5 items are fully main validated: semantic theme tokens, typography, spacing/radius/elevation, shared motion primitives, `prefers-reduced-motion`, accessible tooltip/popover/menu primitives, the deterministic dark/light visual-regression harness, Main-window App shell/navigation, Home dashboard/list cards, list-card rest/hover/Open/overflow-menu/create-list states, and the persistence-backed Create/Edit List modal. The next ordered item is the List board with Backlog, This Week, Today, Done.

## Current validated source baseline

Latest fully main-validated **source/test** baseline:

`997ba6d019425ec2a15fdef630ca50c2fbab981f`

This is the expected-head guarded squash merge of PR #83 — `M5: add Create/Edit List modal`.

### PR #83 exact-head validation

Final validated PR head:

`17f3e3c1b9c7fad562b6bc7e05eee029bf047598`

Windows PR CI #307:

- run `34204710799`;
- job `101991403060`;
- exact head `17f3e3c1b9c7fad562b6bc7e05eee029bf047598`;
- conclusion: **SUCCESS**;
- Repository Preflight: **PASS**;
- Capture Visual Regression Fixtures: **PASS**;
- Upload Visual Regression Artifact: **PASS**;
- Tauri Release: **PASS**;
- Upload Diagnostic Harness Artifact: **PASS**;
- visual artifact ID `10047503212`, digest `sha256:41bc8583d36927989be1c604151e69df97b70e24b9cf0df6b1c2e67127398371`;
- diagnostic artifact ID `10047701183`, digest `sha256:646145f1a90ce6434080e7cac9f283023369d2106517da3996265281eef1a03e`;
- final exact-head semantic/diff review: **PASS**; 16 changed files confined to list editor, existing Home/App-shell wiring, visual harness/tests and branch tracking;
- PR comments, submitted reviews and inline review threads requiring resolution: **none**.

PR #83 was squash-merged with expected-head guard `17f3e3c1b9c7fad562b6bc7e05eee029bf047598`, producing source SHA `997ba6d019425ec2a15fdef630ca50c2fbab981f`.

### Resulting-main validation

Windows main CI #308:

- run `34206908315`;
- job `101998422358`;
- exact source SHA `997ba6d019425ec2a15fdef630ca50c2fbab981f`;
- conclusion: **SUCCESS**;
- Repository Preflight: **PASS**;
- Capture Visual Regression Fixtures: **PASS**;
- Upload Visual Regression Artifact: **PASS**;
- Tauri Release: **PASS**;
- Upload Diagnostic Harness Artifact: **PASS**;
- visual artifact ID `10048388708`, digest `sha256:67e1919bd4e996a9fae786bea1f0fe5da73a3327b8cdf6a24a531934992ab840`;
- diagnostic artifact ID `10048640730`, digest `sha256:163c10356a44fc7238aead403f5d465bbe47b8ae4b1d69a52773219368792c3d`.

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
- real runtime Create targets from sidebar/Home plus real Edit target from the existing list-card menu; Open/Duplicate/Archive remain unbound until their ordered targets exist;
- deterministic create/edit light/dark fixtures, measured DOM-layout backdrop coverage, strict 1280x720 PNG output validation and geometry-only theme parity;
- deterministic `scripts/test-ui-list-editor-modal.mjs` frontend-preflight coverage.

Detailed evidence: `work-log/2026-09-08-1117-chatgpt-m5-create-edit-list-modal.md`.

### Next ordered M5 item

The next top-level item is:

`List board with Backlog, This Week, Today, Done.`

Start from the validated persistence/domain planning buckets and current Home/List Editor runtime. Implement the narrow board hierarchy and minimum real read projection/navigation needed for Backlog, This Week, Today and Done. Do not absorb the following task-card state model, drag/drop/reorder, inline editing, EST/Time Taken editing, scheduling/recurrence editor, subtasks, notes, list settings, search, Settings or Reports behavior unless a dependency is strictly required and recorded.

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
- exact 1280x720 remains a PNG output contract, not a browser DOM-layout viewport assumption;
- excluded account/trial/upgrade/profile/AI/integration controls remain absent;
- diagnostic controls remain explicitly gated and outside normal product navigation;
- no infinite decorative animation, especially on `focusSurface`;
- keyboard/focus accessibility remains required as the visual foundation expands.

## Multi-agent continuation rule

Repository state must be sufficient for a zero-context implementation agent. Use `AI_START_HERE.md`, `AGENTS.md`, `ENGINEERING_QUALITY.md`, `AGENT_WORKFLOW.md`, `HANDOFF.md`, `TODO.md`, relevant `docs/*`, and newest `work-log/*.md` entries as the continuation source of truth.