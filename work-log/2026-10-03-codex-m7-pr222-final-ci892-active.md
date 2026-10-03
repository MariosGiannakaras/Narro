# M7 batched correction — final source in CI #892

The CI #884 physical batch confirmed six compatible defects: native frame insets, inline Notes horizontal overflow, clipped large Notes/Save, Greek-layout shortcuts, loading-modal focus loss and outgoing/incoming coexistence. [Full physical evidence](2026-10-03-codex-m7-ci884-physical-batch-evidence.md) is already published, including whole logger snapshot/ZIP, continuous video, video-derived PNGs and 360 reviewed consecutive frames.

PR [#222](https://github.com/MariosGiannakaras/Narro/pull/222) final head `ea4dc75ad9925606cc2e5267300296d12c654d9c` batches the corrections with tests. Diff against integrated application base `f1cca810ea7d7fe6130d43ae0f6bfe649a7154af`: **16 source/config/test files, +388/-11**. This is a corrective-slice count, not a completed-milestone total. Concurrent M9 API PR #205 is preserved in the base; current-main documentation/source-analysis updates are preserved.

The native host is fixed, shadowless and nonmaximizable in all applicable configurations. Notes uses visible-region bounds and constrained grid sizing while preserving draft/editor identity and intentional vertical scrolling. Shortcuts follow physical letter codes across layouts with semantic fallback. Quick-create owns focus during loading and after the ready field mounts. Ready target paint ownership removes the old taller hierarchy, with immediate outgoing visibility on rollback.

The closed-tooltip overflow correction initially removed its normal opening transition. A real renderer keyboard-open/`CSSTransition` assertion reproduced that failure. The final source collapses closed tooltip geometry while retaining opacity/transform state; keyboard open/Escape and actual reduced-motion behavior are covered.

Local validation:

- Full final `npm run preflight:frontend`: **PASS**. A preceding attempt failed only during generated-icon writes with Windows mapped-file error 1224; after restoring generated icons, the complete retry PASSed.
- Rustfmt: **PASS**. Local Rust compile/Clippy/tests: **NOT RUN**, missing MSVC `link.exe`.
- **30 rendered cases PASS**: 18 light/dark editor/modal/transition cases plus 12 affected reduced-motion cases. The actual renderer media preference is verified rather than assumed.
- All 16 Notes endpoint images were visually inspected. Large-editor/Save bounds and long-word wrapping are correct in these fixtures. Headless scrollbar chrome is hidden; physical scrollbars and native geometry are not certified by this check.
- Performance harness self-tests previously PASSed; this is not a real idle CPU/RAM measurement.

Final [Windows CI #892 / run 37133373949](https://github.com/MariosGiannakaras/Narro/actions/runs/37133373949) is **ACTIVE** on that exact head. CI #887 was cancelled for the dense-video correction, #890 for current-main integration, and #891 after the reproduced tooltip regression. None constitutes a physically tested corrected build; no final physical candidate acceptance is claimed here.

Next: green exact-head CI, guarded merge/tree proof, pin downloaded final EXE/artifact hashes, then one affected physical batch with both screens captured at native dimensions. Cover normal/reduced transitions, 100%/125% frame/bounds/crossing, Greek/English keyboard/modal/tooltip behavior, Notes Save/resize, drag/tray Quit/same-EXE restart and host-sensitive idle measurements. Keep M1 Candidate B's separate topology/performance gates explicit.

Computer Use still reported the physical Escape stop after the user's explicit resumption and JS reset. App input was stopped for that turn; source, headless regression and publication work continued. This is an input-session stop, not a failed Narro criterion. Re-observe app/recorder/topology in a fresh control turn. Last observed CI #884 Narro was paused; OBS stopped normally; OS animations restored On and focused WebView layout Greek.

Current progress: **5/10M || 2/5 | 14/19**. M7 physical acceptance and Blitzit parity remain OPEN; historical exact CI #873 C5 PASS remains valid for its tested build.
