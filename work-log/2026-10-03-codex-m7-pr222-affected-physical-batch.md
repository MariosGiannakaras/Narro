# PR #222 affected physical acceptance batch

Status: **NOT RUN** on the final corrected executable. This is an execution recipe, not acceptance evidence. Use the final green artifact/hash in HANDOFF; the initial CI #892 candidate was rejected by its motion-preference harness before release.

## Preparation

Re-observe the Windows app/recorder state in a fresh Computer Use turn. The user already authorized continuation and a native/UI Automation fallback; no new routine permission is needed. The prior turn's physical-Escape stop was still latched after explicit resumption/reset, so it did not execute these actions.

Confirm both real monitors, DPI-aware physical work areas and scaling. Configure a new validation OBS scene/canvas to include both screens at native size (expected prior layout: 1920 secondary left + 2560 primary right, 4480×1080 at 60 fps; verify live topology). Preserve the original user scene/profile. OBS and app control previously worked concurrently. Record one useful scenario batch; use live screenshots only to observe/control, then derive published review PNGs from the same video.

Before replacing the older running candidate, preserve the current production AppData and logs using the repository's safety helper/consistent backup procedure. Do not reset production data or restore a stale backup over changes. Quit the old candidate normally, launch the final exact EXE, and use a clearly named dedicated validation task. Record source/artifact/EXE identity, process ID, task/time, theme, keyboard layout and motion setting. All same-EXE restart steps below use this final binary, not the old-to-new upgrade boundary.

## Affected checks

| Case | Action | Required observed result | Current result |
|---|---|---|---|
| Native frame / 100% + 125% | Observe Panel, compact and expanded Timer on each display; compare client/outer origin and visible region | No stray native border/inset strip; controls inside region; correct nominal width and heights after scaling | NOT RUN |
| Full Panel actions | Normal, paused and applicable expiry state; hover/focus labels | Complete stable labels, targets remain under pointer, disabled states clear | NOT RUN on corrected host; CI #884 125% labels PASS |
| Normal transitions | Repeated Panel↔compact and compact↔expanded, including a running task | Continuous finite geometry; no blank/pale/staging or old hierarchy below target; stable task identity and tracked time | NOT RUN |
| Reduced transitions | Repeat affected paths with actual Windows animations Off; restore original setting afterward | No doubled hierarchy/decorative motion; correct endpoint, uninterrupted domain state | NOT RUN |
| Inline Notes | Long unbroken text, keyboard formatting/presentation tooltip and vertical scroll | No horizontal container overflow; reachable controls, normal tooltip entry retained, focus equivalent works | NOT RUN |
| Large Notes / Save | Open from Panel and expanded Timer; type unsaved draft, resize, Escape, reopen and Save | Entire modal/Save within visible region, draft retained, resize bounded, persistence success only after commit | NOT RUN |
| Quick Create | Open under English and Greek layouts; loading/ready, Tab/Shift-Tab, Escape | Focus stays in modal during delayed read, title focused when ready, keyboard wrapping and trigger restoration | NOT RUN |
| Physical shortcuts | Applicable Ctrl+Alt T/B/P/S/F/N and Ctrl+F under both layouts, plus affected global toggle/locate | Intended actions on physical keys; modifiers/repeats respected, no unintended state mutation | NOT RUN |
| Drag / monitor / topmost | Drag ≥64px; cross both DPI monitors; edges/taskbar; normal maximized app | Movable safe visible Timer, no frame leak/offscreen placement, expected topmost behavior | NOT RUN |
| Final-executable C5 | Running compact Timer, qualifying drag, normal tray Quit, same EXE relaunch | New process, same executable/source/topology, saved visible safe position, same task/time recovered paused; native two-session verdict PASS | NOT RUN; original CI #873 exact-build C5 remains PASS |
| Idle footprint | Establish documented floating-only scenario and collect the required repeat samples | Actual CPU/RAM recorded, scenario verified, no unexplained regression; harness self-test is not a measurement | NOT RUN |
| Separate M1 topology | Use the pinned isolated diagnostic candidate for selected-monitor/reconnect requirements | Real topology change and safe recovery, not merely display enumeration | NOT RUN in this correction; do not silently substitute a different candidate |

For each case record PASS/FAIL/INCONCLUSIVE/NOT_RUN, exact action/frame/state evidence and actual tested theme/DPI/layout. Broader expiry/break/completion, notification/fullscreen or source-parity states only become PASS when actually observed; existing CI/domain evidence stays separately labelled. Preserve intentional vertical editor scroll and accessible long-title detail rather than treating every internal scroll/ellipsis as a defect.

## Evidence and escalation

Stop OBS normally, verify Start Recording state, probe dimensions/duration/frame timestamps/lag. Retain complete continuous video and the whole final `Narro-M7-Logs` folder plus ZIP; extract native-size PNGs and consecutive-frame clips/sheets around transitions. Publish source/artifact hashes, state/duration ledger, manifest, per-case results and observations under work-log/evidence. Correlate both monitors at the same time; a scaled full-desktop preview is insufficient for typography.

If the same acceptance criterion fails on this second independently corrected, CI-validated and physically tested build, follow AGENTS repeated-failure escalation: stop successive small fixes to that mechanism, compare a materially different scoped composition with the same physical/correctness/performance checks, and document the choice. Cancelled CI #887/890/891 and harness-failed #892 are not physical attempts. New symptoms require their own exact evidence history.

Passing the affected native batch does not automatically certify Blitzit visual parity. Consume the relevant canonical source/calibration evidence separately; incomplete parity/calibration remains explicit. Update STATUS/TODO/crosswalk/HANDOFF only to the level actually proved.
