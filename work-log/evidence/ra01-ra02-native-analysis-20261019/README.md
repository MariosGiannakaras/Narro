# RA01/RA02 analysis derivatives — 2/2 videos reviewed

[Authoritative findings, per-case results, source causes and correction plan](../../../docs/RA01_RA02_NATIVE_ANALYSIS_2026-10-19.md). This directory contains **new derivatives only** of the [immutable acquisition corpus](../ra01-ra02-native-capture-20261019/README.md); original videos, screenshots, scripts, receipts and ZIP remain unchanged.

- [Case ledger](case-review.json): ten case dispositions,4 scoped PASS/5 visual-or-feedback FAIL/1 insufficient exercise; three corrective scopes.
- [Input/source integrity](input-integrity.json): original109-file hashes/Git blob identity and11 inspected source/test blob identities.
- [Database reconciliation](database-reconciliation.json): six RA01 before/after comparisons and four RA02 session/checkpoint snapshots; no replay or live DB access.
- [RA01 timestamps](RA01-frame-pts.json), [RA02 timestamps](RA02-frame-pts.json): zero-based decoded-frame→actual ffprobe PTS seconds.
- [RA01 all-frame ROI deltas](RA01-all-frame-deltas.json), [RA02 deltas](RA02-all-frame-deltas.json): sequential grayscale absolute differences, changedPixels uses threshold20. These are navigation aids, not visual verdicts.
- `*_overview*.jpg`: human-reviewed film navigation. RA01 uses every60frames with original ROI(x232,y180,w1148,h850), scale0.36,4columns; RA02 every120frames with Focus ROI(2220,0,340,700),scale0.6,6columns.
- RA01 `*_commit.jpg` and `*_settle.jpg`: consecutive12-frame boundary strips; ROI(232,270,1148,650),scale0.5,3columns. N1 probe uses step5; it is not a consecutive strip. Normal/reduced cancel strips use the same ROI/scale. Report does not depend on unreviewed frames for PASS.
- RA02 `*_consecutive.jpg`: consecutive16-frame strips with ROI(2220,60,340,450),scale1,4columns; `RA02_status_expiry.jpg` uses consecutive24frames,ROI(2220,580,340,120),scale1,4columns. The earlier completion probe precedes the critical transition and does not prove continuity.
- Native PNG filenames encode the original film and zero-based frame index. RA01 crop ROI(232,270,1148,650); RA02 crop ROI(2220,0,340,700). No sharpening, color change, interpolation or temporal frame synthesis. Contact-sheet resizing is for layout only; native PNGs retain source-pixel detail.
- [Derivative hashes](derivative-manifest.json) and [decoded identity](identity.json). Media counts differ from OBS output counters; use actual decoded timestamps for references.

All8523decoded frames were computationally scanned, with human review of overviews and selected consecutive critical windows/crops, **not human inspection of every frame**. PTS is local to each original; input UTC is not an exact PTS-zero calibration. No code fixes/tests/builds/CI, new native interaction/capture, original-file edits or source-parity certification occurred in this analysis. Helper execution was offline media/receipt analysis only.
