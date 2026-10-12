# 2026-10-12 — Merged U21 exact-main production archive independent byte/hash proof, final Windows diagnostic CI pending

**Source and automation:** `334566f2a41293c458353991d99d968ad5fa9ad1`, [resulting-main Windows CI 38231906248](https://github.com/MariosGiannakaras/Narro/actions/runs/38231906248). Prior exact PR338 head `10d5370ac92a2e5be2ee696c04ba28ea368f4ae6` passed 3/3 and was expected-head guarded squash merged with **18/18 matching Git blobs**.

**Already passed in this exact resulting-main run:** validation-gate SUCCESS, fast-gate SUCCESS; Windows job: Rust tests / visual regression / Tauri release / packaged Focus runtime / production physical validation release / verify physical validation build / upload artifact all completed before the last diagnostic stage. [Rendered main visual CRC+identity proof](work-log/2026-10-12-chatgpt-u21-merged-main-visual-crc-and-break-proof.md) is independent of PR-head visuals.

**Actual production archive from this same main CI:** [GitHub artifact `narro-m7-physical-windows-x64`, ID 11739519083](https://github.com/MariosGiannakaras/Narro/actions/runs/38231906248/artifacts/11739519083); downloaded and independently inspected:
- ZIP size **15,335,348** bytes; CRC **PASS**, GitHub advertised artifact digest and independently calculated SHA256 both **`a2c21cd7718202313dfd3180404f772d9d685f5708ac1f8085a126327cc87f5f`**.
- `narro.exe` **15,881,728 bytes**, MZ PE header, SHA256 **`941a940ac515f38c886b8c9b9203199f617ef34ef190e0af310c203535b2e395`**.
- `bundle/nsis/Narro_0.1.0_x64-setup.exe` **4,107,116 bytes**, MZ PE header, SHA256 **`b8bab72b7bf44301ac25a3460a4aaec1e83a11e6a1d7be34c79124f356baeb78`**.
- `bundle/msi/Narro_0.1.0_x64_en-US.msi` **5,795,840 bytes**, OLE CFB MSI magic, SHA256 **`a766bc8a270b2dd64342800845f19e5c6af7964f59a8c29c1933b2efc9ef61dc`**.
- **Three members, no CRC failure, no missing named package**.
- All four hashes differ from earlier exact PR-head/earlier post-#333 output where appropriate; do not borrow old hashes. No native/user-run installer smoke was attempted.

**CRITICAL PENDING GATE:** At the time these exact bytes were checked, Windows CI run 38231906248 was **IN PROGRESS** in `Build M1 Diagnostic Validation Release`; validation+fast SUCCESS but **overall Windows candidate NOT FULL PASS**. The actual bytes are verified, but **do not mark production acceptance or replace safe physical-session pin until entire resulting-main Windows CI shows all 3 SUCCESS**.

**Next exact action:** inspect final 38231906248 job/step results; if full 3/3 success, update `docs/CURRENT_WINDOWS_RESIDUAL_PHYSICAL_SESSION.md`, `docs/PRE_CODEX_RISK_AUDIT_2026-10-11.md`, `HANDOFF/TODO/STATUS` with this exact source, artifact, four hashes, and add a **new** immutable CI-finalization addendum (do not edit this log). If diagnostic fails, capture first actual error and keep candidate unaccepted.

Physical PA-01–09 USER-PAUSED / NOT RUN, mandated milestone 3/10, M10 blocked, M11 hard opt-in dormant; source-original Blitzit current parity remains open. Spectrum Core Create/Edit List color picker, uploads and 218 offline icons untouched.
