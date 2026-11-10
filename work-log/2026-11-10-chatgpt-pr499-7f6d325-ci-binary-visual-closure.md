# 2026-11-10 — PR499 exact-head native-queue correction: CI, binary integrity and CI-pixel review

## Identity, ownership and scope

- Existing held, draft, open, **unmerged** PR [#499](https://github.com/MariosGiannakaras/Narro/pull/499), branch `fix/prephysical-d01-d05-20261109`, exact source **`7f6d3258ecc227211021abb8a2989b191f1f1e16`**. Inherited PR437 source and the D01–D05/Timer live HWND drag fixes remain intact.
- Source change `cc7122eb6770de2a3b2f9a1d4f59b62f5d855b12`: `src-tauri/src/main_focus_raster.rs` cancels late **queued** UI callbacks after bounded receiver timeout with an atomic queued/started/cancelled admission guard. Two Windows Rust regression tests cover timeout-before-start and already-started-before-timeout. Formatting-only replacement `7f6d325...` followed the actual `cargo fmt --check` failure output. Existing watchdog/uncertain-inflight semantics deliberately preserved.
- The original PR437 recorded duplicate Main→Focus at **PTS1243.867s** remains a **historic old-source visual FAIL**. The queued-callback source race is proven, but attribution of those duplicated pixels to this race remains **unproved**; the old Main HWND versus rendered popup scanout handoff may be a separate compositor timing failure.
- Previous replacement [CI42839099797](https://github.com/MariosGiannakaras/Narro/actions/runs/42839099797) **FAILED** first in fast-gate `Check Rust Formatting`: one multiline test assertion and one blank line in the new Rust source. Windows candidate SKIPPED on that failed run; do not retroactively reclassify.
- Current exact-head [CI42839644180](https://github.com/MariosGiannakaras/Narro/actions/runs/42839644180), **COMPLETED SUCCESS, 3/3 gates PASS**: validation-gate, fast-gate, windows-candidate (including Rust check, Clippy, Rust tests, physical observer internal tests, Windows visual/packaged-runtime validations and physical/diagnostic build/upload). This is **not** native PA or full source parity.

## Actual artifact-byte audit (not provider metadata alone)

Downloaded materialized GitHub Actions ZIPs, opened and hashed the actual local bytes, checked each whole-ZIP digest against GitHub's published artifact digest, tested **every** ZIP member CRC, parsed included manifest, verified exact source SHA, run ID `42839644180`, attempt `1`, feature list, exact manifest inventory (no unlisted ZIP files), and recomputed SHA-256 plus byte length for **every** internal file.

| Item | Physical-observability package | Quiet diagnostic package |
| --- | --- | --- |
| GitHub artifact ID | **13777945506** | **13777316895** |
| ZIP bytes | **16,643,888** | **6,080,222** |
| Whole ZIP SHA256 | `6aff35747af0d533afe33fcbf62c609283d9bc4e313496ca5b17355efd723e7b` | `f75e229f5c9f599781a132e3fc24663f2fa0f59ed4638fec4ad276865e7f46d3` |
| All ZIP CRC | PASS | PASS |
| Internal SHA256 + bytes | **5/5 PASS**: native EXE, supervisor, uploader, MSI, NSIS | **7/7 PASS**: quiet EXE, three PowerShell scripts, three diagnostic docs |
| Source / run / attempt | `7f6d325...` / 42839644180 / 1 | Same |
| Manifest feature | `physical-observability` | Empty (quiet) |
| `narro.exe` SHA256 | `80b0ac8c75e5d0bc1ef58aa0f63e6167d1f4d4095d375f336448fd248b875d51` | `62c322810aaf7cc5db632d66c93518015f16715648d1b1ce9ed7ace93c5654b9` |

The physical `narro.exe` file is a PE32+ AMD64 image (PE signature, machine `0x8664`, optional-header magic `0x20b`). An x86 PE bootstrap wrapper inside the NSIS installer is not evidence that the app's x64 binary is wrong; the manifest's native EXE was independently checked.

**What is not proven:** the ZIP's source/run identity does not establish **actual on-host** EXE path/PID/HWND, installation, running app behavior, actual desktop scanout, D01–D04 physical interaction, Timer offscreen position or Blitzit parity. No installation, actual Windows Narro execution, AppData modification or native PA took place in this source-review chat.

## Additional independent CI visual-media review

Downloaded Windows CI focus runtime visual artifact **13776622947**, ZIP bytes **2,413,039**, SHA256 `071b29dd42742e8817427b3144f8d706b0d5b42c344e03c1ce1919413e141721`, ZIP CRC PASS. It has **90 members**, including **60 original PNG frames** (30 Panel→Compact and 30 Compact→Panel), 160 recorded native position samples per direction, 3 settled PNGs, checkpoints/renderer DOM snapshots and stdout/stderr. Programmatically decoded all 60 original PNG bytes without OCR, checked dimensions **340×700**, adjacent pixel differences and unique full RGB images: **5 distinct images per 30-frame sequence**, with **21 frames per direction repeating one settled image**. Screenshots show complete Panel or compact Timer at the sampled states; the open desktop/log console **below the deliberately 110px visible compact Timer region** is normal and must not be misclassified as A389's desktop pixels appearing **inside** its nominal opaque Timer surface.

Crucial coverage limitation: recorded `prefersReducedMotion=true`, `devicePixelRatio=1` (96 DPI), and the host's native window changes location from `(668,10)` to `(388,90)` for Panel→Timer, then back; no ordinary 220/500 ms smooth compositor proof, no actual Main→Focus duplicate case, no A389 A-R02 source and no physical 125%/mixed-DPI or right-edge drag proof. The CI frame transport samples only its own windows/capture timing; 30 sampled frames **do not mean 30 visually distinct motion frames** or full continuous display acceptance. An annotated selected-frame contact sheet was prepared **locally for the user only**, not committed into the repository or substituted for the immutable original media.

## Source-specific next operation

PR499 is **technically source-CI-validated and ZIP/manifest verified**, ready for the designated Windows operator's **Q0 on-host admission** only. Maintain separate PR437/default, PR389 A and PR419 B source/EXE identity and individual 8/8 compositor acceptance gates; no PR merge. Run the short causal early-stop probes in the canonical [M5–M9 bulk launch sheet](../docs/M5_M9_BULK_PHYSICAL_CAPTURE_HANDOFF_2026-11-10.md), preserving precise original video/PTS, native HWND/window order, QPC, timer/session authority and first-failure logs. Create additional alternative compositor builds **only if** the baseline/known A/B first-frame evidence leaves two credible mechanisms unresolved; do not assume untested variants help, and do not repeat broad physical campaigns for corrected deterministic race/CRLF checks.

No change to current 59 OPEN M5–M9 TODO rows, no Codex-initiated PA-01–09 reactivation, and no M10/M11/M12 authorization.
