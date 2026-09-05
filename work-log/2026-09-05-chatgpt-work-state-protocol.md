# Work-state continuity hardening — 2026-09-05

## Scope

Docs/tracking-only hardening after the repository-wide milestone/PR audit. No runtime/source/config/test behavior changes.

## Validated project position

- Milestones 1–3 are complete and validated.
- Milestone 4 is ACTIVE / PARTIALLY IMPLEMENTED.
- Milestones 5–10 are NOT STARTED.
- Latest completed M4 slice is timezone/DST correctness from PR #37.
- Validated source baseline remains `77625cfac01ad133a4c5c188a9613b43d294460c`.
- PR #37 exact validated head `4ef9e89ccf68989716444d45a833c6e4436723f6` passed Windows PR CI #207 / run `33976481855`.
- Main source SHA `77625cfac01ad133a4c5c188a9613b43d294460c` passed Windows CI #208 / run `33977191609`.
- Next M4 recurrence execution/materialization slice is NOT STARTED.

## State-model decision

`HANDOFF.md` now records explicit milestone and slice states so a zero-context agent does not infer active work from branch names, old PRs, scaffolds, schema fields, or prerequisite code.

Milestone states:

- NOT STARTED
- ACTIVE
- COMPLETE

Slice states:

- NOT STARTED
- ACTIVE
- PR VALIDATED
- MERGED / MAIN VALIDATION PENDING
- VALIDATED / RECONCILIATION PENDING
- COMPLETE / RECONCILED

Later-milestone code introduced as a prerequisite for the current ordered milestone is classified as FOUNDATION ONLY and does not start the later milestone.

`HANDOFF.md` also contains an ACTIVE WORK RECORD with the active milestone, active slice, branch, PR, pending validation state, and next candidate slice. An open implementation PR not represented there must be reconciled before new source work begins.

## PR #2 / #3 source-loss audit

PR #2 and PR #3 were closed unmerged as superseded historical Milestone 1 shortcut attempts. Their diffs were explicitly compared with merged PR #4 before declaring that closure safe.

PR #2 included:

- Win32 `RegisterHotKey` / `UnregisterHotKey`;
- `WM_HOTKEY` handling on `focusSurface`;
- idempotent registration/unregistration;
- deterministic conflict probe;
- trigger counting and structured errors;
- temporary diagnostic UI;
- temporary diagnostic chord `Ctrl+Alt+Shift+N`.

PR #3 was another alternate implementation with:

- Win32 `RegisterHotKey` / `UnregisterHotKey`;
- versioned shortcut-specific state/event projection;
- idempotence/overflow/poisoned-lock tests;
- deterministic duplicate-registration conflict probe;
- temporary diagnostic chord `Ctrl+Alt+Shift+F10`.

Merged PR #4 / merge `fce2bbf65ab07d50a6928605c00fb694079739a0` is the authoritative implementation and covers the required capability with the final confirmed chord `Ctrl+Shift+B`, Rust-owned versioned diagnostics, native `RegisterHotKey`/`WM_HOTKEY`, idempotent register/unregister, conflict diagnostics, trigger count, and show/recreate-main behavior. Later physical validation closed the M1 shortcut capability.

Conclusion: **no unique required product behavior or source fix needs recovery from PR #2/#3.** Their code is historical alternative implementation, not missing implementation.

## Repository changes

- `HANDOFF.md`: added canonical work-state semantics, active-work record, prerequisite/foundation distinction, branch/PR reconciliation rules, and explicit PR #2/#3 source-loss conclusion.
- new immutable work log: this file.

`TODO.md` and `STATUS.md` remain unchanged because their milestone truth is already correct after PR #38 reconciliation.

## Validation

- source/runtime changes: NONE;
- Windows CI: NOT REQUIRED for docs-only `[skip ci]` tracking changes;
- PR #2/#3 diff audit: COMPLETE;
- current open implementation PR state before this docs change: none.

## Continuation point

Remain in Milestone 4. No source slice is currently active. When source implementation resumes, explicitly start the next M4 recurrence execution/materialization slice, create/record its branch and PR in `HANDOFF.md`, and do not begin Milestone 5+ while M4 remains open.