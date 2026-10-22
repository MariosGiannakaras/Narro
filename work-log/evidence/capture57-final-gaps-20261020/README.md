# Final targeted gap acquisition — frozen, not acceptance

Four unchanged original MKVs (39,433,238bytes), six screenshots, 61 JSON observations, four actual Narro-generated PDFs and original loopback audio with per-block timestamps. Supplements [first packet](../capture57-20261020/README.md) and [Reports/motion packet](../capture57-resume-20261020/README.md). No substantive film/source analysis or Narro source/config/test changes, builds or CI.

Exact executable SHA256 `bced8a9f533fedb726bedc7fa2d90eec98324b2f9b15db77b8f1ad1c79b5f909`, source `9e631952158c5c6b9763e0e0d79e33b79e8c7ca3`, main CI39389033088/artifact12249543153. See [identity](session-meta.json), [actions](ACTION_MANIFEST.md), [clip anchors](clips.jsonl), [media hashes/metadata](media-index.json), [native/owned DB facts](observations), [screenshots](screenshots) and [exports](exports). Original small files are directly downloadable; verify SHA256 without transcoding. Canonical Git-byte integrity manifest covers the packet.

## Newly acquired paths

- C48: actual Overview Oct13–20 custom8-day range, plus30/60/90-day presets, and all four PDF exports. PDF files copied unchanged from the paths reported by the app; no PDF-content/layout analysis performed.
- C47/C52: Sessions two-list selection and previous/next year/month controls, followed by Cancel. Earlier single-list/custom-range evidence is reused.
- C45: real new count-up task `Timed alert capture — uninterrupted work`, POMO disabled, supported300s timed alert and animated flash enabled. Actual alert effect decided/claimed **2026-10-20T17:59:13.206Z**, boundary300s, in `observations/timed-alert-after-boundary-db.json`. The boundary is inside bounded segment003, approximately90s after its process-start UTC; use original PTS and recorded imagery to locate the exact frame. Compact-mode input occurred around the same boundary; Panel and compact behavior are not assumed interchangeable. Event delivery is recorded, **visual flash PASS remains unreviewed**.
- C46: actual completion/Success during a bounded WASAPI loopback capture; original PCM/WAV and block receipt/PortAudio timestamps retained. This does not establish sound identity/parity or correct continuous audio.
- C31 partial: same-profile/executable process termination and relaunch captured (`restart.json`). Before restart Focus HWND bounds were `[2220,0,2560,700]`. Main returned; CtrlShiftT did **not** expose a new targetable Focus window in the acquired empty-queue state. No moved-position/topology/tray-Quit/Timer-reappearance PASS follows.

## Important acquisition limits

1. **Audio-clock discrepancy:** callback capture wall time30.125s, reported1,442,816 frames; WAV declares89.748s. Preserve the original WAV and `audio-blocks.json`; do not assume its sample duration aligns directly with video. Loopback device reports stereo48kHz. This is a capture-tool/format uncertainty, not an observed Narro audio failure. Earlier claim of30s refers to wall capture time. No audio acceptance PASS.
2. Video is actual DXGI frames with60fps ceiling and no duplicated idle frames; advertised stream frame rate is not proof of60 distinct frames per second. Clips are bounded180s with gaps; UTC starts are approximate. Metadata health is not a complete frame/decode/acceptance review.
3. First fresh fixture attempt removed the interrupted synthetic checkpoint and launch yielded no targetable window. Retrying with the exact retained owned DB restored normal launch. First attempt/provenance and recovery note retained; no startup product FAIL asserted from manipulated fixture. The acquired new task was created and made live through the UI after closing the recovered POMO cycle; it used actual count-up runtime, not an injected shortened timer.
4. No actual moved/bottom-edge placement or second-display test, no borderless browser action, no new destructive recurring-rule removal. Existing accepted evidence may be reused only after claim-level reconciliation. C33 remains NOT EXERCISED; C37 is an analysis/reconciliation wrapper. Partial requirements remain partial until review.
5. All data exercised was synthetic and isolated. Personal backups/private ledgers/helper dependencies/raw setup database excluded. Original profiles restored and original DB hash identical; original OS motion0/false restored. No owned Narro/ffmpeg/audio helper remains. OBS was not controlled or stopped.

## Next boundary

Current acquisition material55/57 lines includes partial/attempt-only C31, not55 completed gates. Freeze/publication is complete. Preserve missing native states as OPEN. Before any additional physical work solve the actual movement/bottom-placement or audio capture capability narrowly, or hand those specific actions to the user; do not repeat the whole campaign. Substantive consolidated analysis is the next separate phase and must be announced before it begins, per the user's requested effort change. No analysis/fixes were started here.
