# PR389 independently downloaded exact-head Windows binary/installer receipts — 2026-10-22

## Source and acquisition
- PR #389, draft/unmerged head `15c0649f9c4b9865bec7f74c82cc8cd7373decaa`, successful run `39848609179` attempt 1.
- Downloaded **actual ZIP bytes** via authenticated GitHub Actions artifact connector for exact run IDs:
  - physical ID `12457776202`
  - M7 validation ID `12457033554`
  - M1 diagnostic ID `12456668871`
- Validated with Python's `zipfile.ZipFile.testzip()` (no bad CRC), `hashlib.sha256` for the original ZIP bytes and every manifest-listed inside file, and exact byte lengths. All manifest entries matched.
- All three `ci-provenance/<kind>.json` manifests reported `sourceSha=15c0649f9c4b9865bec7f74c82cc8cd7373decaa`, `githubRunId=39848609179`, `githubRunAttempt=1`.

## Independent SHA-256 and bytes
| ZIP artifact | ZIP SHA-256 | ZIP CRC |
|---|---|---|
| Physical x64 / ID 12457776202 | `8307c0fbb3cf77be4b0c2f29fc6ec61977879c8cb5169bdbbebd8990ebb8f5a9` | PASS |
| M7 validation x64 / ID 12457033554 | `7d8f5e62496357e2865562256c986f6f1017e2722e1859b0273a58d0c44ef1d5` | PASS |
| M1 diagnostic x64 / ID 12456668871 | `ff0878d6e4baf6c0414f314fb0ebd7e977c746ec47e60e0674840e03d18d9763` | PASS |

- Physical `src-tauri/target-physical/release/narro.exe`: 16,202,240 bytes, SHA-256 `7aea0da84e6de849fa2f174386b0d8f9833823445cd724a29c49af9b2a79ffcf`.
- Validation `m7-validation/narro-m7-validation.exe`: 16,202,240 bytes, **same SHA-256** `7aea0da84e6de849fa2f174386b0d8f9833823445cd724a29c49af9b2a79ffcf`.
- Physical NSIS `Narro_0.1.0_x64-setup.exe`: 4,205,761 bytes, SHA-256 `b5d7133bb98077fc8546737e329eda76bbaa37ded55ef9fb638478f72bdf01d0`.
- Physical MSI `Narro_0.1.0_x64_en-US.msi`: 5,922,816 bytes, SHA-256 `e455e49da40557047cc5854dfe5f1063761d4febcac98bea7f78740cf5a85320`.
- M1 diagnostic EXE: 16,202,240 bytes, SHA-256 `4883cfdd6f26e0661d253e171a929b3391c632c9fe3cd2faca4a5312dfc0e05d`.
- Validation README and all seven manifest-listed ancillary diagnostic docs/scripts also matched hashes and sizes in their respective manifests.
- All success is **artifact byte/integrity and build provenance**, not real Windows interactive/native behavior.

## Actual status / next action
- Exact source automated CI [run `39848609179`](https://github.com/MariosGiannakaras/Narro/actions/runs/39848609179): **3/3 SUCCESS**, Windows Rust test suite 427/427 PASS. Actual physical eight Timer normal/reduced transition tests on corrected SHA: **0/8 NOT RUN**. PR #389 remains DRAFT/OPEN and UNMERGED.
- No app installation/execution, AppData changes or physical Windows tests performed. User-approved Spectrum Core color picker, upload and 218 icons untouched. Mandatory milestones 4/10 remain.
- **NEXT:** Designated Codex physical Windows track tests all eight transition cases using the above *exact* verified physical artifact; on PASS perform expected-head guarded PR merge plus resulting-main validation, on FAIL fix only demonstrated root cause in appropriate branch with new exact-head CI. Do not infer 8/8 from archive integrity.
