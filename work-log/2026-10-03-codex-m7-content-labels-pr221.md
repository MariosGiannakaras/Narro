# M7 narrow content/label correction — PR #221

Agent: Codex. User explicitly requested continued M7 implementation.

Base main: `814c7ec73bdbb37e8be1d5701382da31c3fbd378`; validated application baseline: `45c3218f5923c2ff673d8c1dd562de7545be1ecb` (CI #882). PR: https://github.com/MariosGiannakaras/Narro/pull/221. Exact head: `5cc184d87ae4f3562e439012292526940a48cb0a`. Windows CI #884: https://github.com/MariosGiannakaras/Narro/actions/runs/37122117866, active at this checkpoint.

## Change and rationale

The new CI #873 physical observations are scoped findings, not an asserted recurrence of the old compositor white-L. The destination remains prepared and inert, then is presented opaquely behind a presented-frame barrier before native geometry begins. The outgoing subtree remains available for rollback. Both native and renderer motion settle before recovery, preventing a failed renderer from racing a native operation still committing. Initial clipping is established without a transition; the running phase owns the finite clip motion.

UI_UX_SPEC records continuous finite geometry as observed source intent and allows restrained reconstruction rather than deliberate sparse/clipped source artifacts. Opaque ready-content handoff is a material Narro reconstruction decision to avoid doubled hierarchy and transport of the old Panel header; exact native compositing parity is not claimed. Single HWND/WebView, authoritative state, native geometry and timer/persistence semantics remain intact.

Six fixed action slots reserve longer Resume/Extend labels in every state. Rendered fractional geometry, rather than rounded client widths or exact CSS-string assertions, proves full text fit and stable target positions. A first Notes fit discrepancy was found visually and corrected before publication.

## Local validation

- Locked npm install, full frontend preflight/typecheck/build/contracts: PASS.
- Seventeen semantic transition/recovery tests: PASS, including paint-before-native, paint failure, joining in-flight native commit before rollback and repeated-cycle continuity.
- Sixteen rendered Panel captures: PASS for complete labels, minimum target widths and unchanged slot positions across running/paused/themes.
- Rustfmt and Git whitespace checks: PASS.
- Local Rust compilation/Clippy/tests: NOT RUN; MSVC `link.exe` absent. The attempted cargo check failed at toolchain linking, not an application diagnostic. Windows CI remains authoritative.
- Physical candidate acceptance: NOT RUN at this checkpoint. No physical fix is claimed.

Generated platform icon outputs are excluded from the explicitly staged eleven source/test files. Automatic command review rejected cleanup commands; cleanup is unnecessary for candidate correctness and the files remain uncommitted. The unrelated preserved user stash was not changed.

## Continuation

Merge only exact-green PR #221 with an expected-head guard, verify merged tree identity, download/hash its validation EXE, and observe continuous normal/reduced-motion transitions plus full native Panel labels. Publish video-derived evidence and complete M7 reconciliation only if the observed acceptance passes. CI #873 C5 saved-placement restart remains accepted because this slice does not alter that path. Separate M1 Candidate B monitor/performance gates remain OPEN. Tracking was updated directly on main; no roadmap counter advance at this pending checkpoint.
