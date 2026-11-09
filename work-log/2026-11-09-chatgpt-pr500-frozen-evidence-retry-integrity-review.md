# 2026-11-09 — PR500 uploader retry/integrity scoped code review

## Scope and ownership

Read-only independent ChatGPT review of the **Codex-owned** [PR500](https://github.com/MariosGiannakaras/Narro/pull/500), head `49f33fdef1eff2fe974b6a7eb08f6d1569153cae`. At time of review, PR was OPEN, not merged; [CI42663090123](https://github.com/MariosGiannakaras/Narro/actions/runs/42663090123) passed validation, fast, Windows candidate **3/3** on that head. No source branch was modified, no workflow rerun or physical recording was launched by this review.

The nine source-native packets (eight sessions and one campaign ZIP, 684,870,152 bytes total) and private draft release ID439408831 were independently identified by GitHub release metadata. The GitHub connector does not provide authenticated binary downloads of this private draft release. **The native video/PTS and full-stack logs have NOT been opened by ChatGPT**, so the existing bounded Codex analysis is not represented as an exhaustive frame review or an acceptance result. No physical M5–M9 row, PA-01–09 case, independent A/B strict 8/8 hold or PR499 merge condition was closed.

## Reproduced, source-bound finding — future uploads

The PR500 uploader `scripts/upload-physical-evidence.py` adds every file under a frozen packet except `UPLOAD_RECEIPT.json` to its content-addressed ZIP and its internal manifest, derives the remote filename from the archive SHA-256, and treats a matching filename as the existing verified asset.

1. `scripts/physical-session.mjs` `uploadFrozenEvidence` updates `UPLOAD_STATUS.json` with a **fresh `utc()`** and `UPLOAD_PENDING` immediately before each transfer, then rewrites the same file as `UPLOADED_VERIFIED` afterwards. Because the uploader hashes and archives that changing status file, retrying an unchanged frozen source produces another ZIP SHA/name and a second asset rather than reusing the previous verified asset. An isolated two-archive control differing only in that UTC field produced hashes with prefixes `6023020170a77937` and `6ec6b809150a0ef2`; this demonstrates source-derived hash non-idempotence, **not** an actual repeated remote upload in production.
2. The CLI `collect`/`recover` path also recomputes `EVIDENCE_INDEX.json` with `collectedUtc: utc()`; on re-collection, the collected file inventory includes upload-owned metadata (status/receipt) because its exclusion set is limited to EVIDENCE_INDEX, ANALYSIS_BRIEF and temporary files. This independently changes the evidence ZIP and provenance even after the status file is excluded. A second offline control changing only the index UTC produced distinct SHA prefixes `1360054286909066` and `58d9efed24411448`.
3. PR500's current `test_frozen_transfer_and_retry` invokes `uploader.upload()` directly on a static root. It does **not** invoke `uploadFrozenEvidence` or a second `collect`, and therefore cannot detect either controller-level source of duplicate assets.

This finding applies to future repeat uploads and frozen-evidence immutability; it does **not** establish that Codex's previous nine ZIPs were modified or corrupt. Nor does it invalidate the existing successful CI test claims outside the missing retry boundary.

## Review handoff

Published [PR500 source review comment](https://github.com/MariosGiannakaras/Narro/pull/500#issuecomment-6747353741), updated with both mechanisms, asking the **existing Codex owner** to fix the mutable upload metadata/collection identity lifecycle, add a full wrapper-level two-attempt regression using different UTCs, and require replacement exact-head 3/3 CI. Draft-only upload, digest verification and raw-evidence privacy remain non-negotiable. Do not merge PR500 on the currently CI-green head without resolving this demonstrated gap.

No additional physical acquisition or source work is authorized by this finding. The existing corrected application PR499 remains draft/unmerged and needs its own real Windows physical/native evidence; the A389/B419 strict 8/8 gates remain separate. Access to the existing raw draft-release ZIP assets requires authenticated binary transfer or direct authorized attachment; do not publish raw desktop recordings publicly to work around a connector limitation.
