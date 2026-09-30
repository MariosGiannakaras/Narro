# Visual ready-marker harness hardening — PR #201 / CI #762 / main CI #765

Date: 2026-09-30

## Scope

Bounded reliability hardening for Windows Edge visual fixtures that expose an explicit ready marker. This slice was prompted by repeated false-negative failures where the existing task-scheduling fixture rendered a PNG but had not emitted its required ready marker within the previous two capture attempts.

## Exact source and validation

- PR: #201 (`ci/visual-ready-retry-hardening`)
- exact validated PR head: `61b4bf4b73a93b5166ce12255f86960ccb84bd5d`
- Windows CI #762 / run `36751993652`: **PASS**
- guarded squash merge: `ff4627e8013c4bc6b30a79589b49a30cc5b09d22`
- resulting-main Windows CI #765 / run `36755450984`: **PASS**
- #765 validation gate confirmed the merged tree had already been validated identically at the PR head, so the build/test job was skipped by repository policy.

PR #762 artifacts:
- `narro-m5-visual-regression`: id `11115641391`, digest `sha256:f4d5168eb6e87d86325c32cb8496261ab0237a66f8b1b52eab3c7fc6ca595940`
- `narro-m1-runtime-harness-windows-x64`: id `11115296976`, digest `sha256:46b61cd785092003c71541806d32af10d9e76b46957cf0ea499da55541a257ef`

## Validated behavior

The only executable/test change is in `scripts/capture-visual-fixtures.ps1`.

Fixtures that require an explicit ready marker still fail closed if the marker never appears. The harness now permits up to four bounded captures instead of two and adds a small retry-only backoff. Fixtures without a ready marker keep the original one-capture behavior.

This does not relax any captured-DOM assertion, screenshot dimension requirement, product UI contract, or source behavior. It only reduces hosted-Edge scheduling flakiness while preserving deterministic failure if readiness is never reached.

## Why this was required

PR #198 CI #752 failed twice before any Reports fixture capture because `task-scheduling-light` did not expose `data-task-schedule-fixture-ready="true"` within two Edge captures. A later unrelated PR successfully captured the same scheduling fixture, proving the failure was intermittent harness readiness rather than product source regression.

## Continuation

Active M9 visual branches should use the validated harness from merge `ff4627e8...`. PR #198 was reconciled to that source as head `5d037bca...` before its next exact-head CI. Other active M9 branches were likewise reconciled to the same validated main source before revalidation.
