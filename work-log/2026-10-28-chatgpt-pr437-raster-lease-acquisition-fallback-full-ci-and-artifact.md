# PR437 raster-acquisition early-failure native placement guard — exact 3/3 Windows CI and physical candidate (2026-10-28)

**Owner:** ChatGPT, source-only implementation and CI. Windows physical operator: user-owned, NOT RUN. [Draft PR437](https://github.com/MariosGiannakaras/Narro/pull/437) existing branch `integration/m7-v4-current-timer-20261027`, exact **HEAD `a019293deab7677f6e337c7b9e63b6ba04081f82`** confirmed IDENTICAL to live branch on this receipt. **No PR merged to main.**

## Real source edge and scoped fix

After earlier `ac40da8bdc08a32a2de6fe500b3c0921a0ecf030` native compositor+React/Timer integration passed exact [CI40597713109](https://github.com/MariosGiannakaras/Narro/actions/runs/40597713109) 3/3 and physical build independently verified, a targeted audit found a native placement error-path hazard. During `FocusSurfaceCoordinator.requestMode` the `beforeNativeCommit` callback calls `prepareFocusSurfaceModeRaster(targetPresentation)` **before** assigning `rasterToken`. If capture/lease acquisition fails, no native Focus presentation has committed, but the generic `commitPreparedFocusPresentation` restores `previousPresentation` through `applyNativePresentation(previousPresentation)`. Previously its `rasterToken === undefined` fallback always reissued `applyFocusSurfacePresentation(previousPresentation)`. That second redundant placement can trigger a further failure (e.g. disconnected preferred Panel monitor), masking the actual first acquisition failure. No physical reproduction on current candidate is claimed; this is a direct source-owned error-path invariant.

**Minimal repair** on existing PR437 branch: in `src/FocusSurfaceCoordinator.tsx`, the no-lease native fallback now invokes `applyFocusSurfacePresentation(next)` **only if `next !== previousPresentation`**. If a native raster lease exists, the existing protected rollback and final release sequence is unchanged. No Rust compositor change, no monitor key/AppData/SQLite mutation, no deliberate movement/position setting in no-lease restore, no Spectrum Core changes. Added `scripts/test-focus-mode-transition.mjs` regression for both acquisition failed/no redundant native placement and lease-acquired failure/still-required native rollback, plus a source contract tied to actual coordinator implementation. Diff from previously green source is exactly **2 files**. New commits `03c59f132e933a83c5403835e0190cc29d353843` and `a019293deab7677f6e337c7b9e63b6ba04081f82`.

## Exact replacement CI proof

[GitHub Windows run40601731554](https://github.com/MariosGiannakaras/Narro/actions/runs/40601731554) at `a019293deab7677f6e337c7b9e63b6ba04081f82` **COMPLETED SUCCESS: validation-gate PASS, fast-gate PASS, windows-candidate PASS (3/3)**. This includes frontend/contract regressions, Rust Check, Clippy, Rust tests, performance harness, actual Windows visual fixtures, packaged Focus runtime, Tauri release, physical build and diagnostic build. The previous exact-head CI40597713109 remains PASS for the previous SHA; new green run alone validates the new two-file source difference.

## Independently downloaded exact artifact provenance

[Physical Windows artifact12779751010](https://github.com/MariosGiannakaras/Narro/actions/runs/40601731554/artifacts/12779751010) from same source/run:
- Original ZIP **15,992,463 bytes**, SHA256 **`eff1effc55dbcf5110dc27373001fe3fea1af6527ee82f4f417da2fd5a60922c`**, matches GitHub Actions published digest. ZIP CRC `testzip() == None`: **PASS**.
- Embedded `artifacts/ci-provenance/physical.json`: schema `narro-ci-artifact-provenance/v1`, `kind=physical`, source SHA `a019293deab7677f6e337c7b9e63b6ba04081f82`, run ID `40601731554`, attempt **1**: **PASS**.
- `src-tauri/target-physical/release/narro.exe`: **16,507,392 bytes**, SHA256 **`f6d272dfae3b4818d35578e722f73818d5ad8e59369b72ab48e54ae31a500212`**, exact manifest PASS.
- `Narro_0.1.0_x64_en-US.msi`: **6,033,408 bytes**, SHA256 **`979fff78496ef78987aeb295fb8920e42f46d0078a4d54526be1da662438fa59`**, exact manifest PASS.
- `Narro_0.1.0_x64-setup.exe`: **4,285,517 bytes**, SHA256 **`21e5c2891b7f35bac9a91f27f9eaa811c869a38753055a2cfdbd80f3facce116`**, exact manifest PASS.

**Boundary:** Artifact identity and full Windows automation do not establish perceptual DWM/Blitzit parity, native Windows interaction PASS, or permission to merge protected draft PRs. Original A/PR389 B/PR419 controlled A/B physical source evidence and PR431/436/418 identities remain separate. User exclusively controls own native test timing; no assistant native session installed/operated.

**Next source-only action:** live-check any new source owner changes before acting, then choose the next *evidenced* independent M5–M9 source gap; avoid speculative compositor rewrites now that PR437 exact source and CI pass. PR437 stays DRAFT/UNMERGED pending existing repository gates, as do PR389/419/431/436. Official M1–M4 **4/10** accepted, M5–M9 still OPEN, M10 approval gate, M11/M12 dormant.
