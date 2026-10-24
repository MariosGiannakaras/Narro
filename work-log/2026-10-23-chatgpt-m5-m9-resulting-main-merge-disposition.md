# 2026-10-23 — Verified M5 and M9 source merge disposition (immutable)

## Scope and owners

- Owner: ChatGPT source/tests/CI. Native Win32 visual acceptance: Windows/Codex operator when accessible; **NOT RUN** for current PR389 candidate. User standing instructions permit routine native PA checks; missing operator access is not a permission hold. Optional M11/M12 remain dormant.
- Independent M5 and M9 technical fixes do not modify Spectrum Core Create/Edit List picker, image upload, 218 local icon library, source-equivalence claims, data storage layout, or PR389 compositor implementation.

## M5 closed source / not physical milestone

- [PR412](https://github.com/MariosGiannakaras/Narro/pull/412), validated exact source `8301714b928b19b83bebfce4cd7d57a658285ad8` [CI39911898432](https://github.com/MariosGiannakaras/Narro/actions/runs/39911898432): validation/fast/Windows 3/3 **PASS**.
- Guarded squash merge `f953acf817c6acd90e9991d88d1a762f8ccb5747`, PR-head vs merged-source+CI blobs 6/6 MATCH.
- [Resulting-main CI39914641544](https://github.com/MariosGiannakaras/Narro/actions/runs/39914641544) all three jobs **COMPLETED SUCCESS**. This does not evidence native Board dragging/DWM acceptance or full M5.

## M9 closed PR implementation / resulting-main still running

- [PR413](https://github.com/MariosGiannakaras/Narro/pull/413), validated exact source `ec787383d7f3c8b62b553dfa01cd10b48a55e5b6`, [CI39915437015](https://github.com/MariosGiannakaras/Narro/actions/runs/39915437015) all 3 **COMPLETED SUCCESS**.
- Fast FAILs on intermediate [39914946670](https://github.com/MariosGiannakaras/Narro/actions/runs/39914946670) and [39915178953](https://github.com/MariosGiannakaras/Narro/actions/runs/39915178953) were actual source-extracted test-harness incompatibilities; code preserved original authoritative write lookup and extended existing retry harness with former/current request coverage, without disabling tests. Those historical runs remain FAILED.
- Expected-head guarded squash merge `cdaf85b3c20028a78d17f75f5700e652e7147f7e`; independently checked all 6 changed `package.json`, `src/ReportsSessions.tsx` and four test file blobs match exactly PR-head/merged-main. [Resulting-main CI39921466242](https://github.com/MariosGiannakaras/Narro/actions/runs/39921466242) **RUNNING** (validation PASS, fast RUNNING at log freeze; Windows candidate PENDING), no resulting-main PASS asserted.
- Source M9 fix: retained prior Reports response cannot be rendered under newly committed filter; prior task detail cannot render when task identity selection changes. All actual native sessions/filter/timezone interaction tests are still separate.

## Current highest-priority unblocked next action

- Check **only** PR413 resulting-main CI39921466242 when it resolves; on failure inspect first failed job, do not merge/ignore failure; on success mark resulting-main 3/3 PASS in active trackers. Then resume separate PR389 exact artifact `12467730680` physical normal/reduced eight-case desktop review with appropriate native operator. Until captured, PR389 remains **OPEN/DRAFT/PHYSICAL_BEFORE_MERGE**, current native 0/8 NOT RUN.
- No physical Windows test executed by this agent. Mandatory accepted milestone count stays **4/10** (M1–M4). Do not treat merges or automated successful CI as milestone physical acceptance.
