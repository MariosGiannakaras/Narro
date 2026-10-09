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
