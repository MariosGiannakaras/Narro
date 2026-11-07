# Narro archival media cleanup — superseded CI893 full recordings (2026-10-30)

Owner: ChatGPT evidence-retention cleanup. Parent main `84b781f78718bc2be46a11a91bd6683b2e2370fd` (PR449 already integrated).

## Retirement

- Deleted **24** historical full-stream MP4 recording pieces under `work-log/evidence/m7-ci893-20261003/video/recording-[1-4]/part-NNN.mp4`.
- **967,345,975 logical bytes** removed from current checkout. This is only a retired, dated **Narro** physical UI candidate (CI893 / PR225); not original Blitzit source media.
- CI893's accepted/rejected physical claims were documented for source `549536c4d19b0045a928652d3feff53162f55a6e`; current active PR389, PR419, PR431, PR436 and PR437 descriptions do not name CI893 as their outstanding exact candidate or required physical gate. Prior dated PASS/FAIL remains historical; no claim that current M7/Windows acceptance is complete.

## Evidence retained in current tree

- The **nine scoped extracted motion MP4 clips** and **47 PNG/JPG visual evidence images**, `motion/index.json`, four `video/recording-*/segments.csv` alignment indexes.
- `video-provenance.json` with recording names/hashes, `manifest.json`, `frame-index.json`, logs, `actions.jsonl`, physical task ledger, performance results and historical result documents.
- New Git tree post-removal has **0** targeted full-video pieces. The CI893 package still has **110 files** and its retained content occupies **40,373,685 bytes**.
- Git tree hashes remained identical for `reference/` (`46dea0c640cbfc17003acf439d96f503a5c39410`), `src/` (`715f8a0acc5bab9a170d3c55d683f3dcb64d0e90`), `src-tauri/` (`d15e3d16751fee44dc494b406235e482011022c5`) and `tests/` (`229d81ddd95bfae21db7c05e60452e02ca1a0709`).

## Recovery / limitations

- The **exact deleted MP4 bytes** remain retrievable from Git commit `84b781f78718bc2be46a11a91bd6683b2e2370fd` or from historical blobs. Preserve frozen README, logs and manifests as dated package descriptions: their full-video links are no longer guaranteed in current checkout.
- This avoids retaining a large obsolete full-length recording *only because* it was once captured. If new investigation establishes a genuine use, restore the precise required historical files under a scoped evidence exception.
- No Git history rewrite; old objects still consume historical Git storage. No production/build/test/fixture/CI/script input modified. New native Windows execution/physical acceptance **NOT RUN**.
- Further historical binary inventories should use an actual consumer and source-provenance allowlist, not bulk extension or age deletion. All original Blitzit data and pending exact-build physical candidate resources stay protected.
