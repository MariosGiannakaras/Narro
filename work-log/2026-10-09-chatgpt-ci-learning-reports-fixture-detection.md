# CI recurrence detection — Reports visual-fixture signature, 2026-10-09

Agent: ChatGPT, separate CI-prevention infrastructure owner only.

## Evidence

- Windows CI [37921875076](https://github.com/MariosGiannakaras/Narro/actions/runs/37921875076), failed Windows candidate at `Capture Visual Regression Fixtures`: `Reports fixture reports-sessions-detail-keyboard-light assertion: Detail Shift+Tab escaped the active modal.`
- Independently, Windows CI [37927679782](https://github.com/MariosGiannakaras/Narro/actions/runs/37927679782), failed at the same first causal step with the same fixture assertion. Both also reported downstream missing packaged-Focus upload artifacts. Both source and actual job logs were inspected; sameness of assertion is **not** proof of same root cause or a flaky harness.
- Existing `scripts/ci-learning.mjs` from PR284 only classified Rust-test, Rust compiler, TypeScript and OS error codes. It did **not** classify named Reports fixture assertions. Thus the daily recurrence scan would undercount this real observed family.
- In the latest inspected 100 GitHub Actions runs at about 2026-10-09 12:39 UTC there were 38 SUCCESS, 23 FAILURE, 36 CANCELLED and three IN PROGRESS. This is a sliding operational sample, **not** the exact all-history failure rate or evidence that failures all share a root cause.

## Narrow prevention-only change

- Created infrastructure-only [PR292](https://github.com/MariosGiannakaras/Narro/pull/292), exact current head `8dd06096c8817b3751c75c98a9d70c8b0e63094c` on `infra/ci-learning-visual-fixture-signatures-20261009`.
- Changed only `scripts/ci-learning.mjs` and `scripts/test-ci-learning.mjs`: parse specifically `Reports fixture <slug> assertion: <invariant>`; record stable fixture identity and hash the normalized assertion instead of exposing raw text; continue to require independent run IDs, job+failed-step+signal grouping and explicit causal triage.
- Two new deterministic tests validate the identified identical recurring fixture failure, different assertion separation, and benign capture-warning exclusion; original six tests remain intact.
- Direct-main process-only `docs/CI_VALIDATION_STRATEGY.md` documents actual recurrence, alert/triage limits and this bounded coverage extension. No new NER family was asserted, since there is no verified new causal invariant.
- Application Reports/modal focus code, existing `.github/workflows/ci.yml`, PR286 and all other application implementation/ownership **untouched**.

## Validation and continuation

- [CI Learning run 37931975606](https://github.com/MariosGiannakaras/Narro/actions/runs/37931975606), exact head `8dd06096c8817b3751c75c98a9d70c8b0e63094c`: **PASS, 8/8 Node tests**.
- [Windows CI 37931975624](https://github.com/MariosGiannakaras/Narro/actions/runs/37931975624), exact head `8dd06096c8817b3751c75c98a9d70c8b0e63094c`: **IN PROGRESS / NOT PASS** when this log was authored. Do not merge until the required evidence meets repository policy.
- Production daily/dispatch CI-learning scanner remains **NOT RUN/NOT VERIFIED**; the new classifier's offline tests are not live token/API confirmation.
- Next action for this independent infra owner: examine exact-head Windows CI, fix only evidence-backed issues in this scanner (do not take over Reports product bug), perform guarded merge only if eligible; verify resulting-main tree and leave new immutable closure note. Other app work follows the app-owned `HANDOFF.md` continuation, not this branch.

Implementation X/Y campaign unchanged: this CI-monitoring improvement is not an application source PR batch.
