# 2026-10-06 ChatGPT implementation resume — PR236 integrated, PR237 active

## Scope

Resume implementation from the authoritative post-audit repository state without requiring a new physical Windows cycle from the user.

Compact progress remains **3/10M || 4/5 | 14/19**. No roadmap or acceptance counter is advanced by the automated/source work below.

## Live branch / PR recheck

- Initial authoritative `main`: `6bee37386b17ef359af1d740edf3bda9f78f1aa4`.
- No open PR existed at resume.
- Historical `fix/m7-visual-hold-physical` and other old fix branches were not continuation candidates.
- `wip/m7-async-read-and-evidence-tools-20261005` remained a diverged backup with unvalidated app WIP plus machine-specific evidence tooling; it was not merged wholesale.
- During PR236 work its live head moved by two later `src-tauri/src/lib.rs` formatting/layout commits. The concurrent head was inspected rather than overwritten.

## Finding27 — selected-monitor identity / DPI recovery

The CI953 physical evidence had shown that an explicitly selected monitor could become stale after a real 125%→100% DPI change because the persisted monitor key embeds volatile work-area/DPI geometry.

Implemented on `fix/m1-monitor-dpi-selection-recovery` / PR236:

- preserve the detailed persisted key and exact-match behavior;
- when volatile descriptor fields changed, fall back only to one unique non-empty Windows monitor name;
- retain fail-closed behavior for absent, malformed, unnamed or ambiguous displays;
- make Preferences resolve a compatible persisted selection to the current descriptor;
- expose a truly stale saved display as a distinct disabled value instead of falsely rendering it as Automatic, so choosing Automatic performs a real clear;
- add renderer/Rust regression coverage for DPI/work-area/geometry compatibility and stale/ambiguous cases.

Validation:

- exact final head `357706a1fe6d7143c046c64df2f336a236026a88`;
- full Windows CI962 / run `37382833470`: validation gate, frontend/contracts, rustfmt, cargo check, clippy, Rust tests, performance harness, visual fixtures, Tauri release, packaged Focus runtime, physical-validation build, M7 validation logger, M1 diagnostic build/storage isolation all PASS;
- expected-head-guarded squash merge: `9f3e9b5cebdd752551c9b6b148975fe542bf44ea`;
- all seven changed source/test blob SHAs were checked and are identical between the exact-green PR head and resulting `main`.

**Physical finding27 acceptance remains OPEN/deferred.** No M1 completion is claimed.

## Finding07 — locked authoritative read responsiveness

The CI950 loading evidence remains the physical baseline: under a real SQLite exclusive lock, loading feedback rendered but Escape/Tab input remained queued until the lock released.

The old WIP direction was reviewed and only the relevant implementation delta was re-created on post-PR236 `main`. Existing branch `fix/m7-async-read-responsiveness` was force-with-lease reset from its old head `297975332c53c611772d0beac99f86136507a42a` to new main `9f3e9b5c...`, then the four-file delta was reapplied:

- new `src-tauri/src/blocking_read.rs` using `tauri::async_runtime::spawn_blocking`;
- async/offloaded `get_home_snapshot`;
- async/offloaded `get_list_board_snapshot`;
- list-board contract coverage for the nonblocking boundary.

The Rust regression holds a real rollback-journal SQLite `BEGIN EXCLUSIVE` lock, proves the future is pending while a different blocking worker waits, then releases the lock and verifies the authoritative result is preserved. A second test preserves typed command errors.

PR237 exact head at this checkpoint: `0f15f06ff7642e68dd4f124b526f38810b753bfb`, four changed files. Windows CI964 / run `37428653095` is **IN PROGRESS** at this immutable checkpoint. No automated PASS or physical finding07 PASS is claimed yet.

## Finding23 — provider / queue horizontal metric

Review-first result: **NO FIX NOW**.

Evidence/source basis:

- CI950 native physical evidence already passes wheel, Ctrl+End, last row/actions/menu and Tab access at real 100% and 125%;
- queue source uses vertical scrolling with `overflow-x: hidden`;
- row/title layout uses bounded width/ellipsis/wrapping;
- existing integration regression asserts `queue.scrollWidth <= queue.clientWidth + 1` and hidden horizontal overflow;
- the observed UIA horizontal view-size ~66.7% has no rendered horizontal-overflow reproduction.

Do not modify layout solely to satisfy provider telemetry. Canonical/source acceptance can remain independently open.

## Exact continuation

1. Inspect PR237 exact-head CI964.
2. Fix only evidenced failures on the same branch.
3. When full automated validation is green, update PR evidence and integrate with expected-head guard.
4. Verify resulting-main source/test identity or required main CI.
5. Keep physical finding07 and finding27 acceptance deferred/open; user does not want a new physical cycle now.
6. Continue dependency-safe existing-evidence/canonical/supplemental review and implementation without speculative finding23 changes.
7. M10 remains blocked; M11 dormant.
