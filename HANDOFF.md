# HANDOFF.md

Canonical continuation point. Start with `AI_START_HERE.md`, `AGENTS.md`, `ENGINEERING_QUALITY.md`, `AGENT_WORKFLOW.md`, active M7 `TODO.md`, relevant `STATUS.md`, and live GitHub PR/CI state. The latest evidence is in `work-log/2026-09-24-codex-m7-topology-recovery-main-ci.md`; older source/CI details remain in prior immutable work logs.

## CURRENT MILESTONE

Milestone 7 — Floating Timer mode. Milestones 1–6 are complete; M7 top-level items 1–6 are validated. Current compact progress: `6/10M || 5/5 | 6/14`. Items 7–14 retain physical Windows gates. The user authorized independent M7 work while physical testing is unavailable; do not advance to M8 before the M7 gates close.

## CURRENT SOURCE AND VALIDATION

PR [#134](https://github.com/MariosGiannakaras/Narro/pull/134) finished the latest independent M7 source slice. It fits and safely repositions a visible Timer after display topology changes, including when there is no saved placement; restore also rechecks measured outer geometry after target-monitor DPI changes. Native focus-surface mode presentation attempts to restore prior geometry, mode, topmost, and visibility if a step fails. This does not prove real monitor/compositor behavior.

- Exact PR head `44ad3c91f3af1f7f50666afc1802afba3808cc26`: Windows CI #499 / run `35985228076` / job `107586210179` **PASS**, including repository preflight, visual fixtures, Tauri release, and artifact uploads.
- Expected-head guarded squash merge: main source `c9ae5911aeacdd2f6604f41d35968ce691131b43`. PR head and merge trees are identical: `1e770357a7e69fa3771283c3b3ba5815231accf2`.
- Resulting-main Windows CI #500 / run `35986934404` / job `107591702897` **PASS** at that exact source, including the same required stages.
- Main runtime artifact `10803027598` (`narro-m1-runtime-harness-windows-x64`), digest `sha256:fbb99fa6058074bf3704b19f0bb33a4feb4b57ea9443227f2afdd3393ccf5ccc`. Visual artifact `10803365142`, digest `sha256:022b965346bfb2a4da17ae30b75f6477a5160f9415eb115f50deec2ecb5ce208`.
- Local frontend preflight, Rust formatting, focused tests, and diff check passed on the source branch. Local Rust compile was **NOT RUN to completion** because MSVC `link.exe` is unavailable; Windows CI is the compile/build authority. Physical Windows checks are **NOT RUN**.

The prior physical test of CI #480 found repeated stale or duplicated expanded action-strip pixels during expand/collapse. PR #125's hidden-resize correction passed CI #486/#487, but its physical re-test is still **NOT RUN**. Items 8–10 and 12 have later automated-validated source; their physical behavior remains open. Item 11 topmost/borderless, item 13 idle motion, and item 14 final-UI CPU/memory are observation or measurement gates. `TODO.md` distinguishes each automated subcheck from its open parent.

## NEXT AGENT ACTION

1. Recheck main, local state, open PRs, and latest CI before acting. No unfinished PR was open after #134. If new independent M7 implementation work or a concrete source failure appears, complete a coherent slice with local behavioral tests, one exact-head CI candidate, guarded merge, and resulting-main validation. Do not repeat completed PRs or create a replacement branch for this slice.
2. Otherwise use [the consolidated M7 runtime matrix](docs/M7_FLOATING_RUNTIME_VALIDATION.md) with source `c9ae591`, CI #500, and runtime artifact `10803027598` for one Windows session covering items 7–14. Confirm the running binary's artifact identity before attributing observations.
3. Record physical PASS/FAIL/NOT RUN and conditions in a new immutable work log. Fix any observed failure before advancing. Update `TODO.md`, `STATUS.md`, and this handoff from evidence; keep M8 closed while M7 acceptance criteria remain open.

## USER ACTION REQUIRED

Physical Windows interaction/observation is required for the remaining gates. The user said testing is unavailable for several hours; request one consolidated session when available. CI cannot prove compositor pixels, shortcut conflicts, monitor/taskbar placement, topmost behavior over other apps, idle motion, or physical CPU/memory.

## INVARIANTS

Narro remains local-only Windows software with `main` plus the reusable `focusSurface` webview. Rust/native owns timer/session, placement, DPI, and persistence. Mode changes, shortcuts, and placement recovery must preserve the live session. Display recovery stays event-driven; no continuous geometry or decorative animation loop. Keep physical and automated evidence distinct.
