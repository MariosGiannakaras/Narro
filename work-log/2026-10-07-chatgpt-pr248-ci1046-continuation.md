# PR248 post-correction review — CI1046 continuation

Date: 2026-10-07
Agent: ChatGPT

## Scope

User-requested bounded programming review of corrections introduced from the current implementation context onward, specifically PR236–247 and directly related M6/M7/M9 deltas. This remains a targeted corrective review, not a whole-repository re-audit.

## Current PR state

- PR: #248 — `Harden recent corrective slices against stale-state races`
- Branch: `review/post-correction-hardening-20261007`
- Exact current head: `515b0f9a9df5cdf1a67e2b879047ee6551ae6dec`
- Current exact-head validation: Windows CI1046 / run `37677630228` — **IN PROGRESS** at this checkpoint.
- PR base remains older than four documentation-only current-truth commits on `main`; source/test integration must preserve those newer Markdown commits.
- Roadmap progress remains `3/10M || 0/3 | 17/18`.

## Evidence-backed hardening families now carried by PR248

1. Renderer/native monitor-key validation parity:
   - same native maximum monitor-key length,
   - same numeric shape and i32/u32 bounds,
   - ambiguity still fails closed.

2. Reports Add Session modal keyboard ownership:
   - pending shell cannot leak Shift+Tab focus after returning to an interactive error state.

3. Reports Overview PDF transaction/state ownership:
   - export remains disabled while visible data does not belong to the exact current request or refresh is in flight,
   - Main interaction is frozen while WebView2 captures the document and restored in `finally`.

4. Focus Home pause/reveal provenance:
   - generation nonce binds post-reveal resume to the matching Home-pause generation,
   - repeated Home pause-renew and post-reveal resume are serialized through the dedicated provenance coordination gate so stale reveal callbacks cannot race the newer exit.

5. Report export cleanup:
   - late WebView2 completion removes temp PDF output after receiver timeout,
   - partial final PDF/CSV export files are removed after write/flush failure.

6. Board→Focus native reveal rollback:
   - Main-hide, Focus-reveal and post-reveal handshake failures no longer leave a half-committed two-window presentation or swallow Focus rollback failure.

Validation-only source-string contracts exposed by the implementation changes were narrowed/updated without removing the dedicated semantic/architecture coverage.

## CI history relevant to the exact current head

- CI1045 / run `37665490663` on prior head `fd151126da5fabfcda75955f4b23dc30096fee32`:
  - fast gate: **PASS**,
  - Windows `cargo check`: PASS with one deprecation warning,
  - Windows Clippy: **FAIL** only because Rust 1.99 deprecated `AtomicU64::fetch_update` in favor of `try_update`; repository Clippy uses `-D warnings`.
- Correction commit `515b0f9a9df5cdf1a67e2b879047ee6551ae6dec` changes only that documented API rename.
- CI1046 is the authoritative validation for the current head. Older in-flight runs are superseded and must not be used for merge acceptance.

## Claims and gates

- No milestone, M7, or deep-analysis counter advances from this review.
- Physical Windows validation is **NOT RUN** for PR248.
- Source parity is not newly claimed.
- Previously pinned CI1025 physical artifact is historical for PR248-affected surfaces; if PR248 integrates, a new exact validated candidate must be pinned before physical observation resumes.
- **USER_ACTION_REQUIRED: NO** while PR248 exact-head validation/integration remains actionable.

## Exact next action

1. Inspect CI1046 on exact head `515b0f9a9df5cdf1a67e2b879047ee6551ae6dec`.
2. If it fails, inspect the exact failed step/log and correct only the evidenced cause.
3. If it passes, re-check live PR/main state, preserve newer authoritative Markdown, and expected-head-guard squash-merge PR248 only if the validated head is unchanged.
4. Verify resulting-main affected source/test identity or resulting-main CI according to `docs/CI_VALIDATION_STRATEGY.md`.
5. Reconcile current-truth tracking and pin the new physical candidate; only then resume the bounded Windows physical checklist.
