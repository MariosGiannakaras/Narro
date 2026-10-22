# One-Time Final Pre-Physical Audit & Hardening (PR389 `c30d82550af5d8ac3bc1ccc922cdc673ca880d71`) — 2026-10-22

**Immutable acceptance checkpoint (source audit, root-cause fixes, and exact-head Windows CI 3/3 PASS; physical Windows verification NOT RUN).**

## 1. Scope and Repository Identity

- **Temporary corrective owner**: Gemini 4 Argon (authorized solely for this one-time final pre-physical audit & hardening pass; permanent ChatGPT coding / Codex physical responsibilities preserved).
- **Target branch / PR**: Existing [PR389](https://github.com/MariosGiannakaras/Narro/pull/389), branch `fix/m7-pixel-preserving-composition`.
- **Reconciled baseline**: Merged latest `origin/main` (`d09f2efb7d081cfa67e537e574ca08d3d9def46c`, including accepted [PR344](https://github.com/MariosGiannakaras/Narro/pull/344) `652f648d7ed0e2c5ab6a8a52e033957fd07cb271` PA-01–08 session preparation script) into `fix/m7-pixel-preserving-composition` (`3bc1ec8099bdbeaf72986462ec861533abebfa27`), then applied the 4 root-cause fixes in `c30d82550af5d8ac3bc1ccc922cdc673ca880d71`.
- **Final validated source SHA**: `c30d82550af5d8ac3bc1ccc922cdc673ca880d71` (`19 files changed, 203 insertions(+), 47 deletions(-)`).
- **Exact-head GitHub Actions Windows CI**: [Run `39832818567`](https://github.com/MariosGiannakaras/Narro/actions/runs/39832818567), **attempt 1**, **3/3 jobs `SUCCESS`**:
  - `validation-gate` (`#120013160269`): `SUCCESS`
  - `fast-gate` (`#120013197884`): `SUCCESS`
  - `windows-candidate` (`#120013640777`): `SUCCESS` (all 426 Rust unit/integration tests, Clippy `-D warnings`, M1 performance harness test, Edge headless visual regression & Focus runtime captures, Tauri release/physical/validation/diagnostic builds, M7 automatic validation logging smoke, and M1 diagnostic storage isolation).

## 2. Substantiated Technical Findings & Root-Cause Fixes

### Finding 1 — SQLite `DEFERRED` Read-to-Write Lock Upgrade Failures Under Concurrent Writers
- **Root cause**: While core board task CRUD (`src-tauri/src/board_task_mutation.rs`) and `mutate_preferences` used `TransactionBehavior::Immediate`, 21 other production write transactions across `board_task_mutation.rs` (`move_unscheduled_task_to_lane`), `persistence/lists.rs` (7 functions), `persistence/notes.rs` (2 functions), `persistence/subtasks.rs` (6 functions), `persistence/recurrence.rs` (4 functions), `persistence/sleep_accounting.rs` (1 function), `persistence/preferences.rs` (`initialize_preferences`, `save_preferences`), `list_settings.rs` (`archive_stale_done_tasks_at`), and `reminder_acceptance.rs` (`schedule_probe_in_connection`) still opened `DEFERRED` transactions (`conn.transaction()`) and executed `SELECT` statements before `INSERT`/`UPDATE`/`DELETE`. In SQLite, when a `DEFERRED` transaction acquires a shared read lock and subsequently attempts to upgrade to a `RESERVED` write lock while another connection (e.g., periodic timer checkpoint, sleep-accounting sweep, or rapid cross-window action) holds a write lock, SQLite immediately returns `SQLITE_BUSY` **without waiting for `busy_timeout`** to prevent deadlock. Additionally, `preference_patch_waits_for_writer_and_preserves_its_latest_fields` (`src-tauri/src/persistence/preferences.rs:565`) used a 2,000 ms `busy_timeout` on shared CI runners (which caused attempt 1 of prior run `39802187561` to fail), whereas `task_writer_contention.rs` used 10,000 ms.
- **Correction**: Migrated all 21 remaining read-then-write production transactions to `conn.transaction_with_behavior(TransactionBehavior::Immediate)`, eliminated duplicate `if expected_updated_at.is_some()` branches in `src-tauri/src/persistence/recurrence.rs`, aligned the preferences contention test `busy_timeout` to 10,000 ms, and added two-connection contention regression test `related_mutations_wait_for_competing_writer_instead_of_failing_read_upgrade` in `src-tauri/src/persistence/task_writer_contention.rs` covering subtasks, notes, lists, recurrence, and `move_unscheduled_task_to_lane`.

### Finding 2 — Floating Timer `raster-preparing` Hover Crossfade Bakes Mid-Transition Alpha Into `CapturePreview`
- **Root cause**: `src/floatingTimerFoundation.css` suppressed the 150 ms opacity/visibility CSS transitions on `.floating-timer-foundation__heading`, `.floating-timer-foundation__actions-wrap`, `.floating-timer-foundation__drag-handle`, and `.floating-timer-foundation__content` only when `data-floating-resize-phase="clipping"`, not during `"raster-preparing"`. When the user clicked Expand or Collapse while hovering the compact Floating Timer, `setControlsRevealed(false)` ran in the same state update as `setResizePhase("raster-preparing")`, causing the outgoing compact heading and compact action strip to crossfade over 150 ms while `CapturePreview` captured the target bitmap after 2 animation frames (~33 ms), baking overlapping half-faded header text and icons into the 250 ms transition raster.
- **Correction**: Extended `src/floatingTimerFoundation.css` transition suppression selectors to cover both `data-floating-resize-phase="clipping"` and `data-floating-resize-phase="raster-preparing"`, ensuring instant settled visual state before `CapturePreview`. Added contract assertion in `scripts/test-ui-floating-collapsed.mjs`.

### Finding 3 — Owned Layered Popup (`NarroFocusOwnedLayer`) & Owner `focusSurface` Per-Frame Position Desynchronization
- **Root cause**: `focus_layered_raster::present_frame` synced the owned layered popup (`WS_POPUP`) to the owner `focusSurface` window rectangle, and `animate_focus_surface_presentation_internal` (`src-tauri/src/lib.rs`) then called `set_focus_position(window, frame_position)` *after* `render_mode_raster_frame`, moving the owner `focusSurface` HWND without moving the owned `WS_POPUP` until the next frame or the 50 ms watchdog tick (`WM_TIMER`). Furthermore, direct calls to `focus_webview::set_physical_position` did not update the owned layered popup position on the window thread.
- **Correction**: Added `focus_layered_raster::sync_owner_position(window)` in `src-tauri/src/focus_layered_raster.rs` and invoked it inside `focus_webview::set_physical_position` (`src-tauri/src/focus_webview.rs`) on the window thread immediately after `SetWindowPos` moves the owner `focusSurface`. Reordered `animate_focus_surface_presentation_internal` in `src-tauri/src/lib.rs` so `render_mode_raster_frame` completes while owner and popup are stationary and aligned before `set_focus_position` moves both together. Added contract assertions in `scripts/test-ui-focus-surface-transition.mjs`.

### Finding 4 — Floating Timer Subtask Hydration & Create-Input Readiness Race Before Expand Raster Capture
- **Root cause**: When expanding the Floating Timer for the first time on a live task (or clicking `+` "Add subtask" in compact mode), `FocusLiveSubtasks` (`src/FocusLiveSubtasks.tsx`) mounted in expanded mode and started an asynchronous `readTaskSubtasks(task.id)` IPC call, rendering `"Loading subtasks…"` (`focus-live-subtasks__feedback`) while `waitForTimerTargetPaint` in `src/FocusSurfaceCoordinator.tsx` waited only 2 animation frames before `CapturePreview` snapshotted the target DOM. Additionally, `openSubtaskCreateFromCompact` called `await requestExpanded(true)` *before* `setCreateOpen(true)`, so the target raster was captured without the new-subtask input field and the input popped in only after the 250 ms resize animation finished.
- **Correction**: Added `data-floating-subtasks-loading="true"` to `src/FocusLiveSubtasks.tsx` while the initial expanded subtask snapshot is in flight, updated `openSubtaskCreateFromCompact` to set `createOpen(true)` before `requestExpanded(true)` (with rollback if expansion fails), and updated `waitForTimerTargetPaint` in `src/FocusSurfaceCoordinator.tsx` to wait up to 16 animation frames for `[data-floating-subtasks-loading="true"]` to clear before `waitForPresentedFrame()` and `CapturePreview`. Added contract assertions in `scripts/test-protected-timer-resize.mjs`.

## 3. Artifact & Binary Provenance Receipts (Run `39832818567`, Attempt 1)

Independently downloaded and verified the candidate artifacts from [run `39832818567`](https://github.com/MariosGiannakaras/Narro/actions/runs/39832818567) (`sourceSha = c30d82550af5d8ac3bc1ccc922cdc673ca880d71`, `githubRunAttempt = 1`):

| Artifact Name | Artifact ID | GitHub ZIP SHA-256 Digest |
|---|---|---|
| `narro-m7-physical-windows-x64` | `12449824642` | `ba38745c71eeb1dbbf97822bfa8af736db4269c88c05e2175d92295f8c8d51a0` |
| `narro-m7-validation-windows-x64` | `12450557561` | `23dbf438b5917747c9d214133583859052d80eee6a034f7cb2d5ad1894c55b71` |
| `narro-m1-diagnostic-windows-x64` | `12451231412` | `a744367480f67ec8879666478e6c5db0fb81a24b114a0cf2f437daedbaea89cf` |
| `narro-m5-visual-regression` | `12450152396` | `4728f443655f73f2bffba6ffbbc31454e91c17b9045c74610424854ad5bfeca5` |
| `narro-m7-focus-runtime-visual` | `12449933033` | `0a1a929b97fc8d3037e2bf0f685031f27b95467d3c6d38dd21265c238c3c6a73` |
| `narro-fast-frontend-dist` | `12449168882` | `60936c44704850af00c4ed0fe86b6d08343ab03849fb6c5244bfe69418ac2313` |

**Extracted Binary SHA-256 Receipts (verified via `Get-FileHash` and embedded `ci-provenance/*.json` manifests):**
- Production `src-tauri/target-physical/release/narro.exe` (`16,208,384` bytes): `fb7f7430cc68ecea4a578cb75651a34dc5c2eb5977bcfbfa749efe4510cf260c`
- Validation `m7-validation/narro-m7-validation.exe` (`16,208,384` bytes): `fb7f7430cc68ecea4a578cb75651a34dc5c2eb5977bcfbfa749efe4510cf260c` (identical to production `narro.exe`)
- NSIS Installer `src-tauri/target-physical/release/bundle/nsis/Narro_0.1.0_x64-setup.exe` (`4,206,601` bytes): `c605fff2e8a5f08db102ea27feb30e8eff5578a084116fd531982938963f289f`
- MSI Installer `src-tauri/target-physical/release/bundle/msi/Narro_0.1.0_x64_en-US.msi` (`5,922,816` bytes): `10db9de13bdd23fdcf9f46a2a2e1881a375ef7c7140bf746d2412e00f0434a05`
- M1 Diagnostic `src-tauri/target/release/narro.exe` (`16,208,384` bytes): `114e083ab9b99c79dd5ce22e9ce7ed3cc90dd756125e3b57d69625dbfcf283a8`

## 4. Physical Verification Boundary & Next Action

- No physical Windows motion/interactive claims are made from automated tests or CI screenshots.
- Personal Windows AppData and user profiles were never touched.
- [PR389](https://github.com/MariosGiannakaras/Narro/pull/389) remains **OPEN / NOT MERGED** at exact source head `c30d82550af5d8ac3bc1ccc922cdc673ca880d71` (which already merges `origin/main` including PR344).
- **Next action**: Codex executes the 8-case M7 physical transition verification (and remaining grouped physical checks) against exact candidate `c30d82550af5d8ac3bc1ccc922cdc673ca880d71` (`narro.exe` / `narro-m7-validation.exe` SHA-256 `fb7f7430cc68ecea4a578cb75651a34dc5c2eb5977bcfbfa749efe4510cf260c`) using the existing profile backup/restore protocol. If all 8 transitions pass, expected-head guard merge PR389 and verify resulting-main CI/blob identities.
