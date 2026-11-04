# TEMPORARY — Narro evidence deletion progress (DELETE THIS FILE AT FINAL CLOSURE)

## Durable overall cleanup tracker — 1/5 (2026-11-04)

This **x/5 counter measures full-cleanup gates, not number of batches, paths or percentage of safely removable files**. It is authoritative across chats via GitHub; update it after a validated checkpoint and mirror the same exact counter in `HANDOFF.md`. Mark a stage DONE only when its stated gate is satisfied for the **entire** cleanup, not because one batch passed.

| Gate | Status | Completion condition |
| --- | --- | --- |
| **1/5 — Frozen technical inventory & protected scope** | **DONE** | All initial 15,690 evidence paths technically inventoried; original Blitzit, current acceptance/PR consumers, Git recovery rules identified. |
| **2/5 — Consumer/source and replacement disposition** | **IN PROGRESS** | Every remaining path has a justified RETAIN or specific removable/replaced consumer disposition; outstanding media source, native/physical gates and historical manifest gaps resolved or explicitly excluded with a demonstrated reason. |
| **3/5 — Final eligible deletion allowlist** | **PENDING** | Exhaustive explicit remaining removal list, individual or tightly justified family eligibility, path/size/blob/recovery and all protected exclusions verified; no safety-blocked operations. |
| **4/5 — All permitted deletion PRs merged** | **PENDING (one scoped PR476 complete)** | Every item on the final eligible allowlist removed via guarded PR and checked exact-head gates; blocked/held items remain retained and documented, never bypassed. |
| **5/5 — Resulting-main final verification and closure** | **PENDING** | Validate final tree, counters, consumer references, permanent receipts and tracked holds; only if entire cleanup really closed, remove this temporary tracker in the final verified commit. |

**Current durable summary:** **1/5**, technically checked **15,690/15,690** frozen paths; **15,662** surviving at latest verified deletion checkout; **20,941** historical deletions including **28** newly removed through merged PR476; fixed video/ZIP original cohort **117/700** deleted. Last confirmed main evidence deletion merge `b78cd2a3e4f8d3ccae1af697b710ee6c572fc3d7`. This is not a 100% deletion-safety audit. Prior 27-family /4,065-path bulk delete and ten-family /29-media composite were rejected by tool safety and must **not** be reattempted or circumvented. Original Blitzit is always retained. The single immediate action is **new, independently scoped source/consumer verification of potential retired Narro-generated duplicates outside refused operations**, then a guarded deletion-only PR only if proof exists.


**Owner:** ChatGPT cleanup. **Started:** 2026-10-31. **User instruction:** retain original Blitzit material and latest meaningful final/native case records, archive superseded generated Narro captures from active checkout, update this file at every verified batch, then **remove this file when the whole cleanup is completed and final main has been checked**. This tracker is NOT the permanent provenance/hand-off source; small immutable work logs and Git commits record historical recoverability.

## Verified starting point

- GitHub main `06eef1874055630d823bce56a8d3dd5a8d17fd77`, full Git tree `89e51d6f0439ab6fc51fc4daec1f7a9e154aef19`, `truncated:false`: **19,001 tracked blobs /11,104,029,015 logical B**, including **17,161 `work-log/evidence/` blobs /10,831,418,572 B**.
- Already retired (PR445–464): **19,442 paths /5,821,478,025 logical B**; this prior total is historical and must NOT be counted again. The original 700 cohort before this new scope had **32 deleted, 668 remaining HOLD**; the old conservative HOLD is now superseded for *older Narro-owned captures only*, never original Blitzit.
- Full-cleanup **completion status: IN PROGRESS**, not percentage-complete because remaining distinct original/source/case consumers must be classified, not guessed. Tracker is intentionally temporary.

## Bulk batch 1 — dated CI911/944/950/953 prior acquisition packets

**Fixed recovery base:** `06eef1874055630d823bce56a8d3dd5a8d17fd77` (whole old folders obtainable via Git at that commit). Original Blitzit and protected `reference/`, `src/`, `src-tauri/`, `tests/` excluded. Files are historical acquisition packages only; the newer Oct20–30 final native/PR artifacts remain intact. Older case findings themselves stay in top-level `work-log/*.md` and active live trackers; the older paths in those historical documents become Git-recovery addresses.

| Retired folder | Paths | Logical bytes | Actual state |
| --- | ---: | ---: | --- |
| `m7-ci911-20261004` | 342 | 102,672,298 | MERGED / VERIFIED PR465 |
| `m7-ci944-20261004` | 341 | 224,702,032 | MERGED / VERIFIED PR465 |
| `m7-ci950-20261005` | 93 | 261,118,607 | MERGED / VERIFIED PR465 |
| `m7-ci953-physical-20261005` | 266 | 455,290,710 | MERGED / VERIFIED PR465 |
| `m7-ci953-live-20261005` | 159 | 286,209,328 | MERGED / VERIFIED PR465 |
| `m7-ci953-continuous-20261005` | 100 | 226,657,661 | MERGED / VERIFIED PR465 |
| `m7-ci953-special-20261005` | 85 | 150,368,890 | MERGED / VERIFIED PR465 |
| `m7-ci953-dual-20261005` | 85 | 119,937,296 | MERGED / VERIFIED PR465 |

**Batch planned:** 1,471 files /1,826,956,822 logical B. **Actual deleted/merged this batch: 1,471 paths /1,826,956,822 logical B — PASS, PR465 exact-head guarded merged `7a78dbb264690d48a4f944071b7f0a84563d1f1a`**, not a claimed cleanup until PR exact-head merge and resulting-main tree PASS.

## Next

Execute only checked batch 1; record PR/head/merge SHA, actual resulting-main counts and current fixed-cohort (video/ZIP) delta. Then classify other dated Narro acquisition groups against newer final/source and open PR evidence. Update this tracker and handoff at each verified checkpoint. **Do not delete tracker while cleanup still IN PROGRESS.**

## Confirmed batch 1 resulting-main (2026-10-31)

- [PR465](https://github.com/MariosGiannakaras/Narro/pull/465) head `f6eb40d867c28bc70f3fc4e92c30d3aa6bbc2108`; expected-head guarded squash merge **`7a78dbb264690d48a4f944071b7f0a84563d1f1a`**. Full recursive Git trees `truncated:false` on both refs: **1,471 original-path removals /1,826,956,822 logical B**, **zero changed/added/non-allowlisted paths**. Important: GitHub comparison endpoint shows only its first 300 files, so deletion identity was verified using the **full recursive trees**, not a truncated compare list.
- Resulting main at merge SHA: **17,531 blobs /9,277,076,889 B**, evidence **15,690 blobs /9,004,461,750 B**. Markdown reconciliation after merge changes overall size slightly, not the archive deletion count.
- Original fixed 700 video/archive cohort: batch removed **85 paths /1,387,412,894 B**. Historical cohort current status **117/700 retired; 583/700 remain /6,827,044,909 B**, classification pending re-review under new explicit user retention rule. All original Blitzit protected; historical HOLD labels are not current user prohibition for superseded Narro captures.
- Cumulative checkout retirement since PR445: **20,913 paths /7,648,434,847 logical B** (including this 1,471; not proof of remote Git storage saving). [Permanent recovery/verification receipt](../work-log/2026-10-31-chatgpt-pr465-bulk-ci-archive-resulting-main.md).
- New app CI/native physical: **NOT RUN** (archival-only `[skip ci]`); source/acceptance previous findings unchanged.

**Next:** inspect remaining 2026-10-03..17 historical Narro capture folders and exclude genuine original Blitzit/canonical and the latest final evidence for open PRs. Complete in further verified grouped PRs. **Tracker remains until all selected cleanup is finished; then delete this exact file in final cleanup commit.**

## Batch 2 — prepared but **BLOCKED / NO DELETION** (2026-10-31)

- Selection: 27 superseded generated Narro evidence folders dated 2026-10-03–17, excluding original-Blitzit/canonical/source-comparison-looking files and explicitly latest named final captures. **4,065 paths /2,340,643,868 B** are **candidates only**, not deleted, and may require additional consumer assessment.
- Started branch `cleanup/archive-27-old-narro-capture-packets-20261031` from `d0f5cc586548fc8e1bfa6e19261708dd30e6365c`. The bulk deletion command was blocked by tool safety checks; live GitHub branch remains at the **same commit SHA** `d0f5cc586548fc8e1bfa6e19261708dd30e6365c` as main. **No tree mutation, commit, PR, merge or deletion occurred for batch 2.** Do not count these 4,065 paths or 2.34 GB as savings.
- Candidate counts by folder (read-only Git-tree inventory):

| Folder | Candidate files | Logical bytes | State |
| --- | ---: | ---: | --- |
| `pa01-08-20261013` | 350 | 469,052,463 | BLOCKED / NOT REMOVED |
| `ci1046-physical-20261008` | 310 | 293,597,216 | BLOCKED / NOT REMOVED |
| `pa351-native-20261014` | 103 | 268,327,516 | BLOCKED / NOT REMOVED |
| `pa354-native-20261014` | 108 | 177,295,540 | BLOCKED / NOT REMOVED |
| `pa355-native-20261015` | 131 | 155,022,261 | BLOCKED / NOT REMOVED |
| `pa353-native-20261014` | 62 | 101,998,124 | BLOCKED / NOT REMOVED |
| `m7-ci953-theme-20261005` | 412 | 99,027,660 | BLOCKED / NOT REMOVED |
| `pr362-native-20261016` | 238 | 81,362,634 | BLOCKED / NOT REMOVED |
| `m5-remaining-native-20261017` | 575 | 76,369,700 | BLOCKED / NOT REMOVED |
| `pa356-residual-native-20261015` | 123 | 66,678,707 | BLOCKED / NOT REMOVED |
| `m7-ci953-gaps-20261005` | 89 | 66,476,789 | BLOCKED / NOT REMOVED |
| `m7-ci953-interfaces-20261005` | 83 | 65,123,460 | BLOCKED / NOT REMOVED |
| `pa356-native-20261015` | 69 | 61,633,121 | BLOCKED / NOT REMOVED |
| `pa356-production-notification-20261015` | 27 | 52,389,565 | BLOCKED / NOT REMOVED |
| `m7-pr235-native-capture-only-20261005` | 41 | 50,759,632 | BLOCKED / NOT REMOVED |
| `m7-ci893-20261003` | 110 | 40,373,685 | BLOCKED / NOT REMOVED |
| `m7-ci950-loading-20261005` | 239 | 27,442,705 | BLOCKED / NOT REMOVED |
| `pr364-native-20261017` | 286 | 26,445,683 | BLOCKED / NOT REMOVED |
| `m7-ci953-layout-20261005` | 47 | 24,668,551 | BLOCKED / NOT REMOVED |
| `pa356-keyboard-diagnostic-20261015` | 51 | 23,317,479 | BLOCKED / NOT REMOVED |
| `m7-ci953-browser-shortcut-20261005` | 36 | 22,176,939 | BLOCKED / NOT REMOVED |
| `m6-quick-native-20261017` | 210 | 21,723,959 | BLOCKED / NOT REMOVED |
| `pa353-nsis-native-20261014` | 28 | 16,541,979 | BLOCKED / NOT REMOVED |
| `pa353-msi-native-20261014` | 30 | 14,915,410 | BLOCKED / NOT REMOVED |
| `m7-ci884-20261003` | 57 | 14,251,640 | BLOCKED / NOT REMOVED |
| `2026-10-03-m7-ci873-c5-completed` | 209 | 13,415,190 | BLOCKED / NOT REMOVED |
| `pa356-notification-review-20261015` | 41 | 10,256,260 | BLOCKED / NOT REMOVED |

**Current VERIFIED progress remains batch 1 only:** 1,471 files /1,826,956,822 B newly removed in PR465; cumulative historical retirements PR445–465 = 20,913 files /7,648,434,847 B; frozen original 700 cohort **117 retired, 583 remain /6,827,044,909 B**. Full cleanup **IN PROGRESS**, temporary tracker **must remain**. Resolve the blocked write by an explicitly permitted workflow rather than reissuing or bypassing the safety block. Neither pending candidate list nor an empty branch implies cleanup.


## Combined full-scope eligibility review — 2026-11-03

- User requested all remaining review steps together and only genuinely safe deletion. Full technical inventory **15,690/15,690** still matches frozen evidence Git tree `6f3cbe1417f822d415287c9116cc2ef1260a269e` on current main; **20,913 historical deletions, 0 new deletions**.
- [Exact 163-family retention/deletion eligibility register](../work-log/evidence-cleanup-review-20261101/whole-checkout-consolidated-retention-deletion-gate-20261103.json): **0 path-specific approved deletions** after joining 103 ZIP, 429 media, source/frame records, active PR consumers, and 2,755 surplus identical-Git-blob path occurrences. Duplicate blobs do not by themselves retire timeline paths, original source, physical acceptance, ZIP containers or consumer references.
- Prior 27-folder /4,065-path bulk deletion safety block and ten-family /29-media README-composite tool block remain. Neither was retried or bypassed. Source parity and original Blitzit evidence remain protected. Separate frozen 700 cohort **117 retired /583 currently retained**. No CI, Windows/AppData, source/test changes or guarded deletion PR/merge occurred.
- **STATUS: NOT READY FOR SAFE MASS DELETE; TEMP TRACKER MUST REMAIN.** To unlock any distinct future deletion batch, first obtain exact unblocked-path, source/replacement and current-consumer retirement proof; then perform guarded PR and resulting-main validation. Do not represent unapproved candidates or unexecuted actions as deleted.


## New bounded permitted PR476 deletion — 2026-11-03

- Unrelated to previously safety-blocked 27-folder operation, independently reviewed **28 exact SHA-identical older Narro PR228 headless static PNGs**, 223,499 checkout B; each removed `*-reduce-*` image has an exact retained `*-no-preference-*` Git blob/size/published SHA256 counterpart. 28 unique PNG visual contents, 8 scenario result records, logs, provenance and original manifest retained.
- [PR476](https://github.com/MariosGiannakaras/Narro/pull/476) head `7bd7ca91d65f1443a712cfca5bc3123d7f5feb9c` guarded squash MERGED at `b78cd2a3e4f8d3ccae1af697b710ee6c572fc3d7`. Exact resulting-main tree matches verified deletion-only tree; 28 removed, no added/modified/other-family paths. [Immutable validation receipt](../work-log/2026-11-03-chatgpt-pr476-pr228-identical-static-png-resulting-main.md). Evidence-only `[skip ci]`: CI/native **NOT RUN**, no acceptance outcomes changed.
- **Current surviving evidence 15,662 paths /9,004,238,251 B. Total verified historical checkout retirements 20,941 paths /7,648,658,346 B**, including **28 newly removed in PR476**. Fixed original media+ZIP cohort remains **117/700 removed, 583 retained**, since PNG deletions lie outside that frozen cohort. Initial 15,690/15,690 technical inventory was the old surviving baseline and is not the new active surviving count.
- Earlier consolidated 163-family [no-approved-path assessment](../work-log/evidence-cleanup-review-20261101/whole-checkout-consolidated-retention-deletion-gate-20261103.json) is a dated **pre-PR476 snapshot**, superseded only for these 28 independently justified and successfully merged PNGs. Remaining media/native/ZIP/Blitzit source and safety-blocked operations are unchanged; no further mass deletion eligibility has been demonstrated. **FULL CLEANUP STILL IN PROGRESS; DO NOT REMOVE THIS TRACKER.**
