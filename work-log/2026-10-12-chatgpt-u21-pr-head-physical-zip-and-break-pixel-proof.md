# 2026-10-12 — U21 exact PR-head Windows artifact and rendered Break proof (NOT final main candidate)

**Exact source:** [PR338](https://github.com/MariosGiannakaras/Narro/pull/338) `10d5370ac92a2e5be2ee696c04ba28ea368f4ae6`, [CI run 38228307088](https://github.com/MariosGiannakaras/Narro/actions/runs/38228307088), validation / fast / Windows **3/3 SUCCESS**. Guarded merged later to `334566f2a41293c458353991d99d968ad5fa9ad1`, **18/18 source/test blob equality**. This log adds independent downloaded artifact examination, not a source/current-Blitzit or physical native PASS.

## Downloaded exact PR-head physical ZIP

[GitHub Actions artifact 11738476201](https://github.com/MariosGiannakaras/Narro/actions/runs/38228307088/artifacts/11738476201), `narro-m7-physical-windows-x64`, downloaded unmodified and inspected as ZIP locally:
- ZIP 15,332,705 bytes; full ZIP SHA256 **`55ec43b6688bdb0eb24e2c24ffe64229502784c4aa177d910d22565d91abaa0b`**, matches GitHub artifact digest; all members CRC PASS.
- `narro.exe`, 15,881,728 bytes, valid MZ PE header, SHA256 **`a5489c30efed5053c3f2f74ed75772bb04e79c51521108f86a21d33e4e5d116b`**.
- `bundle/nsis/Narro_0.1.0_x64-setup.exe`, 4,104,506 bytes, MZ PE header, SHA256 **`a757676fdd5879251afc4356cccad906453b6ee6021f9f65200de9e57127abad`**.
- `bundle/msi/Narro_0.1.0_x64_en-US.msi`, 5,795,840 bytes, OLE CFB MSI header, SHA256 **`d7e94377b6e86fe1804b8583cb467ae464ea34c0306daa30d9f86a81c1a910dc`**.
- **These are verified PR-head bytes ONLY, not resulting-main packaged artifact/hash evidence.** Do not pin or stage as current physical candidate when the resulting-main [run 38231906248](https://github.com/MariosGiannakaras/Narro/actions/runs/38231906248) is pending.

## Rendered visual artifact

[GitHub artifact 11737324243](https://github.com/MariosGiannakaras/Narro/actions/runs/38228307088/artifacts/11737324243) `narro-m5-visual-regression`, downloaded ZIP 333 entries, ZIP SHA256 **`12cd2467b15c1e610e308593de6a703123187d98b2433567a0ed105b4fdb75fb`**, matches GitHub digest, CRC PASS.

- Both Break screenshot PNGs, 420×720, light 33,005 bytes and dark 31,996, are **bitwise identical** to their counterparts in the prior failed run 38222942950's real diagnostic artifact. Thus the subsequent Focus/Edge reliability corrections did not silently change the captured Break pixels.
- The Break HTML DOM in both themes includes `data-focus-break-card="true"`, `data-focus-break-suspended-work="true"`, same `data-task-id="21111111-1111-4111-8111-111111111111"` on active and suspended cards, `data-focus-reorderable="false"`, no `data-focus-drag-task`, **5/5 disabled row buttons**, and `1/5 Done` progress consistent with running. Direct visual inspection shows correct separate Break heading and queued original work.
- In the prior failed run, Notes-expanded light screenshot was 2,353 bytes and unmounted React HTML. Here Notes-expanded light PNG 34,096 bytes and HTML includes actual `data-focus-panel-fixture-ready="true"` + `data-task-notes="expanded"`. Dark Notes also mounted. This substantiates the browser capture fix in an actual Windows Edge run, not merely static assertions.
- No conclusion about exact current original Blitzit v2.6.69 visuals/motion or physical native WebView2 behavior follows from these Edge fixtures.

## Remaining exact acceptance

Latest resulting-main `334566f2a41293c458353991d99d968ad5fa9ad1` [Windows run 38231906248](https://github.com/MariosGiannakaras/Narro/actions/runs/38231906248) **NOT FULL PASS at this artifact-inspection checkpoint**. When complete, inspect actual result, independently download *its* production ZIP (not this PR one), CRC+SHA256 check actual ZIP/`narro.exe`/NSIS/MSI and repin current physical candidate. Preserve user-paused Codex PA-01–09, mandatory milestone 3/10, optional M11 dormant, approved Spectrum Core Create/Edit List Color Picker/icons/photos unchanged.
