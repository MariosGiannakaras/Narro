# STATUS.md

Last updated: 2026-09-07

For zero-context continuation start with `AI_START_HERE.md` and `HANDOFF.md`.

## Current phase

**Milestone 5 — Design system and Main window product UI.**

- Milestone 1 / Gate A: **PASS**.
- Milestone 2 / Gate B: **PASS**.
- Milestone 3 / Gate C: **PASS**.
- Milestone 4 / Gate D: **PASS**.
- Milestone 5: **ACTIVE / 4 of 28 top-level items validated once this docs-only reconciliation reaches `main`**.
- Milestones 6–10: **NOT STARTED**.

**`M-5/10 | 6/6 | 4/28`**

The first four ordered M5 shared-visual-foundation slices are fully main validated: semantic theme tokens, typography, spacing/radius/elevation, and shared motion duration/easing primitives. The next ordered item is `prefers-reduced-motion` behavior.

## Current validated source baseline

Latest fully main-validated **source/test** baseline:

`a45715ca8d24f11d580a64a4382db2fb83651db8`

This is the guarded squash merge of PR #73 — `M5: add shared motion token foundation`.

### PR #73 exact-head validation

Final exact validated PR head:

`56b5960f60626a8a421335a4f154e98998b7e7b7`

Windows PR CI #270:

- run `34104711339`;
- job `101686964301`;
- exact head `56b5960f60626a8a421335a4f154e98998b7e7b7`;
- conclusion: **SUCCESS**;
- Repository Preflight: **PASS**;
- Tauri Release: **PASS**;
- artifact upload: **PASS**;
- artifact ID `10012348649`;
- artifact name `narro-m1-runtime-harness-windows-x64`;
- digest `sha256:009f74cac0b11c3ac804b47fec29281e8c182612eda3683c86aa152a1b9664ad`;
- final exact-head semantic/diff review: **PASS**;
- PR comments/reviews/review threads requiring resolution: **none**.

PR #73 was squash-merged with expected-head guard `56b5960f60626a8a421335a4f154e98998b7e7b7`, producing source SHA `a45715ca8d24f11d580a64a4382db2fb83651db8`.

### Resulting-main validation

Windows main CI #271:

- run `34111571620`;
- job `101708791529`;
- exact source SHA `a45715ca8d24f11d580a64a4382db2fb83651db8`;
- conclusion: **SUCCESS**;
- Repository Preflight: **PASS**;
- Tauri Release: **PASS**;
- artifact upload: **PASS**;
- artifact ID `10014967044`;
- artifact name `narro-m1-runtime-harness-windows-x64`;
- digest `sha256:c994d2d4496fea5fe3918701bcb74e4ec937a34b41d3d033d7b08c0bdaebcab0`.

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

The fourth M5 top-level item is validated complete.

Validated motion contract now provides:

- calibrated press, hover/focus, tooltip, popover, inline, modal, reorder, completion, chart/filter and focus-surface duration tokens inside `docs/UI_UX_SPEC.md` ranges;
- tooltip intent delay and documented enter/exit cubic-bezier easing tokens;
- reusable opt-in transition primitives restricted to stable visual properties;
- explicit guards against `transition: all`, keyframes, animation declarations, backdrop-filter animation and per-second timer animation;
- `src/App.css` imports the motion foundation after theme/typography/geometry without yet applying component-specific animation;
- deterministic `scripts/test-ui-motion.mjs` coverage in `preflight:frontend`, including Windows CRLF-safe import-order validation.

No React command behavior, Rust/domain/persistence/window behavior changed. No physical Windows acceptance is required for this token/test-only foundation slice because no component-specific or native-window animation is applied yet.

Detailed evidence: `work-log/2026-09-07-chatgpt-m5-motion-token-foundation.md`.

### Next ordered M5 item

The next top-level item is:

`Implement prefers-reduced-motion behavior before adding component-specific animation.`

Before source changes, perform the normal mandatory startup, inspect the active M5 TODO, `docs/UI_UX_SPEC.md` reduced-motion rules, current `src/motion.css`, `src/App.css` and frontend preflight structure, then define a narrow shared reduced-motion-only slice. Do not jump ahead to tooltip/popover/menu components, screenshot harness, App shell, Home, board or task UI.

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
- async `main` recreation remains intact;
- Windows executable/installer/tray icon inputs derive from canonical Narro branding;
- M5 visual work never moves authoritative task/timer/reminder logic into renderer state;
- semantic color, typography, geometry and motion roles remain reusable independent contracts;
- motion never owns or delays domain-state completion;
- timer numerals remain tabular and must not acquire per-second transition animation;
- no hover/focus interaction may reflow sibling content or move pointer targets;
- no infinite decorative animation, especially on `focusSurface`;
- reduced-motion and keyboard/focus accessibility remain required as the visual foundation expands.

## Multi-agent continuation rule

Repository state must be sufficient for a zero-context implementation agent. Use `AI_START_HERE.md`, `AGENTS.md`, `ENGINEERING_QUALITY.md`, `AGENT_WORKFLOW.md`, `HANDOFF.md`, `TODO.md`, relevant `docs/*`, and newest `work-log/*.md` entries as the continuation source of truth.
