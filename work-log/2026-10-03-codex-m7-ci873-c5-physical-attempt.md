# M7 C5 physical attempt on resulting-main CI #873

**Result: INCOMPLETE. C5 remains OPEN.** The native evaluator remains **PENDING**, with reason `qualifying-drag-recorded-waiting-for-tray-quit`. Computer Use reported an interruption caused by the user's physical Escape key before normal tray Quit and relaunch. No further desktop input was issued after that interruption.

## Exact build and checkout

- Synced local `main` to `9ffa3b116a51aa9f38bf9e4938ccf5ccf33aa787` without reviewing the repository diff.
- Preserved the pre-existing tracked and untracked local changes in stash commit `ee0b5257503a897f903a49938f823a583a6869f6`, named `preserve-local-before-main-C5-CI873-2026-10-03`.
- [Resulting-main Windows CI #873](https://github.com/MariosGiannakaras/Narro/actions/runs/37105088285): completed/success; source `1423bb8a71deedac2fa17edf6c2fae1f98e2cbb0`.
- Artifact `narro-m7-validation-windows-x64`, id `11268220111`, downloaded through authenticated GitHub CLI. API archive digest: `e17532df1f1eab86022d93616fb4d217ff09d6378ee94bf5af90522950286e44`.
- Executable `narro-m7-validation.exe`: 14,874,624 bytes; locally verified SHA-256 `4fde3778720505705ac9c7f9b05a30cb70c26b02c09c6dec442775bc5c66637c`; runtime fingerprint `fnv1a64:ccb7e96a5db9d324:bytes:14874624`.
- Executable remains at `E:\SystemFiles\Desktop\NarroUpload\artifacts\m7-c5-ci873-20261003\narro-m7-validation.exe`.

## Physical observations and remaining steps

1. Launched the verified EXE normally, PID `8500`, session `378e0748-5f43-45ad-96c2-e410495d95ac`.
2. Created a dedicated `M7 C5 CI873 validation` task in Today in the existing Test list, with no EST. Started it using the visible Blitz now control. The Focus Panel physically displayed the task and a running elapsed timer.
3. Changed to the compact Timer using `Ctrl+Shift+T`. Physical captures showed the task title, elapsed time, subtasks and expand control.
4. Executed real native Timer drags using `sky.drag`. The first out-of-bounds destination was rejected. A later attempt encountered the NetLimiter Blocker overlay. These input limitations are preserved in the operator history; they are not reported as successful planned coordinate deltas.
5. The native trace independently recorded accepted moves and qualifying movement: baseline `(1960,851)`, maximum distance **268 physical pixels**, `qualifyingMove: true`, `acceptedForPersistence: true`. Actual observed moves included `(1900,811)`, `(1885,989)` and `(1805,974)`. The placement engine persisted contained compact coordinates, including `(1805,970)`.
6. Some dragged positions briefly exceeded the work-area bottom. After an observed expand/collapse cycle, the final pre-Quit compact region was fully contained at **`(1805,970)`, 340 × 110**, within DISPLAY1's 2560 × 1080 work area. The outer host is 356 × 708; its clipped visible region is the acceptance geometry. This narrow observation does not certify unrestricted drag-edge behavior.
7. **Normal tray Quit: not completed. Same-EXE relaunch: not performed. Post-relaunch Timer recovery: not observed.** There is only one process session in this attempt; no second-session evidence was fabricated.

The validation app and its dedicated running task were left open when Computer Use was interrupted. The next authorized attempt can continue from the existing session through normal tray Quit, relaunch of the same EXE, and Timer restoration. Recheck current physical state first.

## Computer Use recovery and authorization history

- `sky.get_window_state` graphics capture repeatedly reported `FrameArrived timed out` or `window capture timed out`, including on an independent Windows Settings window. Accessibility text remained readable.
- Full Node-session/helper restarts did not restore WGC capture. Only helpers started during this task were stopped; the existing Swift helper was preserved.
- The existing per-user Windows `CaptureService_445b49b1` was stopped/manual. A bounded elevated operation started it successfully at `2026-10-03T08:36:13.2316837Z`; its startup mode remained Manual. Fresh helper capture still timed out, so this is an attempted operational repair, not a demonstrated root-cause fix.
- Accessibility-index click initially failed with `coordinate input geometry is unavailable`. The documented `sky.click` window-coordinate path worked. Continued with documented Computer Use inputs and independently captured physical desktop pixels, using the existing repository capture scripts and the included read-only capture script.
- The helper did not expose taskbar/Start as selectable windows. The user explicitly approved a limited Win32 fallback for tray access, then also explicitly authorized Allow on the pending NetLimiter request.
- One native click targeted the observed NetLimiter Allow button. Its dismissal/Allow outcome was **not confirmed**; the blocker was still observed immediately afterward. No Remember option or durable rule was selected.
- The next Computer Use call returned: `Computer Use was stopped by the user with the physical Escape key. Stop your work, do not call further Computer Use tools in this turn, and send a final message noting that the user stopped Computer Use.` All subsequent work was file packaging and repository evidence publication; no more desktop input was issued.

## Evidence

- [Entire Narro-M7-Logs folder](evidence/2026-10-03-m7-ci873-c5-computer-use-attempt/Narro-M7-Logs/)
- [Narro-M7-Logs ZIP](evidence/2026-10-03-m7-ci873-c5-computer-use-attempt/Narro-M7-Logs.zip), SHA-256 `2ea17b8388a6be2e6f47a4e8d67924cccfe0f2db0d4ef431a75b61df418f23a6`
- [Provenance and outcome](evidence/2026-10-03-m7-ci873-c5-computer-use-attempt/provenance-and-outcome.json)
- [Evidence file manifest](evidence/2026-10-03-m7-ci873-c5-computer-use-attempt/file-manifest.json)
- [Native evaluator](evidence/2026-10-03-m7-ci873-c5-computer-use-attempt/Narro-M7-Logs/m7-c5-latest-result.json)
- [Raw native timeline](evidence/2026-10-03-m7-ci873-c5-computer-use-attempt/Narro-M7-Logs/session-20261003-082606.801Z-8500/events.jsonl)
- [Final pre-Quit physical Timer](evidence/2026-10-03-m7-ci873-c5-computer-use-attempt/Narro-M7-Logs/visual-evidence/17-before-quit.png) and [native geometry](evidence/2026-10-03-m7-ci873-c5-computer-use-attempt/Narro-M7-Logs/visual-evidence/17-before-quit-metadata.json)

All automatically generated logger files are retained, byte-for-byte, as a snapshot of the still-running first session. Additional physical images and metadata are under `visual-evidence`. Diagnostic full-desktop/occluded captures containing unrelated network details were kept locally outside the published logger folder; no generated native logger file was removed or altered. The early Main images were rescaled; later Timer images use the stated visible-region dimensions. The static images support the specific visible-state observations above and do not establish continuous compositor acceptance.

Publication verification checks the ZIP against every file in the copied logger folder and verifies manifest hashes. No source changes, builds, test suites or new Windows CI were needed for this evidence-only publication. No M7 checkpoint or milestone counter advances.
