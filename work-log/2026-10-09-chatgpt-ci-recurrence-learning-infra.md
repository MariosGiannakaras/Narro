# CI recurrence learning infrastructure — 2026-10-09

Scope: engineering prevention/CI feedback loop only. No Narro application behavior, styling, React, Rust, storage, or existing Windows CI workflow change. Concurrent application PRs and physical gates untouched.

## Evidence and motivation

- Existing `docs/NARRO_ENGINEERING_RISK_REGISTER.md` has 12 NER families; last substantive family reconciliation was 2026-10-06. The register is not self-updating.
- Concrete recent independent evidence: PR280 Windows candidate run `37902450730` failed at visual fixture capture (primary `Error: EPERM`, temporary-directory permission error); later artifact upload failure was downstream and is not itself proof of the primary cause. PR248 CI1046 prior Rust writer contention timeout and same-SHA rerun are already classified as NER-004 historical harness timing. These incidents are **not** asserted to have one shared root cause.
- Learning must distinguish failed jobs/first failed steps, semantically useful log signatures, exact run IDs and attempts; failures with missing/generic evidence must remain unknown.

## Work

1. Process-only Markdown committed directly on main: `ENGINEERING_QUALITY.md` (`0414085bb3035363a38fbb2ed817d3ac88e206b9`), `docs/CI_VALIDATION_STRATEGY.md` (`8b52e78e656ecf15591521d9bca5e2ca5d5e6f2d`), `docs/NARRO_ENGINEERING_RISK_REGISTER.md` (`49683d9decdb7251fae0fae2dc5c8d03ad3d0a85`). No NER family added without new confirmed causal evidence.
2. Infrastructure-only PR #284 `infra/ci-learning-20261009`, current exact candidate head `b47d50a9b1dbce5bb39b08d1c47223985dd5fb44`: isolated `.github/workflows/ci-learning.yml`, `scripts/ci-learning.mjs`, `scripts/test-ci-learning.mjs`.
3. Daily (04:19 UTC)/dispatch independent Linux scan of bounded recent Windows CI history; groups failures only when two distinct run IDs match job, first failed step and structured test/compiler/OS diagnostic; rerun attempts do not count twice. Logs have size cap; missing/generic failures are excluded, not misclassified. The workflow can create at most five deduplicated triage issues per scan and must not infer root cause/flakiness, modify CI verdicts, or edit this risk register automatically.
4. Process rule: new causal lesson -> existing NER row plus immutable work log and tested guard, not one risk row per incident. Automatic issues are review candidates only.

## Validation and exact boundary

- Five offline Node tests (OS error, first causal Rust test, generic exits, step disambiguation, distinct run vs reruns): **PASS**, [GitHub action run 37909495351](https://github.com/MariosGiannakaras/Narro/actions/runs/37909495351), exact head `b47d50a9b1dbce5bb39b08d1c47223985dd5fb44`.
- Existing Windows CI [run 37909495360](https://github.com/MariosGiannakaras/Narro/actions/runs/37909495360): **IN PROGRESS, NOT PASS at writing**. Do not merge before exact-head PASS under normal policy.
- First auto-scanner schedule/production GitHub issue creation: **NOT RUN**, since workflow not yet on main. An offline PASS cannot validate token/API behavior or issue deduplication in production.
- No app build/manual source-parity claims; no TODO/milestone/implementation-campaign counter advanced.

## Independent continuation

Inspect the exact-head Windows CI run `37909495360` and any failure evidence. If green, expected-head-guard merge PR284 after checking live main/changed filenames and verify resulting main preserves newer process Markdown. Confirm the first scheduled/dispatch scanner execution and record its factual coverage/issue behavior; never call that runtime check PASS before it actually occurs. This side-track does not supersede the application's active `HANDOFF.md` or PR owners.
