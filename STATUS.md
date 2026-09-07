# STATUS.md

Last updated: 2026-09-07

For zero-context continuation start with `AI_START_HERE.md` and `HANDOFF.md`.

## Current phase

**Milestone 5 — Design system and Main window product UI.**

- Milestone 1 / Gate A: **PASS**.
- Milestone 2 / Gate B: **PASS**.
- Milestone 3 / Gate C: **PASS**.
- Milestone 4 / Gate D: **PASS**.
- Milestone 5: **ACTIVE / 5 of 28 top-level items validated once this docs-only reconciliation reaches `main`**.
- Milestones 6–10: **NOT STARTED**.

**`M-5/10 | 6/6 | 5/28`**

The first five ordered M5 shared-visual-foundation slices are fully main validated: semantic theme tokens, typography, spacing/radius/elevation, shared motion duration/easing primitives, and `prefers-reduced-motion` behavior. The next ordered item is accessible tooltip/popover/menu primitives with stable geometry.

## Current validated source baseline

Latest fully main-validated **source/test** baseline:

`0b0433fe9c2922d1a02a5a45656857368dcbbecb`

This is the merge of PR #76 — `M5: add reduced-motion foundation`.

### PR #76 exact-head validation

Final exact validated PR head:

`3a67e076292424e8cbcfec4713ed7e3463fc3420`

Windows PR CI #272:

- run `34116005616`;
- job `101722851191`;
- exact head `3a67e076292424e8cbcfec4713ed7e3463fc3420`;
- conclusion: **SUCCESS**;
- Repository Preflight: **PASS**;
- Tauri Release: **PASS**;
- artifact upload: **PASS**;
- artifact ID `10016707418`;
- artifact name `narro-m1-runtime-harness-windows-x64`;
- digest `sha256:ded80ef9c67d38293be47d869c50d773596e7e9185ff6f22696df6cb22cb2c8c`;
- final exact-head semantic/diff review: **PASS**;
- PR comments/reviews/review threads requiring resolution: **none**.

PR #76 merged from the exact validated head, producing source SHA `0b0433fe9c2922d1a02a5a45656857368dcbbecb`.

### Resulting-main validation

Windows main CI #273:

- run `34117327629`;
- job `101727089898`;
- exact source SHA `0b0433fe9c2922d1a02a5a45656857368dcbbecb`;
- conclusion: **SUCCESS**;
- Repository Preflight: **PASS**;
- Tauri Release: **PASS**;
- artifact upload: **PASS**;
- artifact ID `10017138498`;
- artifact name `narro-m1-runtime-harness-windows-x64`;
- digest `sha256:8d38e33021958d150907f4165588f9eb772e6f7e44649c5cf9d9c1748f51f14e`.

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

The fifth M5 top-level item is validated complete.

Validated reduced-motion behavior now provides:

- one shared `@media (prefers-reduced-motion: reduce)` contract in `src/motion.css`;
- shared transition-duration tokens collapse to `--motion-duration-reduced: 1ms` while tooltip intent delay remains unchanged;
- nonessential lift/overlay distances reduce to `0rem`, and press/drag scales reduce to identity `1`;
- reduced-mode transition-property lists omit `transform`, preserving stable color/background/border/opacity/box-shadow state projection as applicable;
- shared transition delays clear to `0ms` in reduced mode;
- normal-motion calibration remains unchanged and separately guarded;
- deterministic `scripts/test-ui-reduced-motion.mjs` coverage is part of `preflight:frontend`, including LF/Windows-CRLF-safe import-order validation.

No component-specific animation, React command behavior, Rust/domain/persistence/window behavior or native-window animation changed. No physical Windows acceptance is required for this foundation-only CSS/preflight slice because no animated product component is yet consuming the primitives.

Detailed evidence: `work-log/2026-09-07-chatgpt-m5-reduced-motion-foundation.md`.

### Next ordered M5 item

The next top-level item is:

`Implement accessible tooltip/popover/menu primitives with stable geometry.`

Before source changes, perform the normal mandatory startup, inspect the relevant accessibility/tooltip/menu geometry requirements in `docs/UI_UX_SPEC.md`, current motion/reduced-motion contracts, current frontend architecture and existing dependency set. Keep the slice at primitive-level infrastructure; do not jump ahead to screenshot fixtures, App shell, Home, board or task-card product UI.

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
- reduced-motion removes nonessential translation/scale without hiding state changes;
- tooltip intent delay is an interaction-intent delay and remains independent from animation duration;
- timer numerals remain tabular and must not acquire per-second transition animation;
- no hover/focus interaction may reflow sibling content or move pointer targets;
- no infinite decorative animation, especially on `focusSurface`;
- keyboard/focus accessibility remains required as the visual foundation expands.

## Multi-agent continuation rule

Repository state must be sufficient for a zero-context implementation agent. Use `AI_START_HERE.md`, `AGENTS.md`, `ENGINEERING_QUALITY.md`, `AGENT_WORKFLOW.md`, `HANDOFF.md`, `TODO.md`, relevant `docs/*`, and newest `work-log/*.md` entries as the continuation source of truth.
