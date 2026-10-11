# 2026-10-12 — Final post-#333 merged-source production Windows package SHA256 proof

## Exact integration provenance and test results

Current code+automated implementation campaign: **12/12 source/CI units validated, expected-head guarded merged**. Existing #333 PA-06 rejection-path alert listener correction was guarded-squash-merged into executable source `ef22a7e434bea6cc4849282aa46c4786d9d90663` (exact PR head `ae206afea9eaccd732d6b20bb4b3651d625ad9b6`, [PR run 38164122588](https://github.com/MariosGiannakaras/Narro/actions/runs/38164122588) validation/fast/Windows **3/3 PASS**, post-merge five changed Git blob SHAs **5/5 identical**). No approved user-owned List Editor/Spectrum Core implementation changes.

**Resulting-main full [CI 38173126053](https://github.com/MariosGiannakaras/Narro/actions/runs/38173126053)** on exact source `ef22a7e434bea6cc4849282aa46c4786d9d90663`: **validation-gate SUCCESS; fast-gate SUCCESS; windows-candidate SUCCESS**. This is actual merged-main source rather than feature-branch-only validation. Current documentation-only main `fd8a3a9eee750fa3d22389afcceefe65b3300e13` was re-compared to this executable source through **both complete, nontruncated Git trees**; all **603 non-Markdown, non-work-log blob paths exactly matched**, 0 changed/missing. Therefore later tracking/evidence-only commits did not invalidate the exact executable and workflow candidate.

## Independently downloaded actual production package (not copied historic SHA strings)

Downloaded GitHub Actions actual final [artifact `narro-m7-physical-windows-x64` ID 11715043831](https://github.com/MariosGiannakaras/Narro/actions/runs/38173126053/artifacts/11715043831), ZIP size **15,335,263 bytes**. Calculated SHA-256 from actual downloaded ZIP bytes; independently decompressed/streamed each ZIP member and hashed its entire actual contents, not just Github metadata or filenames. ZIP CRC integrity `testzip()`: **PASS**. GitHub artifact API digest `sha256:61f743d2f26baf92c665597b35e6f777ade4989884ed1af8c6aa644cb7cbbc9b` **exactly agrees** with independently computed ZIP digest.

| File | Bytes | Independently verified SHA256 |
| --- | ---: | --- |
| **Final production artifact ZIP** | 15,335,263 | `61f743d2f26baf92c665597b35e6f777ade4989884ed1af8c6aa644cb7cbbc9b` |
| `narro.exe` | 15,880,704 | `5015e01d69a5158be7ef7c89ed2d8fab18005bd484633a67aa1414a437955489` |
| `bundle/nsis/Narro_0.1.0_x64-setup.exe` | 4,106,401 | `8912dd83f42b0bddd25ac4d5d0c6e896975012ab708fb6295ec7e7d2f88cef16` |
| `bundle/msi/Narro_0.1.0_x64_en-US.msi` | 5,795,840 | `b7ab390c9907a080c5c666d5d2b115709391d7dfa8295a5736291a46f47d97fc` |

The previous post-#321 production ZIP `11710082342` and its hashes are **historical evidence for older executable source `c6a39d...` only**, not acceptable as the latest physical Windows candidate.

## Actual physical handoff and limitations

**Candidate is pinned and ready for a user-authorized physical validation session; physical Windows execution is USER-PAUSED and NOT RUN.** The above automated and archive-hash PASS does **not** establish Windows real install, native HWND continuity/morph/clipping, live timer expiry, Reports modal pending focus, monitor DPI/placement, native OS toast/sound, startup/restart/persistence, installer UI smoke, or canonical Blitzit visual/motion parity. Follow `docs/CURRENT_WINDOWS_RESIDUAL_PHYSICAL_SESSION.md` PA-01–09 matrix and `docs/PRE_CODEX_RISK_AUDIT_2026-10-11.md`, do not rely on `scripts/prepare-m7-physical-session.ps1`'s stale C5-only generated checklist. On authorized session use `-ExpectedSha256 5015e01d69a5158be7ef7c89ed2d8fab18005bd484633a67aa1414a437955489`, verify genuine production binary, back up actual user AppData, and record display/DPI/Windows/theme/motion environment before launch.

**M10 blocked** pending mandatory physical gates; source parity separately OPEN; optional M11 live Blitzit audit remains opt-in dormant. The U01/U02 approved Spectrum Core list picker/image/218 icons remains locked unchanged. Future source/runtime modifications invalidate this candidate binary identity and require new exact merged-source CI + fresh real artifact hashes.

## Durable continuation

Updated `HANDOFF.md`, `TODO.md`, `STATUS.md`, `docs/CURRENT_WINDOWS_RESIDUAL_PHYSICAL_SESSION.md` and `docs/PRE_CODEX_RISK_AUDIT_2026-10-11.md` with latest physical candidate pin. **Next non-physical action** is only evidence-based follow-up on specific U12 IANA timezone and separate U35/U40 safe semantic review if priority is independently established; do not automatically rewrite known safe functional/local rules or start optional M11. **Next physical action (user approval required):** release the Codex physical Windows session gate and run the full PA matrix on this exact verified executable. Preserve prior validated automated and historical physical evidence, do not silently mark remaining physical gates PASS.
