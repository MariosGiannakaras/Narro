# Narro evidence-only cleanup — legacy M7 motion frames, 2026-10-30

- Baseline: `6bef54f79c9d1a0015afabc8e050cc93b40c8584`.
- Removed 8,100 generated `frame-NNN.png` from `work-log/evidence/m7-ci932-20261004/motion/` (267,966,072 logical bytes).
- Removed 6,480 generated `frame-NNN.png` from `work-log/evidence/m7-ci936-20261004/motion/` (254,949,549 logical bytes).
- Retained full original Narro MKV/MP4 parts and source video provenance; raw checksums, action/PTS/crop/sequence metadata, review/range documents, contact sheets and independent verdicts. `reference/` and canonical source comparison Blitzit files were not touched.
- The frozen indexes and historical evidence-manifests were not rewritten: they describe the original, pre-cleanup package. Historical frames remain recoverable from `6bef54f79c9d1a0015afabc8e050cc93b40c8584`; no Git history rewrite performed. Current checkout does not promise historical generated PNG existence.
- These are replaceable screen-frame exports, not source/product fixtures; no code, tests, CI workflows or Windows runtime modifications. This does **not** certify current physical behavior and does not reduce historical Git packfiles.
- Validation: exact Git path allowlist and counts, original recording paths retained. Native tests NOT RUN (evidence-only).
