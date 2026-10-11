# 2026-10-11 — User-directed preventive review of remaining real Windows physical gates

## Scope and identity

User requested the deepest responsible code-level analysis before unpausing Codex, without pretending browser/CI equals physical Windows. Review frozen on exact integrated executable `c6a39d2320ee291e9e3ff00fd792290360a8fc37`, source campaign **11/11** and Q12 [main Windows CI 38159460399](https://github.com/MariosGiannakaras/Narro/actions/runs/38159460399) **3/3 SUCCESS**. Production artifact 11710082342 fully downloaded and independently SHA256 verified for ZIP, `narro.exe`, NSIS, MSI (see companion immutable `work-log/2026-10-11-chatgpt-q12-full-integrated-main-final-windows-artifacts.md`). Subsequent main commit diff checked to be **Markdown-only**; executable identity still stable.

## What was analyzed

Read authoritative bootstrap, evidence routing, deep-analysis workflow, consolidated physical session and M1/M6/M7 residual instructions. Inspected actual native and renderer source/event call chains for the six physical families, not solely CI test names: `src/FocusSurfaceCoordinator.tsx` + `focusPresentationTransition.ts` + native `lib.rs` / `focus_frame_hold.rs` / `timer_region.rs` / `focus_webview.rs`; `main_focus_morph.rs`; `FloatingTimerFoundation.tsx` and visual fixtures; `ReportsSessions.tsx` + `ReportsSessionsView.tsx` task picker/add modal lock; `windows/topology.rs` / `floating_placement.rs` / monitor identity tests; `notifications/mod.rs` / `reminder_service.rs` / `localSoundCatalog.ts` / `TimedAlertSoundRuntime.tsx` / `TimedAlertFlashRuntime.tsx` and their explicit preflight tests. Reviewed source-backed storage/restarter identity and exact production archive/installer boundary.

The permanent, reviewable **nine-row physical risk/disposition matrix**, with implementation→regression→remaining native test breakdown, is in `docs/PRE_CODEX_RISK_AUDIT_2026-10-11.md`.

## Findings and explicit nonclaims

- **One demonstrable source robustness deficiency**: `TimedAlertSoundRuntime.tsx` and `TimedAlertFlashRuntime.tsx` chain `.then(unlisten)` on promised Tauri `listen` from `timedAlertApi.ts` without rejection handlers. This leaves an **unhandled Promise rejection** and no registered event consumer if the native event subscription fails. Existing `scripts/test-timed-alert-sound-runtime.mjs` / `test-timed-alert-flash-runtime.mjs` test static wiring but do not inject a rejected listener. **NEEDS_REGRESSION_FIRST**; no failed native subscription is evidenced on accepted Windows CI or physical build. Do not add ad-hoc unbounded retries, alter event emission/persistence or expose invented UI without deterministic design/regression.
- **Native diagnostic limitation, not proven defect**: `focus_webview.rs` logs a WebView2 `NotifyParentWindowPositionChanged` inner COM failure within the closure but returns external scheduling success. Correlate actual native logs and continuous frame evidence before altering a validated native rendering pipeline.
- C4, Board→Focus morph, F35 live Time's Up, F29 pending keyboard owner, F27 physical same-screen DPI identity, and M8 real Windows toast/audio remain **PHYSICAL_ONLY**. Existing CI/browser tests and historical physical passes narrow but do not close those exact-build gates.
- One historical Reports Add Session physical focus test only lacked verified *during-pending* key dispatch; ordinary tab/escape and opener return were recorded PASS. Do not reimplement a currently working modal on speculation.
- Rust remnant notification acknowledgments/retries, authoritative timer and storage tests were inspected; no separate proven domain/source corruption defect discovered from this bounded review.
- No Narro source/config/test files changed as part of the user-requested preventive audit. Approved user-owned List Editor Spectrum Core color/image/218-icons explicitly untouched. No manual or source parity PASS fabricated.

## Next action

If user opts to keep coding before Codex, the one bounded code-quality candidate is to add a deterministic rejected-`listen` runtime regression and then a narrow error-handling improvement in both timed-alert consumers, **requiring a new feature PR/Windows 3/3 and a new current exact production artifact identity**; DO NOT use Q12 hashes for replacement source. If no further source request, the current automated-green production candidate is ready for a **user-approved Codex physical acceptance session** using current SHA hashes and consolidated matrix. Codex remains USER-PAUSED. M10 blocked, M11 dormant. Current main tracking `HANDOFF.md`/`TODO.md`/`STATUS.md` reconciled accordingly.
