# STATUS.md

Last updated: 2026-09-07

For zero-context continuation start with `AI_START_HERE.md` and `HANDOFF.md`.

## Current phase

**Milestone 5 — Design system and Main window product UI.**

- Milestone 1 / Gate A: **PASS**.
- Milestone 2 / Gate B: **PASS**.
- Milestone 3 / Gate C: **PASS**.
- Milestone 4 / Gate D: **PASS**.
- Milestone 5: **ACTIVE / 2 of 28 top-level items validated**.
- Milestones 6–10: **NOT STARTED**.

**`M-5/10 | 6/6 | 2/28`**

The first two ordered M5 shared-visual-foundation slices are fully main validated: semantic theme tokens and typography. A new spacing/radius/elevation source slice has not started yet.

## Current validated source baseline

Latest fully main-validated **source/test** baseline:

`8f6395fc50387dee59a60eae3706e9923dd8ffe3`

This is the guarded squash merge of PR #67 — `M5: add typography foundation`.

### PR #67 exact-head validation

Final exact validated PR head:

`91e766a5c4d00f06cf9fa3222c7b79307f1719ee`

Initial PR head `7e865150ca984839d24b1f56d32c860ddb5e4673` failed Windows CI #264 only because the new typography contract test assumed LF line endings while Windows checkout supplied CRLF. Config/date/theme checks had passed; release/artifact were skipped. The evidence-backed correction changed only that test to accept `\r?\n`.

Windows PR CI #266:

- run `34087763134`;
- job `101635005150`;
- exact head `91e766a5c4d00f06cf9fa3222c7b79307f1719ee`;
- conclusion: **SUCCESS**;
- Repository Preflight: **PASS**;
- Tauri Release: **PASS**;
- artifact upload: **PASS**;
- artifact ID `10006003958`;
- artifact name `narro-m1-runtime-harness-windows-x64`;
- digest `sha256:a24f9e23db08cfdc6943d7329f21b77893befb3c744f91807e73bd357c7327af`;
- final exact-head semantic/diff review: **PASS**;
- PR comments/reviews/review threads requiring resolution: **none**.

PR #67 was squash-merged with expected-head guard `91e766a5c4d00f06cf9fa3222c7b79307f1719ee`, producing source SHA `8f6395fc50387dee59a60eae3706e9923dd8ffe3`.

### Resulting-main validation

Windows main CI #267:

- run `34088634798`;
- job `101637463417`;
- exact source SHA `8f6395fc50387dee59a60eae3706e9923dd8ffe3`;
- conclusion: **SUCCESS**;
- Repository Preflight: **PASS**;
- Tauri Release: **PASS**;
- artifact upload: **PASS**;
- artifact ID `10006311758`;
- artifact name `narro-m1-runtime-harness-windows-x64`;
- digest `sha256:0fd1f7a137cf84ae83684290342fff05ef6b69dd18d44cb80dd6151cd2a46c38`.

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

The second M5 top-level item is validated complete.

Validated typography contract now provides:

- Windows-first `"Segoe UI Variable", "Segoe UI", system-ui, sans-serif` UI family;
- reusable page-title, section-title, task-title, metadata and live-timer roles;
- regular/medium/semibold/bold weight tokens and role line heights;
- reusable timer numeral geometry using `font-variant-numeric: tabular-nums` plus OpenType `tnum`;
- shared `App.css` consumption without the legacy Inter/Avenir/Helvetica scaffold stack;
- `TimerSessionProjection` consumption of metadata and tabular-number primitives;
- deterministic `scripts/test-ui-typography.mjs` coverage in `preflight:frontend`, including Windows CRLF-safe import-order validation.

No Rust/domain/persistence/window behavior changed in this slice. No physical Windows acceptance is required for this typography-only foundation change; screenshot fixture validation remains a separate later M5 item.

Detailed evidence: `work-log/2026-09-07-chatgpt-m5-typography-foundation.md`.

### Next ordered M5 item

The next top-level item is:

`Implement shared spacing/radius/elevation primitives.`

Before source changes, perform the normal mandatory startup, inspect the active M5 TODO, `docs/UI_UX_SPEC.md` spacing/radius and elevation/surface guidance, current shared CSS and frontend preflight structure, then define a narrow spacing/radius/elevation-only slice. Do not skip ahead to motion, reduced-motion, tooltip/popover/menu primitives, screenshot harness, App shell, Home, board or task UI.

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
- semantic color and typography roles remain reusable contracts and may be calibrated later through screenshot comparison without losing role semantics;
- timer numerals remain tabular and must not acquire per-second transition animation;
- no hover/focus interaction may reflow sibling content or move pointer targets;
- reduced-motion and keyboard/focus accessibility remain required as the visual foundation expands.

## Multi-agent continuation rule

Repository state must be sufficient for a zero-context implementation agent. Use `AI_START_HERE.md`, `AGENTS.md`, `ENGINEERING_QUALITY.md`, `AGENT_WORKFLOW.md`, `HANDOFF.md`, `TODO.md`, relevant `docs/*`, and newest `work-log/*.md` entries as the continuation source of truth.
