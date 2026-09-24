# M7 item 9 Find Timer shortcut and pulse

Date: 2026-09-24. Agent: Codex, Desktop checkout and GitHub.

## Scope and decision

Implemented Ctrl+Shift+P on the existing Windows RegisterHotKey/subclass path. Registration/conflict/observer errors are typed and visible with normal-app retry. When native mode is Timer, the shortcut shows/focuses the same focusSurface and emits a revisioned request. The renderer accepts it only when Timer is settled, then draws a single 720 ms inset border pulse; reduced motion shortens it to 180 ms. The pulse changes no native/window geometry and has no idle animation loop.

Changed `src-tauri/src/shortcuts/mod.rs`, `src-tauri/src/lib.rs`, `src/focus.tsx`, `src/FloatingTimerFoundation.tsx`, `src/App.tsx`, `src/diagnosticApi.ts`, `src/floatingTimerFoundation.css`, and two deterministic compact/collapsed motion contracts. Those contracts now permit only this finite pulse exception.

## Evidence

- Local branch was rebased from item-8 PR head onto resulting-main `77e535f73593be59f4a82b9052cba9ade5c36611`. PR #127 exact head `a12946b1320e43800b54181a0dfbc9f95df31b92`.
- Local frontend preflight, TypeScript build, `cargo fmt --check`, and diff check: PASS after rebase. Local Rust offline compilation: NOT RUN; `chrono` was absent from the local crates cache.
- Windows PR CI #490 / run `35942309332` / job `107452658263`: PASS (Repository Preflight, visual fixtures, Tauri Release, diagnostic artifact). PR runtime artifact `10785871986`, digest `sha256:c0e1f83328688ef55145776e0a9956a8e5c8cfe74324d47aad11906ddfa28537`.
- PR reviews, comments, and review threads: none at final-head review.
- Expected-head guarded squash merge `53c03767d5303067c14da9740f4a450c59e6afc4`.
- Resulting-main Windows CI #491 / run `35970230227`: in progress at this log edit. Verify final job and runtime artifact before counting resulting-main validation.

## Tracking and limits

`TODO.md`, `STATUS.md`, and `HANDOFF.md` record the PR validation and pending resulting-main CI. Physical Windows hotkey/conflict/pulse/session-continuity checks are NOT RUN. The top-level item and item-7 physical compositor gate stay open. Continue item 10 safe-position implementation in an isolated branch.
