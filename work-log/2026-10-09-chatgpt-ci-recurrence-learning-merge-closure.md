# CI recurrence learning — PR284 guarded integration, 2026-10-09

Scope: **engineering prevention and CI monitoring only**. Existing Narro application React/Rust/domain/persistence/UI source and the pre-existing `.github/workflows/ci.yml` were not changed by this track. Other ongoing implementation PRs were not taken over.

## Validation and source identity

- Original infrastructure evidence: `work-log/2026-10-09-chatgpt-ci-recurrence-learning-infra.md` (immutable historical checkpoint, not a current CI verdict).
- Code/config change: [PR284](https://github.com/MariosGiannakaras/Narro/pull/284), exact head `a9213cd56aa4d31501eddae6d79bd8b8d0bddf8b`. Its three changed paths are `.github/workflows/ci-learning.yml`, `scripts/ci-learning.mjs`, and `scripts/test-ci-learning.mjs`. No existing Windows workflow/app source touched.
- Independent Linux scanner test [run 37910629902](https://github.com/MariosGiannakaras/Narro/actions/runs/37910629902) **SUCCESS**: six deterministic tests.
- Exact-head Windows [run 37910629874](https://github.com/MariosGiannakaras/Narro/actions/runs/37910629874) **SUCCESS**: validation gate, fast gate, Windows candidate all successful. The earlier run `37909495360` belongs to superseded PR head `b47d50a9` and was CANCELLED; it does not validate the final head.
- Expected-head-guarded squash merge returned `48784f50bb474ea498d9173e8e73a1298ff590ef`. Live readback: PR284 **MERGED**, resulting `main` at that SHA; the three changed file blob SHAs on main match the validated PR head **3/3**. Concurrent newer authoritative process Markdown on main was preserved.
- Resulting-main Windows push [run 37914587750](https://github.com/MariosGiannakaras/Narro/actions/runs/37914587750) was **IN PROGRESS / NOT PASS** at recording time. Exact PR-head CI is separately green. The active run must not be reported successful before conclusion.
- Production daily/dispatch scan: **NOT RUN / unverified** at recording time. The action is now configured on `main` for 04:19 UTC and manual dispatch; none of its production token/API/issue-write behavior has been observed. The available GitHub connector has no workflow_dispatch action, so no run was invented.

## Mechanism and prevention constraints

The scanner samples up to 60 relevant runs distributed across 14 days, using paged failure/completed metadata (up to 800/2,000 records), at most three attempts per run, up to 75 failure logs (6MB each). Two **independent run IDs**, matching failed job/first failed step/structured error, trigger a *candidate* grouping; reruns of one run ID do not double-count. It can create up to five GitHub triage issues per execution, deduplicated by an immutable marker; no generic exit-only signatures, automatic root-cause/flaky conclusions, automatic risk-register edits, or acceptance changes.

The policy in `ENGINEERING_QUALITY.md`, `docs/CI_VALIDATION_STRATEGY.md` and `docs/NARRO_ENGINEERING_RISK_REGISTER.md` directs agents to inspect actual primary failure and classify product/harness/infrastructure/unknown, then document causal findings in immutable work logs and strengthen existing NER families only when a reusable lesson is confirmed.

## Handoff

This **infrastructure implementation is merged and its exact-head tests are green**. Next factual checks: inspect resulting-main run `37914587750` and, when the next scheduled or explicitly triggered production scan actually completes, inspect its logs and issue idempotence before declaring runtime activation verified. Production scanner is not yet accepted as end-to-end PASS; this does not block unrelated app implementation or mean the user must perform a physical test. No app milestone, physical/source acceptance or implementation progress counter changes.
