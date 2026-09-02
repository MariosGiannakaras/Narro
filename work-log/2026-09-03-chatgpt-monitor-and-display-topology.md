# Milestone 1 monitor positioning and display-topology recovery — 2026-09-03

- **Agent/tool:** ChatGPT
- **Milestone:** 1 — Windows native capability validation

## Scope

This entry records the automated evidence for two adjacent M1 slices:

1. Windows monitor enumeration plus selected-monitor left/right Focus Panel positioning.
2. Event-driven display-topology/off-screen recovery after Windows display changes.

Physical Windows behavior remains a separate evidence layer and is explicitly NOT RUN for these new capabilities at the time of this entry.

## Monitor enumeration / selected-edge positioning

Implementation on `main` provides:

- current Windows monitor enumeration through Tauri;
- stable monitor descriptors containing resolution, desktop position, work area and scale factor;
- explicit stale-monitor-key rejection rather than silently targeting another display;
- selected-monitor Focus Panel left/right placement using physical work-area coordinates;
- negative-desktop-coordinate support;
- geometry validation and clamping helpers with Rust unit tests;
- the same existing `focusSurface` webview; no third persistent webview.

A first source push was correctly stopped by the new repository preflight because of two `rustfmt` diffs. The formatter output was applied exactly with no logic change before the successful run below.

### Windows CI #51

- Run ID: `33681874656`
- Head: `9ed143a964fae6889a64fb9382ba1471b2ab6415`
- Result: **SUCCESS**
- Repository preflight: **PASS**
  - config invariants
  - frontend production build
  - rustfmt check
  - `cargo check --locked`
  - Clippy with warnings denied
  - `cargo test --locked`
- Tauri release build: **PASS**
- artifact upload: **PASS**
- Artifact: `narro-m1-runtime-harness-windows-x64`
- Artifact ID: `9866958869`
- Artifact digest: `sha256:6777bc5302080986f78c7b6d391d9bf95fb28f0c2d0b85cb062c45bc0f1b228d`

**Physical monitor enumeration / left-right placement:** `NOT RUN`.

## Display-topology / off-screen recovery

The topology slice was developed away from `main` on `ai/m1-display-topology-recovery` and reviewed through PR #1 before merge.

Implementation provides:

- event-driven Windows `WM_DISPLAYCHANGE` handling; no polling loop;
- the persistent `focusSurface` HWND as the observer anchor, so `main` may be absent;
- a deliberately small `Comctl32` subclass FFI boundary with no extra dependency / `Cargo.lock` churn;
- async hop out of the Win32 callback before Tauri main-thread enumeration/reposition work;
- event coalescing with a separate dirty flag so a second topology change arriving during recovery is not lost;
- re-enumeration of current monitors/work areas at recovery time;
- safe recovery of normal `main` / `focusSurface` windows to a visible work area;
- minimized/maximized/fullscreen windows left to Windows-managed geometry;
- pure Rust geometry tests for negative coordinates, partial off-screen placement, detached previous monitor, invalid/transient work areas and oversized windows;
- dedicated physical validation procedure in `docs/M1_DISPLAY_TOPOLOGY_VALIDATION.md`.

### PR preflight history

PR #1: `Validate event-driven display topology recovery`

- Initial PR CI #52 (`33683690606`) failed **only** at `cargo fmt -- --check` before compiler/package work.
- The exact formatter diff was applied; there was no blind retry or logic rewrite.

### Windows CI #54

Final PR head:

- `3089398bf45bdec2c47fa9e75648adc36fd25b43`

CI evidence:

- Run ID: `33683913556`
- Result: **SUCCESS**
- Repository preflight: **PASS**
  - frontend/config build
  - rustfmt
  - `cargo check --locked`
  - Clippy with warnings denied
  - Rust tests
- Tauri release build: **PASS**
- artifact upload: **PASS**
- Artifact: `narro-m1-runtime-harness-windows-x64`
- Artifact ID: `9867702085`
- Artifact size: `10,422,528` bytes
- Artifact digest: `sha256:70789c4654d46f07e173a4aedb86aed267e38e3ae21c8e8fe31f341b02469c24`

PR #1 was merged with expected-head protection as:

- merge commit `7bd8e47edfca42ebbe4cc26caa0c5022af51b959`

The merge commit used `[skip ci]` because the exact PR merge context had already passed the full Windows pipeline, avoiding a redundant second native build. No rebase, amend or force-push was used.

**Physical display disconnect/reconnect/reorder/off-screen recovery:** `NOT RUN`.

## Manual evidence still required

Do not close the corresponding M1 TODO parents from CI alone. A real Windows run still needs to verify:

- monitor enumeration matches Windows Display Settings;
- selected monitor left/right placement;
- stale selection fails safely;
- disconnect/reconnect without Narro restart;
- off-screen `main` and `focusSurface` recovery;
- hotplug recovery while `main` is already destroyed;
- only `main` + `focusSurface` remain as persistent webviews.

## Continuation

The next implementation capability is M1 global shortcut registration / trigger / conflict handling. Continue to use branch/PR validation for Windows-native source slices when local Rust/Windows execution is unavailable, and keep physical runtime evidence distinct from CI evidence.
