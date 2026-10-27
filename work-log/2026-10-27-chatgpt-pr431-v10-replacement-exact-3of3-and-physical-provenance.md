# PR431 missing-monitor V10 correction — exact 3/3 Windows CI and independently checked physical binary (2026-10-27)

**Owner:** ChatGPT source/CI and manifest inspection; Windows physical operator separately. **Open PR431** `fix/user-reported-visual-topology-20261026`, source SHA `50ebef094ee392b13d958586f8c074a57de9e015`; [GitHub Actions run 40546804802](https://github.com/MariosGiannakaras/Narro/actions/runs/40546804802), **COMPLETED SUCCESS: validation PASS, fast PASS, windows-candidate PASS (3/3)** at precisely this SHA. Prior Rust-formatting FAIL run40546500885 is an unchanged historical FAIL, not counted as success.

## Physical artifact provenances (actual independently downloaded bytes)

- [Physical build artifact 12753914605](https://github.com/MariosGiannakaras/Narro/actions/runs/40546804802): `narro-m7-physical-windows-x64`, GitHub advertised archive digest `sha256:0b12745d986399f0bd6df049ae7bb403d8672b4475a3af7331acd523dbee6a24`.
- Artifact ZIP downloaded and its whole-file SHA256 independently matches `0b12745d986399f0bd6df049ae7bb403d8672b4475a3af7331acd523dbee6a24`; ZIP CRC `testzip() == None`, four members.
- Read artifact-owned `artifacts/ci-provenance/physical.json`: schema `narro-ci-artifact-provenance/v1`, `kind=physical`, `sourceSha=50ebef094ee392b13d958586f8c074a57de9e015`, `githubRunId=40546804802`, `githubRunAttempt=1`.
- Manifest vs actual member bytes independently recomputed:
  - `src-tauri/target-physical/release/narro.exe` **16,343,040 bytes**, SHA256 **`d069bb862a42a04a5554aea793f3c16e839cd34fd14e48817a18095b6d5dde97`**, **PASS**;
  - MSI `Narro_0.1.0_x64_en-US.msi` **5,955,584 bytes**, SHA256 `4e3b8b2f07a3b260a0effc432071603990e86caf0a4c5397c6ed48df2bd30759`, **PASS**;
  - NSIS `Narro_0.1.0_x64-setup.exe` **4,233,458 bytes**, SHA256 `88bc7cbc688bff361cee3508633c429761ff48754aa79f71f1b5623b6a229538`, **PASS**.
- **No native Windows app interaction performed on the replacement executable**. Artifact provenance verifies content+build identity only.

## Scoped next operation and unchanged holds

The 2026-10-27 Codex physical predecessor PR431 candidate `6dce8daa...`/PE `4acd49ce...` has independently adjudicated **9 bounded PASS / 1 FAIL (V10/P431-10)**. Confirmed old-build FAIL: disconnected selected LG when Ctrl+Shift+T first reveals the hidden Panel prevents the Timer with `MONITOR_SELECTION_STALE`. The current source correction directs the *initial hidden Panel shortcut reveal* through existing stale-only primary-monitor fallback, preserving selected monitor key/side, normal strict explicit selector behavior, session drag state, restart opt-in and rollback; regression source and Rust policy tests passed CI. **V10 replacement physical remains NOT RUN** and old-binary FAIL remains historical FAIL until rerun.

**Exact next operator action:** safe, isolated Windows process / source-matched PE `d069bb...`; saved LG selected, optional Timer position OFF; disconnect LG only with safe user/operator authorization and profile guards; genuine first hidden Focus Ctrl+Shift+T; independently grade fallback to primary Panel→Timer, current HWND/visible bounds, saved key/side unchanged, reconnect restoring original LG, plus failure logs. No blanket re-recording of unaffected nine PASS cases. If no authorized Windows operator is available, mark PHYSICAL_NOT_RUN and hand off this exact candidate. No physical acceptance/merge of PR431, PR389, PR419 or PR436 can be inferred from green CI. PR436 is still stacked on obsolete source `6dce8daa` and needs reconciliation with `50ebef09` after the PR431 native hold. User-directed monitor model labels U-R04 and in-frame real preview U-R05 remain planned source work, not validated. M1–M4 formal 4/10, M5–M9 OPEN, M10 user approval hold, optional M11/M12 dormant.
