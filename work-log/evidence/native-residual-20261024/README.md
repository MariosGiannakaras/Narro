# Residual Windows capture freeze — 2026-10-24

**21/24 acquisition journeys complete, 3 partial; no new acceptance PASS.** Capture-only scope: no Narro source/config/tests/CI/PR/merge changes. Eight original continuous desktop clips are frozen here, with full UTC/UIA chronology, read-only HWND/DPI/topmost probes, decoded-frame metadata, and the whole Narro-M7-Logs folder plus original-byte ZIP. New footage requires source-owner analysis. The prior 13-video analysis remains completed historical work; do not repeat it by default.

Exact recorded EXE source **cdaf85b3**, SHA256 `2c8b091f6bea079196f7b068c303749417bd80a3529230fb8c6ed0f93d386765`, as independently rechecked before same-EXE relaunch. This does **not** validate corrected PR420/resulting-main, PR389 or PR419. Source-owner Step2 completion and user-reserved Step3 remain unchanged.

## Newly completed acquisition

- **B4 actual live Skip / switch:** `B4B5-skip-switch-expiry` records actual live Skip and Make Live, unlike the earlier incomplete path. Acquisition complete; source-owner review still required.
- **B5 autonomous boundaries / controls:** `B5-real-boundaries` records real Pomodoro Break expiry to Paused and a resumed full Work interval to Break. `B5-plain-est-boundary-final` records fresh ordinary EST 00:01, real countdown/Time's Up, Extend into Overtime, Pause, Resume, Complete and All Clear. New B5 acquisition complete without database/time manipulation. `B5-plain-est-expiry` is the preceding setup/All Clear clip, not the final expiry itself.

## Remaining partial acquisition / exact continuation

| Journey | Actual acquired evidence | Missing / blocker |
|---|---|---|
| A13 lifecycle/drag/tray/relaunch | User-reported prior tray Quit; process absent on resume; same-byte EXE relaunch, recovered compact Timer and Resume in `A13-same-exe-relaunch`; real native drag attempts and geometry receipts | Prior Quit was outside video. `A13-assisted-drag-tray` bounded recording ended without confirmed manual action; app remained running afterward. Requested >=64px drag did not move read-only bounds; one endpoint outside native visible region was tool-rejected. Need actual successful physical drag + tray-menu Quit in a coordinated new clip. Do not classify input-tool failure as proven app defect. |
| A14 topmost/DPI/topology | Timer over maximized Notepad, read-only topmost/bounds/DPI receipts, Left/Right preference interactions | 125% DPI NOT RUN: Windows display-control launch attempts produced association error/no usable window; no scaling hack performed. Second monitor disconnected; HDMI physical action deferred by user. Normal 96dpi observation does not substitute for 125%/dual display. |
| B3 Board reorder/cancel | Native keyboard Alt+Down actually changed A/B order; reverse attempt, prior pointer drag attempts and cross-lane controls preserved in journal/video | True pointer reorder/drop and Escape while pointer remains held not adequately acquired. Current Computer Use drag API does not expose an interruptible held-drag sequence. Needs real manual or suitable native input capture. Keyboard reorder alone is insufficient. |

No unrelated physical implementation audit or new source phase was started. If continuing new-build acceptance, independently verify the latest candidate bytes first; preserve this old-source history.

## Quit coverage and capture gaps

The user reported Quit after the interrupted turn. Original `B5-real-boundaries` ends 2026-10-23T19:21:52.573406Z. Extracted original-derived tail frames at 680s/701s show Narro still present, so the prior tray action is **USER-REPORTED / NOT CAPTURED**. Same-EXE relaunch at 2026-10-24T00:57:05.101329Z is captured. The assisted follow-up clip ended 01:03:35.951252Z without a confirmed user response; no successful assisted drag/tray claim.

Some journal observations fall outside video windows, including the first work boundary before `B5-real-boundaries` and later A14 diagnostics. `chronological-manifest.json` explicitly tags capture coverage; do not silently attribute gap actions to a clip. Two clips briefly overlap during recorder handoff. Receipt-relative offsets are approximate navigation aids; original frame PTS is authoritative.

## B5 final clip bookmarks

`B5-plain-est-boundary-final/native-original.mkv` starts at receipt 2026-10-24T01:12:47.929150Z (133.067s, 7,582 decoded frames).

| UTC observation/action | Approx seconds after START receipt | Recorded state/action |
|---|---:|---|
| 01:13:15.053Z | 27.124 | Blitz now click; main HWND disappeared, fresh returned Focus selected |
| 01:13:26.172Z | 38.243 | Ordinary EST countdown 00:50, Running |
| 01:14:02.313Z | 74.384 | Countdown 00:14 |
| 01:14:28.491Z | 100.562 | 00:00, Time's Up, Time Taken 0:01:00 |
| 01:14:33.201Z | 105.272 | Extend action; Overtime feedback observed |
| 01:14:40.674Z | 112.745 | Pause; Overtime Paused observed |
| 01:14:44.341Z | 116.412 | Resume; Overtime observed |
| 01:14:48.072Z | 120.143 | Complete; All Clear observed |

These are operator navigation bookmarks, not an exhaustive visual/motion analysis or acceptance verdict.

## Safe freeze / restoration

All owned recorders ended exit0; each original was ffprobe frame-count decoded. At final cleanup the owned Narro PID/path was verified and stopped programmatically **for profile restoration only**, not represented as a tray-Quit test. Original personal Roaming/Local profiles restored; original DB SHA256 `13185e54bc0ea08f3b368ccc48a8ede429683e1d58a60b15b8f7491a06d2224d` remains identical; see `original-profile-restoration-proof.json`. No app/recorder intentionally left running. Synthetic retained profile and private recovery ledger remain central on disk; never replay its consumed isolation/restore scripts.

Originals remain under `E:/SystemFiles/Desktop/Narro-Workspace/Narro-Residual-20261023-185825`. Recorder Desktop Duplication, 2560x1080 nominal60fps, mouse visible, no audio. MKVs are original bytes; text may be Git-normalized, so raw-byte ZIPs are included. Private DB/cache/backups, app binaries and private protection ledger are excluded. Recorder helper source is archived as evidence method only, not executable repository tooling; unused legacy helper functions were not used for input.
