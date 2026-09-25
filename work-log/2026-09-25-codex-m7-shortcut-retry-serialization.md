# 2026-09-25 — M7 shortcut registration/retry serialization

## Source and decision

- Agent: Codex. PR #143 exact head `9b80ee19c6678fca998b58740410f94c821cff26`; guarded squash merge `fce15f8ed7a70cd83e05f3b9448d627413b719e7`; identical Git tree `608aec06f64a3184568bc0d171adc1b085220fa9`.
- `src-tauri/src/shortcuts/mod.rs` now serializes each Ctrl+Shift+T/P native registration and its diagnostic-state publication through one manager gate. Concurrent retries previously could both read `unregistered`, leading to a spurious `RegisterHotKey` conflict and stale error even after one retry succeeded. A successful native registration rolls back if the diagnostic state cannot commit, and a rollback failure is returned explicitly. Errors are recorded while the registration gate is held, so a late failed attempt cannot overwrite a later successful state.
- `src/App.tsx` and `src/diagnosticApi.ts` reconcile a failed retry against fresh native diagnostics; a concurrent success or a native conflict banner does not leave a duplicate generic error. `scripts/test-shortcut-retry.mjs` is in frontend preflight. The Rust tests exercise 16 concurrent retry callers per chord, conflict then successful/idempotent retry, and native rollback after diagnostic revision overflow. No timer/session, placement, rendering or polling behavior changed.

## Validation

- Local PASS: `npm run check:config`, `npm run test:shortcut-retry`, `npm run test:ui-focus-toggle-shortcut`, `npm run test:ui-app-shell`, `npx tsc --noEmit`, `npx vite build`, `cargo fmt --manifest-path src-tauri/Cargo.toml -- --check`, and `git diff --check`.
- Local Rust execution: NOT RUN. `cargo test --manifest-path src-tauri/Cargo.toml --locked shortcuts::tests` was attempted but dependency build scripts could not link because this PC lacks MSVC `link.exe`; this is an environment failure, not a test result.
- Windows CI #507 / run `36136277164` / job `108075004776`: PASS on exact PR head, including repository preflight with Rust tests/Clippy, visual fixtures and Tauri release. Runtime artifact `10865303816` (`narro-m1-runtime-harness-windows-x64`), digest `sha256:539f70706847c5938226a7dc9c65a31860c544b9d30b59f09d91620cd5fc52f3`; visual artifact `10864817426`. Automatic resulting-main CI #508 / run `36137982437` was cancelled only after exact Git tree identity.
- Physical validation of this new executable: NOT RUN. The earlier #503/#505 observations remain scoped to those older builds. An attempted Computer Use visual capture of the existing #505 executable failed with `SetIsBorderRequired failed: No such interface supported (0x80004002)`; the accessibility tree worked, but no new visual PASS was inferred. That process was stopped and the user database restored byte-for-byte to SHA256 `8271B4CFE1190D2E5952D3C6A969ED71FE4650ACBA2B12F0A7061A310C0F1F4E` with no Narro process left running.

## Tracking and continuation

- `TODO.md` records only the new automated sub-gates under M7 items 8 and 9; both parent items remain open. `STATUS.md` identifies the new automated source and retains the older physical evidence at its proper scope. `HANDOFF.md` and `docs/M7_FLOATING_RUNTIME_VALIDATION.md` identify the new artifact and consolidated remaining checks. M7 remains 8/14 and M8 remains blocked.
- Next agent: inspect current main/PR/CI state, then complete only the still-open M7 physical conditions on artifact `10865303816` or a newer exact validated source. Recheck basic Ctrl+Shift+T/P on this new build alongside conflict/retry and transition-boundary behavior. Use a physical display with the missing monitor/DPI/taskbar conditions when available. Do not mark these gates complete from the automated tests alone.
