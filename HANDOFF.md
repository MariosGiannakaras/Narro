# HANDOFF.md

Canonical zero-context continuation state for Narro. Before changing source, read `AI_START_HERE.md`, `AGENTS.md`, `ENGINEERING_QUALITY.md`, `AGENT_WORKFLOW.md`, this file, active Milestone 7 in `TODO.md`, relevant `STATUS.md`, the Floating Timer sections of the product/UI/evidence docs, the newest relevant immutable `work-log/*.md`, and `docs/BLITZIT_HISTORY_RISK_INDEX.md`. Inspect open implementation PRs and exact CI state before making changes.

## CURRENT MILESTONE

**Milestone 7 — Floating Timer mode.**

- Milestones 1–6: COMPLETE / PASS.
- Milestone 7: ACTIVE / **6 of 14** top-level items validated.
- Milestones 8–10: NOT STARTED.
- General roadmap progress: **6/10 milestones complete**.
- M7 items 1–6: COMPLETE / VALIDATED.
- Current M7 item-7 transition slice: **0/5 checkpoints complete**.

Repository compact progress source values: `6/10M || 0/5 | 6/14`.

## CURRENT VALIDATED SOURCE BASELINE

Source/test SHA:

`97931f89ff2b6b9f1aa0ceb628732602be8fd587`

Source tree:

`10972bbc672b9fae13c891be22f90fe275b3a4d5`

This is the expected-head guarded squash merge of PR #120. Exact PR head `468e202ef24eb52b8d00e5a2452824f8d4739cdc` passed Windows CI #462; resulting-main source passed Windows CI #463. Both runs passed Repository Preflight, Windows visual regression, Tauri Release and both required artifact uploads.

Markdown-only tracking descendants do **not** replace this validated source/test baseline.

Latest immutable validation evidence:

`work-log/2026-09-23-chatgpt-m7-floating-expanded-interactions.md`

## ITEMS 4–6 VALIDATED EVIDENCE

PR #120 — `M7: add expanded Floating Timer interactions`.

Exact validated PR head:

`468e202ef24eb52b8d00e5a2452824f8d4739cdc`

PR Windows CI #462:

- run `35860985798`;
- job `107180862046`;
- Repository Preflight: PASS;
- Windows visual regression: PASS;
- Tauri Release: PASS;
- visual artifact `10750039724`, digest `sha256:b0b48a2b6251b08982ca744f985d2f7a5e7e12f9af3d7fc0e34948cabaac276e`;
- runtime artifact `10751310552`, digest `sha256:edefb1f6502f6566bc1f82a78a392369d139d0c81d95214120bac5e3468f7ab1`.

Expected-head guarded squash merge:

`97931f89ff2b6b9f1aa0ceb628732602be8fd587`

Resulting-main Windows CI #463:

- run `35866857101`;
- job `107200548328`;
- Repository Preflight: PASS;
- Windows visual regression: PASS;
- Tauri Release: PASS;
- visual artifact `10753152243`, digest `sha256:29646293c3bf76e44ac3874649721b3a0ebd3c5d708eb4be743c913aa5a9f0b0`;
- runtime artifact `10753217431`, digest `sha256:085d35fd86dd01054f8cd60265cceb92d4ab1d6a5f3da187cbb8429da5814263`.

Validated product behavior:

- `focusSurface` remains the only focus webview.
- Native expanded/collapsed sizing is `340 x 300` / `340 x 110`; native mode/window authority remains outside React.
- Expanded Break/Notes/Pause-Resume/Skip/Done reuse authoritative M6 Focus action paths.
- Expanded subtask create/complete/reopen/reorder/delete reuse persisted list-board mutations with concurrency guards and authoritative refresh reconciliation.
- Stable icon controls use 32 px slots, accessible names and shared tooltips.
- Windows visual fixtures cover both collapsed and expanded light/dark states.

## ACTIVE IMPLEMENTATION SLICE

**M7 item 7/14 — Focus Panel <-> Floating Timer content transition.**

### Checkpoint plan — 0/5 complete

1. Reconstruct the current Panel/Timer native transition ordering, renderer mode publication, reduced-motion contract and exact cause/evidence boundary for the observed Timer -> Panel left-side flash.
2. Implement the narrowest transition correction plus short one-shot opacity/transform content motion, preserving native geometry authority and no high-frequency JS geometry loop; add deterministic contracts/fixtures.
3. Validate the exact PR head with authoritative Windows CI: Repository Preflight, visual regression, Tauri Release and both required artifact uploads.
4. Verify exact head unchanged, expected changed-file scope, clean PR comments/reviews/threads and mergeability; squash merge with expected-head guard.
5. Validate resulting-main Windows CI. If automated evidence cannot prove removal of the native desktop flash, produce the exact Windows artifact and record physical PASS/FAIL before marking item 7 complete; then reconcile tracking.

## ITEM-7 KNOWN WINDOWS OBSERVATION

Physical Windows evidence from item 2:

- Focus Panel was positioned on the right side.
- Floating Timer drag/return/topmost/taskbar all passed.
- Timer -> Panel return briefly flashes the Panel on the left side before it settles back at the correct original right-side position.

Item 7 must preserve final-position correctness and eliminate/validate that transient flash. Do not mask it with continuous animation or renderer-owned window positioning.

## ITEM-7 BOUNDARIES

- Existing `focusSurface` only; no third persistent webview.
- Native/Rust remains physical window geometry/monitor/DPI/position authority.
- Renderer transition motion may be finite content opacity/transform only.
- No high-frequency JS native-window geometry animation.
- Reduced motion must remove nonessential translation/scale while keeping usable feedback.
- Transition changes cannot reset, duplicate, start, stop or switch the active timer/session.
- Items 8–9 shortcuts, item 10 persisted position, item 11 full-screen topmost validation and item 12 bottom/taskbar anchoring remain later scope.
- Items 4–6 expanded actions/subtasks/tooltips must not regress.

## NEXT AGENT ACTION

Reconstruct item 7 from the current `focus.tsx`, `focusSurfaceModeApi.ts`, native focus-surface mode/presentation functions in `src-tauri/src/lib.rs`, `motion.css`, `FloatingTimerFoundation`, `FocusPanel`, the item-2 physical observation and the relevant UI/product evidence. Determine whether the left-side flash is caused by native resize/reposition ordering, show/hide ordering, or renderer publication. Then implement only evidence-backed correction and finite transition motion.

## USER ACTION REQUIRED

**None right now.** A physical Windows transition check may become required after an automated-validated item-7 candidate exists, because CI cannot by itself prove absence of a transient desktop window flash.

## INVARIANTS THAT MUST NOT REGRESS

- Narro remains personal, local-only Windows 10/11 x64 software.
- `main` plus reusable `focusSurface` remain the normal two-webview architecture.
- native/Rust remains monitor/work-area/DPI/physical-position authority.
- Timer-mode topmost/taskbar state remains native authority.
- renderer presentation cannot become timer/session/task/scheduling authority.
- Focus Panel <-> Floating Timer presentation changes cannot reset, duplicate, start, stop or switch a session.
- future-timed Today tasks remain ineligible until due.
- item-2 native drag capability remains scoped only to `focusSurface`; interactive controls remain non-drag regions.
- items 4–6 expanded action/subtask mutations remain persistence-first and concurrency-guarded.
- Notes URLs remain explicit pointer/keyboard activation only.
- no continuous decorative animation/polling is introduced.
- excluded account/trial/upgrade/profile/AI/integration controls remain absent; diagnostics remain gated behind `?diagnostics=1`.

## BLOCKERS / NOT RUN

- No user/product decision currently blocks item 7.
- Physical Windows confirmation of flash removal is not yet runnable because item 7 has not been implemented.
- Local Rust fmt/check/Clippy/tests/Tauri release are unavailable in connector-only execution; authoritative Windows CI remains the native automated gate.
