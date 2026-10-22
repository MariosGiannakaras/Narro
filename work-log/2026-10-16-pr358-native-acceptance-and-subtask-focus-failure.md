# PR358 Windows acquisition and aggregate review — 2026-10-16

The two newly affected claims are **2/2 captured, 2/2 reviewed, 2/2 scoped PASS**. B46's previously unexercised nonempty-EST reset also passes. A real repeat-entry focus defect in B12 remains FAIL and enters a separate corrective branch; M5 is not complete. M1–M4 remain **4/10 mandatory milestones**, M10 blocked, M11 dormant.

## Exact executable and validation

[PR358](https://github.com/MariosGiannakaras/Narro/pull/358), source `6a6079465fab293b973258083550192d640f4884`, [CI38826523275](https://github.com/MariosGiannakaras/Narro/actions/runs/38826523275) SUCCESS3/3, guarded merge `0a4267bb`. EXE SHA-256 `a0c710ce664d081fb4ceab6045285f19fd0d34a84d639281d5143e722b99bd15`, artifact12015807692. Main553-input identity permits exact PR validation reuse; duplicate main run38828452837 was CANCELLED, not passed. No product edits occurred during capture.

## Acquired session

Continuous OBS dual-screen4480×1080/60fps recording began00:19:29Z before launch, stopped00:38:03Z: actual container duration1112.900s. It includes interaction/probe and controller pauses, not1112s of uninterrupted user actions. Full original113,022,127-byte MKV is preserved as two byte-exact parts (GitHub's per-file limit); SHA-256 `671ad27833ec29931e2246521bee2f08f899dab39bb15cb8523ae9d65fc962e4`. The complete [playback copy](evidence/pr358-native-20261016/video/playback-review.mp4) is explicitly re-encoded2240×540/30fps for convenient review; original60fps parts remain authoritative for motion. Whole video decodes with no reported errors. Review used37 context samples/four sheets, relevant native stills, UIA, chronology and read-only owned-database snapshots. No exhaustive frame-by-frame micro-animation or physical reduced-motion acceptance is claimed.

Actual mainHWND5573518/PID26200 at primary96DPI100%, then secondary120DPI125%, dark→light. No topology/primary-monitor setting changed. Normal tray Quit, same verified EXE relaunch PID47040/HWND2100730, Board reopen and final normal tray Quit completed. Relaunch returned Main to its normal primary ordinary-window placement; this is not a Focus saved-placement test. Fresh owned Roaming/Local profiles and SQLite backup protected personal data. Original profile restored and original DB hash `13185e54bc0ea08f3b368ccc48a8ede429683e1d58a60b15b8f7491a06d2224d` identical. No Narro/recording remains active.

## Claim dispositions

| Claim | Result | Actual evidence and limit |
| --- | --- | --- |
| B70/U36 visible-lane retention | **PASS** | Pete created ThisWeek, scheduled Oct23 and projected scheduledBacklog;00:26:47Z quick-X leaves ordinaryBacklog below existing copywriter. Read-only snapshots62→71→77→136 prove same task/list IDs, EST900, zero Taken, identical note hash/five child identities with4complete, proper bucket ranks, no sessions. State survives normal Quit/relaunch. Matches canonical VE00702:28–02:33 behavior; does not claim tutorial frame timing. |
| SS-C06 horizontal quick actions | **PASS, scoped row** | Native87/89 dark100 and118/122 light125 show three contained horizontal actions. Actual AddTask, AddList and Reports exercised90–99, Tab focus and Escape captured. Direct canonical SS-C06 compared; whole palette vertical placement, icon treatment and motion fidelity not closed by this row change. |
| B46 remaining EST reset | **PASS** | Pete created with00:15; title+EST cleared and title remained focused16/17; next Keepweekly created without EST19/21. DB confirms900 vsNULL, separate IDs. Prior PR357 repeat-entry acceptance retained. |
| B12 subtask repeated keyboard entry | **FAIL** | First valid child saved00:22:48Z;32-after UIA has no focused element, next guarded typing refused. Recovery explicitly refocused the real field;45/48/51/54 repeat same loss. Five actual children persisted, no data loss. Root path: pending disables focused input, refresh re-enables without restoring initiating focus. Fix must cover delayed commit, failure/draft, no focus stealing, stale refresh and disposal; no broad source redesign. |
| B60 4/5 circular progress | **OPEN full source parity** | Native60/129 has real4/5 ring and correct accessible counts. Direct SS-H12 shows ring/count/plus in one header; current duplicate summary/right-hand ring differs. This capture supports correct circular/count treatment, not full header parity. No false B60 closure. |
| B26 Notes | **OPEN residual scope** | Real edit/save27, lower-right Close28,125% reopen126 preserved content; no dirty/cancel/destructive matrix. Collapsed Addnotes label after cross-lane remount is potentially misleading despite persisted note; retain as observation, no data-loss claim. |
| B24/B40/B42 | **OPEN residual scope** | Actual colored anchored selector/keyboard named↔All, scheduledBacklog count and date/X exercised. Full recurrence/lanes/source/motion matrix not completed. |
| B23/Home/archive | **OPEN** | Three real previews101/106, Home menu103 and Restore107 captured. Source-wide preview/archival parity not accepted from appearance alone. |
| B53 | **OPEN** | HH:MM00:15 creation exercised; EST/Taken edit and Focus paths not exercised here. |

`41-subtasks-five.png` is an **invalid early attempt filename**: guarded text calls failed after focus loss, and legacy PowerShell sequence continued empty Enter actions. Read-only42 snapshot shows only1 child. Correct recovery43–54 creates the real five;55/60 are authoritative. Keep raw files unchanged. This is not five successful first-pass creates.

Before/after session TODO/HANDOFF/crosswalk were inspected; [session matrix](evidence/pr358-native-20261016/SESSION_EVIDENCE_MATRIX.json) retains all other open gates. No unrelated implementation or M10 counter advances. Approved SpectrumCore/imageupload/218icons unchanged.

## Evidence and continuation

[Complete evidence folder](evidence/pr358-native-20261016/README.md): all30 native PNGs, raw UIA/HWND/action records, chronological CSV, whole10-file Narro-M7-Logs across both processes, original-observation ZIP, original-video parts/playback, system/artifact facts, canonical comparisons and restored-profile proof. Private personal DB/backups and private protection ledger are intentionally excluded.

Next: correct confirmed B12 repeat-entry focus only on `fix/m5-subtask-create-focus`, executable real-Board regression before CI, guarded PR/main integration, then bounded exact-build native check of the affected keyboard path. Remaining M5 parity gates stay open; do not replay accepted PR357/358 slices without an invalidating change.
