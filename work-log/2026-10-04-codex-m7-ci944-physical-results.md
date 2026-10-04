# Exact CI944 physical Windows result and corrective batch

Recorded 2026-10-04, OBS UTC14:25:24.311–15:11:41.970. Source provenance: PR232 exact head6029b5529f025c8dffb4e05331e11a6bbcbb4bec, identical merge0df4c14cfa6fa8632cff49529ddc36510d67ddd3, full Windows CI944/run37197934204 PASS, artifact11302770897.

Exact production CI944/head6029b552/merge0df4c14c EXE SHA256 b6814cf572e89c0d738659726d2fa1fc06cda1dea65721f4cb1f6d04900439fa was physically tested. Modal action isolation17 PASS for Main/Focus English/Greek T/B/P/S/F/N and Main→Focus delivered B/P/S/F/N, local invalid Enter/Escape and post-close Pause/Resume/Notes. Ctrl+F exposes native WebView2 Find in both modal windows/layouts: new18 FAIL. Owned task creation19 FAIL once with TASK_CREATE_FAILED/database is locked; actual retry commits exactly one task. Narrow Main Schedule/EST/Taken overflow20 FAIL at125%. These are a single next corrective batch, not native Collapse recurrence. M2 writer concurrency narrowly reopens; prior unrelated acceptance is preserved.

CI944 native C5 PASS: running compact Timer, actual522.015px drag, normal tray Quit/PID97916 absent, same-SHA relaunch/PID69800, explicit Ctrl+Shift+T restore at(396,746), same task a2852baa/e75cc774 session paused935.051s/15:35; actual three-line Enter Notes persist. One physical1920×1080/125% LG was active; Duplicate→Extend did not activate the other display. No dual-display/sleep-wake PASS for this session. Original OBS4480×1080/60fps2777.087s video is stopped normally,157799345 bytes. Whole logs/video and video-derived review publication is being prepared; no entire-recording frame-review claim.

M1 accepted placement/topology/performance remains supported by exact CI942. Current completed milestones M1/M3/M4 only; narrow M2 concurrency, M5 containment/source, M6/M7/M8 shortcut/source closure and M9 remain open. **3/10M ||3/5 |14/19**. M10 gets reusable evidence only; no checkbox/counter before all required M1–M9 gates clear and explicit user completion announcement.

## Confirmed findings and bounded dispositions

- **17 PHYSICAL_PASS for exercised routing:** fourteen direct chords per window (six actions plus Search in two layouts), ten Main→Focus action deliveries while Focus modal is open. Action paths preserve task/session/phase; naturally accrued work is allowed. Search independently fails18. Enter shows title validation, Escape closes modal, outside English Pause and Greek Resume/Notes work. Main dialog form creation and Focus Notes Save remain usable. Hidden/inert and asynchronous races have actual-rendered automated coverage, not fabricated physical coverage.
- **18 FIX_NOW / PHYSICAL_FAIL:** Ctrl+F opens native WebView2 Find above Main and Focus Add dialogs in English and Greek. Current recognized-shortcut modal guard returns without preventDefault, so Chromium performs its default. Consume recognized shortcut defaults at the active-modal boundary, retaining dialog-local Enter/Escape/text behavior. Add actual-rendered defaultPrevented assertions and physical exact-EXE retest.
- **19 FIX_NOW / PHYSICAL_FAIL; narrow M2 reopened:** actual named task creation14:42:55.78 UTC reports `[TASK_CREATE_FAILED] task persistence failed: database is locked`. First empty/unconfirmed-input attempt is a tool failure and is not another DB reproduction. Retry via actual Add14:45:24.740 succeeds exactly once. One Narro process; ledger readers use mode=ro and close connections. `create_task` uses DEFERRED read-before-write whereas create-at-top and Preferences already reserve the writer first. This is a candidate mechanism, not a proven identification of the physical competing writer. Investigate runtime connection/timeout/background writers and related affected task mutations; controlled two-connection contention regression must establish the fix. Preserve transactional success-first and identity invariants.
- **20 FIX_NOW / PHYSICAL_FAIL; narrow M5 containment:** at1000 logical Main width/125% DPI the Today card is about147 CSS px wide and its Schedule/Repeat + EST + Taken row extends outside the card into Done. Large title remains visibly ellipsized with accessible full-name, but that is not metrics acceptance. Use calibrated responsive containment and stable hover/focus targets; actual rendered narrow-width regression plus physical retest.
- **Queued All Lists title observation / assessment OPEN:** long list badge and reserved actions leave a very small queued title region. Full title is accessible and task activation works. Compare relevant canonical All Lists evidence before declaring a source discrepancy or choosing a bounded accessible reconstruction; no invented minimum width or SOURCE_PARITY_PASS.

## Cross-milestone inventory and adequate reuse

Pre-capture TODO/HANDOFF/audit crosswalk copies are in the session inventory. Post-capture inventory:

| Milestone | Current scope / disposition |
|---|---|
| M1 | CI942 replacement gates remain accepted. Current one-display session supplies125% observation only; dual/sleep-wake not exercised. |
| M2 | Task-create writer contention19 reopens only concurrency acceptance. Retry creates one identity; no direct DB writes. |
| M3 | Same live task/session checkpoint survives normal Quit; downtime excluded and paused935.051s restored. Notes bytes preserved. Other timer acceptance preserved, no full M10 reliability suite claim. |
| M4 | Schedule/recurrence/DST not exercised; no new disposition. |
| M5 | Owned list/task creation and narrow-title access exercised; metrics20 FAIL. Drag/reorder/archive/delete/full canonical matrix NOT RUN here. |
| M6 | Modal action routing17 physical PASS; native Find18 and source/title assessment remain open. CI942 placement/topology remains accepted. |
| M7 | Native C5 PASS on944, action routing17 PASS, full closure blocked by18 and affected integrated/source gates. No unrelated host rewrite. |
| M8 | Modal defaults18 FAIL; CI942 Preferences save/restart acceptance preserved. No new autostart/shortcut conflict acceptance. |
| M9 | Reports/PDF/export surfaces not exercised; current implemented/source gates remain open. |
| M10 | Reusable evidence only. Hard entry gate remains closed. |

Final screenshots must come from the original video. Navigation GDI images/raw helper failures are retained for provenance, not passed off as video exports. Original video and all Narro-M7-Logs must be published, including both processes and pending/terminal evaluator files. Continuous motion review counts will be recorded after direct inspection.
