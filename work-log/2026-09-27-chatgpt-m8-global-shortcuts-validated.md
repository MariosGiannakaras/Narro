# 2026-09-27 — M8 global shortcut toggles validated

## Scope

Validation/tracking reconciliation for the second M8 source slice: persisted per-global enable toggles and product-facing availability/conflict feedback for the existing native Windows shortcuts.

## Source evidence

- entering validated source baseline: `030274149cafdf590c5aa08f2cd1c9409595c7aa`;
- PR #168 exact validated head: `e63dbd3107fca8ccf95d35506c7a16e4eeaac9f6`;
- Windows CI #574 / run `36284019516`: PASS;
- Repository Preflight: PASS;
- Rust fmt/check/clippy/tests: PASS;
- Windows visual regression: PASS;
- Tauri release build: PASS;
- visual artifact: `narro-m5-visual-regression`, id `10919562623`, digest `sha256:781ff8dd2dea000db2ba7e1dc6be602fc551f119e30e6d47e88e8242baf9a766`;
- diagnostic artifact: `narro-m1-runtime-harness-windows-x64`, id `10919742072`, digest `sha256:b2febb1520437238b2ed21e8271116c0a823a8984f592296401f3e80abc63528`;
- expected-head guarded squash merge: `699b6ac46bcc6ebcabbcded21f929a7b32018b42`;
- resulting-main Windows CI #575 / run `36284525078`: PASS via identical-tree validation gate.

## CI repair history

- CI #571 failed a frontend static contract because the test encoded a literal LF-only newline around the serde default annotation. Production Rust already had `#[serde(default)]` on `PreferencesPayload.shortcuts` plus a real legacy deserialization test.
- CI #572 progressed past that assertion and failed the next LF-only multiline static assertion around native rollback.
- both static checks were replaced with whitespace/newline-agnostic semantic regex contracts.
- CI #573 passed the frontend contract but exposed source that had not been normalized by rustfmt.
- the exact rustfmt diff was applied to `lib.rs`, `shortcut_settings.rs`, and `shortcuts/mod.rs`.
- CI #574 then passed all authoritative gates.

No product behavior was changed merely to satisfy the newline/static-format failures.

## Validated behavior

- native `Ctrl+Shift+B/T/P` registration authority is preserved;
- all three have independent persisted enable intent in preference schema v3;
- v1/v2 preference payloads without the shortcuts section deserialize to all-enabled defaults;
- startup reads persisted shortcut preferences before native registration;
- disabled shortcuts are not registered during startup;
- enable/disable transitions serialize native state and SQLite preference mutation;
- persistence failure rolls native registration back to the prior state where possible;
- enabled intent and actual native availability/conflict remain separate;
- Settings exposes loading, saving, registered, disabled, conflict, unavailable and retry states;
- diagnostic events keep registration status current;
- conflict/retry visual state is covered by deterministic Windows visual fixtures;
- Theme writes now use atomic read-modify-write preference mutation, avoiding stale whole-payload overwrite.

## Roadmap effect

M8 is now 5/8 top-level items validated:
- confirmed in-app shortcuts;
- global shortcuts plus per-global toggles;
- conflict/error feedback;
- Start Break lifecycle reuse;
- versioned SQLite preference persistence.

Remaining:
- complete documented Preferences sections/runtime effects;
- nested/conditional setting behavior;
- Windows-locale date/time presentation and remaining acceptance details.

M8 is not complete and roadmap milestone completion remains 6/10.

## Continuation

Implement the complete Preferences surface on the existing typed/versioned SQLite model. Do not create a second settings store. Missing Blitzit videos and deferred M7 physical checks remain non-blocking for independent M8 source work.
