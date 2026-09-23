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

M7 items 1–6 are validated. M7 item 7 now has an automated-validated motion-smoothing correction merged through PR #123 and resulting-main CI #477. The prior CI #472 physical re-test established PASS for left/staging flicker, final position, normal product-size horizontal overflow and session continuity, but FAIL for expand/collapse and overall transition smoothness. A physical re-test of the exact CI #477 build remains the final item-7 gate.

2026-09-24 Codex Computer Use Windows test attempt: **NOT RUN**. The already-running installed `narro.exe` does not match the CI #477 executable, and the Computer Use helper failed before window enumeration. No transition repetitions or visual results were obtained; item 7 remains open. See `work-log/2026-09-24-codex-m7-computer-use-blocked.md`.

## Current validated source baseline

Latest resulting-main automated-validated **source/test** baseline:

`36a3f6f6a1ecd5249839100e1e1249305050fa07`

Tree:

`207b9bbef4fdcf5d4aec95a81ae6604bc56b55a0`

This is the expected-head guarded squash merge of PR #123 — `M7: smooth Focus surface transitions` — from exact validated PR head `861f1866c4a9dbf5dd721352b41bc969c18087dd`.

The current corrective source addresses the remaining physical Windows motion evidence without broadening scope:

- both keyed Panel and Timer roots animate the current content out before invoking native mode geometry;
- renderer mode publication still occurs only after the corresponding native transition succeeds, and the final keyed root then enters through the existing finite motion primitive;
- collapsed/expanded Floating Timer presentation now performs a finite inline exit, native resize, final hierarchy publication and finite entrance;
- transition completion uses filtered DOM `transitionend` boundaries with duplicate-completion protection;
- reduced motion remains 1ms/zero-displacement through the shared tokens;
- native/Rust remains geometry authority; no renderer-owned native positioning, timer/session/task/scheduling authority, polling clock, third webview or high-frequency geometry loop was introduced.

### PR #123 exact-head validation

Windows CI #476 / run `35905921052` / job `107333499742`: **SUCCESS** on exact PR head `861f1866c4a9dbf5dd721352b41bc969c18087dd`.

- Repository Preflight: **SUCCESS**;
- Windows visual regression: **SUCCESS**;
- Tauri Release: **SUCCESS**;
- visual artifact upload: **SUCCESS**;
- diagnostic/runtime artifact upload: **SUCCESS**;
- PR visual artifact `10771406771`, digest `sha256:865db1cc4048b107769d5b463503822e42daef8d85f93937758515c1e280f093`;
- PR runtime artifact `10772355711`, digest `sha256:76d5657febe7f898374e50da666840207afeb854989a2a4607d3811cce69a577`.

Semantic review after an earlier green PR run found that the initial branch wired exit completion only for Timer -> Panel. The production Panel root and deterministic contract were corrected so both directions must remain keyed and exit-complete before native geometry. CI #475 was then cancelled only because the test-only contract-hardening commit superseded its head; final CI #476 validates the corrected exact head.

Final PR review verified the exact head unchanged, eight expected files, no discussion comments/reviews and clean mergeability.

Expected-head guarded squash merge:

`36a3f6f6a1ecd5249839100e1e1249305050fa07`

### Resulting-main validation

Windows CI #477 / run `35907803574` / job `107339752322`: **SUCCESS** on exact main source SHA `36a3f6f6a1ecd5249839100e1e1249305050fa07`.

- Repository Preflight: **SUCCESS**;
- Windows visual regression: **SUCCESS**;
- Tauri Release: **SUCCESS**;
- visual artifact upload: **SUCCESS**;
- diagnostic/runtime artifact upload: **SUCCESS**;
- main visual artifact `10772656537`, digest `sha256:1e6077f496a1f726887cc7dc4e3871174ee0330e48d543ebe375d5fdccc38235`;
- main runtime artifact `10771699056`, digest `sha256:1da888a05d0158b6db30c5e6f3b17688cb660cac2ef103ec5c949997fad1daa2`.

The resulting-main tree is byte-identical to the validated PR head tree. Automated validation does **not** prove real-desktop transient behavior, so physical Windows re-validation remains the final item-7 gate.

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

Physically re-test M7 item 7 on the exact resulting-main CI #477 runtime artifact; do **not** start item 8.

Physical Windows re-test of exact CI #472 source `91a28ba7c5389130b6edb45deabe62a9e01f9d08`:

- left/staging Flicker: **PASS**;
- final right-side Panel position: **PASS**;
- horizontal scrollbar at normal product-controlled Panel/collapsed/expanded geometry: **PASS**;
- session/timer continuity: **PASS**;
- Expand/Collapse: **FAIL**;
- overall Transition UX: **FAIL** because a very small return-to-Panel flicker/instantaneous swap remains.

Repository/UI evidence keeps the expanded viewport at established `340 x 300`; unused vertical space in a no-subtask case is not sufficient evidence to redesign that geometry.

The correction is now implemented and automated-validated through PR CI #476, guarded merge `36a3f6f6a1ecd5249839100e1e1249305050fa07` and resulting-main CI #477. Use runtime artifact `10771699056`, digest `sha256:1da888a05d0158b6db30c5e6f3b17688cb660cac2ef103ec5c949997fad1daa2`, for the final physical transition test before item 7 can close.

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
