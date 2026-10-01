# CI and validation strategy

Status: authoritative process policy.

## 1. Integration policy

Implementation branches are short-lived integration units, not long-lived milestone containers.

When a coherent implementation slice:
- has passed its exact-head automated validation;
- has no known unresolved automated/source failure;
- has a reviewable source/config/test diff;
- preserves repository invariants;

it should be expected-head guarded-merged to `main` even when a **purely observational physical Windows gate** remains open.

A physical/manual gate does not become PASS because code was merged. The milestone/TODO item stays OPEN until the required observation exists.

If the later physical run fails:
1. record the exact physical failure;
2. create one narrow corrective branch/PR from current `main`;
3. add the regression/implementation correction;
4. validate exact head;
5. merge the correction;
6. repeat only the affected physical portion unless evidence requires a broader rerun.

Do not keep an automated-green PR open for days while unrelated documentation/main truth advances around it. That creates avoidable merge/reconciliation debt and invalidates branch-local process truth.

## 2. Branch lifecycle

Prefer one coherent source slice per branch.

A branch should not accumulate multiple already-validated generations of the same implementation. After an automated-green slice is suitable for integration, merge it and continue from `main`.

Avoid:
- branches hundreds of commits ahead of `main`;
- branches tens of commits behind `main`;
- mixing product source, unrelated milestone work, CI redesign and tracking history into one unmerged PR;
- using the feature branch as the authoritative home of process/tracking Markdown.

If a branch becomes materially diverged, stop adding new scope. Either merge the validated slice or reconcile it before further implementation.

## 3. CI tiers

CI has two conceptual tiers.

### Fast gate

Runs first and should catch cheap deterministic failures before Windows release work:
- repository/config/static contracts;
- frontend type/build checks;
- Rust formatting;
- other platform-independent deterministic checks.

Fast failures should complete quickly and must block the expensive candidate gate.

### Windows candidate gate

Runs only after the fast gate passes and is authoritative for Windows-sensitive validation:
- locked Rust check/clippy/tests;
- Windows visual fixtures;
- Tauri release build;
- packaged runtime capture where required;
- physical-validation artifact build/smoke where required;
- required artifact uploads.

Do not discover rustfmt/static-contract failures after spending time on release/artifact work when they can be caught in the fast gate.

## 4. Static-contract testing rule

Static source-text tests are appropriate only for durable architecture/build invariants that cannot be expressed more directly, for example:
- no production `floatingTimer` window;
- no `timer.html` runtime entry;
- physical artifact does not activate `runtimeVisual`;
- required workflow ordering/artifact boundary.

Do not use exact source-string assertions as the primary proof of ordinary behavior when the invariant can be tested through:
- a pure function/state-machine test;
- typed API/unit test;
- DOM/runtime integration test;
- narrow native harness.

When touching an existing brittle source-text test, prefer migrating it toward the semantic boundary rather than adding more implementation-string coupling.

## 5. Physical validation

Physical Windows validation is one consolidated evidence session whenever practical.

Before requesting a manual run:
- exact source/artifact identity must be recorded;
- automated candidate gate must pass;
- the physical executable must be production-config and artifact-smoke validated;
- known invalid/old test profile contamination must be excluded.

The recording/checklist should cover all currently open physical observations that share the same executable. A failure reopens only the affected gate/surface unless evidence shows wider impact.

Physical evidence is observational acceptance, not a reason to keep an otherwise automated-green implementation branch permanently unmerged.

## 6. Milestone completion

Merge state and milestone completion are distinct.

A milestone may have implementation already integrated in `main` while one or more physical/manual acceptance gates remain OPEN.

A milestone is complete only when its own required implementation, automated validation, physical/manual observations and tracking reconciliation are all satisfied.

## 7. Main validation

After expected-head guarded merge:
- if the resulting `main` source/build/test tree is byte-identical to the exact validated PR head and the workflow itself did not change, duplicate full validation may be deduplicated/cancelled with recorded proof;
- if workflow/build/config/Cargo inputs changed, or the resulting tree differs materially, run/require the appropriate resulting-main validation.

The goal is evidence completeness, not mechanically repeating identical expensive work.
