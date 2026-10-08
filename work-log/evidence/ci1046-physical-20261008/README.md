# CI1046 real Windows physical checkpoint — 2026-10-08

Current bounded acceptance, not whole-milestone/source-parity completion. No Narro source/runtime/test/build changes were made during acquisition. [Gate matrix](gate-matrix.json) and [chronological actions](chronological-actions.json) are the continuation authority for this packet. All operator/capture/domain logs, full recordings, extracted screenshots and PDFs are in [Narro-M7-Logs](Narro-M7-Logs/). Operator helpers are frozen as `.py.txt` evidence, not repository scripts.

## Candidate and environment

CI1046/run [37677630228](https://github.com/MariosGiannakaras/Narro/actions/runs/37677630228), artifact `narro-m7-physical-windows-x64` id `11508639865`, exact head `515b0f9a9df5cdf1a67e2b879047ee6551ae6dec`, merged runtime `c389148b9edc56dd616e6c95a32b31d52cf79639`. ZIP SHA256 `57f19035ee842e3479bde946a4a82348b1dfc9ea3045d600f18707c4d38b0411`; EXE SHA256 `59beeb8271d08fd60adab4d41840bb65ed956d753410d8f2985daf4efe6a9275`. Exact hash independently verified before launch. PR248 merged runtime/test blobs 18/18 identical to green head; no new build was required.

Windows real dual desktop: primary UltraGear DISPLAY1 2560x1080 at 100%; nonprimary LG DISPLAY2 1920x1080 at 125%, x=-1920. The prelaunch System.Windows.Forms report uses DPI-virtualized secondary dimensions 1536x864; this is not a resolution change. Normal Windows minimize/client-area animations temporarily enabled; original values are 0/false in `motion-original.json`. Light theme. Focus HWND199210 persisted across the clean continuity sequence; main HWND526972 restored to its original 1016x739 outer rectangle.

## Dispositions

Physical-only bounded results: **M5 6/6 PASS; M6 5/6 PASS, A OPEN; M7 1/3 exercised with C4 FAIL, 07/35 OPEN; M9 2/3 PASS with Finding29 PARTIAL/OPEN; conditional M1 and M8 OPEN.** Counts describe this residual session matrix, not milestone completion. M9 Overview PDF closes its 12th top-level item: 12/12 implementation/physical items, while whole Reports source parity remains OPEN. Roadmap remains 3/10 (M2-M4); M10 blocked, M11 dormant.

- M5: narrow readable/editable title, reserved row rail, Today progress, cross-lane drag feedback/reflow/placeholder/finite settle, retained destructive menu cancel and owned duplicate deletion, and real post-drag Tab/Shift+Tab rail all PASS. Nonempty positional drag was not exercised; no broader claim. No direct canonical pixel comparison added.
- M6 B/C: Quick Preferences composition and reversible Hide times persistence, plus ordinary queue action/overflow/keyboard order PASS. Finding33 real Escape from Focus large Notes contenteditable closes to compact with restored focus PASS; Main not separately exercised. Finding36 explicit Next Task chose the current selected list's queue companion instead of an older outside task; list scope survives Home/re-entry PASS.
- M6 D: reviewed every captured frame around Home and ordinary re-entry. PAUSED appears before exit; initial presented Panel is PAUSED then same Home-origin task resumes. Separately intentional Pause survives Home and re-entry PASS. Native Board-to-Focus morph is captured but its timing/source reconciliation remains OPEN: see `m6-a-initial-morph-frames.png` (focus-05 10.25 s onward, 35 consecutive 20fps frames).
- M7 C4 FAIL: clean Timer->Panel at 09:47:28.644 UTC, recovery-06 offset ~133.06 s, presents Panel header/live-title clipped inside the old compact region before full Panel. Repeated in the next settled cycle. All 9 captured domain tables are byte-equivalent before/after the clean 3 Panel/Timer + 3 expansion/collapse cycles. Same HWND, paused task, elapsed35s and taken95s. This is a visible presentation failure, not state loss. `continuous-review-index.json` documents every 20fps frame atlas. First two Panel/Timer and Timer/Panel sheets reviewed; the other sheets are acquired and available for further review. Do not mistake the background Nitro PDF grey/white surface for blank Narro pixels.
- M7 expanded Notes: unsaved unbroken token wraps, controls reachable, no visible horizontal scrollbar at125% normal motion. Token cleared without saving; Notes table unchanged. Scope does not certify all DPI/reduced-motion states.
- M9 PDF: nonempty Overview exported, opened by Windows default Nitro PDF handler and visibly rendered with range/report identity/summary/chart. Second export uses a distinct path, first file not overwritten. Copies retained. Finding30 long Recent Tasks picker remains bounded, one-line truncated labels and visible right-side list identity, working vertical scroll/no horizontal scrollbar PASS.
- Finding29: initial modal search focus, 40 Tab/40 Shift+Tab containment, Escape dismissal and opener restoration PASS. First pending trial is INCONCLUSIVE: helper AttachThreadInput activation blocked, so Escape actually dispatched only after lock release. `f29-lock-events.json` proves the timing. Do not turn this into a product PASS or FAIL; retry with foreground already verified and nonblocking dispatch.

## Recordings and chronology

All videos use the full 4480x1080 virtual desktop, CPU libx264 CRF18 at20fps, no audio. Start timestamps precede ffmpeg startup slightly; action-to-video offsets are approximate (~0.2s uncertainty). Contact sheets use consecutive frames left-to-right, then top-to-bottom. Both displays are preserved in the original video.

| Recording | UTC interval | Scope |
|---|---|---|
| native-acceptance-04.mkv | 09:22:10.191–09:36:30.283 | M5, Reports/PDF/picker/modal; drag at~117.7s, retained delete~246s, PDF~334s onward, picker~479s onward |
| focus-05.mkv | 09:36:31.217–09:42:26.195 | M6 entry/QuickPrefs/queue/Notes; later invalid fast continuity attempt |
| focus-recovery-06.mkv | 09:45:15.585–09:49:45.130 | Success NextTask~10.5s, Home~25.27s, reentry~38.25s, intentional pause/reentry, clean C4~129–199s, Notes~209s onward |
| board-focus-01/02 and acceptance-03 | setup/diagnostic only | WGC/sky/input/capture recovery; not acceptance |

## Exclusions and recovery

Computer Use `@oai/sky` WGC capture repeatedly timed out (FrameArrived/window capture timeout); UIA labels could be read but coordinate geometry/cache errors prevented reliable input. Native Python Win32 real input plus full-desktop gdigrab recovered actual interaction/capture. GDI `title=Narro` snapshots were stale/frozen; **exclude** `window-home.png`, `window-after-click.png`, `board-title-edit.png` from visual claims. Elevated Performance Options rejected input; those attempts are environment diagnostics only. `m9-pdf-export-two.png` was occluded by Nitro; the later foreground-verified `m9-export-two-real/result` is the valid second export. Early f28 coordinates are superseded by `f28-real-*`. Initial drag attempt did not start a drag; valid trial is `m5-padding-drag`. `board-focus-01` was not gracefully finalized and is diagnostic only.

The initial overly fast continuity action batch accidentally completed the old owned validation task. This is an **operator error**, not C4 product evidence; exclude that batch from continuity acceptance. Taken846s was preserved. The resulting Success surface was then legitimately exercised for Finding36. A fresh owned queue companion was intentionally paused before the clean C4 repeat; its complete before/after domain arrays match. A 1min manual session was added on that owned companion during the pending trial. Production DB was backed up before launch (`prelaunch/production-appdata-backup/narro.db`, original SHA256 `3b98e19d94ebcc75bd5d10f8fda0d17038a2aac6086782b44d76509f0e0636c4`). Preserve final test-state snapshot before restoring the original DB, only after Narro is fully stopped.

## Checkpoint continuation state

At this checkpoint Narro PID26388 is running compact Timer on LG, owned queue companion intentionally paused, elapsed35s/taken95s, 31 tasks/63 sessions. Show Success temporarily ON (original false), Hide times restored false; Windows animations temporarily ON (original0/false). CtrlShiftT is disabled in the current persisted baseline; its no-op is expected and does not reopen the user's earlier accepted shortcut tests. Pending work: Finding29 valid pending-guard retry, Finding07 controlled EXCLUSIVE-lock keyboard, Finding35 real Time's Up, conditional Finding27 DPI/stale selection and M8 notification/sound if OS permits, plus M6 A frame/timing reconciliation. Restore reversible settings and test data after final evidence snapshot. No Narro code correction attempted here.

Every file is hashed in `file-manifest.json`; full media/logs are retained, not just sampled screenshots. Historical prep checklist is C5-only and superseded by the current consolidated residual matrix; C5 was not replayed.
