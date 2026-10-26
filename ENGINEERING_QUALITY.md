# Narro engineering quality standard

This file defines the default implementation quality bar for all Narro coding agents. It supplements `AGENTS.md` and applies to every milestone.

## Core standard

Prefer correctness, explicit invariants and predictable failure behavior over expedient code that merely passes the happy path.

Every implementation slice should consider:

- input validation before side effects;
- state validation before transitions;
- checked arithmetic for bounded counters/durations/positions where overflow is possible;
- explicit handling of missing resources and invalid lifecycle states;
- clear recoverable vs fatal failure paths;
- deterministic behavior under repeated commands;
- stale/concurrent UI state;
- restart and partial-side-effect scenarios;
- OS/API failures at native boundaries;
- performance costs in long-lived/background code.

## Product decision quality and alternative impact gate

Apply the binding **critical product partnership** rule in [`AGENTS.md`](AGENTS.md) to meaningful design and behavior decisions, not just to code correctness. Treat a user's suggested mechanism as a proposed solution to an authoritative user goal, **not as untested evidence that the mechanism is correct**.

Before making a material user-facing/stateful change, determine: **(a)** the outcome actually wanted, **(b)** the current state owner and invariants, **(c)** at least one credible failure mode or cross-surface consequence, and **(d)** whether another approach or an optional setting would better satisfy the goal. Explicitly examine the relevant lifecycle boundary (for example, **same window/session vs real app Quit/restart**), persistence and legacy-data implications, Windows display/motion behavior, accessibility, source fidelity and regression scope where applicable. Document meaningful trade-offs and the recommended default concisely; suggest alternatives proactively **only when they add genuine decision value**.

If the user suggestion conflicts with proven behavior, evidence, accepted invariants or safety, explain the conflict respectfully and offer the smallest sound alternative. If the optimal change is obvious and safe, implement directly; do not create speculative feature branches, mandatory deliberation forms, additional roadmap gates or unnecessary confirmation loops. Preserve user-approved scope and any required explicit approval for materially different product behavior.

## Learning from prior Narro corrections

`docs/NARRO_ENGINEERING_RISK_REGISTER.md` is the reusable failure-family index mined from Narro's own implementation, validation and process corrections. It complements `docs/BLITZIT_HISTORY_RISK_INDEX.md`: the Blitzit index records source-product reliability hazards; the Narro register records ways **our implementation process or architecture has already failed or nearly failed** and the prevention guards learned from them.

This is deliberately **not** another backlog, milestone ledger, acceptance gate, CI stage or source of current project status. `TODO.md` / `HANDOFF.md` still choose work, the evidence/crosswalk documents still define parity truth, and `docs/CI_VALIDATION_STRATEGY.md` still defines validation obligations.

Before a non-trivial source/config/test change:

- classify the affected surfaces and state/native/persistence/tooling authorities;
- consult only the matching risk-register tags/families rather than rereading the whole history;
- carry any applicable prevention invariant and guard into the implementation/test plan;
- do not rerun unrelated historical checks merely because a risk entry exists.

After a material implementation, validation or process failure/correction:

- preserve the incident in the immutable work log;
- map it to an existing risk family and strengthen that family's evidence/guard, or add a new family only when the lesson is reusable beyond the one incident;
- record the causal boundary, why the previous checks missed it, and the regression/preflight/physical guard added, or explicitly state why automation is not meaningful;
- avoid turning trivial one-off mistakes into permanent process overhead.

A risk-register control state describes prevention maturity only. It never converts an open TODO, physical Windows gate or source-parity gate to PASS.


### Pre-push impact and regression ownership gate (NER-003 / NER-004)

Before publishing a frontend/native/test-harness candidate that can trigger Windows CI:

1. Compare the actual branch diff against the **latest main**, including modified tests, fixtures, styling and scripts (not only production TSX/Rust). Find all directly and transitively affected consumers; e.g. CSS selector → old source-contract test, CDP navigation driver → Notes bootstrap contract, source SVG → Task Card visual fixtures. Use `node scripts/preflight-impact.mjs --base main` once available in the relevant branch to list candidate tests; review any **unmapped** files manually. This scanner is an *aid*, not a proof that all dependencies are captured.
2. Execute the identified cheapest tests, including negative/error lifecycle cases, **then** the mandatory `npm run preflight:frontend` locally or in an equivalent checked-out validation environment. For Rust/Windows source also run the relevant Rust checks. A source-only mock/inline V8 check is a valid narrow result but **not** a substitute for the full test command. If an authenticated checkout/dependencies/Edge cannot run locally, explicitly record `NOT RUN` and use the existing CI fast/Windows stages to discover the gap; never claim pre-push PASS.
3. For changed browser navigation/capture code, verify three separate events: DOM/document exists, **real fixture completion contract** is satisfied, and real user input/escape/focus was delivered. Fail closed on absent `documentElement`, browser/network errors, unexpected URL, wrong target, missing modules and timeout. Do not replace semantic readiness with a fixed sleep or merely successful `Page.navigate`.
4. Fix or migrate implementation-text contracts when their producer changes; preserve the underlying behavior/error expectation instead of deleting the assertion. Search the whole test directory for old method names, CSS declarations and fixture identifiers.
5. Batch all dependency-safe corrected implementation and regression files *before the next push/CI*, while keeping only one in-flight PR-head CI generation. Record the exact SHA and the tests actually run or unavailable, so later candidate results cannot be misattributed.

Do **not** modify the Windows workflow or add new expensive gates merely to compensate for pre-push omissions. Existing `validation → fast → windows-candidate` ordering is correct. A prior green SHA does not validate later source/test edits.

### Pre-CI impacted-contract admission (2026-10-21)

For a frontend, fixture, or CDP/harness change, **before pushing the candidate that triggers expensive Windows CI**:

1. Construct a changed-file-to-consumer map: production imports/call sites, shared CSS selectors, visual fixtures, scripts that read the changed source as text, and every preflight/test referencing renamed commands or selectors. Search for both the old and replacement symbol. Include downstream tests outside the directly edited module.
2. Consult matching NER-003 (cheap failures) and NER-004 (readiness/transport) examples. Run the narrow tests first, then the strongest locally available aggregate frontend preflight; if a checked-out environment is unavailable, record `NOT RUN` and do not misrepresent isolated source-text/V8 assertions as a full preflight.
3. For browser/CDP navigation, test the observable document/DOM-ready acknowledgment, retries and failure path with a deterministic delayed/missing-acknowledgment harness. Do not rely on fixed sleeps or brittle assertions that a helper must call a command inline.
4. For CSS geometry, verify border-box, padding, SVG size, shared selectors and fixture consumers together. Update contract tests to assert behavioral/layout invariants, not an obsolete literal string.
5. Keep one reviewable batch per expensive CI candidate. On FAIL inspect the first causally failing job/step and log, repair the same PR with a targeted regression, then revalidate the replacement SHA. Do not restart a run on an unchanged known-failing SHA.

This is an **admission checklist, not an extra CI gate**. The Windows candidate remains mandatory and physical pixel/motion acceptance remains separate. Record any unexecutable local checks explicitly before CI.

### CI failure-learning obligation

The lightweight CI recurrence scanner (see `.github/workflows/ci-learning.yml` and `scripts/ci-learning.mjs`) reports **candidate patterns**, not proven causal equivalence. A repeated job/step or a green rerun alone must not be called the same defect or “flaky”.

After a material failure or a recurrence-triage issue, the responsible agent must:
1. read the exact failed run, attempt, **first causally failed step** and relevant log, checking whether later failures are only downstream artifact/cancellation effects;
2. determine whether the root cause is product code, regression/test harness, tooling/infrastructure, or genuinely unknown; do not assume test flakiness solely from same-SHA rerun success;
3. compare independent run IDs, not multiple attempts of one run; consult matching existing NER families, work logs, and guards before patching;
4. add a targeted prevention guard where evidence justifies it, validate the narrow affected path before expensive Windows CI, and record the exact run/attempt/SHA and PASS/FAIL/NOT RUN evidence in an immutable work log;
5. strengthen an **existing** NER entry when a reusable causal lesson is learned; add a family only for a materially different prevention invariant, not for each CI incident.

Unclassified or missing-log failures remain **UNKNOWN** and require investigation; automatic grouping must not silently upgrade them into confirmed root-cause reports. Do not block unrelated application PRs or create an extra Windows gate just to run the scanner. Its Linux-only job has no authority over Windows candidate or physical acceptance.

## Error model

Use stable typed internal errors rather than ad-hoc strings.

For frontend-facing commands:

- expose a stable machine-readable error code plus a human-readable message;
- do not leak raw implementation/debug strings as the only contract;
- do not silently convert failures to success;
- do not panic for recoverable command errors;
- do not use production `unwrap()` / `expect()` where an error can be propagated or handled;
- tests may use `expect()` when failure should abort that test with useful context.

Fatal startup failures are different from recoverable command failures. If Narro cannot establish an essential local invariant, fail startup clearly rather than continuing in a half-initialized state. Examples include an unusable required database or inability to establish a required background escape/quit capability.

## State mutation semantics

Authoritative state mutations must be atomic from the domain perspective.

- Validate/check all fallible arithmetic and preconditions before modifying multiple fields.
- Keep lock scopes minimal.
- Never hold an authoritative-state lock while sending IPC/events or doing slow OS/storage work.
- Treat a poisoned lock as an explicit error rather than panicking the process.
- Repeated or concurrent commands must be idempotent where appropriate or return a clear conflict/state error.
- State snapshots/events that can race must carry ordering/version information so a stale renderer response cannot overwrite newer state.

A successful authoritative mutation must not be reported to the caller as failed merely because a secondary broadcast/notification failed after the mutation committed. That pattern can cause unsafe retries and duplicate mutations. Log/report the secondary delivery failure separately and return the committed authoritative result.

## Native/window operations

Window/native APIs are external boundaries and may fail.

- Validate target window/resource existence explicitly.
- Use centralized helpers for repeated window operations/error mapping.
- Name commands according to their real semantics (`close` vs forced `destroy`).
- Keep documented Windows/WebView2 threading constraints intact.
- Do not claim multi-step native changes are transactional when the OS API is not transactional; expose the exact operation that failed.
- Keep a recoverable user path when background runtime can outlive visible windows.

## Edge cases and tests

For every non-trivial behavior, consider at least:

- missing/closed resource;
- duplicate/repeated invocation;
- empty values and boundary values;
- overflow/underflow;
- stale UI snapshot/event ordering;
- restart/recovery;
- partial native/storage failure;
- concurrent/re-entrant action where relevant.

Prefer deterministic unit tests for pure/domain behavior and narrow integration/manual tests for native behavior. Add regression coverage when a real user test discovers a failure.

## Maintainability and performance

- Centralize invariants and shared boundary handling instead of duplicating stringly logic.
- Avoid unnecessary abstractions that do not protect a real invariant.
- Do not add polling/continuous work when event-driven behavior is sufficient.
- Keep the `focusSurface` dependency/runtime footprint minimal.
- Measure performance-sensitive Windows behavior instead of assuming it is cheap.

## Required pre-CI discipline

Before a source/config push that will trigger Windows CI, run the strongest meaningful local preflight the current environment permits.

Apply the claim/invalidation decision protocol in `docs/CI_VALIDATION_STRATEGY.md` before choosing validation. Run the narrowest affected deterministic check first for failure isolation, then the required aggregate preflight/exact-head CI for the coherent source candidate. Do not trigger a fresh build merely because a later manual or review session begins: if the exact validated artifact still represents the claim under test, reuse it and keep its identity explicit. Conversely, a relevant source/config/build change invalidates the affected candidate evidence and must be revalidated.

Canonical commands:

- `npm run check:config` — dependency-light repository/config invariants;
- `npm run build` — strict TypeScript + frontend production build;
- `npm run check:rust:fmt` — Rust formatting gate;
- `npm run check:rust` — locked Rust compile check;
- `npm run check:rust:clippy` — all-target Clippy with warnings denied;
- `npm run test:rust` — locked Rust tests;
- `npm run preflight` — aggregate preflight when Node dependencies and Rust toolchain are available.

If the current environment lacks dependencies/toolchains/network, run the subset that is genuinely available and record the unavailable checks as `NOT RUN`; never describe them as local PASS.

Prefer preparing/reviewing a coherent slice off `main`, then advancing `main` once so one source slice creates one Windows CI run. Avoid a series of intermediate pushes to `main` that each trigger expensive duplicate builds.

Before triggering that CI, batch additional active-milestone work when all of the following are true:
- each change is supported by existing evidence or an already-recorded requirement;
- each change can be implemented correctly without needing the pending CI/manual result of another change;
- the combined diff remains reviewable and preserves one coherent validation story;
- regression coverage for every included behavior is part of the same candidate.

Do **not** optimize for line count. Split the batch when changes are unrelated, speculative, cross milestone/architecture boundaries, materially increase blast radius, or when an earlier result is needed to know what the later code should be.

A physical Windows check may be deferred and consolidated with later compatible checks only when subsequent work is independent of its outcome. Keep the gate OPEN until real evidence exists; never convert deferred physical validation into automated PASS.

Documentation/process/tracking/evidence-only changes should be committed directly to `main` and should not consume Windows CI when they do not affect executable/build/test/CI behavior. Markdown is already path-ignored; non-Markdown evidence-only commits use `[skip ci]`. Workflow files, scripts/tests, manifests, runtime/build configuration and other tooling-consumed files are not documentation-only even if they contain no application feature code.

## CI contract

Use the tiering defined in `docs/CI_VALIDATION_STRATEGY.md`.

Cheap deterministic failures belong in a fast gate before expensive Windows release/artifact work. In particular, repository/static contracts, frontend build/type checks and Rust formatting should fail before a Windows candidate spends time on visual capture or Tauri packaging.

Static source-text assertions should protect durable architecture/build boundaries only. Prefer semantic unit/integration/runtime tests for ordinary behavior; when editing an existing brittle source-string test, migrate toward the semantic boundary rather than adding more implementation-string coupling.

Windows CI is the reproducible second gate, not a substitute for avoidable local checking.

CI should:

- install locked dependencies;
- run the same repository preflight contract;
- fail on formatting/lint/test/compiler warnings configured as errors;
- build the actual Tauri release artifact;
- fail if required artifact outputs are missing;
- use concurrency cancellation to avoid wasting time on superseded runs.

Interactive Windows observations (tray, taskbar, always-on-top, monitors, shortcuts, notifications, autostart, performance) remain separate manual evidence and must not be inferred from CI success.
