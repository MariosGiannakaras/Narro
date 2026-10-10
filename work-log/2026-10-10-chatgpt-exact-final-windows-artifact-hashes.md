# 2026-10-10 — exact Windows candidate bytes for 8/8 pre-Codex physical acceptance

## Verified provenance

- Repository `MariosGiannakaras/Narro`, [PR #301](https://github.com/MariosGiannakaras/Narro/pull/301) exact head `5a1a0740b203ecc90dbe2cc21f5a425012a3b5c3`, [Windows CI run 38037669076](https://github.com/MariosGiannakaras/Narro/actions/runs/38037669076), all three jobs SUCCESS, expected-head guarded merge `f921d1e1c716e1c9404265604f23432c19949dfe`.
- GitHub artifact `narro-m7-physical-windows-x64` ID **`11665317023`**. Downloaded **actual ZIP bytes** from artifact via connected GitHub client into this session and computed SHA256 directly, without relying on a filename inference. ZIP contains exactly 3 regular files; direct hash of each uncompressed payload computed via Python zipfile streaming (no Windows execution here).
- ZIP SHA256: **`d967d05f3ce7c1d831d30e2c5b9a7d4fee1d9baf983a7b5f17075b76b1d0b738`** (15,323,987 bytes).
- `narro.exe` SHA256: **`4768a9b77ad9826f8190a38bc85aeda93baf8f0d662a097dc4b73dc95dcab540`** (15,877,632 uncompressed bytes).
- `bundle/nsis/Narro_0.1.0_x64-setup.exe` SHA256: **`b41f07c5f1ec9e077c72c272fbd1ca264a0b343c7c0af946e127c69466e420ad`** (4,101,538 bytes).
- `bundle/msi/Narro_0.1.0_x64_en-US.msi` SHA256: **`204aa797dfc2a91a7869e16bbced1f98fff56ce31e4a893c74fe7e43320befd7`** (5,791,744 bytes).
- The production/source of that exact accepted PR head was independently matched to merged main: **16/16 changed source/test blob hashes identical**. Source-level equivalence is not physical runtime acceptance.
- Separate push-triggered resulting-main Windows CI [38040736709](https://github.com/MariosGiannakaras/Narro/actions/runs/38040736709) was in progress at artifact hash collection; check its exact result, do not infer PASS from PR head.

## Codex safety and next action

When user restarts separate paused Codex physical Windows agent, use the above exact artifact, confirm ZIP and any launched EXE hash after extraction, preserve the prior production user DB/profile and OS settings, conduct bounded consolidated physical regression as enumerated in `HANDOFF.md`, and store real video/screenshots/native state/restore evidence. CI1046 older candidate hash is **different code** and its bounded historical PASS cannot stand in for this package. Do not auto-run manual/native checks from this ChatGPT session or mark M1/M6/M7/M8/M9 physical gates PASS. Optional original Blitzit M11 live audit is not activated.
