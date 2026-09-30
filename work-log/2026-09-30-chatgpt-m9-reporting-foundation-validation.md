# M9 reporting foundation — PR #197 / CI #746 / main CI #748

Date: 2026-09-30

## Scope

First Milestone 9 source slice: a read-only local reporting-history boundary over the existing authoritative SQLite task/session model. This slice intentionally does not ship a user-facing Reports screen and does not add report editing, exports, chart logic, or Focus/window behavior.

## Exact source and validation

- PR: #197 (`feat/m9-reporting-foundation`)
- exact validated PR head: `041bdda72ab513d571d940e71a1e18d4027d009b`
- Windows CI #746 / run `36739580536`: **PASS**
- expected-head guarded squash merge: `f7d6d995d2a402a04fa47b8fb781be8d1fbb6624`
- resulting-main Windows CI #748 / run `36741939684`: **PASS** on exact merge source SHA `f7d6d995...`

PR #746 passed Repository Preflight, frontend contracts/build, Rust fmt/check/clippy/tests, Windows visual regression, reused frontend-dist verification, Tauri release and required artifact uploads.

PR artifacts:
- `narro-m1-runtime-harness-windows-x64`: id `11109882625`, digest `sha256:dcc7f98b80353ac7ed409fe4731d6b761ef4be55098eeda93c6aed8aa63a47ae`
- `narro-m5-visual-regression`: id `11109393729`, digest `sha256:e7f4a1663244a8078422a1fef3a5741cccaedc2ba21d3739b618dcfb84e5e003`

Resulting-main #748 artifacts:
- `narro-m1-runtime-harness-windows-x64`: id `11111680536`, digest `sha256:e31aeb4525023ccea67d205d12642f326a94f1ecfbb18a33f4564cc49b49a206`
- `narro-m5-visual-regression`: id `11110314443`, digest `sha256:1bf15cdf6ba8f5005156a3d2f5a37dcedca9568c6e3e467563857dc20dbc282b`

## Validated behavior

The new `src-tauri/src/reporting.rs` read model provides:
- typed RFC3339 date-range boundaries;
- optional stable list filtering;
- closed work/break session rows only;
- completed-task history rows;
- EST projection;
- Time Taken derived from authoritative work sessions plus the existing manual adjustment;
- archived task/list history retained when rows still exist;
- permanently deleted task history excluded through the existing foreign-key/cascade deletion semantics.

The read model fails closed on malformed stored identities, tokens, timestamps and invalid numeric reporting values rather than silently fabricating history.

## Preserved invariants

- reporting is read-only in this slice;
- no timer/session mutation semantics changed;
- no new session authority was introduced;
- no Focus/window code changed;
- no SQLite schema or migration changed;
- no network/cloud/report telemetry path was added.

## Roadmap status

No top-level M9 TODO checkbox is closed solely by this backend foundation. User-facing Overview/Sessions integration, official metric aggregation, chart/date/filter UI, edits and exports still require their ordered slices and validation.

## Parallel visual slice

PR #198 (`feat/m9-reports-overview-visual`) is the separate frontend-only screenshot-backed Overview presentation slice. Its first CI #747 failed at TypeScript fixture compilation only; the tuple typing was corrected and the branch is being reconciled with current main before exact-head revalidation.

## Continuation

Continue PR #198 from its latest live exact head. Require exact-head Windows CI including the new Reports Edge fixtures. Inspect the actual visual artifact before accepting the visual foundation. Do not production-wire fixture data; production wiring should consume the validated reporting boundary and later authoritative metric aggregation.
