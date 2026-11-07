# PR437 integrated Motion v4 — exact 3/3 CI and native Windows artifact provenance (2026-10-28)

**Source owner:** ChatGPT. **Physical Windows sessions:** separately user owned, NOT RUN. Existing draft PR437 [integration/m7-v4-current-timer-20261027](https://github.com/MariosGiannakaras/Narro/pull/437) exact HEAD **`ac40da8bdc08a32a2de6fe500b3c0921a0ecf030`** (verified GitHub head at checkpoint). No merge into `main`.

## Actual current-head verification

[GitHub Actions run40597713109](https://github.com/MariosGiannakaras/Narro/actions/runs/40597713109) for source **`ac40da8bdc08a32a2de6fe500b3c0921a0ecf030`**: **validation-gate SUCCESS / fast-gate SUCCESS / windows-candidate SUCCESS (3/3 PASS, completed)**. Unlike failed preceding snapshots, full Rust suite and physical candidate packaging succeeded. The current code contains native Motion v4 raster compositor `focus_motion_v4_raster.rs`, real React Panel↔Timer and Compact↔Expanded staging, protected leases and rollback, with preserved latest PR431 unavailable selected LG fallback, actual monitor friendly labels/thumbnails, and PR436 four-corner Timer WM_MOVING snap. Native Win32 operator acceptance and Blitzit source parity are **NOT RUN / OPEN**, never inferred from CI.

The previous CI40596881386 for `c0a6563bd79f323e1c0ff3a1fe03ace5c82254d1` is historical **Windows FAIL**, not falsely upgraded: 457/458 Rust tests PASS, real failure `focus_motion_v4_raster::tests::panel_shared_pixels_use_one_semantic_source_and_exact_endpoints` exposed a dirty extra cleanplate contribution below true short Timer clip. Current code corrected shared source blending using full-height cleanplate with the short plate restricted to its actual height, and added both directional regression assertions; new exact Windows CI **PASS**. All old fast-gate FAIL runs remain historical FAIL.

## Independently downloaded exact native artifact

[Physical artifact 12777668555](https://github.com/MariosGiannakaras/Narro/actions/runs/40597713109/artifacts/12777668555) (`narro-m7-physical-windows-x64`). Downloaded actual archive in this run and independently checked:

- ZIP size **15,992,842 bytes**. SHA256 **`dc61cda168f71457b0cdafb247a90cde28d06d8f72a730aed7a480e9cb2cdd14`**, exactly equal to GitHub artifact digest. `zipfile.testzip()` returned `None` = full ZIP CRC PASS.
- Embedded `artifacts/ci-provenance/physical.json`: schema `narro-ci-artifact-provenance/v1`, `kind=physical`, `sourceSha=ac40da8bdc08a32a2de6fe500b3c0921a0ecf030`, `githubRunId=40597713109`, `githubRunAttempt=1` all match.
- Native `src-tauri/target-physical/release/narro.exe` size **16,507,392 bytes**, SHA256 **`f918e8f01599fb17e8c3e85d9231d6b50768f5d34fde7edfe5895118e3796db1`**, exact manifest match and PE `MZ` signature PASS.
- NSIS `Narro_0.1.0_x64-setup.exe` size **4,286,237 bytes**, SHA256 **`a67133590393ac530d7095f2d08766ea3b1e339589d3583f25602af02a8defe3`**, manifest match PASS.
- MSI `Narro_0.1.0_x64_en-US.msi` size **6,033,408 bytes**, SHA256 **`374aac7d3f9c03d5c081a87b6778ea54342596c1300c35d079c070708208bee7`**, manifest match PASS.

No PE was installed/executed on a physical personal Windows system; checksum and packaging validation are **not** physical app acceptance. The old frozen A/PR389, B/PR419 and source-only PR418/PR436 retain distinct SHA-scoped statuses; do not replace their historical evidence.

## Next independent source action

Check additional new compositor invariants and high-value regression gaps in PR437 source; amend only a real demonstrated source defect (new SHA and CI). If none, update HANDOFF/TODO/STATUS to this exact 3/3 and stop source changes rather than degrade a clean build. Main merge remains held by existing acceptance rules, despite user's independent physical testing schedule. Formal M1–M4 4/10 accepted; M5–M9 incomplete; M10 permission later; M11/M12 inactive.
