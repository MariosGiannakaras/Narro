# 2026-10-21 — CI audit corrections: failure learning, docs triggers and diagnostics

**Owner:** ChatGPT workflow/CI source. **User request:** apply audit-driven changes where beneficial. Long Windows CI must not be idle-polled; do not weaken source, build, native or source-parity gates.

## Source changes

New [PR400](https://github.com/MariosGiannakaras/Narro/pull/400), branch `fix/ci-audit-safe-guardrails-20261021`, exact current head `20023d6d83353bdeec308b5a5a0a118b0193a475`, based on main `0c96545d701654de66de0fa82d9290fbe441d289`. Four files:
- `scripts/ci-learning.mjs`: recognizes Node contract, SyntaxError and AssertionError only if a concrete repo script stack frame exists; hashes normalized assertions and does not expose raw log text. Existing Rust, TypeScript, Reports and OS signatures retain precedence. Bare exit/artifact errors remain unclassified.
- `scripts/test-ci-learning.mjs`: real archive-failure patterns and negative, stable fingerprint, privacy and precedence guards.
- `.github/workflows/ci.yml`: ordered GitHub `paths` filters still ignore routine Markdown, but **reinclude the four `docs/*.md` files explicitly bundled into validation artifacts**. Successful packaged Focus capture still requires its artifact; if an earlier step fails and nothing was captured, optional failure diagnostics use `if-no-files-found:warn` rather than a secondary failure. Existing exact-head/main-tree deduplication, caches, all mandatory Windows/visual/Rust checks and timeouts unchanged.
- `scripts/test-ci-tiering.mjs`: source-contract enforcement of both trigger filters and mandatory-versus-failure-only artifact upload semantics, ignoring YAML comments.

## Real test outcomes

- Earlier head `a1ce129da8ea817c521e9b45e9ed59dca72e8d8a`: CI Failure Learning offline-tests run `39661747338` **SUCCESS**. Windows CI run `39661747344` validation SUCCESS, fast FAIL. **First cause:** new source test assumed `branches` immediately preceded `paths`; a harmless YAML comment separated them. This was a harness/source-grammar error, not an application or GitHub trigger failure. Fixed test in replacement head by ignoring comment lines. Historical failed SHA remains FAIL.
- Replacement `20023d6d83353bdeec308b5a5a0a118b0193a475`: CI Failure Learning `39661943525` **SUCCESS**, Windows CI `39661943517` **RUNNING / candidate NOT YET PASS** as last observed. No merge/physical PASS claimed.

## Constraints, pending and next action

This branch changes workflow semantics, therefore the main tree needs the documented **workflow-change resulting-main validation** rather than assuming older exact-head runs suffice. Before guarded merge require the 3/3 exact replacement head validation, fast, Windows-candidate PASS. After merge verify exact changed-source blobs and run required resulting-main Windows CI for changed workflow. Do not disable/skip failing tests or use previous failed SHA for acceptance. No runtime code, user data, Spectrum Core Create/Edit List picker, uploads, 218 offline icons or optional M11/M12 touched.

**Next operation:** when `39661943517` has completed, inspect the first failed job/step/log on FAIL, apply minimal correction on the same branch, otherwise expected-head guarded merge and resulting-main verification. In the meantime work independently without idle polling a ~20-minute Windows job.
