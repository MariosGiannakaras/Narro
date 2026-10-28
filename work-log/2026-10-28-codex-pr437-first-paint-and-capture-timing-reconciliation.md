# PR437 first-paint analysis and capture timing correction

UTC 2026-10-28T09:42:54.169651+00:00

**CURRENT PR437 first-paint and capture-rate reconciliation 2026-10-28:** [Exact decoded-frame addendum](work-log/evidence/pr437-first-paint-20261028/README.md). Two additional bounded PASS: actual full Preferences cold first open shows structured skeleton→ready without the previously reported unrelated initial form in the20 recorded frames; Quick Preferences shows structured skeleton→ready in13 recorded frames. Both reduced motion; no general no-flicker/normal-motion/Retry/parity claim. **Timing correction:** recorder/container nominal60fps, but ffprobe frame PTS show roughly15–22 unique recorded frames/s in inspected intervals. The previous motion report and `*-60fps-*` image filenames must not be read as proven effective60fps; seek labels were approximate and may repeat source frames. J05 duplicate-title/time FAIL remains supported by actual decoded LG PTS72.233 and primary PTS233.550/233.600 frames; J01 TV-name FAIL remains. J02/J06 other scopes and J03/J04 hardware NOT RUN unchanged. No new interaction/code/CI/merge; no M5–M9 closure or M10 advance.

[Decoded frame evidence](evidence/pr437-first-paint-20261028/README.md). No new capture/source edit/CI/merge.
