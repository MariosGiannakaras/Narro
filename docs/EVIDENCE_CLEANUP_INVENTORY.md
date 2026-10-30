# Narro evidence cleanup — fixed-cohort progress and consumer audit

**Live ledger, initiated 2026-10-30.** Current authoritative status belongs to `HANDOFF.md`, acceptance to `TODO.md`, archival policy to [evidence retention](EVIDENCE_RETENTION_POLICY.md). This ledger measures only the **fixed 2026-10-30 baseline cohort** and is updated after verified retirement; it is not a mandate to delete every file. Do not rewrite frozen historical evidence logs.

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

## Current progress and next safe operation

**At analysis freeze: batch deletion NOT RUN; 0/700 removed, 25/700 approved candidates, 675 other paths retained.** Only the five exact ZIP sets above are admitted for one deletion-only guarded PR after checking the HEAD/base and exact diff. After merge verify folder manifests, source/reference/test tree identities and update this section with actual result; do not state future merge or resulting totals as accomplished until observed.

**ONE NEXT:** Create one exact-path 25-ZIP deletion PR on current verified main, independently inspect the change list, merge with expected-head guard if only approved archival ZIPs, validate resulting main. Then update this ledger, `HANDOFF.md`, `TODO.md`, `STATUS.md`, and a new immutable receipt. Continue batch research on remaining `REVIEW` groups in later coherent cohorts; neither `HOLD` nor unknown-provenance entries are authorized for mass deletion.
