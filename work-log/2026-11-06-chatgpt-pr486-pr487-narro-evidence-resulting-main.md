# PR486 + PR487 — user-authorized Narro evidence retirement; resulting-main verified

**2026-11-06 / ChatGPT cleanup / MERGED AND VERIFIED ON RESULTING MAIN.**

## Updated user instruction and boundaries

The user expressly superseded the previous retention of Narro's old physical recordings: **delete Narro historical evidence, preserve the authentic original Blitzit evidence, and record the currently open physical acceptance checks anew**. This authorizes retirement of stale Narro evidence; it does **not** establish new Windows acceptance PASS. Source code, tests, app configuration, user AppData, and original `reference/` Blitzit materials were not modified. Original raw Blitzit video directory `reference/original-blitzit-videos/` and its README were retained (README Git blob `94d5eb572d1c5382e262aa4505afb50ce55f5615`).

## PR486 (7 Narro root screenshots)

- [PR486](https://github.com/MariosGiannakaras/Narro/pull/486), full independent [predelete exact seven files+SHAs and lengths](2026-11-06-chatgpt-user-authorized-all-narro-evidence-root-seven-predelete.json). Deleted only 7 dated CI191/CI624 Narro-generated PNGs from `work-log/evidence/` root, **403,742 logical B**.
- Expected head `44406f796b52694b593efecd7b692acd034df9a9`, guarded squash merge `6ac9d2e88b62df55cb7f43e5fb66c4083ad59276`. Actual resulting main was confirmed, parent-to-resulting compare showed **exactly 7 removals, 0 other changes**.

## PR487 (134 historically Narro-generated families)

- [PR487](https://github.com/MariosGiannakaras/Narro/pull/487), parent/previous main `6ac9d2e88b62df55cb7f43e5fb66c4083ad59276`, exact one-commit head `64abbabacd3eb19817bc03c95e302ac094b11910`, expected-head guarded squash merge `3c2863f8a6853daaf7477f4825baf21b3cabf5e9`. **Fresh main ref exactly matched the resulting merge**.
- The independent source [163-family frozen census](evidence-cleanup-review-20261101/whole-checkout-consolidated-retention-deletion-gate-20261103.json) supplied exact `work-log/evidence/<family>` deletion boundaries: **134 named nonpreviously-blocked directories**, comprising 126 older unresolved-consumer groups and 8 original active-PR consumer groups, all Narro historical evidence. User expressly permitted new physical acquisition, so former Narro physical-consumer holds no longer prohibit retirement. No original Blitzit source or `reference/` path was included.
- The Git Trees API removed exactly these 134 directory entries via `sha:null` on the parent root tree. **Expected root Git tree `51acf67bd746c311737ea7a2994a1a0d17e5ac11`.** Independently reconstructing root tree with an unchanged `HANDOFF.md` blob from the candidate head returned **the identical root SHA**. The guarded PR was merged, and **reconstructing the resulting-main root tree against its own unchanged `HANDOFF.md` blob again yielded exactly the same root SHA**. This whole-tree identity proof, not a capped file list, establishes no extra code, config, original Blitzit, or unrelated path modifications.
- GitHub compare presents **only the first 300 changed files**; those are all removals, but a 300-file comparison **must not be mistaken for a complete list**. Full deletion count instead comes from a frozen family inventory reconciled against every subsequent verified smaller PR path removal, with resulting full Git-tree identity confirming the *exact specified family-boundary operation*.
- Frozen selected family totals: **11,612 paths /6,662,078,338 B**. Previously deleted from those families by PR476/479/480/481/482/483/484/485: **64 distinct PNG paths /681,277 B**. **Net PR487 checkout retirement: 11,548 paths /6,661,397,061 logical B.** All deleted bytes remain in Git commit history; this is not a claim of Git remote space reclaimed.

## After both verified merges

- At original frozen technical inventory: **15,690/15,690** paths technically inventoried.
- Prior to this request: **15,626** surviving evidence files / **9,003,780,473 logical B**, **20,977** historical checkout retirements / **7,649,116,124 B**.
- PR486 and PR487 together: **11,555 additional paths /6,661,800,803 logical B** removed.
- **After PR487 on real main: 4,071 `work-log/evidence/` paths /2,341,979,670 logical B remain. Historical total checkout retirements 32,532 paths /14,310,916,927 logical B.**
- Remaining precisely reconcile to frozen census: **27 previously tool-safety-blocked families /4,065 files /2,340,643,868 B**, plus **two unmodified source-comparison families** (`pa353-source-comparison-20261014` and `pr358-residual-source-compare-20261016`) /6 files /1,335,802 B that may contain authentic Blitzit-source comparison material. Both are **intentionally retained** until original attribution proven. The earlier 27-family/4,065-path deletion was explicitly blocked by tool safety; it was **not retried or bypassed** by PR487. The separate ten-family/29-media composite denial was likewise not retried.
- Original fixed **700 video/ZIP historical cohort** was previously at 117 deleted /583 retained. **Its new removal count was NOT reverified path by path after this bulk operation** and must be treated **RECONCILIATION PENDING**, not repeated as the current status. Full evidence checkout path and logical byte totals above are verified by source census subtraction + exact resulting Git tree.
- No new exact Windows/native acceptance, CI execution, source Blitzit parity or physical recording was performed. Archival PRs use `[skip ci]`. All previously open physical test cases remain **OPEN / NEW RECORDING REQUIRED**, not PASS.

## Remaining work and blockers

- Do **not** reissue or work around previous tool-safety-denied 27-family bulk deletion or ten-family/29-media composite. These remaining Narro checkout paths are an explicit blocking condition; do not declare complete. Keep two ambiguous comparison families until verified they contain no original Blitzit source.
- The temporary five-gate progress document remains because all source/consumer/original-disposition and final closure criteria are not satisfied; its earlier cumulative-counter update was safety blocked and should not be retried. Keep active `HANDOFF.md` and permanent immutable receipts authoritative for current counts.
- Any new physical tests require a new user-authorized, dedicated capture session; **do not launch Windows Narro or alter AppData from this cleanup**.

**Verified resulting-main evidence tree target:** `51acf67bd746c311737ea7a2994a1a0d17e5ac11`, **PR487 merge:** `3c2863f8a6853daaf7477f4825baf21b3cabf5e9`.
