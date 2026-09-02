
## 2026-09-02 - Milestone 1 Runtime Harness Audit & Artifact Generation
**Agent:** Antigravity
**Milestone:** M1 / Native Runtime
**Commits:**
- \c463477\ (Fix M1 runtime harness (audit findings) and add artifact generation)
- \857d5d1\ (Remove scratch scripts and binaries)

### Changed
- Refactored main window commands in \src-tauri/src/lib.rs\ to properly return \Err\ when target is missing, and to correctly differentiate between \destroy()\ and \close()\.
- Added missing explicit controls in \src/Focus.tsx\ to destroy/close \main\.
- Added explicit \ocus_surface_show\, \_hide\, \_focus\ commands and exposed them in the React harness.
- Updated Mode switching commands (\ocus_surface_mode_panel\ and \_timer\) to ensure the window is shown.
- Adjusted \TODO.md\ and docs to correctly reflect that \main\ window recreation uses a hardcoded fixed geometry (800x600) and that monitor-edge positioning is NOT yet implemented for mode switching.
- Cleaned up \docs/M1_WINDOWS_RUNTIME_VALIDATION.md\ to standard markdown and added Option A (Download Artifact) vs Option B (Local NPM run).
- Modified \ci.yml\ to upload the produced Tauri executable/installer (\.exe\/\.msi\) as a downloadable GitHub Actions artifact: \
arro-m1-runtime-harness-windows-x64\.

### Decisions
- Since coding environments cannot reliably execute the Tauri Windows build interactively to test behaviors like "Always on Top" or "Skip Taskbar", we are pivoting to generating an artifact via CI. 
- The user will download the artifact directly and perform the manual checks locally.

### Validation performed
- \
pm ci\, \
pm run build\, \cargo check --locked\, \cargo test --locked\ -> PASS in CI.
- \
pm run tauri build\ -> RUNNING in CI, producing NSIS artifact.
- **Interactive Windows Tests -> NOT RUN** (Delegated to User).

### Exact continuation point
- The user MUST download the \
arro-m1-runtime-harness-windows-x64\ artifact from the latest GitHub Actions run on \main\, install/run it, and execute the manual validation procedure in \docs/M1_WINDOWS_RUNTIME_VALIDATION.md\.
