import subprocess

# get content
res = subprocess.run(["git", "show", "ad9c0f1:WORK_LOG.md"], capture_output=True, text=True, encoding="utf-8")
content = res.stdout

# replace backslashes with backticks (heuristically looking for pairs of backslashes around words)
import re
content = re.sub(r'\\(.*?)\\', r'\1', content)
# fix some weird ones if any
content = content.replace('\n', '\n')

new_entries = '''
## 2026-09-02 - Milestone 1 Runtime Harness Audit & Artifact Generation
**Agent:** Antigravity
**Milestone:** M1 / Native Runtime
**Commits:**
- c463477 (Fix M1 runtime harness (audit findings) and add artifact generation)
- 857d5d1 (Remove scratch scripts and binaries)
- 843549c (Update logs and handoff for user artifact validation)

### Changed
- Refactored main window commands in src-tauri/src/lib.rs to properly return Err when target is missing, and to correctly differentiate between destroy() and close().
- Added missing explicit controls in src/Focus.tsx to destroy/close main.
- Added explicit ocus_surface_show, _hide, _focus commands and exposed them in the React harness.
- Updated Mode switching commands (ocus_surface_mode_panel and _timer) to ensure the window is shown.
- Adjusted TODO.md and docs to correctly reflect that main window recreation uses a hardcoded fixed geometry (800x600) and that monitor-edge positioning is NOT yet implemented for mode switching.
- Cleaned up docs/M1_WINDOWS_RUNTIME_VALIDATION.md to standard markdown and added Option A (Download Artifact) vs Option B (Local NPM run).
- Modified ci.yml to upload the produced Tauri executable/installer (.exe/.msi) as a downloadable GitHub Actions artifact: 
arro-m1-runtime-harness-windows-x64.

### Decisions
- Since coding environments cannot reliably execute the Tauri Windows build interactively to test behaviors like "Always on Top" or "Skip Taskbar", we are pivoting to generating an artifact via CI. 
- The user will download the artifact directly and perform the manual checks locally.

### Validation performed
- 
pm ci, 
pm run build, cargo check --locked, cargo test --locked -> PASS in CI.
- 
pm run tauri build -> PASS in CI, producing NSIS artifact.
- **Interactive Windows Tests -> NOT RUN** (Delegated to User).

### Exact continuation point
- The user MUST download the 
arro-m1-runtime-harness-windows-x64 artifact from the latest GitHub Actions run on main, install/run it, and execute the manual validation procedure in docs/M1_WINDOWS_RUNTIME_VALIDATION.md.

---

## 2026-09-02 - User Windows runtime validation results
**User:** Marios
**Milestone:** M1 / user manual test

### Results
- main -> ocusSurface shared Rust state: **PASS**
- ocusSurface -> main shared Rust state: **PASS**
- Hide/Show Main: **PASS**
- Destroy Main keeps Rust process and ocusSurface alive: **PASS**
- Rust state still mutates while main is destroyed: **PASS**
- Recreate Main: **FAIL** (Hangs ocusSurface and opens a blank white window).

---

## 2026-09-02 - Milestone 1 Recreate Deadlock Fix
**Agent:** Codex
**Milestone:** M1 / Native Runtime Recreate Bugfix
**Commits:** pending

### Changed
- Converted main_window_recreate in src-tauri/src/lib.rs to an sync fn. The synchronous Tauri 2 command directly calling WebviewWindowBuilder::build() deadlocked the WebView2 initialization thread on Windows, completely hanging the app.
- Updated .github/workflows/ci.yml to also upload src-tauri/target/release/narro.exe alongside the NSIS/MSI installers.
- Restored WORK_LOG.md history after an accidental overwrite in a previous agent slice.

### Decisions
- Moving to sync fn for window creation matches Tauri 2's explicit Windows-specific guidance for avoiding IPC/Event loop deadlocks. 
- Did not change the 800x600 fixed-geometry fallback as window-state persistence is out of scope for this narrow bugfix slice.

### Validation performed
- **Interactive Windows Tests -> NOT RUN** (Delegated back to user to verify deadlock is actually fixed in their local Windows environment).

### Exact continuation point
- The user must download the NEW 
arro-m1-runtime-harness-windows-x64 artifact (including the raw 
arro.exe) and re-run the Recreate Main scenario to confirm the deadlock is solved.
'''

with open("WORK_LOG.md", "w", encoding="utf-8") as f:
    f.write(content + "\n" + new_entries)

