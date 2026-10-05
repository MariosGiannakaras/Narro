# CI953 Windows theme / real100% Save / Main recreation / C5 evidence

Frozen source `38219e200fe3bec7309f8e03e72003184ca86d08`, full Windows CI953/run37258629373, artifact11324640580. Exact `narro-m7-validation.exe` SHA256 `bde7646d9a3f17af0078c41e8a90173bc044f6747d24fde278e6f5739ebe05d8`. No Narro source/test/build/CI change was made during this physical-only campaign. Temporary local input/capture helpers are excluded from this evidence commit. Preserve pre-existing uncompiled async read-worker WIP separately.

## Whole recordings and playable excerpts

The two originals are retained whole with original audio,4480×1080/60fps. Only LG1920×1080 was active; unused canvas stays black. Real Windows125%/100% scaling was exercised, restored125%. UltraGear remains unavailable; no dual-monitor or cable/sleep-wake PASS. OBS is stopped. Windows dark and Narro light plus normal animation were restored.

- [2026-10-05 11-02-01.mkv](video/2026-10-05 11-02-01.mkv): 728.800000s, 23204632bytes, SHA256 `8544f62e572d5937ce80b6da9ebda02323a73f577edf31274b9f3f37b5586163`. UTC start 2026-10-05T08:02:01.228Z.
- [2026-10-05 11-16-21.mkv](video/2026-10-05 11-16-21.mkv): 883.285000s, 23876156bytes, SHA256 `735a54e427d2349c05afe0dcae411c5cb36843d51e8cecdaef17f92fd974a854`. UTC start 2026-10-05T08:16:21.598Z.

[Four playable stream-copy excerpts](clips/): Dark Focus pairs, System theme change, real100% Save/Main recreation, and C5 drag/Quit/relaunch. Derived clips omit audio; the whole originals retain it. Requested cut points/keyframe caveat are in [clip provenance](inventory/clips.json). [Chronological manifest](chronological-manifest.csv) and [native actions](actions.jsonl) carry UTC and approximate original offsets. Raw mixed action output is retained in `raw-action-output.log`.

## Visual review x/y, separate from implementation

[Fixed visual matrix v1](visual-check-matrix.json), [compact counts](visual-progress.json). These are review cells for this selected CI953 campaign and its listed open source/motion gates, not a whole-product UI percentage or milestone implementation count. A reviewed FAIL counts as examined, never as accepted. Different cells have different effort; x/y is not an ETA. New scope must be appended explicitly instead of silently replacing this denominator.

|Milestone|Reviewed/total|Remaining review cells|
|---|---:|---:|
|M1|1/1, reused FAIL27|0 review cells; correction/native acceptance still OPEN|
|M5|12/19|7|
|M6|16/25|9|
|M7|13/21|8|
|M8|2/4|2|

**44/70 reviewed,26 OPEN:**43 new directly viewed native static cells and one reused953 DPI failure. The43 static cells are M5 menus/editors12, M6 full titles/large Notes/editors16, M7 compact/expanded/C5-restoredTimer13, M8 eventual System-light projections2. [Full-resolution original-derived gallery](gallery/) includes43 state frames and viewing atlases. Each checked row names its observation/video/offset. No whole continuous-motion or SOURCE_PARITY_PASS is inferred. M2–M4 have no newly opened visual-only gate in these captures. M9 Reports was not shown/exercised; its existing source gate remains OPEN outside this selected matrix. M10 counters do not advance; M11 dormant.

Native static observations: retained Confirm/trash/X menus paint above disabled card metadata in Dark/System-dark/System-light and recreated100% normal/reduced states. Main/Focus100% typed metrics and Save controls stay contained. Unbroken queue tooltips wrap inside the Panel; large Notes title/toolbar/editor/Save remain in the native region. Compact/expanded Timer titles/time/action/subtask areas remain contained in sampled states. The expanded zero-subtask surface has visible empty area; final source geometry comparison remains OPEN. Long headers retain ellipsis and accessible full names; source hierarchy/copy comparison remains OPEN.

Sampling caveat: initial post-observation large-Notes frames had already returned to inline after the immediately following Escape. Six final large-Notes frames are sampled0.45s earlier, inside the held large-editor interval, corroborated by Return-to-compact/Save native bounds. Original offsets are retained in matrix metadata; originals are untouched. The initial immediate System-light Focus probe shows Main; the later exercised Focus frame proves eventual light appearance. It establishes no instant-propagation/visibility-timing PASS; that continuous review stays OPEN.

## Functional/native outcomes

- Real Save20 at100% normal/reduced Main and Focus:16 writes, EST30→31→30min and Taken846→906→846s. [Read-only ledger verification](inventory/ledger-verification.json) confirms all owned task IDs/lists/lanes/sessions/notes and final times match the pre-capture state. Checkpoint session/payload match; legitimate EST writes changed updated_at. Preferences payload is restored. No downtime counted as work.
- Main lifecycle100%:72353300 destroyed via scoped WM_CLOSE, recreated1968730 on the same PID130912; Focus11077022 retained. Real normal/reduced owned drags returned Alpha toThisWeek and Beta stayedToday. Retained menus/Cancel and editors were exercised. No process restart is inferred from this Main recreation.
- Formal C5 on exact953 **PASS**: compact paused active95a2466c task; actual216.33px drag fromTimer(840,614) to(660,494); actual observed Narro tray menu→Quit Narro; process130912 absent; same SHA256 EXE relaunch→PID141908/Focus7471826; actual globalCtrlShiftT exposes paused16:39 compactTimer exactly(660,494), ledger846s/checkpoint801308ms. [Logger terminal PASS](Narro-M7-Logs/m7-c5-latest-result.json) agrees. Logger accumulated maxMoveDistance424px spans the whole old process; the bookmarked qualifying physical drag is216.33px.
- Whole current [Narro-M7-Logs](Narro-M7-Logs/) and [verified ZIP](Narro-M7-Logs.zip) include both old normally-quit130912 and new141908 sessions, all11files plus latest/last-pass/terminal reports. The new process remains alive/paused; its folder is a bounded snapshot, not a later normal-exit claim.

## Bookmarks / limits

-07 native read responsiveness remains the previously published950 FAIL;953 excludes the uncompiled async worker. No slow-lock retest or fix is claimed.
-27 explicit-monitor DPI recovery remains FAIL and narrowly reopens M1/M6/M8; automatic/null selection passed these100→125 placements, which does not fix the explicit stale-key path.
-23 provider horizontal-scroll assertion remains unresolved; no visible horizontal-overflow FAIL is established by UIA alone.
-28 REVIEW_PENDING: after a real drag in recreated100% Main, UIA title focus and actualTab/ShiftTab show focused Alpha title while Task actions are absent; actual pointer hover reveals the rail. Observations36–38 and second video~332–335s preserve it. Reconcile within the open Main hover/keyboard review before deciding defect/fix. No source investigation or patch occurred.
- Two ambiguous Task actions guard rejections caused no click; first cleared hover, later real keyboard/pointer probes recovered the scenario. Windows taskbar after DPI was below-screen until actualWin+B; actual tooltip confirmed the Narro icon before right-click/Quit. These are recorded recovery steps, not fictitious app PASS/FAIL.

## M1–M9 reuse and continuation

Pre/post TODO/HANDOFF/crosswalk snapshots are in inventory. M1: bounded automatic positioning/C5 lifecycle corroboration; explicit27 remains reopened, no quiet performance claim. M2/M3: readonly identity/time/checkpoint corroboration only. M4: scheduling not exercised. M5/M6: scoped static/functional outcomes above; full canonical/motion acceptance OPEN. M7: exact953 C5 now PASS; C4/source07/23/27 and remaining visual review stay OPEN. M8: committed theme/eventual both-window colors only; monitor recovery/source/timing gate OPEN. M9: NOT RUN. M10 may reuse media later, but its hard entry is blocked and no checkbox/counter advances.

Next physical-only work may exercise remaining non-empty subtasks/long Notes/other independent implemented states; source fixes/builds remain out of scope. Analyze the26 listed open motion/canonical cells from frozen media in a later analysis phase. If source work resumes, batch narrow07/27 and any substantiated23/28 corrections before a consolidated build. Continue dual-monitor tests only when UltraGear is genuinely available. Explicitly announce each actual milestone completion, and all M1–M9 completion before M10.
