# M7 item 8 Focus Panel and Timer shortcut

Date: 2026-09-24. Agent: Codex, Desktop checkout and GitHub.

## Scope and decision

Implemented Ctrl+Shift+T on the existing Windows RegisterHotKey/subclass observer with a distinct hotkey ID, revisioned diagnostics/event, typed registration conflict, and normal-app retry. The focusSurface renderer uses the existing one-window Panel/Timer transition and rejects overlapping mode/resize requests. No extra webview, timer/session mutation, or high-frequency geometry loop was added.

Changed `src-tauri/src/shortcuts/mod.rs`, `src-tauri/src/lib.rs`, `src/focus.tsx`, `src/FloatingTimerFoundation.tsx`, `src/App.tsx`, `src/diagnosticApi.ts`, `scripts/test-ui-focus-toggle-shortcut.mjs`, and `package.json`.

## Evidence

- PR #126 exact head `e3dd947dc82a98fd0df68866467753849f35c5bf`.
- Local frontend preflight, TypeScript build, `cargo fmt --check`, and diff check: PASS after rebase onto item-7 main. Local `cargo check`: NOT RUN to completion because crates.io index timed out.
- Windows PR CI #488 / run `35940850134` / job `107448171506`: PASS (Repository Preflight, visual fixtures, Tauri Release, diagnostic artifact). PR runtime artifact `10785676181`, digest `sha256:d1b338cba7ab1da9253a82a27108948b0f1831f46efcc879cbdcd3613775e63f`.
- PR reviews, comments, and review threads: none at final-head review.
- Expected-head guarded squash merge `77e535f73593be59f4a82b9052cba9ade5c36611`.
- Resulting-main Windows CI #489 / run `35942198710` / job `107452313301`: PASS. Runtime artifact `10785728177`, digest `sha256:91081c9d7a1ed23597c00fd7c3951d130fde1a3c2d67b18aa58310f9badb9ae8`. Visual artifact `10785930652`, digest `sha256:07812a08bc457982773fd74828280119f12db8934be6d631df7fff0c736c8cff`.

## Tracking and limits

`TODO.md`, `STATUS.md`, and `HANDOFF.md` record automated validation and keep the top-level item open. Physical Windows global-shortcut behavior, conflict/retry, and live-session continuity are NOT RUN. Item 7 physical compositor gate remains open independently. Continue item 9 in TODO order; its PR/CI evidence is in its own log.
