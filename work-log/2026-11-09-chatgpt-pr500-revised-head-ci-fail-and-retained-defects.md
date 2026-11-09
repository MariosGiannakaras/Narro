# 2026-11-09 — PR500 revised-head review and pre-job CI failure

## Owner and verified identity

Independent ChatGPT reviewer of the existing **Codex-owned** [PR500](https://github.com/MariosGiannakaras/Narro/pull/500). No source edits, no new branch, no merge, no native Windows execution. PR500 advanced from `49f33fdef1eff2fe974b6a7eb08f6d1569153cae` (Windows CI run42663090123 **3/3 PASS**) to `e58ad53119ccd1e3036c11351e8a648add363b31` (one commit, three changed files: `scripts/upload-physical-evidence.py`, `scripts/test-physical-evidence-upload.py`, `docs/PHYSICAL_EVIDENCE_UPLOAD.md`). PR500 remains OPEN and unmerged. Unchanged application PR499 is `ae0447c4bebd49215f0c49eb8cd9acf0db8fc80c`, draft/open/unmerged and independently 3/3 CI PASS; its native/physical gate remains open.

## Exact-head CI disposition

Replacement [Windows CI run42672076433](https://github.com/MariosGiannakaras/Narro/actions/runs/42672076433) shows **COMPLETED FAILURE**, at run attempt 2, for exactly `e58ad531...`. GitHub API `actions/runs/{id}/jobs`, `.../attempts/1/jobs` and `.../attempts/2/jobs` each returned `total_count: 0`. The GitHub commit check-run collection was also empty. This is an **unclassified pre-job/initialization failure**, not evidence of a failed application test, Rust compiler/test, upload logic regression or Windows candidate. No real validation/fast/Windows candidate gate executed successfully for the new head; the previous SHA's green CI cannot be transferred.

## Scope of fixes and remaining defects

Compared old and new PR heads at GitHub. Changed uploader now excludes root-only `UPLOAD_STATUS.json` and `UPLOAD_RECEIPT.json`, canonicalizes ZIP entry timestamps/permission metadata, preserves nested same-named evidence, and uses expanded direct-uploader tests for root status changes, mtime, repackaging and changed evidence. These changes address the direct-uploader input stability concern within static/source review; no claim of a new exact-head automated PASS.

Two demonstrated code path gaps remain:
1. `physical-session.mjs` CLI `collect/recover` re-executes `collect()`, which rewrites `EVIDENCE_INDEX.json` with `collectedUtc: utc()` and includes uploader-owned status/receipt in its inventory on subsequent collection. Since the rewritten index is itself archived, retrying unchanged original packet evidence via the real wrapper can produce a different remote asset even with the uploader-only excluded files. New tests invoke direct `upload()`, not a two-pass wrapper/collector.
2. `upload-physical-evidence.py` creates a private ZIP in `tempfile.mkdtemp(...)` but still deletes it only on successful completion; exceptional errors (refused published release, failed CLI/upload/remote verification or packaging) bypass cleanup. The test injects upload failure, but does not assert deletion of the temporary raw-video archive.

These are **source-level faults in retry and failure handling**, not proof that any existing nine uploaded private packets were corrupt or leaked. The user's original raw Blitzit and already transferred evidence remain protected.

## Completed communication / required next operation

Published [current-head review comment](https://github.com/MariosGiannakaras/Narro/pull/500#issuecomment-6748415683) to the active Codex owner and updated main HANDOFF/STATUS to distinguish old- and new-head CI outcomes. The next operation belongs to that owner: fix both uncovered lifecycle branches with wrapper-level repeated-collect/recover and failure-injection staging-cleanup regressions; diagnose/resolve the no-job run and obtain **real 3/3 PASS on the replacement exact SHA** before dependency-guarded integration. This ChatGPT reviewer must not create a competing PR or modify Codex-owned branch.

Independent native evidence remains ungraded here because the 9 ZIPs live in private draft release ID439408831, and the connected GitHub fetch action can retrieve asset metadata, size and SHA-256 but **not the raw authenticated binary**. Continuous original video/PTS and correlated frontend/backend/SQLite/native logs have NOT been examined; existing 59 M5–M9 open rows, PA-01–09, and separate A389/B419 strict8/8 compositor gates remain pending. The earlier 60-frame PR499 reduced-motion CI visual study is distinct and cannot substitute.
