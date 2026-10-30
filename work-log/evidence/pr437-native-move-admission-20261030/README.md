# Native Move admission and independent control — 2026-10-30

Exact PR437bd86a7ad / CI40976747495 / physical EXE SHA25612a03041403f9137dcfc73d6011e1abe87ababdfe77721066369f95788f03f44. Fresh profile-protected session, real Computer Use input, normal motion renderer media=false /DPR1.25 on actual LG. This adds admission evidence and does not repeat or invalidate prior J05 four-group PASS.

**Outcome:** native keyboard Move did not displace Narro; the identical40-arrow sequence displaced a blank classic Notepad by440px. This is a demonstrated target-specific outcome difference, **not a proven snapping bug or source root cause**. Native window styles/framework/DPI differ between target and control. No app source patch is justified solely by the control comparison. Desired differing-position transitions and pointer SNAP-01–08 remain NOT RUN here.

| Receipt | Actual evidence |
| --- | --- |
| `input-menu.json` | Narro HWND984168 native menu flags12, menuMode=true. |
| `input-after-move-click.json` | After clicking observed Move: flags2, GUI_INMOVESIZE=true, hwndMoveSize=984168. Cursor[-232,37], rect[-445,20,-20,895]. |
| `input-after-40-left.json` | Native loop still active, cursor[-672,37] moved440px; exact same HWND rect. |
| `input-final.json` | After Return: flags0, no move loop/capture, exact same rect. |
| `control-in-move.json` | Blank Notepad HWND2753994, native loop flags3, cursor[1136,350], rect[359,336,1913,1087]. |
| `control-after-40-left.json` | Loop active, cursor[696,350], rect[-81,336,1473,1087], actual dx=-440. |
| `control-final.json` | Return ended loop, new rect retained. Blank control closed without data entry. |

[Microsoft GUITHREADINFO reference](https://learn.microsoft.com/en-us/windows/win32/api/winuser/ns-winuser-guithreadinfo) defines GUI_INMOVESIZE0x2 and hwndMoveSize. Read-only Python probes query the exact returned HWND/thread/PID, no injected messages or OS input. `input-state.py.txt` and `input-control.py.txt` retain reproducible probes. No in-process WM_MOVING proposed-rectangle/subclass trace was acquired; the native GUI loop is not by itself proof of a particular message/RECT mutation or cause.

Four original paired segments, eight original MKVs: `MENU` (first key-based menu attempt), `MENU2` (direct Move click/short arrows), **`MENU3` (verified native loop/40 arrows/Return)**, **`CONTROL` (same40 arrows/Return in blank Notepad)**. UTC journal is `motion-actions.json`; exact starts/stops and video durations are retained. **MENU hit its90s safety cap; later MENU-labeled journal actions beyond that clip are not video evidence.** MENU3 and CONTROL supply the complete corroborating sequences and explicitly stopped. No analysis/source reading was used as acceptance footage. This is not a whole motion-parity analysis; authoritative measured geometry and GUI flags independently establish the admission outcome.

Both personal namespaces restored hash-identically before opening the blank control; original animation false restored (`original-profile-restoration-proof.json`, `animation-restore.json`). No Narro/recorder/Notepad remains after control completion. Personal backups, DBs and private ledger are not published. Original MKVs unchanged. No CI/source/config/test changes, merge, physical HDMI or milestone counter advance. A separate fresh child `cursor-commit-01` is prepared for one complementary native Move plus mouse-commit route; it must have its own protection ledger and its outcome is not included here.
