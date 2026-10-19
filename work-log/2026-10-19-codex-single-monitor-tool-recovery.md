# Single-monitor OBS repair and Computer Use blocker

Reported UTC: 2026-10-19T12:59:38Z. Owner: Codex. Scope: tool repair only; the latest user explicitly prohibits starting a recording. No Narro launch, capture scenario, analysis, source/test/build change or CI was performed in this recovery slice.

## Result: 1/2 tool targets completed

| Target | Disposition | Actual verification |
| --- | --- | --- |
| OBS single-display configuration | CONFIGURED / LOADED | Active profile, scene JSON, startup log and accessibility state agree; no encoded-video validation attempted. |
| Computer Use screenshot and mouse input | BLOCKED | Window enumeration/accessibility work; screenshot timeouts and missing coordinate geometry persist after documented recovery, including the completed full desktop-app restart. |

The RA01/RA02 required native recordings remain **0/2 NOT RUN**. These tool results do not advance a milestone or establish physical product PASS.

## OBS repair

The user removed the second monitor. The existing profile still used a 4480x1080 two-screen canvas and a visible source targeting the disconnected display. With OBS closed, the original active profile, scene collection and user selection were backed up before changes.

- Profile directory: `NarroUIValidationPR234`; display name: `Narro UI Validation PR234`.
- Scene collection: `NarroM7PR234`; existing scene name: `Destop`.
- Canvas and output: **2560x1080, 60/1 fps**.
- Connected source: `Desktop`, LG ULTRAGEAR / GSM773B; position 0,0, scale 1, no cropping.
- Disconnected source: `Display Capture`, retained but hidden. No source deletion.
- Output directory: `E:\SystemFiles\Desktop\Narro-Workspace\Narro-Capture-Recovery-20261019\video`.
- Backups and before/after receipt: sibling `backup/` and `obs-single-monitor-change.json` in the same recovery directory. Original settings contain private configuration and are retained locally, not published wholesale.

OBS was opened with the selected profile/collection/scene, without a recording flag. Actual startup log `2026-10-19 15-55-07.txt` records the 2560x1080 base/output and 60/1 fps. Later supported Computer Use accessibility observation confirms the same profile/collection title, scene `Destop`, `60.00 / 60.00 FPS`, **Start Recording** and a disabled recording-time field at **00:00:00**. No recording-start marker appeared in the startup log. OBS remains open and idle. This verifies loaded configuration and idle state, not the contents/quality of an encoded recording.

## Computer Use diagnosis and exhausted recovery

Environment: Windows 10 Pro 22H2 build 19045, Radeon RX 570 driver 31.0.21925.1001. Codex update checker reports installed release **26.1013.40934**, build **20770**, production channel, **up_to_date**; this means no eligible update was offered by its configured updater.

Observed via the supported `node_repl` / `@oai/sky` API:

- App/window enumeration and accessibility-only reads succeed, including the current OBS state.
- Fresh ordinary Notepad and Narro screenshot requests fail, not just OBS (OBS itself is configured to hide from capture).
- Exact screenshot errors: `FrameArrived timed out: timed out waiting on channel` and `window capture timed out: timed out waiting on channel`.
- Observed-element mouse input failed with `coordinate input geometry is unavailable`.
- Fresh target windows, refreshed selection/activation, JavaScript session reset and the **already completed** full Codex desktop restart did not restore screenshot/input operation. Do not repeat that restart as an untried remedy. The immutable [post-restart receipt](evidence/ra01-ra02-capture-preflight-20261019/post-restart-check.json) retains the reproduction.

The per-user `CaptureService_15656e` is running. An attempted service restart could not open the service; it did **not** restart it. Read-only token verification returned Elevated=false and AdminGroupPresent=false, despite the earlier user assumption of administrator access. No security/privacy policy, driver, helper binary or system permissions were changed. No elevation or authentication prompt was automated.

The symptom pattern matches the still-open first-party issue-tracker reports [openai/codex #35446](https://github.com/openai/codex/issues/35446) and [#50749](https://github.com/openai/codex/issues/50749), checked during this slice. Those are reports, not local instrumentation: the proposed Windows 10 frame-callback/bitmap-conversion deadlock remains a **candidate explanation**, not a proven local root cause. No supported applicable fix was found in the checked docs/updater. Community binary patches were not applied. The bundled API exposes no documented alternate screenshot backend.

## Safe continuation

### Historical working method reconciled after user correction

The user correctly recalled that physical work had previously continued successfully. Review of [2026-10-15 recorder recovery](2026-10-15-pa356-video-integrity-and-capture-recovery.md), [2026-10-16 native preparation](2026-10-16-pr360-verified-native-ready.md) and [PA353 physical report](../docs/WINDOWS_PA353_NATIVE_REPORT_2026-10-14.md) establishes the distinction: the same Computer Use screenshot/geometry errors were already present, while observed UIA/native input plus OBS/GDI supplied a working acquisition route. Those documents do **not** show a repaired WGC plugin. The older [2026-10-03 attempt](2026-10-03-codex-m7-ci873-c5-physical-attempt.md) also records window-coordinate `sky.click` working after indexed input failed, with independently acquired desktop pixels.

Accordingly, a broken plugin alone does not prove all real Windows acquisition is impossible or that a previously fixed plugin regressed. The earlier conclusion that plugin repair had to precede any future acquisition was too strong without reconciling this established fallback. Existing local fallback scripts were located/read only, not executed during this clarification. Their current compatibility and compliance with the installed tool's supported input/capture rules still need verification; historical success is not a new readiness PASS.

Continue only tool recovery under the latest instruction. First reconcile the previously successful method with currently supported capture/input capabilities, then verify a disposable ordinary window through an allowed path. A working documented fallback can restore acquisition without proving the plugin itself repaired. Report the exact usable capabilities and limitations; **do not start Narro recording automatically**. Do not alter the Narro implementation to repair an external capture tool.

Original Narro profile remains restored; no new isolation attempt was made. Preserve exact candidate source `50797aae81c8bf4cdd05e8e29577372059a89dc6`, resulting-main CI39242766356 3/3 SUCCESS and EXE SHA256 `87132d9add5cb831e04857f3e8b41b849929e036a3364d0f04a4dd25ce2f8361`. Before a later authorized scenario, use a fresh isolation ledger, not the completed/restored ledger. Single-monitor OBS settings intentionally replace the former dual-monitor configuration; do not restore the old layout while the second display remains disconnected.

## Verified working alternative — 2026-10-19T14:18:34.824890+00:00

The user explicitly requested alternatives and authorized starting capture when operational. The existing GDI/native-input helper was copied to the centralized recovery folder and successfully exercised on one owned blank Notepad: actual screenshot, physical editor click, Unicode SendInput text `Narro native input probe OK`, and real titlebar drag from `[359,336,1913,1087]` to `[439,256,1993,1007]` (80px right/80px up). Cropped before/after PNGs and native action receipts are retained locally. The owned probe was closed by verified exact process identity. No personal document was edited.

OBS observed UIA Start/Stop controls successfully produced and finalized `2026-10-19 17-16-18.mkv`:4.650s, H264/AAC,2560x1080,60/1fps; decoded image shows real desktop pixels. This private setup clip is excluded from published product evidence. OBS returned to StartRecording. Native plugin WGC remains broken; **the alternative acquisition path is operational**. Do not restart the app or retry the same failing WGC loop. No security/permission/helper binary modification.

A fresh isolated attempt is PREPARED at `Narro-Workspace/Narro-RA01-RA02-Retry-20261019`, using the unchanged SHA-verified final candidate and a new ledger; old restored ledger is not replayed. Capture only, aggregate analysis/fixes deferred.
