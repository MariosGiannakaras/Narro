# Static contract migration register

Status: maintenance backlog, not an M7 blocker.

The repository historically used source-text assertions to protect architecture during rapid reconstruction. Some are still valuable; others are too coupled to implementation shape and have caused false CI failures.

## Keep as static architecture/build contracts

These are appropriate source/config-level invariants:
- no production `floatingTimer` runtime label/window;
- no production `timer.html` entry;
- one persistent `focusSurface` architecture;
- CI capture build vs production physical build separation;
- workflow fast-gate / Windows-candidate ordering;
- physical artifact must not activate `runtimeVisual`;
- forbidden dependency/side-effect boundaries where importing/calling the API itself would violate architecture.

Representative files:
- `scripts/test-single-focus-architecture.mjs`;
- `scripts/test-focus-runtime-visual-harness.mjs`;
- `scripts/test-ci-tiering.mjs`;
- selected negative assertions in `scripts/test-note-url-activation.mjs`.

## Migrate when next touched

The following tests contain implementation-shape assertions that should move toward exported pure helpers, typed API tests or runtime/DOM behavior checks when their surface is next modified:

### High priority
- `scripts/test-ui-focus-entry.mjs`
  - avoid exact function-boundary/newline assumptions;
  - assert native presentation semantics through stable function/behavior boundaries.
- `scripts/test-ui-focus-surface-transition.mjs`
  - reduce exact `invoke<void>(...)` source-string requirements;
  - prefer transition helper/state-machine tests plus packaged runtime validation.
- `scripts/test-ui-focus-toggle-shortcut.mjs`
  - keep active/idle authority behavior tests;
  - reduce exact renderer IPC spelling assertions.
- `scripts/test-ui-focus-panel.mjs`
  - preserve callback-driven/no-authority invariants;
  - avoid exact Tauri invocation layout where typed API tests can prove the same behavior.

### Medium priority
- `scripts/test-ui-cross-window-board-sync.mjs`
  - move mutation/invalidation proof toward wrapper unit tests or runtime projection tests instead of requiring exact source wrapper names.
- `scripts/test-ui-floating-compact-mode.mjs`
  - keep single-host/no-domain-mutation invariants;
  - reduce exact IPC string coupling.
- `scripts/test-in-app-shortcuts.mjs`
  - retain pure shortcut resolver tests as primary evidence;
  - keep source scans only for routing boundaries that cannot be imported safely.
- `scripts/test-ui-preferences.mjs`
  - migrate task-create EST parsing assertions toward shared parser/API behavior rather than source membership.

## Migration rule

Do not create a standalone broad rewrite solely to eliminate all source-text tests.

Instead, whenever one of the listed surfaces changes:
1. identify the real invariant;
2. add or strengthen a semantic test at the narrowest stable boundary;
3. remove the redundant exact-source assertion in the same slice;
4. keep architecture-negative assertions only when they protect a durable forbidden dependency/window/runtime path.

A test is considered migrated when ordinary refactoring/formatting/line-ending changes cannot make it fail without changing the protected behavior.

## Evidence

The immediate trigger for this register was CI #804, where `test-ui-focus-entry.mjs` passed on Windows because a CRLF-sensitive function-end search accidentally scanned too much of `lib.rs`, then failed correctly under the new Ubuntu fast gate. The contract was corrected to use stable function signatures and the actual semantic call chain.
