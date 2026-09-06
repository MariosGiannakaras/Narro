# STATUS.md

Last updated: 2026-09-07

For zero-context continuation start with `AI_START_HERE.md` and `HANDOFF.md`.

## Current phase

**Milestone 5 — Design system and Main window product UI.**

- Milestone 1 / Gate A: **PASS**.
- Milestone 2 / Gate B: **PASS**.
- Milestone 3 / Gate C: **PASS**.
- Milestone 4 / Gate D: **PASS**.
- Milestone 5: **ACTIVE / 1 of 28 top-level items validated**.
- Milestones 6–10: **NOT STARTED**.

**`M-5/10 | 6/6 | 1/28`**

The first M5 source slice — semantic theme-token foundation — is fully exact-head/main validated. No second M5 implementation slice has started yet.

## Current validated source baseline

Latest fully main-validated **source/test** baseline:

`69ebe191b930a004157fc3d17a7b0546a5432e01`

This is the guarded squash merge of PR #65 — `M5: add semantic theme token foundation`.

### PR #65 exact-head validation

Exact validated PR head:

`5fcd341d45acc657f18b60e67cf3103998c2d97a`

Windows PR CI #262:

- run `34066418885`;
- job `101575853019`;
- conclusion: **SUCCESS**;
- Repository Preflight: **PASS**;
- Tauri Release: **PASS**;
- artifact upload: **PASS**;
- artifact ID `9999268854`;
- artifact name `narro-m1-runtime-harness-windows-x64`;
- digest `sha256:0af4495be614ca5db55fd1ecfadf9ebae478cbaba84cda20562f65df7d4f6110`;
- final exact-head semantic/diff review: **PASS**;
- PR comments/reviews/review threads requiring resolution: **none**.

PR #65 was squash-merged with expected-head guard `5fcd341d45acc657f18b60e67cf3103998c2d97a`, producing source SHA `69ebe191b930a004157fc3d17a7b0546a5432e01`.

### Resulting-main validation

Windows main CI #263:

- run `34067250128`;
- job `101578072173`;
- exact source SHA `69ebe191b930a004157fc3d17a7b0546a5432e01`;
- conclusion: **SUCCESS**;
- Repository Preflight: **PASS**;
- Tauri Release: **PASS**;
- artifact upload: **PASS**;
- artifact ID `9999508854`;
- artifact name `narro-m1-runtime-harness-windows-x64`;
- digest `sha256:ebca7dfc080dd8972316ba52ee8175b6ab944d8a7708f514e6cc17f01e75bbc6`.

Markdown-only tracking descendants do not replace this validated source/test baseline.

## Milestone 1 — Gate A complete

**PASS.** Tauri 2 + WebView2 architecture retained after physical Windows capability/performance validation. Two-window architecture (`main` + reusable `focusSurface`), tray/background lifecycle, notifications, autostart, monitor handling, shortcuts and performance baseline are validated. Key evidence remains under `work-log/2026-09-03-*`.

## Milestone 2 — Gate B complete

**PASS.** Durable SQLite/domain identity, CRUD, ordering, archive/delete, task metadata, recurrence/reminder/session schema, preferences and persistence-first mutation invariants are validated. Completion evidence: `work-log/2026-09-03-chatgpt-m2-completion.md`.

## Milestone 3 — Gate C complete

**PASS.** Authoritative timer/session engine, recovery, persistence boundaries, Pomodoro effects, large-elapsed safety and Windows sleep accounting are validated. Final M3 source baseline: `5eaf7f0eba1770112d41744377ea134ad5d41e33`.

## Milestone 4 — Gate D complete

**PASS.** All 15 top-level scheduling/recurrence/reminder/eligibility items are implemented and validated.

Final M4 source baseline before M5 was `c66558cdc3d3ab8f8ec0626c7897491625bb4ddd`, validated by Windows main CI #261 / artifact `9998653381`. The installed-Windows physical reminder acceptance passed with reminder `91f217f6-abc3-4df3-a6cc-66e18a0fb046` due `2026-09-07 01:56`: delivery occurred while Narro remained alive in tray/background mode, no duplicate appeared after more than one additional minute, and both tray and Task Manager Narro identity checks passed.

Reminder delivery still does **not** claim crash-proof exactly-once semantics across a process crash after Windows accepts a notification but before durable `fired_at` acknowledgment.

## Milestone 5 — active ordered work

### Completed: semantic theme-token foundation

The first M5 top-level item is validated complete.

Source contract now provides reusable semantic colors for:

- canvas;
- raised/deep/interactive surfaces;
- subtle/strong borders;
- primary/secondary/inverse text;
- accent start/end and solid accent action color;
- success;
- warning/overdue;
- destructive/error;
- light and dark value sets;
- system theme resolution plus explicit `data-theme="light"`, `data-theme="dark"`, and `data-theme="system"` selectors.

`src/App.css` consumes the semantic layer and no longer carries the obsolete Vite/React scaffold palette. `scripts/test-ui-theme-tokens.mjs` is part of `preflight:frontend` and guards token completeness/selectors/consumption. Visible focus outlines were restored for shared controls.

This slice intentionally does **not** complete the later `Light/dark/system theme` product item: persisted/user-facing theme preference controls remain open. Existing diagnostic Main/focusSurface inline presentation is not yet the final product UI.

Detailed evidence: `work-log/2026-09-07-chatgpt-m5-theme-token-foundation.md`.

### Next ordered M5 item

The next top-level item is:

`Implement typography using Segoe UI Variable / Windows system fallbacks and tabular timer numerals.`

Before source changes, perform the normal startup and inspect current typography usage in `src/App.css`, `src/App.tsx`, `src/focus.tsx`, `src/TimerSessionProjection.tsx`, and the relevant `docs/UI_UX_SPEC.md` typography/timer sections. Keep the slice narrow: typography only unless a directly required test seam needs a small supporting change.

Do not skip to spacing, motion, tooltip primitives, screenshot harness, App shell, Home, board, or task UI before the typography item is validated.

## Durable correctness decisions

Future work must preserve:

- authoritative Rust/domain state and persistence-first mutations;
- stable task identities and one-open-session invariant;
- renderer-independent timer accounting;
- date-only calendar semantics and Monday week boundaries;
- visible date/time formatting follows Windows/system locale by default without changing stored scheduling semantics;
- explicit IANA timezone resolution with fail-closed DST gap/fold handling;
- deterministic/idempotent recurrence and bounded Rust-owned reminder/recurrence orchestration;
- reminder `fired_at` is written only after successful OS notification submission and failed submission remains retryable;
- scheduling/move operations preserve task identity count;
- async `main` recreation remains intact to avoid the historical Windows WebView2 deadlock;
- Windows executable/installer/tray icon inputs derive from the canonical Narro branding master;
- M5 visual work must not move authoritative task/timer/reminder logic into renderer state;
- semantic theme tokens remain calibration infrastructure and may be visually tuned by later screenshot comparison without losing semantic roles;
- no hover/focus interaction may reflow sibling content or move pointer targets;
- reduced-motion and keyboard/focus accessibility remain required as the visual foundation expands.

## Multi-agent continuation rule

Repository state must be sufficient for a zero-context implementation agent. Use `AI_START_HERE.md`, `AGENTS.md`, `ENGINEERING_QUALITY.md`, `AGENT_WORKFLOW.md`, `HANDOFF.md`, `TODO.md`, relevant `docs/*`, and newest `work-log/*.md` entries as the continuation source of truth.
