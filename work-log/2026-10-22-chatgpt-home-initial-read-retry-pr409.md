# 2026-10-22 — Home initial-read failure and in-place Retry

**Owner:** ChatGPT, nonphysical frontend. User continued existing parallel implementation and requested up-to-date stage table. Latest accepted main source was at `7bf00e544396f41123918f2a7385ca13efe6f69e` when branch created.

## Accepted preceding evidence (no duplicate work)
- #401–#405 source already merged, accepted with exact-head 3/3 CI; latest combined resulting-main push run `39755456824` at merge `86e5a8746608f55d4062ea79e9470ef931ebfede` **3/3 SUCCESS** (validation, fast, Windows). Separate scheduled run `39755601891` also SUCCESS.
- #389 Timer/Panel compositor physical **4/8 transitions FAIL** despite old green automation. PR344 other-owner physical checklist. No new physical Windows PASS claimed.
- Mandatory milestone counter **4/10 accepted**. Optional M11/M12 dormant. Protect Spectrum Core list editor picker, image upload, 218 offline icons.

## Confirmed issue
`src/HomeDashboard.tsx`: initial `get_home_snapshot` failure explicitly resets snapshot to null and shows blocking `Home data could not be loaded`, but offers **no same-screen Retry action**. The read effect reran only when external `refreshKey` changed (e.g. navigate away/back), conflating recovery with unrelated navigation. This is a UI recoverability gap, not a corrupt/empty database diagnosis.

## New scoped fix and exact provenance
- [PR409](https://github.com/MariosGiannakaras/Narro/pull/409), branch `fix/home-initial-read-retry-20261022`, exact head `a7c661be8b8e19e3f1de2cd948aecf78954ce38b`.
- Changed `src/HomeDashboard.tsx`: add component-local `retryKey` in authoritative native effect dependencies. Only on explicit error Retry, reset displayed error and failed snapshot, increment key. Render existing loading branch while retry pending; success displays true successful empty-state or cards. Retains effect disposal guards for stale previous reads.
- Changed `src/homeDashboard.css`: small theme-token-based accessible Retry styling; no arbitrary color values, list card visual grammar untouched.
- New `scripts/test-home-read-retry.mjs`: deterministic VM/transpiled **actual HomeDashboard React component** mount; real effect/read/retry event with deferred promises; asserts read FAIL != empty, retry exactly once, loading, successful true-empty, obsolete request completion ignored after refresh, disposed response ignored, visual fixture does not hit SQLite.
- Changed `scripts/test-ui-home-dashboard.mjs`: import regression in existing mandatory frontend preflight.

## Current observed validation
- PR409 exact-head Windows CI **run `39762426352` QUEUED**, with `validation-gate` **SUCCESS**, `fast-gate` **QUEUED** and Windows not yet started in last status. Neither fast nor Windows PASS asserted.
- PR409 GitHub currently reported `OPEN/MERGEABLE` at the inspected head. Do **not** merge before all 3 gates PASS on the same exact head; on FAIL read first failed job/step/log and correct on this existing branch.
- Once 3/3 PASS, merge with expected-head SHA guard and verify changed-file blobs in resulting main. Resulting-main CI and physical acceptance are distinct.

**ONE NEXT SAFE ACTION:** Check final verdict of PR409 run `39762426352` after natural completion; if FAIL diagnose first failing step, if 3/3 PASS guarded merge and verify affected main files. Continue unrelated evidence-backed source audits without idle polling.