# Narro evidence cleanup — fixed-cohort progress and consumer audit

**LIVE PROGRESS AFTER PR458 (2026-10-30): 25/700 retired, 675/700 remain; of the remaining, 411 HOLD and 264 REVIEW_REQUIRED.** Confirmed current checkout **19,106 tracked files / 11,190,388,083 bytes (11.190 GB)** at merge `60844c254f37ee821388b417015be319b995e462`. Source/test/reference trees unchanged. **Live ledger, initiated 2026-10-30.** Current authoritative status belongs to `HANDOFF.md`, acceptance to `TODO.md`, archival policy to [evidence retention](EVIDENCE_RETENTION_POLICY.md). This ledger measures only the **fixed 2026-10-30 baseline cohort** and is updated after verified retirement; it is not a mandate to delete every file. Do not rewrite frozen historical evidence logs.

## Fixed baseline — before batch PR458

- **Baseline** `main` commit `60b310c19e626150ec864fb8180defd76c83ed07`, full recursive Git tree `truncated:false`.
- **700/700 inventoried** tracked `work-log/evidence/**` video or compressed-archive paths, **8,417,465,377 logical bytes** (559 video / 7,698,063,841 B; 141 compressed archives / 719,401,536 B). This is an exact **path/extension cohort**, not a proof every entry is Narro-owned or deletion-eligible. Verify actual provenance; original Blitzit sources are protected anywhere.
- Overall baseline current checkout **19,130 tracked blobs / 11,339,502,106 logical bytes**; `work-log/evidence/` **17,302 / 11,066,999,581 B**. Other noncohort media/images/raw binaries are not included in the 700 denominator and cannot be inferred clean.
- **Prior verified PR445–457 archival retirements (outside this fixed cohort): 19,301 paths / 5,585,897,016 B.** Never add these historical deleted files to the 700 baseline denominator or claim they remain in the current tree.
- At freeze: **removed 0/700, remain 700/700**. Bounded reviewed and deletion-eligible cohort for this batch: **25 paths / 149,127,296 B** across five superseded Narro CI build-pack families. On verified merger: **removed 25/700, remain 675/700**; those remaining may be HOLD or REVIEW, not necessarily deletable. The fixed denominator excludes new future captures and does not grow on later audits.
- Other protected baseline Git trees: `reference/` `46dea0c640cbfc17003acf439d96f503a5c39410`, `src/` `715f8a0acc5bab9a170d3c55d683f3dcb64d0e90`, `src-tauri/` `d15e3d16751fee44dc494b406235e482011022c5`, `tests/` `229d81ddd95bfae21db7c05e60452e02ca1a0709`.

## Batch analysis — five CI packaging families, before deletion

The exact source/run and historical physically observed failures/retesting were checked in `docs/WINDOWS_PA351_NATIVE_REPORT_2026-10-14.md`, `docs/WINDOWS_PA353_NATIVE_REPORT_2026-10-14.md`, `docs/WINDOWS_PA354_NATIVE_REPORT_2026-10-14.md`, `docs/WINDOWS_PA355_NATIVE_REPORT_2026-10-15.md`, `docs/WINDOWS_PA356_NATIVE_REPORT_2026-10-15.md`, and [final PA01–08 dispositions](WINDOWS_PA01_08_FINAL_2026-10-15.md). These are five old **Narro** automated CI packaging/export ZIP sets, **not** native physical recordings or exact current PR389/419/437 Windows acceptance candidates. Physical outcomes have later source builds and retained native films/evidence; a previously failed claim is not retroactively declared PASS on an old build. Original byte identity and CI provenance remain in each `artifact-manifest.json` and any `*.verification.json`/proof records.

| CI evidence family | Number of ZIP blobs | Bytes proposed | Retained provenance / case evidence |
| --- | ---: | ---: | --- |
| `pa351-exact-ci-20261014` | 5 | 29,624,185 | `artifact-manifest.json` and native PA final-review consumers retained |
| `pa353-ci-20261014` | 5 | 29,755,108 | `artifact-manifest.json` and native PA final-review consumers retained |
| `pa354-ci-20261014` | 5 | 29,788,105 | `artifact-manifest.json` and native PA final-review consumers retained |
| `pa355-ci-20261015` | 5 | 29,987,629 | `artifact-manifest.json` and native PA final-review consumers retained |
| `pa356-ci-20261015` | 5 | 29,972,269 | `artifact-manifest.json` and native PA final-review consumers retained |

**Allowlist within each family, exactly:** `fast-frontend-dist.zip`, `focus-runtime.zip`, `physical.zip`, `validation.zip`, `visual.zip`. No other file may be deleted by this batch. Exact recoverability is the baseline `60b310c19e626150ec864fb8180defd76c83ed07` and original paths; manifest SHA256/size entries remain, Git history is not rewritten. Some immutable historical files and native publication receipts refer to the archived ZIPs: those links become **historic Git-recovery references**, not evidence of live runtime/test consumption. Original Blitzit source media, actual PA351–356 original-native movies, audio, raw observations, installer records, original acceptance decisions and all active candidate packages are excluded. Archive contents were not re-downloaded/decompressed during this review; original CI/frozen proof records supply the past validation only.

**Protected current consumers:** PR389/PR419 separate 8/8 physical-before-merge, PR437 M5 Time Taken/restart & M7 movement/SNAP; CI944 unique full-motion/queued-title/C4 unanswered consumer, CI950/CI953 unresolved motion and source-review claims, capture57 partial review, CI1046 and PR/native October 24–30 cases, PA351–356 original physically reviewed recordings. Where the table says `HOLD`, this is a protective family-level hold based on identified current consumers or likely linked provenance, **not** an assertion that every file has individually proven necessity. `REVIEW` is **not yet cleared** and includes unknown-provenance ZIPs, potentially protected Blitzit material, mixed diagnostic data and old frame/clip evidence; **do not delete** from these classes without further source/consumer inspection. Native 41 finding register isn't a blanket bug/delete list.

## Full fixed-cohort folder inventory

**Classification rule:** `ELIGIBLE` = only the exact five reviewed ZIP families; `HOLD` = conservatively protect known active/native-review families; `REVIEW` = not yet independently checked for deletion. A group-level label must not substitute for individual consumer review, and cannot be used to delete by regex. Sizes are logical decimal MB at the frozen base.

| Folder under `work-log/evidence/` | Baseline files | MB | Decision |
| --- | ---: | ---: | --- |
| `physical-acceptance-20261025` | 28 | 811.45 | HOLD |
| `pa-postfix-35528dea` | 18 | 771.70 | HOLD |
| `m7-ci953-physical-20261005` | 20 | 447.30 | HOLD |
| `all-remaining-physical-20261026` | 10 | 438.36 | HOLD |
| `pa01-08-20261013` | 29 | 430.23 | HOLD |
| `m7-ci948-20261004` | 6 | 297.49 | HOLD |
| `m7-ci953-live-20261005` | 6 | 267.30 | HOLD |
| `ci1046-physical-20261008` | 9 | 260.16 | HOLD |
| `pa351-native-20261014` | 7 | 248.52 | HOLD |
| `m7-ci953-continuous-20261005` | 5 | 218.74 | HOLD |
| `m7-ci944-20261004` | 9 | 192.10 | HOLD |
| `native-residual-20261024` | 10 | 183.26 | HOLD |
| `pa354-native-20261014` | 7 | 175.33 | HOLD |
| `pr431-human-20261027` | 2 | 159.51 | HOLD |
| `pr437-native-20261028` | 4 | 157.09 | HOLD |
| `pa355-native-20261015` | 5 | 152.40 | HOLD |
| `m7-ci953-special-20261005` | 5 | 147.35 | HOLD |
| `native-resume-20261023` | 17 | 131.86 | HOLD |
| `pr358-native-20261016` | 4 | 127.46 | REVIEW |
| `pr431-native-20261027` | 8 | 125.39 | HOLD |
| `physical-ab-20261024` | 10 | 113.66 | HOLD |
| `m7-ci953-dual-20261005` | 3 | 113.30 | HOLD |
| `physical-human-20261026` | 5 | 110.35 | HOLD |
| `pointer-analysis-20261024` | 3 | 103.47 | REVIEW |
| `pa353-native-20261014` | 4 | 96.47 | HOLD |
| `pa356-notification-final-20261015` | 8 | 93.38 | HOLD |
| `physical-native-final-20261024` | 6 | 89.17 | HOLD |
| `physical-gaps-20261024` | 6 | 82.75 | HOLD |
| `m7-ci953-theme-20261005` | 7 | 76.37 | HOLD |
| `m7-ci953-success125-20261005` | 3 | 75.34 | HOLD |
| `pr357-native-20261016` | 3 | 74.85 | REVIEW |
| `batch-native389-20261023` | 9 | 70.66 | HOLD |
| `pr362-native-20261016` | 2 | 68.39 | REVIEW |
| `pr437-native-move-admission-20261030` | 8 | 66.68 | HOLD |
| `pa356-residual-native-20261015` | 4 | 65.70 | HOLD |
| `physical-gap-restart-20261024` | 5 | 64.45 | HOLD |
| `physical-recovery-20261025` | 5 | 63.28 | HOLD |
| `m7-ci953-gaps-20261005` | 3 | 62.75 | HOLD |
| `m7-ci953-interfaces-20261005` | 3 | 61.61 | HOLD |
| `pa356-native-20261015` | 3 | 60.74 | HOLD |
| `physical-residual-20261026` | 6 | 52.90 | HOLD |
| `m5-remaining-native-20261017` | 3 | 52.38 | REVIEW |
| `pr360-native-20261016` | 2 | 52.08 | REVIEW |
| `pa356-production-notification-20261015` | 2 | 51.27 | HOLD |
| `m7-pr235-native-capture-only-20261005` | 3 | 48.48 | REVIEW |
| `capture57-resume-20261020` | 10 | 46.33 | HOLD |
| `m7-ci942-20261004` | 5 | 45.37 | REVIEW |
| `physical-input-causal-20261026` | 8 | 41.51 | HOLD |
| `capture57-final-gaps-20261020` | 4 | 39.43 | HOLD |
| `pointer-retry-20261024` | 4 | 37.28 | REVIEW |
| `pr390-ui-capture-20261021` | 9 | 32.39 | REVIEW |
| `pa355-ci-20261015` | 5 | 29.99 | ELIGIBLE |
| `pa356-ci-20261015` | 5 | 29.97 | ELIGIBLE |
| `pa354-ci-20261014` | 5 | 29.79 | ELIGIBLE |
| `pa353-ci-20261014` | 5 | 29.76 | ELIGIBLE |
| `pa351-exact-ci-20261014` | 5 | 29.62 | ELIGIBLE |
| `pr437-corrected-native-20261029` | 11 | 28.28 | HOLD |
| `pr437-cursor-move-admission-20261030` | 2 | 26.07 | HOLD |
| `ra01-ra02-native-capture-20261019` | 5 | 23.47 | REVIEW |
| `safe-capture-supplement-20261021` | 6 | 23.40 | HOLD |
| `pa356-keyboard-diagnostic-20261015` | 2 | 22.93 | HOLD |
| `m7-ci953-layout-20261005` | 3 | 20.58 | HOLD |
| `m7-ci953-browser-shortcut-20261005` | 3 | 20.19 | HOLD |
| `pr437-atomic-native-20261030` | 10 | 18.64 | HOLD |
| `pr364-native-20261017` | 3 | 16.66 | REVIEW |
| `physical-upload-20261024` | 2 | 16.58 | HOLD |
| `pa353-nsis-native-20261014` | 2 | 16.35 | REVIEW |
| `batch-main-20261023` | 2 | 15.30 | REVIEW |
| `m6-quick-native-20261017` | 2 | 14.98 | REVIEW |
| `pa353-msi-native-20261014` | 2 | 14.53 | REVIEW |
| `pa350-native-review` | 2 | 13.83 | HOLD |
| `pa350-native` | 1 | 12.19 | REVIEW |
| `pr437-owned-overlay-native-20261029` | 10 | 12.04 | HOLD |
| `pr389-native-20261021` | 4 | 11.67 | HOLD |
| `m7-ci950-loading-20261005` | 8 | 11.32 | HOLD |
| `pa356-performance-intake-20261015` | 1 | 5.77 | HOLD |
| `pr387-native-20261020` | 2 | 5.56 | REVIEW |
| `pr437-cold-software-topology-20261028` | 1 | 5.22 | HOLD |
| `pa356-notification-review-20261015` | 1 | 4.98 | HOLD |
| `pr437-software-return-20261028` | 1 | 4.94 | HOLD |
| `pa354-ci-first-failure-20261014` | 1 | 4.94 | REVIEW |
| `pr386-native-20261020` | 3 | 4.86 | REVIEW |
| `pa356-ci-failed-38684913852` | 1 | 4.75 | HOLD |
| `pr437-software-topology-20261028` | 1 | 4.39 | HOLD |
| `m7-ci932-20261004` | 123 | 4.35 | REVIEW |
| `pr388-review-20261021` | 3 | 3.20 | REVIEW |
| `m7-ci893-20261003` | 10 | 2.80 | REVIEW |
| `2026-10-03-m7-ci873-c5-completed` | 4 | 1.84 | REVIEW |
| `pr437-paired-capture-20261028` | 2 | 1.48 | HOLD |
| `pr385-native-retest-20261019` | 2 | 1.42 | REVIEW |
| `pr359-ci-readiness-20261016` | 1 | 1.33 | REVIEW |
| `pr437-causal-transition-20261029` | 2 | 1.19 | HOLD |
| `m5-board-pr357-local-20261015` | 1 | 1.13 | REVIEW |
| `m7-ci884-20261003` | 7 | 1.01 | REVIEW |
| `pa09-menu-intake-20261015` | 1 | 0.99 | HOLD |
| `timer-compositor-ab-20261021` | 3 | 0.95 | REVIEW |
| `pr389-native-preparation-20261021` | 2 | 0.87 | HOLD |
| `m7-ci911-20261004` | 34 | 0.75 | REVIEW |
| `timer-composition-probe-20261021` | 1 | 0.69 | REVIEW |
| `2026-10-03-m7-ci873-c5-computer-use-attempt` | 1 | 0.67 | REVIEW |
| `pr388-c38-acceptance-20261021` | 2 | 0.55 | REVIEW |
| `m5-pr358-local-20261016` | 1 | 0.55 | REVIEW |
| `m7-ci950-20261005` | 3 | 0.55 | HOLD |
| `timer-post-clippy-20261021` | 1 | 0.38 | REVIEW |
| `pa351-preflight` | 1 | 0.35 | REVIEW |
| `pr362-local-20261016` | 1 | 0.32 | REVIEW |
| `ra01-ra02-capture-preflight-20261019` | 1 | 0.27 | REVIEW |
| `pr362-final-candidate-20261016` | 1 | 0.25 | REVIEW |
| `timer-protected-candidate-20261021` | 1 | 0.10 | REVIEW |
| `pr357-checkout-20261015` | 1 | 0.03 | REVIEW |
| `pr389-quiet-baseline-20261021` | 1 | 0.03 | HOLD |
| `pa356-residual-review-20261015` | 4 | 0.02 | HOLD |
| `m7-ci893-followup-20261003` | 1 | 0.01 | REVIEW |
| `remaining-capture-intake-20261021` | 2 | 0.00 | REVIEW |

**Baseline status summary:** `ELIGIBLE` 25 files / 5 groups / 149127296 B; `HOLD` 411 files / 66 groups / 7474378585 B; `REVIEW` 264 files / 43 groups / 793959496 B. Sum = **700/700** files. `HOLD` and `REVIEW` may change through future **evidence-based** decisions, but the baseline denominator remains 700.

## Batch 2 consumer audit — frozen before PR459 (2026-10-30)

**User-requested sequence:** first inspect **all 43 baseline REVIEW families/264 video+ZIP paths** by Git-tree path/SHA/size grouping; then identify consumers of candidate families using native/CI reports, unreviewed evidence README and current exact PR holds. Group names and dates alone are **never** deletion proof. The 43 family scan is a **metadata inventory**, not 264 individually inspected video/audio contents. Unresolved files are retained rather than called clean.

**Three individually supported Narro archive retirements, not active original native films:**

| Exact path from `work-log/evidence/` | Size B | Provenance / retained consumer | Decision |
| --- | ---: | --- | --- |
| `pa351-preflight/fast-frontend-dist.zip` | 347,900 | Historical early PR351/CI38519177394 frontend/86-entry package; exact independent verification remains in `fast-independent-verification.json`, preflight logs and actual production RED/GREEN HTML. PR351 head `372da50b` later merged, CI38521066086 completed SUCCESS. Original interim ZIP recoverable from Git. | ELIGIBLE |
| `pa354-ci-first-failure-20261014/ci-failure-diagnostics.zip` | 4,943,041 | Historical PR354 CI38571856805 first visual-fixture readiness failure; standalone failed-step log, original screenshot and `failure-provenance.json` retained, plus immutable causal report `work-log/2026-10-14-pa354-first-ci-fixture-failure.md`. Corrected PR354 `7647ffab` merged, CI38614321520 SUCCESS. ZIP not an active physical artifact. | ELIGIBLE |
| `pr359-ci-readiness-20261016/original-failure-artifact-extracted-repacked.zip` | 1,333,361 | Historical failed run38856507685 repacked diagnostic (not the original provider ZIP); original failed PNG, first-failure job JSON, reproduction budget HTML/PNGs, semantic-ready screenshots/diagnostics and immutable causal report retained. Corrected PR359 `055350d6` merged, run38857668558 SUCCESS. | ELIGIBLE |

**Bulk batch allowance: 3/3 exact paths / 6,624,302 logical B; all other baseline REVIEW paths excluded from deletion pending actual consumer clearance.** The 3 source/run corrected-head CI SUCCESS results have been checked against the actual GitHub workflow run statuses. The failed historical runs remain FAIL; removing redundant superseded diagnostics does not change that fact or mark native PASS. Recovery commit before PR459 is the exact `main` SHA at deletion creation, preserving these paths and Git blobs. There has been no source/config/test edit, no new CI, and no native execution for this batch.

**Ten REVIEW paths explicitly reclassified to HOLD after reading source consumer evidence:**

- `m7-pr235-native-capture-only-20261005` **3 media/ZIP paths / 48,476,645 B**: `README.md` declares entire CI953 capture RAW_UNREVIEWED, 61 actions, no physical/subcase verdict, so entire MKV, full MP4, source logs ZIP stay needed.
- `pointer-analysis-20261024` **3 ROI/method ZIP paths / 103,473,357 B**: `README.md` documents N09 scoped PASS, **N10 PENDING**, exact PTS/frame accounting and unique native ROI proofs; preserve method and original-pixel extracts until pending consumer disposition.
- `pr358-native-20261016` **4 media/ZIP paths / 127,455,335 B**: `README.md` and `work-log/2026-10-16-pr358-native-acceptance-and-subtask-focus-failure.md` bind original 60fps recording and raw-byte ZIP to bounded native M5 findings and a source failure; the original cannot be assumed replaced by the re-encoded playback or earlier later source build.

**Current reviewed disposition before PR459:** of the **675 still tracked baseline files**, 3 ELIGIBLE /6,624,302 B, **421 HOLD /7,753,783,922 B**, **251 REVIEW_REQUIRED /507,929,857 B**. These numbers supersede the **frozen pre-PR458 snapshot** `411 HOLD +264 REVIEW` but do not change the immutable initial cohort denominator **700**. The original full-family table above retains its 2026-10-30 PR458 frozen classification; these three exact HOLD overrides and three ELIGIBLE item overrides are binding current deltas. No other REVIEW family was cleared by a name/extension-only scan.

**Next step already authorized:** batch delete precisely those 3 ZIP paths in one expected-head guarded archival PR after verification of the current base and exact Git diff, then inspect the resulting main and record **28/700 retired, 672/700 remaining** only after real merge. Continue independent subsequent review of remaining 251 unknown entries, not blanket deletion.

---

## Current progress and next safe operation

**VERIFIED AFTER MERGE:** [PR458](https://github.com/MariosGiannakaras/Narro/pull/458) exact head `8338485c54e8da99e41f047382bc21ec0067b376`, expected-head-guarded squash merge `60844c254f37ee821388b417015be319b995e462`, **25/700 retired**, **675/700 remain**. GitHub exact compare: 25 removals and zero other changes. Post-merge full recursive Git tree `truncated:false`: **19,106 blobs / 11,190,388,083 B**, `work-log/evidence/` **17,277 / 10,917,872,285 B**. Full 700-item baseline cohort now has **675 files / 8,268,338,081 B**: **411 HOLD / 7,474,378,585 B**, **264 REVIEW / 793,959,496 B**; the removed 25 total 149,127,296 B. Every targeted old ZIP path is absent, all five preserved folder counts match **2/9/2/8/9** (30 provenance files). Unchanged exact Git trees: `reference/` `46dea0c640cbfc17003acf439d96f503a5c39410`, `src/` `715f8a0acc5bab9a170d3c55d683f3dcb64d0e90`, `src-tauri/` `d15e3d16751fee44dc494b406235e482011022c5`, `tests/` `229d81ddd95bfae21db7c05e60452e02ca1a0709`. CI/native NOT RUN (deletion-only `[skip ci]`), no code/feature/physical PASS. Cumulative verified retirements **PR445–458: 19,326 paths / 5,735,024,312 B** outside/including this batch; never add those 19,301 earlier removals to the fixed 700 baseline cohort. No shared Git history storage reclaimed.

**ONE NEXT:** Review the **264 REVIEW_REQUIRED** retained video/ZIP entries against named source/CI/native/physical/restart consumers, beginning with one dependency-independent family. Preserve **411 HOLD** until their named open claims are closed or exact replacement exists; none of the 675 may be removed solely to improve the 25/700 ratio. Protect original Blitzit sources across all directories and inside mixed ZIPs. Use another allowlisted reversible PR only after exact consumer eligibility is verified.
