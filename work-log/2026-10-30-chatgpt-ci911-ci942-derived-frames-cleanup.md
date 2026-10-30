# Narro evidence cleanup — regenerable CI911 / CI942 motion PNG exports (2026-10-30)

Owner: ChatGPT, evidence-retention workstream. Baseline `main` commit `13968e5d83d8688541253588241b717c6fd8ff3b` (after merged PR445–448). No source or Windows-acceptance ownership change.

## Verified deletion allowlist

- `work-log/evidence/m7-ci911-20261004/motion/*/frame-NNN.png`: **1,980** decoded frame exports, **49,925,912 bytes**.
- `work-log/evidence/m7-ci942-20261004/motion/*/frame-NNN.png`: **840** decoded frame exports, **75,689,519 bytes**.
- **Total: 2,820 tracked files / 125,615,431 logical bytes**. The paths are Narro-generated frame outputs, not original Blitzit material or runtime/visual-test fixture input.
- These original snapshots described all PNGs as available at the time of capture; historical README, immutable outcome logs, `manifest.json` and `motion/index.json` remain frozen, not silently rewritten. Their references to deleted frame paths refer to historical Git, not the current checkout.

## Preservation / reconstruction

- Original Narro source MKV parts, `video-provenance.json`, actions, native logs and per-sequence `provenance.json` remain.
- CI911: **8 raw-video parts**, **66 contact sheets**, `motion/index.json` and original README remain; current tree **0** targeted generated PNGs.
- CI942: **11 raw-video parts**, **28 contact sheets**, `motion/index.json`, original README and byte-identity metadata remain; current tree **0** targeted generated PNGs.
- Exact historical copies recoverable from `main` commit `13968e5d83d8688541253588241b717c6fd8ff3b`; regeneration can use original video/PTS/provenance.
- Git root subtree SHA unchanged for protected `reference/` (`46dea0c640cbfc17003acf439d96f503a5c39410`), app `src/` (`715f8a0acc5bab9a170d3c55d683f3dcb64d0e90`), `src-tauri/` (`d15e3d16751fee44dc494b406235e482011022c5`), and `tests/` (`229d81ddd95bfae21db7c05e60452e02ca1a0709`).
- Validated deletion against exact Git tree and existing source/provenance/contact sheet paths; does not imply Windows/native acceptance PASS. Git history is **not** rewritten, so old Git objects remain.

## Remaining retention work

This is one strictly bounded deletion slice, **not** a claim that all obsolete historical Narro media have been inventoried or removed. Additional older binary captures/ZIPs remain. Inspect active acceptance/PR consumers and original Blitzit provenance before deleting further files, and keep reproducibility receipts. Preserve PR389/419 physical-before-merge holds, PR437 Windows acceptance dependencies and all historical immutable verdicts.
