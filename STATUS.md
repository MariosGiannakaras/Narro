# STATUS.md

Last updated: 2026-09-20

For zero-context continuation start with `AI_START_HERE.md` and `HANDOFF.md`. Immutable implementation evidence lives under `work-log/`.

## Current phase

**Milestone 7 — Floating Timer mode.**

- Milestone 1 / Gate A: **PASS**.
- Milestone 2 / Gate B: **PASS**.
- Milestone 3 / Gate C: **PASS**.
- Milestone 4 / Gate D: **PASS**.
- Milestone 5 / Gate E: **PASS**.
- Milestone 6 / Gate F: **PASS** — all 16 top-level items validated.
- Milestone 7: **ACTIVE / 0 of 14 top-level items validated**.
- Milestones 8–10: **NOT STARTED**.

General roadmap progress: **6 of 10 milestones complete**.

The next ordered work is M7 item 1: **Implement compact mode by transforming the existing `focusSurface` window; do not create a third persistent webview.**

## Current validated source baseline

Latest fully resulting-main-validated **source/test** baseline:

`ab5818fa92970655b63323839111a1977a5837a7`

Tree:

`60a01fa240b8ff903d99d7da87c597587ff816b8`

This is the expected-head guarded squash merge of PR #116 — `M6: handle Focus empty states` — from exact validated PR head `f0e02570308d86416861c53e1d296e5edb309ef8`.

Markdown-only tracking descendants after this source SHA do **not** replace the validated source/test baseline.

### PR #116 exact-head validation

Windows CI #445 / run `35366848885` / job `105671693894`: **SUCCESS**.

- Repository Preflight: **SUCCESS**;
- Windows visual regression: **SUCCESS**;
- Tauri Release: **SUCCESS**;
- visual artifact upload: **SUCCESS**;
- diagnostic/runtime artifact upload: **SUCCESS**;
- PR visual artifact `10557321916`, digest `sha256:829ca1d136cd2c48947f8f401295de81729486f7924cc6a49cb2d2d32b04baf3`;
- PR diagnostic/runtime artifact `10556649008`, digest `sha256:13859a5d3b70377a3c1898e9cddaba062aaa941786a81c85ca8ed6080da78c50`.

Final PR review verified the head unchanged and mergeable, `main` still exactly at PR base `50557554d326ec49ba21da46f80139cb7be009d2`, exactly nine expected changed files, and no conversation comments, submitted reviews or inline review comments.

Expected-head guarded squash merge:

`ab5818fa92970655b63323839111a1977a5837a7`

### Resulting-main validation

Windows CI #446 / run `35527458034` / job `106122008480`: **SUCCESS** on exact main source SHA `ab5818fa92970655b63323839111a1977a5837a7`.

- Repository Preflight: **SUCCESS**;
- Windows visual regression: **SUCCESS**;
- Tauri Release: **SUCCESS**;
- visual artifact upload: **SUCCESS**;
- diagnostic/runtime artifact upload: **SUCCESS**;
- main visual artifact `10610393632`, digest `sha256:bae649a3d22b004b2732a7499a4a280fef287e819695c27cde821653c3d7e402`;
- main diagnostic/runtime artifact `10609968144`, digest `sha256:79b448f6c1f3d6f6515ed440808b8c7e42904d2790cb6001e41fb1f3ed66ab4f`.

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

## Milestone 7 — next ordered work

Start M7 item 1:

1. `Implement compact mode by transforming the existing focusSurface window; do not create a third persistent webview.`

Before implementation, reconstruct the current `focusSurface` mode-switch/window-coordination contract from M1, M6, native window authority, current focus entry points and the Floating Timer evidence/spec sections. Preserve the two-webview architecture, authoritative timer/session identity, native monitor/work-area/DPI/position ownership, display-topology recovery and M1 performance constraints. Do not start later M7 polish before the compact-mode transformation contract is validated.

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
