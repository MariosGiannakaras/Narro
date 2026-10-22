# PR389 f709214b — exact-head 3/3 CI and independent three-artifact checks (2026-10-23)

## Identity and user status request
- Existing draft, open, unmerged [PR389](https://github.com/MariosGiannakaras/Narro/pull/389), exact head `f709214bbbcd07e199865d2c1bf2842d6fa9d1cf`, branch `fix/m7-pixel-preserving-composition`.
- [Windows CI run 39861577759](https://github.com/MariosGiannakaras/Narro/actions/runs/39861577759), attempt 1, **COMPLETED SUCCESS**; job `validation-gate` 120113343390 **SUCCESS**, `fast-gate` 120113371085 **SUCCESS**, `windows-candidate` 120113802767 **SUCCESS**. Exact source check, Rust formatting, Clippy, Rust test, visual and packaging gate completed in Windows CI.
- Previous intermediate run 39861119823 on SHA `a66e4afc` was **fast FAIL Rustfmt, Windows SKIPPED**; corrected `f709214b` is a new validated SHA. Earlier `15c0649f` CI 39848609179 3/3 PASS and ZIP 12457776202 are different source; never treat as current build.

## GitHub artifact API identity plus independent downloaded bytes
Downloaded each ZIP from the GitHub workflow artifact endpoint to an isolated container (no Windows executable was run). Compared **entire ZIP SHA256** with GitHub's artifact `digest` metadata, validated ZIP CRC for every member, parsed each embedded `artifacts/ci-provenance/<kind>.json` (validation ZIP root is normalized without `artifacts/` by upload-artifact), checked `sourceSha`, `githubRunId`, `githubRunAttempt`, type and each included file's actual SHA256 and byte count. All PASS.

| Artifact | GitHub artifact ID | ZIP SHA256 | Manifest checks |
|---|---|---|---|
| `narro-m7-physical-windows-x64` | `12463188111` | `1cbcf52b13fbf7759ec6f87161da0818740a2c52e55ecdcfcf0233086a420ece` | source `f709214b...` run `39861577759` attempt 1, 3/3 listed file SHA/bytes and ZIP CRC PASS |
| `narro-m7-validation-windows-x64` | `12463406585` | `60fdb7c9ddac493157315b5ef4bb2bc2e88506b2ca0985f86725c9576f6065bc` | source/run/attempt, 2/2 listed file SHA/bytes and ZIP CRC PASS |
| `narro-m1-diagnostic-windows-x64` | `12462843758` | `858229d33e62df4c21df5a0c133a01d987a6f428c43196bc7e62d7c82616ef07` | source/run/attempt, 7/7 listed file SHA/bytes and ZIP CRC PASS |

Physical executable `src-tauri/target-physical/release/narro.exe`: **16,194,560 bytes**, SHA256 `8ad7f3f6a376d5a529e4dd4212fbdc3571a78f5f47ad483b04dd97a54bc75970`. Validation executable `m7-validation/narro-m7-validation.exe`: **same 16,194,560 bytes and exactly same SHA256**. MSI digest `8d2fb50836e65c5dd316b47ae9d04c6f42a6531cd859a2d737ad3b21f858ed25`. NSIS digest `8366f25810d1712a600e6773f0a2ec9eaf197df56d84642d3086ac867cd42192`. Diagnostic executable digest `ad0648d53b96f79fa35177dbdac274df3350f61252e296a8b0afe6c4990ee02e`.

## Remaining acceptance and safe next action
- **Native actual Windows Floating Timer test 0/8 NOT RUN** on this exact replacement. Old native source `77a6b139` passed its CI but physically failed 4/8 mixed-hierarchy transitions. Same-compositor replacement is the justified narrow `PHYSICAL_BEFORE_MERGE` exception; **CI and artifact integrity do not close that hold**.
- Codex native physical owner is permitted to use the exact physical artifact ID `12463188111` after applicable owned-profile backup/restore and authorization, with normal/reduced Panel ↔ Timer / compact ↔ expanded captured and case-by-case assessed. Do not reuse old ZIP `12457776202`.
- On actual current-source 8/8 physical PASS, check live exact head/branch, merge with expected-head guard per repo policy, validate resulting-main source/CI and artifact identity. On FAIL diagnose only evidenced failing frames, repair existing source path with tests and fresh exact-head CI.
- No physical native test, real UI run, Windows AppData modifications, merge or source-code changes were made in this particular follow-up; only documentation sync follows.
