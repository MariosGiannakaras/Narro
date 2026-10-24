# 2026-10-23 — PR389 ccb70a92 independent three-artifact binary provenance

## Frozen identity

- Repository `MariosGiannakaras/Narro`, existing [PR #389](https://github.com/MariosGiannakaras/Narro/pull/389) OPEN/DRAFT/NOT MERGED, source branch `fix/m7-pixel-preserving-composition`, exact current head `ccb70a922b0f3c14f1e718850238343a8156fc6d`.
- [Windows CI run 39871074255](https://github.com/MariosGiannakaras/Narro/actions/runs/39871074255), attempt **1**, **3/3 PASS** (validation `120145369647`, fast `120145394813`, Windows candidate `120145817661`).
- This is **offline inspection of original downloaded GitHub artifact ZIP bytes**, not running/installing any Windows EXE or UI. User-profile/AppData untouched. Prior `f709214b` artifacts are historical and cannot satisfy `ccb70a92` physical acceptance.

## Independent file examination, all PASS

The three original binary ZIPs were retrieved from the exact CI run and inspected offline as binary files, without relying on a green CI status alone. Verified for each: whole-ZIP SHA-256 equals the GitHub artifact digest, all ZIP members CRC-check clean, no duplicate or traversal paths, exactly one expected embedded provenance JSON; `schema=narro-ci-artifact-provenance/v1`, correct `kind`, `sourceSha`, `githubRunId=39871074255`, `githubRunAttempt=1`, and every manifest file's byte length and SHA-256 match actual ZIP contents. For validation ZIP, manifest paths under `artifacts/m7-validation/` are normalized to the archive's `m7-validation/` prefix; this preserves exactly the same binary bytes and expected documented relative path.

| Purpose | GitHub artifact ID | ZIP bytes | independently calculated ZIP SHA-256 | Entries / manifest file hashes | EXE bytes | independently calculated EXE SHA-256 |
| --- | --- | ---: | --- | --- | ---: | --- |
| PR389 physical | `12467730680` | 15,675,651 | `387c265c2c0ef341938264fcce0d724dfd9da00a6e442e218929c684c8566db8` | 4 / 3 PASS | 16,195,072 | `3d00390920b9af4f00a298111bca3baa075b1b0d05e4692fa39bffbf9b2d962a` |
| M7 validation | `12467546366` | 5,791,363 | `6b54f4f7762ffdb6b529cfdddac7cd43dd6434b04d2754ffefca744763d25077` | 3 / 2 PASS | 16,195,072 | `3d00390920b9af4f00a298111bca3baa075b1b0d05e4692fa39bffbf9b2d962a` |
| M1 diagnostic | `12467531745` | 5,811,748 | `47cb2a78b3aff89fecc37f373449c868d1691200c8465cc01580480bd5772f4d` | 8 / 7 PASS | 16,195,072 | `119d2937fa980bc87e55b9f078cb4f9ddb7481e9672dfd40d8ab7bff3b8dd061` |

- Physical `src-tauri/target-physical/release/narro.exe` and M7 `m7-validation/narro-m7-validation.exe` are **byte-for-byte identical**, not merely the same version label.
- M1 diagnostic `src-tauri/target/release/narro.exe` differs from physical/M7 as expected; its complete bytes, manifest entry and standalone SHA-256 were verified separately.
- Physical ZIP also contains `Narro_0.1.0_x64_en-US.msi` (5,914,624 bytes) and `Narro_0.1.0_x64-setup.exe` (4,202,345 bytes); both file hashes are independently validated against physical manifest. This does not test either installer interactively.
- All listed manifests trace to current exact source HEAD and run/attempt, not previously cached build hashes.

## Acceptance boundary / one next action

This receipt establishes ZIP and inner-file integrity, exact current-source provenance and executable identity; it **does not establish** Windows compositor motion, visual parity, native owner/window behavior, input hit-testing, runtime reliability, installer functionality or user-data isolation in an actual physical test. The [older 4/8 actual physical FAIL](../docs/PR389_NATIVE_REVIEW_2026-10-21.md) remains historical, and current owned-layered PR389 **0/8 physical NOT RUN**. Keep PR389 open/draft and its specific `PHYSICAL_BEFORE_MERGE` guard. When separately authorized, Codex should use physical artifact **12467730680** (EXE SHA `3d003909...`) for real native eight-case normal/reduced acceptance, then report original frames/PTS and state. On supported 8/8 PASS, expected-head merge and resulting-main CI; on FAIL, narrow correction in the same PR.

Related [implementation/automated audit](2026-10-23-chatgpt-pr389-prephysical-audit-ccb70a92.md), [live handoff](../HANDOFF.md), [current acceptance TODO](../TODO.md).
