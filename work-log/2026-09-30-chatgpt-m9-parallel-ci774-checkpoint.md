# M9 parallel checkpoint — #198 artifact review, #199 merge, #202 retry

Date: 2026-09-30

## Scope

Durable checkpoint for the user-authorized parallel M9 lanes while the M7 physical Windows gate remains unavailable. No roadmap checkbox is closed by this checkpoint.

## PR #199 — Overview aggregation

- exact validated head: `3deec9c056e8ea449d96a9c2b9ac8572d7fabf9d`
- Windows CI #770 / run `36756491555`: **PASS**
- runtime artifact: id `11117162224`, digest `sha256:81d64afba163055cddbfcead54ad9c1d8daa69e2d5729b79f3d48a0e41ce7d26`
- visual artifact: id `11116946922`, digest `sha256:69b2fc2d7d727d525c318819ed281fccc5f217d388244f28c8d4be9bec8613ec`
- expected-head guarded squash merge: `f165390da50879bb7ed9740da9033cce60132d6a`

The resulting-main Windows CI gate is still **PENDING / NOT VALIDATED** at this checkpoint. The merge therefore does not yet count as a completed M9 validation checkpoint and no TODO counter advances.

## PR #198 — Reports Overview visual artifact review

Exact head `5d037bca0cb3ee109e618b902edaa246362819f7` passed Windows CI #768 / run `36756417062`.

Artifacts:
- visual regression: id `11116733937`, digest `sha256:95c62588f6807cd8bcc181d2bf28be0d1cea855cc69bb4bf467e377cf605b5dd`
- runtime harness: id `11116982150`, digest `sha256:62446c9dacd5ade6781b7c19a71a9880dcdf41842f2c9944a852f5ef08342fae`

All eight Reports PNGs and their captured DOM files were inspected. Overview, list-filter and date-picker light/dark captures visibly contained the intended states and their DOM carried the explicit Reports ready marker.

The two `reports-lower-*.png` captures did **not** visibly contain the lower `Time By List` and `Done Tasks` panels even though the captured DOM proved those panels were mounted. This was treated as a real visual-coverage defect, so #198 was not merged.

Narrow corrective commits on the existing branch:
- `76617e913cbd1c5e7534b1ab1a51a0dd5b5ec11e`: scroll the lower fixture to the actual `.reports-overview__lower-grid` and publish readiness only when that whole region is inside the viewport.
- final head `7d3ab9369043424a0c35fb441a46e462c17330d8`: require `data-reports-lower-viewport-ready="true"` in captured DOM validation.

Exact-head Windows CI #774 / run `36759587923` is **IN PROGRESS**. A fresh visual artifact review is required even if CI passes.

## PR #202 — report history/session mutation command boundary

Exact head remains `5c4ad3c1c44b5155a82b51480c8d0c7d3de5171f`.

Windows CI #769 / run `36756461300` initially failed before reaching report-specific validation because the pre-existing `task-scheduling-dark` fixture did not expose its strict ready marker after four captures. Repository preflight passed. This matched the known hosted-Edge readiness failure class rather than an evidence-backed #202 source defect.

Failed jobs were rerun without source changes. The rerun is **IN PROGRESS** at this checkpoint.

## PR #203 — Sessions dashboard projection

- exact head: `59b7b2713505bdea7cf2521eaebd5f2bf164fb17`
- Windows CI #771 / run `36756524757`: **PASS**
- remains unmerged pending serialized main validation of the already-merged #199 source checkpoint.

## Progress

User-facing counters remain unchanged:

`4/10M || 2/5 | 11/19`

No pending CI or merge is counted as completed validation.

## Exact next action

1. Inspect the resulting-main Windows CI for merge `f165390d...`; record PASS/failure evidence before treating #199 as validated.
2. Inspect #774 on #198 final head `7d3ab936...`. On PASS, download the new visual artifact and verify that both lower light/dark PNGs visibly contain `Time By List` and `Done Tasks`, while rechecking the other Reports states.
3. Inspect the #769 rerun on #202. Fix source only if the rerun exposes an evidence-backed #202 defect.
4. After #199 resulting-main validation is complete, guarded-merge #203 at exact head `59b7b271...` and validate resulting main before Sessions UI work.
5. Keep M7 PR #192 unmerged until physical Gate 7 / Gate 12 access returns.
