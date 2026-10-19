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

Continue only tool recovery under the latest instruction. A compatible official plugin/app fix or another supported recovery path must first demonstrate a real screenshot and benign mouse input on a disposable ordinary window. Then report readiness; **do not start Narro recording automatically**. Do not alter the Narro implementation to repair an external capture tool.

Original Narro profile remains restored; no new isolation attempt was made. Preserve exact candidate source `50797aae81c8bf4cdd05e8e29577372059a89dc6`, resulting-main CI39242766356 3/3 SUCCESS and EXE SHA256 `87132d9add5cb831e04857f3e8b41b849929e036a3364d0f04a4dd25ce2f8361`. Before a later authorized scenario, use a fresh isolation ledger, not the completed/restored ledger. Single-monitor OBS settings intentionally replace the former dual-monitor configuration; do not restore the old layout while the second display remains disconnected.
