# PR460 — source-preserved remux retirement proposed, merge blocked (2026-10-30)

**Owner:** ChatGPT evidence checkout cleanup. **Scope:** no new feature code, build, CI, native Windows launch or original Blitzit media operation.

## Source-backed archival analysis before deletion

[Live inventory Phase 3](../docs/EVIDENCE_CLEANUP_INVENTORY.md) was committed **before** the proposed deletion as main `a64b3081dc6089d465e229ef4a1ab60c75a49034`. The planned three original-Narro MP4 playback *remux copies* are not the original acquisition videos: `pr357-native-20261016/video/pa357-dual-screen-full.mp4` (36,012,438 B), `ra01-ra02-native-capture-20261019/video/RA01-streamcopy.mp4` (1,033,676 B), `ra01-ra02-native-capture-20261019/video/RA02-streamcopy.mp4` (10,207,442 B). Total **47,253,556 B**.

- PR357 `mp4-derivative-manifest.json` states FFmpeg H264/AAC stream-copy from retained `video/2026-10-16 02-21-53.mkv`, same 18,266 video and 14,270 audio packets, no re-encoding or removed packet. Actual accepted 4/4 native source results, original MKV SHA256, screenshots, raw text provenance remain.
- RA01/RA02 original H264/AAC MKVs remain. Acquisition README declares no-reencoding stream copies, `video-integrity.json` keeps original-byte hashes/full decode; later `docs/RA01_RA02_NATIVE_ANALYSIS_2026-10-19.md` analyzed both originals, `docs/RA01_RA02_FINAL_BUILD_NATIVE_ACCEPTANCE.md` states subsequent corrective PR386/387 scoped acceptance. Complete original source/PTS/ROI/raw observations retained. No new RA MP4 packet-count check claimed.

## Proposed PR, actual restriction

[PR460](https://github.com/MariosGiannakaras/Narro/pull/460), branch `cleanup/retire-reviewed-remux-copies-20261030`, exact head **`006adb7e2a8195734c0c1217c7648152f6bfac37`**, based on pre-deletion main **`a64b3081dc6089d465e229ef4a1ab60c75a49034`**. Exact GitHub base→head compare verified only the above **3 `removed` files**, no source/tests/other changes. The expected-head-guarded GitHub merge action **was blocked by the platform safety checker before an outcome was returned**. No alternate merge route or bypass attempted. Immediately re-fetched GitHub:

- PR460 **OPEN / unmerged**, GitHub `mergeable:true`; head unchanged `006adb7e...`.
- Main **still** `a64b3081dc6089d465e229ef4a1ab60c75a49034`.
- Therefore **NO PR460 file deletion has occurred on main**; the three derivative MP4 copies remain in current checkout. The tool guard is distinct from GitHub merge conflict and source validation failure. No automation/native acceptance attempted; `[skip ci]` proposal only.

**Fixed cohort remains 28/700 deleted; 672/700 remain =421 HOLD +251 REVIEW_REQUIRED.** The 3 proposed MP4s are among the 251 current REVIEW_REQUIRED until a real permitted merge. Do not count them as removed, publish resulting-main measurements, or modify original MKVs to make progress. Historical PR445–459 cleanup cumulative stays 19,329 paths /5,741,648,614 B. Keep original Blitzit sources and active PR389/419/437 native evidence untouched.

**ONE NEXT:** Before any attempted integration, recheck live PR460 head/base/current safety authorization. If a permitted GitHub merge mechanism is available and the block is resolved, perform an actual expected-head guarded merge and resulting-main evidence validation, then update X/700; otherwise preserve PR460 OPEN and continue only independent non-destructive consumer review. Do not bypass safety restrictions. Other physical gates/optional milestones remain unchanged.
