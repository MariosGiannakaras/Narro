# 2026-10-22 — Combined resulting-main CI closure after accepted UI403–405

**Owner:** ChatGPT nonphysical source/CI track. **Task resumed:** previously interrupted combined-main source and CI verification. No rerun or duplicate feature branch.

## Verified actual current state
- [PR403](https://github.com/MariosGiannakaras/Narro/pull/403) exact source head `6c821e659bd534fa0c82b3a489948188c71ec270`; merge `20cf54436bd40064cf6839ba3013d6882cd07fdd`; 3/3 candidate gates, 3/3 resulting-main source blobs already verified in prior immutable closure.
- [PR404](https://github.com/MariosGiannakaras/Narro/pull/404) exact source head `9667ce2cbf9044e3fd2651a3093cfea4c8e2be2a`; merge `e38a5891b34877495272055f6be489f26515f94e`; 3/3 latest candidate gates, 4/4 resulting-main source blobs already verified. Earlier Windows candidate failure remains a historical failure.
- [PR405](https://github.com/MariosGiannakaras/Narro/pull/405) exact source head `c55b19524f7ccd54e96e31262cfabd31578c3f61`; merge `86e5a8746608f55d4062ea79e9470ef931ebfede`; 3/3 candidate gates, 3/3 resulting-main source blobs verified in prior closure.
- **Combined resulting-main push Windows workflow run `39755456824`** on exact merged source `86e5a8746608f55d4062ea79e9470ef931ebfede`: fetched latest actual jobs; **validation-gate SUCCESS, fast-gate SUCCESS, windows-candidate SUCCESS — 3/3 PASS**.
- Scheduled workflow run `39755601891` at same source SHA also completed SUCCESS, but is distinct from the resulting-main push proof.
- Later main commits `4247b019...`, `41942ef1...`, `f6053ce9...`, `75ec5d77...` are documentation/tracking updates tagged `[skip ci]`, not new app feature gates.
- No new physical Windows keyboard, focus, compositor or source-Blitzit parity claim follows from automated CI. Mandatory milestones **4/10**, PR389 physical Focus/Timer **4/8 transitions FAIL** remain unchanged. PR344 other owner; M11/M12 optional/dormant; protected Spectrum Core Create/Edit List picker/upload/218 offline icons untouched.

**One next independently executable action:** source-evidence-led audit of remaining visual/functional defects without duplicating merged changes or crossing native PR389 ownership; on verified cause implement narrow change and real regression test in one independent PR, not a speculative rebuild.
