# 2026-10-28 — M5–M9 59 unchecked documentary cells, native PASS exclusion reconciliation

**Scope:** read-only GitHub source/acceptance evidence reconciliation and documentation update; no code/test/CI/PR-head changes, merge or Windows execution. Owner ChatGPT source audit. Main prior f1cdd0a325ba6a067daa86884e6d286a521e4a97. PR437 remains DRAFT/OPEN head 41e8ff8ad8584b74821f3185401ed0c9740fc991 CI40677357491 3/3 PASS.

**Cause:** earlier user-facing tally of 59 unchecked M1–M9 milestone cells was incorrectly useful as a count of unfinished tasks. Previous canonical [57-cell review](../docs/M5_M9_OPEN_PREPHYSICAL_RECONCILIATION_2026-10-27.md) covers M5 6/M6 13/M7 18/M8 9/M9 11. Live M8 has two additional U-R04/U-R05 unchecked acceptance rows (11), bringing documentary total to 59. Source already implements U-R04/U-R05 on PR431 exact head 3c3b72b06eaa841bce9429dace83a6b5c33ba701 CI40573065951 3/3, and PR431 is an ancestor of PR437 (GitHub compare 48 ahead, 0 behind). This does not prove native target mapping.

**Evidence deliberately removed from actionable repeat queue:**
- PR431 [physical V01–V09](../docs/PR431_PHYSICAL_VERDICTS_2026-10-27.md): 9 scoped PASS on old 6dce8daa / PE4acd49ce. V10 old physical FAIL; replacement cold-unavailable native NOT RUN.
- PR437 [native 2fc7881c packet](evidence/pr437-native-20261028/README.md): J02 connected per-monitor thumbnail PASS scoped; J05 same-host/endpoints/paused task identity PASS scoped but continuous first-frame **FAIL** separately; J06 once-only Done→Next/eventual task PASS scoped but immediate interleaving not proven.
- [Initial first-paint physical sample](evidence/pr437-first-paint-20261028/README.md): full and quick Preferences structured skeleton→ready PASS scoped in reduced motion, no general flicker or retry verdict.
- Existing merged source/PR CI and immutable source-ledger evidence retained; no further source implementation inferred from 59.

**What remains:** six nonduplicative work families enumerated in the amended existing reconciliation: corrected PR437 U-R03/J01/J05 native; J03/J04 real HDMI and impacted U-R04/U-R05 absent/failure variants; independent PR389/419 native 8-case compositor holds; dependent PR431/436/437 affected-only acceptance and integration; only missing M5/M6/M8/M9 parity/state acceptance; separate running Time Taken live display triage requiring runtime/checkpoint safe accounting before any fix. Physical windows new executable NOT RUN and PA-01–09 USER-PAUSED under active project instructions. A historical PASS can only be carried forward when source-impact analysis supports it; previously observed old-EXE FAIL remains historically FAIL.

**Validation:** checked live GitHub PR heads 389 ec9227a2, 419 6a72cf56, 431 3c3b72b, 436 3561597d, 437 41e8ff8a; GitHub compare PR431→PR437 48/0 and PR436→PR437 33/0; source work log, old physical verdicts, original first-paint and native packets. This is documentation/evidence validation only, **not** automated test or native acceptance.

**ONE NEXT:** authorized exact PR437 executable native U-R03/J01/J05 narrow protocol; log separate verdicts, then only causal corrections on PR437 and new exact CI as needed; maintain A/B and downstream physical before merge. Do not retest prior accepted unrelated subclaims.
