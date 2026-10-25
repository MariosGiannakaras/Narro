# Frozen physical evidence, 2026-10-25

Both protected sessions are stopped and personal profiles restored with identical original database SHA-256. All 11 original recordings, screenshots/UIA, full generated Narro-M7-Logs, native traces, audio and capture receipts are published here. Raw QPC PNGs and already generated analysis derivatives are archived losslessly with individual SHA-256 manifests; original input files were not changed. Method scripts are inert .txt evidence. Private profile backups, databases, downloaded executables and Python package binaries are deliberately excluded.

## Acquisition and provenance

- Main source `62a08100b3dd5028d0cacdfe19d56a66a2752ade`, green CI40176625627, artifact12592718769; executable SHA-256 `13f6609619bcdcb9164773978ccdeec9841f5021de48005cb520a61b1cda045f`.
- A PR389 source `ec9227a2e09a69c380d4605aaf9623bdd9b9c394`, green CI40084188512; EXE `08a7e1d6b306e1469c274938c7e5c907ab962766f1b04b9ae2dce0d04d03985a`.
- B PR419 source `43adb6a9d798dca56dd89c0f4f91c888e1d4fcd9`, green CI40084666277; EXE `8436d89b9d868fbdd7f5e5c76b13412a1360182645810e64b835b9a3ba8f9cd8`.
- A/B 16/16 routes ACQUIRED: each build, normal/reduced media, Panel-to-compact, expand, collapse, return-to-Panel. DDA output0 primary2560x1080 nominal60fps plus independent DPI-aware DwmFlush/QPC samples; all16 contain postcommit samples. Renderer media was explicitly configured and verified; this does not establish Windows animation-setting acceptance.
- Acceptance main five recordings use whole virtual desktop4480x1080 nominal60fps. Main recovered timer/Pomodoro and standard300sec boundary acquired; exact receipt UTC in each folder, actions.jsonl and timer-observation.jsonl.
- Topology two recordings: logical-topology-alert is FIXED PRIMARY1920x1080 x0/y0 through display changes; secondary-normal-alert is FIXED SECONDARY1920x1080 x-1920/y0 after restoration. These are complementary captures, not two full virtual-desktop videos. No OBS session was started.

## Timestamped observations and current dispositions

| Case | Evidence and UTC | Disposition |
|---|---|---|
| Main real Pomodoro boundary | Acceptance/main-timed-alert-boundary; timer-observation.jsonl, 11:08:13.031Z | Boundary acquired; Skip Break returned paused work. No new visual/source-parity acceptance implied. |
| Main standard300sec alert | Acceptance/standard-alert-boundary; 11:20:03.769Z; next600 | Exactly one durable claim observed, no cursor warning flood. Loopback signal captured; normal-motion condition was not established here, so flash acceptance OPEN. |
| A/B16 route captures | Acceptance/native-traces-A and -B, *-frames.json, analysis-v2.zip/cases.json | Acquisition16/16; QPC contact sheets16/16 inspected. Strict PR389/419 holds NOT retired. Remaining continuous/source comparison and capture-channel uncertainty OPEN. |
| Logical Screen2 removal | Topology/secondary-reentry-placement.json 11:52:06.446Z; logical-removal-settled-probe.json11:53:04.419Z | Scoped logical recovery observed: same HWND1642782, secondary120dpi to primary96dpi, running timer/task retained. Physical HDMI/hotplug/wake NOT RUN. |
| Logical restore clone then extend | Topology/dual-display-restored.json11:53:41.249Z | Same HWND returned to selected Screen2 at120dpi. Original primary unchanged; two displays restored. Bounded busy/stale-monitor warnings preserved in stderr. |
| Normal-media recovered391sec alert | Topology/secondary-normal-alert; boundary11:56:14.177Z, approximately99.865sec from recording-start wall clock; next691 | Acquired2/2 with topology case. Actual reduce=false/DPR1.25 verified, callback-timestamped loopback signal captured. Visual flash/audio fidelity analysis PENDING per latest user direction. |

## Already performed bounded review; do not duplicate blindly

All16 QPC transition sheets and all consecutive collapse-header sheets were reviewed. Apparent double-title was title/hover-action crossfade, not two established complete semantic titles. DDA-only intermittent small-ring/text differences were not sufficient to establish a source fault: independent postcommit QPC ring check219/219 retained ring pixels. Moving-window crops can straddle movement because window rectangle is read before DwmFlush; fixed video edge crops omit the moving middle. Do not infer pixel-perfect PASS or a new compositor defect from these samples alone. Original full videos remain authoritative.

The first extraction in analysis.zip had a113/112 ffmpeg lookahead mismatch; analysis-v2.zip corrects the PTS/frame count. This was a method error, not an app failure. Most v2 transition sheets remain unreviewed. Initial main alert derivative frames were inspected without verified motion condition; no flash PASS. Audio input was unsupported for model listening: captured signal is not auditory-fidelity acceptance.

The old poison was not reproduced on these first main/A/B processes; root cause remains OPEN. Old A/B pre-PR422 cursor warnings are historical-build behavior, not a main regression. Ctrl+Alt+P tool input remained uncertain; current source already handles physical KeyP under Greek layout. A read-only keyboard diagnostic tool call was rejected and did not execute; no logger was installed. Do not infer an application shortcut FAIL. Time Taken freshness during count-up is a factual observation for later triage, not a confirmed defect.

## Exact continuation

User requested immediate bulk publication without more analysis. No source/config/test changes, new CI, PR or merge occurred. Next owner consumes Topology normal-media alert frames/audio timestamps and remaining A/B full moving-path evidence, then dispositions each requirement separately. Preserve prior completed analyses and six native residual closures in physical-recovery-20261025. Deferred drag/tray Quit/held Escape and physical HDMI stay OPEN/NOT RUN as applicable. Mandatory milestone acceptance remains4/10 (M1-M4); M10 entry remains gated. Optional M11/M12 inactive. No unsupported milestone closure.

Recorder start/stop receipts give wall-clock bounds, not exact encoded PTS synchronization. WAVs contain only delivered loopback chunks and omit silent periods; Topology/audio-callbacks.jsonl supplies chunk UTC. Never equate WAV offsets with elapsed wall time. Capture scripts specify actual region and method; screenshots alone do not prove motion. SHA256SUMS.json covers every published payload file except itself.

analysis-v2.zip is published as consecutive40MiB binary parts due GitHub blob limits. Concatenate in numeric order; analysis-v2.zip.reassemble.json gives full ZIP and each part SHA-256. This preserves every derivative without modifying originals.
