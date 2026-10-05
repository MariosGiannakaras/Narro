# Supplemental CI953 evidence review — 2026-10-05

Bounded review of existing archive bytes, media-part reconstruction, saved Windows power/display events, UIA fields and three sampled crops (only the relevant post-wake crop retained here). No new physical session, source correction, tests/build/CI or acceptance counter change. Original acquisition packets/manifests remain unchanged.

Exact source38219e200fe3bec7309f8e03e72003184ca86d08, CI953, EXE SHA256 bde7646d9a3f17af0078c41e8a90173bc044f6747d24fde278e6f5739ebe05d8. See [capture index](../ci953-capture-index-20261005/README.md) and [special session originals](../m7-ci953-special-20261005/README.md).

## Packaging checks — PASS

All eleven follow-up Narro-M7-Logs.zip archives pass CRC verification; their complete file-member sets match the corresponding published Narro-M7-Logs folders, and all **127 extracted log file contents** are byte-identical. No missing/extra log file or archive-content mismatch was found. This establishes archived snapshot completeness, not that every task/action or runtime event succeeded.

The ordered parts of [continuous media](../m7-ci953-continuous-20261005/video/media-reassembly.json) and [live media](../m7-ci953-live-20261005/video/media-reassembly.json) independently reproduce all four declared whole-file sizes/SHA256:

| Whole media | Bytes | SHA256 |
|---|---|---|
|continuous original MKV|108724128|271de80bff021e6ceba914660f8c52245ed6661f82fdca42db8265b33ef0830d|
|continuous MP4|109983127|9680c8eb2119c39bf91c3d56baabcf14ed4cdd308e1609193b9b7d8ed82434ae|
|live original MKV|132822893|ad51f1d8b6914bc379fb015f43d668ed51666baa1ba58346a57f81102b6495af|
|live MP4|134440444|b23e68bf4c58ee6810deb08492cad64d7128baaeb6e951a776ac9c994d288ba2|

These checks streamed ordered parts without replacing the original recordings. Reconstruction integrity does not prove continuous visual acceptance or decoded motion quality.

## Sleep/topology — confirmed narrow observations; full gate OPEN

[Power events](../m7-ci953-special-20261005/inventory/power-events-final.json) show the initial18:08:49.904 Athens attempt entered Away Mode (event59). The subsequent sleep event42 at18:12:35.5204828+03:00 and resume107 at18:12:43.396682+03:00 are **7.8762s apart**; firmware S3 events130/131 corroborate real S3. This is the event interval, not a precise measurement of every powered-down second. The configured45s wake timer is not the observed duration; actual wake cause is not established here.

[Before topology](../m7-ci953-special-20261005/inventory/displays-before.json), [after route changes](../m7-ci953-special-20261005/inventory/displays-after.json) and [post-sleep](../m7-ci953-special-20261005/inventory/displays-post-sleep.json) have the same two valid current modes: DISPLAY1 at(-1920,0),1920x1080/60Hz and DISPLAY2 at(0,0),2560x1080/144Hz. Post-wake native observations still identify Focus HWND6619566/PID22948. This confirms the saved post-wake topology/host identity; intermediate clone/internal behavior, every DPI placement, notification delivery, timer accounting during sleep and physical unplug/replug are not accepted from these snapshots. M1 recovery27 remains OPEN.

## Post-wake Time's Up — sampled state consistent with final ledger

[Retained crop](post-wake-10.png) is extracted at **10.0s in post-wake-full.mp4**, original4480x1080 cropped340x700 atx4140,y0 without resizing. It visibly shows owned F task, Time's Up, countdown00:00, EST0:10:00 and Time Taken0:10:00. [Final ledger](../m7-ci953-special-20261005/inventory/final-ledger.json) identifies task76f0b2a4-2c05-4a5f-8b42-d5697f48cbe3 with one closed work sessionf17f168e-e4c6-4678-8ff2-fd96469e3a33, duration600s. The sampled terminal display and stored duration agree. This does not clear earlier expanded-Time's-Up defect35, whole M7 C4, visual source parity or motion acceptance.

Earlier [post-sleep UIA](../m7-ci953-special-20261005/observations/post-sleep-focus.json) at15:14:36.8279746Z lists Running02:15 with Time Taken0:03:30. [Later native UIA](../m7-ci953-special-20261005/observations/post-wake-native.json) at15:16:45.7021506Z lists Running00:07 with Time Taken still0:03:30. This is a **UIA-only field discrepancy requiring review**, not a confirmed visible stale-value bug. Two pre-sleep video crops sampled287/485s did not expose the running Panel Time Taken field, so they cannot resolve it and are not included as useful evidence. The UIA interval occurs during the documented OBS/GPU recovery recording gap. Do not infer unobserved compositor output or timer correctness; obtain a targeted running-Panel visual comparison later only if other whole recordings do not already show it.

All previously open M1-M9/source-parity gates retain their dispositions. Supplemental packaging PASS is not a milestone checkbox. Historical44/100 unchanged. M10 hard entry remains blocked; optional M11 dormant.
