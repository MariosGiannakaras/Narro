# Narro evidence-only cleanup — CI936 derived Panel frames, 2026-10-30

- Baseline source commit: `fd7b2da4072f4846fb199cfdfa9e88c2bee06c62`.
- Removed **960** generated `frame-NNN.png` files (**1,168,679,467 logical bytes**) from `work-log/evidence/m7-ci936-20261004/panel-motion/*/`.
- **Not removed:** original continuous Narro OBS source in `work-log/evidence/m7-ci936-20261004/raw-video/recording-1/`, original video SHA256 metadata, per-sequence crop/PTS/provenance JSON, contact sheets/JPG, exact CI PASS/FAIL review, evidence index, and all original Blitzit sources/comparison assets.
- These exported PNGs were reconstructible from the original Narro video and are no longer required as checkout content. Historical manifest, frozen README and frame-index references describe the old package; to recover any exact deleted PNG from Git history use `fd7b2da4072f4846fb199cfdfa9e88c2bee06c62` (without rewriting immutable files).
- This is evidence-only, not a new physical PASS. No code, tests, fixtures, Windows AppData, CI config or source Blitzit assets changed. Historical Git objects persist; logical deletion is not equal to Git pack-size recovery.
- Validation: verified exact Git tree path count/bytes and deletion allowlist; Windows run NOT RUN for this evidence-only change.
