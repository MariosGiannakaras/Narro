# Narro workflow re-audit — PR444 exact-head CI PASS, residual gaps and proposals (2026-10-30)

**Scope/owner:** ChatGPT workflow/audit track. This is a **read-only source/CI analysis**, except publication of this immutable audit and current tracker reconciliation; **no implementation change, new PR, merge, Windows process, backup, or AppData access** was performed. Prior immutable [first audit](2026-10-30-chatgpt-workflow-governance-risk-routing-native-safety-audit.md) remains unmodified.

## Exact repository and CI evidence

- Repository `MariosGiannakaras/Narro`; main governance from current `AI_START_HERE.md`, `AGENT_WORKFLOW.md`, `AGENTS.md`, `ENGINEERING_QUALITY.md`, `HANDOFF.md`, `STATUS.md`, `TODO.md`, `docs/CI_VALIDATION_STRATEGY.md`, `docs/NARRO_ENGINEERING_RISK_REGISTER.md` and current operator packet.
- [PR444](https://github.com/MariosGiannakaras/Narro/pull/444), branch `fix/workflow-risk-routing-20261030`, exact head **`b93235a9fe2f651f86b347142858b9f590ea4e5a`**, OPEN/UNMERGED at inspection. [Exact Windows CI41045291545](https://github.com/MariosGiannakaras/Narro/actions/runs/41045291545) **validation-gate SUCCESS; fast-gate SUCCESS; windows-candidate SUCCESS (3/3)**, all at that SHA. Windows artifacts IDs physical `12973018092`, M7 validation `12972808672`, M1 diagnostic `12973381787`, source fixture `12973550235`. These artifacts were **listed**, not independently redownloaded/rehashed in this re-audit; do not claim artifact-byte verification from the 3/3 job result alone.
- Historical PR444 [run41044834254](https://github.com/MariosGiannakaras/Narro/actions/runs/41044834254) and [run41045067289](https://github.com/MariosGiannakaras/Narro/actions/runs/41045067289) **FAST FAIL** on `test-merged-prephysical-ci-coverage.mjs` string `AUTHORIZED by the user`; replacement current CI **PASS** after changing test to live `PA-01–PA-09 ACTIVE` plus safety contracts. Historical FAIL remains FAIL. One intermediate newer commit run was canceled by superseding head; do not count it as PASS.
- Stable latest [PR437](https://github.com/MariosGiannakaras/Narro/pull/437) head `632345026d9c693613a3a0b3e9a8105740fcc6af`, CI41035287020 **3/3 PASS** with previously byte-verified ZIPs; unrelated PR389/419/431/436 still unmerged at this snapshot. **PA-01–09 ACTIVE** by 2026-10-27 user authorization, but missing candidate-specific native acceptance **NOT RUN**, strict PR389 and PR419 comparator physical holds OPEN. Milestones M1–M4 accepted 4/10, M5–M9 OPEN, M10 user gate, M11/M12 inactive.

## Findings: source-confirmed mechanics vs risk assessment

### RA-01 / HIGH — isolated-profile assertion is not actually validated (PR444)

**Observed:** `scripts/prepare-m7-physical-session.ps1` resolves the current Windows user's known-folder Roaming and Local `com.mariosg.Narro` paths, tests their existence and rejects `-Launch` if either already exists. Its user-facing message says to use an isolated Windows profile. The implementation does **not** attest a separate test Windows identity, test-profile boundary, or scratch location; a personal account that has not yet launched Narro will pass. Conversely a legitimate previously used *isolated* profile with test data may be rejected on a second preparation. **Risk:** false sense of isolation, disrupted repeat/restart test workflow. No actual personal-data access or runtime failure was demonstrated here.

**Proposed:** require a verifiable, explicitly selected disposable test user/profile or injected isolated app-data root supported by the application and bounded verified process; fail closed for a personal root. Support repeated isolated-session/restart acceptance without assuming that all pre-existing test data is production. Add negative and positive *native PowerShell execution tests with mocked environment/process calls*, and a true isolated-operator smoke later, recording both Roaming and Local identities. **Do not implement OS account changes in CI or on user machine without safeguards.**

### RA-02 / HIGH — backup is opt-in but still placed among shareable evidence, incomplete and unverified

**Observed:** on `-BackupProductionData` the PR444 script still copies **only Roaming** production data to `$sessionDir/production-appdata-backup`, where `$sessionDir` is under the chosen evidence root (default repo `artifacts/m7-physical-session`). It computes source-file names/sizes/hashes and writes them in `environment.json`; it does **not** hash/verify corresponding copied files. Local Narro data is detected but not included. `.gitignore` excludes `artifacts/` from normal Git tracking, **not** manual evidence zipping/sharing. There is no demonstration of a real leak or bad copy; the design creates a plausible privacy/integrity hazard if backups are treated as shareable evidence or complete recovery material.

**Proposed:** default to **zero private-file reads/copies**; require separate operator consent for any backup and place it **outside** evidence/repo paths with restrictive access, no data/filename leakage into shareable manifests. State clearly whether it is Roaming-only vs full-scope; when a recovery-grade backup is requested, verify exact copied bytes and cover required roots with appropriate locking/consistency safeguards. Add a test proving that evidence-collection/upload paths can never include private backups.

### RA-03 / HIGH-MEDIUM — exact executable provenance does not bind to the running PID

**Observed:** the script checks the on-disk path's SHA256 against user-supplied `-ExpectedSha256` (mandatory only with `-Launch`), then launches and waits two seconds. It checks only `Get-Process -Name "narro"` count and prints `$running[0].Id` instead of validating that process ID equals the `Start-Process -PassThru` PID, that actual process path equals the verified path, or that the actual running executable still hashes to the exact CI artifact. A user-supplied hash also is not itself proof that it originated in the claimed CI run.

**Proposed:** require source/run/manifest provenance and compare the `Start-Process` returned PID to the single live target; verify its executable path and file hash, record process/HWND identity, refuse recording as PASS on mismatch/early exit. Preserve exact source SHA/CI run/attempt and actual host monitor/DPI data in the native receipt. Add race/incorrect PID/obsolete binary negative tests.

### RA-04 / MEDIUM — existing safety tests are structural rather than behavioral

**Observed:** `scripts/test-ci-tiering.mjs` and `scripts/test-merged-prephysical-ci-coverage.mjs` require specific PowerShell source substrings/regex and a checklist wording. They passed current Ubuntu fast CI, but cannot establish real PowerShell branching, profile behavior, backup isolation or process provenance. The two older PR444 fast failures were caused by the obsolete literal `AUTHORIZED by the user`, demonstrating **contract wording coupling** rather than a product failure.

**Proposed:** keep a few lightweight semantic source contracts where useful, but move privacy/candidate cases to executable PowerShell tests (Pester or carefully isolated Windows harness with dependency injection and only synthetic temporary paths): no-flag no-read/copy; explicit backup permitted in private destination only; Local-only and Roaming-only existing paths; absent/mismatched hash; unexpected/racing PID; repeated dedicated test profile; correct case outcomes. No live app or user AppData needed for the unit tests. Assert safety **behavior and outcome**, not a particular English phrase.

### RA-05 / MEDIUM — prevention routing still overlooks physically consequential workflow scripts

**Observed:** exact PR444 `scripts/preflight-impact.mjs::selectLearningRisks` now maps canonical governance MD files to NER-005/NER-006. For `scripts/prepare-m7-physical-session.ps1` and `scripts/test-ci-tiering.mjs`, its routing predicates only produce the general `runtime` family NER-003/NER-012; neither file is recognized by `ci`, `tracking` or `native` predicates for security/physical/handoff review. This is a **source-confirmed classification omission**, despite the separate new static regression checks. Risk register rows NER-005/006/011/012 are existing prevention material, not a reason to invent duplicate NER categories.

**Proposed:** add targeted owner- and risk-aware routing for physical-operator scripts, provenance, release/backup test harness, and current governance contracts; match actual changed path and semantics. Add positive and negative regression examples for `.ps1`, `test-ci-tiering.mjs`, `test-merged-prephysical-ci-coverage.mjs`, `work-log/` exclusions, then ensure the preflight command is executed as an actual admission step rather than only unit-testing its implementation.

### RA-06 / MEDIUM — critical Markdown workflow guidance changes bypass every current Actions check

**Observed:** `.github/workflows/ci.yml` has ordered `**`, `!**/*.md` and four re-included bundled technical documents on both main push and PR. `.github/workflows/ci-learning.yml` PR triggers only its workflow and two CI-learning scripts. Consequently ordinary changes to `AGENTS.md`, `AI_START_HERE.md`, `AGENT_WORKFLOW.md`, `HANDOFF.md`, `TODO.md` and `docs/CI_VALIDATION_STRATEGY.md` alone do **not** start an automated governance consistency test. Merely adding MD paths to `selectLearningRisks` does not enforce that review; an agent has to invoke the impact tool.

**Proposed:** dedicated **cheap governance validation** for selected policy/current-truth Markdown (path-sensitive, not full Windows packaging). Validate current PA authorization and M10/M11 holds, one live next action, the roadmap denominator, PR/CI status format, stale-current markers and links, and immutable-log write boundaries. Avoid guessing live PR SHA from prose without GitHub access or blocking legitimate historical quotations. Keep documentation-only commits cheap and old log snapshots immutable.

### RA-07 / MEDIUM — failure-learning coverage is explicitly bounded; do not overclaim exhaustive learning

**Observed:** scheduled [CI Failure Learning run41044150412](https://github.com/MariosGiannakaras/Narro/actions/runs/41044150412) SUCCESS: **415 completed-run metadata**, **133 candidate-run metadata**, **60 sampled runs**, **60 failed job logs**, **6 repeated-signal families**, **8 unclassified**, and `coverage limited=true`, **0 new issues**. The algorithm intentionally scans a rolling **14-day** period, samples at most **60** candidates and caps logs; issues group *signals*, not proven root causes. Existing candidate issues such as [#439](https://github.com/MariosGiannakaras/Narro/issues/439), [#435](https://github.com/MariosGiannakaras/Narro/issues/435) and [#442](https://github.com/MariosGiannakaras/Narro/issues/442) were found open; zero new issues is not evidence of zero unsolved defects. It does not reason automatically about product semantics or physically validated fixes.

**Proposed:** report scanned/eligible/sampled/unknown coverage every scheduled run, identify recent uncovered failures for bounded next-pass retry, compare triage candidates with exact replacement SHA/CI and closure evidence, and maintain a manually evidence-classified historical root-cause catalog to prevent repeat failed corrections. Do not invent one issue per attempt or falsely classify a successful rerun as causal proof. Only explicitly run a separately bounded old-history backfill; preserve daily resource caps.

### RA-08 / LOW-MEDIUM — current-truth trackers remain costly to navigate

**Observed:** `TODO.md` and `STATUS.md` contain substantial explicitly marked historical snapshots, while the current header points to one active PR444 workflow task. Old `CURRENT`/CI/PA text is retained under dated historical headings. This is **not** a new verified status contradiction at the active top; it creates avoidable long-read/retrieval confusion and stale-pointer regression risk.

**Proposed:** keep one short active head and canonical index; migrate redundant *mutable current-file* history into a properly referenced immutable append-only receipt with exact preservation, updating pointers and verifying no historical evidence loss. Avoid broad rewrite or repeated full scans merely for tidiness.

### RA-09 / LOW — GitHub runner action deprecation and serial Windows cost

**Observed:** actual [CI learning run41044150412](https://github.com/MariosGiannakaras/Narro/actions/runs/41044150412) emitted Node20/action v4 compatibility warnings while running on Node24, and the active workflows still use `actions/checkout@v4` / `actions/setup-node@v4`. No failure was observed from the warning. Current Windows candidate is serial and builds multiple release variants; prior 2026-10-21 immutable workflow audit already established performance/latency cost. **This is a maintenance suggestion, not a new functionality bug.**

**Proposed:** independently test compatible maintained action major versions in a narrow CI PR; pursue selective visual-package parallelism only after measurement and with identical exact-head, complete gating and artifact provenance. Do not weaken Rust/visual/packaging tests for speed.

## Confirmed effective controls (preserve)

- CI three gates on the exact PR head **all PASS** at latest PR444 commit; prior fast failures remain historical FAIL, not overwritten.
- PR444 added source-level `-BackupProductionData`, `-ExpectedSha256`, Roaming+Local prelaunch guards and regression checks. These reduce the original unconditional private-copy risk even though they are not sufficient to prove actual isolation or recovery-safe backup.
- `AI_START_HERE.md` says **PA-01–09 ACTIVE**, no repeated case-by-case permission; `AGENT_WORKFLOW.md` and current live docs distinguish native/CI/parity and preserve independently held PR389/419 strict A/B native acceptance.
- `ci-learning.mjs` uses distinct run IDs, earliest failed-step scope, bounded logs/issue writes and fail-closed UNKNOWN; no weakening or false-green CI result found in this audit.
- Scope restrictions preserved: no extra M10/M11/M12 activation, no Spectrum Core picker/icons change, no merge of physical-held PRs.

## Recommended execution order, not changes implemented in this audit

1. **Before declaring PR444's PowerShell guard operationally safe:** address RA-01–04 together on the *same PR444 branch* with tested isolated account/profile semantics, private complete backup boundary/provenance and real PowerShell negative-path regression. New commit/new exact-head CI required; older green head remains green only for its own source. Apply approved separate private-data safeguards, do not access actual user profile in tests.
2. Then handle RA-05–06: broaden specific risk routing without duplicate NER families, and add a minimal docs-only governance gate with negative tests. Keep under a separate scoped PR if logically independent of physical script safety.
3. Then improve operational recurrence learning RA-07 from bounded scan receipts and triage dispositions, not by rerunning complete CI history; archive redundant live-tracker history only when safe; defer action-major upgrades/performance changes until correctness is stable.
4. No code or merge operation was authorized or performed by this **audit-only** request. The underlying PR444 is OPEN/UNMERGED despite exact 3/3 CI. Whether to implement the follow-on remediation is a separate source task. Full native PA-01–09 requires an actual qualified Windows operator, not this GitHub-only analysis session.

**One next action:** retain exact PR444 state and use this audited priority order for source remediation planning; if work on PR444 resumes, verify its current head and ownership before any edit, implement directly on the existing branch, validate narrow PowerShell/test cases then exact CI, and never weaken a test solely to obtain green.
