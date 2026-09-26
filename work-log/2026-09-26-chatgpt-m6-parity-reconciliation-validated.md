# 2026-09-26 — M6 Focus parity reconciliation validated

Immutable work log for the reopened Milestone 6 / Focus parity gate.

## Starting point

- validated source baseline before M6 reconciliation: `4e315f551737d729f76e5f561dd8d7404717e157`;
- implementation branch: `m6/parity-reconciliation-focus-batch`;
- audit scope: A10–A17 only;
- M7 PR #155 was intentionally preserved and not modified.

## Implemented reconciliation

- **A10 ordinary Focus actions:** ordinary rows now expose non-live completion plus reserved Rocket, Move up, Move down and overflow action slots. The action rail has fixed geometry and reveals on pointer hover or keyboard/child focus without moving sibling content.
- **A11 Rocket / Make Live:** before mutation, Focus samples authoritative timer/session state. Idle state starts the selected task; an existing live work segment switches through the timer service. The previous task is not completed or skipped merely because another task becomes live.
- **A12 queue reorder:** individual-list Focus Today reorder calls the validated persisted reorder boundary and preserves task identity. All Lists aggregate reorder stays disabled.
- **A13 ordinary-row mutations:** Notes reuse `TaskNotes`; scheduling reuses `TaskScheduleDialog`; non-live completion reuses the validated completion command; permanent delete reuses the explicit confirmation dialog and confirmed-delete boundary.
- **A14 Focus Add Task:** the formerly disabled control opens a persistence-first editor. Individual-list Focus writes to that list; All Lists requires the user to select the owning list before create.
- **A15 Home lifecycle:** a native `focus_surface_exit_to_main` command shows/recreates Main through the existing lifecycle then hides Focus. It contains no timer/session transition.
- **A16 live title in Notes only:** `TaskNotes` gained optional stale-safe title editing. Focus Panel enables it only for the live task inside Notes; persisted success is followed by authoritative Focus refresh. Floating Timer/title surfaces were not changed.
- **A17 Time's Up Extend:** renderer API exposes `timer_extend`; the Focus live action strip shows Extend only at `time_up` and calls the authoritative timer transition.
- temporary static tests that encoded disabled controls or broad renderer-authority prohibitions were replaced with scoped positive invariants.
- Windows Focus fixtures now measure the ordinary-row action slot and validate the six-slot live action strip.

## Evidence-backed CI repair history

The batch stayed on one coherent PR and each repair followed exact Windows evidence:

- CI #541 reached frontend Focus contracts, where the old visual-state test still prohibited any `startTimerTask` in `FocusPanel`; it was narrowed so only stale-guarded A11 Rocket may start/switch while general pause/resume/break/complete authority remains forbidden.
- CI #542 was superseded by the next evidence-backed commit.
- CI #543 passed repository preflight and failed only the Windows row-title visual validator because it compared long-title row height against an unrelated overdue/scheduled row.
- CI #544 again passed preflight and visual capture reached the same conceptual issue: the overdue reference row can legitimately be taller because its metadata wraps after the new reserved action rail.
- the validator was changed to directly enforce the actual long-title contract: compact row minimum, two-line 32–48px title height, line clamp 2, normal wrapping, hidden overflow, keyboard-accessible tooltip, and unchanged row width.
- **CI #545 passed all required gates** on exact PR head `c13e7f6cfbec3accde4841fd4fd61b68d0924ff6`.

## Authoritative evidence

PR #158 `M6: reconcile verified Focus parity gaps`:

- exact validated head: `c13e7f6cfbec3accde4841fd4fd61b68d0924ff6`;
- Windows CI #545 / run `36243619057`: PASS;
- repository preflight: PASS;
- Rust fmt/check/clippy/tests: PASS;
- Windows visual regression: PASS;
- Tauri release build: PASS;
- visual artifact: `narro-m5-visual-regression`, artifact id `10906627762`, digest `sha256:4f58feb6526ad3624e07897f58377b620936e4316f60fb64c9de0f83e45d671a`;
- diagnostic artifact: `narro-m1-runtime-harness-windows-x64`, artifact id `10906727736`, digest `sha256:97dd86ad64f12ffa35da0ce5d0b10dadb1375df6f70178d0584751d234ec65ef`.

Merge/main:

- PR #158 was marked ready only after exact-head CI passed;
- expected-head guarded squash merge result: `b1ff5910abec82272c4ee57479a44eb62248a88f`;
- resulting-main Windows CI #546 / run `36244258977`: PASS;
- #546's validation gate proved the merged main tree is identical to the exact validated PR-head tree and that PR CI #545 passed, so the workflow correctly skipped the redundant heavy main job;
- validated source baseline: `b1ff5910abec82272c4ee57479a44eb62248a88f`.

Markdown-only reconciliation commits after that source SHA do not replace the validated source baseline.

## Preserved invariants

- renderer orchestration did not become general timer/session authority;
- Make Live preserves prior tracked work by switching through authoritative session semantics;
- future-timed scheduled tasks do not gain an enabled Rocket path before eligibility;
- All Lists remains aggregate and does not gain aggregate reorder;
- permanent delete remains explicit and active-session-safe;
- task creation remains persistence-first; no create-then-reorder partial-success sequence was introduced;
- live-title editing remains confined to Notes;
- Home does not reset timer/session state;
- row hover/focus actions reserve geometry and do not shift sibling controls;
- M7/A18/compositor work was not mixed into this batch.

## Remaining ordered work

M6 reconciliation is complete; Gate F is reclosed and roadmap completion becomes 6/10 once this tracking reconciliation is merged.

By explicit user direction, implementation **stops before M7**. PR #155 remains open/draft at `2755d598ad2b13b974cda02760ebf44cd5e60b13`; CI #532 passed, physical compositor validation has not run, and it is non-mergeable against the newer main. Preserve it unchanged until the user provides the next instruction.
