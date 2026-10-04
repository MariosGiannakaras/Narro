# CI911 exact-build Windows evidence

This is a frozen point-in-time copy of the whole native `Narro-M7-Logs` folder, two physical runs and all four original recordings. Production database backups are excluded. `artifact-provenance.json` identifies the exact EXE. `video-provenance.json` identifies recordings, original hashes and explicit OBS pauses. Raw MKV bytes are split at 80 MiB solely to fit GitHub file limits. Reassemble each recording by concatenating its listed parts in order as binary bytes, and verify `rawSha256` before opening. Do not use text concatenation.

Recording 1 ended prematurely; its exact incomplete original remains available. Recording 3 has two OBS Pause intervals totalling 4715.622 seconds. These gaps are excluded from video evidence. Recordings 2 and 4 stopped normally with no Pause interval. The black canvas during software monitor disable is the unavailable display capture, not a Narro blank frame.

`motion/index.json` maps actions to recording PTS and native-scale consecutive 60 fps PNGs/contact sheets. Whole-video retention does not mean idle periods were exhaustively reviewed. The source-level placement correction is validated separately; this CI911 evidence preserves its observed FAIL.

The detailed PASS/FAIL scope and inline video-derived gallery are in `../../2026-10-04-codex-m7-ci911-physical-results.md`. Exactly eight motion sequences (480 consecutive frames) were inspected directly; all 33 sequences/1980 frames are retained for independent review.
