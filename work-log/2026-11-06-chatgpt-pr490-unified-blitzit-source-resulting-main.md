# PR490 — unified original Blitzit corpus; guarded merge and resulting-main verification

**Date:** 2026-11-06. **Owner:** ChatGPT source-organization/cleanup. **Outcome:** MERGED / exact-source CI PASS / resulting-main tree and original-blobs PASS; Windows native physical acceptance NOT RUN. **No new Narro archival deletion authorized or attempted.**

## Source consolidation

- [PR490](https://github.com/MariosGiannakaras/Narro/pull/490) branch `refactor/blitzit-unified-source-corpus-20261106` moved **86 source media files /256,345,969 logical B** to the sole canonical source directory `reference/original-blitzit/`, partitioned by provenance. Files were moved by reusing their *exact* Git blob IDs, **not copied/recompressed/transcoded**.
- `screenshots/`: **46 canonical PNG/JPG images**, exactly the 46 rows of `screenshots/CANONICAL_INDEX.md`, including 22 current supplied, 17 Help Center and 7 historical comparison screenshots.
- `videos/inbox/`: **19 MP4 +19 SRT**, every MP4 matching exactly one same-stem SRT, no unmatched media.
- `extracted-frames/`: **two VE005 derived PNG frames** (197,909 B and 176,553 B), explicitly *not* independently acquired screenshot originals.
- `SOURCE_MANIFEST.json` lists **86 original path → canonical path mappings**, Git blob SHA, file byte length, and raw/derived provenance. All 86 current `main` destination paths were re-fetched from the GitHub directory API, and **86/86 source blobs and byte lengths exactly matched manifest**.
- Old top-level siblings `reference/original-blitzit-screenshots/` and `reference/original-blitzit-videos/` **absent** from resulting-main root; `reference/` contains `narro-approved-designs/` and `original-blitzit/`. No Blitzit media remain under `work-log/evidence/`.
- Exact file list in PR: 115 changed paths: 90 Git-detected renames, 23 metadata/documentation/fixture modifications, 2 new index/manifest files. Only active source routes, readme/index, documentation, and `scripts/test-ci-tiering.mjs` checkout fixture touched; no actual product source/config/test weakening.

## Validation and merge proof

- PR head **`ca1d987c9c54785522a06b089a0d55fc23386dae`**, associated [Windows CI 42236971204](https://github.com/MariosGiannakaras/Narro/actions/runs/42236971204): **validation-gate SUCCESS, fast-gate SUCCESS, windows-candidate SUCCESS**, all at exactly that SHA.
- GitHub expected-head guarded squash merge: **`fb006202350bb6b7265d94c4fc3faad201bcb19c`**. Verified actual `main` equals this merge SHA, PR merged, and resulting-main **root Git tree `7dae731377afd329426917b2f1ee56dd1a81805f` exactly equals the validated PR head Git tree**. This is a whole-checkout tree identity proof, not a capped filename list.
- Independent file directory reads of resulting main: `screenshots/` **46 media** with two index/docs entries; `videos/inbox/` **38 media** with one README; `extracted-frames/` **2 media**; 86 total source assets; no mismatch to immutable manifest.
- Resulting-main GitHub Actions run for the merge SHA had **not appeared at time of this receipt**: **NO RESULT / NOT RUN as of check**. The successful exact-head PR CI and identical resulting-main tree are not reported as a separately executed main CI. Do not claim new native Windows physical PASS.
- The 27 existing tool-safety-blocked Narro evidence subtrees under `work-log/evidence/` were checked to have **27/27 unchanged directory-tree IDs** before merge; identical resulting-main Git tree guarantees the same. Current `work-log/evidence/` checkout: **4,065 Narro legacy files /2,340,643,868 logical B**, all retired from new recording use but still Git-tracked due to prior explicit safety refusal. The earlier 2 Blitzit VE005 frames **moved** to the reference corpus, not deleted. **Historical Narro file-retirement counter stays 32,536**; no new Narro evidence deletion in PR490.
- Original frozen 700-media/ZIP Narro cohort: **562 retired/138 retained** (historical family-path reconciliation); 138 are in blocked Narro folders. The two VE005 frames were **outside** this cohort. No source original or raw video data loss, no history rewriting or remote Git storage reclamation claim.

## Remaining blocker and exact next action

- User wants full retirement of obsolete Narro evidence. Previous 27-folder/**4,065-file** mass deletion and separate ten-family/29-media composite were explicitly safety-blocked by tools; **do not retry or circumvent**, even if the user reaffirms a broad deletion goal. Original Blitzit source files must never be deleted. Full evidence cleanup remains **OPEN 1/5**.
- Fresh PA-01–09 and affected PR389/419/437 Windows physical recordings: **NOT RUN / new capture required**; ordinary profile/AppData and physical PA pause remain protected. Source parity is not automatically accepted from moving original reference media.
- Next unblocked operation is to ensure `HANDOFF.md`, `TODO.md`, `STATUS.md` and active evidence routing reference **merged** PR490 and the new root, and verify resulting main remains at expected source state. Do not create another PR to remove blocked 27 folders.

