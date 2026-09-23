# STATUS.md

Last updated: 2026-09-23

For zero-context continuation start with `AI_START_HERE.md` and `HANDOFF.md`. Immutable implementation evidence lives under `work-log/`.

## Current phase

**Milestone 7 — Floating Timer mode.**

- Milestone 1 / Gate A: **PASS**.
- Milestone 2 / Gate B: **PASS**.
- Milestone 3 / Gate C: **PASS**.
- Milestone 4 / Gate D: **PASS**.
- Milestone 5 / Gate E: **PASS**.
- Milestone 6 / Gate F: **PASS** — all 16 top-level items validated.
- Milestone 7: **ACTIVE / 6 of 14 top-level items validated**.
- Milestones 8–10: **NOT STARTED**.

General roadmap progress: **6 of 10 milestones complete**.

M7 items 1–6 are validated. M7 item 7 remains open: the first automated-validated correction physically FAILED, and the evidence-backed corrective source is now automated-validated on Windows. A new physical Windows re-test is required before item 7 can close.

## Current validated source baseline

Latest resulting-main automated-validated **source/test** baseline:

`91a28ba7c5389130b6edb45deabe62a9e01f9d08`

Tree:

`e4ecb48ab3ca84915d4d7972e83f7bfd5ed5ad78`

This is the expected-head guarded squash merge of PR #122 — `M7: fix physical Focus transition artifacts` — from exact validated PR head `b5d65917ea75f50ab351b20fe750c56366923ae6`.

The corrective source addresses the physical Windows evidence from CI #469 without broadening scope:

- Panel target-monitor DPI staging remains native/Rust authority but stages at the configured Panel edge rather than raw work-area origin;
- focus-surface transition geometry clips horizontal overflow while preserving required Panel vertical scrolling;
- Floating Timer collapsed/expanded native resize is presentation-gated across finite paint boundaries so one expand/collapse action does not visibly expose an enlarged/shrunken intermediate hierarchy;
- no renderer-owned native positioning, timer/session/task/scheduling authority, polling clock, third webview or high-frequency geometry loop was introduced.

### PR #122 exact-head validation

Windows CI #471 / run `35885188470` / job `107263411613`: **SUCCESS** on exact PR head `b5d65917ea75f50ab351b20fe750c56366923ae6`.

- Repository Preflight: **SUCCESS**;
- Windows visual regression: **SUCCESS**;
- Tauri Release: **SUCCESS**;
- visual artifact upload: **SUCCESS**;
- diagnostic/runtime artifact upload: **SUCCESS**;
- PR visual artifact `10761689991`, digest `sha256:442ad79b52565c9481379987b66dc81a996a794ffd40dfed95bf380283fa8b2c`;
- PR runtime artifact `10763131609`, digest `sha256:6a06cc70202189f620ee30ada78afa4769ba04befa3509e7e8e0da657535af84`.

Windows CI #470 on previous head `3f66457a0f7164ecbb0d16601a2ee8408394ee92` failed only because a stale collapsed deterministic contract still prohibited every `requestAnimationFrame`; the contract was narrowed to allow exactly one finite paint-boundary helper while continuing to prohibit renderer clock/loop ownership. No production change was made for that failure.

Final PR review verified the exact head unchanged, seven expected files, no discussion comments/reviews and clean mergeability.

Expected-head guarded squash merge:

`91a28ba7c5389130b6edb45deabe62a9e01f9d08`

### Resulting-main validation

Windows CI #472 / run `35887924927` / job `107272742116`: **SUCCESS** on exact main source SHA `91a28ba7c5389130b6edb45deabe62a9e01f9d08`.

- Repository Preflight: **SUCCESS**;
- Windows visual regression: **SUCCESS**;
- Tauri Release: **SUCCESS**;
- visual artifact upload: **SUCCESS**;
- diagnostic/runtime artifact upload: **SUCCESS**;
- main visual artifact `10763618553`, digest `sha256:8f25127a7b924fbada100d85826ae553a9e92f755554e6a6f20c985b32b16710`;
- main runtime artifact `10763339801`, digest `sha256:2a763e673486fa60fd87b2af358846db1a5a00e7d7c9b7658ef3cb3301239c94`.

Automated validation does **not** prove real-desktop transient behavior. Physical Windows re-validation remains the final item-7 gate.

## Milestone 6 validated work

Items 1–14 remain documented in their immutable M6 work logs and retain all previously validated invariants. Item 15 adds the following validated presentation behavior without changing authoritative task/timer/session/scheduling/native state:

### Item 15 — Focus visual states

Immutable evidence: `work-log/2026-09-17-2215-chatgpt-m6-focus-visual-states.md`.

Validated behavior:

- the active/running live card projects the existing authoritative timer state using the accent token family;
- paused and overtime states use warning treatment, break uses success treatment, and Time's Up uses destructive treatment;
- ordinary overdue rows project the existing authoritative `task.isOverdue` field and are visually distinct without renderer-side due-state recalculation;
- expanded Notes reuse the established `FocusLiveActions` -> `TaskNotes` path and receive only an expanded visual surface;
- no-eligible presentation is derived only when there is no live task, no Remaining task and at least one Scheduled future-timed task;
- item 15 intentionally preserves the existing empty-card copy and does not add item-16 empty/no-eligible behavior or controls;
- item-11 live-title motion, item-12 ordinary-row full-title access, item-13 reserved action geometry and item-14 tooltip/accessibility contracts remain intact;
- Windows light/dark fixtures cover running, paused, break, Time's Up, overtime, Notes-expanded and no-eligible states;
- asynchronous Notes capture uses a scenario-specific Edge virtual-time budget and the no-eligible dashed-state selector is specificity-safe against the base live-card border shorthand.

The implementation changed no Rust/Tauri, SQLite/schema, dependency/lockfile, task/domain, authoritative timer/session transition, scheduling classification, display-topology or persistence code.

### Item 16 — Empty/no-eligible Focus states

Immutable evidence: `work-log/2026-09-20-2229-chatgpt-m6-focus-empty-states.md`.

Validated behavior:

- generic idle remains distinct when Remaining work exists without a live task;
- no-eligible is shown only when there is no live/Remaining work and at least one future-timed Scheduled task;
- future-scheduled work stays visible in Scheduled and remains ineligible until due;
- genuinely empty Today uses the screenshot-backed `All Clear` state;
- empty/no-eligible states do not fabricate live timer/actions and do not own timer/session/scheduling authority;
- Windows light/dark fixtures and deterministic contracts cover both states;
- no Rust/Tauri, SQLite/schema, persistence, scheduling classification, task/domain or timer/session transition behavior changed.

## Milestone 7 validated work

### Item 1 — Same-window compact-mode foundation

Immutable evidence: `work-log/2026-09-21-1120-chatgpt-m7-floating-compact-mode.md`.

Validated behavior:

- the existing `focusSurface` webview transforms between product Panel and compact modes without creating another persistent webview;
- native Rust mode state remains presentation authority and is reconciled by the renderer on mount;
- product Compact control calls the native same-window transition and renderer mode publishes only after native success;
- compact -> Panel return uses the existing preference-aware `present_focus_panel` path;
- the minimal compact foundation preserves M1 always-on-top/skip-taskbar behavior without absorbing later collapsed/expanded content items;
- mode switching remains presentation-only and does not mutate timer/session/task/scheduling state;
- `?diagnostics=1` retains the M1 diagnostic surface.

CI history included two test-contract-only failures (#447 stale M6 root assertion; #449 LF/CRLF-brittle compact assertion). Both were corrected without production changes before exact-head CI #451 and resulting-main CI #452 passed all required gates.

### Item 2 — Floating Timer movability/topmost/taskbar

Implementation source: PR #118 / merge `f6c6b0fd58ab168f1f93d8a1ca19527bc4bfa044`.

Automated-validated behavior:

- the frameless product `FloatingTimerFoundation` exposes Tauri-native drag regions over non-interactive content;
- the return-to-Panel button is deliberately excluded from the drag region and remains interactive;
- `core:window:allow-start-dragging` is scoped to `focusSurface` only rather than broadened to `main`;
- native Timer mode remains authority for always-on-top and skip-taskbar state;
- no JS pointer/mouse move loop or renderer-owned `setPosition` path was added;
- safe-position persistence/recovery remains item 10 and borderless-full-screen topmost validation remains item 11;
- no timer/session/task/scheduling/persistence semantics changed.

Physical Windows validation:

- Drag Floating Timer: **PASS**;
- Return to Focus Panel button: **PASS**;
- always-on-top over normal apps: **PASS**;
- no normal Floating Timer taskbar button: **PASS**;
- final Panel position after return: correct original right-side position;
- observed transition artifact: a very brief left-side Panel flicker before settling right. This does not invalidate item 2 and is assigned to the later transition slice.

### Item 3 — Collapsed Floating Timer content

Immutable evidence: `work-log/2026-09-23-1421-codex-m7-floating-collapsed.md`.

Implementation source: PR #119 / merge `14db934e998b2bb619f04bf7e7a1b0fe7b5553fe`.

Validated behavior:

- native Timer mode uses the screenshot/spec-backed `340 x 110` collapsed viewport while retaining item-2 topmost/taskbar/drag authority;
- the title and subtask progress derive from the authoritative list-board projection;
- the timer derives from the existing revision-ordered authoritative timer/session projection;
- Focus Panel and Floating Timer share one timer presentation helper covering EST, count-up, Pomodoro, break, Time's Up and overtime states;
- Add and Expand affordances are visible but intentionally non-mutating until the ordered expanded-content slice;
- deterministic Windows light/dark fixtures validate the collapsed hierarchy and stable geometry;
- no renderer timer/session/task authority, polling, per-second persistence, continuous decorative animation or position loop was introduced.

PR Windows CI #458 and resulting-main Windows CI #459 passed Repository Preflight, Windows visual regression, Tauri Release and both required artifact uploads. Local frontend preflight also passed; local Rust/Tauri checks were unavailable because the local environment has no Rust toolchain.

### Items 4–6 — Expanded Floating Timer interactions

Immutable evidence: `work-log/2026-09-23-chatgpt-m7-floating-expanded-interactions.md`.

Implementation source: PR #120 / merge `97931f89ff2b6b9f1aa0ceb628732602be8fd587`.

Validated behavior:

- native Timer sizing supports the established `340 x 110` collapsed viewport and `340 x 300` expanded viewport without another focus webview;
- expand/collapse remains renderer presentation state and native resizing publishes before the renderer commits the corresponding presentation;
- expanded actions reuse the existing authoritative Focus paths for Break, Notes, Pause/Resume, Skip and Done, plus Return to Panel;
- expanded subtasks reuse persisted list-board subtask identities and mutations for create, completion/reopen, reorder and delete, including expected-value/order concurrency guards;
- saved subtask mutations refresh and reconcile authoritative subtask and board projections before more mutations continue;
- icon-only action/subtask controls retain stable 32 px geometry, accessible names and shared tooltips without changing Timer width;
- deterministic Windows light/dark visual fixtures cover collapsed and expanded density/geometry;
- no renderer timer/session/task/scheduling authority, high-frequency native geometry loop, polling clock or continuous decorative animation was introduced.

PR Windows CI #462 and resulting-main Windows CI #463 passed Repository Preflight, Windows visual regression, Tauri Release and both required artifact uploads.

## Milestone 7 — next ordered work

Finish M7 item 7 physical Windows re-validation before starting item 8.

Use the exact resulting-main CI #472 runtime build from source `91a28ba7c5389130b6edb45deabe62a9e01f9d08`.

Required physical checks:

1. Put Focus Panel on the configured right side, then repeat Panel -> Floating Timer -> Return to Focus Panel.
2. **Flicker PASS** only if there is no visible left/work-area staging flash.
3. **Position PASS** if Panel returns directly to the configured right side.
4. In Floating Timer, repeat collapsed -> expanded -> collapsed.
5. **Overflow PASS** only if no horizontal focus-surface scrollbar appears in collapsed, expanded or Panel presentation.
6. **Expand transition PASS** only if one click produces the final expanded/collapsed presentation without a visible enlarged/shrunken intermediate compact state.
7. **Session PASS** if mode/expand switching does not reset, duplicate or switch the active session/timer.
8. Report overall transition UX PASS/FAIL with any remaining concrete visual symptom.

On full physical PASS: create a new immutable physical-validation log, mark item 7 complete, advance M7 to **7/14**, reset item-8 slice to **0/5**, reconcile tracking, then start ordered item 8. On any FAIL: record the exact symptom and fix only evidence-backed behavior; do not start item 8.

## Durable correctness decisions

Future work must preserve:

- Narro remains personal, local-only Windows 10/11 x64 software; no auth/cloud/telemetry/integration authority is introduced.
- Tauri 2 + React/TypeScript + authoritative Rust/domain state + SQLite remains the validated architecture.
- `main` and reusable `focusSurface` remain the normal two-webview model.
- native/Rust window coordination remains monitor/work-area/DPI/physical-position authority.
- display-topology handling remains event-driven and coalesced; no renderer/high-frequency polling loop is introduced.
- authoritative task/list/subtask/session/timer/scheduling/note/archive/preferences state remains outside renderer memory; persistence-first mutations remain the success boundary.
- stable identities, tracked Time Taken, scheduling/date-only/timezone/recurrence semantics and All Lists aggregate semantics must not regress.
- future-timed Today tasks remain ineligible until due.
- repeated Focus entry cannot duplicate or silently switch an existing live session.
- Focus queue partitioning cannot clone identities or reinterpret scheduling state.
- Break/Pause-Resume/Skip/Done remain authoritative timer/session transitions.
- Notes URLs require explicit pointer/keyboard activation and may never auto-launch from Focus entry/task switching/Notes opening.
- item-11 active/live title scrolling remains preference-driven, overflow-aware, transform-only and reduced-motion-safe.
- ordinary Focus row titles remain two-line-clamped with accessible full-title access.
- Focus action controls keep item-13 reserved geometry and existing hit positions.
- item-14 icon-only tooltips preserve accessible names, placeholder inactivity and stable geometry.
- item-15 visual states remain presentation-only projections of authoritative state; item 16 must not turn those markers into domain authority.
- hover/focus interactions may not reflow sibling geometry; reduced-motion remains usable and timer numerals remain tabular.
- excluded account/trial/upgrade/profile/AI/integration controls remain absent; diagnostics remain gated behind `?diagnostics=1`.
