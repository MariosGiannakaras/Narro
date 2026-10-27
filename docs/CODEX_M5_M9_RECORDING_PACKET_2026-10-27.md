# Codex Windows recording/acceptance packet — M5–M9, 2026-10-27

> **2026-10-27 LIVE SOURCE IDENTITY HOLD:** PR431 is now at **`3e45b9986e4f6afed5ff07f33b922f71eea878f3`**, not the ead9a0c1 commit in the historical C1 artifact row below. The new narrow Preferences cross-window initial-read freshness correction and both-order regression are committed; [CI40470719965](https://github.com/MariosGiannakaras/Narro/actions/runs/40470719965) has validation/fast **PASS**, Windows candidate **PENDING** at this checkpoint. **Do not execute or grade C1 as current final PR431 using old ead9a0c1 EXE SHA `a5273f86...`.** Retain the original artifact row as historical provenance only; first replace C1 active build identity with a *verified* new physical artifact and executable digest after 3/3 exact-head PASS. The separate A/B build rows and their strict OPEN physical gates are unchanged. [Current HANDOFF](../HANDOFF.md) owns this wait/next action; this note is not a physical recording or PA authorization.

**Task owner:** Codex physical-Windows/evidence track. **Implementation owner:** ChatGPT. **Status of this document: PREPARED / NO PHYSICAL RUN INITIATED HERE.** The user asked to finish substantiated source corrections and pre-physical gates so Codex can record the remaining Windows cases. This is the compact **authoritative execution packet for the next physical operator**, not evidence of completion. Current project instruction PA-01–09 USER-PAUSED remains binding unless the user explicitly reactivates that named suite. Never infer a physical session or upload has started from this packet. No M10, M11 or M12 activation.

## Build identities — do not mix sources, present tests or files

| Candidate | Exact commit | Workflow result | Windows artifact and executable SHA256 | Native receipt |
|---|---|---|---|---|
| **Current combined non-M7-compositor slice PR431** | `ead9a0c14d6457a527c57ee6b35d008f0e3d9eb7` | [40437739504](https://github.com/MariosGiannakaras/Narro/actions/runs/40437739504) **3/3 SUCCESS** | `12705832445`, `narro.exe` 16,346,112 bytes, `a5273f869291e223ec7fd633ee2d009d94a14c367d7839bf3c88a2b167b257e1` | **NOT RUN** for updated features |
| **M7 A / PR389** (different branch, not integrated with PR431) | `ec9227a2e09a69c380d4605aaf9623bdd9b9c394` | [40084188512](https://github.com/MariosGiannakaras/Narro/actions/runs/40084188512) **3/3 SUCCESS** | `12557121043`, `08a7e1d6b306e1469c274938c7e5c907ab962766f1b04b9ae2dce0d04d03985a` | 8/8 route acquisitions/analyzed; **STRICT 8/8 OPEN** |
| **M7 B v4 / PR419** (depends on A, not integrated with PR431) | `43adb6a9d798dca56dd89c0f4f91c888e1d4fcd9` | [40084666277](https://github.com/MariosGiannakaras/Narro/actions/runs/40084666277) **3/3 SUCCESS** | `12556993335`, `8436d89b9d868fbdd7f5e5c76b13412a1360182645810e64b835b9a3ba8f9cd8` | 8/8 route acquisitions/analyzed; **STRICT 8/8 OPEN** |

**Proof guard:** Before any native verdict, record real active Narro PID, full executable path, SHA256 of that running path, source head, run ID, test profile, actual monitors/work areas/DPI and OS/renderer animation preferences. A named EXE/ZIP and green CI alone do not identify a running singleton process. Artifact `12705832445` manifest `artifacts/ci-provenance/physical.json` was independently checked for source/run and all three ZIP member hashes (EXE, NSIS, MSI); check against the same hash on the test machine.

**Physical safety:** Use a specifically authorized isolated Windows test process/profile; no personal Narro AppData deletion/reset, Windows registry changes, new installations on the user's profile, artificial poisoned mutex, CDP against an unrelated application or forced monitor unplug. Preserve original recordings/receipts, create new immutable output directories and redact private task data before sharing. Reuse already accepted HDMI/held drag+Escape evidence except where the modified first-reveal/inset path *actually invalidates* that specific claim.

## Recording groups — independently grade PASS / FAIL / INCONCLUSIVE / NOT RUN

### C1. Latest PR431: exact new source only

Follow [P431-01 through P431-10](PR431_SCOPED_NATIVE_ACCEPTANCE_2026-10-27.md) as one bounded recording session; group compatible actions instead of resetting the app between every screenshot.

1. **Process, windows, initial visuals:** C1-01 exact active PID+SHA and normal/reduced renderer; C1-02 Settings and C1-03 Quick Preferences cold/warm vs `Loading…`, skeleton-to-ready flicker, focus and real Retry; C1-04 Search Ctrl+F dark/light and provided screenshot reference, including no inner square outline. 60fps desktop capture where possible, not settled screenshots alone.
2. **Live Panel placement:** C1-05 Quick Preferences side/monitor changes **without** leaving Panel; C1-06 16 DIP nonzero top and chosen side inset based on *selected* DPI/work area (100%/125% only if already available), same single Focus HWND. Record before/after rect + window owner, error state, selected monitor ID.
3. **Timer semantics:** C1-07 direct Timer shortcut from a truly fresh hidden focusSurface with OFF default; C1-08 within-PID genuine drag/Panel↔Compact↔Expanded, Main hide/reopen and Escape-cancel; C1-09 tray Quit prove old PID exit, relaunch OFF resets to Panel, ON persists user-dragged position, legacy SQLite row preserved, toggle ON while Timer hidden. Record independent task/session elapsed persistence; do **not** overwrite user profile.
4. **Availability/hotplug:** C1-10 existing isolated monitor/reconnection scenario only if already authorized; if not, mark NOT RUN and preserve earlier accepted full HDMI receipt, rather than inventing new PASS.

### C2. Independent M7 compositor evidence (A and B are **not interchangeable**)

Review the **already frozen original exact-build** 8/8 A + 8/8 B clips, 16 detailed original-motion frame analyses, native event/QPC receipts and pre-existing strict acceptance gaps **first**:
- [2026-10-25 A/B gate reconciliation](../work-log/2026-10-25-chatgpt-m7-current-candidate-physical-gate-reconciliation.md)
- [G24–G29 exact native six-case review](../work-log/2026-10-24-chatgpt-g24-g29-exact-native-packet-six-case-review.md)
- [Current source/overlap analysis](../work-log/2026-10-27-chatgpt-search-production-css-m7-three-pr-intersection-prephysical.md)

For **each** route Panel→Compact, Compact→Expanded, Expanded→Compact, Timer→Panel, **both** ordinary and reduced motion, report whether the frame-by-frame continuity and user-visible title/time/actions/geometry actually satisfy the strict gate, with precise first discrepant frame and reason. Separately verify single HWND, overlay/ghost/clipped pixels, false blank/smear, topmost/focus/drag/keyboard and monitor/DPI impacts **only for unproven routes**. Do not claim 8/8 PASS from 8 recordings alone, green CI, or old settled UIA. If an ambiguity cannot be resolved by original evidence, label INCONCLUSIVE and specify the smallest missing independent physical present/interaction capture. A proposed repair must be sent back to ChatGPT source owner, not silently implemented by the physical agent; PR389 physical-before-merge must remain in force.

**Do not judge PR431's new inset/session Timer behavior by playing PR389/419 older EXEs**. They predate that change and native source overlaps in `src-tauri/src/lib.rs`; there is currently **no validated A/B + PR431 combined build**. Source integration and final exact-head CI are dependent work **after** compositor candidate acceptance or a new evidence-backed design decision, not a task for the physical recording operator.

### C3. Other M5/M6/M8/M9 / input gates — reuse evidence before recapture

- [57-checkbox source/evidence register](M5_M9_OPEN_PREPHYSICAL_RECONCILIATION_2026-10-27.md): 57 documentary cells = **M5 6, M6 13, M7 18, M8 9, M9 11** (17 parent + 40 child). They **are not 57 confirmed source bugs or 57 new recordings**. Reuse accepted functional/code-integrated claims, established Spectrum Core Create/Edit List picker, image upload and 218 offline icons, merged M9 PR388 Done newest-first order/timezone/PDF, merged PR422 timed alert recovery and merged PR423 first-panic instrumentation. Retest only invalidated claims and unverified native/source parity.
- **M5 Home/List Board/Archived/Done:** check existing source image/video vs user-visible build for task card layout, Done grouping and archived-card preview. P03 independent-lane-scroll semantics **not established by original video**, therefore do not rewrite shared Board scroll on assumption.
- **M6 Focus:** reuse already native-captured list picker/Break/POMO/EST/Done success/Time's Up evidence; grade missing original-source and physical steps by actual build. G29 manual Break automatic resume is **documented accepted product policy** (see `docs/PRODUCT_SPEC.md`); do not create a new product-choice blocker.
- **M8 Settings:** C1 captures cover updated Settings first paint and new Timer preference; reuse other full/Quick settings, shortcuts, alert/sound prephysical evidence. No new unrelated volume/timezone regression inferred without source change.
- **M9 Reports/Sessions:** confirm rendered/PDF order against merged PR388 source; historical TODO `READY_FOR_FIX` is superseded, not a new code bug. Check evidence-limited Reports hover/list filters/Sessions focus only where prior receipts were missing.
- **P09/P11 native input anomalies:** If still reproduced with the exact target EXE, run [focused read-only CDP + Win32 receipt protocol](P09_P11_NATIVE_INPUT_PREFLIGHT.md) and correlate source/actual HWND action. Do **not** change shortcut handlers or drag hit targets based on older uncertain event-delivery traces. No arbitrary keyboard recording or changed personal state.

## Results Codex must write (one consolidated immutable receipt)

For every actually performed group/case: `caseId`, `candidateSha`, `activeExeSha256`, `runId`, `window/HWND/PID`, OS+renderer reduced-motion, display topology/DPI, `action`, `expected`, `observed`, `frame timestamp`, `evidence path/hash`, `verdict PASS|FAIL|INCONCLUSIVE|NOT_RUN`, `reason`, and `affected owner`. A missing capture is **NOT RUN**, not FAIL. Append one **new** immutable `work-log/YYYY-MM-DD-codex-...md` plus indexed evidence directory/manifest (never edit frozen logs); update `HANDOFF.md`, `STATUS.md`, `TODO.md` consistently without overwriting newer main source or checkpoint and without declaring a milestone accepted from a single green build. For any FAIL, identify the first failed action/frame and minimum reproducible native conditions; request targeted source repair from ChatGPT and avoid rerunning unrelated accepted cases.

## Current exit / blockers

- **C1 PR431 code + automated pre-physical: PASS at source `ead9a0c1`; physical C1-01–10 NOT RUN on that exact EXE. PR431 OPEN.**
- **C2 PR389/419 separate CI+artifact pre-physical: PASS on respective heads; continuous-motion strict acceptance OPEN, integration with PR431 NOT IMPLEMENTED/NOT VALIDATED.** No unsupported combination of candidates.
- **C3 accepted previous source-functional and native cases are reusable; remaining source/parity-only differences are OPEN/INCONCLUSIVE, not assumed bugs.**
- Physical PA-01–09 remains USER-PAUSED until explicit reactivation under higher-priority project instructions; this packet stages work only, it is not a recording command or a claim Codex is monitoring in the background. No M10 authorization.

**Next:** Codex reads this packet and `HANDOFF.md` when the physical track is authorized/available; ChatGPT continues root-cause repairs for any *newly established* source FAIL on the owning PR, then exact-head CI and affected-case retest. Do not claim all M1–M9 ready for final acceptance while the compositor integration/strict physical hold is unresolved.
