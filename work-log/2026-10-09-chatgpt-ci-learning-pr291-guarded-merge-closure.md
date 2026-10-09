# CI learning fixture/rustfmt detection — guarded PR291 closure

Date: 2026-10-09. Agent: ChatGPT. Scope: independent CI-learning and prevention tooling only; no application UI/source/domain change, no change to existing `.github/workflows/ci.yml`.

## Confirmed underlying evidence

The initial CI-learning detector integrated in PR284 did **not** classify some Windows visual fixture assertion, Reports post-capture validation or rustfmt errors: missing a match in the scanner was **not** evidence of healthy CI. Repeated Reports modal Shift+Tab assertion on runs `37921875076` and `37927679782` is a *candidate* recurrence, not proof of identical cause. Run `37930178261` failed the screenshot validation after Rust tests and fixture capture (artifact upload was downstream); avoid grouping this with the Shift+Tab failure without causality evidence. Run `37929345017` failed fast-gate Rust formatting. Existing NER-004 was strengthened on main by the independent previous prevention work; no duplicate risk family is added here.

## Validated infrastructure change

- PR [#291](https://github.com/MariosGiannakaras/Narro/pull/291) branch `infra/ci-learning-fixture-assertions-20261009`, guarded expected PR head `82ff3bf07997f09588f21a1324070afd2e834880`.
- Two changed files only: `scripts/ci-learning.mjs`, `scripts/test-ci-learning.mjs`.
- Exact-head [CI Failure Learning run 37933752647](https://github.com/MariosGiannakaras/Narro/actions/runs/37933752647): **SUCCESS**.
- Exact-head [Windows CI run 37933752726](https://github.com/MariosGiannakaras/Narro/actions/runs/37933752726): **SUCCESS** validation/fast/Windows candidate. This PR's Windows CI is an integration gate; its passing does not reverse unrelated failed PR runs.
- Expected-head-guarded squash merge: `3ca380e2715f8586230c0ede5ea5b1b5a1b24f29`; live PR state **MERGED**. Readback from resulting main verified both source/test file Git blobs byte-identical to exact validated head (2/2).
- Prior head `6c20bf2` CI cancelled on replacement and older failed runs remain historical FAIL/CANCELLED.

## Boundaries and remaining verification

Scanner now recognizes named visual fixture assertions, Windows post-capture screenshot-validation failures and rustfmt diagnostics with regression coverage. Matching failures require independent workflow run IDs and manual root-cause review. Scanner does not automatically repair code, tests or infrastructure, and does not prove the listed Windows CI failures have the same cause. Reuse the original issue/risk-register procedure.

**Production scheduled/dispatch scanner execution:** NOT RUN / NOT VERIFIED at this checkpoint. No real production issue-write or deduplication success is claimed. Check first actual scheduled or manually dispatched action logs and report limits/classification and any Github issues; verify alert grouping rather than relying on green PR-only tests. The GitHub integration here does not expose a workflow_dispatch action. **Resulting-main Windows CI for this merge:** check any newly emitted push run separately; do not infer PASS from PR exact-head Windows CI.

No application X/Y batch increment, TODO milestone, Blitzit parity or physical Windows acceptance changed by this infrastructure-only merge. Existing product HANDOFF next-action authority and concurrent owners remain untouched.
