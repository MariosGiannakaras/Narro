# 2026-10-21 — CI artifact provenance hardening (audit CI-06)

**Owner:** ChatGPT source/CI. **User request:** continue validated CI fixes without waiting/idly polling ~20-minute Windows builds. Separate from Archive PR399 and real native Timer PR389.

## New implementation

[PR401](https://github.com/MariosGiannakaras/Narro/pull/401), branch `fix/ci-windows-artifact-provenance-20261021`, exact head at submission `86969a9b6c6d7514ccc3072ac00e77848e01969e`, base `5f6e6d83f5d5b7d94e40fee8ce9348dccb08ca11`. Five files:
- New `scripts/write-ci-artifact-manifest.mjs` builds portable deterministic machine-readable SHA-256 inventory, carries 40-hex source HEAD and GitHub Actions run/attempt, file byte sizes. Families: physical validation EXE + at least one MSI and NSIS installer, automatic M7 validation EXE + README, M1 diagnostic EXE + three native test scripts + three shipped docs. Rejects absent/empty files and malformed source/run identity. Records actual bytes, not merely filenames.
- New `scripts/test-ci-artifact-manifest.mjs` runs with self-generated temporary files and tests all three families, content hash sensitivity, deterministic output, absence/empty rejection, missing MSI and invalid identities.
- `package.json` adds the tests to the **existing** `preflight:frontend` before the mandatory final compile, so a cheap failure blocks the expensive Windows candidate.
- `.github/workflows/ci.yml` writes the manifests **after** existing M7 physical/automatic smoke and M1 diagnostic isolation. Uploads manifests **inside their existing artifact ZIPs**. PowerShell checks native Node subprocess return codes. No new expensive packaging variant or dropped native gate.
- `scripts/test-ci-tiering.mjs` asserts each artifact manifest is produced before matching upload and verifies the tests stay part of fast preflight.

**Grounding:** Historical successful Windows candidate `39647102464` job `119385915899` logs prove physical artifact creation of both `src-tauri/target-physical/release/bundle/msi/Narro_0.1.0_x64_en-US.msi` and `nsis/Narro_0.1.0_x64-setup.exe`. Source/test/wiring static cross-file checks passed; **full executed tests are NOT YET claimed**.

## Acceptance / restrictions

At PR submission, exact-head Windows CI `39674664763` was QUEUED (not PASS). Require actual validation + fast + Windows candidate **3/3 SUCCESS** on the current PR head before expected-head guarded merge. Because workflow semantics changed, run/document resulting-main validation and artifact identity. Do not mark M7 or PA physical Windows acceptance PASS from manifest creation alone. New manifests are provenance **records**, not code signatures/attestations or standalone evidence of native behavior. All Narro runtime, storage, Spectrum Core Create/Edit List color picker/upload/218 offline icons unchanged. M11/M12 remain dormant. Mandatory 4/10 milestone truth unchanged.

**Other active source:** PR399 `a9e479f52586fe364fa3ce640d11358ac25f1e05` reconciled to accepted main (5 unique files), exact Windows CI `39673179963` validation+fast SUCCESS, Windows RUNNING. Old head `4a8dd09e...` cancelled attempt, no acceptance. PR389 native compositor physical **4/8 FAIL** independently.

**ONE NEXT ACTION:** Diagnose the first failed CI job at current exact PR401 SHA if fast FAIL; otherwise continue independent work while its Windows candidate runs. Merge only after 3/3 PASS and expected-head guard, verifying resulting-main workflow semantics. PR399 merge becomes unblocked independently on its own exact-head 3/3 PASS.
