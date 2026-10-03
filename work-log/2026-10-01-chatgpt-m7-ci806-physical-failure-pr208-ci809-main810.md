# M7 CI #806 physical failure -> PR #208 / CI #809 corrective checkpoint

Date: 2026-10-01

## Scope

This entry records the complete audit of the user-provided CI #806 production physical recording `2026-10-01 15-20-44.mp4`, the narrow Gate 7 correction it required, exact-head/main validation, and the reduced residual physical matrix.

Recording evidence:

- SHA-256: `86e51a5dcc6cc8bd5cb6af41971daa3c23016a97768c7f8469f567d4f232710b`
- duration: 172.8 s
- capture: 4480x1080 at 60 fps
- source candidate before correction: CI #806 production physical artifact `11159233418`

## Whole-recording audit

The recording was inspected across the full timeline, with dense frame sampling around every Focus presentation transition and exact-frame review around the observed compositor failure.

### Early profile state is not clean idle evidence

Near the beginning, Main reports `Blitz is already active.` while the Focus surface can show `All Clear` / `Focus task unavailable`. This is consistent with the already-documented stale SQLite residue risk from the invalid CI #795 `runtimeVisual=1` artifact, which could leave a fixture timer/session behind while the corresponding board task was absent.

Therefore the early idle/shortcut observations are not accepted as production idle evidence and are not used to diagnose a new CI #806 idle regression.

### Clean active-session evidence begins with task `Test`

From approximately 78 s onward, the newly created real task `Test` is visibly active. Across the remainder of the session:

- task identity remains `Test`;
- authoritative elapsed time continues monotonically through Panel, compact Timer and expanded Timer presentations;
- repeated Panel <-> Timer and compact <-> expanded transitions are exercised;
- Windows animations are visibly turned Off for repeated transition checks and restored On;
- the active task is later completed, Focus returns to `All Clear`, and Main simultaneously projects the task in Done, providing positive cross-window completion reconciliation evidence;
- the compact Timer is visibly dragged to a different position while the same session continues.

No document/root scrollbar regression is observed in the sampled settled states.

### Gate 7 failure at ~81.50 s

The recording contains a real active-session expanded -> compact failure around **81.50 s**. The populated Timer is briefly replaced by a white L/outline while native clipping changes, then the compact Timer returns.

This frame is independent of the earlier stale-profile contamination: it occurs after the clean `Test` session is active and while authoritative time continuity remains intact.

Result: **CI #806 is a Gate 7 physical FAIL**, specifically for Timer-to-Timer native-region presentation continuity.

The rest of the positive recording evidence remains useful for unaffected behavior, but it cannot close C4 while this frame defect exists.

## Narrow correction: PR #208

PR #208, `M7: preserve Timer frame across native region swaps`, was intentionally limited to the evidenced boundary.

Exact head:

- `d885a577c5e7f2e376ed1f6cf5e7f83146dfec58`

Correction:

- the React compact frame is fully contracted and presented before native clipping;
- Timer-to-Timer compact/expanded region swaps use `SetWindowRgn(..., FALSE)` through `apply_without_redraw`, avoiding a forced native redraw over an already-prepainted WebView2 surface;
- ordinary initial Timer presentation, Panel/cross-mode paths, DPI/full-host recovery retain normal redraw behavior;
- the expanded-Timer static contract locks the ordering and no-forced-redraw boundary.

No timer/session/persistence semantics were changed.

## Exact-head CI / artifacts

Windows CI #809 / run `36865451660` on exact head `d885a577...`: **PASS**.

Required jobs:

- validation-gate: PASS
- fast-gate: PASS
- windows-candidate: PASS
- Rust check/clippy/tests: PASS
- visual regression capture: PASS
- Tauri release: PASS
- packaged Focus runtime capture: PASS
- production physical build + verification: PASS

Production physical artifact:

- id: `11163439039`
- GitHub digest: `sha256:39ca0a91d7aa54be79ca35c509f82f25049a15a3fc4ffff199699eab309557a5`
- downloaded ZIP SHA-256 independently matched the GitHub digest exactly
- standalone `narro.exe` SHA-256: `a4b8e163539f429769540480a7aa0b5db9ca6fa2c356d6742f78d687b5cb5675`
- CI physical-build smoke: **PASS**, with zero CI `runtimeVisual` checkpoints

Packaged Focus runtime visual artifact:

- id: `11163582492`
- digest: `sha256:c184e661163bdf9ff1a9dd02859d7c9523add0a5edb6433d2f7ce8a29bf96cf9`
- downloaded ZIP SHA-256 independently matched the digest
- Panel, compact Timer and expanded Timer use the same Focus HWND `0x1022A`
- native regions settle at 340x110 compact and 340x300 expanded within the 340x700 persistent host
- captured DOM reports no unintended scrollers
- active packaged task/title/live time are present in compact and expanded endpoints
- hosted capture remains `prefersReducedMotion: true`, so the original standard-motion compositor defect still requires physical retest

## Merge / main validation

PR #208 was squash-merged as:

- main source SHA: `2767b3827670603d1ab259b6a843c2e0da82d85d`
- tree: `7ceb264e7eff8a74449c206a7cc998b2a4f0bb54`

The exact-green PR head has the **same tree SHA**, so the merged executable/build/test source is byte-identical to the CI #809 candidate.

Resulting-main Windows CI #810 / run `36867438874`: **PASS**. Its validation gate recognized the already-validated identical PR tree; fast-gate and windows-candidate were skipped by design, so CI #809 artifacts remain the exact validated artifacts for the merged tree.

## Gate state

Counters remain:

`4/10M || 2/5 | 11/19`

M7 checkpoint state remains:

- C1: PASS
- C2: PASS
- C3: PASS
- C4 / physical Gate 7: **OPEN — narrow retest required on #809 physical artifact**
- C5 / physical Gate 12 + residual platform closure: **OPEN**

No counter advances from the correction alone.

## Residual physical matrix

Do **not** repeat the entire prior active-session matrix. Carry forward unaffected CI #806 evidence where the #208 diff does not touch that behavior.

Using exact artifact `11163439039` / standalone EXE SHA-256 `a4b8e163...` and a clean validation profile:

1. Start one normal active task/session.
2. With Windows animations **On**, run at least 5 compact <-> expanded Timer cycles and inspect specifically for the former white L/outline / blank / stale frame.
3. With animations **Off**, run 2 compact <-> expanded cycles, then restore animations On.
4. Confirm second launch does not create competing Narro authority.
5. Confirm Timer -> `Blitz now` -> Panel.
6. End the task cleanly; then confirm idle Ctrl+Shift+T and Find Timer are true no-ops.
7. Confirm Timer crossing between real 100% and 125% displays, including edge/taskbar expand/collapse.
8. Disconnect/reconnect a display if available and confirm safe recovery.
9. Confirm Timer remains topmost over a maximized/borderless-fullscreen application.
10. Drag Timer, close/restart Narro, and confirm safe saved placement.

The CI #806 recording already supplies positive unaffected evidence for Panel <-> Timer continuity, continuous task/time identity, animations toggle/restoration, Focus->Main completion reconciliation and live dragging; those do not need to be repeated unless the new run contradicts them.

If the residual run passes, reconcile TODO/STATUS/crosswalk and close M7. If any residual check fails, open only a narrow evidence-backed corrective PR for that gate.
