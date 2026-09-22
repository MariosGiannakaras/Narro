# M7 Floating Timer movability — implementation and automated validation log

Date: 2026-09-22
Agent/tool: ChatGPT with GitHub connector
Milestone: 7 — Floating Timer mode
Item: 2/14 — Make the Floating Timer movable, always-on-top, and absent from normal taskbar presentation where appropriate
State: IMPLEMENTED / AUTOMATED-VALIDATED / PHYSICAL WINDOWS DRAG VALIDATION PENDING

This immutable entry records the implementation, PR validation, guarded merge and resulting-main CI evidence for M7 item 2. The top-level item remains open until the new drag interaction is physically observed on a real Windows desktop.

## Starting point and contract

Starting tracking tip:

`ef9725265abeb02d778d0f156bb4fff549185523`

M1 and item-1 evidence established:

- the normal architecture remains `main` plus reusable `focusSurface`;
- Timer mode already had physically validated always-on-top and skip-taskbar behavior;
- `focusSurface` is frameless (`decorations: false`);
- the product compact shell had no native drag region or `start_dragging` path;
- safe-position persistence/recovery belongs to M7 item 10;
- borderless-full-screen topmost validation belongs to M7 item 11;
- collapsed title/timer/subtask/add/expand content belongs to M7 item 3.

The missing item-2 behavior was therefore product-grade movability of the frameless compact surface, not another topmost/taskbar implementation.

## Implementation

Implementation branch:

`m7-floating-movability`

Final exact PR head:

`2ca6b59958e368c27024b06a652c9eb56ca30b44`

PR:

#118 — `M7: make Floating Timer movable`

Final changed-file scope was exactly five files:

- `package.json`;
- `scripts/test-ui-floating-movability.mjs`;
- `src-tauri/capabilities/focus-surface.json`;
- `src/FloatingTimerFoundation.tsx`;
- `src/floatingTimerFoundation.css`.

Production behavior:

- non-interactive areas of `FloatingTimerFoundation` use Tauri native `data-tauri-drag-region`;
- the return-to-Panel button is deliberately excluded from the drag region;
- a dedicated capability grants `core:window:allow-start-dragging` only to `focusSurface`;
- `main` does not receive the additional drag permission;
- existing Rust/native Timer-mode `set_always_on_top` and `set_skip_taskbar` behavior remains unchanged;
- no renderer `setPosition`, `startDragging` API wrapper, pointermove/mousemove/touchmove geometry loop, persistence or polling was added;
- drag regions use a grab cursor and suppress text selection, while the button retains pointer affordance.

No SQLite/schema, task/domain, timer/session, scheduling, recurrence, reminder, display-topology, safe-position persistence or dependency/lockfile behavior changed.

## Deterministic coverage

New `scripts/test-ui-floating-movability.mjs` locks:

- frameless `focusSurface` configuration;
- retained existing topmost foundation;
- drag capability scope limited to `focusSurface`;
- retained native Timer-mode topmost/skip-taskbar authority;
- native drag regions across non-interactive compact content;
- exclusion of the return-to-Panel button from drag regions;
- absence of renderer-owned geometry/JS move loops;
- explicit drag/pointer affordances;
- frontend preflight registration.

Local repository/frontend/Rust/Tauri preflight in the connector-only environment: **NOT RUN**.

## PR validation

Windows CI #453:

- run `35591332492`;
- job `106306156731`;
- exact head `2ca6b59958e368c27024b06a652c9eb56ca30b44`;
- Repository Preflight: **SUCCESS**;
- Windows visual regression: **SUCCESS**;
- Tauri Release: **SUCCESS**;
- visual artifact upload: **SUCCESS**;
- diagnostic/runtime artifact upload: **SUCCESS**.

Artifacts:

- visual artifact `10634403550`, digest `sha256:f2850ed4be8e9c588004657d03a74c20a30d218fe128a01e8cad17beff313215`;
- diagnostic/runtime artifact `10635435409`, digest `sha256:1b51f68a27180dbfdd93d0840612c477abbd0ecaa4ba38a34379262032084066`.

Final review verified:

- exact PR head unchanged;
- exactly five expected changed files;
- no conversation comments;
- no submitted reviews;
- no inline review threads;
- PR mergeable.

## Guarded merge and resulting-main validation

Expected-head guarded squash merge:

`f6c6b0fd58ab168f1f93d8a1ca19527bc4bfa044`

Tree:

`adf0342eba2944bca5e986d80f977bb06864682a`

Authoritative resulting-main Windows CI #454:

- run `35593002396`;
- job `106311386561`;
- exact main source SHA `f6c6b0fd58ab168f1f93d8a1ca19527bc4bfa044`;
- Repository Preflight: **SUCCESS**;
- Windows visual regression: **SUCCESS**;
- Tauri Release: **SUCCESS**;
- visual artifact upload: **SUCCESS**;
- diagnostic/runtime artifact upload: **SUCCESS**.

Artifacts:

- visual artifact `10635408100`, digest `sha256:1b4a398bc4f4b9b82efb23876c25f803eafd391ad14c99d14d8e2dd6a6da6b0c`;
- diagnostic/runtime artifact `10636128018`, digest `sha256:8d2113cfd00bc73a84d96294380f43f33fef460ddc86e8d880b3f986ae124cb5`.

## Validation boundary and blocker

Automated Windows CI proves the capability/configuration is accepted, deterministic contracts pass, the application builds, and the exact merged source produces the required artifacts.

It does **not** prove that a real user can physically drag the frameless product window. Repository search found no earlier physical Floating Timer drag observation from M1 or M7.

Therefore:

- M7 item 2 remains unchecked;
- Milestone 7 remains 1/14 top-level items validated;
- current slice remains 4/5;
- the exact CI #454 runtime artifact must be physically tested before completion is claimed.

Required user observation:

1. run the exact CI #454 artifact `narro-m1-runtime-harness-windows-x64` / artifact `10636128018`;
2. enter product Focus mode and Compact view;
3. drag from the Floating Timer label/background;
4. report whether the same window moves and remains usable;
5. report whether Return to Focus Panel remains clickable.

## Tracking reconciliation

This tracking checkpoint:

- updates `TODO.md` with nested automated-PASS / physical-pending evidence while leaving the top-level item open;
- updates `STATUS.md` to the new automated-validated source baseline and records the physical validation boundary;
- rewrites `HANDOFF.md` with the exact USER ACTION REQUIRED blocker and continuation.

## Continuation

Do not start M7 item 3 before the physical drag blocker is resolved.

On physical PASS, create a new immutable validation log, mark item 2 complete, advance M7 to 2/14 and start item 3. On FAIL, record the exact symptom and fix only the evidence-backed drag problem.
