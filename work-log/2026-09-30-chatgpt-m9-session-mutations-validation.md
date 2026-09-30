# M9 historical session mutation foundation — PR #200 / CI #756 / main CI #757

Date: 2026-09-30

## Scope

Persistence-only Milestone 9 foundation for Sessions history mutation. This slice does not ship the Sessions renderer, task-session detail modal, filters, export, or report command wiring.

## Exact source and validation

- PR: #200 (`feat/m9-session-mutations`)
- exact validated PR head: `f2972e50eaa7e3008390544466598455e2cd16bd`
- Windows CI #756 / run `36747066733`: **PASS**
- expected-head guarded squash merge: `10e5a97a703cff4d77141f548e66945cddda4956`
- resulting-main CI #757 / run `36750152569`: **PASS**
- #757 validation gate proved merged-main tree `7c5fe3cfc68f0af1c3cd0b112b571d004110603c` is identical to the exact PR #200 validated tree, so duplicate full Windows build was correctly skipped.

PR #756 passed Repository Preflight, frontend contracts/build, Rust fmt/check/clippy/tests, Windows visual regression, Tauri release and required artifact uploads.

PR artifacts:
- `narro-m1-runtime-harness-windows-x64`: id `11113411940`, digest `sha256:e4decb648c8bc9d1ac0712dde2678796149375568e5a16f48ec2c113485b6ccf`
- `narro-m5-visual-regression`: id `11113132388`, digest `sha256:b80c3d1db42bfe9bc9949bb3d362d4ded014d9fe433b57a0b4339dd132543b58`

## Validated behavior

The established persistence boundary supports:
- manual closed work-session creation for an existing task;
- stale-safe edit of closed session start/end/duration with stable session/task identity;
- edit provenance through existing `SessionSource::Edit`;
- stale-safe closed-session deletion;
- explicit rejection of report-history edit/delete against the authoritative open/live session;
- RFC3339/range/duration validation before writes;
- immediate SQLite transactions with expected-`updated_at` guards;
- historical manual rows on completed tasks;
- automatic reconciliation of existing ledger-derived Time Taken after session edit/delete, without a parallel report cache.

## Preserved invariants

- live/open timer session authority is unchanged;
- report-history mutations cannot edit/delete an unfinished session;
- no schema/migration changes;
- no Focus/window changes;
- no frontend or network changes;
- permanent task deletion continues to remove owned session history through existing cascade semantics.

## Roadmap status

No top-level M9 TODO checkbox closes from this persistence foundation alone. The user-facing item `Implement manual Add Session and inline session editing/task-session detail modal` still requires renderer commands/API, production UI, visual fixtures and exact-head validation.

## Continuation

After the current M9 aggregation/visual infrastructure lanes settle, build the Sessions command/API and UI on top of this validated persistence boundary. Do not introduce a second Time Taken authority or any mutation path for an open live session.
