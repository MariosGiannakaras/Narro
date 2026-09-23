# M7 Focus transition motion smoothing — automated validation

Date: 2026-09-23 19:30 UTC
Agent/tool: Codex / GitHub connector
Milestone: 7 — Floating Timer mode
Item: 7/14
State: MOTION CORRECTION AUTOMATED-VALIDATED / PHYSICAL WINDOWS RE-TEST PENDING

## Trigger and continuation state

The exact resulting-main CI #472 build had already physically established:

- left/staging flicker: PASS;
- final configured Panel position: PASS;
- normal product-size horizontal overflow: PASS;
- session/timer continuity: PASS;
- expand/collapse motion: FAIL;
- overall transition UX: FAIL because return-to-Panel still felt slightly flickery/instantaneous.

The repository handoff required a narrow finite presentation correction before any M7 item 8 work.

## Implementation merged

PR #123, `M7: smooth Focus surface transitions`, changed only presentation sequencing and deterministic contracts:

- current Panel/Timer content exits through the existing 150ms opacity/transform primitive before native geometry is invoked;
- both keyed roots now provide the exit-completion callback, covering Panel -> Timer and Timer -> Panel;
- native success remains the boundary before renderer mode publication and the new keyed entrance;
- collapsed/expanded Floating Timer content performs finite inline exit -> native resize -> final hierarchy publication -> finite entrance;
- filtered DOM `transitionend` completion and one-shot refs prevent duplicate native transition/resize commits;
- reduced motion retains the existing 1ms duration and zero displacement;
- no polling, timeout loop, high-frequency JS native-window animation, renderer positioning authority, third webview, or timer/session/task/scheduling change was added.

Changed files:

- `src/focus.tsx`;
- `src/FocusSurfaceTransition.tsx`;
- `src/focusSurfaceTransition.css`;
- `src/FloatingTimerFoundation.tsx`;
- `src/floatingTimerFoundation.css`;
- `scripts/test-ui-focus-surface-transition.mjs`;
- `scripts/test-ui-floating-expanded.mjs`;
- `scripts/test-ui-floating-compact-mode.mjs`.

## Review-found defect and correction

The inherited PR head initially passed CI #474, but exact semantic review found a real deadlock: only the Timer root supplied `exiting` and `onExitComplete`, so Panel -> Timer could enter pending state without ever invoking native geometry.

The branch was corrected in forward commits:

- `0cfa0907b77961f6d623f6c49aad4060cca25f52` — wired the Panel root and changed the contract to inspect both roots independently;
- `861f1866c4a9dbf5dd721352b41bc969c18087dd` — preserved explicit keyed/mode assertions for each direction.

CI #475 was cancelled only because the final test-hardening commit superseded its head. It is not failure evidence.

## Local validation

- `git diff --check`: PASS.
- `npm run preflight:frontend`: PASS on `0cfa0907b77961f6d623f6c49aad4060cca25f52`; this is the final production source, before the test-only contract-hardening commit.
- `npm run test:ui-focus-surface-transition`: PASS on final head `861f1866c4a9dbf5dd721352b41bc969c18087dd`.
- affected compact/expanded transition contracts: PASS.
- strict TypeScript + Vite production build: PASS.
- local Rust fmt/check/clippy/tests: NOT RUN because the local environment has no Rust toolchain; exact-head Windows CI supplied those gates.

## Exact PR validation

Final PR head:

`861f1866c4a9dbf5dd721352b41bc969c18087dd`

Windows CI #476 / run `35905921052` / job `107333499742`: PASS.

- Repository Preflight: PASS;
- Windows visual regression: PASS;
- Tauri Release: PASS;
- visual artifact `10771406771`, digest `sha256:865db1cc4048b107769d5b463503822e42daef8d85f93937758515c1e280f093`;
- runtime artifact `10772355711`, digest `sha256:76d5657febe7f898374e50da666840207afeb854989a2a4607d3811cce69a577`.

Final review found eight expected files, no PR comments/reviews/threads, unchanged exact head and clean mergeability.

## Guarded merge and resulting-main validation

Expected-head guarded squash merge:

`36a3f6f6a1ecd5249839100e1e1249305050fa07`

Tree:

`207b9bbef4fdcf5d4aec95a81ae6604bc56b55a0`

The merge tree is byte-identical to the validated PR head tree.

Resulting-main Windows CI #477 / run `35907803574` / job `107339752322`: PASS.

- Repository Preflight: PASS;
- Windows visual regression: PASS;
- Tauri Release: PASS;
- visual artifact `10772656537`, digest `sha256:1e6077f496a1f726887cc7dc4e3871174ee0330e48d543ebe375d5fdccc38235`;
- runtime artifact `10771699056`, digest `sha256:1da888a05d0158b6db30c5e6f3b17688cb660cac2ef103ec5c949997fad1daa2`.

## Tracking result and continuation

- `TODO.md`: parent item 7 remains open; added the automated-validated motion-corrective sub-checkpoint.
- `STATUS.md`: current automated-validated source baseline advanced to merge `36a3f6f...` / tree `207b9bbe...`.
- `HANDOFF.md`: rewritten with exact CI #477 artifact identity and physical procedure.
- Compact progress remains `6/10M || 4/5 | 6/14` because automated CI cannot prove transient real-desktop motion.

Use exact resulting-main runtime artifact `10771699056` for physical Windows validation. On full PASS, record a new immutable physical-pass log, mark M7 item 7 complete, advance to 7/14 and begin ordered item 8. On any FAIL, record the precise symptom and make only a narrow evidence-backed correction; do not start item 8.
