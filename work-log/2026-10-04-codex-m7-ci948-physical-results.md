# CI948 Windows physical results and corrective reconciliation

Exact source `28e840f50d0888ab86801efc36fff76c6e8e74aa`, full Windows CI948/run37220348196 PASS, artifact11310284191. Production `narro-m7-validation.exe` SHA256 `0914b4c983d91c1e7de3937be53cf2f226e49c8049143469732499bccd932aa3` (15242752 bytes). This is PR233's integrated source, not the earlier CI947 executable.

[Whole evidence package](evidence/m7-ci948-20261004/README.md): both complete original recordings, all eleven native log files and byte-identical ZIP, six playable excerpts, twelve video-derived gallery images, 840 unique directly inspected consecutive frames/28 numbered atlases, exact actions and observations, pre-session inventory and post-session matrix. The original 44-minute recording has not been reviewed frame by frame in its entirety. No production database backup is published.

## Environment and actual lifecycle

Actual Duplicate then Extend restored Ultragear2560x1080/144Hz primary100% at0,0 and LG1920x1080/60Hz secondary125% at-1920,0. Primary status was intentional for a reproducible test environment; both displays were exercised. OBS recorded both side by side at4480x1080/60fps. Computer Use accessibility/input works; its WGC screenshot transport repeatedly times out, so authorized native/GDI navigation and original OBS-derived review are used. OBS capture did not prevent inspecting the application.

PID34456 launched19:32:56.993Z, normal tray Quit19:59:22.066Z, absent19:59:23.201Z. The same SHA executable launched PID55464 around19:59:24Z; Ctrl+Shift+T visibly restored its compact Timer19:59:45Z. Recordings started/stopped normally: 19:32:45.928–19:34:23.316Z and19:34:42.037–20:17:07.960Z. Normal OS animation was restored19:57:36Z. At the log snapshot the second process remains alive with the owned acceptance task paused; this is not a terminal-process log claim.

## Gate results

| Gate / finding | Result and actually exercised scope | Remaining limit |
|---|---|---|
|18 native Find / modal action isolation|**PASS** Main and Focus English/Greek Ctrl+F/T/B/P/S/F/N; native Find absent, old task/session unchanged, invalid Enter stays local, Escape closes, post-close Pause/Resume works.|First purported Focus Greek matrix retained English HKL and is excluded. Later actual4080408 matrix completes all seven chords. Main-to-Focus delivered routing retains its unchanged CI944 PASS; it was not repeated here.|
|19 writer contention|**SCOPED PHYSICAL PASS** owned create, EST/Taken edit, queue reorder, Make Live, duplicate, title edit, delete cancel/confirm, without lost IDs or duplicate committed tasks; CI947/948 real two-connection 14-operation regression PASS.|Actual Main lane Move did not successfully occur; M2 affected acceptance remains OPEN until that transaction path is exercised. No forced production contention stress claim. Local Rust compile NOT RUN: missing MSVC linker.|
|20 narrow metrics|**PASS, normal125% scope** 185px physical/~148CSS card, contained EST/Taken edits, Save and tooltip; unchanged card geometry, durable EST1800/manual Taken45 preserved at restart.|Physical reduced-motion metric editing NOT RUN; automated normal/reduced fixture matrix PASS does not replace it.|
|21 queued title|**PARTIAL PASS** bounded All-list badge/title allocation and fixed action rail on visible rows; actual pointer Move Down and Make Live preserve identity.|All-list lower rows are clipped by23; complete long-queue interaction acceptance stays OPEN. UIA invocation misses on transient rails are not pointer-action failures.|
|09 wrapped Notes tooltip|**PASS, narrow affected scope** wrapped Return button at125%, keyboard/pointer inward tooltip within300x355px Notes area, normal and OS-reduced contexts, draft bytes retained on return/Escape.|OS ClientAreaAnimation=0 was measured; no separate physical CSS matchMedia claim. Wider Notes parity is not implied.|
|C5 saved Timer restart|**PASS** actual root drag across100%→125%, qualifying max native movement2334px, normal tray Quit, same EXE new process, visible exact(-1504,598) restoration; same a2852baa/e75cc774 task/session paused1681052ms, no downtime counted.|Initial header-hover drag that did not move is excluded. Native m7-c5-latest-result.json PASS independently records provenance/topology/safe placement.|
|P3-M5-04 delete|**FUNCTIONAL PASS / SOURCE PARITY FAIL** Cancel preserves the owned duplicate ID; Confirm deletes precisely that duplicate. Source VE00618s retains Schedule/Change List/Duplicate and replaces the bottom Delete row with red trash/Confirm/X. Narro instead closes the menu and puts Confirm/X in the card rail.|New25 requires correction before source parity can close.|
|P3-M5-05 archive|**SCOPED SOURCE/PHYSICAL PASS** an owned empty list archives directly from its menu without a second confirmation; Archive page Restore returns it. Direct archive grammar compared with VE00636s.|Whole Archive visual shell and nonempty-list aggregate-count acceptance are not established by an empty list.|

## New findings, reconciled before implementation

**M7-OBS-20261004-22 — FIX_NOW, stale Focus list catalog.** Main creates the owned list19:34:22Z. Focus All shows its tasks, but the19:40:53Z selector still contains only old lists; Home/reentry does not reconcile it. After C5 restart the new list appears. FocusPanel fetches Home catalog only on fixtureLists mount; list create/update/duplicate/archive/restore/delete APIs emit no shared board invalidation. Correct committed list mutation broadcasts and event-driven catalog reconciliation, reject stale responses, recover deleted/archived selected lists to All, and reconcile Focus entry. No tick-based database polling. Reopen only affected M6/M7 catalog integration.

**M7-OBS-20261004-23 — FIX_NOW, inaccessible long Focus queue.** Fixed340x700 host clips the fourth/fifth All row and its actions. Actual wheel at19:50:06Z does not change their positions. Keep the persistent HWND/WebView and fixed native region; constrain the React queue and provide inner wheel/keyboard scrolling. Document-level and horizontal overflow remain forbidden. A hidden inner scrollbar track, with focusable region and visible keyboard focus, is an explicit accessibility reconstruction for an unbounded local queue, not a claim of source-observed scroll styling. Header/progress remain stable; short queues retain their existing geometry.

**M7-OBS-20261004-24 — FIX_NOW, Windows HTML5 drag configuration.** Actual Main attempts20:04:42/20:06:21Z do not move the owned task; no lift/placeholder is observed. One begins in the title content and the other only5px below the measured card top: the recording alone does not isolate drag-target hit testing, so those attempts are **INCONCLUSIVE about the precise failure mechanism**. Independently, production/CI/diagnostic Main configuration and recreated-Main builder leave Tauri native drag-drop enabled. [Official Tauri configuration](https://v2.tauri.app/reference/config/#dragdropenabled) requires disabling that handler for Windows HTML5 drag/drop. Correct initial/overlay/recreated Main together, then physically prove a confirmed draggable padding hit, lift/drop/settle and ledger Move/Reorder on the exact candidate at100%/125%. Do not change native Focus dragging or claim the config edit physically fixes it before retest.

**M7-OBS-20261004-25 — FIX_NOW, delete confirmation in wrong container.** Direct final source comparison found the P3-M5-04 menu-composition discrepancy above. Retain the open overflow menu and sibling rows; replace only Delete with destructive trash/Confirm/X. Preserve explicit domain confirmation, persistence-first success, cancellation, failure/retry and keyboard focus. Reopen P3-M5-04 implementation and source acceptance; historical PR227 functional proof remains immutable.

These four findings form one coherent affected-integration batch. They are not a recurrence of corrected native Collapse composition. No unrelated milestone implementation starts because a surface appeared.

## Post-session M1–M9 disposition

Pre-session TODO/HANDOFF/STATUS/crosswalk snapshots are included. After capture the current repository inventory was rechecked; no merely visible surface is promoted to PASS.

|Milestone|Post-session disposition|
|---|---|
|M1|Existing exact936/942 single-host/placement/software topology/performance PASS preserved. Both active monitors and cross-DPI drag observed. No new CPU/RAM or physical cable/sleep-wake measurement. Main HTML5 recreation path must be exercised after24; unrelated M1 gates stay closed.|
|M2|19 physical CRUD/reorder/delete evidence reusable; actual lane Move still OPEN. Narrow controlled transaction matrix CI PASS, not blanket physical completion.|
|M3|Pause/resume, task switch and paused restart retain authoritative tracked time/identity. Existing PASS preserved.|
|M4|No new recurrence/DST/week-boundary exercise; existing PASS preserved.|
|M5|20 normal125% containment PASS; P3-M5-04 functional PASS/source FAIL25; P3-M5-05 direct archive grammar scoped PASS. Drag03 remains OPEN24; full source/metric reduced coverage remains OPEN.|
|M6|18 modal routing accepted; visible title21 partially accepted; catalog22/long queue23 OPEN. Existing CI942 Notes/signature-edge scoped source acceptance preserved. Idle Blitz entry fade P3-M6-01 NOT RUN here.|
|M7|C1–C3 PASS preserved; C5 formal tracking reconciled PASS using948 and unchanged936/942 platform/performance acceptance. C4 remains OPEN for22/23 and insufficiently caught07 delayed-loading state.09 bounded tooltip PASS. **4/5 checkpoints**, not completed M7.|
|M8|18 affected native modal defaults PASS. Existing942 preference writer/save/restart acceptance preserved. No new full Preferences source comparison/shortcut registration conflict test.|
|M9|Reports/Sessions NOT RUN; Overview PDF remains routed unimplemented. No inferred progress.|
|M10|Reusable videos/logs/identity-risk evidence only. Hard entry blocked; no checkbox/counter advances.|

Current completed milestones remain M1/M3/M4 only: **3/10M ||4/5 |14/19**. The historical14/19 is not an additional independent work estimate. All required M1–M9 acceptance must pass and the user must be explicitly told before M10 begins.
