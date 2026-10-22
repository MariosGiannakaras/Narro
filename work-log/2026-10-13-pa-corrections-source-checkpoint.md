# PA corrections source checkpoint — 2026-10-13

Capture8/8; aggregate triage8/8; exact ec7673c physical acceptance1/8 PASS,3/8 FAIL,4/8 UNCERTAIN. Completed corrected acceptance0/3.

Source work is now active in `E:\SystemFiles\Desktop\Narro-PA-20261013`, branch `fix/pa01-04-07-native-acceptance`, based on main c3e4a1ca. Preserve the old dirty NarroUpload checkout and concurrent source-owner PRs. No source commit/PR/CI or replacement-binary native PASS yet.

PA07 candidate: normal tray Quit advances automatic boundaries and forces the authoritative durable checkpoint immediately before exit, off the GUI thread. A failed checkpoint cancels Quit and remains retryable. Three controlled-time Rust regressions cover final interval/identity/paused recovery/excluded downtime, expiry boundary, and failed SQLite write with safe retry. They are NOT RUN locally: MSVC link.exe is absent. Existing architecture/logging guards and cargo fmt pass.

PA04 actual DOM red→green: the keyboard fixture deliberately leaves Back focused when the Add opener is activated, reproducing the wrong passive-effect focus snapshot. Explicit opener identity fixes dismissal and successful submission; delayed-pending Escape/Tab/Shift+Tab remains contained. Actual headless Edge red failed “Add Session dismissal did not restore opener focus”; green and extended submit regression pass. Native Windows acceptance stays open.

The frozen physical provider gap4.2s now correlates with the synchronous `create_manual_report_session` Tauri command opening/writing SQLite directly. The scoped candidate makes ONLY this Add command async and awaits a blocking worker's durable typed result. A real exclusive-lock Rust regression proves pending caller yield, worker thread separation, exactly one committed row and preserved error semantics; native physical responsiveness and Rust execution still require CI/new executable. This extends the existing NER-007 family to a write; it is not an unrelated CRUD rewrite.

C4 raster alternative B remains next, per the pre-code correction plan. Existing WebView2 CapturePreview and finite GDI child are available; protect outgoing pixels before DOM promotion and own raster geometry/content on one native timeline. Do not treat CSS clipping as fixed or count source-only work as a correction.

TypeScript and Reports actual-handler/static contracts pass. Extended fixture selector correction is test-harness maintenance, not another Narro defect. Original user profiles remain restored; do not launch physical regression without re-isolation. Actual recorder audio health remains unverified. M10 blocked/M11 excluded.