# STATUS.md

Last updated: 2026-09-08

For zero-context continuation start with `AI_START_HERE.md` and `HANDOFF.md`.

## Current phase

**Milestone 5 — Design system and Main window product UI.**

- Milestone 1 / Gate A: **PASS**.
- Milestone 2 / Gate B: **PASS**.
- Milestone 3 / Gate C: **PASS**.
- Milestone 4 / Gate D: **PASS**.
- Milestone 5: **ACTIVE / 10 of 28 top-level items validated**.
- Milestones 6–10: **NOT STARTED**.

**`M-5/10 | 5/5 | 10/28`**

The first ten ordered M5 items are fully main validated: semantic theme tokens, typography, spacing/radius/elevation, shared motion primitives, `prefers-reduced-motion`, accessible tooltip/popover/menu primitives, the deterministic dark/light visual-regression harness, Main-window App shell/navigation, Home dashboard/list cards, and list-card rest/hover/Open/overflow-menu/create-list states. The next ordered item is the Create/Edit List modal.

## Current validated source baseline

Latest fully main-validated **source/test** baseline:

`61fd8b982839c03133e05163842f5a1f9b2c8e0d`

This is the guarded squash merge of PR #82 — `M5: add list-card interaction states`.

### PR #82 exact-head validation

Final exact validated PR head:

`35c2668fd2fa0f1d88764584d41cf42df9795964`

Windows PR CI #290:

- run `34161062758`;
- job `101862841977`;
- exact head `35c2668fd2fa0f1d88764584d41cf42df9795964`;
- conclusion: **SUCCESS**;
- Repository Preflight: **PASS**;
- Capture Visual Regression Fixtures: **PASS**;
- Upload Visual Regression Artifact: **PASS**;
- Tauri Release: **PASS**;
- Upload Diagnostic Harness Artifact: **PASS**;
- visual artifact ID `10032735331`;
- visual artifact name `narro-m5-visual-regression`;
- visual artifact digest `sha256:ba2d353a45051fd6cd8ae7c6faf53dcac173eddcbb87d3052d797799ccb1f7e8`;
- diagnostic artifact ID `10032854077`;
- diagnostic artifact name `narro-m1-runtime-harness-windows-x64`;
- diagnostic artifact digest `sha256:a95087f02de6ef7d248cc4471af90f97f7fd874ead75d4dca0c27fef5c8a7bb2`;
- final exact-head semantic/diff review: **PASS**; 9 changed files confined to Home interaction states, visual harness/preflight, and branch handoff scope;
- PR comments, review submissions, and inline review threads requiring resolution: **none**.

PR #82 was squash-merged with an expected-head guard set to the validated head, producing source SHA `61fd8b982839c03133e05163842f5a1f9b2c8e0d`.

### Resulting-main validation

Windows main CI #291:

- run `34161939996`;
- job `101865381504`;
- exact source SHA `61fd8b982839c03133e05163842f5a1f9b2c8e0d`;
- conclusion: **SUCCESS**;
- Repository Preflight: **PASS**;
- Capture Visual Regression Fixtures: **PASS**;
- Upload Visual Regression Artifact: **PASS**;
- Tauri Release: **PASS**;
- Upload Diagnostic Harness Artifact: **PASS**;
- visual artifact ID `10033003446`;
- visual artifact name `narro-m5-visual-regression`;
- visual artifact digest `sha256:7919f1f34c84c45a4ae9a8048d2ba161dc1cd5cb38917ee6d49c9613f7724ee0`;
- diagnostic artifact ID `10033125255`;
- diagnostic artifact name `narro-m1-runtime-harness-windows-x64`;
- diagnostic artifact digest `sha256:67133df3313f25bb068c382b753504d58bc62245c4a91982fb18330f6298d1e1`.

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

### Completed: Home dashboard/list cards

The ninth M5 top-level item is validated complete.

Validated behavior now provides:

- a read-only Rust Home snapshot composed from validated active-list and active-task persistence reads;
- active-list cards with up to four pending task previews plus full pending-count and aggregate-EST totals;
- a default Home hierarchy with neutral time-based greeting, `Your Lists`, helper copy and `All Lists` aggregate card;
- stable list-card header geometry with reserved future action space;
- safe six-digit-hex list accent projection and no direct rendering of unvalidated stored icon paths;
- loading, empty and typed-error states;
- renderer recreation reloads Home data from SQLite rather than retaining hidden renderer authority;
- deterministic Home light/dark Edge fixtures isolated from runtime IPC and normal user data;
- theme-stable Home/card geometry and semantic hierarchy checks in the visual harness;
- deterministic `scripts/test-ui-home-dashboard.mjs` preflight coverage.

Detailed evidence: `work-log/2026-09-07-2154-chatgpt-m5-home-dashboard-list-cards.md`.

### Completed: list-card interaction states

The tenth M5 top-level item is validated complete.

Validated behavior now provides:

- callback-gated Open/Edit/Duplicate/Archive card actions so product runtime exposes controls only when a real target exists;
- shared accessible overflow Menu/MenuItem primitives inside the pre-reserved action slot;
- absolute hover/focus Open overlay with unchanged card/header/title/footer geometry;
- callback-gated dashed Create List tile;
- deterministic light/dark forced-hover/Open, open-menu and Create List fixture states;
- visual validation proving rest/interaction/create-card geometry parity and theme parity;
- reduced-motion-safe Open presentation;
- deterministic `scripts/test-ui-list-card-states.mjs` frontend-preflight coverage;
- no Rust/domain/persistence/list CRUD/modal/board/search/settings/reports scope folded into the slice.

Detailed evidence: `work-log/2026-09-08-0019-chatgpt-m5-list-card-interaction-states.md`.

### Next ordered M5 item

The next top-level item is:

`Create/Edit List modal with icon import, color selection, title, cancel/create states.`

Start from the validated Home/list-card callback surface and M2 persistence-first list CRUD. Implement only the evidence-backed modal, icon import, color selection, title, cancel/create/edit states and the minimum real persistence integration required by those states. Preserve existing Home/card geometry and do not absorb the later list board, task-card state model, list-settings/archive/delete flows, search palette, Settings content or Reports behavior.

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