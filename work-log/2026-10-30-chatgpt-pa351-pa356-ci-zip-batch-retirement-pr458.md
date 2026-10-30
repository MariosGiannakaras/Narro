# PR458 bulk evidence cleanup — five PA CI build-package sets (2026-10-30)

**Owner:** ChatGPT evidence checkout cleanup. **Scope:** 700-file fixed video/archive cohort, consumer-first review followed by one bulk allowlisted reversible deletion. No production application/config/test changes, CI workflow changes, native Windows operation or protected Blitzit media changes.

## Analysis-first checkpoint

1. Baseline exact `main` `60b310c19e626150ec864fb8180defd76c83ed07`: full recursive Git tree `truncated:false`, **19,130 blobs / 11,339,502,106 B**, evidence directory **17,302 / 11,066,999,581 B**. Identified **700** tracked evidence video/archive paths (559 video files 7,698,063,841 B plus 141 compressed archives 719,401,536 B) in **114** top-level evidence families. This is an extension/path cohort, not a finding that all are obsolete, Narro-owned or safe to delete.
2. **Analysis before deletion** was committed as [live cohort inventory](../docs/EVIDENCE_CLEANUP_INVENTORY.md) on `main` `c5f7a5df528567c184001dc6bb6bbef15648840b` before PR458 was opened. Classification: **25 ELIGIBLE /149,127,296 B** (5 exact old Narro CI build-package sets), **411 HOLD /7,474,378,585 B**, **264 REVIEW_REQUIRED /793,959,496 B**. HOLD means conservative protected old acceptance/review evidence; REVIEW means unknown eligibility, **not automatic deletion**. All original Blitzit assets protected by provenance even if the filename/location suggests an old Narro artifact.
3. Individually identified and checked the five eligible families and their original CI manifests plus PA351/353/354/355/356 native report and final PA01–08 review:
   - `pa351-exact-ci-20261014/`: CI38521066086, historical PA351 audio/C5 scoped PASS and old entry/Reports FAIL followed by later PA353–356; **5 ZIPs /29,624,185 B**.
   - `pa353-ci-20261014/`: CI38558587191, historical scoped entry/scroll PASS and newly found tooltip issue followed by PA354; **5 ZIPs /29,755,108 B**.
   - `pa354-ci-20261014/`: CI38614321520, historical tooltip PASS and picker/PDF issues followed by PA355/356; **5 ZIPs /29,788,105 B**.
   - `pa355-ci-20261015/`: CI38630226135, historical scoped picker/prefs PASS and PDF/Escape findings followed by PA356; **5 ZIPs /29,987,629 B**.
   - `pa356-ci-20261015/`: CI38688646540, historical PA356 targeted 2/2 group PASS and final PA01–08 bounded acceptance; **5 ZIPs /29,972,269 B**.
4. Each folder's exact deleted names are **only** `fast-frontend-dist.zip`, `focus-runtime.zip`, `physical.zip`, `validation.zip`, `visual.zip`. Exact legacy CI source/run/artifact manifests, verification receipts, immutable native reports, accepted/failed case histories and PA351–356 original capture recordings remain. Older CI build ZIPs are not required exact binary candidates for currently held PR389/419 compositor or PR437 Time Taken/Timer tests. Historical publication/identity references to the old ZIPs are retained as dated provenance and recoverable from Git history, not modified to pretend files remain current. Mixed archives and original Blitzit sources were not included. Original archived ZIP bytes were not fetched/decompressed afresh; frozen CI artifact manifests and historical verification are cited rather than inventing new CRC PASS.
5. Rejected mass deletion for current held CI944 unique 46-minute raw motion (unreviewed in full), CI950/CI953 review-pending motion, capture57 partial acquisition, PR389/419/431/436/437 native/compositor/Timer candidate recordings, PA351–356 accepted original native films, CI1046/mixed archives and any original Blitzit source. Additional unclassified video/ZIP members are REVIEW_REQUIRED, not allowed deletion targets.

## Exact deletion / resulting main

- [PR458](https://github.com/MariosGiannakaras/Narro/pull/458), branch `cleanup/retire-five-pa-ci-archives-20261030`, base analysis commit `c5f7a5df528567c184001dc6bb6bbef15648840b`, deletion head `8338485c54e8da99e41f047382bc21ec0067b376`.
- GitHub base→head **PASS:** exactly **25 `removed` paths**, all within the five specific CI directories and five specific ZIP basenames. Zero other changes. Expected-head guarded squash merge **`60844c254f37ee821388b417015be319b995e462`**; PR reports MERGED, `main` exact SHA matched immediately afterward.
- GitHub base→resulting-main **PASS:** exactly same 25 removed paths, no source/docs/test/workflow changes by PR, `[skip ci]`.
- Exact resulting-main full Git tree `truncated:false`: **19,106 blobs / 11,190,388,083 B**; `work-log/evidence/` **17,277 / 10,917,872,285 B**. The prior analysis Markdown addition explains why total tree arithmetic vs pre-analysis baseline includes an extra document. The fixed media+ZIP cohort became **675 files /8,268,338,081 B**. Targeted 25 old ZIPs **all absent**. All 30 remaining provenance/manifest/proof files are present across five families (folder counts 2/9/2/8/9).
- Protected Git directory SHAs **unchanged**: `reference/` `46dea0c640cbfc17003acf439d96f503a5c39410`; `src/` `715f8a0acc5bab9a170d3c55d683f3dcb64d0e90`; `src-tauri/` `d15e3d16751fee44dc494b406235e482011022c5`; `tests/` `229d81ddd95bfae21db7c05e60452e02ca1a0709`.
- **Recovery:** All 25 original paths and full binary bytes are accessible from pre-deletion analysis commit `c5f7a5df528567c184001dc6bb6bbef15648840b`. Use preserved family-specific `artifact-manifest.json`/verification hashes. No Git history rewrite or byte reclamation claim for repository objects.
- New validation/fast/Windows source CI **NOT RUN** (archival-only `[skip ci]`), native PA **NOT RUN**, and no feature/Blitzit/source parity result changed.

## Durable fixed-denominator progress

| Cohort | Deleted | Remaining | Decision |
| --- | ---: | ---: | --- |
| **700 fixed video/archive baseline paths** | **25/700** | **675/700** | Only 25 of 700 were proven unnecessary; do not equate the other 675 to removable |
| Known currently held/review-dependent families | 0 | 411 | HOLD until independent consumers close |
| Other not-yet-audited candidate media/ZIP paths | 0 | 264 | REVIEW_REQUIRED; not currently authorized for retirement |
| Five CI packages audited in this batch | 25/25 | 0 | DONE |

Cumulative prior PR445–457 verified historical retirements **19,301 files /5,585,897,016 B**; after PR458: **19,326 files /5,735,024,312 B** retired from current checkout. This is not the 700 denominator and does not imply shared Git storage has shrunk by that amount.

**Next single unblocked action:** continue grouped consumer assessment of the remaining **264 REVIEW_REQUIRED** paths in [live ledger](../docs/EVIDENCE_CLEANUP_INVENTORY.md), selecting exact independent families for the next bulk retirement. Maintain 411 HOLD, active PR389/419 native 8/8 gates, PR437 native OPEN, PA-01–09 missing cases NOT RUN, M1–M4 4/10 accepted, M5–M9 OPEN, M10 gated, M11/M12 dormant.
