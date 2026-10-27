# Supplemental pointer acquisition — 2026-10-24, frozen

User requested a short independent attempt at drag/reorder and tray access. Capture only; no Narro code/config/test changes, new CI or source audit. **21/24 full acquisition journeys, 3 partial remains unchanged**, because B3 still lacks Escape while the pointer is held, A13 lacks proven Timer movement and recorded tray Quit, A14 lacks DPI/dual-display subcases. Subcase acquisition advanced substantially; this is not an acceptance verdict.

**Two original MKVs**, UTC/UIA action journal, read-only HWND/bounds/DPI probes, metadata with decoded-frame counts, whole Narro-M7-Logs and raw-byte archives. Exact old verified executable `cdaf85b3c20028a78d17f75f5700e652e7147f7e`, EXE SHA256 `2c8b091f6bea079196f7b068c303749417bd80a3529230fb8c6ed0f93d386765`. This does not validate corrected PR420/main or PR389/419. Existing completed review of prior 13+8 originals is preserved, not repeated. These two originals need only their own source-owner review.

## Actual new input and observed outcome

| Subcase | Acquisition observation | Location |
|---|---|---|
| True pointer reorder | Drag from A card edge `(252,375)` to `(252,620)` changed order A/B to B/A. No keyboard reorder substituted. | first clip 06:57:21.205Z; repeated in second clip 06:58:29.531Z (~24.896s after START receipt) |
| True pointer cross-lane | A moved This Week to Backlog, then Backlog to This Week; lane counts changed accordingly. | second clip 06:58:20.817Z (~16.182s) and 06:58:34.932Z (~30.297s) |
| Drop outside lanes | A dragged toward heading `(1100,130)`; post-drop state remained in This Week. | second clip 06:58:45.304Z (~40.669s) |
| Escape during held drag | NOT RUN. Supported native API exposes a complete drag, not separate down/hold/up or an Escape modifier during drag. The outside-lane drop above is a different subcase and does not close this requirement. | no substitute PASS |
| Compact Timer movement | Native drag requested 120px left at lower background, 65px down at left edge, 120px left at top padding. All four before/after read-only HWND receipts remained `[2220,0,2560,700]`, 96dpi, topmost true. No successful >=64px movement proved. Whether app/target region/native drag-loop/input mechanism caused this remains unresolved. | second clip 06:59:19.371Z (~74.736s), 06:59:35.349Z (~90.714s), 07:00:02.768Z (~118.133s); native-window-probes.jsonl |
| Tray Quit | NOT RUN. list_windows/list_apps exposed only Narro Focus and Codex as running targets, no taskbar/tray target. No fabricated tray HWND, out-of-target click or runtime guard bypass used. | final availability receipt in native-actions.jsonl |

## Capture and input-method caveats

Initial maximize left the local convenience helper with a stale screenshot binding. A drag was rejected at 06:56:50.492Z with `point (252, 375) is outside window bounds { originX: 0, originY: 0, width: 16, height: 16 }`. A direct fresh `get_window_state` showed two 16x16 icon captures plus actual `screenshot-2` at 2560x1080. Selecting that returned whole-window screenshot and storing refreshed state explicitly on globalThis made the Board pointer drag work. This is a corrected operator-helper binding for this attempt, **not** a patched shared runtime or proof of the cause of all earlier failures. Exact early helper UIA results may be stale; actual continuous footage and later direct snapshots take precedence.

First clip ran 06:54:55.719025Z–06:57:42.323102Z, including setup/tool recovery. First cross-lane attempt dropped outside the target card and did not move A. The successful cross-lane input at 06:57:50.372Z occurred in a recording gap; it is not claimed as captured. The second clip 06:58:04.635421Z–07:00:30.567007Z deliberately records successful cross-lane movement in both directions and another reorder, followed by Timer attempts. Use `chronological-manifest.json` and media PTS, not an assumption that all journal actions were on video. No substantive frame-by-frame motion analysis was performed.

Windows Graphics Capture of clipped Focus may contain underlying/stale Codex pixels. The independent Desktop Duplication video is primary; no Codex UI was automated. Input was exclusively supported native Computer Use. No keyboard-Escape timing race or unsupported parallel pointer/key injection was used.

## Recovery and handoff

Personal Roaming/Local protected before launch; SQLite online backup/quick_check made, previous synthetic fixture copied. Owned app PID/path verified and stopped programmatically only for cleanup, **not** presented as tray Quit. Original personal profiles restored and DB hash-identical; proof included. Both owned recorder clips closed exit0, frame counts decoded. No owned process/recording intentionally left running. Private DB/cache/backups/ledger and binaries excluded from publication.

Next source-owner action: review only these two new original videos for N09 pointer reorder and N10 cross-lane/drop semantics, keeping held-Escape distinct. Then continue the already recorded source-owner plan; no new app bug is asserted from operator acquisition alone. For actual remaining native subcases, retain manual/appropriate-tool continuation for held-Escape and tray, and investigate Timer drag causally on a verified candidate. Do not replay the consumed profile-protection ledger. No milestone acceptance counters advance and no optional M11/M12 is activated.
