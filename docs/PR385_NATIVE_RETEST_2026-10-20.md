# PR385 Windows native retest — RA02 analysis, 20 October 2026

The capture occurred **19 October UTC / 19 October Athens**; this analysis was published20October Athens. Capture **5/5 RA02 planned cases**, review **5/5**, scoped verdicts **3 PASS / 1 UNCERTAIN / 1 FAIL**. This is not5PASS and does not close M6. RA01 pointer-release **NOT RUN** due ComputerUse acquisition failure. Three corrective scopes now: RA01-A native OPEN; RA02-A **FAIL** on a newly exposed SuccessON/last-task ordering; RA02-B obsolete live status **PASS within this native scope**.

## Identity, method and safety

PR385 exact head `ed4d5083e1df00077df2fef2bb74a6cf90321692`, CI39298395231 **3/3SUCCESS**, main merge `4064fb9a05c55ed91f226a115cf479b5d7f52dcc`; exact input equivalence already documented. EXE SHA256 `6a790dcd26345196d8035764bb4cc8c26ec7b771603a0a1bfc8d0f9f5de32c53`. No source/build/test/CI changed in this acquisition/analysis. One monitor2560×1080/96DPI, dark theme; normal OS motion explicitly enabled then original reduced settings restored. Native input used ComputerUse keyboard navigation, actual MakeLive/Next/TakeBreak and Ctrl+Alt+F; not JS/API-simulated interaction. Focus HWND331152/PID50552 persisted through these states; no mode-switch validation inferred.

New isolated profile and readonly SQLite backup preceded launch. Nine synthetic tasks; personal Roaming/Local restored **hash-identical**; one transient Local-WebView file lock cleared after process exit. Recorder/Narro stopped, OBS unchanged/stopped. [Restoration proof](../work-log/evidence/pr385-native-retest-20261019/original-profile-restoration-proof.json). The completed session ledger must never be replayed. Private backups/raw unrelated desktop content remain local.

## Capture quality and precise interpretation

Two immutable GDI desktop recordings requested60fps, with finite180s caps. **Actual decoded delivery was about34.6fps**, VFR. OFF6236frames/179.984s, maximum217ms gap globally; ON4469frames/128.950s, maximum67ms. Around important completion boundaries there are17–50ms spacings. **Do not turn requested60fps into observed60fps, duplicate/interpolate frames, or certify absence of a one-frame native flash from this cadence.** The positive recorded FAIL is valid despite missed frames; fine continuity absence remains UNCERTAIN. [All frame PTS, gap list and approximate UTC action alignment](../work-log/evidence/pr385-native-retest-20261019/capture-quality.json). UTC offsets use file creation time only as approximate navigation aids; the frame/PTS pointers below are actual decoded media coordinates.

Published [OFF owned-Focus video](../work-log/evidence/pr385-native-retest-20261019/video/RA02-OFF-focus-lossless.mkv) and [ON owned-Focus video](../work-log/evidence/pr385-native-retest-20261019/video/RA02-ON-focus-lossless.mkv) crop x2220/y0/340×700 from originals; original time base/order is preserved, no retiming or frame synthesis. The OFF180s cap includes subsequent real scope/preferences navigation; ON manually stopped cleanly after final expiry receipt. Original full-desktop files/hashes are recorded, unchanged locally. Published media contains the owned app surface. No audio capture/acceptance.

## Independent case dispositions

| Case | Native evidence (zero-based original frames / PTS) | Verdict and bounds |
|---|---|---|
| C1 OFF eligible automatic next | OFF f854–865/24.700–25.067; Completing f858/24.833, StartingNext859–861, NextEligible Running862/24.983 | **UNCERTAIN strict60fps continuity**, observed sequence coherent: no generic idle/completed pending row among acquired consecutive frames. Functional single completion/next-start PASS. [Strip](../work-log/evidence/pr385-native-retest-20261019/frames/off-next-consecutive.png). |
| C2 OFF no eligible next | OFF f1036–1047/30.017–30.367; finishing1040–1041, AllClear1042/30.200,2/2Done | **PASS scoped settled no-next behavior**, no phantom next; subframe visual absence unproven. [Strip](../work-log/evidence/pr385-native-retest-20261019/frames/off-last-consecutive.png). |
| C3 ON completion then untimed rest with queue | ON f649–660/18.433–18.817; pending653–654, success655/18.650. Rest f1188–1189/33.967–34.000; real status then absent after expiry (UIA18:32:45+, screenshotrest-expired) | **PASS scoped rest/status**: no stale OnlyEligible-now-live returns after2400ms; ONNext/ONThird remain legitimately queued, timer idle. Completion micro-continuity still sampled only. [Completion](../work-log/evidence/pr385-native-retest-20261019/frames/on-only-consecutive.png), [rest](../work-log/evidence/pr385-native-retest-20261019/frames/rest-queue-consecutive.png). |
| C4 ON explicit Next | ON f3270–3281/93.933–94.317 success; f3647–3658/104.833–105.183 explicit Next; Starting3651/104.950, ONThirdRunning3652/104.983 | **PASS scoped explicit Next**: one start, correct third task/session; no automatic next while success waits. Micro-continuity absence not certified. [Next strip](../work-log/evidence/pr385-native-retest-20261019/frames/explicit-next-consecutive.png). |
| C5 ON final completion then rest | ON f3748–3759/107.767–108.183; f3753/107.967 shows success ONThird AND ONThird pending row, header2/3Done/Est10m, old2Done; f3754/108.000 then3/3Done/no pending row. Final rest4250–4251/122.433–122.467, honest AllClear afterwards | **FAIL presentation consistency**, one acquired stale-board frame; actual symptom duration bounded by neighboring acquired frames, not precisely33ms. Final rest/status and persistence PASS. [Consecutive strip](../work-log/evidence/pr385-native-retest-20261019/frames/on-third-consecutive.png), [exact bad frame](../work-log/evidence/pr385-native-retest-20261019/frames/confirmed-f3753.png), [final rest](../work-log/evidence/pr385-native-retest-20261019/frames/rest-final-consecutive.png). |

The C5 issue is **not data loss or a second completion**. [Synthetic persistence](../work-log/evidence/pr385-native-retest-20261019/persistence-proof.json):9unique original task IDs;5completed tasks;5closed work sessions with durations65/5/8/7/2seconds;0timed-break sessions;0runtime checkpoints. Deliberate untimed rest with remaining tasks legitimately shows `No live task in this view`; that is distinct from the false transient during committed Done.

## Correction and escalation boundary

PR385 repaired native-event-before-reply intent ownership and stale live-identity feedback, but **clears intent when success publishes before the independently owned Focus board refresh commits**. Success receives its own postcompletion snapshot; FocusPanel's queue/header/done still render another snapshot. C5 exposes this still-open success/board ordering. A parent intent plus more timing delays is insufficient. Compare a coherent authoritative postcompletion projection (success+same snapshot) against retaining a render barrier until all independent producers reconcile; select with mounted deferred-IPC tests. Preserve the mounted live Notes draft until an actual committed event, committed-failure semantics, sound timing, explicitNext, local untimed rest and target/freshness guards.

Repeated-failure rule applies to the **same coherent-Done acceptance criterion on two corrected CI-green physically exercised builds** (PR382/50797aae and PR385/ed4d5083); the native symptoms differ and are not called identical. Record the whole causal path/alternative decision before another patch. Prior mounted harness used one global board barrier, so success's private read and parent read released together; it never modeled private-success-read fresh with parent-board-read still pending. Regression must split those independent channels and assert queue/header/done in the exact success render, including ONlast/ONwith-next and invalidation races/refresh rejection.

## Reuse matrix and remaining work

| Existing scope | Disposition from this session |
|---|---|
| M5 RA01 pointer-release | NOTRUN; Sky click lacks coordinate geometry, MainWGC `FrameArrived timed out`, FocusWGC `window capture timed out`. Keyboard reorder is not substituted. |
| M6 RA02-A coherent completion | FAIL C5; C1 strict cadence UNCERTAIN; no closure. |
| M6 RA02-B obsolete status after rest | PASS scoped two actual post-expiry rests; preserve for unaffected implementation. |
| M3 persistence/timer identity |9IDs/5closedwork/0phantombreak scoped PASS; no crash/sleep/clock test claimed. |
| M8 ShowSuccess setting | ordinary QuickPreferencesOFF→ON saved, DBtrue, actualsuccessshown; scoped setting acceptance only. Other Preferences/shortcuts gates not exercised. |
| M1/M7 topology/window | single-monitor observation and same FocusHWND only; no multi-monitor, drag/topmost/mode-toggle/performance acceptance. |
| Source visual/motion parity | no new canonical Blitzit comparison, staysOPEN. |
| Roadmap | M1–M4 accepted4/10; M5–M10 open; M10hardentry unchanged; M11/M12 dormant. |

No original prior109-file corpus altered; no second research pass, installation, personal data mutation or protected SpectrumCore/upload/218icon change. All actions/UIA/synthetic receipts and decoded-PTS evidence are in the [evidence packet](../work-log/evidence/pr385-native-retest-20261019/README.md).
