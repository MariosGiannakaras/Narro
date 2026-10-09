# CI learning: Reports post-capture validation is a separate failure family (2026-10-09)

Scope: CI learning/diagnostics only. No Narro app, capture fixture, Rust, or Windows runtime edits.

## Exact observed failure

- PR #286 head `50d312b395ba52323360d55b02384265a8373959`, Windows run [37930178261](https://github.com/MariosGiannakaras/Narro/actions/runs/37930178261), Windows job `113820652331` **FAILED** on `Capture Visual Regression Fixtures`.
- That same job ran **389/389 Rust tests PASS**, emitted `Captured visual fixture contracts: PASS`, then failed its separate *post-capture screenshot validator* with `Reports captured visual validation failed: reports-sessions-detail-keyboard-light screenshot is unexpectedly small`.
- `Upload Packaged Focus Runtime Visual Artifact` also failed later because its required output was unavailable after the primary visual validation failure; do not diagnose this upload as an independent root cause.
- This failure is not equivalent to the older `Reports fixture ... assertion: Detail Shift+Tab escaped the active modal` failures (runs `37921875076` and `37927679782`), nor to the earlier fixture readiness failure. Its underlying product-vs-harness cause requires PR #286 owner's evidence-led triage.

## Learning correction, no product changes

Existing narrow infrastructure PR [#291](https://github.com/MariosGiannakaras/Narro/pull/291) was extended rather than opening an overlapping PR. Its scanner `scripts/ci-learning.mjs` now recognizes the literal `Reports captured visual validation failed: <fixture> <message>` diagnostic and emits the independent `reports-captured-contract` kind with stable fixture identity and a 12-character SHA-256 digest of bounded, normalized assertion detail. The full diagnostic is not copied into the generated issue text. `scripts/test-ci-learning.mjs` adds one regression establishing timestamp-insensitive identity and distinction from an in-fixture assertion.

Exact amended PR head: `82ff3bf07997f09588f21a1324070afd2e834880`. Its **isolated learning workflow** [37933752647](https://github.com/MariosGiannakaras/Narro/actions/runs/37933752647) **SUCCESS**. Its full Windows run [37933752726](https://github.com/MariosGiannakaras/Narro/actions/runs/37933752726) **IN PROGRESS / NOT PASS** at this checkpoint. Superseded run `37931853294` was CANCELLED after source-head update and must not be counted as PASS.

## Continuation and limits

Check exact amended PR head and all three Windows jobs. On SUCCESS with no branch/head overlap, expected-head guarded merge #291; validate resulting main source/test blob identity; update `HANDOFF.md` and create immutable merge-closure log. Real scheduled or manually dispatched scanner execution and GitHub issue creation/deduplication remain **NOT RUN / NOT VERIFIED**, not operational PASS. NER-004 covers this family; no new risk ID needed. Scope stays CI learning; app fixes and Codex physical gates belong to their owners.
