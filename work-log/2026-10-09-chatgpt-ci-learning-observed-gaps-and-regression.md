# CI learning gap identified from live Windows failures (2026-10-09)

Scope/owner: ChatGPT, independent CI-learning/prevention infrastructure only; no application source or Windows candidate harness changes, no ownership takeover.

## Corrected global read of CI evidence

At approximately 12:40 UTC, the GitHub Actions latest-100-run page contained 38 SUCCESS, 23 FAILURE, 36 CANCELLED, and 3 IN_PROGRESS. These counts span workflows and PR heads; they are a historical snapshot, not a current pass rate, and cancelled/in-progress are never PASS. The 23 failure count includes two superseded workflow-syntax failures in the early CI-learning branch (not the exact validated/merged head). App's source PR batches/counters remain owned by other agents.

Concrete first-causal failures inspected, with downstream upload errors separately identified:
- [37921875076](https://github.com/MariosGiannakaras/Narro/actions/runs/37921875076) and [37927679782](https://github.com/MariosGiannakaras/Narro/actions/runs/37927679782): Windows visual capture Reports fixture `reports-sessions-detail-keyboard-light`, primary PowerShell diagnostic `Detail Shift+Tab escaped the active modal`. `Upload Packaged Focus Runtime Visual Artifact` failed downstream because the capture pipeline aborted. Matching messages are two independent run IDs, **not** proof of shared source cause.
- [37919417233](https://github.com/MariosGiannakaras/Narro/actions/runs/37919417233): earlier Reports fixture `did not report ready after 2 captures`; must remain separate from a confirmed keyboard assertion.
- [37921047795](https://github.com/MariosGiannakaras/Narro/actions/runs/37921047795): first failed step Rust tests, exact failing test `persistence::task_writer_contention::task_mutations_wait_for_competing_writer_and_preserve_latest_state_and_identity`.
- [37929345017](https://github.com/MariosGiannakaras/Narro/actions/runs/37929345017): fast gate Rust formatting failure in `src-tauri/src/session_reporting.rs`; Windows job correctly skipped.
- PR284 was guarded-merged at `48784f50bb474ea498d9173e8e73a1298ff590ef`. Its exact-head Linux test [37910629902](https://github.com/MariosGiannakaras/Narro/actions/runs/37910629902) and Windows [37910629874](https://github.com/MariosGiannakaras/Narro/actions/runs/37910629874) were SUCCESS. Resulting-main push [37914587750](https://github.com/MariosGiannakaras/Narro/actions/runs/37914587750) was CANCELLED, not PASS. A newer resulting-main source [37915680060](https://github.com/MariosGiannakaras/Narro/actions/runs/37915680060) was SUCCESS on **different** SHA; do not pass it off as a pass for the cancelled run.
- Only three `CI Failure Learning` runs were recorded, all `pull_request` offline-test successes; no scheduled/dispatch scanner run, and no automatically opened recurrence issue, had been observed at this checkpoint. The first daily scan is 2026-10-10 04:19 UTC if GitHub schedules it.

## Defect in original detector and response

Original `scripts/ci-learning.mjs` recognizes specific Rust/compiler/OS signals but returns UNKNOWN for PowerShell `Reports fixture ... assertion:` and `did not report ready` diagnostics and `rustfmt Diff in ...`, missing real recurrent failures. Risk-register NER-004 guard was strengthened on main by commit `0a4e6281a9717f9b82627e7c42bffd4d06f6ec97`, without creating a duplicate risk family.

Narrow infrastructure-only PR [#291](https://github.com/MariosGiannakaras/Narro/pull/291), branch `infra/ci-learning-fixture-assertions-20261009`, exact initial head `a879a8482054d265e4cf9e6c592c2ca7243be50a` changes only `scripts/ci-learning.mjs` and `scripts/test-ci-learning.mjs`. Adds PowerShell fixture+hash assertion fingerprint, separately recognized readiness, and normalized rustfmt file signature; three evidence-based tests. Repeated signature remains a triage **candidate**, never automatic causal equivalence or flaky label.

- Exact-head independent scanner workflow [37931853459](https://github.com/MariosGiannakaras/Narro/actions/runs/37931853459) offline tests: **PASS, 9/9**.
- Exact-head Windows CI [37931853294](https://github.com/MariosGiannakaras/Narro/actions/runs/37931853294): **IN PROGRESS / NOT PASS when recorded**; no merge without actual success.
- Scanner production scheduled execution, GitHub token issue-writing and deduplication: **NOT RUN / NOT VERIFIED**. Do not claim operational acceptance without a real scan.

## Continuation

Inspect exact-head run `37931853294`. On evidence-backed failure, fix only own learning script/tests. If PASS and PR file diff limited to own two files, merge with expected-head guard, verify resulting-main blobs and newer authoritative Markdown preserved; update HANDOFF with the real result and a new immutable merge-closure log. Confirm scheduled scanner actually runs and issue behavior in future; physical/Blitzit/application implementation gates remain unaffected.
