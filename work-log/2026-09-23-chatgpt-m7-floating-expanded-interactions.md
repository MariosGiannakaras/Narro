# M7 Floating Timer items 4–6 — expanded interactions

Date: 2026-09-23
Agent: ChatGPT continuation after external work chat
Milestone: 7 — Floating Timer mode
Items: 4–6/14
State: COMPLETE / AUTOMATED-VALIDATED

## Source and PR

Branch:

`m7-floating-expanded`

PR:

#120 — `M7: add expanded Floating Timer interactions`

Exact validated PR head:

`468e202ef24eb52b8d00e5a2452824f8d4739cdc`

Expected-head guarded squash merge:

`97931f89ff2b6b9f1aa0ceb628732602be8fd587`

Validated resulting-main source tree:

`10972bbc672b9fae13c891be22f90fe275b3a4d5`

## Implemented product behavior

- Reuses the existing `focusSurface`; no additional persistent focus webview was introduced.
- Adds native Timer resize boundary for the established `340 x 110` collapsed and `340 x 300` expanded sizes.
- Expansion/collapse remains presentation state; renderer expanded state is published only after the native resize succeeds.
- Expanded action strip reuses authoritative Focus behavior for Break, Notes, Pause/Resume, Skip and Done, plus Return to Panel.
- Expanded subtasks reuse the existing persisted list-board subtask mutations for create, completion/reopen, reorder and delete.
- Subtask mutations retain expected-value/order concurrency guards and refresh/reconcile both authoritative subtask and board projections after committed changes.
- Expanded/collapsed icon controls keep stable 32 px geometry, accessible labels and shared tooltips.
- Windows light/dark fixtures cover both collapsed and expanded visual hierarchy/geometry.

## Scope exclusions preserved

This slice did not implement:

- item 7 Panel <-> Timer transition motion or the known Timer -> Panel left-side flash correction;
- items 8–9 shortcuts;
- item 10 persisted safe position;
- item 11 full-screen topmost validation;
- item 12 bottom/taskbar anchoring;
- items 13–14 final idle animation/performance validation.

No renderer-owned timer/session/task/scheduling authority, high-frequency JS native-window positioning loop, continuous polling or continuous decorative animation was introduced.

## PR validation

Windows CI #462:

- run ID `35860985798`;
- job ID `107180862046`;
- exact head `468e202ef24eb52b8d00e5a2452824f8d4739cdc`;
- Repository Preflight: **PASS**;
- Capture Visual Regression Fixtures: **PASS**;
- Upload Visual Regression Artifact: **PASS**;
- Build Tauri Release: **PASS**;
- Upload Diagnostic Harness Artifact: **PASS**;
- visual artifact `10750039724`, digest `sha256:b0b48a2b6251b08982ca744f985d2f7a5e7e12f9af3d7fc0e34948cabaac276e`;
- runtime artifact `10751310552`, digest `sha256:edefb1f6502f6566bc1f82a78a392369d139d0c81d95214120bac5e3468f7ab1`.

Final PR review:

- exact head unchanged;
- PR clean/mergeable;
- changed-file scope: 16 expected files;
- issue comments: none;
- submitted reviews: none;
- inline review comments: none.

## Resulting-main validation

Windows CI #463:

- run ID `35866857101`;
- job ID `107200548328`;
- exact main source SHA `97931f89ff2b6b9f1aa0ceb628732602be8fd587`;
- Repository Preflight: **PASS**;
- Capture Visual Regression Fixtures: **PASS**;
- Upload Visual Regression Artifact: **PASS**;
- Build Tauri Release: **PASS**;
- Upload Diagnostic Harness Artifact: **PASS**;
- visual artifact `10753152243`, digest `sha256:29646293c3bf76e44ac3874649721b3a0ebd3c5d708eb4be743c913aa5a9f0b0`;
- runtime artifact `10753217431`, digest `sha256:085d35fd86dd01054f8cd60265cceb92d4ab1d6a5f3da187cbb8429da5814263`.

The PR description also records local `npm run preflight:frontend` and `git diff --check` as passing. Local Rust validation was unavailable there; authoritative Windows CI supplied the complete native gate.

## Tracking outcome

- M7 items 4, 5 and 6 become complete.
- M7 advances from 3/14 to 6/14 validated top-level items.
- General roadmap remains 6/10 milestones complete.
- Next ordered item is M7 item 7: Focus Panel <-> Floating Timer content transition.
- The previously observed brief Timer -> Panel left-side flash remains active evidence for item 7 and is not silently treated as resolved.
