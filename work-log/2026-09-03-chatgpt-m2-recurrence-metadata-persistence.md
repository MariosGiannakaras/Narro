# 2026-09-03 — M2 recurrence metadata persistence

## Scope

Implemented the Milestone 2 recurrence **metadata persistence contract only**. This slice deliberately does not generate/materialize occurrences or implement Milestone 4 scheduling/eligibility behavior.

## Merged implementation

PR #15 was squash-merged to `main` as `106867b40d1c13572e11468b9217a9738a453036`.

Validated exact PR head: `87ddb30ba142706c7cc377accd4a3aef5fb1fb43`.

Changed durable source surface:

- `src-tauri/src/domain/recurrence.rs`
- `src-tauri/src/domain/mod.rs`
- `src-tauri/src/persistence/recurrence.rs`
- `src-tauri/src/persistence/mod.rs`
- `src-tauri/tests/recurrence_metadata_persistence.rs`

Temporary branch-only formatting/refactor workflows were removed before the authoritative final-head validation and were not merged to `main`.

## Implemented contracts

- typed `RecurrenceRuleRecord`, `NewRecurrenceRuleInput`, and `UpdateRecurrenceRuleInput`;
- stable recurrence rule UUID identity;
- exactly-one-parent rule linkage through `recurrence_rules.parent_task_id` and `tasks.recurrence_rule_id`;
- transactional create/read/update/disable/delete operations;
- duplicate parent-rule rejection;
- zero-interval rejection;
- daily/yearly pattern validation with no weekday/month-day selector;
- weekly rules require a weekday mask and no month-day;
- monthly rules require exactly one of weekday mask or calendar month-day;
- canonical `YYYY-MM-DD` start date validation;
- timed recurrence requires local time and timezone together;
- canonical local-time validation and bounded/non-control timezone token validation;
- archived parent/list mutation rejection;
- completed parent cannot be reactivated/rewritten as an active recurrence source, while stop/delete lifecycle operations remain available;
- persisted `replace_existing`, `is_active`, and `last_materialized_local_date` fields are decoded as durable metadata, without executing materialization;
- deletion clears the parent rule link and detaches existing generated child tasks by clearing `recurrence_parent_task_id` instead of deleting those tasks;
- parent↔rule consistency is checked on reads/mutations so dangling or mismatched linkage is surfaced as an error rather than silently accepted;
- restart regression coverage proves recurrence identity/metadata survives database reopen.

## Validation history

Initial Windows CI exposed two repository-quality issues before the final pass:

1. Rustfmt drift on the new recurrence files. Stable rustfmt 1.98.1 formatting was applied on the branch.
2. Clippy `too_many_arguments` on the private normalization helper. This was fixed structurally by introducing a private `RuleMetadataInput` aggregate rather than suppressing the lint.

A temporary helper initially failed to propagate a Python patch failure through PowerShell. No source was modified by that failed attempt. The helper was hardened to fail-fast, the intended refactor was then applied, and all temporary workflow files were removed before final validation.

Authoritative Windows CI:

- workflow run: `33768324650` / Windows CI #101;
- exact head: `87ddb30ba142706c7cc377accd4a3aef5fb1fb43`;
- repository preflight: PASS;
- Rust format/check/Clippy/tests: PASS;
- Tauri release build: PASS;
- diagnostic artifact upload: PASS;
- artifact ID: `9898946694`;
- artifact name: `narro-m1-runtime-harness-windows-x64`;
- artifact size: `10843720` bytes;
- digest: `sha256:55b733023d551324295412baeadaf9f0e606781c563e17a12cf4034a18f800af`;
- artifact expiry: `2026-12-02T14:41:17Z`.

## Scope boundary preserved

Still deferred to Milestone 4:

- recurrence occurrence generation/materialization;
- Monday-of-due-week child behavior;
- scheduling eligibility/classification;
- DST/timezone catch-up behavior;
- startup/resume/date-change materialization;
- `Replace Existing Tasks` execution semantics;
- reminder firing.

## Continuation

The broad Milestone 2 task metadata persistence item is now complete when combined with the previously merged task lifecycle and task metadata slices. Continue with **subtasks with ordering/completion state** before rich notes and preferences.
