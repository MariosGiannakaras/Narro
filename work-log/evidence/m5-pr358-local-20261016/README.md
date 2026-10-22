# PR358 local pre-CI evidence

[Candidate report, source identity and honest boundaries](../../2026-10-16-pr358-m5-atomic-quick-clear-candidate.md).

Frontend aggregate/build PASS; actual React4/4 PASS; Search actual geometry8/8 PASS. Raw CLI JSON/logs and all12 browser PNGs retained; initial invalid motion-request receipt retained. `raw-original-bytes.zip` preserves logs/screenshots without Git text conversion. [Manifest](manifest.json), [React receipts](runtime-receipt.json), [Search receipts](search-receipt.json).

Rust tests are **NOT RUN locally** because MSVC link.exe is missing;12 regressions await exact-head CI38825996083. Physical native acceptance **0/2 OPEN**. These browser fixtures replace IPC only and do not prove SQLite/native behavior. Personal DBs and temporary formatting-backup ledgers are excluded.
