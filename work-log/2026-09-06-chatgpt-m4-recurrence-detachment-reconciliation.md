# M4 recurrence detachment reconciliation — 2026-09-06

## Scope

Validated and reconciled the Milestone 4 recurrence detachment semantics in PR #49.

## Validated behavior

- Recurrence removal uses the existing canonical `delete_recurrence_rule` persistence mutation rather than introducing a second recurrence authority.
- Generated child task identities survive recurrence removal.
- Edited child titles plus task-owned notes, subtasks, reminders and sessions survive.
- Completed and archived generated children survive recurrence removal.
- Children already independent before recurrence removal remain independent and are not rewritten.
- The parent ends with `recurrence_rule_id = NULL`.
- Still-linked generated children end with `recurrence_parent_task_id = NULL`.
- Rule-owned `recurrence_occurrences` rows are removed with the deleted rule while child tasks remain intact.
- A removed recurrence rule cannot materialize future children.
- A forced recurrence-rule delete failure rolls back child and parent link mutations and preserves occurrence rows.
- Repeated recurrence removal returns typed `RecurrenceStoreError::NotFound` without mutating preserved tasks.

## Regression coverage

`src-tauri/tests/recurrence_detachment.rs` proves preservation of child identity/state/history, independent-child stability, rollback, no-future-materialization and repeated-detach behavior.

## Validation history

Windows CI #237 / run `33994179609` on head `85589b8ea85124b0244131856225e539b58d5a0e` failed only `cargo fmt --check` on the new test file. The exact rustfmt deltas were applied with no behavioral change.

### Exact PR-head validation

PR #49 exact validated head:

`d7e41e69ed3e69647ad1b67a5d07efaa0d034784`

- Windows PR CI #238 / run `34016467394` / job `101440990105`: **SUCCESS**.
- Repository preflight: **PASS**.
- Tauri release build: **PASS**.
- Artifact upload: **PASS**.
- Artifact ID: `9984212532`.
- Artifact digest: `sha256:f04e43e3d06e487dd7d37ea6414f3a739a139e2b9ec48c33514fa4c13363505d`.
- Final exact-head semantic/diff review: **PASS**.
- Unresolved inline review threads: **none**.

PR #49 was guarded-squash-merged with expected head `d7e41e69ed3e69647ad1b67a5d07efaa0d034784`.

Resulting source SHA:

`6c9217f90f3b7db46a30393548e640faf671fb55`

### Resulting-main validation

- Windows main CI #239 / run `34017068364` / job `101442607083`: **SUCCESS** on exact source SHA `6c9217f90f3b7db46a30393548e640faf671fb55`.
- Repository preflight: **PASS**.
- Tauri release build: **PASS**.
- Artifact upload: **PASS**.
- Artifact ID: `9984403460`.
- Artifact digest: `sha256:d8426b78e8e2cb7ed4c509be41e8de1bdf3688f892bb202b7787b4279bc82409`.

## Roadmap effect

`Implement recurrence detachment semantics while preserving already modified independent children` is complete and may be checked in `TODO.md`.

The next ordered source slice is startup/resume/date-change recurrence orchestration and missed-day catch-up. The separate one-off reminder and tray/background reminder TODO parent items remain open until the already-recorded physical installed-build due-notification acceptance evidence is captured; PR #45 source itself remains validated.

## Source baseline rule

`6c9217f90f3b7db46a30393548e640faf671fb55` is the latest fully main-validated **source** baseline. Any later Markdown-only reconciliation SHA does not replace it.
