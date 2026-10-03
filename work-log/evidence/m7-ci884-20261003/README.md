# CI #884 Windows evidence

This directory preserves the tested build's evidence, including failures. It is **not** proof that the later PR #222 candidate passes physical acceptance.

- Source: `5cc184d87ae4f3562e439012292526940a48cb0a`; equivalent merged application source: `1a96da7d8b4c6f4aa2aa58cb7d6bd49726b0fab0`.
- CI: [Windows #884](https://github.com/MariosGiannakaras/Narro/actions/runs/37122117866), artifact `11274516121`.
- EXE SHA-256: `a279664e4805eed7673ca30b1e2af6ff0f47356c1d59f8f92dacbdd8e2eb4bb3`.
- Capture: 1920×1080, 60 fps, 5414.850 s. Only DISPLAY2 was available during this capture. Two-display tests were not performed in this run. Both displays became available again later.
- Recorder started before candidate launch. Long implementation/idle intervals are retained.
- The complete `Narro-M7-Logs` folder is a snapshot at approximately **2026-10-03 14:30:28 UTC**, while process 14080 remained running and paused. Its C5 evaluator is **PENDING**, waiting for a qualifying drag. There is no candidate tray-Quit/relaunch PASS in these logs.

## Full video

Consecutive files in playback order:

1. [Part 00](video/full-capture-part-00.mp4) — source frames 0–71999.
2. [Part 01](video/full-capture-part-01.mp4) — source frames 72000–143999.
3. [Part 02](video/full-capture-part-02.mp4) — source frames 144000–215999.
4. [Part 03](video/full-capture-part-03.mp4) — source frames 216000–287999.
5. [Part 04](video/full-capture-part-04.mp4) — source frames 288000–324888.

The original H.264 stream was copied without re-encoding. The combined **324,889 MP4 frames equal the original video packet count**. Published review copies omit audio; the original MKV is retained locally. OBS reports 324,890 output frames and 324,923 drawn frames; the muxed video's packet count is the provenance value used here. See [video metadata](video-provenance.json) and [recorder log](obs-recording-log.txt).

## Navigation for another chat

Read the [physical results and visual observations](../../2026-10-03-codex-m7-ci884-physical-batch-evidence.md), then use [scenario timestamps](scenario-index.json), [PNG frame timestamps](image-index.json), and [six motion clips / 24 consecutive-frame sheets](motion/index.json). The agent inspected sheets 0 and 1 for each motion case: **360 consecutive recorded frames over six separate one-second windows**. Sheets 2 and 3 are also retained for independent review; the full recording has not been inspected frame by frame.

The eight overview PNGs come from this video, not duplicate UI screenshot capture. Contact sheets crop the Focus area; the full-frame clips/video retain context. See [complete logs](Narro-M7-Logs/), [whole-folder ZIP](Narro-M7-Logs.zip), [action log](actions.jsonl), and [read-only completed-task duration ledger](completed-task-ledger.json).

Static visual calibration and Blitzit source parity remain separate open obligations. This run records Windows observations, not universal source parity.
