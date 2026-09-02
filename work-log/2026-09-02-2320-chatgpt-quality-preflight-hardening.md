# Engineering quality / pre-CI hardening — 2026-09-02

- **Agent/tool:** ChatGPT
- **Milestone:** 1 — foundation quality gate and runtime harness hardening

## Purpose

The user explicitly required production-grade correctness, robustness, maintainability and performance, with the strongest meaningful local checks run before each Windows CI invocation. This slice turns that instruction into durable repository policy and executable gates.

## Material implementation

- Added `ENGINEERING_QUALITY.md` as the mandatory quality/error/preflight contract.
- Added stable serializable Rust command errors instead of ad-hoc `Result<_, String>` at application command boundaries.
- Hardened authoritative `AppState` locking and mutation:
  - no recoverable production `Mutex::unwrap()` path;
  - explicit poisoned-lock error;
  - checked counter/revision arithmetic;
  - no partial mutation on overflow;
  - versioned state snapshots for stale-response protection.
- Frontend state application now ignores older revisions.
- Unknown/structured IPC failures are rendered through a common formatter.
- State mutation success is not falsely converted to command failure when a secondary event broadcast fails; this avoids unsafe duplicate retries after a committed mutation.
- Centralized native window lookup/operation failures.
- Startup persistence errors now carry operation context and fail clearly instead of using recoverable `expect()` paths.
- Added `scripts/verify-config.mjs` for dependency-light repository/config invariants.
- Added standard npm preflight scripts covering config, frontend build, rustfmt, `cargo check --locked`, Clippy with `-D warnings`, and `cargo test --locked`.
- Windows CI now uses the same aggregate preflight before release packaging, has a timeout/concurrency policy, uses npm cache, and fails when expected artifacts are missing.
- Markdown-only updates are excluded from Windows CI so coordination/log changes do not consume native build time.
- `AI_START_HERE.md` and `AGENT_WORKFLOW.md` now require `ENGINEERING_QUALITY.md` and pre-CI discipline for zero-context agents.

## Git / concurrent-change handling

The hardening branch was prepared away from `main`. While it was in progress, the user independently replaced `assets/branding/narro-logo-master.png` in commit `a374d73ff940920884d440474aba2a797d7fb46c`.

No force-push/rebase was used. The concurrent user change and the hardening branch were preserved with forward merge commit:

- `f0d061c1e060e60940b9f90395455d869d0194f8` — merge quality preflight hardening with the user's concurrent branding update.

Branding itself is not part of this engineering slice and the user later explicitly deferred logo/icon variants.

## Local preflight evidence

Environment observed in the ChatGPT container:

- Node: `v22.16.0`
- npm: `10.9.2`
- TypeScript: `5.8.3`
- Rust/Cargo/rustfmt: **NOT AVAILABLE**
- outbound DNS to GitHub/registries: **NOT AVAILABLE**

Checks actually performed locally before the first hardening CI push:

- JSON/config structural checks: **PASS**
- dependency-light repository invariant logic: **PASS**
- strict TypeScript check for the shared diagnostic error/revision boundary using local stubs: **PASS**
- edge execution for unknown/undefined error formatting and stale-state revision behavior: **PASS**
- full npm dependency install/build: **NOT RUN locally** because dependencies could not be fetched in this container
- Rust fmt/check/Clippy/tests: **NOT RUN locally** because no Rust toolchain exists in this container

Unavailable checks were never recorded as PASS.

## Windows CI evidence

### Run #48 — intentional gate caught a real issue

- Run ID: `33675735113`
- Head: `f0d061c1e060e60940b9f90395455d869d0194f8`
- Result: **FAIL**
- Frontend build/config checks: **PASS**
- Failure: `cargo fmt -- --check`
- Release build/artifact upload: correctly skipped after preflight failure.

The exact rustfmt diff was inspected; there was no blind retry.

### Rustfmt corrective slice

Formatting/test-clarity fixes were prepared on `ai/rustfmt-preflight-fix` and fast-forwarded to `main` using forward history. The resulting source head was:

- `cd49a3209646f851483e9b58d286bde081b80e2f`

Empty M1 module placeholders were given explicit module-boundary documentation rather than arbitrary whitespace.

### Run #49 — full quality gate and packaging

- Run ID: `33679224674`
- Head: `cd49a3209646f851483e9b58d286bde081b80e2f`
- Result: **SUCCESS**
- Repository preflight: **PASS**
  - config invariants
  - frontend production build
  - rustfmt check
  - `cargo check --locked`
  - Clippy all targets/features with warnings denied
  - `cargo test --locked`
- Tauri release build: **PASS**
- artifact upload: **PASS**
- Artifact: `narro-m1-runtime-harness-windows-x64`
- Artifact ID: `9865956078`
- Artifact size: `10,318,515` bytes
- Artifact digest: `sha256:efb18f390c40abd6e05a2ddd01b98830e3146b55b3fcd028153cac79762ec100`

## Durable decision

For future source/config slices:

1. inspect the actual candidate diff;
2. run the strongest meaningful local preflight available;
3. explicitly record unavailable checks as `NOT RUN`;
4. prepare/review coherent work away from `main` when practical;
5. advance `main` once per coherent source slice;
6. treat Windows CI as the reproducible second gate, not as a blind syntax/format probe;
7. inspect the exact failure log before corrective work;
8. never retry deterministic failures without a change that addresses the observed cause.

## Continuation

At the time this log was written, a separate M1 monitor-enumeration/Focus-Panel-positioning slice was being validated. Its CI/manual evidence belongs in a separate work-log entry and must not be inferred from this quality-gate record.
