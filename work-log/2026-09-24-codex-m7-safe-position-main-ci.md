# 2026-09-24 — M7 item 10 safe-position validation and merge

Agent: Codex. Slice: persist and recover a safe Floating Timer position across Panel return, restart, and monitor changes.

PR #128 exact head `65b16c40473a36a217db6789f8b7c791c92e88fd` changed `src-tauri/src/floating_placement.rs`, `src-tauri/src/persistence/floating_placement.rs`, migration `0007_floating_timer_placement.sql`, native `lib.rs`/display-topology integration, and migration tests. The native coordinator saves a clamped position after settled moves and before Panel return/hide/close/quit, restores a relative position in the current work area before Timer show, and revalidates after display topology changes. A transition guard prevents Panel geometry from overwriting Timer placement. The renderer and authoritative timer/session state were not changed.

Validation:

- Local frontend preflight, `cargo fmt --check`, and `git diff --check`: **PASS**. Local Rust compilation: **NOT RUN to completion** because the desktop shell lacks MSVC `link.exe`.
- PR Windows CI #492 / run `35971573057` / job `107542270058`: **PASS**, including Repository Preflight, visual fixtures, Tauri Release, and artifact uploads. Runtime artifact `10797345622`, digest `sha256:f7befd9e47ec0da6f5709a177d2f9d6e57056aac5b6610b2881c0b52985279ee`; visual artifact `10796413833`, digest `sha256:e47a0efb8be229aaf7d157728dae5fbafe2b10fa0d4223e6133364d591d3921d`.
- PR exact-head review: mergeable, no reviews, comments, or review threads. Expected-head guarded squash merge: `778a1bc4e1276128d6ae859e1a15b6f9c413e89b`.
- Resulting-main Windows CI #493 / run `35973135926` / job `107547263277`: **PASS**, with the same required stages. Runtime artifact `10797865741`, digest `sha256:886b22f887fbc8a629dfbae3d823d637c7bad07e3b11e7bdcbd5e1e683b098a2`; visual artifact `10797401278`, digest `sha256:7b3496ce53b9525f18a2d10cdea0949253c7c8f53c894b5633ce401907251d26`.
- Physical drag, Panel return/reopen, restart, resolution/scaling, and monitor hotplug: **NOT RUN**. Item 10 top-level TODO stays unchecked.

Tracking: `TODO.md`, `STATUS.md`, and `HANDOFF.md` record automated validation separately from the physical gate. Continuation: validate item-12 PR #130, then use the consolidated physical matrix in `docs/M7_FLOATING_RUNTIME_VALIDATION.md` on the final source artifact.
