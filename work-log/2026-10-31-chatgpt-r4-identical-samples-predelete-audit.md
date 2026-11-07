# R4 orientation PNG exact-deduplication — individualized pre-deletion audit (2026-10-31)

**Owner:** ChatGPT evidence cleanup; **baseline main:** `e1d33b70cc5c44f0ad7cfcfa5ba6238cbc79effa`. **Only target:** `work-log/evidence/safe-capture-supplement-20261021/clean-alert/R4-isolated-alert/native-unreviewed-samples/`. This is a NEW **non-cohort** (not part of the fixed 700 video/ZIP cohort) PNG analysis, not permission to remove any of the 668 protected original/native movies or archives. Prior PR456's broad duplicate SHA survey retained these temporal/provenance samples without individual mapping; this audit maps *every* proposed path to a byte-identical retained counterpart, preserves independently cited timepoint paths and original 60fps film.

## Source, consumers, safeguards

- **Source film retained unchanged:** `work-log/evidence/safe-capture-supplement-20261021/clean-alert/R4-isolated-alert/native-original.mkv`, Git SHA `f2eefc4446a2fec49ef5bab09256bef72c28309b`, 11,881,268 B. It is the authoritative 81.984-second / 4,901-frame native Desktop Duplication recording. The sampled 5fps PNGs are merely orientation images; the original contains the complete time series needed for the OPEN 560ms full-card flash, audible notification and native-compositor evidence, none of which is resolved by this cleanup.
- **Frozen provenance retained:** `work-log/evidence/safe-capture-supplement-20261021/SHA256SUMS.json`, `work-log/evidence/safe-capture-supplement-20261021/clean-alert/R4-isolated-alert/video-metadata.json`, raw action and owned-state receipts, [R4 first-pass native review](2026-10-21-r4-isolated-alert-native-frame-scope.md), [PR390 native review](2026-10-21-pr390-and-supplement-scoped-native-review-ui-next-batch.md) and PR456 cleanup-risk note. The frozen 60-frame SHA256 manifest remains an accurate **historical original-path** receipt; removal makes some listed paths Git-history recovery paths, not current checkout-file promises. Original baseline is sufficient for restoration; no history rewrite.
- **Explicitly cited sample paths preserved:** `frame-001.png`, `frame-030.png`, `frame-032.png`, `frame-035.png`, `frame-036.png`, `frame-040.png`, `frame-042.png`, `frame-060.png`. There are 20 distinct Git image blobs across all 60 samples; keep all 20 representatives and three additional referenced timepoints (23 retained paths in total).
- **Deletion eligible by byte identity, not visual similarity:** exactly **37 PNG copies / 31,001,629 logical checkout B** map to an existing retained identical blob, exact entries below. Git content-addressed object storage already deduplicates them, so this is no claim of remote quota reduction.
- **Physical acceptance remains unchanged:** R4 once-only effect decision and narrow tinted-numeral transition previously observed; animation/audio/system notifications/OS inputs remain **OPEN or NOT VERIFIED**. No new CI/native execution for evidence-only deletion. No changes to app source/tests/reference, approved Spectrum picker/icons, strict PR389/419 compositor or PR437/M5–M9 acceptance gates.

## Exact allowlist — file names relative to the sample directory

| Remove | Retain identical exemplar | Exact Git blob SHA | Logical B |
| --- | --- | --- | ---: |
| `frame-003.png` | `frame-002.png` | `b888455a4d989f420ba2af78dd9f1ffa237d7666` | 837644 |
| `frame-004.png` | `frame-002.png` | `b888455a4d989f420ba2af78dd9f1ffa237d7666` | 837644 |
| `frame-005.png` | `frame-002.png` | `b888455a4d989f420ba2af78dd9f1ffa237d7666` | 837644 |
| `frame-008.png` | `frame-007.png` | `d879fe83e290617c773b72be8f58859b2c5dbfa4` | 837574 |
| `frame-009.png` | `frame-007.png` | `d879fe83e290617c773b72be8f58859b2c5dbfa4` | 837574 |
| `frame-010.png` | `frame-007.png` | `d879fe83e290617c773b72be8f58859b2c5dbfa4` | 837574 |
| `frame-011.png` | `frame-007.png` | `d879fe83e290617c773b72be8f58859b2c5dbfa4` | 837574 |
| `frame-013.png` | `frame-012.png` | `7ab2c73e16f97a20518c7ede04d0e0cf15ac8c73` | 837576 |
| `frame-014.png` | `frame-012.png` | `7ab2c73e16f97a20518c7ede04d0e0cf15ac8c73` | 837576 |
| `frame-015.png` | `frame-012.png` | `7ab2c73e16f97a20518c7ede04d0e0cf15ac8c73` | 837576 |
| `frame-016.png` | `frame-012.png` | `7ab2c73e16f97a20518c7ede04d0e0cf15ac8c73` | 837576 |
| `frame-018.png` | `frame-017.png` | `566fb65667c7e9bae6a848d1ea9d9a5983f6edbb` | 837684 |
| `frame-019.png` | `frame-017.png` | `566fb65667c7e9bae6a848d1ea9d9a5983f6edbb` | 837684 |
| `frame-020.png` | `frame-017.png` | `566fb65667c7e9bae6a848d1ea9d9a5983f6edbb` | 837684 |
| `frame-021.png` | `frame-017.png` | `566fb65667c7e9bae6a848d1ea9d9a5983f6edbb` | 837684 |
| `frame-023.png` | `frame-022.png` | `c418a0c7925091c7e374f51cf49b0c604a1c79ce` | 837548 |
| `frame-024.png` | `frame-022.png` | `c418a0c7925091c7e374f51cf49b0c604a1c79ce` | 837548 |
| `frame-025.png` | `frame-022.png` | `c418a0c7925091c7e374f51cf49b0c604a1c79ce` | 837548 |
| `frame-026.png` | `frame-022.png` | `c418a0c7925091c7e374f51cf49b0c604a1c79ce` | 837548 |
| `frame-029.png` | `frame-028.png` | `07aec8acf5919ebf25382857a64ea0316de34ee4` | 837950 |
| `frame-031.png` | `frame-028.png` | `07aec8acf5919ebf25382857a64ea0316de34ee4` | 837950 |
| `frame-033.png` | `frame-032.png` | `2c0b0fa641efedb8bfe1884c8b3ad44d4d716188` | 837912 |
| `frame-038.png` | `frame-037.png` | `75b785531186e49fcfdea2a72c51ffa2a6023292` | 838765 |
| `frame-039.png` | `frame-037.png` | `75b785531186e49fcfdea2a72c51ffa2a6023292` | 838765 |
| `frame-041.png` | `frame-037.png` | `75b785531186e49fcfdea2a72c51ffa2a6023292` | 838765 |
| `frame-044.png` | `frame-043.png` | `7d85362cb8e0d6ec2018110b3504ba2b5f2cab6f` | 838577 |
| `frame-045.png` | `frame-043.png` | `7d85362cb8e0d6ec2018110b3504ba2b5f2cab6f` | 838577 |
| `frame-046.png` | `frame-043.png` | `7d85362cb8e0d6ec2018110b3504ba2b5f2cab6f` | 838577 |
| `frame-047.png` | `frame-043.png` | `7d85362cb8e0d6ec2018110b3504ba2b5f2cab6f` | 838577 |
| `frame-050.png` | `frame-049.png` | `f349469dea0b53ac0aca363ffe89bf09017d0958` | 837844 |
| `frame-051.png` | `frame-049.png` | `f349469dea0b53ac0aca363ffe89bf09017d0958` | 837844 |
| `frame-052.png` | `frame-049.png` | `f349469dea0b53ac0aca363ffe89bf09017d0958` | 837844 |
| `frame-054.png` | `frame-053.png` | `aff9720e8665f281b2c189ad0c6686fea9fc10e1` | 837856 |
| `frame-055.png` | `frame-053.png` | `aff9720e8665f281b2c189ad0c6686fea9fc10e1` | 837856 |
| `frame-056.png` | `frame-053.png` | `aff9720e8665f281b2c189ad0c6686fea9fc10e1` | 837856 |
| `frame-057.png` | `frame-053.png` | `aff9720e8665f281b2c189ad0c6686fea9fc10e1` | 837856 |
| `frame-059.png` | `frame-058.png` | `2e3cb283833fd08d41ba7a1c831c0315ce5e7db7` | 837798 |

**Validation before deletion:** exact main SHA checked, 60/60 file entries counted from GitHub, 20/20 distinct SHA representatives retained, 8/8 explicitly cited frame names retained, 37/37 removed paths match a retained Git SHA and original MKV metadata verified. The 32/700 cohort count and all 668 HOLD remain unchanged. **NEXT:** create one deletion-only branch/PR, compare exact removed names and unchanged source/video/index, merge with exact-head guard only if checks permit, verify resulting main, then update live trackers and write an immutable merge receipt.
