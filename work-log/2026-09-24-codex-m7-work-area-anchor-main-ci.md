# 2026-09-24 — M7 item 12 work-area anchoring validation and merge

Agent: Codex. Slice: keep Floating Timer expanded controls inside the selected monitor work area when expanding near the bottom/taskbar.

PR #130 exact head `da0671f3af29cff200f23ab4c27f934beb135680` changed `src-tauri/src/floating_placement.rs` and `src-tauri/src/lib.rs`. The native hidden-resize path captures the pre-resize outer rectangle, selects its overlapping monitor work area, reads the actual resized physical outer size, and clamps top-left before showing. It compares the safe target with the actual post-resize position. Resize/reposition/show failures attempt to restore both prior size and position before visibility. A deterministic Rust test covers expansion near the lower work-area edge on a secondary monitor. Existing focusSurface, authoritative timer/session state, renderer transition ordering, and event-driven placement are preserved.

Validation:

- Local `cargo fmt --check` and `git diff --check`: **PASS** on the exact rebased candidate. Local Rust compilation: **NOT RUN to completion** because MSVC `link.exe` is unavailable in the desktop shell.
- PR Windows CI #494 / run `35973232038` / job `107547567628`: **PASS**, including Repository Preflight, visual fixtures, Tauri Release, and artifact uploads. Runtime artifact `10796878628`, digest `sha256:c4f76ca8cb67bcd989c36bb00228ab5acf0e9b4792244067d5a2c42ddf1960c0`; visual artifact `10796954119`, digest `sha256:e58b69f72b3e9f3884b16140232c78f0a974975c2a74e31389498118404e46d4`.
- PR exact-head review: mergeable, no reviews, comments, or review threads. Expected-head guarded squash merge: `50cef428785ff522ab614eae3f4299241b69fb9f`.
- Resulting-main Windows CI #495 / run `35974887744` / job `107552924508`: **PASS**, with the same required stages. Runtime artifact `10798282284`, digest `sha256:da84e0ec12865bb088835c6279b04229db6848673de332d20a45ea90d97f3aa3`; visual artifact `10798415363`, digest `sha256:e36dd83a1219f45abcd8a07c377c5ce8052502e961c0377fc0ea673088110f0e`.
- Physical bottom/taskbar, secondary-monitor, DPI, repeated expand/collapse, and compositor observation: **NOT RUN**. Item 12 top-level TODO stays unchecked.

Tracking: `TODO.md`, `STATUS.md`, and `HANDOFF.md` record automated validation separately from the physical gate. The final source artifact can be used for one consolidated M7 physical session described in `docs/M7_FLOATING_RUNTIME_VALIDATION.md`. No further independent M7 source slice is identified before that session; items 11, 13, and 14 are physical observation/measurement gates.
