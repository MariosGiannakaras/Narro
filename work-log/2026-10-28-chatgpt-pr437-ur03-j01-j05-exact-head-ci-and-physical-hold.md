# PR437 U-R03/J01/J05 source correction — exact-head CI completion and artifact publication

Date: 2026-10-28. Owner: ChatGPT source (read-only CI/result inspection and tracking). This entry is immutable historical evidence, not a physical acceptance receipt.

## Exact source and run
- PR: https://github.com/MariosGiannakaras/Narro/pull/437 — OPEN/DRAFT, branch `integration/m7-v4-current-timer-20261027`.
- Exact source head: `41e8ff8ad8584b74821f3185401ed0c9740fc991` (observed again immediately before recording).
- Run: https://github.com/MariosGiannakaras/Narro/actions/runs/40677357491; head SHA matches; attempt 1, event pull_request; created `2026-10-28T11:06:26Z`, completed successful, updated `2026-10-28T11:34:34Z`.
- Validation gate job `122779061226`: SUCCESS. Fast gate job `122779112673`: SUCCESS, frontend/contract, Rust formatting. Windows candidate job `122779703931`: SUCCESS, Rust check, Clippy, tests, release packaging, validation builds and artifact publication.
- Old predecessor run `40677064127` fast FAIL remains historical FAIL; the replacement corrected SHA is separately validated here.

## Scoped code and evidence
- Compare old tested physical `2fc7881c9a13a355daf5c69516ef34313ff00b31` to current head: five changed files: `src-tauri/Cargo.toml`, `src-tauri/src/floating_placement.rs`, `src-tauri/src/focus_mode_raster.rs`, `src-tauri/src/lib.rs`, `src-tauri/src/monitor_display.rs`. GitHub comparison shows four commits ahead and zero behind.
- U-R03: temporary process-only unpinned Timer return origin; existing user movement/session placement and selected-monitor change override the temporary return.
- J01: Windows QueryDisplayConfig active-source mapping to EDID-backed target friendly name, ambiguous target models rejected, previous source-matched EnumDisplayDevices fallback retained.
- J05: when measured Panel↔Timer transition cleanplates unavailable, use one whole semantic surface instead of full-image crossfade; measured sprite choreography remains separate.
- New Rust source regressions for automatic return, ambiguous model choice and noncrossfaded fallback compiled/tested in Windows candidate. No native Windows operator action was conducted in this checkpoint; local preflight and independent artifact byte verification were NOT RUN here.

## Published artifact metadata (not independently hashed)
- `narro-m7-physical-windows-x64`, ID `12812013589`, ZIP bytes `15957722`, GitHub-published `sha256:8342835987274ad6e0893306ab7ad14ef6f90b66359669ef4305d58f4651356f`.
- `narro-m1-diagnostic-windows-x64`, ID `12812687753`, ZIP bytes `5914850`, GitHub-published `sha256:dbb1ed6f9ca1749f548b9e38d99634ae19dd8d792ef25d7c0ab2865141ccd5a1`.
- No claim of CRC, member SHA, provenance manifest, local EXE identity or actual Windows runtime validation.

## Open gates / next action
Native new-build U-R03/J01/J05 `NOT RUN`; physical cable J03/J04 `NOT RUN`; PR389/419 strict and PR431/436/437 dependency/physical holds OPEN. No source merge; M1–M4 4/10 accepted, M5–M9 OPEN; M10 user-review hold unchanged. Continue focused impacted-source review, artifact provenance verification and only authorized physical recapture; do not convert CI into physical PASS. Time Taken question remains independent.
