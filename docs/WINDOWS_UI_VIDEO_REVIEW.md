# Windows UI recording and review workflow

Use continuous physical recording as the primary evidence for Narro interaction and motion checks. Extract review PNGs from that recording for static detail and chat inspection. Separate screenshots are useful only for controlling a test when the live capture tool needs them; they are not a second acceptance run.

Current evidence includes the [CI #873 completed two-monitor C5 run](../work-log/2026-10-03-codex-m7-ci873-c5-completed.md), its [video review](../work-log/2026-10-03-codex-m7-ci873-c5-video-review.md), and the [CI #884 physical batch with full logs/video and dense motion review](../work-log/2026-10-03-codex-m7-ci884-physical-batch-evidence.md). OBS recording and application control worked concurrently on this machine.

## Recording setup

OBS profile **Narro UI Validation** is installed locally, using x264 CRF18/veryfast and MKV. The original **Untitled / Destop** two-monitor collection remains preserved: 1920×1080 secondary at left and 2560×1080 primary at right, combined **4480×1080** at **60 fps**, no downscaling. CI #884 used the separate **NarroM7Validation / Destop** collection with a 1920×1080 canvas because only DISPLAY2 was then available; its output directory was `artifacts/m7-pr221-ci884/video`. OBS was stopped/closed normally afterward.

Both monitors were later enumerated. Before the next physical batch, observe and configure the active collection/canvas to capture both at their real extended-desktop coordinates, choose a new per-run evidence directory, and verify the output covers both screens before app actions. Merely enumerating displays is not a two-monitor test. Do not overwrite the original user collection or assume the CI #884 single-display canvas automatically became dual-display.

Record to MKV, stop normally, then remux to MP4 for distribution. Record only useful scenario batches with short state holds around actions. For detailed typography, inspect native-size crops; do not evaluate a 4480-wide desktop from a scaled chat preview. If OBS reports rendering or encoding lag, reduce load or use a 30 fps fallback and explicitly weaken motion claims.

OBS can start the selected profile/scene from the command line. Example PowerShell launch (the verified pre-existing installation):

```powershell
Start-Process -FilePath 'C:\Program Files\obs-studio\bin\64bit\obs64.exe' `
  -WorkingDirectory 'C:\Program Files\obs-studio\bin\64bit' `
  -ArgumentList '--profile', '"Narro UI Validation"', '--collection', 'NarroM7Validation', '--scene', 'Destop', '--startrecording' `
  -WindowStyle Hidden
```

The example selects the last validation collection; inspect/update its display sources and canvas before a new two-monitor recording. Check the actual active recorder and output file before app input. Stop through the verified OBS **Stop Recording** UI control; confirm it becomes **Start Recording** before closing OBS. Hidden OBS windows may require enumeration/UI Automation if Computer Use cannot return their geometry. Do not enable another control server solely to avoid observing the actual recorder state.

Portable FFmpeg/ffprobe are available locally under `artifacts/ui-validation-tools/ffmpeg-portable/ffmpeg-9.0.2-essentials_build/bin/`. These ignored operational files are not repository application tooling. The tested physical desktop-region fallback uses gdigrab, cursor included, native dimensions, lossless RGB MKV and passthrough timestamps. Its measured 60 fps request delivered ~52.38 fps with gaps; 30 fps delivered ~30 fps. Do not label a requested rate as an observed rate.

References: [OBS launch parameters](https://obsproject.com/kb/launch-parameters), [FFmpeg gdigrab](https://ffmpeg.org/ffmpeg-devices.html#gdigrab), [official FFmpeg Windows build links](https://ffmpeg.org/download.html#build-windows).

## Per-scenario evidence

1. Pin the CI run/source, artifact ID and executable SHA-256. Verify the same binary for every step in a restart sequence. Record OS, monitor coordinates/work areas, DPI, Windows motion setting, app theme and relevant task/session state.
2. Define a specific expected behavior from the relevant UI/UX fixture, supplied Blitzit evidence or documented Narro invariant. Say when the expectation is inferred.
3. Start a continuous recording before the first state/action. Execute actual UI input, including hover, focus, drag, menus and global shortcuts where relevant. Keep domain correctness independent of visual animation.
4. Stop normally and probe the video. Check dimensions, duration, timestamps and recorder lag counters. Decode the relevant clip; distinguish frozen content from legitimate idle identical frames.
5. Extract native-size PNGs from the source recording. For short transitions, retain every decoded frame across the event, including pre/post holds. Build timestamped contact sheets as navigation aids and inspect suspicious individual frames at native size.
6. Correlate physical frames with native logs/state and report **PASS / FAIL / INCONCLUSIVE / NOT_RUN** per criterion. A static endpoint is insufficient for motion; a recorder's 60 fps stream is insufficient to guarantee every compositor frame.
7. Publish the continuous scenario video, exact crops, native logs, provenance, per-file hashes and an embedded Markdown gallery under `work-log/evidence/<date>-<scenario>/`. Keep raw logs byte-identical. A chat with image/file access can inspect PNGs; video analysis depends on that chat's available tools. Provide both formats from the same run.
8. Add material findings to the crosswalk and the affected milestone TODO before source corrections. Keep each correction narrow and revalidate the same physical criterion on a CI-validated executable. Follow the repeated-failure escalation in AGENTS.md.

## Coverage ledger for the next full UI audit

These rows describe test coverage, not permission to implement future milestones. Test existing surfaces on an identified current candidate; use milestone routing for features not yet implemented.

| Surface/criterion | Evidence in this continuation | Remaining scenarios |
| --- | --- | --- |
| Real task, compact Timer, drag, tray Quit, exact-EXE restart, saved placement | **CI #873 C5 PASS**, continuous two-monitor recording + two-session native verdict; CI #884 restart **NOT_RUN** | PR #222 changed-host drag/restart/restore acceptance OPEN |
| Compact→expanded→Panel→compact normal motion | **CI #884 FAIL** transient coexistence; 360 consecutive frames reviewed across six one-second normal/reduced events; full video and six two-second clips retained | PR #222 corrected paint ownership requires exact-EXE continuous normal/reduced retest; verify no blank/staging/overlap and active running continuity |
| Timer/Panel task/session correctness | **CI #884 PASS** Create/Skip/Pause/shared projection, subtask add/edit/reorder/complete/reopen/delete, Notes save, manual break return, completion preserving exact 13 work seconds | Retest affected Notes editor/Save bounds and long-title/tooltip controls; expiry/extend and other untested states remain explicit |
| Planning/Home/list/task controls | Incidental visible states; **NOT a full audit** | Hover/focus without geometry shifts, menus, inline edits, schedules, recurrence, reorder/duplicate/archive/delete confirmations, empty/error states |
| Settings and existing shortcuts/notifications | **CI #884 English shortcut PASS / Greek shortcut FAIL**; full settings/notifications audit NOT_RUN | PR #222 physical-key correction retest under English/Greek; system/light/dark, sounds/conflicts and appropriate candidate tray/notification states |
| Reduced motion / keyboard / accessibility | **CI #884 reduced roundtrip recorded and coexistence FAIL; quick-create loading focus FAIL**; OS animation setting restored On | PR #222 loading focus, Tab/Shift-Tab, Escape/return focus and tooltip motion/keyboard access on exact EXE; rendered fixtures alone do not close physical acceptance |
| Windows multi-monitor/DPI/topology | CI #873 dual capture; CI #884 **single DISPLAY2 at 125%**; two displays later enumerated | PR #222 native-frame 100%/125% bounds/crossing/topmost; M1 Candidate B selected-monitor B, real disconnect/reconnect C, and idle CPU/RAM D remain separate exact-candidate batches |
| Borderless/exclusive fullscreen and performance | **NOT_RUN** in this continuation | Use the documented platform matrix; do not infer exclusive-fullscreen overlay support |
| M9/report surfaces not present in CI #873 | **NOT_RUN / milestone dependent** | Audit when the relevant implementation is validated; do not invent current coverage |

Manual handoff, if physical access is needed, must state the exact candidate, unresolved action, expected result and capture requirement. The existing [M1 final batch](M1_FINAL_REPLACEMENT_PHYSICAL_BATCH.md) has the B/C/D recipe and Candidate B identity; a genuine cable/display removal is distinct from merely hiding a window. This C5 continuation did not run Candidate B or collect its performance samples.
