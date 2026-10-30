# CI and validation strategy

Status: authoritative process policy.

## 1. Integration policy

Implementation branches are short-lived integration units, not long-lived milestone containers.

When a coherent implementation slice:
- has passed its exact-head automated validation;
- has no known unresolved automated/source failure;
- has a reviewable source/config/test diff;
- preserves repository invariants;

it should **normally** be expected-head guarded-merged to `main` even when a **purely observational physical Windows gate** remains open. This rule does not override a **specific, reasoned `PHYSICAL_BEFORE_MERGE` hold** in the current HANDOFF/PR for known demonstrated native regressions whose substantial replacement has not yet been physically checked. Such a hold must identify the failed source/build and scenario, exact current candidate, concrete acceptance/exit criterion, and reassessment owner; it is retired once its evidence is obtained or a fresh documented analysis proves the block unnecessary. Never invent an exception for ordinary independent green PRs.

A physical/manual gate does not become PASS because code was merged. The milestone/TODO item stays OPEN until the required observation exists.

If the later physical run fails:
1. record the exact physical failure;
2. create one narrow corrective branch/PR from current `main`;
3. add the regression/implementation correction;
4. validate exact head;
5. merge the correction;
6. repeat only the affected physical portion unless evidence requires a broader rerun.

Do not keep ordinary automated-green PRs open just because an unrelated milestone physical checklist is not finished. For a documented exceptional `PHYSICAL_BEFORE_MERGE` native-risk hold, branch age alone is **not** evidence for lifting the hold; schedule specific physical acceptance, keep source ownership and head identity clear, and avoid adding unrelated branch scope. PR389 qualifies due to its previously verified 4/8 native compositor failure and untested replacement; dependent PR419 retains a **separate** strict 8/8 A/B comparator hold. Neither hold ends from successful CI or another branch's executable. Require each exact candidate's stipulated physical acceptance or a freshly documented risk decision before guarded integration; the normal automated-green merge policy still applies to unrelated PRs.

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

### Candidate pre-push dependency closure

Use the current `git diff main...HEAD` as an impact set, not the agent's remembered files. A reusable `scripts/preflight-impact.mjs` helper can identify direct/transitive Node regression consumers through actual source references, but misses dynamic runtime imports, native behavior, and CSS selectors encoded indirectly: always review unmapped entries manually. Execute affected tests and the **full frontend preflight locally** before spending another CI run when checkout/dependencies allow it. If they do not, mark local preflight NOT RUN and use CI to obtain evidence rather than representing static reading as execution.

Three PR390 lessons are distinct: (1) updated 32px Focus CSS left a stale exact-substring test (cheap deterministic miss); (2) a real Windows CDP navigation transient had no absent-root guard (readiness/lifecycle miss); (3) a replaced navigation call left an unrelated Notes source contract stale (transitive consumer miss). The repaired contracts must test their behavioral/semantic owner and fail closed, not silently match an obsolete method. Preserve negative test cases for wrong/empty document/navigation, and keep validated earlier SHA outcomes separate from later failed or pending heads.

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

For native keyboard acceptance, verify the actual foreground/focus owner, expected modifier-key state and target state before input, then a positive visible postcondition. For plain Escape/Tab, unexpected Alt/Ctrl/Shift/Win means abort and recover input context first; do not send a different Windows shortcut and call the result a product failure. UIA visibility alone does not prove that a pointer target is unobscured; verify input actually reached the intended window. An absent filtered UIA node or a successful input API call does not prove modal closure or persistence. An unproven/undelivered interaction is UNCERTAIN, not a product failure to patch. Resolve that input context with a bounded observation on the same validated artifact before opening another source/CI cycle. Keep one current handoff/evidence matrix and update it at meaningful phase boundaries; archive obsolete checkpoint prose rather than accumulating conflicting current NEXT operations.

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

## 9. M10 release-candidate evidence reconciliation (no indiscriminate reruns)

M10 starts **only after** the hard M1–M9 entry gate in `AGENT_WORKFLOW.md` / `TODO.md` has been proven closed. It consolidates existing acceptance evidence instead of replaying successful tests by default.

For **each** M10 TODO criterion, maintain a claim-level release-candidate matrix with: criterion/claim; existing M1–M9 evidence reference and PASS scope; exact source SHA, executable/artifact identity and environment; relevant code/dependency/config changes since that evidence; disposition (`REUSED_VALID`, `NEW_CHECK_REQUIRED`, `LIMITATION_ACCEPTED`, or `OPEN`); and any new check/result. Reuse prior PASS only when its scope genuinely covers the claim and later changes have not invalidated it. Prior screenshots, native observations or CI PASS from a different build do not automatically prove final-installer, migration/upgrade, actual sign-in/autostart or changed cross-feature integration behavior. A check shown to be unchanged does not need repeating just to create fresh M10 evidence.

Execute the **smallest missing/invalidated** targeted checks and genuinely release-candidate-specific end-to-end/packaging/install checks; maintain required aggregate preflight, exact-head Windows CI and narrowly justified integrated smoke. Where a shared implementation was replaced, trace actual dependency impact and rerun the affected acceptance claims only, not the entire old milestone. Do not silently downgrade a required physical/source-parity or security gate to a paper review. Count an M10 checklist item complete only after its full evidence matrix supports its acceptance, with `REUSED_VALID` distinguished from newly executed PASS and accepted limitations explicitly scoped.

### M10 full acceptance reuse and targeted validation budget (binding; 2026-10-26)

M10 remains inactive until **both** the M1–M9 technical/physical gate and the user's separate personal-review/explicit-approval hold in `TODO.md` close. This section specifies future execution only, **not** permission to begin it.

1. Collect **all** accepted M1–M9 scenario/claim records, not merely those relevant to a newly changed file. For each record preserve source/EXE hash and CI/artifact identity, original real-Windows environment (monitor/config, scaling and locale when relevant), precise procedure, expected/observed result, evidence and affected state owner/dependencies. Include user physical PASS and previously approved UI/source comparisons.
2. Construct an explicit dependency-invalidation decision for the intended final candidate: `REUSED_VALID`, `NEW_CHECK_REQUIRED`, `LIMITATION_ACCEPTED`, `OPEN`. Record the changed path/build input or missing requirement and causal reason for **every** `NEW_CHECK_REQUIRED`, not merely a newer SHA. Evidence from a different binary may establish unchanged relevant behavior when code and build dependencies are proven equivalent for the claim; it cannot validate inherently new installer/migration/sign-in behavior or an affected foundation.
3. Run each check at most once per still-valid claim/candidate unless a new failure/invalidation appears. A second human HDMI hotplug run accepted during M1–M9, for example, **remains accepted in M10** without a third unplug/replug when monitoring, window lifetime and relevant build behavior are materially unchanged. If there is specific contrary evidence, rerun **only** the invalidated portion and record that rationale. Do not turn the release-candidate whole-app visual audit into another comprehensive replay of all earlier physical tests.
4. Preserve full required exact-head and resulting-main CI gates, release packaging/security checks, and truly new interactions that cannot be established from combined prior evidence. Summarize counts separately as `REUSED_VALID`, `NEWLY_PASSED`, `OPEN`, `FAILED`, `ACCEPTED_LIMITATION`; do not equate saved testing time with lower confidence.

### M10 final-source code/history causal and test-blind-spot audit (binding; 2026-10-26)

This is a **new evidence type**, not a request to replay all prior test scripts or a second pass through every Git commit. Review the **entire final application** at the architecture/subsystem/invariant level and drill into high-consequence code paths, historical near misses and unexplained failure signals with strongest evidence. Use the existing `docs/NARRO_ENGINEERING_RISK_REGISTER.md`, `docs/BLITZIT_HISTORY_RISK_INDEX.md`, `ENGINEERING_QUALITY.md`, scoped commit/PR diffs and work logs, CI failures, native logs, SQLite evidence and the source ownership graph. Reuse already accepted root-cause analyses and verified test coverage; do not rediscover closed issues without conflicting/new evidence.

For each material candidate risk, log: **subsystem/invariant → real state and error-path owner → relevant current code and historical evidence → plausible failure sequence → why the earlier PASS/tests would not expose it → severity and reproducibility/confidence → minimally sufficient deterministic evidence/guard → result and residual risk**. Distinguish (a) demonstrated bug, (b) credible mechanism not yet reproduced, (c) historical unexplained event, (d) covered invariant, and (e) accepted bounded limitation. Never infer that a historical poisoned mutex was cured simply because subsequent tests passed; separate missing original panic traceback, present-day prevention guarantees and any remaining unproven root cause.

Test credible gaps with targeted unit/integration/fault-injection or isolated Windows probes, as appropriate: lock/panic/unwind ordering, SQLite transaction and restart integrity, after-commit event publication and partial failure, concurrent IPC and duplicate commands, cancel/retry/reentrancy, stale UI projections, monitor/window reconnection, timer ledger reconciliation, migration rollback and security exposure. Check raw persisted invariants (e.g. SQLite `quick_check`, logically relevant queries) only in disposable test profiles, with privacy-safe redacted logs. **No changes to user AppData, physical OS configuration or real personal data** under this audit. Use narrow validation first; escalate only when a proof obligation requires it.

Findings must link to exact SHA and proof or `NOT RUN/UNKNOWN`; confirmed high-impact defects get focused fixes/guards and only invalidated dependent tests/physical acceptance rerun. Credible unresolved release-threatening risks require an explicit blocker or documented user risk disposition. No pseudo-PASS from static inspection, compile success, flaky green retries or absent logs. The audit record becomes an input to the required Final Comprehensive Review, which should not rerun resolved M10 forensic work absent new evidence.

## 10. Recurrent failure detection and prevention

The independent `CI Failure Learning` GitHub Actions workflow runs daily (and on manual dispatch), outside the Windows release/packaging path. It scans a **bounded rolling 14-day window** of completed `ci.yml` runs; reads failed-job logs where retrievable; identifies candidate failure signatures by failed job + **first failed step** + structured Rust-test/compiler/OS diagnostic or named Reports visual-fixture assertion (fixture slug plus hashed assertion invariant; no raw assertion text); and groups only **distinct workflow run IDs**. Multiple attempts of a single run do not establish recurrence. A successful rerun is inspected for earlier failed attempts where available but is never automatically labeled flaky.

When a signature appears in at least two independent runs, a deduplicated GitHub issue is created for agent review; existing issue identity is preserved. This is an operational prompt to examine actual logs, not a verdict on shared cause, severity, app regression or CI acceptability. Reviewers must classify primary versus downstream error, application versus harness versus infrastructure, determine root cause and recurrence risk, and implement a narrow guard backed by tests/evidence. Reuse the matching `NER-*` entry and immutable `work-log/` record, updating the register only for reusable prevention.

Named Reports visual-fixture assertions are detected because repeated independent Windows runs `37921875076` and `37927679782` both failed on `reports-sessions-detail-keyboard-light` / `Detail Shift+Tab escaped the active modal`. The scanner extension belongs to pre-existing infrastructure PR #291 (Reports fixture assertions/readiness and rustfmt diagnostics); duplicate PR #292 was closed without merge. This is not a product fix or proof of a common causal defect. False matches across the same assertion wording remain possible; review source/fixture evidence before taking action.

**Limitations:** paged metadata for at most 800 failed-conclusion runs and 2,000 completed runs within 14 days; a deterministic spread sample of at most 60 relevant failure/retry runs (retaining the newest 20), three attempts per sampled run, 75 failed-job logs (6 MB each), five automatic issue creations per execution, and five pages of existing-issue identity checks. Missing logs, generic exit codes, a limit hit or API failure are **not** evidence of no recurrence. The job's step summary reports metadata counts, sampled runs, coverage limits and unclassified counts. The scanner is explicitly **sampled, not exhaustive** when run volume exceeds these caps. It never reruns CI, edits product source, marks a PR green, silently closes issues, or increments milestone/implementation counters.

Classification is a conservative fingerprint, **not** verified same-root-cause equivalence: distinct defects can share an OS error code or test identity. Agents must review evidence before assigning cause. Do not repeat broad CI merely to feed this process; follow the claim/invalidation protocol above.
