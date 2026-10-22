# PR388 review evidence — 2026-10-21

[Authoritative report and per-scope limits](../../../docs/PR388_REVIEW_2026-10-21.md).

- `pr388-cdp-native-original.mkv`: useful unchanged163.100s desktop recording, actual PR EXE, CDP input; right edge clipped after app relaunch. Full viewport PNGs provide complementary complete views.
- `pr388-native-original.mkv`: aborted Computer Use startup attempt, no successful click; retained without acceptance credit. It was stopped forcibly after stdin was found closed, so it is not a completed acceptance recording.
- `Narro-M7-Logs/`: **entire** automatically produced folder, both process sessions. This review did not perform C5; PENDING/INCONCLUSIVE files do not become a PASS.
- `playwright-cli-receipts/`: fresh production DOM snapshots and browser console records. These distinguish native EXE/CDP from later local fixture observations by URL/timestamp. One local fixture/favicon404 does not establish a native product failure.
- `video-frames/`: bounded PTS derivatives and parent hash. `video-contact-sheet.png` is a coarse derived overview, not frame-complete analysis.
- `density-before/`: measured old layout RED and original harness failure diagnostics. `density-after/`, `density-production/`, `density-production-light/`: corrected real-browser measurements/PNGs/DOM and first-failure diagnostics, including explicit narrow/conflict result.
- `frontend-preflight.txt`: original CRLF assertion failure. `frontend-preflight-final.txt`: complete successful preflight after portable source reads. `result.json`, CI/PR receipts, EXE provenance, monitor data, volume-persistence and original-profile restoration receipts bind the review.

SHA256 manifest includes every published file except itself. Private personal backups, retained profile databases, browser caches and executable download are deliberately local; no required analysis depends on them. EXE bytes are reproducible from the cited GitHub artifact/hash. The approved picker/upload/product-icon code is unchanged.

`raw-text-receipts.zip` preserves the exact text receipt bytes before Git newline normalization. Manifest SHA256 values describe canonical published Git blobs; `localOriginalSha256`, where present, records a different original checkout byte representation. Original PNG/MKV bytes are identical before and after publication.
