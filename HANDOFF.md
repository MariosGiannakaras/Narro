# HANDOFF.md

Canonical continuation point. Read `AI_START_HERE.md`, `AGENTS.md`, `ENGINEERING_QUALITY.md`, `AGENT_WORKFLOW.md`, active M7 `TODO.md`, relevant `STATUS.md`, the newest immutable `work-log/` entry, and live PR/CI state before implementation.

GitHub `main` is the durable source truth.

## CURRENT MILESTONE

Milestone 7 — Floating Timer mode. Milestones 1–6 are complete. M7 item 7 remains open for physical Windows transition continuity. Do not advance to M8.

## LAST FULLY VALIDATED SOURCE

The last source with completed exact-head and resulting-main Windows CI is:
`445aa37b9b8441c9351d5dd87ff353690b3050c2`, tree `e90ad9af52f4f37fbda976b8839f8a69ab2f17c8`.

PR #150 exact-head CI #520: **PASS**.
Resulting-main CI #521: **PASS**.

## CURRENT SOURCE CANDIDATE

PR #151 exact head:
`077c2ea4b74e1f346a7ca3b9e9ec7cb76b2ca451`

PR #151 Windows CI #522: **PASS**.

Merged main source:
`8c3a108ec2c8ebdea0e5c1aa2b234490d718aff2`

Resulting-main Windows CI #523 / run `36203003936`: **IN PROGRESS** at the time of this handoff update.

Do not treat `8c3a108e...` as the new validated baseline until #523 completes successfully. There are no open implementation PRs.

## CI #521 PHYSICAL EVIDENCE

The user-provided 60 fps recording still fails Panel↔Timer continuity even after PR #148/#150 readiness callbacks:
- normal animations ~8.300s: `No active focus task`, then live task `fas` by ~8.333s;
- normal animations ~10.600s: `Loading Focus Panel…`, then settled Panel by ~10.633s;
- Windows animations Off ~35.267s: `Loading focus task…`;
- Windows animations Off ~40.700s: `Loading Focus Panel…`.

The session itself remains continuous. The defect is renderer representation/readiness ordering.

Root cause demonstrated by the recording: readiness was awaited after transparent prewarm, and the prewarm-visible WebView2 child can expose temporary renderer content.

PR #151 reorders success and recovery to:
`prepare -> publish -> readiness while hidden -> transparent prewarm -> presented-frame barrier -> reveal`.

## SEPARATE EXPAND/COLLAPSE EVIDENCE

A second independent audit of the same recording was compared with the primary review. Its Panel↔Timer observations duplicate already-known evidence. One additional correctness issue was independently verified:

- Expand, animations On, ~9.53–9.65s: native Timer grows while content is still mostly absent;
- Collapse, animations On, ~17.2s: expanded content disappears before shrink completes, leaving a blank enlarged/shrinking surface before collapsed content republishes;
- Expand, animations Off, ~43.02–43.13s: same enlarged-empty-surface sequence;
- Collapse, animations Off, ~37.38s: same content-hidden-before-resize-completes sequence.

This is a distinct resize visibility/readiness problem. It is not part of PR #151 and must be handled as the next narrow M7 source slice only after #151 is validated and physically isolated.

The recording does not establish a persistent scrollbar regression. Information-hierarchy/caret-grouping comments are UX observations, not current correctness blockers.

## INVARIANTS

Preserve:
- normal two-webview model only: `main` plus reusable `focusSurface`;
- native/Rust authority for geometry, monitor/work-area/DPI placement and presentation mode;
- authoritative timer/session/task/persistence outside renderer memory;
- live session continuity across Panel↔Timer and expand/collapse;
- one-shot finite transparent prewarm with complete rollback/cleanup;
- no fixed delay, polling loop, additional webview or high-frequency JS geometry loop;
- existing solved duplicate/stale-pixel behavior must not regress.

## EXACT NEXT ACTION

1. Check CI #523 first. Do not start another CI while it is running.
2. If #523 fails, inspect only its exact failure and fix that evidence; do not start Expand/Collapse work.
3. If #523 passes, record `8c3a108e...` as the validated source and use the #523 runtime artifact for an isolated 60 fps Panel↔Timer retest with animations On and Off.
4. If Panel↔Timer still exposes loading/empty/staging content, diagnose only that exact sequence.
5. If Panel↔Timer passes, start the separate narrow Expand/Collapse resize content-readiness/visibility slice from the validated baseline.
6. After that slice passes exact-head CI, guarded merge, resulting-main CI and physical Expand/Collapse retest, continue the remaining M7 physical matrix. Do not start M8.

No product-policy decision blocks the next action.
