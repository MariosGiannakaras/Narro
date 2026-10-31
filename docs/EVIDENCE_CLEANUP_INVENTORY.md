# Narro evidence cleanup — fixed-cohort progress and consumer audit

**LIVE PROGRESS AFTER VERIFIED PR461 (2026-10-30): 32/700 retired; 668/700 remain = 668 HOLD /8,214,457,803 B + 0 REVIEW_REQUIRED.** Previous [PR460](https://github.com/MariosGiannakaras/Narro/pull/460) retired 3 original-retained Narro MP4 remux copies. [PR461](https://github.com/MariosGiannakaras/Narro/pull/461) further retired 1 byte-identical helper ZIP /2,420 B with its original copy, manifest and both sessions' independent records preserved. Exact resulting-merge `main` `de08038f32acaf426ef54c1112ba3f01da63e8e5`: **19,105 tracked blobs /11,136,554,082 logical B**; `work-log/evidence/` **17,270 /10,863,992,007 B** (before subsequent documentation-only ledger/receipt commits). [Immutable PR461 verification](../work-log/2026-10-30-chatgpt-pr461-merged-resulting-main.md). Current cohort is fully dispositioned, **not** fully deletable; all 668 remain protected until new provenance/consumer closure. Git object/history storage not rewritten. Exact post-merge `main` `982ab012131cabc141ffc0aeb395ac65426f462b`: **19,103 tracked blobs /11,136,539,529 logical B (11.137 GB)**; `work-log/evidence/` **17,271 blobs /10,863,994,427 B**. [Immutable PR460 merge/verification receipt](../work-log/2026-10-30-chatgpt-pr460-merged-resulting-main.md). A fourth grouped consumer audit reclassified 223 retained original/native paths from REVIEW to HOLD (no additional deletion). The fixed baseline 700-file ledger remains unchanged; this tracks current checkout paths, **not** reclaimed Git object/history storage. Source/test/reference protected Git subtrees unchanged. The original later-documented platform block was resolved by an actually successful permitted expected-head-guarded merge; previous blocker receipt remains historical.

**Separate out-of-cohort R4 PNG cleanup (2026-10-31):** [PR463](https://github.com/MariosGiannakaras/Narro/pull/463), head `39865207d5c3b31d90ba47a7d6f96efc3bfc2a32`, guarded-merged `1d2f23a5b3f1277fb2a65b95af17dd93b934bc6b`; **37 Git-SHA-identical PNG copies /31,001,629 logical checkout bytes** deleted. All 20 distinct image blobs, **23 named samples**, all 8 explicitly cited timepoints, 11,881,268-byte native MKV blob `f2eefc4446a2fec49ef5bab09256bef72c28309b`, original manifest and source/acceptance consumers retained. Exact merge `main` tree `truncated:false`: **19,070 tracked blobs /11,105,567,899 B**, evidence **17,233 /10,832,990,378 B** before later Markdown updates; compare 37 deletions ONLY. [Individual file audit](work-log/2026-10-31-chatgpt-r4-identical-samples-predelete-audit.md) / [merge receipt](work-log/2026-10-31-chatgpt-pr463-r4-identical-png-merged-resulting-main.md). No new CI or native physical test: **NOT RUN**. This is separate from the frozen 700 video/archive cohort: **32/700 retired, 668 HOLD unchanged**. Full native motion/audio acceptance remains OPEN.

The above PNG sample cleanup does **not** change the fixed 700 path/extension cohort, any original video/ZIP source provenance or the HOLD decisions. Historical sample paths remain reconstructable from the referenced pre-deletion commit.

**Separate CI944 derived-frame retirement (2026-10-31):** [PR464](https://github.com/MariosGiannakaras/Narro/pull/464), exact head `f65ce2911dc5fee01429407e745d0c38078ac984`, guarded squash-merged `ffd903eabce891c294f4968821aebc70431956b3`. 72 Git-SHA-identical derived PNG copies / **1,571,806 logical B** retired, while preserving **168 named frames (55 compact-entry /113 Focus Find), all 27 and 103 unique per-window blob contents**, boundary frames1–30 and115–120, every tenth frame, original native video four parts /157,799,345 B, SHA256/PTS/index, manifest and original case observations. Exact merge source checkout `truncated:false`: 19,000 blobs /11,104,017,829 B; evidence 17,161 blobs /10,831,418,572 B **before follow-on Markdown update**. [Individualized SHA mapping](work-log/2026-10-31-chatgpt-ci944-exact-review-frames-predelete-audit.md) / [immutable merge receipt](work-log/2026-10-31-chatgpt-pr464-ci944-png-merged-resulting-main.md). 72-only removal compare PASS, source/tests/reference untouched, CI/native NOT RUN for evidence-only `[skip ci]`. Original C4/Find/remaining native holds unchanged. This deletion is **outside** the frozen 700 video/archive cohort; **32/700 retired, 668 HOLD unchanged**.

No video/archive original of the frozen 700 cohort was removed by PR463/464; their additional 109 generated PNG retirements must **not** change the 32/700 numerator or protective 668 HOLD.

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

## Batch 3 original-retained remux review — before PR460 (2026-10-30)

**Analyzed as one source-original / derived-copy group before deletion:** targeted historical Narro PR357 and RA01/RA02 Windows capture packages. In both evidence families, the **original full MKV** remains published and byte-hashed, alongside the original structured evidence, direct screenshots, source/EXE/CI identities, native case results, immutable reports and any extracted critical-frame evidence. Only the optional MP4 playback **container copies** are candidates; these are not native executable builds or original Blitzit media.

| Exact removable playback-copy path under `work-log/evidence/` | Logical bytes | Verified producer/consumer/recovery boundary |
| --- | ---: | --- |
| `pr357-native-20261016/video/pa357-dual-screen-full.mp4` | 36,012,438 | `pr357-native-20261016/mp4-derivative-manifest.json`: `ffmpeg -map 0 -c copy -movflags +faststart`, same H264 **18,266** and AAC **14,270** packets vs retained `video/2026-10-16 02-21-53.mkv`, no re-encode or removed packet; MP4 container duration differs 18ms. `README.md` and `work-log/2026-10-16-pr357-native-four-item-acceptance.md` preserve **4/4 scoped accepted native claims**, image matrices, data/native observations, source SHA, exact raw original sha256 and structured ZIP. Keep the original MKV; old MP4 convenience link becomes historic Git-recovery reference. |
| `ra01-ra02-native-capture-20261019/video/RA01-streamcopy.mp4` | 1,033,676 | Original full `RA01-original.mkv` (998,885 B) remains. Frozen acquisition `README.md` documents H264/AAC **stream-copy with no reencoding**. `video-integrity.json` verifies original SHA256, decode and source duration. Later `docs/RA01_RA02_NATIVE_ANALYSIS_2026-10-19.md` explicitly analyzed the original film and the four native corrective families were accepted in `docs/RA01_RA02_FINAL_BUILD_NATIVE_ACCEPTANCE.md` via PR386/387. Structured original chronology/UIA/DB receipts and subsequent ROI review remain. |
| `ra01-ra02-native-capture-20261019/video/RA02-streamcopy.mp4` | 10,207,442 | As RA01, only a stream-copy MP4 convenience derivative. Retained full `RA02-original.mkv` (10,064,488 B), original SHA/decode provenance, actual 8,523 combined decoded-frame analysis of RA01+RA02, review extracts/PTS/corrections and final PR386/387 native acceptance. The old raw-acquisition `REVIEW_PENDING` text was superseded by the later authoritative 2/2 analysis and native correction, not blindly treated as still active. |

**Decision:** exactly **3 optional Narro MP4 remux paths / 47,253,556 logical bytes ELIGIBLE**, with corresponding full raw original **2+1 MKVs untouched** and protected, plus all report, frame/PTS/DB/log/source comparison/manifest evidence untouched. RA MP4 packet-count-by-packet verification is **not** newly performed: the existing OBS publication claims lossless stream-copy, and the already formally analyzed full original MKVs are the authoritative evidence. No claim that the SHA of a different container equals the raw MKV, or that these old CI successes close unrelated current PR389/419/437 native acceptance.

**Current pre-PR460 fixed cohort:** **28/700 removed**, **672 remain**; of these three more files admitted for retirement, **421 HOLD + 248 still REVIEW_REQUIRED**. All other items including PR357 original raw MKV, both RA originals, pointer-capture pending N10, PR389/419 compositor and PR437 Timer native originals, CI944/950/953/capture57 and all Blitzit sources are excluded. Recovery: the exact pre-deletion main commit must be recorded in the merge receipt and can restore all three optional MP4s with original paths. Historic `README` markdown links remain immutable evidence snapshots.

**ACTUAL PR460 RESULT (2026-10-30):** The previously blocked action was later retried as a permitted expected-head-guarded squash merge; GitHub returned `merged:true` with resulting-main SHA `982ab012131cabc141ffc0aeb395ac65426f462b`. Live PR460 now CLOSED / MERGED. Exact original-base-to-current-main GitHub comparison shows only three removed derivative MP4s plus documentation-only changes, and all 3 paths return NOT_FOUND at main. Full original MKVs are retained at their original paths in the recursive tree. The failed initial platform safety check is historically preserved in the prior immutable blocker log, not treated as an ongoing block.

**Fixed cohort now 31/700 retired; 669 remain = 421 HOLD + 248 REVIEW_REQUIRED.** The removal is exactly **47,253,556 logical B** (3 files). Frozen initial 700-path logical bytes 8,417,465,377; current 669-path cohort **8,214,460,223 B**. HOLD remains **7,753,783,922 B**; REVIEW_REQUIRED remains **460,676,301 B**. PR445–460 cumulative checkout retirement **19,332 paths /5,788,902,170 B**, without Git history rewrite. New CI/native tests NOT RUN (deletion-only `[skip ci]`). See [verified merge receipt](../work-log/2026-10-30-chatgpt-pr460-merged-resulting-main.md).


---

## Batch 4 — 223 additional paths protected after grouped review (2026-10-30)

**Post-PR460 current classification: 31/700 actually removed, 669 remain = 644 HOLD /8,156,054,545 B +25 REVIEW_REQUIRED /58,405,678 B.** The **223 paths /402,270,623 B newly moved from REVIEW to HOLD** are unchanged and remain checked into Git; no additional deletion or storage savings from review. Exact 20 family names, frozen baseline counts and consumer reasons: [immutable Batch-4 retention audit](../work-log/2026-10-30-chatgpt-cleanup-batch4-consumer-holds.md). In particular CI942's claimed original 422 MB raw video parts are absent from the current tracked Git tree; its 4 surviving clipped videos must not be removed just because the README historically says a full recording was captured.

**NEXT:** review the **25 remaining REVIEW_REQUIRED** paths one by one for possible original/copy elimination, with original source and current physical consumer proof before an allowlist. Protected 644 are not queued for deletion.

---

## PR461 exact merge — final current 700-cohort disposition (2026-10-30)

- [PR461](https://github.com/MariosGiannakaras/Narro/pull/461) exact head `6c2197f88ad4850cbfe397843c679bd21dbaa6de`, base `f5be70f7d2b79cd39aa72c26dde7feb1caf26a70`, expected-head guarded merge **`de08038f32acaf426ef54c1112ba3f01da63e8e5`**. Only exact `remaining-capture-intake-20261021/resumed-intake/executed-profile-protection-helpers.zip` removed, **2,420 B**. Exact identically hashed paused-intake helper ZIP and separate paused/resumed source/session/restore/manifest records remain; no native movie or Blitzit original altered. [Immutable merge receipt](../work-log/2026-10-30-chatgpt-pr461-merged-resulting-main.md).
- Resulting full Git tree `truncated:false` at merge SHA: **19,105 blobs /11,136,554,082 B**; `work-log/evidence/` **17,270 /10,863,992,007 B**. Source/test/reference Git tree SHA unchanged; after this dated merge receipt documentation-only commits add Markdown paths/bytes but do not change original release/candidate source. Historical baseline cohort stays exactly **700**, with **32/700 actually deleted** and **668 HOLD /8,214,457,803 B**; **0 REVIEW_REQUIRED, 0 currently eligible**. Last 24 from Batch 5 classified HOLD after inspection, not deleted. Fixed-cohort deleted logical B = **203,007,574**.
- PR445–461 cumulative checkout retirement **19,333 paths /5,788,904,590 B**. Git history untouched, no claim of shrinking Git object storage from the content-addressed duplicate. New CI/native Windows **NOT RUN**, archival-only `[skip ci]`; no product or physical PASS inferred.

**Cleanup conclusion:** The safe, currently reviewed deletion allowlist is exhausted. The remaining 668 are held for identifiable original/diagnostic/acceptance consumers. Reopen only when later validated source-owner/consumer retirement permits a new exact reversible allowlist or the user explicitly requests separately planned Git storage migration. Do **not** bulk remove HOLD simply to improve 32/700.

---

## Batch 5 — last 25 individual source/consumer reviews (BEFORE any additional deletion)

[Immutable pre-delete 25-path audit](../work-log/2026-10-30-chatgpt-cleanup-batch5-last25-predelete-audit.md) based on main `0355013fdd5edda36fc7192cc1006710d2cb9cab` and exact Git tree. All **25/25** formerly REVIEW_REQUIRED paths /58,405,678 B individually classified: **24 HOLD /58,403,258 B** (original source MKVs, raw-byte native provenance and unique diagnostic/reproducible ZIPs, no established safe replacement), **1 ELIGIBLE /2,420 B**: `remaining-capture-intake-20261021/resumed-intake/executed-profile-protection-helpers.zip`. Frozen SHA256 manifest and Git blob identify it as **byte-identical** to retained `paused-intake/executed-profile-protection-helpers.zip`; independent session metadata and evidence retained. No original capture or Blitzit media deletion permitted.

**Pre-deletion meter unchanged:** 31/700 removed; 669 tracked = **668 HOLD /8,214,457,803 B +1 ELIGIBLE /2,420 B**. After and only after a verified merge of the **single** proposed ZIP: 32/700 retired, 668 HOLD, 0 REVIEW_REQUIRED. Original Git blobs recoverable from this main ref; no remote object storage saving implied. Original README/manifest and older work logs unchanged.

---

## PR459 result — verified bulk deletion after the batch-two audit

- [PR459](https://github.com/MariosGiannakaras/Narro/pull/459) exact head `91f8fc095b15caf0da1c6e67bb6cd603269cf087`, expected-head guarded squash merge **`8b8192def280acc0afdffcb190e2aeabb73fa3ba`**. GitHub exact source base→head and base→merge comparison confirmed **3/3 approved ZIP paths removed, no other changes**. Original binary bytes recoverable from pre-deletion `main` `f33482fd4b6cc0e931721ad4262e66ed169ec3f4`; retained CI/source-native receipts provide hash and causal history.
- Exact resulting full recursive tree `truncated:false`: **19,104 blobs /11,183,775,973 logical B**, `work-log/evidence/` **17,274 /10,911,247,983 B**. All three deleted ZIPs absent. `reference/`/`src/`/`src-tauri/`/`tests/` unchanged by exact Git tree SHA; no source or test diff. Physical Windows and new source CI **NOT RUN**, commit `[skip ci]`.
- **FIXED COHORT PROGRESS 28/700 deleted /672 remain**: **421 HOLD /7,753,783,922 B** + **251 REVIEW_REQUIRED /507,929,857 B**. Of the original 8,417,465,377 B media ZIP cohort, **155,751,598 B** removed by PR458+459, **8,261,713,779 B** remain. PR445–459 cumulative checkout retirement **19,329 files /5,741,648,614 B**; historical Git object storage unchanged. The 700 baseline never changes. This latest current classification supersedes the earlier snapshot in the large folder table, which remains historically frozen.
- Original Narro CI failure/diagnostic screenshots, logs, native recordings, Blitzit source assets, PR389/419/437 current native evidence and original PA evidence retained. The three old CI failed runs remain historical FAIL; source-corrected exact successful runs validated archival obsolescence only.

**NEXT:** Audit specific remaining **251 REVIEW_REQUIRED** paths by actual source/acceptance consumers in grouped batches, and retire only a new explicitly proven allowlist. The **421 HOLD** group is not a deletion target without newer consumer closure.

---

## Historical PR458 progress checkpoint

**VERIFIED AFTER MERGE:** [PR458](https://github.com/MariosGiannakaras/Narro/pull/458) exact head `8338485c54e8da99e41f047382bc21ec0067b376`, expected-head-guarded squash merge `60844c254f37ee821388b417015be319b995e462`, **25/700 retired**, **675/700 remain**. GitHub exact compare: 25 removals and zero other changes. Post-merge full recursive Git tree `truncated:false`: **19,106 blobs / 11,190,388,083 B**, `work-log/evidence/` **17,277 / 10,917,872,285 B**. Full 700-item baseline cohort now has **675 files / 8,268,338,081 B**: **411 HOLD / 7,474,378,585 B**, **264 REVIEW / 793,959,496 B**; the removed 25 total 149,127,296 B. Every targeted old ZIP path is absent, all five preserved folder counts match **2/9/2/8/9** (30 provenance files). Unchanged exact Git trees: `reference/` `46dea0c640cbfc17003acf439d96f503a5c39410`, `src/` `715f8a0acc5bab9a170d3c55d683f3dcb64d0e90`, `src-tauri/` `d15e3d16751fee44dc494b406235e482011022c5`, `tests/` `229d81ddd95bfae21db7c05e60452e02ca1a0709`. CI/native NOT RUN (deletion-only `[skip ci]`), no code/feature/physical PASS. Cumulative verified retirements **PR445–458: 19,326 paths / 5,735,024,312 B** outside/including this batch; never add those 19,301 earlier removals to the fixed 700 baseline cohort. No shared Git history storage reclaimed.

**ONE NEXT:** Review the **264 REVIEW_REQUIRED** retained video/ZIP entries against named source/CI/native/physical/restart consumers, beginning with one dependency-independent family. Preserve **411 HOLD** until their named open claims are closed or exact replacement exists; none of the 675 may be removed solely to improve the 25/700 ratio. Protect original Blitzit sources across all directories and inside mixed ZIPs. Use another allowlisted reversible PR only after exact consumer eligibility is verified.
