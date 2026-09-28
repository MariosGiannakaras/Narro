# M7 PR #191 physical retest — in progress, 2026-09-28

This log records the exact PR #191 candidates and their physical results. It does not claim M7 acceptance. Commit `788fb87072ca5673f99c1bac5fdb7ae28a661daf` passed compilation but failed the CI Clippy gate on a redundant cast; commit `12707c0bd5c28854e6017ef1d805e41c686e3f60` removed that cast without changing behavior.

## Exact build and environment

- Source head: `f1ef35aabc97aed9e8044130e442a85276c62536`.
- Windows CI run `36371772752`: PASS; runtime artifact id `10950125308`, digest `sha256:8e0d32e66bb0ca2ad31f6bfba40a51732580751e33a6090b1d4ace4ca3383a7c`.
- Downloaded `narro.exe` SHA-256: `F4903B335C05A71C27B7E5C9A4511A5E71F2A4D0DF397C9DB24251F7751C5CC9`.
- Windows 10 Pro 19045; primary 2560×1080 at 100%; secondary to the left. The user restored the secondary to its original 100% before the mixed-DPI retest. The paused session remained task `fas`, timer `07:40`, Time Taken `0:13:41`.
- The user clarified that Windows animations were **Off** during the completed recording, then set them **On**. The active On state was subsequently confirmed by `SPI_GETANIMATION=1` and `SPI_GETCLIENTAREAANIMATION=1`. The attempted On recording was interrupted before any UI cycle, so it is not evidence for On behavior.

| Gate | Result for this candidate | Evidence |
| --- | --- | --- |
| 7 — Panel/Timer and Expand/Collapse continuity | **FAIL** | One 28-second continuous 59 fps Off recording contains three verified Panel→Timer→Panel cycles and three verified Expand→Collapse cycles. Every requested state settled correctly in the same paused session, but collapse visibly exposed the old expanded white surface below the new compact Timer; expansion briefly exposed the enlarged surface before its controls were fully revealed. [Sanitized sequential frames](evidence/2026-09-28-m7-ci191-off-resize-tail.png), especially frames 1228→1235→1238→1242. Raw ignored video `artifacts/m7-ci191-runtime/gate7-off-continuous.mp4`, SHA-256 `BC154A66BBFACF8318DD7D4101B72886FD0419B6377FFCDB4B4ABBB95E9CBCD6`. On cycles were **NOT RUN** for this candidate after Computer Use was interrupted by Escape. The gate cannot pass. |
| 8 — transition-boundary shortcut stress | **NOT RUN on this candidate** | The M7 baseline PASS remains in the CI #624 log; this source change did not target the shortcut boundary. |
| 9 — Find Timer | **NOT RUN on this candidate** | The M7 baseline PASS remains in the CI #624 log; this source change did not target the Find pulse. |
| 10 — monitor topology recovery | **NOT RUN on this candidate** | The M7 baseline PASS remains in the CI #624 log; the later mixed-DPI retest will exercise placement again. |
| 11 — borderless fullscreen topmost | **NOT RUN on this candidate** | The M7 baseline PASS remains in the CI #624 log; the later corrected hold may warrant a targeted topmost smoke check. |
| 12 — secondary DPI/work-area | **NOT RUN** | The second monitor is back at 100%; the 100%→125% move and bottom-edge expansion are reserved for the next corrected exact build. |

## Diagnosis and next source correction

The native visual hold captured the old Timer, but subsequent `show`/`set_focus` could raise the WebView above the hold. During expand, the hold covered only the old compact rectangle, leaving the larger target rectangle exposed early; during collapse, the old expanded white rectangle remained visible below compact content. The `12707c0` candidate added a union-rectangle desktop hold for resize and raised the hold again after native reveal; its physical result follows.

## Second exact build: `12707c0`, animations On

- Windows CI run `36373768756`: PASS; runtime artifact id `10949818132`, digest `sha256:5d03ce449875167e9c559316df980c0ec9f64a1b74baf153985d376b0f3b2850`.
- Downloaded `narro.exe` SHA-256: `B48808150F6BC87BD026E0065B413BA470AF6390143B05957AD1B19AC9E706A3`.
- Physical 60 fps continuous recording: three verified Panel→Timer→Panel cycles and three verified Expand→Collapse cycles. The same paused `fas` session, `07:40`, and `0:13:41` survived. The transitions settled correctly, but during resize the old expanded white rectangle remained visible below compact content. Gate 7 remains **FAIL**. [Sanitized failure frame](evidence/2026-09-28-m7-ci191-r2-on-collapse-tail.png), SHA-256 `C783B5B22961A7A217EB6DEB1F3D048FB1A1CB6FC8E6950B866BA91156EE0EEE`; ignored raw video `artifacts/m7-ci191-r2-runtime/gate7-on-continuous-r2.mp4`, SHA-256 `C008152CFE2583EA3173B353C4504CF247889C95542FA7D8EA47FC045FE4BA16`.
- The 125% secondary-monitor retest and animations-Off retest were **NOT RUN** on this failing candidate.

The union rectangle preserved the old expanded white area during collapse. Commit `d505b934b41433996f54d6f5552352233e758cf2` instead matches the native hold to the target window bounds before revealing either Focus presentation or a resized Timer. It passed local formatting/diff checks and exact-head Windows CI run `36374929708` (Repository Preflight, visual fixtures, Tauri Release). Runtime artifact id `10950633261`, digest `sha256:5f0404c765bb8d8e32d7d96d668a499fcc403280fcf3652ee312c9efe52d013c`; extracted `narro.exe` SHA-256 `DC1FAA508918D54777FFC7A20A378FBA75EC4E9287ED3BB80E593B808F2E35F2`. Its animations-Off physical resize retest showed a full-white expanded Timer frame at 60 fps frames 570 and 677, so Gate 7 remains **FAIL**. The separate chronology and evidence hashes are in `2026-09-28-codex-m7-visual-continuity-history.md`. The newer `b23c8ab` passed CI run `36397349549` but is **physically NOT RUN**.

The original user profile remains backed up at ignored `artifacts/m7-ci624-runtime/profile-before.db` for restoration after M7 testing. The original secondary-monitor scale is now restored to 100%. No M8 work was started.
