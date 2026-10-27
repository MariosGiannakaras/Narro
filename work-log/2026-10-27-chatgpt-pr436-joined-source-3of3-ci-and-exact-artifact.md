# PR436 + latest PR431 — exact combined-source CI SUCCESS and independently verified artifact (2026-10-27)

**Source owner** ChatGPT. **Task** Reconcile the native four-corner Timer snapping into latest PR431 without rewriting accepted M7 sources. **Existing PR436 branch:** `feature/m7-timer-four-corner-snap-20261027`, merge-head `a31d11d0b0c1304eb3ac201ad708954fcb303c91`, first parent original PR436 `aa6c562af315da5426f672761b158762111638a7`, second parent exact PR431 `3c3b72b06eaa841bce9429dace83a6b5c33ba701`.

## Exact source and CI

- Compared the new merged source tree with PR431 head: **six feature-owned deltas only** (`src-tauri/src/lib.rs`, `windows/mod.rs`, `windows/topology.rs`, the floating-movability contract, additive snapping acceptance doc, immutable original snapping log). PR431 V10 fix, M8 model/screenshot and original persistence semantics remain present.
- GitHub [CI40579536904](https://github.com/MariosGiannakaras/Narro/actions/runs/40579536904) at **exact a31d11d0**: **completed SUCCESS 3/3** (validation-gate, fast-gate, windows-candidate). Windows native Rust check, strict Clippy, complete Rust suite, performance harness, actual visual fixtures, packaged Focus runtime, Tauri release and physical-validation release all passed in that candidate. Older PR436 CI40520665995 PASS remains scoped to obsolete PR431 parent.
- No source error/FALSE PASS normalization. No code change to existing PR389/419 controlled A/B candidates. No PR-to-main merge.

## Independently recomputed physical build provenance (source artifact, NOT a user-native interaction)

- Run physical artifact **12770756186**, ZIP **15,859,156 bytes**. GitHub SHA256 and independently recomputed actual ZIP bytes **a093cea4bc9a1fafeb480e20d2ff8dcc7c676fd6255847f0125a881c1a593cbd** match, archive CRC PASS.
- Embedded `artifacts/ci-provenance/physical.json`: `kind=physical`, `sourceSha=a31d11d0b0c1304eb3ac201ad708954fcb303c91`, `githubRunId=40579536904`, `githubRunAttempt=1`. Manifest source/run/attempt fields and all member byte sizes/SHA256 independently asserted PASS.
- `src-tauri/target-physical/release/narro.exe`: **16,302,080 bytes**, SHA256 **393786585ea36995baa536f9ce469f99816856ad3fe7fb848f00fe96078c9bed** PASS.
- `Narro_0.1.0_x64_en-US.msi`: **5,980,160 bytes**, SHA256 **baff7a412abdce394f0612f6da2b0f6037937bcbf2e41747b9d0c82d6ee8a641** PASS.
- `Narro_0.1.0_x64-setup.exe`: **4,253,193 bytes**, SHA256 **8f08846ccdb22a7e1f105cc0dad1ad422f98707e49bf864a67cf900a93f21b4d** PASS.

## Independent work priority

Per latest user direction **ChatGPT does not schedule, operate, track, or wait for external physical Windows testing.** It continues the next source-only task: current-main reconciliation of the pure Motion v4 PR418 source contract (`5f0723a50aa1fe07e85211443ad63dfe17892f70`, CI40581635526 pending on Windows as this log was written), then guarded source-only main merge if 3/3 valid and no runtime/native gate, resulting-main CI, and further proven owner/source dependencies. PR389/419 native compositor remains separate and cannot be declared visually accepted from CI or 8/8 recorded functional route checks.

Official roadmap: 4/10 formal milestones accepted M1–M4, M5–M9 open; M10 requires later permission, M11/M12 optional dormant.