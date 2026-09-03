# Milestone 2 task metadata persistence — 2026-09-03

- **Agent/tool:** ChatGPT / GitHub connector
- **Milestone:** 2 — domain model, identity invariants, local persistence
- **Slice:** Time Taken + typed schedule metadata persistence semantics

## Source result

PR #13 / squash merge `0595025fcea529a7723468c0a6b530e9ebbb4092` added the M2 task metadata mutation layer without changing the SQLite schema.

Material contracts:

- `TaskSchedule` uses explicit `none`, `date_only`, and `local_datetime` forms aligned with durable storage tokens.
- Date-only schedules persist only a canonical local date.
- Local-date-time schedules persist canonical local date/time plus a non-empty timezone identifier.
- Schedule mutation is transactional and rejects archived task/list contexts and completed tasks.
- Time Taken is not stored as an independent mutable total. Effective Time Taken is persisted work-session duration plus `manual_time_adjustment_seconds`.
- Setting a desired Time Taken computes the required signed manual adjustment without rewriting session history.
- Historical Time Taken correction is allowed for completed tasks; archived tasks/lists remain immutable.
- Disk reopen coverage proves schedule state and manual adjustment survive restart.

## Validation

Initial Windows CI #89 / run `33763634427` failed only at `cargo fmt --check`; compile/Clippy/tests were not reached.

A temporary branch-only rustfmt workflow applied the repository stable formatter and was removed before authoritative validation. It did not enter `main` because PR #13 was squash merged.

Final exact-head `2cd35bda25df8f2e8a1cd69e44c14427b77f3948` passed Windows CI #92 / run `33763969680`:

- repository preflight: PASS;
- Rust formatting/check/Clippy/tests: PASS;
- Tauri release build: PASS;
- diagnostic artifact upload: PASS.

Artifact ID `9897160600`; digest `sha256:08477502ee766ed8e03599225da0ab5925bab7fb1659cd76b8bbe6b29c2cadfa`.

Local Rust checks were **NOT RUN** because the ChatGPT execution environment did not have the project Rust toolchain/checkout available for local execution.

## Boundary decisions

- Live task pause-gating for EST/Time Taken edits belongs to the Milestone 3 session engine, not the persistence primitive.
- Scheduling eligibility/classification belongs to Milestone 4.
- Recurrence generation/materialization, DST catch-up, Monday-of-due-week behavior and Replace Existing Tasks execution remain Milestone 4.
- The broad M2 metadata TODO remains open until recurrence metadata CRUD/persistence is implemented and validated.

## Continuation

Next implement typed recurrence metadata persistence CRUD/invariants against the existing `recurrence_rules` schema, with parent-task linkage and reopen regression coverage. Do not materialize recurrence occurrences in that slice.
