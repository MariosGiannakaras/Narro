# STATUS.md

Last updated: 2026-09-07

For zero-context continuation start with `AI_START_HERE.md` and `HANDOFF.md`.

## Current phase

**Milestone 5 — Design system and Main window product UI.**

- Milestone 1 / Gate A: **PASS**.
- Milestone 2 / Gate B: **PASS**.
- Milestone 3 / Gate C: **PASS**.
- Milestone 4 / Gate D: **PASS**.
- Milestone 5: **ACTIVE / 8 of 28 top-level items validated**.
- Milestones 6–10: **NOT STARTED**.

**`M-5/10 | 5/5 | 8/28`**

The first eight ordered M5 items are fully main validated: semantic theme tokens, typography, spacing/radius/elevation, shared motion primitives, `prefers-reduced-motion`, accessible tooltip/popover/menu primitives, the deterministic dark/light visual-regression harness, and Main-window App shell/navigation. The next ordered item is Home dashboard/list cards.

## Current validated source baseline

Latest fully main-validated **source/test** baseline:

`31f84a1fe2064e59ea27acc7c9afa9f650669608`

This is the squash merge of PR #80 — `M5: add app shell navigation`.

### PR #80 exact-head validation

Final exact validated PR head:

`e1a0eb737cce5095b04cae32130fa3f08b3dcb5d`

Windows PR CI #285:

- run `34144266196`;
- job `101812742288`;
- exact head `e1a0eb737cce5095b04cae32130fa3f08b3dcb5d`;
- conclusion: **SUCCESS**;
- Repository Preflight: **PASS**;
- Capture Visual Regression Fixtures: **PASS**;
- Upload Visual Regression Artifact: **PASS**;
- Tauri Release: **PASS**;
- Upload Diagnostic Harness Artifact: **PASS**;
- visual artifact ID `10027211577`;
- visual artifact name `narro-m5-visual-regression`;
- visual artifact digest `sha256:b1df010bcd84089ff2f49999337e3e059f9dab9530274b2c3158d9643e8cc9fd`;
- diagnostic artifact ID `10027371165`;
- diagnostic artifact name `narro-m1-runtime-harness-windows-x64`;
- diagnostic artifact digest `sha256:f870171b482fe9a42f3550bebaef6162e75604ee82f3b9dfe0308f0f67827f09`;
- final exact-head semantic/diff review: **PASS**; 12 changed files confined to shell/navigation, visual-harness, and branch-handoff scope;
- PR comments/reviews/review threads requiring resolution: **none**.

PR #80 was squash-merged with expected-head guard from that exact validated head, producing source SHA `31f84a1fe2064e59ea27acc7c9afa9f650669608`.

### Resulting-main validation

Windows main CI #286:

- run `34146374105`;
- job `101819196686`;
- exact source SHA `31f84a1fe2064e59ea27acc7c9afa9f650669608`;
- conclusion: **SUCCESS**;
- Repository Preflight: **PASS**;
- Capture Visual Regression Fixtures: **PASS**;
- Upload Visual Regression Artifact: **PASS**;
- Tauri Release: **PASS**;
- Upload Diagnostic Harness Artifact: **PASS**;
- visual artifact ID `10027957828`;
- visual artifact name `narro-m5-visual-regression`;
- visual artifact digest `sha256:d28c47553ec3ecbbda5aa7bde8d7eacddaa5cd1c803ad22f2e63faf86aeb4d53`;
- diagnostic artifact ID `10028115494`;
- diagnostic artifact name `narro-m1-runtime-harness-windows-x64`;
- diagnostic artifact digest `sha256:d5f60f59a284361432fdcc1e929ba32c97bf77d588790c14181e75cb1efa5add`.

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

The eighth M5 top-level item is validated complete.

Validated behavior now provides:

- a reusable `AppShell` as the default Main-window product presentation instead of the temporary diagnostic dashboard;
- compact left navigation for `+ Create new list`, `All my lists`, and `Archived lists`;
- stable upper-right Search and Settings entry points;
- stable bottom Home and Reports primary navigation;
- `aria-current="page"`, navigation landmarks, keyboard/focus-visible states, and reduced-motion-safe transitions;
- stable hover/focus/active geometry without sibling reflow or moving hit targets;
- legacy Windows diagnostics preserved only behind explicit `?diagnostics=1`, with normal product mode no longer starting shortcut/monitor/autostart diagnostic probes;
- authoritative Rust `get_state` / `state-changed` projection preserved;
- deterministic `scripts/test-ui-app-shell.mjs` frontend-preflight coverage;
- real Windows Edge `app-shell-light` and `app-shell-dark` captures plus semantic/default-Home/stable-geometry validation in the existing visual artifact;
- no Home-card, board/task, search-palette, Settings-content, Reports-content, Rust/domain/persistence/native-window implementation folded into this slice.

Detailed evidence: `work-log/2026-09-07-chatgpt-m5-app-shell-navigation.md`.

### Next ordered M5 item

The next top-level item is:

`Home dashboard/list cards.`

Before source changes, perform the mandatory startup again and inspect the Home/list-card screenshot evidence in `docs/UI_UX_SPEC.md`, the current `AppShell`/Main frontend, existing domain list-read capabilities, shared visual contracts, and the validated Edge visual harness. Keep this slice focused on the Home dashboard hierarchy and baseline list-card content. Do not absorb the next separate item covering list-card hover/Open, overflow-menu, and create-list interaction states except for the minimum static/reserved geometry needed to prevent later layout shift.

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
- excluded account/trial/upgrade/profile/AI/integration controls remain absent;
- diagnostic controls remain explicitly gated and outside normal product navigation;
- no infinite decorative animation, especially on `focusSurface`;
- keyboard/focus accessibility remains required as the visual foundation expands;
- visual capture dimensions remain an image-output contract, not a browser DOM viewport assumption.

## Multi-agent continuation rule

Repository state must be sufficient for a zero-context implementation agent. Use `AI_START_HERE.md`, `AGENTS.md`, `ENGINEERING_QUALITY.md`, `AGENT_WORKFLOW.md`, `HANDOFF.md`, `TODO.md`, relevant `docs/*`, and newest `work-log/*.md` entries as the continuation source of truth.
