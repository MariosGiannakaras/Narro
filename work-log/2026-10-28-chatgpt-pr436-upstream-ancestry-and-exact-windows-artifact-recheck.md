# PR431→PR436 current source ancestry and Windows artifact recheck (immutable)
Date: 2026-10-28. Owner: ChatGPT source/artifact review; repository `MariosGiannakaras/Narro`.

## Source dependency (no change)
- Current upstream [PR431](https://github.com/MariosGiannakaras/Narro/pull/431) HEAD `3c3b72b06eaa841bce9429dace83a6b5c33ba701` OPEN; downstream draft [PR436](https://github.com/MariosGiannakaras/Narro/pull/436) HEAD `3561597d27a4a7e7e389105888c6f88137c368b5` OPEN. Live GitHub comparison of `PR431..PR436`: **ahead 15, behind 0**. Exact PR431 source IS an ancestor; earlier PR436 body was stale and claimed only old `aa6c562a` / `6dce8daa` inheritance. Corrective latest-first description added to PR436 with historical sections retained.
- No branch/ref/source change, rebase, compositor variant overwrite, reviewer bypass, or main merge.

## Exact CI and independent physical artifact identity
- [Actions run40589906072](https://github.com/MariosGiannakaras/Narro/actions/runs/40589906072) `head_sha=3561597d27a4a7e7e389105888c6f88137c368b5`: 3/3 COMPLETED SUCCESS, validation/fast/Windows candidate.
- [Physical ZIP artifact12774976718](https://github.com/MariosGiannakaras/Narro/actions/runs/40589906072/artifacts/12774976718) downloaded and independently checked in container: 15,861,309 bytes, ZIP SHA256 `1cb8f83822ff0129b5f2ddbba1d98d565354752cc823efa5e99b6ad349ea3454` == published digest, ZIP CRC PASS, schema `narro-ci-artifact-provenance/v1`, `kind=physical`, source `3561597d27a4a7e7e389105888c6f88137c368b5`, run `40589906072`, attempt 1.
- Manifest entries independently byte-size and SHA256 checked: MSI 5,980,160 bytes `b024b7ab8f3163cb4cfbfc24b0e41abe3822b1ef7febf980728398e78a3195fd`; NSIS EXE 4,255,342 bytes `55e0dd0a2f0fffa478b06ee024caec2473a2d194b358a61d0387eedccd8a5174`; narro.exe 16,302,080 bytes `de039e16946ed1eede80afa9adedff1908a6fa99d884bd6c37c81849a3003726`. MZ/OLE headers match expected file types.

## Acceptance restrictions
Separate PR431 connected/disconnected monitor and PR436 SNAP-01–08 native tests are **NOT RUN/OPEN** on these exact current source heads; clean ancestry and artifact integrity cannot certify Windows DWM behavior, Blitzit-specific parity or release readiness. PR389/419 and integrated PR437 separate holds unchanged. Physical Windows tests remain user-owned; no install/AppData actions, no M10/M11/M12 action. **NEXT:** real operator results or another independently evidenced source bug; do not merge draft PR436 before native acceptance.
