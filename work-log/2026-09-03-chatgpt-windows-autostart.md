# Windows autostart capability — 2026-09-03

## Scope

Milestone 1 local Windows autostart capability proof only. No polished Preferences UI, startup UX, single-instance policy expansion, cloud service, telemetry, or extra webview was added.

## Implementation

Merged PR #6 as squash commit `063cc91b5f8c4f9e5ef8efbec38136159fa68a41`.

The final source change:

- adds official Tauri 2 `tauri-plugin-autostart` `2.5.1`;
- initializes the plugin in the Tauri runtime;
- exposes Narro-owned Rust commands `autostart_status`, `autostart_enable`, and `autostart_disable`;
- does not expose `autostart:*` guest capability permissions to the renderer;
- returns typed `{ enabled, changed }` diagnostic state;
- treats repeated enable/disable requests as caller-idempotent no-ops when the requested state is already present;
- re-queries Windows after a state-changing operation and returns `AUTOSTART_STATE_MISMATCH` instead of silently reporting success if the requested state was not established;
- maps query/enable/disable failures to stable `CommandError` codes;
- preserves the primary command failure in the diagnostic harness even if a follow-up status refresh succeeds;
- adds deterministic Rust tests for transition planning, postcondition mismatch, and serialized status shape;
- adds temporary diagnostic status/enable/disable controls only.

`Cargo.lock` was resolved from the exact `main` lockfile. The lock delta includes `tauri-plugin-autostart 2.5.1`, its `auto-launch 0.5.0` dependency and resolver-required older-version disambiguation entries; it is not unrelated version churn.

Temporary helper workflows/scripts used to generate source/lock changes were removed before the PR. Because the branch history contained those temporary generation commits while the final tree did not, the PR was squash-merged to keep `main` history focused on the tested final change.

## Automated validation

Exact tested PR context:

- base: `697428bb5f02d1d5dcce7a43f6602f4414abb4bc`;
- final PR head: `c837687844d987bac282943d06e1fa353c1a5756`;
- PR #6: `Milestone 1 Windows autostart diagnostics`;
- Windows CI #65 / run `33725057607`: **SUCCESS**;
- repository preflight: **PASS**;
- frontend production build/config checks: **PASS**;
- Rust formatting: **PASS**;
- locked Rust compile: **PASS**;
- Clippy with warnings denied: **PASS**;
- Rust tests: **PASS**;
- Tauri Windows release build: **PASS**;
- diagnostic artifact upload: **PASS**;
- artifact ID: `9881948331`;
- artifact digest: `sha256:3ab3168645ce90dfb22ad7cc8911a222b0abd06c568632428f8602b99d7c8a0e`.

Immediately before merge, `main` still matched the tested base. The squash merge used a CI-skip marker because the exact final source tree and merge base had already passed the complete Windows pipeline.

## Physical Windows evidence

**MANUAL NOT RUN**:

- enable autostart from the diagnostic harness and confirm Windows reports it enabled;
- repeated enable is harmless/idempotent;
- disable and repeated disable are harmless/idempotent;
- after enabling, Narro actually launches on the next Windows sign-in/reboot;
- startup does not create parallel Narro instances or leave an unrecoverable invisible process.

Do not mark the Milestone 1 autostart proof fully complete until the physical Windows behavior is observed.

## Continuation

The remaining implementation-side Milestone 1 focus is floating-only steady-state CPU/RAM measurement with `main` destroyed/closed and no active animations. Use a repeatable measurement procedure/harness and keep hosted-CI numbers separate from representative physical Windows evidence.
