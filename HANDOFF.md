# HANDOFF.md

Canonical continuation point. Read `AI_START_HERE.md`, `AGENTS.md`, `ENGINEERING_QUALITY.md`, `AGENT_WORKFLOW.md`, active M7 `TODO.md`, relevant `STATUS.md`, `docs/BLITZIT_HISTORY_RISK_INDEX.md` when applicable, the newest immutable `work-log/` entry, and live PR/CI state before implementation.

GitHub `main` is the durable source truth.

## CURRENT MILESTONE

Milestone 7 — Floating Timer mode. Milestones 1–6 are complete. M7 item 7 remains open for physical Windows compositor/readiness verification. Do not advance to M8 before the remaining M7 acceptance conditions are observed.

## CURRENT VALIDATED SOURCE

Validated source baseline: `445aa37b9b8441c9351d5dd87ff353690b3050c2` (merged PR #150), tree `e90ad9af52f4f37fbda976b8839f8a69ab2f17c8`. The tree is identical to exact PR #150 head `a4dd2839a84fc4cd69c2d7ed55beb224cc6d811f`.

PR #150 exact-head Windows CI #520 / run `36197064882`: **PASS**.
Resulting-main Windows CI #521 / run `36198699903`: **PASS**.
- runtime artifact `10890859242`, digest `sha256:88ffd7a3e838ec4199cfa8ac933d2451f785c530c564670f5d7fdbd4bdf674d4`;
- visual artifact `10890679899`, digest `sha256:b8cce0c7944d9a2e96208ad2a680ee93dfdb550dfa11dca5b6d0a20bd0d3a03f`.

The immediately preceding Panel-readiness source is PR #148 exact head `d63d1f3ce49e77ceae99d7ce1c8e95d19e1aed42` (CI #518 PASS), merged as `d462a85ba1fb91c1dfd1df09baa6cf33fb48dc86` (resulting-main CI #519 PASS). PR #150 builds on that source and adds only Timer readiness.

Any later markdown-only tracking commit does **not** replace the validated source baseline above.

## PHYSICAL EVIDENCE FROM CI #517

The user supplied a new 60 fps recording from the CI #517 runtime build.

The native-host blank flash fixed by PR #147 is no longer the primary failure. Remaining observed staging is renderer projection readiness:
- Panel→Timer around ~4.55s briefly shows `No active focus task` while the outgoing Panel already shows live task `fas`; by ~4.60s the Timer shows `fas`.
- Timer→Panel around ~20.25s briefly shows `Loading Focus Panel…`; by ~20.30s the full settled Panel is visible.

This is a physical **FAIL** for CI #517 item-7 continuity, but it is narrower than the CI #514 failure: transparent native prewarm removed the blank-host boundary and exposed the remaining target-projection race.

## COMPLETED CAPABILITY

PR #148:
- adds a Panel presentation-readiness callback;
- marks Panel ready only after its current board target has settled and the timer projection has settled;
- uses the existing shared `waitForModeReady` coordinator boundary before final frame/reveal;
- keeps native transparent prewarm, geometry authority and rollback unchanged.

PR #150:
- adds the symmetric Timer presentation-readiness callback;
- marks Timer ready only after its timer projection has settled and, when a live task exists, the matching board snapshot has settled;
- wires Timer readiness into the same existing mode-readiness boundary;
- keeps the coordinator order and native geometry/prewarm implementation unchanged;
- adds static regression contracts for Timer readiness state.

PR #149 was closed as overlapping after PR #148 merged. There are no open implementation PRs at this checkpoint.

## INVARIANTS

Preserve:
- normal two-webview model only: `main` plus reusable `focusSurface`;
- Rust/native authority for geometry, monitor/work-area/DPI placement and presentation mode;
- authoritative timer/session/task/scheduling/persistence outside renderer memory;
- transparent host prewarm remains one-shot and finite, with complete cleanup/rollback;
- target reveal must not precede authoritative projection readiness;
- no fixed delay, polling loop, extra webview or high-frequency JS geometry loop;
- live session continuity and all validated M1–M6 correctness invariants.

## UNFINISHED M7 WORK

Immediate item-7 retest on CI #521:
- record Panel→Timer→Panel at 60 fps with normal Windows animations;
- repeat after actual Windows `Show animations in Windows` / animation effects is Off, then restore the user's setting;
- verify no `No active focus task`, `Loading Focus Panel…`, blank/pale frame or other target staging is ever revealed;
- verify no abrupt return flicker or horizontal focus-surface scrollbar;
- verify expand/collapse retains no stale/duplicated pixels;
- verify active task/session identity and elapsed/remaining time remain continuous.

Other M7 physical gates remain as tracked in `TODO.md` and `docs/M7_FLOATING_RUNTIME_VALIDATION.md`: native-hidden/Panel shortcut follow-up, secondary-monitor/topology/no-saved-position recovery, taskbar/DPI/constrained-work-area cases, and independent borderless/optional exclusive-fullscreen stacking.

## EXACT NEXT ACTION

1. Recheck `main`, open PRs and CI before any source change.
2. Use CI #521 runtime artifact `10890859242`.
3. Run the same 60 fps Panel↔Timer test that exposed the CI #517 staging states, first with normal animations and then with Windows animations Off.
4. Inspect the returned recording frame-by-frame.
5. If any staging/loading/blank frame remains, fix only that observed sequence. If clean, record physical PASS and continue the remaining M7 physical matrix. Do not start M8.

No product-policy decision blocks the next action.
