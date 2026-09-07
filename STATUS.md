# STATUS.md

Last updated: 2026-09-07

For zero-context continuation start with `AI_START_HERE.md` and `HANDOFF.md`.

## Current phase

**Milestone 5 — Design system and Main window product UI.**

- Milestone 1 / Gate A: **PASS**.
- Milestone 2 / Gate B: **PASS**.
- Milestone 3 / Gate C: **PASS**.
- Milestone 4 / Gate D: **PASS**.
- Milestone 5: **ACTIVE / 6 of 28 top-level items validated once this docs-only reconciliation reaches `main`**.
- Milestones 6–10: **NOT STARTED**.

**`M-5/10 | 5/5 | 6/28`**

The first six ordered M5 shared-visual-foundation slices are fully main validated: semantic theme tokens, typography, spacing/radius/elevation, shared motion duration/easing primitives, `prefers-reduced-motion` behavior, and accessible tooltip/popover/menu primitives with stable geometry. The next ordered item is the screenshot/visual-regression fixture harness for representative dark/light states.

## Current validated source baseline

Latest fully main-validated **source/test** baseline:

`392c4b0b9e2c395212f77ac9286349cc0b784d05`

This is the squash merge of PR #78 — `M5: add accessible overlay primitives`.

### PR #78 exact-head validation

Final exact validated PR head:

`abe99e355f0dcb5c8d35a23a509c1cd598375e6c`

Windows PR CI #276:

- run `34130835990`;
- job `101770362797`;
- exact head `abe99e355f0dcb5c8d35a23a509c1cd598375e6c`;
- conclusion: **SUCCESS**;
- Repository Preflight: **PASS**;
- Tauri Release: **PASS**;
- artifact upload: **PASS**;
- artifact ID `10022463278`;
- artifact name `narro-m1-runtime-harness-windows-x64`;
- digest `sha256:1290021593167b6dc8843580df93b17402243155efd9b377870960169174afd4`;
- final exact-head semantic/diff review: **PASS** after correcting menu-item selection dismissal/focus restoration before the final run;
- PR comments/reviews/review threads requiring resolution: **none**.

PR #78 was squash-merged with expected-head guard from the exact validated head, producing source SHA `392c4b0b9e2c395212f77ac9286349cc0b784d05`.

### Resulting-main validation

Windows main CI #277:

- run `34132388297`;
- job `101775346828`;
- exact source SHA `392c4b0b9e2c395212f77ac9286349cc0b784d05`;
- conclusion: **SUCCESS**;
- Repository Preflight: **PASS**;
- Tauri Release: **PASS**;
- artifact upload: **PASS**;
- artifact ID `10023061747`;
- artifact name `narro-m1-runtime-harness-windows-x64`;
- digest `sha256:8de39fd9e1d1d3b8eb0f9f2295d79928b0d2f82e3ccf3feb9d79a1b1fd75d329`.

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

### Completed: accessible overlay primitives

The sixth M5 top-level item is validated complete.

Validated primitive-level behavior now provides:

- dependency-free React `Tooltip`, `Popover`, `Menu`, and `MenuItem` primitives;
- tooltip `role="tooltip"` plus `aria-describedby` relationship and preserved existing descriptions;
- popover/menu trigger `aria-haspopup`, `aria-expanded`, and `aria-controls` semantics;
- menu `role="menu"` / `role="menuitem"`, disabled-item exclusion, ArrowUp/ArrowDown/Home/End keyboard navigation, Escape dismissal, and focus restoration;
- active menu-item selection closes the menu and restores trigger focus after the selected callback runs;
- outside-pointer dismissal for popover/menu;
- absolutely positioned overlay geometry anchored in a reserved wrapper so opening/closing overlays does not reflow sibling geometry;
- shared motion tokens for tooltip/popover transitions with reduced-motion transform removal;
- deterministic `scripts/test-ui-overlay-primitives.mjs` contract coverage in `preflight:frontend`;
- no new UI dependency and no Rust/domain/persistence/native-window behavior changes.

No physical Windows acceptance was required for this primitive-only infrastructure slice because no product screen consumes the primitives yet; rendered interaction/visual validation belongs to the upcoming fixture and product UI slices.

Detailed evidence: `work-log/2026-09-07-chatgpt-m5-overlay-primitives.md`.

### Next ordered M5 item

The next top-level item is:

`Establish a screenshot/visual-regression fixture harness for representative dark/light states.`

Before source changes, perform the normal mandatory startup and inspect existing build/test tooling plus the screenshot fixture requirements in `docs/UI_UX_SPEC.md`. Keep this slice at reusable visual-regression infrastructure; do not jump ahead to App shell, Home, board or task-card product UI except for the minimum deterministic fixture surface genuinely required to prove the harness.

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
- overlay primitives must preserve stable sibling geometry and keyboard/focus accessibility;
- timer numerals remain tabular and must not acquire per-second transition animation;
- no hover/focus interaction may reflow sibling content or move pointer targets;
- no infinite decorative animation, especially on `focusSurface`;
- keyboard/focus accessibility remains required as the visual foundation expands.

## Multi-agent continuation rule

Repository state must be sufficient for a zero-context implementation agent. Use `AI_START_HERE.md`, `AGENTS.md`, `ENGINEERING_QUALITY.md`, `AGENT_WORKFLOW.md`, `HANDOFF.md`, `TODO.md`, relevant `docs/*`, and newest `work-log/*.md` entries as the continuation source of truth.
