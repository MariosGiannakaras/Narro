# CI #873 M7 C5 — completed physical restart validation

Result: **C5 saved-placement restart PASS**, observed on real Windows and corroborated by the native two-process evaluator. This supersedes the interrupted [earlier attempt](2026-10-03-codex-m7-ci873-c5-physical-attempt.md). No C5 tray-Quit/relaunch observation remains for the user to perform.

## Exact executable and provenance

- Resulting-main [Windows CI #873](https://github.com/MariosGiannakaras/Narro/actions/runs/37105088285), source `1423bb8a71deedac2fa17edf6c2fae1f98e2cbb0`.
- Artifact `narro-m7-validation-windows-x64`, ID `11268220111`; artifact ZIP SHA-256 `e17532df1f1eab86022d93616fb4d217ff09d6378ee94bf5af90522950286e44`.
- Same `narro-m7-validation.exe` before and after Quit, 14,874,624 bytes, SHA-256 **`4fde3778720505705ac9c7f9b05a30cb70c26b02c09c6dec442775bc5c66637c`**; runtime fingerprint `fnv1a64:ccb7e96a5db9d324:bytes:14874624`.
- Local main was synchronized without analyzing implementation changes. Before evidence edits, it was fast-forwarded again to `64877d9f1fdebcb01b2a611c876326b37e8c4e1f` to preserve concurrent work. The tested executable remains CI #873; a later checkout does not change its provenance.
- Pre-existing local changes remain preserved in stash `ee0b5257503a897f903a49938f823a583a6869f6`; no stash was dropped or applied.

## Physical sequence

| Action | UTC | Native/visual result | Continuous-video offset |
| --- | --- | --- | --- |
| Existing real Today task, running compact Timer | before drag | `M7 C5 CI873 validation`, no EST, running time | 00:10 |
| Timed physical pointer drag | ~10:54:33–34 | Timer moved from `(1805,970)` to `(1640,780)`; native maximum distance from session baseline **328 px**, qualifying persistence move | ~00:12 |
| Open actual Narro tray menu | 10:57:14.715 | `Show Narro`, `Show Focus Surface`, **Quit Narro** visibly present | ~02:53 |
| Click **Quit Narro** | 10:57:45.244 | `tray-quit-requested`; saved compact position `(1640,780)`, save complete; PID 8500 exited | ~03:24 |
| Relaunch exact same executable normally | 10:58:30.895 | New PID **21952**, Main opens with the same task | ~04:09 |
| Show Timer using Ctrl+Shift+T | 10:59:03.788 | Expected = actual `(1640,780)`, compact visible region **340×110**, contained on DISPLAY1 | ~04:42 |
| Inspect recovered task | after restore | Same title and Time Taken **2:16:57**; Panel explicitly shows **Paused**; downtime was not added | ~05:00 |

Video offsets are approximate UTC correlations to the OBS log start; frame PTS, not inferred input latency, determines spacing within a clip.

First process: PID `8500`, session `378e0748-5f43-45ad-96c2-e410495d95ac`, log directory `session-20261003-082606.801Z-8500`. Relaunched process: PID `21952`, session `332f218d-3c8b-419f-9c98-3bd2c2fbfdc0`, directory `session-20261003-105830.895Z-21952`. Focus HWND changed from `0x450622` to `0x2D065A` across the process restart. The new process used the same HWND for its subsequent presentation changes.

The [native evaluator](evidence/2026-10-03-m7-ci873-c5-completed/Narro-M7-Logs/m7-c5-latest-result.json) returned **PASS** at `2026-10-03T10:59:03.789Z`, reason `qualifying-drag-normal-tray-quit-new-process-and-safe-saved-placement-restore-all-recorded`. It recorded unchanged executable fingerprint, source and monitor topology, maximum distance 328 px and exact saved-position recovery (2 px permitted tolerance).

## Evidence delivered

- [Visual review, embedded frames and motion observations](2026-10-03-codex-m7-ci873-c5-video-review.md).
- [Continuous C5 video](evidence/2026-10-03-m7-ci873-c5-completed/c5-continuous-dual-monitor.mp4): **5 min 40 s**, both monitors, **4480×1080 at 60 fps**, source seconds 410–750. Includes drag, tray menu, normal Quit, process absence, relaunch and restored Timer without cuts between those actions.
- [Entire frozen Narro-M7-Logs folder](evidence/2026-10-03-m7-ci873-c5-completed/Narro-M7-Logs/) and [ZIP](evidence/2026-10-03-m7-ci873-c5-completed/Narro-M7-Logs.zip), including both process sessions and the earlier visual evidence. Native files are preserved byte-for-byte.
- [Evidence manifest](evidence/2026-10-03-m7-ci873-c5-completed/file-manifest.json), [recording provenance](evidence/2026-10-03-m7-ci873-c5-completed/recording-provenance.json), [archive verification](evidence/2026-10-03-m7-ci873-c5-completed/archive-verification.json), [frame index](evidence/2026-10-03-m7-ci873-c5-completed/frame-index.json), [motion index](evidence/2026-10-03-m7-ci873-c5-completed/motion-index.json).

The original continuous OBS file is retained locally at `E:\SystemFiles\Desktop\2026-10-03 13-47-31.mp4` (923,981,528 bytes, 1223.566667 s); its SHA-256 is in recording provenance. The published C5 excerpt is reencoded at native resolution, CRF18, with audio omitted. It cannot recover detail already lost in the original OBS CBR6000 recording. The full 924 MB original is not included in Git. All new review PNGs are extracted from that original recording; they were not acquired in a second screenshot test run.

## Operational recovery and recording changes

Computer Use WGC capture continued to time out, including on an independent Settings window. Accessibility and supported input remained useful. With the user's explicit native-fallback authorization, physical screen pixels, timed pointer movement and native UI Automation of the OBS recording button completed the task. `sky.drag` had not reliably moved this window; the timed native physical drag did. No internal Narro state was injected to simulate acceptance.

The pending NetLimiter request was resolved by selecting **Remember** for `MicrosoftEdgeWebView2` at `10:51:17.636Z` and clicking **Allow** at `10:51:44.824Z`. The blocker disappeared afterward. This creates a remembered application allow rule; NetLimiter was not disabled globally. The prior failed/transient Allow attempts remain in the operator history.

OBS recorded while Narro was operated and observed. The two-monitor **Destop** scene and its native 4480×1080 layout were retained. The first recording reported 73,415 output frames, 73,449 drawn frames (73,450 attempted) and one rendering stall. The MP4 reports 73,414 video frames. These counters describe recorder delivery, not a guarantee that every desktop compositor frame was captured.

A separate **Narro UI Validation** OBS profile now uses x264 CRF18/veryfast, MKV, native 4480×1080/60 fps and one audio track. The original Untitled profile remains available. The new profile completed a real recording smoke from `11:16:42.460Z` to `11:22:20.649Z` and stopped normally; OBS was closed afterward. WebSocket was not enabled. [Recorder metadata](evidence/2026-10-03-m7-ci873-c5-completed/recorder/) contains sanitized settings and measured results. The regional FFmpeg fallback delivered ~52.38 fps when requested at 60 fps (nine large gaps) and ~30 fps at 30 fps; this is why OBS was selected for the acceptance recording. The synthetic calibration helper was not run.

Narro is left open in a **paused** compact Timer. The later expanded→Panel→compact observation changes its final position to `(1640,970)` because the saved expanded 340×300 rectangle at `(1640,780)` is converted to a bottom-anchored compact rectangle. This happened after the successful C5 restore and must not be confused with the original `(1640,780)` restart verdict.

## Acceptance boundary and remaining work

The requested C5 physical run is complete. Additional standard-motion observations cover compact→expanded, expanded→Panel and Panel→compact; their dense frames expose transient-content questions and shortened Panel action labels, recorded explicitly in the visual review and crosswalk. They do not certify every UI state, every micro-interaction, reduced motion or Blitzit motion parity.

Repository milestone/counter closure requires its separate final tracking reconciliation; this evidence publication does not manufacture that broader acceptance. M1 Candidate B selected-monitor/topology/performance batches were not run against this CI #873 executable. The existing [M1 batch instructions](../docs/M1_FINAL_REPLACEMENT_PHYSICAL_BATCH.md) remain the exact separate procedure. [The UI recording/review workflow](../docs/WINDOWS_UI_VIDEO_REVIEW.md) lists coverage and outstanding checks without marking unperformed work PASS.

This publication changes documentation and frozen evidence only; no application source, build scripts or repository automation were added. Archive/file hashes, video decoding and local evidence links were verified. Source test suites and Windows CI were not rerun for these evidence files.
