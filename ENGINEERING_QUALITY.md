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

Documentation-only updates should not consume Windows CI unless they affect build/test behavior.

## CI contract

Windows CI is the reproducible second gate, not a substitute for avoidable local checking.

CI should:

- install locked dependencies;
- run the same repository preflight contract;
- fail on formatting/lint/test/compiler warnings configured as errors;
- build the actual Tauri release artifact;
- fail if required artifact outputs are missing;
- use concurrency cancellation to avoid wasting time on superseded runs.

Interactive Windows observations (tray, taskbar, always-on-top, monitors, shortcuts, notifications, autostart, performance) remain separate manual evidence and must not be inferred from CI success.
