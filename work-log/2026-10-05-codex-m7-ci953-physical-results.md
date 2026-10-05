# CI953 physical Windows campaign — 2026-10-05

Exact frozen PR235 source38219e200fe3bec7309f8e03e72003184ca86d08 / full CI95337258629373 PASS / artifact11324640580 / EXEbde7646d9a3f17af0078c41e8a90173bc044f6747d24fde278e6f5739ebe05d8. PID130912, persistent Focus11077022; actual Main1246986 closed by scoped WM_CLOSE and recreated72353300 in the same process. Local async read-worker WIP is excluded. [Whole evidence](evidence/m7-ci953-physical-20261005/README.md).

The campaign followed the user's physical-only priority: actual native/UIA/SendInput/Windows settings interactions, original OBS capture, short recovery probes and factual timestamps; no source implementation/build/root-cause campaign. Computer Use accessibility/inventory worked; WGC frame timeout and calibrated click limitations required authorized native/UIA/GDI fallback. Actual LG1920×1080 was the sole active display.100% was tested by changing LG scale, not substituting a browser zoom; Windows native DPI96/120 is recorded.125%/normal motion were restored. Primary display was not changed. UltraGear unavailable; no dual-screen PASS.

## Chronological bookmarks

UTC actions and exact raw records are in native/actions.jsonl. Original-file offsets are approximate from OBS start-action time; gallery-manifest offsets are exact ffmpeg timestamps. Clips retain original frames (stream-copy, no visual synthesis). First original10414.4s includes the long unattended/minimized gap between~03:50 and06:38; that gap supplies no acceptance.

| UTC | Original / approximate offset | Observation |
| --- | --- | --- |
|03:45:57–03:48:49|06-45-55 /2–174s|125% empty/cross-lane and same-lane drag, Escape mid-drag, reduced drag.|
|06:38:47–06:39:29|06-45-55 /10372–10413s|Restore minimized Main; reduced retained Delete confirmation/Cancel/Escape.|
|06:40:15–06:41:24|09-40-15 /0–69s|Normal menu; Main normal/reduced EST/Taken editors/Cancel/Escape.|
|06:42:49–06:45:05|09-40-15 /154–290s|Card Alt+Right; normal pointer; scoped Main recreation; recreated Main drag/menu.|
|06:45:20–06:48:33|09-40-15 /305–498s|Unavailable stored display; automatic displayed but not committed; selecting current125 display recovers Focus.|
|06:48:47–06:50:55|09-40-15 /512–640s|All queue wheel/last Today menu; full unbroken tooltip normal/reduced; Ctrl+End reaches last Done item.|
|06:51:23–06:55:08|09-40-15 /668–894s|Paused Panel editors, large Notes, Panel/compact/expanded, six hover actions each motion, Timer drag and Find Timer.|
|07:00:xx|unrecorded setup; native DPI snapshot|LG125→100; explicit selected monitor becomes stale, old right anchor leaves85px gap.|
|07:02:06–07:04:38|10-01-04 /62–214s|Real100 empty/cross/same-lane drag, menu variants, editors, Escape mid-drag, keyboard lane move.|
|07:05:42–07:08:07|10-01-04 /278–422s|100 Panel editors/Notes/queue end and contained full-title tooltip normal/reduced. One early hover fell outside clipped queue because inline Notes was open; only corrected visible hover counts.|
|07:08:14|10-01-04 /430s|27 FAIL: Return to Panel reports MONITOR_SELECTION_STALE after real DPI change.|
|07:09:54–07:12:08|10-01-04 /530–664s|Current100→automatic recovery; same HWND clean Panel/compact/expanded/drag/find/return normal/reduced.|
|07:16:50–07:17:24|10-15-18 /92–125s|125 restoration; automatic right anchor1495+425=1920; Panel/Timer/Panel same HWND. Earlier interval includes Settings activation/maximize recovery.|
|07:31:18–07:33:25|10-30-35 /43–170s|Real reduced125 Main and Focus EST30→31→30min, Taken846→906→846s, authoritative read-only ledger snapshots.|
|07:34:19–07:34:22|10-30-35 /224–227s|Native queue ScrollPattern reports horizontal true/view85.31%; actual100-percent request remains0/no proven movement; normal restored/OBS stopped.|

## PASS / FAIL / OPEN

| Scope | Verdict and boundary |
| --- | --- |
|24 drag|Native functional PASS100/125, including empty lane, insertion/order, Escape cleanup, keyboard lane move and recreated Main. Direct normal/reduced lift/reflow/drop/settle against canonical P3-M5-03 remains OPEN.|
|26 paint|Native static PASS all four DPI/motion states, directly reviewed original-derived crops; metadata no longer paints above retained menu. Full canonical/source-motion comparison OPEN.|
|20 metrics|Real reduced125 Main/Focus Save+restore PASS, durable exact906s at changed Taken and846s restored; EST31/30 projected/committed without timer reset.100 editors/Cancel/Escape PASS only;100 real Save not claimed.|
|09/21 title/Notes|Full title accessible; tooltip containment/wrapping100/125 normal/reduced scoped PASS; large Notes title/editor/Save visible within same Focus region in sampled100/125 frames. Detailed source/motion/hover timing OPEN.|
|23 queue|Vertical Ctrl+End/access/menu scoped evidence acquired and prior sufficient acceptance retained. Provider inconsistency remains OPEN: horizontal true does not establish visible scroll/overflow; SetScrollPercent100 remained0. No new real horizontal-motion FAIL asserted.|
|27 monitor/DPI|FAIL for explicit saved selection through real DPI change; automatic displayed fallback cannot directly commit clearing stale selection. Workaround current→automatic PASS; new narrow acceptance required.|
|07 pending read|Known950 failure remains unresolved, no new delayed-loading PASS. Separate local WIP awaits source-phase/Windows compilation/physical validation.|
|C5|Existing948 qualifying drag/tray Quit/same-EXE restart remains accepted.953 timer drag is scoped evidence; no953 formal tray/restart/C5 PASS claimed.|

Read-only before/final comparison verifies all sampled task identities, list identities, titles, notes, sessions, completed states and tracked times, except intended owned lane/rank changes. Paused checkpoint semantic state remains session763d0419/task95a2466c/801308ms and EST1800000; explicit restored EST writes changed updated_at. Automatic monitor keynull is the deliberate recovery setting; other preferences retained. No database backup is uploaded.

## Session evidence matrix — pre/post M1–M9

Current TODO/HANDOFF/crosswalk were inspected for the campaign; pre snapshots accompany native/inventory. All segments use the same frozen executable/repository source; later inputs adapt to observed state and failures. Post current tracking accompanies the evidence. A displayed surface does not imply milestone PASS.

| Milestone | Evidence reused/acquired | Post disposition |
| --- | --- | --- |
|M1|Main same-process recreation; Focus identity/DPI/geometry; explicit stale DPI recovery and automatic clean reentry.|Reopen selected-monitor/DPI27 only.942 quiet performance/topology/lifecycle acceptance remains historical accepted scope; no new performance/cable/sleep-wake claim.|
|M2|Owned task identity/lane/rank data, no duplicate/session/time loss; real restored metric ledger.|Existing M2 acceptance retained; no new contention stress claim.|
|M3|Paused projection across presentation/editor transitions and exact846/906/846.|Existing controlled-time engine acceptance retained; no completion/times-up/break/sleep cycle newly exercised.|
|M4|No scheduling/day/DST run.|Prior acceptance retained, no advance from appearance.|
|M5|Native drag/menu/Main editors and real reduced Save.|Scoped native routes above; full visual/motion/canonical parity OPEN.|
|M6|All queue/keyboard end/full titles/Notes/editors; same-host Focus.|Scoped results above;27 dependent monitor acceptance and remaining canonical/visual parity OPEN.|
|M7|Normal/reduced Panel/Timer/compact/expanded, hover/Notes/drag/Find.|C1–C3/C5 accepted history; C4 OPEN with07/23/27/source comparisons.|
|M8|Actual CtrlShiftT/B/P paths; current/automatic display selection and durable keynull.|Preference recovery27 reopened; no complete chord/layout/conflict/save-restart acceptance from this run.|
|M9|No report/PDF/history acceptance exercised.|Existing open report/PDF/source gates retained.|

M1 newly reopened means completed M2–M4 only:3/10M. M7 remains4/5. Legacy14/19 is frozen, not advanced. M10 hard entry blocked; M11 dormant. Announce each actual milestone completion and all required M1–M9 completion before M10.

## Exact continuation

OBS stopped, LG125%/normal restored. Candidate953 PID130912 remains alive/paused; Focus11077022, recreated Main72353300. Selected monitor automatic/null; original user task data retained, no normal tray Quit. Preserve local unpushed07 WIP and generated icons. Remain in user-authorized physical-only priority: acquire missing independent dark/system/100% Save cells and dual screens if hardware becomes available. Another chat can perform detailed motion/canonical comparison using the whole originals and chronologic manifest; do not repeat builds to obtain already-recorded states. On source-phase resumption, reconcile27 and unresolved provider23 before batching narrow corrections with07; then one exact build/native retest. PR235 is still draft/unmerged.
