# CI dedup regression guard reconciliation

Date: 2026-09-28  
Agent/tool: ChatGPT / GitHub connector  
Scope: recover the abandoned CI dedup regression assertion from `test/ci-dedup-metadata-regression`, validate it through the normal Windows pipeline, merge it safely, and reconcile branch cleanup state.

## Starting evidence

- current tracking main before the slice: `8d77d0a3327eddbb47afc2e79b82109f2d06433f`;
- current validated application source baseline: `e3a9abf8f769297d56295d7afe8a3f3aeb5d27ed`;
- no open PRs;
- old branch `test/ci-dedup-metadata-regression` contained one unique commit, `5e55c28ff70d3d8c7919eeffac33de8ebda1433a`;
- that commit changed only `scripts/verify-config.mjs`, adding a four-line invariant forbidding CI dependence on `run.pull_requests`;
- the underlying workflow defect had already been fixed in merged PR #154, but the regression assertion itself had never been merged.

## Implementation

Created branch `fix/ci-dedup-regression-guard` from main and added only the missing assertion to `scripts/verify-config.mjs`.

Candidate:
- commit `152dcee10594eaa8399a3c4e45a3c141b240ea37`;
- diff: +4/-0 in one file;
- resulting file blob: `be0a4ea1e77c8ae773af04b4ef63a7652961bc30`;
- that blob is exactly identical to the file blob on the abandoned regression branch, proving no semantic drift from the original intended guard.

## Validation

PR #186: `Test: guard CI dedup against unstable PR metadata`.

Exact-head Windows CI:
- run number: #626;
- run id: `36364443693`;
- conclusion: PASS;
- validation-gate: PASS;
- Repository Preflight: PASS;
- visual regression fixture capture/upload: PASS;
- reused frontend verification: PASS;
- Tauri Release: PASS;
- runtime artifact upload: PASS.

Artifacts:
- runtime `narro-m1-runtime-harness-windows-x64`: id `10947640192`, digest `sha256:8f62f5ff29c0f22486cfa67734b74ada654c0ec09c181e71b23187f2668b82dc`;
- visual `narro-m5-visual-regression`: id `10947535421`, digest `sha256:55101bd5eafbfffa751a59c480fc1c7857451ce41cdbce9dadaa161f042783a8`.

Expected-head guarded squash merge:
- merged SHA: `1a03c1129a7153ed00a42ce89e9d32bcd3912c13`.

Merged-tree identity:
- the merge changes only `scripts/verify-config.mjs` by +4/-0 relative to prior main;
- merged blob equals exact-head validated blob: `be0a4ea1e77c8ae773af04b4ef63a7652961bc30`.

The connector's commit-workflow wrapper exposes pull-request-triggered runs only, so no resulting-main push run could be enumerated through that wrapper. Exact-head Windows CI plus identical merged blob provides the available validation evidence for this repository-test-only change.

## Product impact

None.

This slice changes only repository/preflight validation. It does not change Narro runtime behavior, UI, persistence, timer logic, or application configuration. Therefore the validated application source baseline remains:
`e3a9abf8f769297d56295d7afe8a3f3aeb5d27ed`.

Roadmap and active milestone counters remain unchanged:
- roadmap: 6/10 milestones complete;
- M7: 9/14, physical/manual closure open;
- M8: 6/8.

## Branch cleanup result

After PR #186 merged, the only remote branches observed were:
- `main`;
- `test/ci-dedup-metadata-regression`.

Because the old branch's only useful unique change is now present and validated on main, `test/ci-dedup-metadata-regression` is safe to delete.

The connected GitHub toolset does not expose remote branch deletion, so that one deletion remains a manual administrative action.

## Continuation

No implementation work was unblocked or reordered by this slice. The current user-directed next gate remains the deferred M7 physical Windows acceptance batch before any further M8 source work.
