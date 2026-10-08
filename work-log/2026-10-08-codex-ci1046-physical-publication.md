# CI1046 physical evidence publication receipt

Published to `origin/main`:

- initial checkpoint `ca422989e953104e61d0aa83d88c0896ae48df72`;
- final batch closure `2e41bcbff0689aa32f69512b17cd3d71ce47f5bd`.

[Full packet](evidence/ci1046-physical-20261008/README.md), [physical gate matrix](evidence/ci1046-physical-20261008/gate-matrix.json), [file manifest](evidence/ci1046-physical-20261008/file-manifest.json), [full Narro-M7-Logs folder](evidence/ci1046-physical-20261008/Narro-M7-Logs/).

At `2026-10-08T10:28:44.035772Z`, all **309** final manifest entries were read directly from committed Git blobs and checked against their listed SHA256 and byte counts: **0 mismatches**. Media/SQLite binaries are byte-preserved; text copies use LF. This supersedes the first checkpoint's documented CRLF normalization mismatch report. Final push completed successfully `46394dd4..2e41bcbf main -> main`.

All recordings finalized; no Narro or ffmpeg process remained at final verification. Production DB restored exactly to its prelaunch SHA256 `3b98e19d94ebcc75bd5d10f8fda0d17038a2aac6086782b44d76509f0e0636c4`; original preferences/task/checkpoint and Windows animations restored. Full test-state database retained in the packet. No source change/build/CI during this physical batch. User requested a stop after this completed batch to add requirements; no later check or implementation was started.

Results and remaining boundaries are in the packet/current STATUS/TODO/HANDOFF/crosswalk: M5 physical6/6 PASS; M6 physical5/6 PASS plus A OPEN; M7 three checks exercised with Finding07 PASS, C4 FAIL and Finding35 visible-state FAIL; M9 physical2/3 PASS plus pending focus-owner proof OPEN. Whole source-parity gates remain separate. M10 remains blocked.
