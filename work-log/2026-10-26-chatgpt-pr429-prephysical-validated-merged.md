# 2026-10-26 — PR429 P09/P11 native input pre-physical harness validated and merged

**Owner:** ChatGPT source/pre-physical. **Bounded scope:** P09 Compact native HWND drag and P11 Ctrl+F / Ctrl+Alt+T *causal input instrumentation only*, preserving original observed physical outcomes as unremediated.

## Executed changes and proven validation

- Feature branch `fix/p09-p11-prephysical-input-probe-20261026`, [PR429](https://github.com/MariosGiannakaras/Narro/pull/429), exact validated PR-head `474de7e4b358cecd319649999d245c591c688f92`.
- Introduced `scripts/native-input-prephysical-probe.mjs` (read-only, temporary WebView2 DOM event observer; only identified chords and Compact Timer pointer hit attributes; bounded event queue; no input injection, task text or file replacement); added `test:input-delivery-probe` to existing mandatory frontend preflight in `package.json`; created `docs/P09_P11_NATIVE_INPUT_PREFLIGHT.md` for clean-focus/OS input/HWND/video correlation and independent invalid-case decisions. No application product behavior, CSS, focus choreography, native control, storage or user profile changed.
- Exact-head [Windows CI40345366911](https://github.com/MariosGiannakaras/Narro/actions/runs/40345366911): `validation-gate` **SUCCESS**, `fast-gate` **SUCCESS**, `windows-candidate` **SUCCESS**, total **3/3 PASS**. The fast-gate log explicitly executed `node scripts/native-input-prephysical-probe.mjs --self-test` successfully. Windows CI ran Rust/Clippy/test, performance, visual fixtures, Tauri release, packaged Focus and M7 physical-validation build. The full local checkout preflight and actual native probe were **NOT RUN** from the ChatGPT session.
- Guarded squash merge of PR429 with `expected_head_sha=474de7e4b358cecd319649999d245c591c688f92` succeeded: resulting-main source commit `ba832342e9e829e2fa0c15a17d3a32099ba7ef42`. Exact main blob SHA matches PR head on all three changed files: probe `681dfc9aad870ceb49bc30efd9e2734eae72185b`, package `12f202257209b94ccbdc3d1f25c1ca88cfa446d7`, procedure `321012dedfb1418408f0e673813934e3fac4b6e4`. The GitHub connector's commit-workflow-run lookup is PR-event-only: resulting-main **push CI is UNVERIFIED**, not asserted PASS. Source provenance equals exact validated source.

## Unchanged acceptance boundaries

- P11: Ctrl+F previously displayed native WebView2 Find instead of Narro palette; Ctrl+Alt+T did not visibly quick-create on previously sampled frames. Existing editor/modal-confounded attempts are invalid for asserting code regression. Native OS scan-code/key routing versus WebView2 interception versus DOM dispatch **UNPROVEN**. Source fix **NOT DONE**.
- P09: native Compact HWND did not move across original attempts. Direct hit-test marker, true held mouse, native move-loop and HWND position proof **NOT YET CAPTURED**. Source fix **NOT DONE**.
- P03 independent Done scroll requirement/video **OPEN**, not a proved Narro bug.
- Existing A/PR389 and B/PR419 accepted functional **8/8+8/8** remain PASS; their independent strict compositor ownership evidence **OPEN**. Never rerun those accepted functional cases to solve P09/P11.
- Three **HUMAN PHYSICAL NOT RUN**: P18 tray Quit, P19 genuine HDMI cable unplug/replug, P20 held mouse+Escape. No surrogate test or CI can mark these PASS.
- M1–M4 mandatory formally accepted (4/10); M5–M9 OPEN, M10 gated, optional M11/M12 inactive. Personal Narro AppData, physical Windows hardware and approved Spectrum picker/upload/218 icons untouched.

## One next executable action

On an available actual isolated Windows host, use the merged `docs/P09_P11_NATIVE_INPUT_PREFLIGHT.md` to collect **clean focused P11 scan-code/WebView2 accelerator/DOM capture first** with original video and HWND evidence. Then capture **P09 actual held-pointer/DOM hit/OS move-loop/HWND displacement**. Fix only the owner conclusively identified by those receipts in a narrow regression-tested source PR, run exact-head CI, and preserve all separately scoped original evidence. A physical operator is not connected in this ChatGPT session; **fresh P09/P11 Windows delivery proof NOT RUN**.
