# Narro CI workflows — general audit (2026-10-21)

**Scope and evidence.** Read-only review of live `.github/workflows/ci.yml` (Windows CI), `.github/workflows/ci-learning.yml` (CI Failure Learning), package scripts, `src-tauri/tauri.{conf,ci.conf,physical.conf,diagnostic.conf}.json`, `scripts/test-ci-tiering.mjs`, `scripts/test-preflight-impact.mjs`, `scripts/ci-learning.mjs`, classifier regression tests, existing validation strategy, and the complete logs of successful PR397 run `39647102464`. The workflow search found two workflow files. Findings distinguish proven static/log-based facts from proposed optimizations; **no product/CI workflow was modified or rerun** for this audit.

## Verified execution and timings

- PR397 exact head `a03ee328591fe7d838e98141a80e3c48687de6f8`, Windows CI run [39647102464](https://github.com/MariosGiannakaras/Narro/actions/runs/39647102464): validation-gate, fast-gate, windows-candidate **3/3 SUCCESS**. This is one measured sample, not a universal timing baseline.
- Timestamp range in the fast job log: **45.46 seconds**, from 17:48:52.596Z to 17:49:38.060Z.
- Timestamp range in the Windows job log: **20 min 6.76 sec**, from 17:49:43.852Z to 18:09:50.613Z.
- The `npm run test:visual-regression:windows` step began at 17:53:16.361Z and the next visual artifact upload started 18:01:56.082Z: **about 8 min 40 sec** spent on visual capture/validation, approximately 43% of the Windows job.
- Windows then builds the ordinary Tauri release, runs packaged Focus visual tests, builds physical-validation production configuration, verifies and packages that, then builds a diagnostic release. The Windows gate has a **35-minute timeout**. A quick fast PASS is not a final Windows acceptance.

## Sound controls already present (do not remove)

1. Three ordered gates: cheap Ubuntu validation and frontend/Rustfmt first, then Windows-native Rust/Clippy/tests, browser visual fixtures, packaging and smoke. `windows-candidate` requires fast-gate SUCCESS. No weakening of required tests is warranted.
2. Both heavyweight jobs use identical non-cone sparse checkout patterns excluding raw `work-log/` and `reference/` media, and `scripts/test-ci-tiering.mjs` actually exercises checkout exclusions against a temporary Git repository.
3. Build artifacts: frontend `dist` from the fast gate is downloaded by Windows; `tauri.ci.conf.json`, physical and diagnostic overlays set `beforeBuildCommand:null`, so the Tauri builds consume the transferred `dist` instead of redundantly rebuilding it. `prepare:icons` regenerates packaging icons. Earlier apparent frontend-rebuild risk was **ruled out by the actual overlay configs**.
4. Concurrency `windows-ci-${{ github.ref }}` with cancel-in-progress prunes superseded runs of the same PR while isolating other refs.
5. Exact-tree post-merge deduplication is deliberately fail-closed: skip only on push/main tied to a merged PR, identical head/main Git trees, successful exact-head **same-workflow** PR run, and no changed workflow/Cargo/toolchain/cache-key inputs. GitHub API/proof errors fall back to full CI.
6. The daily CI-learning workflow has separate permissions, a 14-day bounded historical scan, attempts grouped by distinct run ID, hashed dynamic fixture assertion text, and at most five new triage issues per scan. It does not change Windows job verdicts, and its PR offline self-test is separately scoped.

## Audit findings

### CI-01 — High throughput/latency cost from one serial Windows candidate (CONFIRMED; performance design)

**Evidence:** ~20.1 min single Windows job, of which ~8.7 min visual captures. It then builds multiple Tauri variants and produces multiple artifacts serially; every executable/test source PR targets the same complete path.

**Consequence:** rapid batches of code changes incur long Windows lead times and create pressure to idle-poll; there is no basis to expect completion within ~7 minutes.

**Remediation:** preserve required full exact-head validation, but parallelize independent Windows visual and package jobs where artifact/cache dependencies allow; preserve a single aggregating required acceptance verdict and exact source identity. Alternatively selectively shard the capture suites while retaining complete coverage; measure dominant fixture scripts first. Reuse already validated artifacts and batch coherent source changes. Do **not** silently replace the Windows candidate with Linux-only fast tests.

### CI-02 — CI-learning omits common Node.js frontend-test failures (CONFIRMED; diagnostic coverage, MEDIUM)

**Evidence:** `signalFromLog` currently recognizes Rust test/compiler, TypeScript compiler, named Reports visual fixture/readiness, rustfmt, and specific operating-system errors. It **does not** recognize generic Node.js `Error: Missing ...`, `AssertionError [ERR_ASSERTION]`, or `SyntaxError: Unexpected token` emitted by frontend contract tests. Recent fast-gate failures from the archive change had a `SyntaxError: Unexpected token ','` and `Error: Missing real archive fixture keyboard arrow/focus coverage: ...`, hence this classifier returns `null` for such logs unless an unrelated recognized signature is present.

**Consequence:** repeated frontend errors can remain `unknown` in the scheduled failure-learning scan rather than generate recurring-signal issue candidates. **This is not a false-green CI gate; it is a missing diagnostic category.**

**Remediation:** add bounded and privacy-safe Node assertion/syntax/contract categories, hash normalized user-controlled messages (never publish arbitrary raw log lines), discriminate by job/failed step, and add regression tests from anonymized failures and negative examples. Prefer explicit failure-record formats from the preflight scripts to brittle generic textual matching. Ensure that transient paths, exact line numbers and secrets are not embedded in issue titles.

### CI-03 — Markdown paths are globally ignored despite packaged documentation inputs (CONFIRMED; MEDIUM)

**Evidence:** Windows CI `push` and `pull_request` use `paths-ignore: ["**/*.md"]`. Yet its Windows packaging steps copy `docs/M7_AUTOMATIC_VALIDATION_LOGGING.md` into the automatic validation artifact and bundle `docs/M1_FLOATING_PERFORMANCE_MEASUREMENT.md`, `docs/M1_WINDOWS_RUNTIME_VALIDATION.md`, and `docs/M1_DISPLAY_TOPOLOGY_VALIDATION.md` in the diagnostic artifact. Other markdown spec files may be test inputs.

**Consequence:** documentation-only changes in files consumed by release/validation artifacts do not themselves trigger rebuilds/checks. No app-executable failure is proven, but the artifact documentation can be stale until a later code-triggered run. Generic tracking Markdown intentionally avoids expensive CI and should continue to do so.

**Remediation:** explicitly include the small, known set of *artifact/build/test-input Markdown* in workflow path filters (not all `**/*.md`), with matching regression coverage. Use an allowlist/provenance check as docs added to artifacts change.

### CI-04 — PR builds the head, not the would-be merged source tree (CONFIRMED; integration risk, MEDIUM)

**Evidence:** both checkouts choose `github.event.pull_request.head.sha` on pull requests. This proves PR branch behavior but not behavior of the merge with the current changing `main`. The post-merge dedup check will decline to skip if the resulting tree differs, which is good, **but that validation happens after merge**.

**Consequence:** a green branch can still encounter an untested integration change on merge. This is especially relevant to concurrently active branches that touch the same UI/tests; mergeability alone is not a complete behavior guarantee.

**Remediation:** before merge, validate representative integration tree or use merge queue/required merge checks alongside immutable exact-head approval. Preserve the fail-closed post-merge tree identity check; do not reinterpret earlier green heads as proof of newer merged code.

### CI-05 — Mutable toolchain/action/runner inputs weaken reproduction (CONFIRMED configuration, MEDIUM)

**Evidence:** `windows-latest`, `ubuntu-latest`, `dtolnay/rust-toolchain@stable`, and several `actions/*@v4` / `actions/github-script@v7` major tags are movable. One third-party cache action is properly commit-pinned and Rust dependencies use `--locked`. Node major is pinned to 24, not every patch.

**Consequence:** hosted runner/toolchain changes can alter build behavior between commits without a repository change. This does not prove any current exploit.

**Remediation:** review current supported action releases and pin critical actions by reviewed commit SHA; choose intentional runner-image/toolchain baselines, update them on a scheduled cadence with reproducibility smoke. Preserve lockfiles and test upgrades independently, not blindly.

### CI-06 — Packaged artifact provenance could be more self-verifying (IMPROVEMENT; MEDIUM)

**Evidence:** the fast dist is validated by existence of `dist/index.html` and `dist/focus.html`, and Windows artifacts are uploaded. Existing individual physical validation smoke checks that the production-config build does not activate CI runtimeVisual instrumentation. The workflow does not produce a universal, machine-checked SHA256 manifest linking all EXE/MSI/NSIS, dist, CI run and source head at each upload.

**Consequence:** verification of artifact identity currently relies on separate records or manual artifact hashing. It is possible to improve repeatability without changing app logic.

**Remediation:** generate and verify an artifact manifest (SHA256, source HEAD, workflow run, config kind, actual executable path) for each release/physical/diagnostic family; publish beside artifacts and validate exact source/merge identity. Keep existing runtimeVisual isolation smoke.

### CI-07 — Diagnostics upload can add distracting secondary failure (CONFIRMED configuration; LOW)

**Evidence:** `Upload Packaged Focus Runtime Visual Artifact` uses `if: always()` combined with `if-no-files-found: error`. If an earlier step fails before producing these files, this later upload may itself fail. Other visual failure diagnostics correctly use `if-no-files-found: warn`.

**Consequence:** additional red upload step can make first-cause triage noisier, though the primary failing step remains in the logs.

**Remediation:** keep failure artifacts when they exist, but use a path-existence or reached-capture guard and nonfatal missing-files behavior for diagnostic-only uploads; preserve an error when the artifact is truly mandatory on a successful build.

### CI-08 — Retention and workflow performance are not yet explicit enough (IMPROVEMENT; LOW)

**Evidence:** the fast frontend artifact has explicit `retention-days:1`; most large visual, executable and diagnostic artifacts inherit repository defaults. The CI learning workflow runs nightly and can upload/write triage issues; it is outside the Windows CI path.

**Consequence:** artifact storage/expiry and diagnostic evidence reuse may vary with repository settings. Not enough data to quantify storage cost or prove premature expiry.

**Remediation:** define retention by evidence class (short-lived intermediate dist vs immutable acceptance evidence), and publish lightweight per-phase timings. Review daily CI-learning issue noise with deduplicated fingerprints; do not auto-close or auto-label fixes as complete.

## Priority and safe implementation sequence

1. **Cheap correctness/diagnostics:** fix Node failure classification, add tests for `paths-ignore` exceptions and the diagnostic upload boundary. Validate with fast checks before Windows candidate.
2. **Provenance and reproducibility:** source/artifact checksum manifest, reproducible action/runner/toolchain upgrades, precise include rules for packaged Markdown.
3. **Expensive performance redesign:** time each screenshot suite, then shard/parallelize Windows work with strict joined acceptance; verify equivalent artifacts, source hashes and the complete scenario matrix before substituting the current required gate.
4. **Premerge integration:** tighten merge-tree validation or use a merge queue without weakening exact-head, post-merge and native/physical acceptance distinctions.

**Explicit non-findings:** no observed evidence that the main duplicate-CI guard improperly returned green; no evidence fast-gate dist is discarded/rebuilt inside the three Tauri build variants (all relevant configuration overlays disable `beforeBuildCommand`); no basis to remove Windows visual tests because PR389 previously passed automated gates while failing actual native motion. **A 3/3 CI PASS is technical/build evidence, not a physical Windows or Blitzit-source parity PASS.**

**Outcome:** AUDIT COMPLETE (static code/config + one actual 3/3 log set). Findings are actionable design/coverage issues, **not fixed by this document**. No workflow or test changed and no new CI started; ongoing source PRs and physical acceptance retain their previous statuses.
