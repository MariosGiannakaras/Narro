# PR488–489 — remove four derived helpers, preserve authentic Blitzit stills

**2026-11-06 / ChatGPT cleanup / MERGED AND RESULTING-MAIN VERIFIED.**

After the user's explicit updated retention rule (keep only authentic Blitzit source; re-record pending Narro physical tests), the two previously conservatively held source-comparison families were inspected at exact current paths without touching original Blitzit evidence.

## Source classification
- [PA353 direct-source comparison report](2026-10-14-pa02-existing-capture-source-comparison.md) explicitly describes `pa353-source-comparison-20261014/source-entry-contact.jpg` as a **derived** comparison contact, accompanied by a helper Python script and derived Narro geometry JSON. The authentic original `Blitzit Tutorial Blitz Mode.mp4` is documented separately in the raw Blitzit source corpus under `reference/`; the source-comparison contact is not the raw original.
- [M5 residual source comparison](2026-10-16-m5-three-residuals-and-batched-recapture-plan.md) describes original reference VE005 frames for Blitzit; **`pr358-residual-source-compare-20261016/VE005-0070.png`** and **`VE005-0074.png`** are **retained** as canonical Blitzit-source stills. Verified their current Git blob IDs on post-PR489 main: `c4cbb940e4f7fa9a253afc289203575e2f9e1919`, `11ad80039397a246157bee950254f37d308addf4`. Original `reference/` and all raw videos remain unaffected.

## PR488
- [PR488](https://github.com/MariosGiannakaras/Narro/pull/488) exact head `06b6952c4ca9926fc0788597ad8fa11c4a69eb61`, guarded squash merge `788c0694dfb68c1c661eef801d5ebace11a5ca73`.
- Exactly three paths removed after comparing parent `ad0bb8ce0d6c7d2fdac52582885c013d1d8844a8` against head and PR: `pa353-source-comparison-20261014/compare-entry-source.py` (1,336 B), `pa353-source-comparison-20261014/source-entry-native-geometry.json` (963 B), and `pr358-residual-source-compare-20261016/manifest.json` (284 B). **3 paths /2,583 logical B**, no original Blitzit image or source code path modified.

## PR489
- [PR489](https://github.com/MariosGiannakaras/Narro/pull/489) exact head `29dd2ca889fe85b228579f87792e04a1481eadb6`, guarded squash merge `97cc2781ca1cf7dc2fca35c94b8cedf45dd368f9`. Independently checked actual resulting main equals this SHA and parent-to-result comparison reported exactly the single deletion `pa353-source-comparison-20261014/source-entry-contact.jpg` /958,757 logical B.
- The two original Blitzit VE005 stills were explicitly fetched and their SHA identity verified on resulting main; both remain. No source code/Windows/AppData/tests changed; `[skip ci]`, CI/native/physical **NOT RUN**.

## Verified current checkout counters

- Pre-PR488: **4,071** evidence paths / **2,341,979,670 B** current checkout.
- PR488+489: **4** derivative evidence paths / **961,340 logical B** newly retired.
- Current: **4,067 evidence paths /2,341,018,330 logical B**; historical cumulative checkout retirements **32,536 paths /14,311,878,267 logical B**. These are logical checkout bytes, not claimed Git remote storage reclaimed.
- Remaining independently reconciles to **27 previously tool-safety-blocked Narro evidence family subtrees /4,065 paths /2,340,643,868 B** plus **two authenticated Blitzit-source VE005 stills /2 paths /374,462 B**. No other `work-log/evidence/` source files remain after the verified changes, based on original frozen census, all intervening exact-change receipts, and PR487 full-tree proof.
- The 27-family/4,065-path bulk removal and ten-family/29-media composite were previously refused by tool safety; **not retried or bypassed** here. Final full-cleanup stages remain incomplete while those protected blockers persist. Earlier 700-member video/ZIP cohort needs a member-level recount before restating its current numerator. Pending Windows acceptance needs **new capture**, not automatic PASS.
