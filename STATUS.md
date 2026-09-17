# STATUS.md

Last updated: 2026-09-17

For zero-context continuation start with `AI_START_HERE.md` and `HANDOFF.md`. Immutable implementation evidence lives under `work-log/`.

## Current phase

**Milestone 6 — Blitz Mode / Focus Panel.**

- Milestone 1 / Gate A: **PASS**.
- Milestone 2 / Gate B: **PASS**.
- Milestone 3 / Gate C: **PASS**.
- Milestone 4 / Gate D: **PASS**.
- Milestone 5 / Gate E: **PASS** — all 28 top-level items validated.
- Milestone 6: **ACTIVE / 15 of 16 top-level items validated**.
- Milestones 7–10: **NOT STARTED**.

General roadmap progress: **5 of 10 milestones complete**.

M6 items 1–15 are validated. The next ordered work is item 16: **Handle empty/no-eligible-task states.** Do not start Milestone 7 or later work in parallel.

## Current validated source baseline

Latest fully resulting-main-validated **source/test** baseline:

`1ddf7daf60c1507f12fc87b67119aa65fc8621bb`

Tree:

`e6e984689ea8a82c34b60790fdcee328c6d7b37b`

This is the expected-head guarded squash merge of PR #115 — `M6: add Focus visual states` — from exact validated PR head `9e68c546826513255d2e9538e6fc9baae428a432`.

Markdown-only tracking descendants after this source SHA do **not** replace the validated source/test baseline.

### PR #115 exact-head validation

Windows CI #441 / run `35088139238` / job `104767793017`: **SUCCESS**.

- Repository Preflight: **SUCCESS**;
- Windows visual regression: **SUCCESS**;
- Tauri Release: **SUCCESS**;
- visual artifact upload: **SUCCESS**;
- diagnostic/runtime artifact upload: **SUCCESS**;
- PR visual artifact `10443108727`, digest `sha256:b7bf9c7372e744e4e46879581c56e94cf23dc32d94b601f917d6f1ef568ab99f`;
- PR diagnostic/runtime artifact `10444005797`, digest `sha256:af4846a9b2c554c73dc5179a8dce986beb423006277742b06798df6ef3ec5364`.

Final PR review verified the head unchanged and mergeable, `main` still at PR base `8a335e9bc186e65fe673b24b640c715bf01bdb20`, exactly 11 expected changed files, and no conversation comments, submitted reviews or inline review threads.

Expected-head guarded squash merge:

`1ddf7daf60c1507f12fc87b67119aa65fc8621bb`

### Resulting-main validation

Windows CI #442 / run `35264051291` / job `105346638723`: **SUCCESS** on exact main source SHA `1ddf7daf60c1507f12fc87b67119aa65fc8621bb`.

- Repository Preflight: **SUCCESS**;
- Windows visual regression: **SUCCESS**;
- Tauri Release: **SUCCESS**;
- visual artifact upload: **SUCCESS**;
- diagnostic/runtime artifact upload: **SUCCESS**;
- main visual artifact `10515379819`, digest `sha256:a99b0bdec30c42ae5f572a4142a90fb99027e8fe7e6f135b0c145bc6d447279c`;
- main diagnostic/runtime artifact `10516970405`, digest `sha256:fe3b6317750b0bedc24c4a4f538bf5c0063191dec88ec5dc541be42a4d86ed75`.

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

## Milestone 6 — next ordered work

The final top-level item is:

16. `Handle empty/no-eligible-task states.`

Before implementation, reconstruct the exact behavior/content boundary from the current `FocusPanel`, item-15 state projection, Focus entry eligibility, scheduling rules, current visual fixtures/validators, and the Focus/Blitz sections of `docs/PRODUCT_SPEC.md`, `docs/UI_UX_SPEC.md`, `docs/SOURCE_AUDIT.md` and `docs/BEHAVIOR_MATRIX.md`. Preserve the authoritative distinction between genuinely empty Today work and future-timed Today work that is visible but not yet eligible. Do not create renderer-owned eligibility rules or implicit timer starts.

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
