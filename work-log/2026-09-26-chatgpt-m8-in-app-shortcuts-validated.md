# 2026-09-26 — M8 confirmed in-app shortcuts validated

## Scope

Tracking reconciliation after the first independent M8 source slice.

Validated source baseline entering the slice:
`76ef5dadf1d6587ee52d029d980ad4de7a9abd93`.

## Authoritative validation

- PR #166 exact head: `18a4d2b5a26bc705bf7cdf7bea647275b4877890`;
- Windows CI #569 / run `36255993870`: **PASS**;
- Repository Preflight: PASS;
- Rust fmt/check/clippy/tests: PASS;
- Windows visual regression: PASS;
- Tauri release build: PASS;
- visual artifact: `narro-m5-visual-regression`, id `10911290878`, digest `sha256:7f7b8bb93f54d437edb8751a43fc0da9e4b5d0fd1832abee5583581a0bdb7aea`;
- diagnostic artifact: `narro-m1-runtime-harness-windows-x64`, id `10910393452`, digest `sha256:faff93e41553adc51a0ced99172795517f51d918f2873ce6a294af6c59d56ec9`;
- expected-head guarded squash merge: `030274149cafdf590c5aa08f2cd1c9409595c7aa`;
- resulting-main Windows CI #570 / run `36262618691`: **PASS** through identical-tree validation.

## Validated behavior

- `Ctrl+Alt+T`: persistence-first quick task creation.
- `Ctrl+Alt+B`: existing authoritative manual-break lifecycle.
- `Ctrl+Alt+P`: existing Pause/Resume/break-skip lifecycle.
- `Ctrl+Alt+S`: existing authoritative Skip behavior.
- `Ctrl+Alt+F`: existing authoritative Done behavior.
- `Ctrl+Alt+N`: Notes, expanding Floating Timer safely first when needed.
- `Ctrl+F`: Search in Main; explicit unavailable feedback in Focus.
- Main routes live Focus actions to `focusSurface` rather than duplicating timer mutations.
- unavailable/no-active-task and cross-window routing failures are visible.
- editable controls suppress destructive shortcuts while typing.
- collapsed Floating Timer retains compact visuals while keeping shortcut control logic mounted.

## Roadmap reconciliation

M8 TODO items now complete:
- confirmed Windows in-app shortcuts;
- Start Break shortcut authoritative lifecycle reuse.

M8 remains incomplete.

## Next action

Implement the confirmed global shortcuts' per-global enable toggles on top of the existing native `RegisterHotKey` authority and diagnostics. Persist enable state, honor it at startup, and keep native/persisted state coherent on registration conflicts/failures.

M7 physical/manual closure and not-yet-uploaded video evidence remain open but non-blocking for this independent source work.
