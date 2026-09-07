# STATUS.md

Last updated: 2026-09-07

For zero-context continuation start with `AI_START_HERE.md` and `HANDOFF.md`.

## Current phase

**Milestone 5 — Design system and Main window product UI.**

- Milestone 1 / Gate A: **PASS**.
- Milestone 2 / Gate B: **PASS**.
- Milestone 3 / Gate C: **PASS**.
- Milestone 4 / Gate D: **PASS**.
- Milestone 5: **ACTIVE / 3 of 28 top-level items validated once this docs-only reconciliation reaches `main`**.
- Milestones 6–10: **NOT STARTED**.

**`M-5/10 | 6/6 | 3/28`**

The first three ordered M5 shared-visual-foundation slices are fully main validated: semantic theme tokens, typography, and spacing/radius/elevation. The next ordered item is shared motion duration/easing primitives.

## Current validated source baseline

Latest fully main-validated **source/test** baseline:

`c8da64be57122cee69fd42cdbf24a175e772981f`

This is the guarded squash merge of PR #70 — `M5: add spacing radius elevation foundation`.

### PR #70 exact-head validation

Final exact validated PR head:

`8819511f876f646d0b3bd65200b4190b88dbdb73`

Windows PR CI #268:

- run `34096211484`;
- job `101660337016`;
- exact head `8819511f876f646d0b3bd65200b4190b88dbdb73`;
- conclusion: **SUCCESS**;
- Repository Preflight: **PASS**;
- Tauri Release: **PASS**;
- artifact upload: **PASS**;
- artifact ID `10009082067`;
- artifact name `narro-m1-runtime-harness-windows-x64`;
- digest `sha256:e7402d81f6340c3cab0cfdf3faf5c8e69cf25ba300806b5d99587b0e6409ccfe`;
- final exact-head semantic/diff review: **PASS**;
- PR comments/reviews/review threads requiring resolution: **none**.

PR #70 was squash-merged with expected-head guard `8819511f876f646d0b3bd65200b4190b88dbdb73`, producing source SHA `c8da64be57122cee69fd42cdbf24a175e772981f`.

### Resulting-main validation

Windows main CI #269:

- run `34097442085`;
- job `101664113908`;
- exact source SHA `c8da64be57122cee69fd42cdbf24a175e772981f`;
- conclusion: **SUCCESS**;
- Repository Preflight: **PASS**;
- Tauri Release: **PASS**;
- artifact upload: **PASS**;
- artifact ID `10009533727`;
- artifact name `narro-m1-runtime-harness-windows-x64`;
- digest `sha256:ada06097e2b768aeed766857d1ed7b5948e9fef8507bee689d10e84132998d43`.

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

Validated source contract provides reusable light/dark/system semantic roles for canvas, surfaces, borders, text, accent, success, warning and destructive states. `src/App.css` consumes them; `scripts/test-ui-theme-tokens.mjs` guards the contract in frontend preflight. This does not complete the later user-facing persisted theme-preference item.

Detailed evidence: `work-log/2026-09-07-chatgpt-m5-theme-token-foundation.md`.

### Completed: typography foundation

Validated typography contract provides the Windows-first `"Segoe UI Variable", "Segoe UI", system-ui, sans-serif` stack, reusable title/task/metadata/live-timer roles, and tabular timer numerals. `scripts/test-ui-typography.mjs` is part of frontend preflight and is Windows CRLF-safe.

Detailed evidence: `work-log/2026-09-07-chatgpt-m5-typography-foundation.md`.

### Completed: spacing/radius/elevation foundation

The third M5 top-level item is validated complete.

Validated geometry contract now provides:

- documented 4 px spacing scale: 4, 8, 12, 16, 20, 24 and 32 px;
- semantic radius roles for controls, task cards, panels, modals and floating content within the documented calibration ranges;
- restrained flat/raised/overlay elevation tokens rather than a heavy decorative shadow system;
- reusable raised/floating surface roles composed from existing semantic surface/border tokens;
- shared `App.css` consumption for current control radius/padding and diagnostic input spacing;
- deterministic `scripts/test-ui-geometry.mjs` coverage in `preflight:frontend`, including LF and Windows CRLF-safe import-order validation.

No React command behavior, Rust/domain/persistence/window behavior changed in this slice. No physical Windows acceptance is required for this CSS/token-only foundation change; screenshot fixture validation remains a separate later M5 item.

Detailed evidence: `work-log/2026-09-07-chatgpt-m5-spacing-radius-elevation.md`.

### Next ordered M5 item

The next top-level item is:

`Implement shared motion primitives and duration/easing tokens from docs/UI_UX_SPEC.md.`

Before source changes, perform the normal mandatory startup, inspect the active M5 TODO, `docs/UI_UX_SPEC.md` motion rules/timing/easing guidance, current shared CSS contracts and frontend preflight structure, then define a narrow motion-token-only slice. Keep `prefers-reduced-motion` as the immediately following separate ordered item; do not jump ahead to component-specific animation, tooltips/popovers/menus, screenshot harness, App shell, Home, board or task UI.

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
- semantic color, typography and geometry roles remain reusable independent contracts;
- elevation remains restrained and does not introduce continuous visual work;
- timer numerals remain tabular and must not acquire per-second transition animation;
- no hover/focus interaction may reflow sibling content or move pointer targets;
- reduced-motion and keyboard/focus accessibility remain required as the visual foundation expands.

## Multi-agent continuation rule

Repository state must be sufficient for a zero-context implementation agent. Use `AI_START_HERE.md`, `AGENTS.md`, `ENGINEERING_QUALITY.md`, `AGENT_WORKFLOW.md`, `HANDOFF.md`, `TODO.md`, relevant `docs/*`, and newest `work-log/*.md` entries as the continuation source of truth.
