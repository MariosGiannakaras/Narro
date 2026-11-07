# Evidence cleanup PR358 native original video and sidecar retention (2026-11-01)

**Owner:** ChatGPT cleanup agent; read-only audit of tracked evidence and documents, not product implementation or source parity. **Live main at this slice's start:** `8d95b5c64e7ec61cc0b71dfedbe1d4fe8aad4bf8`. Frozen inventory baseline `4fcd2fe084ecdc7b66cad5671da54d63e71aabe3`. Deletions, moves, extraction, physical Windows, AppData and changes to original Blitzit evidence remain explicitly prohibited.

[Per-file PR358 report](evidence-cleanup-review-20261101/pr358-original-and-sidecar-retention.json) reconciles **313 current frozen tracked files** in `work-log/evidence/pr358-native-20261016/`: **311 nonconventional-media paths /122,980,571 B**, consisting of **2 original 60fps MKV parts /113,022,127 B** plus **309 native observations/reviews/receipt files /9,958,444 B**. One separate `video/playback-review.mp4` is a **13,986,822 B re-encoded 30fps convenience derivative**, now specifically held in the conventional media index; its 60fps source is in two retained original parts, so derivative and original are not substitutable. A raw observation ZIP is conservatively held by the existing 103/103 ZIP review. Every item remains present/held; no file deletion approved.

## Historical SHA-256 manifest nuance

The original `video/original-video.json` names one **113,022,127 B** source video (`2026-10-16 03-19-29.mkv`) and two parts, with published part bytes and SHA-256 matching their historical `manifest.json` entries and frozen Git path sizes. These recorded SHA-256 digests **were not recomputed from binary bytes in this pass**.

The original `manifest.json` has 315 entries. Current 313 tracked records include a self-excluded manifest; among the other 312 present files, **89 historical sizes match** and **223 text files have recorded size differences**, while three old `review/*.log` paths are absent from frozen tracked main. Eight sampled text files (JSON/JSONL/CSV/TXT/Markdown, including source part metadata) each have a current-vs-historical byte difference equal to the number of LF characters, strongly consistent with CRLF→LF normalization. No full file-by-file byte/SHA256 restoration was performed for the other 215 discrepant files. **Do not claim 223 exact-byte hash matches** or infer deletion suitability from normalized content.

The physical source report `work-log/2026-10-16-pr358-native-acceptance-and-subtask-focus-failure.md` records two scoped claims **2/2 PASS**, B46 scoped PASS, plus B12 repeat-subtask entry focus **FAIL**. No result is regraded here; native and historical source acceptance remain separate.

## Validation and handoff

**PASS (metadata only):** 313 current paths reconciled to original source manifest and frozen Git counts; two original parts in correct numeric order and sizes; source receipt strings consistent; 223 text-size discrepancies classified and eight samples checked by newline count; per-file conservative HOLDs published. **NOT RUN:** fresh hashes of original video or all normalized texts, Windows physical test, CI, app runtime, original media playback, new recovery or consumer retirement. All original source/test/config/reference files are unchanged.

Tracking updated: `work-log/evidence-cleanup-review-20261101/README.md`, `media-path-retention-index.json`, `STATUS.md`, `HANDOFF.md`. Current remaining review scope: **11,350 nonconventional paths /965,648,173 B** plus **274 conventional media /3,082,438,208 B**; 103/103 ZIPs conservatively HOLD, zero deletion approved. Historical 27-family destructive safety rejection and all native/PA/roadmap restrictions remain unchanged.

**One next action:** current `HANDOFF.md`: read-only source/consumer audit for `m7-ci942-20261004` (221 nonconventional paths /121,363,518 B). Do not repeat the PR358 work, trigger CI/native tests, or remove/move any evidence.
