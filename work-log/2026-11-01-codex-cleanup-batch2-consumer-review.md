# Batch 2 evidence cleanup: focused consumer review (2026-11-01)

Read-only review against main f443bcb380735d1d550f258f8f2620bdac0f8aca. Batch 2 remains BLOCKED: 27 candidate folders / 4,065 paths / 2,340,643,868 logical bytes are a candidate inventory, not a file-by-file deletion allowlist. No deletion, CI, native test or source change was performed in this review. The existing safety rejection must not be bypassed.

## Findings

- `pa01-08-20261013`: [PA01-08 report](../docs/WINDOWS_PA01_08_REPORT_2026-10-13.md) directly cites its frozen acquisition, complete two-monitor recording, clips and raw sidecars. Determine the current consumer and exact replacements/recovery plan per asset before any removal; folder age alone is insufficient.
- `ci1046-physical-20261008`: [audit crosswalk](../docs/AUDIT_IMPLEMENTATION_CROSSWALK.md) directly links the evidence packet for bounded physical observations; the [publication](2026-10-08-codex-ci1046-physical-publication.md) identifies 309 manifest entries with verified hashes. Trace required consumers and replacements individually, preserving usable references.
- The earlier [20-family consumer review](2026-10-30-chatgpt-cleanup-batch4-consumer-holds.md) identified original recordings or incomplete analysis in batch 2 folders `m5-remaining-native-20261017`, `pr362-native-20261016`, `pr364-native-20261017`, `m6-quick-native-20261017`, `pa353-nsis-native-20261014` and `pa353-msi-native-20261014`. Its October 30 HOLD was later superseded as a blanket prohibition for old Narro material, but these concrete consumer observations are not evidence of safe retirement. Reconcile them with newer final evidence before selecting individual files.
- That review also identified unverified original/replacement evidence in `m7-ci893-20261003`, `m7-ci884-20261003`, and `2026-10-03-m7-ci873-c5-completed`. These need current verification; no assertion that a replacement is absent today.
- GitHub code search is a discovery aid, not an exhaustive consumer audit. This review does not claim all 27 folders, 4,065 paths, or all consumers have been assessed.

## Continuation

Use a permitted workflow to resolve the existing deletion safety block. For each group establish a complete asset list, exact consumer references and any required replacement/recovery links; preserve original Blitzit material and latest meaningful final/native case evidence per current user direction. Then separately validate any proposed finite allowlist and actual resulting tree; update the active temporary tracker and HANDOFF only with verified changes. Do not mark the complete batch deleted, bypass the safety rejection, or equate retained Git history with storage reclamation.
