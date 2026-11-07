# Narro evidence cleanup — retired original Narro CI911/932/936/942 video (2026-10-30)

Owner: ChatGPT cleanup. Baseline current `main` `f3eb986f29288354fa79b5477d1886097be74aea`. Scope is archived **Narro** Windows recording sources for historical M7 candidates; **not** the original Blitzit application/reference material.

## Deleted from the current Git tree

Only raw Narro MKV recording parts matching `work-log/evidence/m7-ci{911,932,936,942}-20261004/raw-video/recording-*/...mkv.partNNN`:

| Historical candidate | Removed files | Logical bytes |
| --- | ---: | ---: |
| CI911 | 8 | 489,581,483 |
| CI932 | 13 | 368,726,186 |
| CI936 | 13 | 514,153,718 |
| CI942 | 11 | 422,038,429 |
| **Total** | **45** | **1,794,499,816** |

These are old full-length recordings of earlier Narro builds, not the exact binaries currently awaiting PR389/419/437 Windows-native acceptance. The six current open PR descriptions (389, 418, 419, 431, 436, 437) contain no explicit requirement to retain these four old full recordings; no new source/Blitzit parity verdict is inferred. The dated original readmes, source hashes, manifests (where present), indexes and prior PASS/FAIL verdicts remain historically true, but their raw-video paths now refer to **prior Git objects**, not the new checkout.

## Post-deletion safeguards verified in the candidate tree

- **Zero raw MKV recording parts** remain in any of the four targeted `raw-video/` subtrees.
- CI911: **33** short original-derived motion clips and **117** JPG/PNG images remain.
- CI932: **123** motion clips and **379** JPG/PNG images remain.
- CI936: **695** JPG/PNG images, exact PTS/crop metadata and canonical Blitzit comparison images remain. No separate compact clips in this historical package; if video replay is required, restore its exact former source recording from the baseline Git commit.
- CI942: **4** review video clips and **81** JPG/PNG images remain.
- All four retain `README.md`, `motion/index.json`, `video-provenance.json`, recorded outcomes and other non-target evidence. Unrelated file paths and trees were not removed.
- Root Git subtree identities unchanged for `reference/` (`46dea0c640cbfc17003acf439d96f503a5c39410`), `src/` (`715f8a0acc5bab9a170d3c55d683f3dcb64d0e90`), `src-tauri/` (`d15e3d16751fee44dc494b406235e482011022c5`) and `tests/` (`229d81ddd95bfae21db7c05e60452e02ca1a0709`).

**Exact recovery:** inspect the respective paths at parent `f3eb986f29288354fa79b5477d1886097be74aea`; each prior tracked blob remains available in ordinary Git history. This is a reversible checkout-retention change, **not** Git history rewriting/packfile compaction. No app/config/build/fixture/test or physical Windows operation occurred; Windows-native tests **NOT RUN**, no acceptance status upgraded.

**Continue:** Do not retain originals of obsolete Narro videos merely because they are originals. Before retiring further large files, identify active physical/PR/milestone consumers, especially post-2026-10-20 evidence; preserve any actual original Blitzit videos regardless of location. Remove only evidenced Narro-owned historical files and record recovery identity and independent PASS/FAIL scope.
