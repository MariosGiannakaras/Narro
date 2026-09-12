# HANDOFF.md

Canonical zero-context continuation state for Narro. Before changing source, read `AI_START_HERE.md`, `AGENTS.md`, `ENGINEERING_QUALITY.md`, `AGENT_WORKFLOW.md`, this file, active Milestone 6 in `TODO.md`, relevant `STATUS.md`, Focus/Blitz sections in `docs/PRODUCT_SPEC.md`, `docs/UI_UX_SPEC.md`, `docs/SOURCE_AUDIT.md`, `docs/BEHAVIOR_MATRIX.md`, `docs/BLITZIT_HISTORY_RISK_INDEX.md` when timer/session reliability risks apply, and the newest relevant immutable `work-log/*.md` entries. Inspect open implementation PRs and their exact CI state before making changes.

## CURRENT MILESTONE

**Milestone 6 — Blitz Mode / Focus Panel.**

- Milestones 1–5: COMPLETE / PASS.
- Milestone 6: ACTIVE / **2 of 16** top-level items validated.
- Milestones 7–10: NOT STARTED.

## CURRENT VALIDATED SOURCE BASELINE

Source/test SHA: `bea3f352c609456762f83e4911017ac9ef23f682`

Source tree: `5df0821b29fa4a017a3dc84ea14c40937c85cf35`

Markdown-only tracking commits do not replace the validated source/test baseline.

## LATEST COMPLETED IMPLEMENTATION / CI

**M6 items 1–2 — Start Blitz from eligible Today tasks + auto-select top eligible Today task.**

Immutable evidence: `work-log/2026-09-13-chatgpt-m6-focus-entry.md`.

- implementation branch `m6-focus-entry`;
- PR #101 `M6: start Blitz from eligible Today tasks`;
- initial PR CI #392 / run `34718784154` / job `103620662277`: **FAIL** only at rustfmt; exact formatter output was applied without semantic changes;
- final exact PR head `6f329f4b9217a2f68d138ac30b1027071e209b8b`;
- Windows PR CI #394 / run `34718967378` / job `103621226697`: **SUCCESS**;
- PR visual artifact `10305998073`, digest `sha256:3fa00578ce46e4ea16a6352486e718edc4162b6b62075dc548da7293bc87e7fa`;
- PR diagnostic artifact `10305534197`, digest `sha256:ab58df8f0f630d0bbc7fcbcc116f77d1246a220222f4100803842d3f7a0ed273`;
- expected-head guarded squash merge source SHA `bea3f352c609456762f83e4911017ac9ef23f682`;
- Windows main CI #395 / run `34721633029` / job `103628495654`: **SUCCESS**;
- main visual artifact `10306966263`, digest `sha256:038577b82dee0bd9a01fced940f05965e95bd596d868aee03e6497fa542f08dc`;
- main diagnostic artifact `10306782210`, digest `sha256:d555877e292a44e9e0b135d3bd800853b77006d45b29cd3c6d1b3b8fb8bf433f`.

Validated capability:

- explicit `Blitz now` enters Focus; render/app launch does not auto-start;
- Rust selects the top eligible Today task using validated M4 eligibility and planning priority;
- future-timed Today tasks are skipped until due;
- scheduled tasks projected into Today can be selected when eligible;
- authoritative timer mode is Pomodoro when enabled, otherwise EST countdown or count-up;
- repeated/concurrent invocation returns the existing live projection instead of duplicating/switching sessions;
- no-eligible is typed and creates no session;
- post-commit Focus Panel presentation failure cannot turn a committed timer/session start into an apparent mutation failure;
- Focus entry never auto-opens note URLs;
- the existing M3 timer/session boundary and two-webview architecture remain unchanged.

## ACTIVE IMPLEMENTATION SLICE

**M6 item 3/16 — Reproduce Focus Panel hierarchy.**

No item-3 implementation branch or PR should be assumed from this reconciliation. Reconstruct exact current main/open-PR state before source changes.

Current small-slice progress: **0/5**.

### Five checkpoints for this slice

1. mandatory reconstruction + exact screenshot/source hierarchy and existing focusSurface projection contract — pending;
2. narrow Focus Panel hierarchy implementation + deterministic/visual coverage + semantic/diff review — pending;
3. exact PR-head Windows CI — pending;
4. final exact-head review + expected-head guarded merge — pending;
5. resulting-main Windows CI + `TODO.md`/`STATUS.md`/`HANDOFF.md`/immutable work-log reconciliation — pending.

## INVARIANTS THAT MUST NOT REGRESS

- Focus Panel and Floating Timer remain presentations of the existing authoritative Rust-owned timer/session state; renderer state cannot become parallel authority.
- `main` and `focusSurface` remain the normal two-webview architecture; do not create a third persistent focus webview.
- Start Blitz and all later focus controls preserve stable task identity, durable Time Taken/session accounting, persistence-first transitions, crash/restart recovery, sleep policy, Time's Up/overtime and Pomodoro semantics already validated in M3.
- Future-timed Today tasks remain ineligible until due, matching validated M4 scheduling rules.
- Repeated Start Blitz cannot duplicate or silently switch an existing live session.
- Narro launch or renderer creation cannot implicitly start a timer; only explicit domain actions may mutate timer/session state.
- Entering Focus Mode or changing the live task must never auto-open note URLs.
- Task/list/archive/Search/theme/preferences behavior validated through M5 must not regress.
- System/Dark/Light remains shared SQLite-backed preference state across both normal webviews.
- excluded account/trial/upgrade/profile/AI/integration controls remain absent.
- keyboard/focus-visible access, stable action geometry, reduced-motion behavior and tabular timer numerals remain required.
- do not absorb Milestone 7 Floating Timer polish, Milestone 8 shortcuts/preferences, Milestone 9 Reports, or Milestone 10 release work into this slice.

## NEXT AGENT ACTION

Re-run the mandatory startup sequence from current `main`, confirm this reconciliation tracking descendant is current and there is no unfinished newer M6 PR/branch, then reconstruct M6 item 3 from current `focusSurface` entry/bundle, timer-session projection/events, list/Today projection, existing task/list APIs, theme runtime and the screenshot/source evidence in `docs/RESEARCH_EVIDENCE.md`, `docs/UI_UX_SPEC.md`, `docs/PRODUCT_SPEC.md`, `docs/SOURCE_AUDIT.md` and `docs/BEHAVIOR_MATRIX.md`. Determine the narrow presentation/read-model boundary for the Focus Panel hierarchy: list selector, Today identity, quick controls, aggregate EST/progress, active live card, remaining queue, Add Task, scheduled group and done group. Reuse authoritative state; do not implement item 4+ timer/action polish unless item 3 structurally requires a minimal dependency.

## USER ACTION REQUIRED

**None.**

## BLOCKERS / NOT RUN

- No product/user decision currently blocks M6 item 3.
- Full local Rust/Tauri validation may be unavailable in connector-only environments; authoritative Windows GitHub Actions remains required before merge.