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

When a merge is performed through an integration token that does not emit a new push-triggered Actions run, do not wait indefinitely for a run that cannot appear and do not create a meaningless source change just to trigger CI. Instead:
1. prove the resulting `main` executable/source tree against the exact validated PR tree;
2. if they are identical and no workflow/build semantics changed, record that proof as the main validation evidence;
3. if workflow/build semantics did change, validate those semantics in one short-lived PR based exactly on the merged `main` tree (or use `workflow_dispatch` when available), then merge that validated process slice;
4. record the tool/platform limitation in the handoff.

The goal is evidence completeness, not mechanically repeating identical expensive work.

## 8. Validation invalidation protocol

Validation is **claim-driven and invalidation-driven**. Before running a test, build, CI job or repeated manual check, identify the exact claim being proved and whether the current change made the existing evidence stale. Do not rerun expensive validation merely because a new review session started.

### Decision sequence

1. **Classify the changed surface.** Use the smallest applicable set: documentation/evidence/tracking; frontend/runtime; Rust/domain/storage; Windows/native/Tauri; build/config/workflow/test harness. A mixed change inherits the union of the relevant obligations.
2. **Derive the invalidation boundary.** Existing evidence becomes stale only for claims that depend on changed semantics, dependencies, build inputs or candidate identity. Unaffected evidence remains historical/current evidence as appropriate; do not erase or rerun it by habit.
3. **Start narrow.** Run the smallest deterministic regression/unit/integration check that can expose the affected failure first. This improves failure isolation and avoids discovering cheap defects after an expensive candidate build.
4. **Batch before the expensive gate.** When multiple evidence-backed fixes are dependency-safe and form one reviewable candidate, validate them together. Do not create a full Windows build/CI cycle for every micro-edit.
5. **Keep the mandatory candidate gate.** This protocol does **not** waive repository-required aggregate preflight or exact-head Windows CI for source/config/test candidates. It controls *when* those gates are necessary and prevents duplicate or unrelated reruns.
6. **Reuse exact artifacts for deferred observation.** Record the source SHA, CI run/artifact identity and the manual gates that artifact can satisfy. Starting or resuming a physical/manual check does not itself require a rebuild. Reuse the exact validated artifact while no relevant source/config/build change has made it unrepresentative for that claim.
7. **Rerun only invalidated downstream evidence after a failure/fix.** A manual or automated failure reopens the affected claim. After the narrow correction, repeat the checks/build/physical portion whose evidence the correction invalidated; do not mechanically replay unrelated PASS evidence.

### Practical matrix

| Situation | New executable build/Windows candidate required? |
| --- | --- |
| Analysis of code, screenshots, video or existing evidence only | No |
| Markdown documentation/tracking/process update only | No |
| Manual/physical check of an unchanged exact-head validated artifact | No; reuse that artifact |
| Source/config/test change in an executable candidate | Yes, once for the coherent candidate under the normal preflight + exact-head CI policy |
| Build/workflow/runtime configuration change | Yes; validate the affected pipeline/candidate semantics |
| Later documentation-only commit after a validated source candidate | No; it does not invalidate the executable candidate |
| Narrow corrective source change after a failed gate | Revalidate the affected source candidate and only the downstream evidence invalidated by that correction |

For physical acceptance, prefer the latest relevant integrated candidate when a later source change can affect the observed behavior. If a later change is genuinely unrelated to the claim, preserve the prior evidence rather than silently discarding it; document the reasoning when that distinction matters.

The governing question is: **what concrete claim is missing or stale, and what is the least expensive evidence that can validly prove it without weakening the repository's required candidate gates?**

## 9. Recurrent failure detection and prevention

The independent `CI Failure Learning` GitHub Actions workflow runs daily (and on manual dispatch), outside the Windows release/packaging path. It scans a **bounded rolling 14-day window** of completed `ci.yml` runs; reads failed-job logs where retrievable; identifies candidate failure signatures by failed job + **first failed step** + structured test/compiler/OS diagnostic; and groups only **distinct workflow run IDs**. Multiple attempts of a single run do not establish recurrence. A successful rerun is inspected for earlier failed attempts where available but is never automatically labeled flaky.

When a signature appears in at least two independent runs, a deduplicated GitHub issue is created for agent review; existing issue identity is preserved. This is an operational prompt to examine actual logs, not a verdict on shared cause, severity, app regression or CI acceptability. Reviewers must classify primary versus downstream error, application versus harness versus infrastructure, determine root cause and recurrence risk, and implement a narrow guard backed by tests/evidence. Reuse the matching `NER-*` entry and immutable `work-log/` record, updating the register only for reusable prevention.

**Limitations:** at most 100 recently completed workflow runs, 45 relevant runs, three attempts per run, 50 failed-job logs (6 MB each), five automatic issue creations per execution, and five pages of existing-issue identity checks. Missing logs, generic exit codes, a limit hit or API failure are **not** evidence of no recurrence. The job's step summary reports coverage and unclassified counts. It never reruns CI, edits product source, marks a PR green, silently closes issues, or increments milestone/implementation counters.

Classification is a conservative fingerprint, **not** verified same-root-cause equivalence: distinct defects can share an OS error code or test identity. Agents must review evidence before assigning cause. Do not repeat broad CI merely to feed this process; follow the claim/invalidation protocol above.
