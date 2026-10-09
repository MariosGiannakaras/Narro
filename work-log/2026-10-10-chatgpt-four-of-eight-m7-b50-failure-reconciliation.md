# 2026-10-10 — 4/8 integrated and root-caused M7/B50 legacy visual failure

## Authoritative exact-head CI results and merges

Following latest main bootstrap and frozen I01–I08 at top of TODO.md, exact-head Windows CI:
- I06 B57 #300 head `b621f14e26afb3cbec0acbe42a93e6c5b66eb6e5` run `37989290299`: validation, fast, Windows candidate all **SUCCESS**; expected-head guarded squash merge `561331f5be49b6db4e1c6b0b47af68609c4ac99b`. B21 monitor thumbnails and B22 timezone preserved (also present in latest main). User-approved Create/Edit List unchanged.
- I02 B32 #286 head `bbc6d0ac50678a0e6590801e8169bc7ee4a6c4d7` run `37991324381`: all 3 **SUCCESS**; expected-head guarded squash merge `af11f115803bbd6d6ad5a2b94b61aaa185a1a0d5`. Maintains current main Reports Done listColor badge fixture, brings Sessions detail one-owner focus/lifecycle and screenshot re-open test.
- I03 B21 #295 and I04 B22 #298 previously exact-head all green and merged, details prior log.
**User-facing X/Y = 4/8** validated-and-merged source units. Four open: I05 #299 B50, I01 #280 B67, I07 B49, I08 B63. No Codex native manual validation, no M11 audit.

## Exact red CI causes, not guessed functional bugs

#299 head `3c4e09893edc915f7510e9f7277c4d9b325e3d25`, run `37990651522`: validation + fast PASS, Windows `Capture Visual Regression Fixtures` failed. First primary error:
`focus-editor-m7-integration-light: Uncaught Error: M7 projection: finding35 correction changed Panel Time's Up action contract`.
#280 head `172f39fd609ec660e60c0ff1f30f0345941e50dc`, run `37990701378`: **same exact cause**; downstream `Upload Packaged Focus Runtime Visual Artifact` absence is not an independent product defect. Inspected `src/m7IntegrationRegression.tsx`: it asserted **both** a disabled Pause/Resume and a separately enabled Extend in the Panel Time's Up state. This conflicts with accepted user-directed B50: five real action slots with contextual Extend *replacing* Pause, like Floating Timer. This is an obsolete rendered M7 fixture contract, not a production regression or reason to restore a sixth inactive control.

Narrow changes on existing branches:
- #299 new head **`6ba29b7c86adb2577917b5501b388999c5e02942`**, run **`37996271400`** in progress. The rendered M7 integration fixture now asserts exactly 5 Panel Time's Up `data-focus-action` buttons, **no Pause**, enabled Extend+Skip+Done, disabled Break; same concrete semantics as source. Added cheap `scripts/test-ui-focus-panel.mjs` preflight assertion that M7 rendered acceptance is still aligned. No production React/CSS/source semantics changed.
- #280 new head **`30dc3c9c6a2a221f18957fb052c44daaab5c65ac`**, run **`37996310963`** in progress. The exact same two-file correction with preserved B67 signed overtime `-HH:MM:SS`, warning color and unchanged positive authoritative ledger. Forward-merge relationship to corrected B50 head remains. Do NOT mark green until both fast and Windows complete; merge B50 first then B67 with expected-head guard, inspect merged main.
- I07 B49 existing staged branch `implementation/m6-b49-live-card-hover-actions-20261009` head `c52ae1ab926c75656878ce08bd91fda0883a2f64`: source-only, no CI. I08 B63 existing staged branch `implementation/m6-b63-inline-focus-success-20261009` head `ac44af2b722821d5155473b5e015ef11246409f7`: source-only, no CI. Keep these branches and forward-reconcile against final #280/B50 merged code, then open PRs and run complete CI. Do not duplicate/rewrite the implementations.

## Immediate next

Inspect actual new CI `37996271400` and `37996310963` after meaningful independent work or new user message, not repeated no-change polling. Fix evidence-backed primary failures; guarded-merge validated exact heads in dependency order. Preserve merged #297 Fun GIF and all later main code, #285 icons, #293 Done badges, #295 monitor picker, #298 timezone, #300 info glyphs, #286 focus ownership. Use fast preflight to catch any stale M7 or source-string fixture contracts. Once both integrated, reconcile B49/B63, exact-head CI/merge. Update TODO, STATUS, HANDOFF and immutable work-log, no native/pass inference. Codex physical agent stays paused until 8/8 integration validated. Separate optional Blitzit M11 remains dormant until explicit activation.
