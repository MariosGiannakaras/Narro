# 2026-10-13 — PA-09 offline visual-evidence correction PR #345: merged-main accepted

**Scope/owner:** ChatGPT PA-09 *existing source evidence to current-release visual fixture* review. This log proves a source/test/fixture visual-regression correction and resulting-main CI, **not** full source-version Blitzit parity, PA-09 physical acceptance or PA-01–08 Codex session completion.

## Provenance

- [PR #345](https://github.com/MariosGiannakaras/Narro/pull/345), branch `fix/pa09-shortcuts-modal-visual-evidence`, final exact-head `7b69c6ca7f85b550f5817e26338441d6f32494b7`; 7 modified tracked source/test/fixture files.
- [PR Windows CI #38350431624](https://github.com/MariosGiannakaras/Narro/actions/runs/38350431624) exact-head **validation/fast/windows 3/3 SUCCESS**. Superseded [run 38318531339](https://github.com/MariosGiannakaras/Narro/actions/runs/38318531339) first attempt Finding33 CDP Page.navigate transient FAIL, attempt 2 later CANCELLED following code push; neither is falsely labeled PASS.
- Guarded squash merge with expected PR head above: `fa0631437ec1c1ca9be6ec668a1ee4bb0bb30ff4`. All **7/7 changed Git blobs** independently compared to the exact PR-head blobs and matched at that merged commit; protected Spectrum Core list picker/image/218 icons never changed.
- Exact merged-main [Windows CI #38352569404](https://github.com/MariosGiannakaras/Narro/actions/runs/38352569404) for merge SHA above: **validation-gate SUCCESS, fast-gate SUCCESS, windows-candidate SUCCESS** (3/3).
- Actual resulting-main physical Windows artifact [11793015622](https://github.com/MariosGiannakaras/Narro/actions/runs/38352569404/artifacts/11793015622), ZIP **SHA256 `f2e32226c7d155fc722ac47ef5d3e1b3e282ba390c86213156b503103b264d49`** matches published GitHub digest, **3/3 archive entry CRC PASS**:
  - `narro.exe`: 15,919,616 bytes, PE MZ, SHA256 `2f40760ace3379c58fdd2a79f0e40bd22bde5abf2bd1cb0f05510e54f7bb5a31`
  - `bundle/nsis/Narro_0.1.0_x64-setup.exe`: 4,108,634 bytes, PE MZ, SHA256 `319bfba95a43e90bfd8a5938fbea0b6c22124dc4f0839df1ff6009165aa4f157`
  - `bundle/msi/Narro_0.1.0_x64_en-US.msi`: 5,795,840 bytes, OLE CFB MSI magic, SHA256 `ba182d4bd3af86bac33f527b86dbf4fb2dcdb8471c1610f91dc78c9f0a282563`
- Exact resulting-main visual artifact [11791804196](https://github.com/MariosGiannakaras/Narro/actions/runs/38352569404/artifacts/11791804196), ZIP **SHA256 `baf7ff112007f493257e165c8b3c1819f843bf7a4b73ed2dc73be3a4591efcf8`** equals GitHub digest, **341/341 CRC PASS, 168/168 PNG decodable with 0 wholly single-color images**. Dedicated `theme-settings-shortcuts-dialog-dark/light` DOM each proves true modal, ready state, hidden accessible-only toggle labels, **3 global plus 7 app rows**; PNG each 1280×720 with respectively **617 and 586 distinct RGB colors**. `theme-settings-preferences-upper/middle/lower` each 1280×720, DOM ready and hidden accessible names, respectively **1548 / 881 / 1130 distinct colors**; the two previously entirely blank screenshots now render actual controls.
- This release artifact was downloaded into the active analysis environment and re-verified independently; no runtime install, native launch, or production AppData changes performed by this PA-09 reviewer.

## Corrections closed and remaining boundaries

1. Missing standalone Shortcuts modal screenshots: **FIXED/AUTOMATED PASS** with dark/light source-backed captures, real modal semantics, three global and seven app-only shortcut rows; ordinary shortcut persistence/registration untouched.
2. Two formerly uniform-grey accepted Preferences screenshots: **FIXED/AUTOMATED PASS** via fixture-only viewport positioning and nonblank decoded-PNG guard.
3. Visible spill of global-toggle screen-reader-only labels discovered in interim modal screenshots: **FIXED/AUTOMATED PASS** via scoped CSS and actual bounding-rectangle assertions, retaining accessible labels.
4. Offline existing-source screenshot inventory **22/22 current Blitzit v2.6.69 images directly sampled**, but like-for-like same-state/pixel matching, version-specific 19 source-video animation/hidden-interaction reconciliation, contemporary unseen behavior and separate physical **PA-09 source parity remain OPEN**. M11 is optional/dormant.
5. Independent Codex **PA-01–08 physical capture has resumed and has its own confirmed failure triage and owner**, reflected in current HANDOFF. This PR neither overrides those findings nor marks any native milestone PASS. Exact mandatory milestone count remains **3/10 physically accepted**, not 10/10.

**Independent acceptance:** PR #345 source fix / exact PR-head CI / guarded merge / resulting-main CI / ZIP and image artifact integrity **COMPLETE**. No further PR #345 corrections are required absent new evidence. Continue only independently documented PA-09 gaps, preserving Codex owner scope and user-approved Spectrum Core.
