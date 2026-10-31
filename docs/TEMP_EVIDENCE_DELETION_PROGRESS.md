# TEMPORARY — Narro evidence deletion progress (DELETE THIS FILE AT FINAL CLOSURE)

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
